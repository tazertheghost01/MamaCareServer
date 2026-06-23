import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions,
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

const WHY_WALK = [
  { icon: "heart-outline", label: "Boost\nenergy" },
  { icon: "moon-outline", label: "Improves\nsleep" },
  { icon: "body-outline", label: "Reduces\nswelling" },
  { icon: "happy-outline", label: "Supports\nbaby's growth" },
];

export default function WalkScreen() {
  const [loading, setLoading] = useState(true);
  const [fitness, setFitness] = useState<any>(null);
  const [sourceStatus, setSourceStatus] = useState<"loading" | "available" | "manual">("loading");

  useEffect(() => { loadFitness(); }, []);

  const loadFitness = async () => {
    try {
      const headers = await authHeaders();
      const res = await fetch(`${BASE_URL}/api/v1/walk-exercise/home`, { headers });
      if (res.ok) {
        const data = await res.json();
        setFitness(data);
        setSourceStatus(data?.todayMetrics?.steps != null ? "available" : "manual");
      } else {
        setSourceStatus("manual");
      }
    } catch (e) {}
    finally { setLoading(false); }
  };

  const goalMin = 15;
  const todaySteps = fitness?.todayMetrics?.steps ?? fitness?.todaysSteps ?? 0;
  const todayMin = todaySteps ? Math.max(1, Math.floor(todaySteps / 100)) : 0;
  const progress = Math.min(todayMin / goalMin, 1);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View style={{
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14,
        borderBottomWidth: 1, borderBottomColor: "#F5F5F5",
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, justifyContent: "center" }}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={{ fontSize: 17, fontWeight: "800", color: "#111" }}>Walk & Exercise</Text>
        <TouchableOpacity><Ionicons name="arrow-forward" size={24} color="#111" /></TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* Hero */}
        <View style={{
          marginHorizontal: 20, marginTop: 16, marginBottom: 20,
          backgroundColor: "#F0FAF4", borderRadius: 20, padding: 20,
          flexDirection: "row", alignItems: "center",
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontWeight: "800", color: "#2D7A4F", lineHeight: 30, marginBottom: 12 }}>
              A little{"\n"}walk today, a{"\n"}better you{"\n"}tomorrow.
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
          {/* Walking woman illustration */}
          <View style={{ width: 100, height: 120, alignItems: "center", justifyContent: "center" }}>
            <View style={{ width: 60, height: 80, borderRadius: 30, backgroundColor: "#2D7A4F", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="walk" size={36} color="#fff" />
            </View>
          </View>
        </View>

        {!loading && sourceStatus === "manual" && (
          <View style={{ marginHorizontal: 20, marginBottom: 16, backgroundColor: "#FFF8E1", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#F3D98A" }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#8A5D00", marginBottom: 4 }}>
              We could not reach your phone activity data.
            </Text>
            <Text style={{ fontSize: 12, color: "#8A5D00", lineHeight: 18 }}>
              Manual walk sessions are available below. Steps will only count from real movement.
            </Text>
          </View>
        )}

        {/* Today's Goal */}
        {loading ? (
          <ActivityIndicator color="#2D7A4F" style={{ marginVertical: 20 }} />
        ) : (
          <View style={{
            marginHorizontal: 20, marginBottom: 20,
            backgroundColor: "#fff", borderRadius: 16, padding: 16,
            borderWidth: 1, borderColor: "#F0F0F0",
            shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
          }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#111", marginBottom: 12 }}>Today's Goal</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <Ionicons name="footsteps-outline" size={24} color="#2D7A4F" />
              <Text style={{ fontSize: 24, fontWeight: "800", color: "#111" }}>
                {todayMin} <Text style={{ fontSize: 16, color: "#888", fontWeight: "400" }}>/ {goalMin} min</Text>
              </Text>
            </View>
            <View style={{ height: 8, backgroundColor: "#E8F5EE", borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
              <View style={{ height: "100%", width: `${progress * 100}%`, backgroundColor: "#2D7A4F", borderRadius: 4 }} />
            </View>
            <Text style={{ fontSize: 12, color: "#888" }}>
              {progress >= 1 ? "Goal achieved! Amazing work!" : sourceStatus === "available" ? "Let's move gently. You are doing great!" : "Manual tracking is active."}
            </Text>
          </View>
        )}

        {/* Why walking is good */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text style={{ fontSize: 15, fontWeight: "800", color: "#111", marginBottom: 14 }}>
            Why walking is good
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {WHY_WALK.map((w) => (
              <View key={w.label} style={{ alignItems: "center", width: (width - 60) / 4 }}>
                <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: "#E8F5EE", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                  <Ionicons name={w.icon as any} size={22} color="#2D7A4F" />
                </View>
                <Text style={{ fontSize: 11, color: "#555", textAlign: "center", lineHeight: 16 }}>{w.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Best time to walk */}
        <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
          <Text style={{ fontSize: 15, fontWeight: "800", color: "#111", marginBottom: 14 }}>
            Best time to walk
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{
              flex: 1, backgroundColor: "#FFF8E1", borderRadius: 14, padding: 14,
              flexDirection: "row", alignItems: "center", gap: 10,
            }}>
              <Text style={{ fontSize: 22 }}>☀️</Text>
              <View>
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#111" }}>Morning</Text>
                <Text style={{ fontSize: 12, color: "#888" }}>7AM - 10AM</Text>
              </View>
            </View>
            <View style={{
              flex: 1, backgroundColor: "#EDE7F6", borderRadius: 14, padding: 14,
              flexDirection: "row", alignItems: "center", gap: 10,
            }}>
              <Text style={{ fontSize: 22 }}>🌙</Text>
              <View>
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#111" }}>Evening</Text>
                <Text style={{ fontSize: 12, color: "#888" }}>4PM - 7PM</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Start Walk button */}
        <View style={{ paddingHorizontal: 20 }}>
          <TouchableOpacity
            onPress={() => router.push("/(track)/walk-session")}
            style={{
              backgroundColor: "#2D7A4F", borderRadius: 14, paddingVertical: 17,
              flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
              shadowColor: "#2D7A4F", shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
            }}
          >
            <Ionicons name="walk-outline" size={22} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
              {sourceStatus === "available" ? "Start Walk" : "Start Manual Walk"}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
