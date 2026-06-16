import React from "react";
import {
  View, Text, Image, TouchableOpacity, Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

const { width } = Dimensions.get("window");

export default function SignOutScreen() {
  const handleSignOut = async () => {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    await SecureStore.deleteItemAsync("firstName");
    await SecureStore.deleteItemAsync("lastName");
    await SecureStore.deleteItemAsync("email");
    await SecureStore.deleteItemAsync("dateMode");
    await SecureStore.deleteItemAsync("dateValue");
    await SecureStore.deleteItemAsync("pregnancyWeeks");
    await SecureStore.deleteItemAsync("dueDate");
    router.replace("/(auth)/sign-in");
  };

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
        <Text style={{ fontSize: 18, fontWeight: "800", color: "#111" }}>Sign Out</Text>
      </View>

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>

        {/* Door image */}
        <View style={{
          width: 160, height: 160, borderRadius: 80,
          backgroundColor: "#F0FAF4", alignItems: "center", justifyContent: "center",
          marginBottom: 32,
        }}>
          <Image
            source={require("../../assets/images/11.png")}
            style={{ width: 110, height: 110 }}
            resizeMode="contain"
          />
        </View>

        <Text style={{ fontSize: 22, fontWeight: "800", color: "#111", textAlign: "center", marginBottom: 10 }}>
          Are you sure you want to sign out?
        </Text>
        <Text style={{ fontSize: 14, color: "#888", textAlign: "center", lineHeight: 21, marginBottom: 48 }}>
          You can sign in again anytime.
        </Text>

        {/* Sign Out button */}
        <TouchableOpacity
          onPress={handleSignOut}
          style={{
            backgroundColor: "#2D7A4F", borderRadius: 14,
            paddingVertical: 17, alignItems: "center",
            width: "100%",
            shadowColor: "#2D7A4F", shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
            marginBottom: 14,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Sign Out</Text>
        </TouchableOpacity>

        {/* Cancel button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            borderRadius: 14, paddingVertical: 17,
            alignItems: "center", width: "100%",
            borderWidth: 1.5, borderColor: "#2D7A4F",
          }}
        >
          <Text style={{ color: "#2D7A4F", fontWeight: "700", fontSize: 16 }}>Cancel</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}