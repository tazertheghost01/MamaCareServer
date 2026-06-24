import React, { useState } from "react";
import {
  View, Text, Image, TouchableOpacity,
  ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import DateTimePickerSheet from "../../components/DateTimePickerSheet";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function DueDateScreen() {
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const isLMP = mode === "lmp";

  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!date.trim()) {
      setError(isLMP ? "Please select your last menstrual period date." : "Please select your expected due date.");
      return false;
    }
    return true;
  };

  const handleStart = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync("accessToken");

      // Build pregnancy setup payload
      // Backend requires `source` to be "DUE_DATE" or "LMP" (not null)
      const payload: any = isLMP
        ? { source: "LMP", lastMenstrualPeriod: date }
        : { source: "DUE_DATE", dueDate: date };

      const response = await fetch(`${BASE_URL}/api/v1/pregnancy/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok || response.status === 200) {
        const data = await response.json();
        // Save pregnancy info locally
        await SecureStore.setItemAsync("dateMode", mode || "due_date");
        await SecureStore.setItemAsync("dateValue", date);
        await SecureStore.setItemAsync("pregnancyWeeks", String(data.week || 0));
        await SecureStore.setItemAsync("dueDate", data.dueDate || "");
      } else {
        // Save locally even if API fails — will sync later
        await SecureStore.setItemAsync("dateMode", mode || "due_date");
        await SecureStore.setItemAsync("dateValue", date);
      }
    } catch (e) {
      // Save locally if no connection
      await SecureStore.setItemAsync("dateMode", mode || "due_date");
      await SecureStore.setItemAsync("dateValue", date);
    } finally {
      setLoading(false);
      router.replace("/(tabs)/home");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <DateTimePickerSheet
        visible={showPicker}
        mode="date"
        title={isLMP ? "Select LMP Date" : "Select Due Date"}
        initialValue={date}
        onClose={() => setShowPicker(false)}
        onConfirm={(value) => {
          setDate(value);
          setShowPicker(false);
          setError("");
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 36 }} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={{
          flexDirection: "row", alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20, paddingTop: 16,
        }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 38, height: 38, justifyContent: "center" }}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace("/(tabs)/home")}>
            <Text style={{ color: "#2D7A4F", fontSize: 15, fontWeight: "600" }}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Baby image */}
        <View style={{ alignItems: "center", marginTop: 10 }}>
          <View style={{
            width: 110, height: 110, borderRadius: 55,
            backgroundColor: "#F0FAF4", alignItems: "center", justifyContent: "center",
          }}>
            <Image
              source={require("../../assets/images/8.png")}
              style={{ width: 80, height: 80 }}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Page dots */}
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 16 }}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={{
              width: i === 2 ? 20 : 8, height: 8, borderRadius: 4,
              backgroundColor: i === 2 ? "#2D7A4F" : "#D5D5D5",
            }} />
          ))}
        </View>

        {/* Title */}
        <View style={{ paddingHorizontal: 24, marginTop: 20, marginBottom: 28 }}>
          <Text style={{ fontSize: 26, fontWeight: "800", color: "#111", marginBottom: 8 }}>
            {isLMP ? "When did your period start?" : "When is baby coming?"}
          </Text>
          <Text style={{ fontSize: 14, color: "#888", lineHeight: 21 }}>
            {isLMP
              ? "We'll use this to calculate your due date and track your pregnancy week by week."
              : "This helps us to track your pregnancy week by week."}
          </Text>
        </View>

        {/* Date input */}
        <View style={{ paddingHorizontal: 24 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#444", marginBottom: 10 }}>
            {isLMP ? "Last Menstrual Period Date" : "Expected Due Date"}
          </Text>
          <TouchableOpacity
            onPress={() => setShowPicker(true)}
            style={{
              flexDirection: "row", alignItems: "center",
              borderWidth: 1.5,
              borderColor: error ? "#E53935" : "#EFEFEF",
              borderRadius: 12, backgroundColor: "#FAFAFA",
              paddingHorizontal: 16, height: 54,
              justifyContent: "space-between",
            }}
          >
            <Text style={{ flex: 1, fontSize: 15, color: date ? "#333" : "#BDBDBD" }}>
              {date || "Select a date"}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#2D7A4F" />
          </TouchableOpacity>
          {error ? (
            <Text style={{ color: "#E53935", fontSize: 12, marginTop: 6, marginLeft: 2 }}>
              {error}
            </Text>
          ) : null}
        </View>

        {/* Buttons */}
        <View style={{ paddingHorizontal: 24, marginTop: 40, gap: 12 }}>
          <TouchableOpacity
            onPress={handleStart}
            disabled={loading}
            style={{
              backgroundColor: loading ? "#7AAF90" : "#2D7A4F",
              borderRadius: 14, paddingVertical: 17,
              flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
              shadowColor: "#2D7A4F", shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
              {loading ? "Saving..." : "Start My Journey"}
            </Text>
            {!loading && <Ionicons name="heart-outline" size={18} color="#fff" />}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/home")}
            style={{
              borderRadius: 14, paddingVertical: 17, alignItems: "center",
              borderWidth: 1.5, borderColor: "#2D7A4F",
            }}
          >
            <Text style={{ color: "#2D7A4F", fontWeight: "600", fontSize: 16 }}>
              I'll do this later
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}
