import React from "react";
import {
  View, Text, TouchableOpacity, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const TRACK_ITEMS = [
  {
    icon: "calendar-outline",
    title: "Antenatal Appointment",
    desc: "Schedule & track your appointments",
    color: "#E8F5EE",
    iconColor: "#2D7A4F",
    route: "/(track)/appointment",
  },
  {
    icon: "medical-outline",
    title: "Medication",
    desc: "Track your daily medications",
    color: "#FFF3E0",
    iconColor: "#F57C00",
    route: "/(track)/medication",
  },
  {
    icon: "walk-outline",
    title: "Walk & Exercise",
    desc: "Start a walk session",
    color: "#E3F2FD",
    iconColor: "#1976D2",
    route: "/(track)/walk",
  },
  {
    icon: "heart-outline",
    title: "Baby Growth",
    desc: "See your baby's weekly development",
    color: "#FCE4EC",
    iconColor: "#C2185B",
    route: "/(track)/baby-growth",
  },
];

export default function TrackScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F8F8" }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: "800", color: "#111" }}>Track</Text>
          <Text style={{ fontSize: 14, color: "#888", marginTop: 4 }}>
            Monitor your pregnancy journey
          </Text>
        </View>

        {/* Track cards */}
        <View style={{ paddingHorizontal: 20, gap: 14 }}>
          {TRACK_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.title}
              onPress={() => router.push(item.route as any)}
              style={{
                backgroundColor: "#fff",
                borderRadius: 18,
                padding: 18,
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.07,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View style={{
                width: 56, height: 56, borderRadius: 16,
                backgroundColor: item.color,
                alignItems: "center", justifyContent: "center",
              }}>
                <Ionicons name={item.icon as any} size={26} color={item.iconColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "800", color: "#111", marginBottom: 4 }}>
                  {item.title}
                </Text>
                <Text style={{ fontSize: 13, color: "#888" }}>{item.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}