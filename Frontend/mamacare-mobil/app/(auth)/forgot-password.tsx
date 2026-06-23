import React, { useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Animated, Image
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const toastAnim = useRef(new Animated.Value(-100)).current;
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
      Animated.delay(3500),
      Animated.timing(toastAnim, { toValue: -100, duration: 350, useNativeDriver: true }),
    ]).start();
  };

  const handleSendOtp = async () => {
    if (!email.trim() || !email.includes("@")) {
      showToast("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      
      let data: any = {};
      try { data = await response.json(); } catch (_) {}
      
      if (response.ok) {
        router.push({
          pathname: "/(auth)/reset-password",
          params: { email: email.trim().toLowerCase() }
        });
      } else {
        showToast(data.message || data.detail || "Error sending password reset email.");
      }
    } catch (e) {
      showToast("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Sliding Toast */}
      <Animated.View style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 999,
        transform: [{ translateY: toastAnim }],
        backgroundColor: "#C62828",
        paddingHorizontal: 20, paddingVertical: 14,
        flexDirection: "row", alignItems: "center", gap: 10,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, shadowRadius: 8, elevation: 10,
      }}>
        <Ionicons name="alert-circle-outline" size={20} color="#fff" />
        <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600", flex: 1 }}>{toastMsg}</Text>
      </Animated.View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 24, paddingTop: 40, flex: 1 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 30 }}>
            <Ionicons name="arrow-back" size={28} color="#111" />
          </TouchableOpacity>

          <Text style={{ fontSize: 26, fontWeight: "800", color: "#111", marginBottom: 12 }}>
            Forgot Password?
          </Text>
          <Text style={{ fontSize: 15, color: "#666", lineHeight: 22, marginBottom: 30 }}>
            Enter the email address associated with your account, and we'll send you an OTP to reset your password.
          </Text>

          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#444", marginBottom: 8 }}>Email address</Text>
            <View style={{
              flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#EFEFEF",
              borderRadius: 12, backgroundColor: "#FAFAFA", paddingHorizontal: 14, height: 54, gap: 10
            }}>
              <Ionicons name="mail-outline" size={18} color="#BDBDBD" />
              <TextInput
                placeholder="mama@example.com"
                placeholderTextColor="#BDBDBD"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{ flex: 1, fontSize: 14, color: "#333" }}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSendOtp}
            disabled={loading}
            style={{
              backgroundColor: loading ? "#7AAF90" : "#2D7A4F",
              borderRadius: 14, paddingVertical: 17, alignItems: "center",
              shadowColor: "#2D7A4F", shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
            }}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Send OTP</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
