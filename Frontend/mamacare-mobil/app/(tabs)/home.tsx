import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, Image, TouchableOpacity,
  ScrollView, Dimensions, Modal, Animated, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

const { width } = Dimensions.get("window");
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const LANGUAGES = ["English", "Pidgin", "Yoruba", "Hausa", "Igbo"];

// ── Notifications setup ──────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function registerForPushNotifications() {
  if (!Device.isDevice) return;
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return;
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
}

// ── Helper: get auth headers ─────────────────────────────
async function authHeaders() {
  const token = await SecureStore.getItemAsync("accessToken");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

const LEARN_ITEMS = [
  {
    title: "Nutrition for you and baby",
    duration: "2.30 min",
    image: require("../../assets/images/9.png"),
  },
  {
    title: "Managing stress the healthy way",
    duration: "1.45 min",
    image: require("../../assets/images/11.png"),
  },
  {
    title: "Danger signs in pregnancy",
    duration: "1.30 min",
    image: require("../../assets/images/12.png"),
  },
  {
    title: "Preparing for your baby's delivery",
    duration: "1.35 min",
    image: require("../../assets/images/7.png"),
  },
];

export default function HomeScreen() {
  const [selectedLang, setSelectedLang] = useState("English");
  const [menuVisible, setMenuVisible] = useState(false);
  const menuAnim = useRef(new Animated.Value(-300)).current;

  // User info
  const [userName, setUserName] = useState("Mama");

  // Pregnancy info from API
  const [pregnancyWeeks, setPregnancyWeeks] = useState<number | null>(null);
  const [daysToGo, setDaysToGo] = useState<number | null>(null);
  const [trimester, setTrimester] = useState("");

  // Dashboard data from API
  const [nextAppointment, setNextAppointment] = useState<any>(null);
  const [todayMeds, setTodayMeds] = useState<any[]>([]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // ── Load data ─────────────────────────────────────────
  useEffect(() => {
    loadUserData();
    loadPregnancyInfo();
    loadNextAppointment();
    loadTodayMeds();
    registerForPushNotifications();
  }, []);

  const loadUserData = async () => {
    const firstName = await SecureStore.getItemAsync("firstName");
    const lastName = await SecureStore.getItemAsync("lastName");
    if (firstName) setUserName(firstName + (lastName ? " " + lastName : ""));
  };

  const loadPregnancyInfo = async () => {
    try {
      const headers = await authHeaders();
      const response = await fetch(`${BASE_URL}/api/v1/pregnancy/me`, { headers });
      if (response.ok) {
        const data = await response.json();
        setPregnancyWeeks(data.weeksOfPregnancy);
        if (data.dueDate) {
          const due = new Date(data.dueDate);
          const today = new Date();
          const diff = Math.max(0, Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
          setDaysToGo(diff);
        }
        const weeks = data.weeksOfPregnancy || 0;
        if (weeks <= 12) setTrimester("1st Trimester");
        else if (weeks <= 26) setTrimester("2nd Trimester");
        else setTrimester("3rd Trimester");
      }
    } catch (e) {
      const stored = await SecureStore.getItemAsync("pregnancyWeeks");
      if (stored) setPregnancyWeeks(parseInt(stored));
    }
  };

  const loadNextAppointment = async () => {
    try {
      const headers = await authHeaders();
      const response = await fetch(`${BASE_URL}/api/v1/appointments/upcoming/next`, { headers });
      if (response.ok) {
        const data = await response.json();
        setNextAppointment(data);
      }
    } catch (e) {}
  };

  const loadTodayMeds = async () => {
    try {
      const headers = await authHeaders();
      const response = await fetch(`${BASE_URL}/api/v1/medications/today`, { headers });
      if (response.ok) {
        const data = await response.json();
        setTodayMeds(Array.isArray(data) ? data.slice(0, 3) : []);
      }
    } catch (e) {}
  };

  // ── Menu ─────────────────────────────────────────────
  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(menuAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
  };

  const closeMenu = () => {
    Animated.timing(menuAnim, { toValue: -300, duration: 250, useNativeDriver: true })
      .start(() => setMenuVisible(false));
  };

  const handleSignOut = async () => {
    closeMenu();
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    await SecureStore.deleteItemAsync("firstName");
    await SecureStore.deleteItemAsync("lastName");
    await SecureStore.deleteItemAsync("dateMode");
    await SecureStore.deleteItemAsync("dateValue");
    await SecureStore.deleteItemAsync("pregnancyWeeks");
    await SecureStore.deleteItemAsync("dueDate");
    router.replace("/(auth)/sign-in");
  };

  const MENU_ITEMS = [
    { icon: "person-outline", label: "Me", onPress: () => { closeMenu(); router.push("/(tabs)/profile"); } },
    { icon: "settings-outline", label: "Settings", onPress: () => { closeMenu(); } },
    { icon: "help-circle-outline", label: "Help & Support", onPress: () => { closeMenu(); } },
    { icon: "information-circle-outline", label: "About Us", onPress: () => { closeMenu(); } },
    { icon: "log-out-outline", label: "Sign Out", onPress: handleSignOut, color: "#E53935" },
  ];

  // ── Build reminders from API data ────────────────────
  const reminders = [
    nextAppointment ? {
      icon: "calendar-outline",
      title: nextAppointment.title || "Appointment",
      sub: nextAppointment.daysUntilAppointment != null
        ? `In ${nextAppointment.daysUntilAppointment} days`
        : "Upcoming",
      subColor: "#2D7A4F",
      bg: "#F0FAF4",
    } : {
      icon: "calendar-outline",
      title: "Antenatal\nAppointment",
      sub: "No upcoming",
      subColor: "#2D7A4F",
      bg: "#F0FAF4",
    },
    todayMeds[0] ? {
      icon: "medical-outline",
      title: todayMeds[0].medicationName || "Medication",
      sub: todayMeds[0].reminderTime?.slice(0, 5) || "Today",
      subSub: "Daily reminder",
      bg: "#FFF8F0",
    } : {
      icon: "medical-outline",
      title: "Medication",
      sub: "No meds today",
      bg: "#FFF8F0",
    },
    {
      icon: "walk-outline",
      title: "Daily Walk",
      sub: "10 min",
      subSub: "Lets move gently",
      bg: "#F0F4FF",
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F8F8" }}>

      {/* ── Slide-out Menu ── */}
      <Modal visible={menuVisible} transparent animationType="none">
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
          activeOpacity={1}
          onPress={closeMenu}
        >
          <Animated.View style={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: 280,
            backgroundColor: "#fff", transform: [{ translateX: menuAnim }],
            paddingTop: 60,
            shadowColor: "#000", shadowOffset: { width: 4, height: 0 },
            shadowOpacity: 0.15, shadowRadius: 12, elevation: 10,
          }}>
            {/* Profile header */}
            <View style={{
              paddingHorizontal: 24, paddingBottom: 24,
              borderBottomWidth: 1, borderBottomColor: "#F0F0F0", marginBottom: 8,
            }}>
              <View style={{
                width: 56, height: 56, borderRadius: 28,
                backgroundColor: "#E8F5EE", alignItems: "center",
                justifyContent: "center", marginBottom: 10,
              }}>
                <Ionicons name="person" size={26} color="#2D7A4F" />
              </View>
              <Text style={{ fontSize: 17, fontWeight: "800", color: "#111" }}>{userName}</Text>
              <Text style={{ fontSize: 12, color: "#888", marginTop: 2 }}>MamaCare Member</Text>
            </View>

            {MENU_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.label}
                onPress={item.onPress}
                style={{
                  flexDirection: "row", alignItems: "center", gap: 16,
                  paddingHorizontal: 24, paddingVertical: 16,
                }}
              >
                <Ionicons name={item.icon as any} size={22} color={item.color || "#555"} />
                <Text style={{ fontSize: 15, color: item.color || "#333", fontWeight: "500" }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

        {/* ── Top bar ── */}
        <View style={{
          flexDirection: "row", justifyContent: "space-between",
          alignItems: "center", paddingHorizontal: 20,
          paddingTop: 16, paddingBottom: 10, backgroundColor: "#fff",
        }}>
          <TouchableOpacity onPress={openMenu}>
            <Ionicons name="menu-outline" size={26} color="#111" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: "MamaCare 💚",
                  body: "You have new updates waiting for you!",
                },
                trigger: null,
              });
            }}
            style={{ position: "relative" }}
          >
            <Ionicons name="notifications-outline" size={26} color="#111" />
            <View style={{
              position: "absolute", top: 0, right: 0,
              width: 8, height: 8, borderRadius: 4, backgroundColor: "#E53935",
            }} />
          </TouchableOpacity>
        </View>

        {/* ── Greeting ── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12, backgroundColor: "#fff" }}>
          <Text style={{ fontSize: 22, fontWeight: "800", color: "#111" }}>
            {greeting}, {userName}!
          </Text>
        </View>

        {/* ── Pregnancy card ── */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/track")}
          style={{
            marginHorizontal: 20, marginBottom: 16,
            backgroundColor: "#2D7A4F", borderRadius: 20,
            paddingLeft: 18, paddingTop: 18, paddingBottom: 18,
            flexDirection: "row", alignItems: "flex-start",
            shadowColor: "#2D7A4F", shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
            overflow: "hidden",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#A8D8BC", fontSize: 12, marginBottom: 4 }}>You are</Text>
            <Text style={{ color: "#fff", fontSize: 32, fontWeight: "800", lineHeight: 36 }}>
              {pregnancyWeeks != null ? `${pregnancyWeeks} weeks` : "-- weeks"}
            </Text>
            <Text style={{ color: "#A8D8BC", fontSize: 13, marginTop: 2 }}>Pregnant</Text>
            <Text style={{ color: "#A8D8BC", fontSize: 11, marginTop: 4 }}>
              {trimester || "--"} · {daysToGo != null ? `${daysToGo} days to go` : "-- days to go"}
            </Text>

            {/* Audio pill */}
            <TouchableOpacity style={{
              marginTop: 12, backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: 25, paddingHorizontal: 14, paddingVertical: 10,
              flexDirection: "row", alignItems: "center", gap: 8,
              alignSelf: "flex-start",
            }}>
              <Ionicons name="volume-medium-outline" size={16} color="#fff" />
              <View>
                <Text style={{ color: "#fff", fontSize: 11, fontWeight: "600" }}>
                  Listen to your weekly update
                </Text>
                <Text style={{ color: "#A8D8BC", fontSize: 10 }}>
                  In {selectedLang} · 1.25 min
                </Text>
              </View>
              <Ionicons name="play-circle-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Baby image */}
          <Image
            source={require("../../assets/images/8.png")}
            style={{ width: 100, height: 130, marginTop: -18 }}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* ── Today's Reminders ── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#111" }}>Today's Reminders</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/reminders" as any)}>
              <Text style={{ color: "#2D7A4F", fontWeight: "600", fontSize: 13 }}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {reminders.map((r: any, i: number) => (
              <TouchableOpacity
                key={i}
                onPress={() => router.push("/(tabs)/reminders" as any)}
                style={{
                  width: 120, backgroundColor: "#fff", borderRadius: 16,
                  padding: 14, alignItems: "center",
                  shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
                }}
              >
                <View style={{
                  width: 40, height: 40, borderRadius: 12,
                  backgroundColor: r.bg, alignItems: "center", justifyContent: "center", marginBottom: 8,
                }}>
                  <Ionicons name={r.icon as any} size={20} color="#2D7A4F" />
                </View>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#111", textAlign: "center", marginBottom: 6 }}>
                  {r.title}
                </Text>
                <View style={{
                  backgroundColor: r.subColor ? "#E8F5EE" : "#F5F5F5",
                  borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3,
                }}>
                  <Text style={{ fontSize: 10, color: r.subColor || "#888", fontWeight: "600" }}>
                    {r.sub}
                  </Text>
                </View>
                {r.subSub && (
                  <Text style={{ fontSize: 10, color: "#AAA", marginTop: 4, textAlign: "center" }}>
                    {r.subSub}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Listen in your language ── */}
        <View style={{
          marginHorizontal: 20, marginBottom: 16,
          backgroundColor: "#fff", borderRadius: 16, padding: 16,
          shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <View style={{
              width: 38, height: 38, borderRadius: 19,
              backgroundColor: "#F0FAF4", alignItems: "center", justifyContent: "center",
            }}>
              <Ionicons name="volume-medium-outline" size={20} color="#2D7A4F" />
            </View>
            <View>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#111" }}>Listen in your language</Text>
              <Text style={{ fontSize: 11, color: "#888" }}>Choose your preferred language for audio content.</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang}
                onPress={() => setSelectedLang(lang)}
                style={{
                  paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                  backgroundColor: selectedLang === lang ? "#2D7A4F" : "#F5F5F5",
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: "600", color: selectedLang === lang ? "#fff" : "#555" }}>
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Learn & Listen ── */}
        <View style={{ paddingHorizontal: 20 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#111" }}>Learn & Listen</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/learn")}>
              <Text style={{ color: "#2D7A4F", fontWeight: "600", fontSize: 13 }}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {LEARN_ITEMS.map((item, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => router.push("/(tabs)/learn")}
                style={{
                  width: 130, backgroundColor: "#fff", borderRadius: 16, overflow: "hidden",
                  shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
                }}
              >
                <View style={{ height: 80, backgroundColor: "#E8F5EE" }}>
                  <Image
                    source={item.image}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                </View>
                <View style={{ padding: 10 }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: "#111", marginBottom: 6, lineHeight: 16 }}>
                    {item.title}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 10, color: "#888" }}>{item.duration}</Text>
                    <TouchableOpacity style={{
                      width: 24, height: 24, borderRadius: 12,
                      backgroundColor: "#2D7A4F", alignItems: "center", justifyContent: "center",
                    }}>
                      <Ionicons name="play" size={10} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}