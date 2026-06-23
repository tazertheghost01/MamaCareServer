import React from "react";
import {
  View, Text, Image, TouchableOpacity, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function AboutScreen() {
  const LINKS = [
    { label: "Terms of Use", onPress: () => {} },
    { label: "Privacy Policy", onPress: () => {} },
    { label: "Licenses", onPress: () => {} },
  ];

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
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* Logo */}
        <View style={{ alignItems: "center", marginTop: 32, marginBottom: 24 }}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={{ width: 160, height: 120 }}
            resizeMode="contain"
          />
        </View>

        {/* Description */}
        <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
          <Text style={{ fontSize: 14, color: "#555", lineHeight: 22, textAlign: "center" }}>
            MamaCare is your trusted companion through every step of your pregnancy and motherhood journey.
          </Text>
        </View>

        {/* Version */}
        <View style={{ marginHorizontal: 20, marginBottom: 12 }}>
          <View style={{
            flexDirection: "row", justifyContent: "space-between", alignItems: "center",
            backgroundColor: "#fff", borderRadius: 14, padding: 16,
            borderWidth: 1, borderColor: "#F0F0F0",
          }}>
            <Text style={{ fontSize: 14, color: "#333", fontWeight: "600" }}>Version</Text>
            <Text style={{ fontSize: 14, color: "#888" }}>1.0.0</Text>
          </View>
        </View>

        {/* Links */}
        <View style={{ marginHorizontal: 20, gap: 10 }}>
          {LINKS.map((link) => (
            <TouchableOpacity
              key={link.label}
              onPress={link.onPress}
              style={{
                flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                backgroundColor: "#fff", borderRadius: 14, padding: 16,
                borderWidth: 1, borderColor: "#F0F0F0",
              }}
            >
              <Text style={{ fontSize: 14, color: "#333", fontWeight: "600" }}>{link.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#CCC" />
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}