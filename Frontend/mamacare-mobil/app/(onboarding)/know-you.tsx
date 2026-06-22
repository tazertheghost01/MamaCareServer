import React, { useState } from "react";
import {
  View, Text, Image, TouchableOpacity, ScrollView, Dimensions,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

type Option = "due_date" | "lmp" | null;

export default function KnowYouScreen() {
  const [selected, setSelected] = useState<Option>(null);

  const handleContinue = () => {
    if (!selected) return;
    router.push({
      pathname: "/(onboarding)/due-date",
      params: { mode: selected },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 36 }}
      >
        {/* Header row */}
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

        {/* Calendar image */}
        <View style={{ alignItems: "center", marginTop: 10 }}>
          <Image
            source={require("../../assets/images/7.png")}
            style={{ width: 120, height: 120 }}
            resizeMode="contain"
          />
        </View>

        {/* Page dots */}
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 16 }}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={{
              width: i === 1 ? 20 : 8, height: 8, borderRadius: 4,
              backgroundColor: i === 1 ? "#2D7A4F" : "#D5D5D5",
            }} />
          ))}
        </View>

        {/* Title */}
        <View style={{ paddingHorizontal: 24, marginTop: 20, marginBottom: 24 }}>
          <Text style={{ fontSize: 26, fontWeight: "800", color: "#111", marginBottom: 8 }}>
            Let's get to know you
          </Text>
          <Text style={{ fontSize: 14, color: "#888" }}>
            We will personalize your experience.
          </Text>
        </View>

        {/* Options */}
        <View style={{ paddingHorizontal: 24, gap: 14 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 4 }}>
            How would you like to set your date?
          </Text>

          {/* Option 1 — Due date */}
          <TouchableOpacity
            onPress={() => setSelected("due_date")}
            style={{
              borderRadius: 14,
              borderWidth: 1.5,
              borderColor: selected === "due_date" ? "#2D7A4F" : "#EFEFEF",
              backgroundColor: selected === "due_date" ? "#F0FAF4" : "#FAFAFA",
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
              {/* Radio */}
              <View style={{
                width: 22, height: 22, borderRadius: 11, borderWidth: 2,
                borderColor: selected === "due_date" ? "#2D7A4F" : "#CCC",
                alignItems: "center", justifyContent: "center",
              }}>
                {selected === "due_date" && (
                  <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: "#2D7A4F" }} />
                )}
              </View>
              <View>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#111", marginBottom: 2 }}>
                  I know my due date
                </Text>
                <Text style={{ fontSize: 12, color: "#888" }}>
                  Enter the expected delivery date.
                </Text>
              </View>
            </View>
            <Ionicons name="calendar-outline" size={22} color="#2D7A4F" />
          </TouchableOpacity>

          {/* Option 2 — LMP */}
          <TouchableOpacity
            onPress={() => setSelected("lmp")}
            style={{
              borderRadius: 14,
              borderWidth: 1.5,
              borderColor: selected === "lmp" ? "#2D7A4F" : "#EFEFEF",
              backgroundColor: selected === "lmp" ? "#F0FAF4" : "#FAFAFA",
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
              <View style={{
                width: 22, height: 22, borderRadius: 11, borderWidth: 2,
                borderColor: selected === "lmp" ? "#2D7A4F" : "#CCC",
                alignItems: "center", justifyContent: "center",
              }}>
                {selected === "lmp" && (
                  <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: "#2D7A4F" }} />
                )}
              </View>
              <View>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#111", marginBottom: 2 }}>
                  I know my last menstrual period
                </Text>
                <Text style={{ fontSize: 12, color: "#888" }}>
                  We will calculate your due date.
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 20 }}>🩸</Text>
          </TouchableOpacity>
        </View>

        {/* Continue */}
        <View style={{ paddingHorizontal: 24, marginTop: 32 }}>
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!selected}
            style={{
              backgroundColor: selected ? "#2D7A4F" : "#B0CDB9",
              borderRadius: 14,
              paddingVertical: 17,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              shadowColor: "#2D7A4F",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: selected ? 0.3 : 0,
              shadowRadius: 12,
              elevation: selected ? 6 : 0,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
