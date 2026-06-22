import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, TouchableOpacity, Dimensions, Alert,
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

export default function WalkSessionScreen() {
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds
  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0);
  const [calories, setCalories] = useState(0);
  const [goalMin] = useState(15);
  const timerRef = useRef<any>(null);
  const syncRef = useRef<any>(null);

  const startSession = async () => {
    try {
      const headers = await authHeaders();
      const res = await fetch(`${BASE_URL}/api/v1/walk-exercise/sessions`, {
        method: "POST", headers,
        body: JSON.stringify({ goalSteps: 2000, goalDuration: goalMin }),
      });
      if (res.ok || res.status === 201) {
        const data = await res.json();
        setSessionId(data.id);
        setRunning(true);
        timerRef.current = setInterval(() => {
          setElapsed((e) => e + 1);
          setSteps((s) => s + Math.floor(Math.random() * 3));
        }, 1000);
        // Sync metrics every 10 seconds
        syncRef.current = setInterval(() => syncMetrics(data.id), 10000);
      }
    } catch (e) {
      // Run locally without backend
      setRunning(true);
      timerRef.current = setInterval(() => {
        setElapsed((e) => e + 1);
        setSteps((s) => s + Math.floor(Math.random() * 3));
      }, 1000);
    }
  };

  const syncMetrics = async (id: number) => {
    try {
      const headers = await authHeaders();
      const dist = parseFloat((steps * 0.0008).toFixed(2));
      const cal = Math.floor(steps * 0.04);
      setDistance(dist);
      setCalories(cal);
      await fetch(`${BASE_URL}/api/v1/walk-exercise/sessions/${id}/metrics`, {
        method: "PATCH", headers,
        body: JSON.stringify({ steps, distance: dist, calories: cal, duration: Math.floor(elapsed / 60) }),
      });
    } catch (e) {}
  };

  const stopSession = async () => {
    clearInterval(timerRef.current);
    clearInterval(syncRef.current);
    setRunning(false);
    if (sessionId) {
      try {
        const headers = await authHeaders();
        const dist = parseFloat((steps * 0.0008).toFixed(2));
        const cal = Math.floor(steps * 0.04);
        await fetch(`${BASE_URL}/api/v1/walk-exercise/sessions/${sessionId}/complete`, {
          method: "PATCH", headers,
          body: JSON.stringify({ steps, distance: dist, calories: cal, duration: Math.floor(elapsed / 60) }),
        });
      } catch (e) {}
    }
    Alert.alert("Session Complete! 🎉", `You walked for ${formatTime(elapsed)}\nSteps: ${steps}`, [
      { text: "Done", onPress: () => router.back() },
    ]);
  };

  useEffect(() => {
    startSession();
    return () => {
      clearInterval(timerRef.current);
      clearInterval(syncRef.current);
    };
  }, []);

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, "0")} : ${String(m).padStart(2, "0")} : ${String(s).padStart(2, "0")}`;
  };

  const dist = parseFloat((steps * 0.0008).toFixed(2));
  const cal = Math.floor(steps * 0.04);
  const goalProgress = Math.min((elapsed / 60) / goalMin, 1);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View style={{
        flexDirection: "row", alignItems: "center", gap: 10,
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14,
        borderBottomWidth: 1, borderBottomColor: "#F5F5F5",
      }}>
        <TouchableOpacity onPress={() => {
          if (running) {
            Alert.alert("End session?", "Your session will be saved.", [
              { text: "Cancel", style: "cancel" },
              { text: "End", style: "destructive", onPress: stopSession },
            ]);
          } else { router.back(); }
        }} style={{ width: 36, height: 36, justifyContent: "center" }}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "800", color: "#111" }}>Walk Session</Text>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 20 }}>

        {/* Motivation card */}
        <View style={{ backgroundColor: "#F0FAF4", borderRadius: 20, padding: 20, marginTop: 20, marginBottom: 24, flexDirection: "row", alignItems: "center" }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#2D7A4F", lineHeight: 26, marginBottom: 8 }}>
              You've got this,{"\n"}Mama! 💚
            </Text>
            <Text style={{ fontSize: 13, color: "#555", lineHeight: 20 }}>
              Every step you take is a step towards a healthier you and your baby
            </Text>
          </View>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#2D7A4F", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="walk" size={40} color="#fff" />
          </View>
        </View>

        {/* Timer */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Text style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>Time</Text>
          <Text style={{ fontSize: 46, fontWeight: "800", color: "#111", letterSpacing: 2 }}>
            {formatTime(elapsed)}
          </Text>
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12,
            backgroundColor: running ? "#E8F5EE" : "#F5F5F5",
            borderRadius: 25, paddingHorizontal: 20, paddingVertical: 10,
          }}>
            <Ionicons name="walk-outline" size={18} color={running ? "#2D7A4F" : "#AAA"} />
            <Text style={{ fontSize: 13, fontWeight: "600", color: running ? "#2D7A4F" : "#AAA" }}>
              {running ? "Walking..." : "Paused"}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
          {[
            { icon: "footsteps-outline", label: "Steps", value: steps.toLocaleString() },
            { icon: "navigate-outline", label: "Distance", value: `${dist} km` },
            { icon: "flame-outline", label: "Calories", value: `${cal} kcal` },
          ].map((stat) => (
            <View key={stat.label} style={{ flex: 1, alignItems: "center" }}>
              <Ionicons name={stat.icon as any} size={22} color="#2D7A4F" style={{ marginBottom: 6 }} />
              <Text style={{ fontSize: 16, fontWeight: "800", color: "#111" }}>{stat.value}</Text>
              <Text style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Today's goal progress */}
        <View style={{
          backgroundColor: "#F8F8F8", borderRadius: 16, padding: 16, marginBottom: 32,
        }}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#111", marginBottom: 10 }}>Today's Goal</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <Text style={{ fontSize: 22, fontWeight: "800", color: "#111" }}>
              {Math.floor(elapsed / 60)} <Text style={{ fontSize: 15, color: "#888", fontWeight: "400" }}>/ {goalMin} min</Text>
            </Text>
            <Ionicons name="footsteps-outline" size={20} color="#2D7A4F" />
          </View>
          <View style={{ height: 8, backgroundColor: "#E0E0E0", borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
            <View style={{ height: "100%", width: `${goalProgress * 100}%`, backgroundColor: "#2D7A4F", borderRadius: 4 }} />
          </View>
          <Text style={{ fontSize: 12, color: "#888" }}>
            {goalProgress >= 1 ? "🎉 Goal achieved!" : "Keep going! You are doing great."}
          </Text>
        </View>

        {/* Stop button */}
        <TouchableOpacity
          onPress={stopSession}
          style={{
            backgroundColor: "#E53935", borderRadius: 14, paddingVertical: 17,
            alignItems: "center",
            shadowColor: "#E53935", shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Stop & Save Session</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}