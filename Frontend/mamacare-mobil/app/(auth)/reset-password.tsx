import React, { useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Animated
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  const handleReset = async () => {
    if (!otp.trim() || newPassword.length < 6) {
      showToast("OTP is required and password must be 6+ chars.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/v1/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.trim(), newPassword }),
      });
      
      let data: any = {};
      try { data = await response.json(); } catch (_) {}
      
      if (response.ok) {
        // Success
        router.replace("/(auth)/sign-in");
      } else {
        showToast(data.message || data.detail || "Error resetting password.");
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
            Set New Password
          </Text>
          <Text style={{ fontSize: 15, color: "#666", lineHeight: 22, marginBottom: 30 }}>
            Please enter the 6-digit verification code sent to {email} and your new password.
          </Text>

          <View style={{ gap: 16, marginBottom: 24 }}>
            <View>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#444", marginBottom: 8 }}>OTP Code</Text>
              <View style={{
                flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#EFEFEF",
                borderRadius: 12, backgroundColor: "#FAFAFA", paddingHorizontal: 14, height: 54, gap: 10
              }}>
                <Ionicons name="keypad-outline" size={18} color="#BDBDBD" />
                <TextInput
                  placeholder="000000"
                  placeholderTextColor="#BDBDBD"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  style={{ flex: 1, fontSize: 14, color: "#333", letterSpacing: 2 }}
                  maxLength={6}
                />
              </View>
            </View>

            <View>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#444", marginBottom: 8 }}>New Password</Text>
              <View style={{
                flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#EFEFEF",
                borderRadius: 12, backgroundColor: "#FAFAFA", paddingHorizontal: 14, height: 54, gap: 10
              }}>
                <Ionicons name="lock-closed-outline" size={18} color="#BDBDBD" />
                <TextInput
                  placeholder="Enter new password"
                  placeholderTextColor="#BDBDBD"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPassword}
                  style={{ flex: 1, fontSize: 14, color: "#333" }}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={19} color="#BDBDBD" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleReset}
            disabled={loading}
            style={{
              backgroundColor: loading ? "#7AAF90" : "#2D7A4F",
              borderRadius: 14, paddingVertical: 17, alignItems: "center",
              shadowColor: "#2D7A4F", shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
            }}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Reset Password</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
