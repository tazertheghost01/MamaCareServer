import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity,
  ScrollView, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

async function authHeaders() {
  const token = await SecureStore.getItemAsync("accessToken");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

export default function ProfileScreen() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [pregnancy, setPregnancy] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const firstName = await SecureStore.getItemAsync("firstName");
      const lastName = await SecureStore.getItemAsync("lastName");
      const storedEmail = await SecureStore.getItemAsync("email");
      if (firstName) setUserName(`${firstName} ${lastName || ""}`.trim());
      if (storedEmail) setEmail(storedEmail);

      const headers = await authHeaders();
      const res = await fetch(`${BASE_URL}/api/v1/pregnancy/me`, { headers });
      if (res.ok) {
        const data = await res.json();
        setPregnancy(data);
      }
    } catch (e) {}
    finally { setLoading(false); }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "--";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
  };

  const getTrimester = (weeks: number) => {
    if (weeks <= 12) return "1st Trimester";
    if (weeks <= 26) return "2nd Trimester";
    return "3rd Trimester";
  };

  const TOOLS = [
    {
      icon: "person-outline",
      color: "#E8F5EE",
      iconColor: "#2D7A4F",
      title: "Pregnancy Overview",
      desc: "View your pregnancy progress",
      onPress: () => router.push("/(profile)/pregnancy-overview"),
    },
    {
      icon: "flag-outline",
      color: "#E8F5EE",
      iconColor: "#2D7A4F",
      title: "My Goals",
      desc: "Track your daily goals",
      onPress: () => router.push("/(profile)/my-goals"),
    },
    {
      icon: "notifications-outline",
      color: "#E8F5EE",
      iconColor: "#2D7A4F",
      title: "Reminders",
      desc: "Manage your reminders",
      onPress: () => router.push("../(tabs)/track"),
    },
  ];

  const ACCOUNT = [
    {
      icon: "settings-outline",
      color: "#E8F5EE",
      iconColor: "#2D7A4F",
      title: "Settings",
      desc: "Notifications, language & privacy",
      onPress: () => router.push("/(profile)/settings"),
    },
    {
      icon: "help-circle-outline",
      color: "#E8F5EE",
      iconColor: "#2D7A4F",
      title: "Help & Support",
      desc: "Get help & support",
      onPress: () => router.push("/(profile)/about"),
    },
    {
      icon: "information-circle-outline",
      color: "#E8F5EE",
      iconColor: "#2D7A4F",
      title: "About MamaCare",
      desc: "Learn more about us",
      onPress: () => router.push("/(profile)/about"),
    },
    {
      icon: "log-out-outline",
      color: "#FFF0F0",
      iconColor: "#E53935",
      title: "Sign Out",
      desc: "Log out of your account",
      onPress: () => router.push("/(profile)/sign-out"),
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F8F8" }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* Notification bell */}
        <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 20, paddingTop: 16 }}>
          <TouchableOpacity style={{ position: "relative" }}>
            <Ionicons name="notifications-outline" size={26} color="#111" />
            <View style={{
              position: "absolute", top: 0, right: 0,
              width: 8, height: 8, borderRadius: 4, backgroundColor: "#E53935",
            }} />
          </TouchableOpacity>
        </View>

        {/* Profile card */}
        <View style={{
          marginHorizontal: 20, marginTop: 8, marginBottom: 20,
          backgroundColor: "#F0FAF4", borderRadius: 20, padding: 16,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            {/* Avatar */}
            <View style={{
              width: 64, height: 64, borderRadius: 32,
              backgroundColor: "#2D7A4F", alignItems: "center", justifyContent: "center",
            }}>
              <Ionicons name="person" size={30} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={{ fontSize: 17, fontWeight: "800", color: "#111" }}>
                  {userName || "MamaCare User"}
                </Text>
                <TouchableOpacity>
                  <Ionicons name="pencil-outline" size={16} color="#2D7A4F" />
                </TouchableOpacity>
              </View>
              {loading ? (
                <ActivityIndicator size="small" color="#2D7A4F" style={{ alignSelf: "flex-start", marginTop: 4 }} />
              ) : (
                <Text style={{ fontSize: 13, color: "#2D7A4F", fontWeight: "600", marginTop: 2 }}>
                  {pregnancy ? `${pregnancy.weeksOfPregnancy} weeks pregnant` : "Set up your pregnancy"}
                </Text>
              )}
              {pregnancy && (
                <Text style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                  {getTrimester(pregnancy.weeksOfPregnancy)} • Week {pregnancy.weeksOfPregnancy}
                </Text>
              )}
            </View>
          </View>

          {/* Stats row */}
          {pregnancy && (
            <View style={{
              flexDirection: "row", marginTop: 16, gap: 8,
            }}>
              <StatBox icon="calendar-outline" label="Due Date" value={formatDate(pregnancy.dueDate)} />
              <StatBox icon="body-outline" label="Baby Size" value="Average size" />
              <StatBox icon="trending-up-outline" label="Weight Gain" value="+ 3.2 kg" />
            </View>
          )}
        </View>

        {/* My Tools & Data */}
        <SectionTitle title="My Tools & Data" />
        <View style={{ marginHorizontal: 20, gap: 10, marginBottom: 24 }}>
          {TOOLS.map((item) => (
            <MenuItem key={item.title} {...item} />
          ))}
        </View>

        {/* Account & Settings */}
        <SectionTitle title="Account & Settings" />
        <View style={{ marginHorizontal: 20, gap: 10 }}>
          {ACCOUNT.map((item) => (
            <MenuItem key={item.title} {...item} />
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={{
      flex: 1, backgroundColor: "#fff", borderRadius: 12,
      padding: 10, alignItems: "center",
      shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
    }}>
      <Ionicons name={icon} size={16} color="#2D7A4F" style={{ marginBottom: 4 }} />
      <Text style={{ fontSize: 10, color: "#888", marginBottom: 2 }}>{label}</Text>
      <Text style={{ fontSize: 11, fontWeight: "700", color: "#111", textAlign: "center" }}>{value}</Text>
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <Text style={{ fontSize: 15, fontWeight: "800", color: "#111", paddingHorizontal: 20, marginBottom: 10 }}>
      {title}
    </Text>
  );
}

function MenuItem({ icon, color, iconColor, title, desc, onPress }: any) {
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
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: color, alignItems: "center", justifyContent: "center",
      }}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "700", color: "#111", marginBottom: 2 }}>{title}</Text>
        <Text style={{ fontSize: 12, color: "#888" }}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#CCC" />
    </TouchableOpacity>
  );
}
