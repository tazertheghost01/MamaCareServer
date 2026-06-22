import React, { useState } from "react";
import {
  View, Text, Image, TouchableOpacity,
  ScrollView, Modal, TextInput, Dimensions,
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

const DEFAULT_GOALS = [
  { id: "1", icon: "medical-outline", title: "Take my vitamins", completed: false },
  { id: "2", icon: "water-outline", title: "Drink 8 glasses of water", completed: true },
  { id: "3", icon: "restaurant-outline", title: "Eat healthy meals", completed: false },
  { id: "4", icon: "walk-outline", title: "Walk for at least 15 minutes", completed: true },
  { id: "5", icon: "moon-outline", title: "Get enough rest", completed: false },
];

export default function MyGoalsScreen() {
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const [showModal, setShowModal] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const [saving, setSaving] = useState(false);

  const completedCount = goals.filter((g) => g.completed).length;

  const toggleGoal = async (id: string) => {
    setGoals((prev) =>
      prev.map((g) => g.id === id ? { ...g, completed: !g.completed } : g)
    );
    // POST to goals endpoint (to be implemented by backend)
    try {
      const headers = await authHeaders();
      await fetch(`${BASE_URL}/api/v1/goals/${id}/toggle`, {
        method: "PATCH",
        headers,
      });
    } catch (e) {}
  };

  const addGoal = async () => {
    if (!newGoal.trim()) return;
    setSaving(true);
    const goal = {
      id: Date.now().toString(),
      icon: "flag-outline",
      title: newGoal.trim(),
      completed: false,
    };
    try {
      const headers = await authHeaders();
      await fetch(`${BASE_URL}/api/v1/goals`, {
        method: "POST",
        headers,
        body: JSON.stringify({ title: newGoal.trim() }),
      });
    } catch (e) {}
    setGoals((prev) => [...prev, goal]);
    setNewGoal("");
    setSaving(false);
    setShowModal(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>

      {/* Add Goal Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
          <View style={{
            backgroundColor: "#fff", borderTopLeftRadius: 24,
            borderTopRightRadius: 24, padding: 24,
          }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ fontSize: 17, fontWeight: "800", color: "#111" }}>Add New Goal</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#555" />
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder="e.g. Drink more water"
              placeholderTextColor="#BDBDBD"
              value={newGoal}
              onChangeText={setNewGoal}
              style={{
                borderWidth: 1, borderColor: "#EFEFEF", borderRadius: 12,
                backgroundColor: "#FAFAFA", paddingHorizontal: 16,
                height: 52, fontSize: 14, color: "#333", marginBottom: 16,
              }}
            />
            <TouchableOpacity
              onPress={addGoal}
              disabled={saving}
              style={{
                backgroundColor: "#2D7A4F", borderRadius: 14,
                paddingVertical: 15, alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
                {saving ? "Saving..." : "Save Goal"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={{
        flexDirection: "row", alignItems: "center", gap: 10,
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14,
        borderBottomWidth: 1, borderBottomColor: "#F5F5F5",
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, justifyContent: "center" }}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "800", color: "#111" }}>My Goals</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* Hero banner */}
        <View style={{
          marginHorizontal: 20, marginTop: 16, marginBottom: 20,
          backgroundColor: "#F0FAF4", borderRadius: 20, padding: 16,
          flexDirection: "row", alignItems: "center",
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "800", color: "#2D7A4F", marginBottom: 4 }}>
              Today's Progress
            </Text>
            <Text style={{ fontSize: 13, color: "#555" }}>
              {completedCount === goals.length
                ? "Amazing! All goals done! 🎉"
                : `Great job, Mama! Keep going.`}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 }}>
              <View style={{
                height: 6, flex: 1, backgroundColor: "#D0EDD9", borderRadius: 3, overflow: "hidden",
              }}>
                <View style={{
                  height: "100%",
                  width: `${Math.round((completedCount / goals.length) * 100)}%`,
                  backgroundColor: "#2D7A4F", borderRadius: 3,
                }} />
              </View>
              <Text style={{ fontSize: 12, color: "#2D7A4F", fontWeight: "700" }}>
                {completedCount}/{goals.length}
              </Text>
            </View>
          </View>
          <Image
            source={require("../../assets/images/10.png")}
            style={{ width: 90, height: 100 }}
            resizeMode="contain"
          />
        </View>

        {/* Daily Goals */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 15, fontWeight: "800", color: "#111", marginBottom: 12 }}>
            Daily Goals
          </Text>
          <View style={{ gap: 10 }}>
            {goals.map((goal) => (
              <TouchableOpacity
                key={goal.id}
                onPress={() => toggleGoal(goal.id)}
                style={{
                  flexDirection: "row", alignItems: "center", gap: 14,
                  backgroundColor: "#fff", borderRadius: 14, padding: 14,
                  shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
                }}
              >
                <View style={{
                  width: 38, height: 38, borderRadius: 10,
                  backgroundColor: "#F0FAF4", alignItems: "center", justifyContent: "center",
                }}>
                  <Ionicons name={goal.icon as any} size={19} color="#2D7A4F" />
                </View>
                <Text style={{
                  flex: 1, fontSize: 14, fontWeight: "600",
                  color: goal.completed ? "#AAA" : "#111",
                  textDecorationLine: goal.completed ? "line-through" : "none",
                }}>
                  {goal.title}
                </Text>
                <View style={{
                  width: 24, height: 24, borderRadius: 6, borderWidth: 1.5,
                  borderColor: goal.completed ? "#2D7A4F" : "#DDD",
                  backgroundColor: goal.completed ? "#2D7A4F" : "transparent",
                  alignItems: "center", justifyContent: "center",
                }}>
                  {goal.completed && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Add Goal button */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            style={{
              backgroundColor: "#2D7A4F", borderRadius: 14,
              paddingVertical: 17, alignItems: "center",
              shadowColor: "#2D7A4F", shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Add New Goal</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}