import React, { useState, useEffect } from "react";
import {
  View, Text, Image, TouchableOpacity,
  ScrollView, ActivityIndicator, Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

const { width } = Dimensions.get("window");
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

async function authHeaders() {
  const token = await SecureStore.getItemAsync("accessToken");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

const WEEKLY_HIGHLIGHTS: Record<number, string[]> = {
  24: [
    "Baby is of average size",
    "Baby can hear your voice",
    "Your baby's sense of touch is developing",
  ],
};

function getHighlights(weeks: number): string[] {
  return WEEKLY_HIGHLIGHTS[weeks] || [
    "Your baby is growing well",
    "Keep taking your prenatal vitamins",
    "Stay hydrated and rest well",
  ];
}

export default function PregnancyOverviewScreen() {
  const [loading, setLoading] = useState(true);
  const [pregnancy, setPregnancy] = useState<any>(null);

  useEffect(() => {
    loadPregnancy();
  }, []);

  const loadPregnancy = async () => {
    try {
      const headers = await authHeaders();
      const res = await fetch(`${BASE_URL}/api/v1/pregnancy/me`, { headers });
      if (res.ok) {
        const data = await res.json();
        setPregnancy(data);
      }
    } catch (e) {}
    finally { setLoading(false); }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "--";
    return new Date(dateStr).toLocaleDateString("en-NG", {
      month: "short", day: "numeric", year: "numeric",
    });
  };

  const getTrimester = (weeks: number) => {
    if (weeks <= 12) return "1st Trimester";
    if (weeks <= 26) return "2nd Trimester";
    return "3rd Trimester";
  };

  const weeks = pregnancy?.week || 0;
  const daysToGo = pregnancy?.daysOfPregnancy
    ? 280 - pregnancy.daysOfPregnancy
    : null;

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
        <Text style={{ fontSize: 18, fontWeight: "800", color: "#111" }}>Pregnancy Overview</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#2D7A4F" size="large" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

          {/* Hero image with week badge */}
          <View style={{ alignItems: "center", marginTop: 20, marginBottom: 8 }}>
            <View style={{ position: "relative" }}>
              <Image
                source={require("../../assets/images/6.png")}
                style={{ width: width * 0.7, height: 200 }}
                resizeMode="contain"
              />
              {/* Week badge */}
              <View style={{
                position: "absolute", right: 10, top: 20,
                width: 62, height: 62, borderRadius: 31,
                backgroundColor: "#fff", borderWidth: 3, borderColor: "#2D7A4F",
                alignItems: "center", justifyContent: "center",
                shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1, shadowRadius: 6, elevation: 4,
              }}>
                <Text style={{ fontSize: 20, fontWeight: "800", color: "#2D7A4F", lineHeight: 22 }}>
                  {weeks}
                </Text>
                <Text style={{ fontSize: 9, color: "#2D7A4F", fontWeight: "600" }}>Weeks</Text>
              </View>
            </View>
            <Text style={{ fontSize: 12, color: "#888", marginTop: 6 }}>
              {getTrimester(weeks)} • Week {weeks}
            </Text>
          </View>

          {/* Motivational text */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#2D7A4F" }}>
              You are doing amazing Mama!
            </Text>
            <Ionicons name="heart" size={18} color="#2D7A4F" />
          </View>

          {/* Progress details */}
          <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
            <Text style={{ fontSize: 15, fontWeight: "800", color: "#111", marginBottom: 12 }}>
              Your Progress
            </Text>
            <View style={{
              backgroundColor: "#fff", borderRadius: 16,
              shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06, shadowRadius: 6, elevation: 1,
              overflow: "hidden",
            }}>
              {[
                { icon: "calendar-outline", label: "Due Date", value: formatDate(pregnancy?.dueDate) },
                { icon: "refresh-outline", label: "Trimester", value: getTrimester(weeks) },
                { icon: "today-outline", label: "Weeks Pregnant", value: `${weeks} weeks` },
                { icon: "time-outline", label: "Days to Go", value: daysToGo != null ? `${daysToGo} days` : "--" },
              ].map((row, i, arr) => (
                <View
                  key={row.label}
                  style={{
                    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                    paddingHorizontal: 16, paddingVertical: 14,
                    borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                    borderBottomColor: "#F5F5F5",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View style={{
                      width: 34, height: 34, borderRadius: 10,
                      backgroundColor: "#F0FAF4", alignItems: "center", justifyContent: "center",
                    }}>
                      <Ionicons name={row.icon as any} size={17} color="#2D7A4F" />
                    </View>
                    <Text style={{ fontSize: 14, color: "#555", fontWeight: "500" }}>{row.label}</Text>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: "#2D7A4F" }}>{row.value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* This week's highlights */}
          <View style={{ marginHorizontal: 20 }}>
            <View style={{
              backgroundColor: "#F0FAF4", borderRadius: 16, padding: 16,
            }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#2D7A4F", marginBottom: 12 }}>
                This Week's Highlights
              </Text>
              {getHighlights(weeks).map((h, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <Ionicons name="checkmark-circle" size={18} color="#2D7A4F" />
                  <Text style={{ fontSize: 13, color: "#444", flex: 1 }}>{h}</Text>
                </View>
              ))}
            </View>
          </View>

        </ScrollView>
      )}
    </SafeAreaView>
  );
}