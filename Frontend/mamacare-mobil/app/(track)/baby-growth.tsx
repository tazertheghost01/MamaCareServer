import React, { useState, useEffect } from "react";
import {
  View, Text, Image, TouchableOpacity, ScrollView,
  ActivityIndicator, Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

const { width } = Dimensions.get("window");
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

async function authHeaders() {
  const token = await SecureStore.getItemAsync("accessToken");
  return { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
}

// Weekly data map — no endpoint yet so hardcoded per week
const WEEKLY_DATA: Record<number, { length: string; weight: string; heartbeat: string; highlights: string[] }> = {
  24: {
    length: "30.0 cm", weight: "600 g", heartbeat: "Strong",
    highlights: ["Baby's lungs are developing.", "Baby can hear your voice.", "Baby's movement maybe stronger."],
  },
  20: {
    length: "25.6 cm", weight: "300 g", heartbeat: "Strong",
    highlights: ["Baby can swallow.", "Baby starts to develop taste buds.", "Movements are more coordinated."],
  },
  28: {
    length: "37.6 cm", weight: "1000 g", heartbeat: "Strong",
    highlights: ["Baby can open their eyes.", "Baby is gaining fat.", "Brain is developing rapidly."],
  },
};

function getWeekData(weeks: number) {
  return WEEKLY_DATA[weeks] || {
    length: "--", weight: "--", heartbeat: "Normal",
    highlights: ["Your baby is growing well.", "Keep taking your prenatal vitamins.", "Stay hydrated and rest well."],
  };
}

export default function BabyGrowthScreen() {
  const [loading, setLoading] = useState(true);
  const [weeks, setWeeks] = useState(0);
  const [trimester, setTrimester] = useState("");

  useEffect(() => { loadPregnancy(); }, []);

  const loadPregnancy = async () => {
    try {
      const headers = await authHeaders();
      const res = await fetch(`${BASE_URL}/api/v1/pregnancy/me`, { headers });
      if (res.ok) {
        const data = await res.json();
        setWeeks(data.weeksOfPregnancy || 0);
        const w = data.weeksOfPregnancy || 0;
        setTrimester(w <= 12 ? "1st Trimester" : w <= 26 ? "2nd Trimester" : "3rd Trimester");
      }
    } catch (e) {
      const stored = await SecureStore.getItemAsync("pregnancyWeeks");
      if (stored) setWeeks(parseInt(stored));
    }
    finally { setLoading(false); }
  };

  const weekData = getWeekData(weeks);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View style={{
        flexDirection: "row", alignItems: "center", gap: 10,
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14,
        borderBottomWidth: 1, borderBottomColor: "#F5F5F5",
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, justifyContent: "center" }}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "800", color: "#111" }}>Baby Growth</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#2D7A4F" size="large" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

          {/* Hero */}
          <View style={{
            marginHorizontal: 20, marginTop: 16, marginBottom: 16,
            backgroundColor: "#F0FAF4", borderRadius: 20, padding: 20,
            flexDirection: "row", alignItems: "center",
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: "800", color: "#2D7A4F", lineHeight: 28, marginBottom: 12 }}>
                Your baby{"\n"}is growing{"\n"}beautifully!
              </Text>
              <TouchableOpacity style={{
                flexDirection: "row", alignItems: "center", gap: 8,
                backgroundColor: "#fff", borderRadius: 25, paddingHorizontal: 14,
                paddingVertical: 8, alignSelf: "flex-start",
                shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
              }}>
                <Ionicons name="volume-medium-outline" size={15} color="#2D7A4F" />
                <Text style={{ fontSize: 12, color: "#2D7A4F", fontWeight: "600" }}>Listen in yoruba</Text>
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: "#2D7A4F", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="play" size={9} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>
            {/* Baby embryo image */}
            <Image source={require("../../assets/images/8.png")} style={{ width: 100, height: 110 }} resizeMode="contain" />
          </View>

          {/* Pregnancy summary */}
          <View style={{
            marginHorizontal: 20, marginBottom: 16,
            backgroundColor: "#fff", borderRadius: 16, padding: 16,
            borderWidth: 1, borderColor: "#F0F0F0",
            shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
          }}>
            <Text style={{ fontSize: 15, fontWeight: "800", color: "#111", marginBottom: 4 }}>
              You are {weeks} weeks pregnant
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Text style={{ fontSize: 13, color: "#888" }}>{trimester}</Text>
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: "#CCC" }} />
              <Text style={{ fontSize: 13, color: "#888" }}>Week {weeks}</Text>
            </View>
            <Text style={{ fontSize: 13, color: "#555" }}>Your baby is healthy and big enough!</Text>
          </View>

          {/* Growth this week */}
          <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
            <Text style={{ fontSize: 15, fontWeight: "800", color: "#111", marginBottom: 12 }}>
              Growth this week
            </Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {[
                { icon: "resize-outline", label: "Length", value: weekData.length },
                { icon: "barbell-outline", label: "Weight", value: weekData.weight },
                { icon: "heart-outline", label: "Heartbeat", value: weekData.heartbeat },
              ].map((stat) => (
                <View key={stat.label} style={{
                  flex: 1, backgroundColor: "#fff", borderRadius: 14, padding: 12, alignItems: "center",
                  borderWidth: 1, borderColor: "#F0F0F0",
                  shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
                }}>
                  <Ionicons name={stat.icon as any} size={18} color="#2D7A4F" style={{ marginBottom: 6 }} />
                  <Text style={{ fontSize: 13, fontWeight: "800", color: "#111", marginBottom: 2 }}>{stat.value}</Text>
                  <Text style={{ fontSize: 10, color: "#888" }}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* What is Happening This Week */}
          <View style={{ paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 15, fontWeight: "800", color: "#111", marginBottom: 12 }}>
              What is Happening This Week
            </Text>
            <View style={{
              backgroundColor: "#fff", borderRadius: 16, padding: 16,
              borderWidth: 1, borderColor: "#F0F0F0",
              shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
              gap: 12,
            }}>
              {weekData.highlights.map((h, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                  <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: "#2D7A4F", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                    <Ionicons name="checkmark" size={13} color="#fff" />
                  </View>
                  <Text style={{ fontSize: 14, color: "#444", flex: 1, lineHeight: 20 }}>{h}</Text>
                </View>
              ))}
            </View>
          </View>

        </ScrollView>
      )}
    </SafeAreaView>
  );
}