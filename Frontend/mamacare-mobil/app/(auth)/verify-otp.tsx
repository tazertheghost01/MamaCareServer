import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const VERIFY_OTP_ENDPOINT = `${BASE_URL}/api/v1/auth/verify-otp`;

export default function VerifyOtpScreen() {
  const { email, firstName, lastName } = useLocalSearchParams<{
    email: string;
    firstName: string;
    lastName: string;
  }>();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Toast
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

  const dismissToast = () => {
    Animated.timing(toastAnim, { toValue: -100, duration: 300, useNativeDriver: true }).start();
  };

  const handleChange = (text: string, index: number) => {
    // Only allow digits
    const digit = text.replace(/[^0-9]/g, "");
    if (digit.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      showToast("Please enter the full 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(VERIFY_OTP_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      // Safely parse JSON — Spring may return non-JSON on some errors
      let data: any = {};
      try { data = await response.json(); } catch (_) {}

      const errMsg = data.detail || data.message || data.error || "";

      if (response.ok || response.status === 200) {
        // Tokens received — save and go to onboarding (backend uses snake_case keys)
        await SecureStore.setItemAsync("accessToken", data.access_token);
        await SecureStore.setItemAsync("refreshToken", data.refresh_token);
        if (firstName) await SecureStore.setItemAsync("firstName", firstName);
        if (lastName) await SecureStore.setItemAsync("lastName", lastName);
        router.replace("/(onboarding)/welcome");
      } else if (response.status === 400) {
        showToast(errMsg || "Invalid or expired code. Go back and sign up again.");
      } else if (response.status === 409) {
        showToast(errMsg || "Account already verified. Redirecting to sign in...");
        setTimeout(() => router.replace("/(auth)/sign-in"), 2000);
      } else if (response.status === 404) {
        showToast(errMsg || "No pending registration for this email. Sign up again.");
      } else if (response.status === 500) {
        showToast("Server error while creating account. Try again.");
      } else {
        showToast(errMsg || `Verification failed (error ${response.status}). Try again.`);
      }
    } catch (error: any) {
      console.log("OTP verify error:", error);
      if (error.message?.includes("Network request failed")) {
        showToast("Cannot reach server. Check your Wi-Fi or mobile data.");
      } else if (error.message?.includes("timeout")) {
        showToast("Server took too long to respond. Try again.");
      } else if (error.message?.includes("JSON")) {
        showToast("Server returned an invalid response. Try again.");
      } else {
        showToast(`Verification failed: ${error.message || "Unknown error"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    showToast("To resend the code, go back and sign up again.");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Toast */}
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
        <TouchableOpacity onPress={dismissToast}>
          <Ionicons name="close" size={18} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 24 }}>
          {/* Back */}
          <View style={{ paddingTop: 16 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ width: 38, height: 38, justifyContent: "center" }}>
              <Ionicons name="arrow-back" size={24} color="#111" />
            </TouchableOpacity>
          </View>

          {/* Icon */}
          <View style={{ alignItems: "center", marginTop: 24, marginBottom: 16 }}>
            <View style={{
              width: 72, height: 72, borderRadius: 36,
              backgroundColor: "#E8F5EE", alignItems: "center", justifyContent: "center",
            }}>
              <Ionicons name="mail-open-outline" size={32} color="#2D7A4F" />
            </View>
          </View>

          {/* Header */}
          <View style={{ alignItems: "center", marginBottom: 32 }}>
            <Text style={{ fontSize: 24, fontWeight: "800", color: "#111", marginBottom: 8 }}>
              Verify your email
            </Text>
            <Text style={{ fontSize: 14, color: "#999", textAlign: "center", lineHeight: 21, paddingHorizontal: 12 }}>
              We sent a 6-digit verification code to{"\n"}
              <Text style={{ color: "#2D7A4F", fontWeight: "700" }}>{email}</Text>
            </Text>
          </View>

          {/* OTP Inputs */}
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 10, marginBottom: 32 }}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                style={{
                  width: 48, height: 56, borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: digit ? "#2D7A4F" : "#EFEFEF",
                  backgroundColor: digit ? "#F0FAF4" : "#FAFAFA",
                  fontSize: 22, fontWeight: "700", color: "#111",
                  textAlign: "center",
                }}
              />
            ))}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            onPress={handleVerify}
            disabled={loading}
            style={{
              backgroundColor: loading ? "#7AAF90" : "#2D7A4F",
              borderRadius: 14, paddingVertical: 17, alignItems: "center",
              shadowColor: "#2D7A4F", shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
            }}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Verify & Continue</Text>
            }
          </TouchableOpacity>

          {/* Resend */}
          <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 24 }}>
            <Text style={{ color: "#999", fontSize: 14 }}>Didn't receive a code? </Text>
            <TouchableOpacity onPress={handleResend}>
              <Text style={{ color: "#2D7A4F", fontWeight: "700", fontSize: 14 }}>Resend</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
