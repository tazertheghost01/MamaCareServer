import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const LOGIN_ENDPOINT = `${BASE_URL}/api/v1/auth/authenticate`;

export default function SignInScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ email: "", password: "" });

  // ── Toast ────────────────────────────────────────────────
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

  // ── Validation ────────────────────────────────────────────
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.email.trim())
      newErrors.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Enter a valid email address.";
    if (!form.password)
      newErrors.password = "Password is required.";
    else if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const setField = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
    if (errors[key]) setErrors({ ...errors, [key]: "" });
  };

  // ── Submit ────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      // Safely parse JSON — Spring may return non-JSON on some errors
      let data: any = {};
      try { data = await response.json(); } catch (_) {}

      // Helper: extract the real error message from Spring's response body
      const errMsg = data.detail || data.message || data.error || "";

      if (response.ok || response.status === 200) {
        // Save tokens securely — backend uses snake_case JSON keys
        await SecureStore.setItemAsync("accessToken", data.access_token);
        await SecureStore.setItemAsync("refreshToken", data.refresh_token);
        router.replace("/(tabs)/home");
      } else if (response.status === 400) {
        showToast(errMsg || "Invalid request. Check your email and password format.");
      } else if (response.status === 401) {
        setErrors({ password: "Incorrect email or password." });
        showToast(errMsg || "Incorrect email or password.");
      } else if (response.status === 403) {
        showToast(errMsg || "Your account is disabled. Please contact support.");
      } else if (response.status === 404) {
        setErrors({ email: "No account found with this email." });
        showToast(errMsg || "No account found with this email address.");
      } else if (response.status === 409) {
        showToast(errMsg || "Account conflict. Please try signing in instead.");
      } else if (response.status === 500) {
        showToast("Server error. Please try again in a few moments.");
      } else {
        showToast(errMsg || `Error ${response.status}. Please try again.`);
      }
    } catch (error: any) {
      console.log("Sign-in error:", error);
      if (error.message?.includes("Network request failed")) {
        showToast("Cannot reach server. Check your Wi-Fi or mobile data.");
      } else if (error.message?.includes("timeout")) {
        showToast("Server took too long to respond. Try again.");
      } else if (error.message?.includes("JSON")) {
        showToast("Server returned an invalid response. Try again.");
      } else {
        showToast(`Sign-in failed: ${error.message || "Unknown error"}`);
      }
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
        <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600", flex: 1 }}>
          {toastMsg}
        </Text>
        <TouchableOpacity onPress={dismissToast}>
          <Ionicons name="close" size={18} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* Top-left blobs */}
      <View style={{
        position: "absolute", top: -80, left: -60, width: 230, height: 230,
        borderRadius: 115, backgroundColor: "#E8F5EE", transform: [{ scaleX: 1.5 }],
      }} />
      <View style={{
        position: "absolute", top: -25, left: -10, width: 140, height: 140,
        borderRadius: 70, backgroundColor: "#C8E6D0", transform: [{ scaleX: 1.2 }],
      }} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}
        >
          <View style={{ flex: 1, paddingHorizontal: 24 }}>

            {/* Logo */}
            <View style={{ alignItems: "center", marginTop: 50, marginBottom: 8 }}>
              <Image
                source={require("../../assets/images/logo.png")}
                style={{ width: 90, height: 90 }}
                resizeMode="contain"
              />
            </View>

            {/* Welcome */}
            <View style={{ marginTop: 20, marginBottom: 28 }}>
              <Text style={{ fontSize: 26, fontWeight: "800", color: "#111", marginBottom: 8 }}>
                Welcome back!
              </Text>
              <Text style={{ fontSize: 14, color: "#999", lineHeight: 21 }}>
                Log in to continue your pregnancy journey with MamaCare.
              </Text>
            </View>

            <View style={{ gap: 16 }}>

              {/* Email */}
              <View>
                <Text style={labelStyle}>Email address</Text>
                <View style={[fieldStyle, errors.email ? { borderColor: "#E53935" } : {}]}>
                  <Ionicons name="mail-outline" size={18} color={errors.email ? "#E53935" : "#BDBDBD"} />
                  <TextInput
                    placeholder="Enter your email address"
                    placeholderTextColor="#BDBDBD"
                    value={form.email}
                    onChangeText={(v) => setField("email", v)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={{ flex: 1, fontSize: 14, color: "#333" }}
                  />
                </View>
                {errors.email ? <Text style={errorText}>{errors.email}</Text> : null}
              </View>

              {/* Password */}
              <View>
                <Text style={labelStyle}>Password</Text>
                <View style={[fieldStyle, errors.password ? { borderColor: "#E53935" } : {}]}>
                  <Ionicons name="lock-closed-outline" size={18} color={errors.password ? "#E53935" : "#BDBDBD"} />
                  <TextInput
                    placeholder="Enter your password"
                    placeholderTextColor="#BDBDBD"
                    value={form.password}
                    onChangeText={(v) => setField("password", v)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    style={{ flex: 1, fontSize: 14, color: "#333" }}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={19} color="#BDBDBD" />
                  </TouchableOpacity>
                </View>
                {errors.password ? <Text style={errorText}>{errors.password}</Text> : null}
                <TouchableOpacity style={{ alignSelf: "flex-end", marginTop: 8 }}>
                  <Text style={{ color: "#2D7A4F", fontWeight: "600", fontSize: 13 }}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Log In button */}
              <TouchableOpacity
                onPress={handleLogin}
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
                  : <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Log In</Text>
                }
              </TouchableOpacity>

              {/* Divider */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: "#F0F0F0" }} />
                <Text style={{ color: "#BDBDBD", fontSize: 12 }}>or continue with</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: "#F0F0F0" }} />
              </View>

              {/* Social */}
              <View style={{ flexDirection: "row", gap: 12 }}>
                <SocialBtn label="Google" icon="logo-google" />
                <SocialBtn label="Apple" icon="logo-apple" />
              </View>

              {/* Sign up */}
              <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 4 }}>
                <Text style={{ color: "#999", fontSize: 14 }}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/(auth)/sign-up")}>
                  <Text style={{ color: "#2D7A4F", fontWeight: "700", fontSize: 14 }}>Sign Up</Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const labelStyle = {
  fontSize: 13,
  fontWeight: "600" as const,
  color: "#444",
  marginBottom: 8,
};

const fieldStyle = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  borderWidth: 1,
  borderColor: "#EFEFEF",
  borderRadius: 12,
  backgroundColor: "#FAFAFA",
  paddingHorizontal: 14,
  height: 54,
  gap: 10,
};

const errorText = {
  color: "#E53935",
  fontSize: 12,
  marginTop: 4,
  marginLeft: 4,
};

function SocialBtn({ label, icon }: { label: string; icon: any }) {
  return (
    <TouchableOpacity style={{
      flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
      gap: 8, borderWidth: 1, borderColor: "#EFEFEF", borderRadius: 12,
      paddingVertical: 13, backgroundColor: "#FAFAFA",
    }}>
      <Ionicons name={icon} size={18} color="#333" />
      <Text style={{ fontWeight: "600", fontSize: 14, color: "#333" }}>{label}</Text>
    </TouchableOpacity>
  );
}