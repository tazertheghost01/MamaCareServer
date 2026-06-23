import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView,
  Modal, TextInput, ActivityIndicator, Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useRef } from "react";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

async function authHeaders() {
  const token = await SecureStore.getItemAsync("accessToken");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

const LANGUAGES = ["English", "Pidgin", "Yoruba", "Hausa", "Igbo"];

export default function SettingsScreen() {
  const [selectedLang, setSelectedLang] = useState("English");
  const [selectedUnit, setSelectedUnit] = useState("kg, cm");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "", newPassword: "", confirmationPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const toastAnim = useRef(new Animated.Value(-100)).current;
  const [toastMsg, setToastMsg] = useState("");
  const [toastSuccess, setToastSuccess] = useState(false);

  const showToast = (msg: string, success = false) => {
    setToastMsg(msg);
    setToastSuccess(success);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
      Animated.delay(3000),
      Animated.timing(toastAnim, { toValue: -100, duration: 350, useNativeDriver: true }),
    ]).start();
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmationPassword) {
      showToast("Please fill in all password fields.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      showToast("New password must be at least 8 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmationPassword) {
      showToast("New passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      const headers = await authHeaders();
      const response = await fetch(`${BASE_URL}/api/v1/users/`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmationPassword: passwordForm.confirmationPassword,
        }),
      });
      if (response.ok || response.status === 200) {
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: "", newPassword: "", confirmationPassword: "" });
        showToast("Password changed successfully!", true);
      } else if (response.status === 400) {
        showToast("Current password is incorrect.");
      } else {
        showToast("Failed to change password. Please try again.");
      }
    } catch (e) {
      showToast("No connection. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const PREFERENCES = [
    {
      icon: "notifications-outline",
      title: "Notifications",
      desc: "Manage your notification preferences",
      onPress: () => {},
    },
    {
      icon: "alarm-outline",
      title: "Reminders",
      desc: "Manage reminder preferences",
      onPress: () => router.push("/(tabs)/track"),
    },
    {
      icon: "globe-outline",
      title: "Language",
      desc: selectedLang,
      onPress: () => setShowLangModal(true),
    },
    {
      icon: "barbell-outline",
      title: "Units",
      desc: selectedUnit,
      onPress: () => setSelectedUnit(selectedUnit === "kg, cm" ? "lbs, in" : "kg, cm"),
    },
  ];

  const ACCOUNT = [
    {
      icon: "shield-outline",
      title: "Privacy",
      desc: "Manage your primary settings",
      onPress: () => {},
    },
    {
      icon: "lock-closed-outline",
      title: "Security",
      desc: "Change your password",
      onPress: () => setShowPasswordModal(true),
    },
    {
      icon: "trash-outline",
      title: "Delete Account",
      desc: "Permanently delete your account",
      onPress: () => {},
      danger: true,
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F8F8" }}>

      {/* Toast */}
      <Animated.View style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 999,
        transform: [{ translateY: toastAnim }],
        backgroundColor: toastSuccess ? "#2D7A4F" : "#C62828",
        paddingHorizontal: 20, paddingVertical: 14,
        flexDirection: "row", alignItems: "center", gap: 10,
        elevation: 10,
      }}>
        <Ionicons name={toastSuccess ? "checkmark-circle-outline" : "alert-circle-outline"} size={20} color="#fff" />
        <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600", flex: 1 }}>{toastMsg}</Text>
      </Animated.View>

      {/* Language Modal */}
      <Modal visible={showLangModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ fontSize: 17, fontWeight: "800", color: "#111" }}>Select Language</Text>
              <TouchableOpacity onPress={() => setShowLangModal(false)}>
                <Ionicons name="close" size={24} color="#555" />
              </TouchableOpacity>
            </View>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang}
                onPress={() => { setSelectedLang(lang); setShowLangModal(false); }}
                style={{
                  flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                  paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F5F5F5",
                }}
              >
                <Text style={{ fontSize: 15, color: selectedLang === lang ? "#2D7A4F" : "#333", fontWeight: selectedLang === lang ? "700" : "500" }}>
                  {lang}
                </Text>
                {selectedLang === lang && <Ionicons name="checkmark" size={20} color="#2D7A4F" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={showPasswordModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ fontSize: 17, fontWeight: "800", color: "#111" }}>Change Password</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Ionicons name="close" size={24} color="#555" />
              </TouchableOpacity>
            </View>
            <View style={{ gap: 12 }}>
              <PasswordInput
                placeholder="Current password"
                value={passwordForm.currentPassword}
                onChangeText={(v) => setPasswordForm({ ...passwordForm, currentPassword: v })}
                show={showCurrent}
                onToggle={() => setShowCurrent(!showCurrent)}
              />
              <PasswordInput
                placeholder="New password"
                value={passwordForm.newPassword}
                onChangeText={(v) => setPasswordForm({ ...passwordForm, newPassword: v })}
                show={showNew}
                onToggle={() => setShowNew(!showNew)}
              />
              <PasswordInput
                placeholder="Confirm new password"
                value={passwordForm.confirmationPassword}
                onChangeText={(v) => setPasswordForm({ ...passwordForm, confirmationPassword: v })}
                show={showConfirm}
                onToggle={() => setShowConfirm(!showConfirm)}
              />
              <TouchableOpacity
                onPress={handleChangePassword}
                disabled={saving}
                style={{
                  backgroundColor: saving ? "#7AAF90" : "#2D7A4F",
                  borderRadius: 14, paddingVertical: 15, alignItems: "center", marginTop: 8,
                }}
              >
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Save Password</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={{
        flexDirection: "row", alignItems: "center", gap: 10,
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14,
        backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#F5F5F5",
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, justifyContent: "center" }}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "800", color: "#111" }}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#888", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Preferences
          </Text>
          <View style={{ gap: 10, marginBottom: 24 }}>
            {PREFERENCES.map((item) => (
              <SettingRow key={item.title} {...item} />
            ))}
          </View>

          <Text style={{ fontSize: 13, fontWeight: "700", color: "#888", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Account
          </Text>
          <View style={{ gap: 10 }}>
            {ACCOUNT.map((item) => (
              <SettingRow key={item.title} {...item} />
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({ icon, title, desc, onPress, danger }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row", alignItems: "center", gap: 14,
        backgroundColor: "#fff", borderRadius: 14, padding: 14,
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
      }}
    >
      <View style={{
        width: 38, height: 38, borderRadius: 10,
        backgroundColor: danger ? "#FFF0F0" : "#E8F5EE",
        alignItems: "center", justifyContent: "center",
      }}>
        <Ionicons name={icon} size={19} color={danger ? "#E53935" : "#2D7A4F"} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "700", color: danger ? "#E53935" : "#111", marginBottom: 2 }}>
          {title}
        </Text>
        <Text style={{ fontSize: 12, color: "#888" }}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#CCC" />
    </TouchableOpacity>
  );
}

function PasswordInput({ placeholder, value, onChangeText, show, onToggle }: any) {
  return (
    <View style={{
      flexDirection: "row", alignItems: "center",
      borderWidth: 1, borderColor: "#EFEFEF", borderRadius: 12,
      backgroundColor: "#FAFAFA", paddingHorizontal: 14, height: 52, gap: 10,
    }}>
      <Ionicons name="lock-closed-outline" size={18} color="#BDBDBD" />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#BDBDBD"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!show}
        autoCapitalize="none"
        style={{ flex: 1, fontSize: 14, color: "#333" }}
      />
      <TouchableOpacity onPress={onToggle}>
        <Ionicons name={show ? "eye-outline" : "eye-off-outline"} size={18} color="#BDBDBD" />
      </TouchableOpacity>
    </View>
  );
}