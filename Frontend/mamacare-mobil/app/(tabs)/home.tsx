import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, Image, TouchableOpacity,
  ScrollView, Dimensions, Modal, Animated, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useTranslation } from "react-i18next";
import { Audio } from "expo-av";
import { languageMap, reverseLanguageMap, normalizeLangName } from "../i18n";

const { width } = Dimensions.get("window");
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const LANGUAGES = ["English", "Pidgin", "Yoruba", "Hausa", "Igbo"];

const FALLBACK_ITEMS = [
  { id: "nutrition-fall", title: "Nutrition for you and baby", duration_seconds: 150, category: "NUTRITION" },
  { id: "stress-fall", title: "Managing stress the healthy way", duration_seconds: 105, category: "WELLNESS" },
  { id: "danger-fall", title: "Danger signs in pregnancy", duration_seconds: 90, category: "MEDICATION" },
  { id: "prep-fall", title: "Preparing for your baby's delivery", duration_seconds: 95, category: "HOSPITAL_PREPARATION" },
];



// ── Helper: get auth headers ─────────────────────────────
async function authHeaders() {
  const token = await SecureStore.getItemAsync("accessToken");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
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
  const [learnItems, setLearnItems] = useState<any[]>(FALLBACK_ITEMS);

  // Audio state
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [weeklyAudioUrl, setWeeklyAudioUrl] = useState<string | null>(null);

  const resolvePregnancyWeek = (data: any) => {
    const explicitWeek = Number(data?.week ?? data?.weeksOfPregnancy ?? data?.gestationalWeek);
    if (Number.isFinite(explicitWeek) && explicitWeek > 0) {
      return explicitWeek;
    }

    const dueDate = data?.dueDate || data?.due_date;
    if (dueDate) {
      const due = new Date(dueDate);
      if (!Number.isNaN(due.getTime())) {
        const diffDays = Math.max(0, Math.floor((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
        return Math.min(42, Math.max(1, Math.floor((280 - diffDays) / 7) + 1));
      }
    }

    return 0;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("good_morning");
    if (hour < 17) return t("good_afternoon");
    return t("good_evening");
  };

  // ── Load data ─────────────────────────────────────────
  useEffect(() => {
    loadUserData();
    loadPregnancyInfo();
    loadNextAppointment();
    loadTodayMeds();
    loadLanguageAndContent();
  }, []);

  useEffect(() => {
    const currentLangCode = i18n.language || "en";
    const mappedName = reverseLanguageMap[currentLangCode] || "English";
    setSelectedLang(mappedName);
    loadLearnItems(currentLangCode);
  }, [i18n.language]);

  useEffect(() => {
    if (pregnancyWeeks != null) {
      loadWeeklyAudio(pregnancyWeeks, i18n.language || "en");
    }
  }, [pregnancyWeeks, i18n.language]);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

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
        const week = resolvePregnancyWeek(data);
        setPregnancyWeeks(week > 0 ? week : null);
        // Calculate days to go from due date
        if (data.dueDate) {
          const due = new Date(data.dueDate);
          const today = new Date();
          const diff = Math.max(0, Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
          setDaysToGo(diff);
        }
        // Set trimester
        const weeks = week;
        if (weeks <= 12) setTrimester("1st Trimester");
        else if (weeks <= 26) setTrimester("2nd Trimester");
        else setTrimester("3rd Trimester");
      }
    } catch (e) {
      // Use locally stored data as fallback
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
        // API returns { has_upcoming_appointment, appointment: { ... } }
        if (data.has_upcoming_appointment && data.appointment) {
          setNextAppointment(data.appointment);
        } else {
          setNextAppointment(null);
        }
      }
    } catch (e) {}
  };

  const loadTodayMeds = async () => {
    try {
      const headers = await authHeaders();
      const response = await fetch(`${BASE_URL}/api/v1/medications/today`, { headers });
      if (response.ok) {
        const data = await response.json();
        // API returns { today_medications: [...], tips: [...] }
        const meds = Array.isArray(data.today_medications)
          ? data.today_medications
          : Array.isArray(data)
          ? data
          : [];
        setTodayMeds(meds.slice(0, 3));
      }
    } catch (e) {}
  };

  const loadLanguageAndContent = async () => {
    try {
      const headers = await authHeaders();
      const response = await fetch(`${BASE_URL}/api/v1/preferences`, { headers });
      if (response.ok) {
        const data = await response.json();
        if (data.language) {
          const mappedName = normalizeLangName(data.language);
          const langCode = languageMap[mappedName] || "en";
          if (i18n.language !== langCode) {
            i18n.changeLanguage(langCode);
          } else {
            loadLearnItems(langCode);
          }
        } else {
          loadLearnItems(i18n.language || "en");
        }
      } else {
        loadLearnItems(i18n.language || "en");
      }
    } catch (e) {
      console.log("Error loading preferences in home screen", e);
      loadLearnItems(i18n.language || "en");
    }
  };

  const loadLearnItems = async (langCode: string) => {
    try {
      const headers = await authHeaders();
      const response = await fetch(`${BASE_URL}/api/v1/learn/tips?lang=${langCode}`, { headers });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setLearnItems(data.slice(0, 4));
        } else {
          setLearnItems(FALLBACK_ITEMS);
        }
      } else {
        setLearnItems(FALLBACK_ITEMS);
      }
    } catch (e) {
      console.log("Error loading learn items in home screen", e);
      setLearnItems(FALLBACK_ITEMS);
    }
  };

  const loadWeeklyAudio = async (weeks: number, langCode: string) => {
    try {
      const headers = await authHeaders();
      const response = await fetch(`${BASE_URL}/api/v1/pregnancy/weekly-audio?week=${weeks}&lang=${langCode}`, { headers });
      if (response.ok) {
        const data = await response.json();
        if (data.audio_url || data.audioUrl) {
          setWeeklyAudioUrl(data.audio_url || data.audioUrl);
        } else {
          setWeeklyAudioUrl(null);
        }
      } else {
        setWeeklyAudioUrl(null);
      }
    } catch (e) {
      console.log("Error loading weekly audio url", e);
      setWeeklyAudioUrl(null);
    }
  };

  const handleLanguageChange = async (langName: string) => {
    setSelectedLang(langName);
    const langCode = languageMap[langName] || "en";
    i18n.changeLanguage(langCode);
    
    try {
      const headers = await authHeaders();
      await fetch(`${BASE_URL}/api/v1/preferences`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ language: langName.toUpperCase() }),
      });
    } catch (e) {
      console.log("Error updating language preference", e);
    }
  };

  const playSound = async (audioUrl: string, id: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      setPlayingAudioId(id);
      const fullUrl = audioUrl.startsWith("http") ? audioUrl : `${BASE_URL}${audioUrl}`;
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: fullUrl },
        { shouldPlay: true }
      );
      setSound(newSound);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && !status.isPlaying && status.didJustFinish) {
          setPlayingAudioId(null);
        }
      });
    } catch (e) {
      console.log("Error playing sound", e);
      setPlayingAudioId(null);
    }
  };

  const pauseSound = async () => {
    try {
      if (sound) {
        await sound.pauseAsync();
        setPlayingAudioId(null);
      }
    } catch (e) {
      console.log("Error pausing sound", e);
    }
  };

  const handleWeeklyAudioPress = () => {
    if (weeklyAudioUrl) {
      const audioId = "weekly-update";
      if (playingAudioId === audioId) {
        pauseSound();
      } else {
        playSound(weeklyAudioUrl, audioId);
      }
    }
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
    { icon: "person-outline", label: t("menu.me"), onPress: () => { closeMenu(); router.push("/(tabs)/profile"); } },
    { icon: "settings-outline", label: t("menu.settings"), onPress: () => { closeMenu(); } },
    { icon: "help-circle-outline", label: t("menu.help"), onPress: () => { closeMenu(); } },
    { icon: "information-circle-outline", label: t("menu.about"), onPress: () => { closeMenu(); } },
    { icon: "log-out-outline", label: t("menu.sign_out"), onPress: handleSignOut, color: "#E53935" },
  ];

  // ── Build reminders from API data ────────────────────
  const buildReminders = () => {
    const items: any[] = [];

    // Appointment reminder
    if (nextAppointment) {
      const daysToGoAppt = nextAppointment.days_to_go;
      items.push({
        icon: "calendar-outline",
        title: nextAppointment.appointment_type_label || "Appointment",
        sub: daysToGoAppt != null
          ? daysToGoAppt === 0 ? "Today!" : `In ${daysToGoAppt} day${daysToGoAppt === 1 ? "" : "s"}`
          : nextAppointment.appointment_date || "Upcoming",
        subColor: "#2D7A4F",
        bg: "#F0FAF4",
        route: "/(track)/appointment",
      });
    } else {
      items.push({
        icon: "calendar-outline",
        title: "Appointment",
        sub: "None scheduled",
        subColor: "#AAA",
        bg: "#F5F5F5",
        empty: true,
        route: "/(track)/appointment",
      });
    }

    // Medication reminders — one card per med (up to 3)
    if (todayMeds.length > 0) {
      todayMeds.forEach((med: any) => {
        items.push({
          icon: med.taken_today ? "checkmark-circle-outline" : "medical-outline",
          title: med.medicine_name || "Medication",
          sub: med.display_time || (med.medication_time ? med.medication_time.slice(0, 5) : "Today"),
          subColor: med.taken_today ? "#AAA" : "#D68000",
          subSub: med.taken_today ? "Taken ✓" : med.dose || "",
          bg: med.taken_today ? "#F5F5F5" : "#FFF8F0",
          route: "/(track)/medication",
        });
      });
    } else {
      items.push({
        icon: "medical-outline",
        title: "Medication",
        sub: "None today",
        subColor: "#AAA",
        bg: "#F5F5F5",
        empty: true,
        route: "/(track)/medication",
      });
    }

    // Walk reminder — always shown
    items.push({
      icon: "walk-outline",
      title: t("daily_walk"),
      sub: t("ten_min"),
      subSub: t("lets_move_gently"),
      bg: "#F0F4FF",
      route: "/(track)/walk",
    });

    return items;
  };

  const reminders = buildReminders();

  const trimesterKey = trimester === "1st Trimester" ? "1st" : trimester === "2nd Trimester" ? "2nd" : trimester === "3rd Trimester" ? "3rd" : null;
  const trimesterDisplay = trimesterKey ? t(`trimesters.${trimesterKey}` as any) : (trimester || "--");

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
              <Text style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{t("menu.member")}</Text>
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
            onPress={() => Alert.alert("MamaCare 💚", "You have new updates waiting for you!")}
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
            {getGreeting()}, {userName}!
          </Text>
        </View>

        {/* ── Pregnancy card ── */}
        <TouchableOpacity
          onPress={() => router.push("/(track)/baby-growth")}
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
            <Text style={{ color: "#A8D8BC", fontSize: 12, marginBottom: 4 }}>{t("you_are")}</Text>
            <Text style={{ color: "#fff", fontSize: 32, fontWeight: "800", lineHeight: 36 }}>
              {pregnancyWeeks != null ? `${pregnancyWeeks} ${t("weeks")}` : `-- ${t("weeks")}`}
            </Text>
            <Text style={{ color: "#A8D8BC", fontSize: 13, marginTop: 2 }}>{t("pregnant")}</Text>
            <Text style={{ color: "#A8D8BC", fontSize: 11, marginTop: 4 }}>
              {trimesterDisplay} · {daysToGo != null ? `${daysToGo} ${t("days_to_go")}` : `-- ${t("days_to_go")}`}
            </Text>

            {/* Audio pill */}
            <TouchableOpacity 
              onPress={handleWeeklyAudioPress}
              style={{
                marginTop: 12, backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: 25, paddingHorizontal: 14, paddingVertical: 10,
                flexDirection: "row", alignItems: "center", gap: 8,
                alignSelf: "flex-start",
              }}
            >
              <Ionicons name={playingAudioId === "weekly-update" ? "pause" : "volume-medium-outline"} size={16} color="#fff" />
              <View>
                <Text style={{ color: "#fff", fontSize: 11, fontWeight: "600" }}>
                  {t("listen_weekly_update")}
                </Text>
                <Text style={{ color: "#A8D8BC", fontSize: 10 }}>
                  {t("in_lang_duration", { lang: selectedLang })}
                </Text>
              </View>
              <Ionicons name={playingAudioId === "weekly-update" ? "pause-circle" : "play-circle-outline"} size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Baby image*/}
          <Image
            source={require("../../assets/images/8.png")}
            style={{ width: 100, height: 130, marginTop: -18 }}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* ── Today's Reminders ── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#111" }}>{t("todays_reminders")}</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/track")}>
              <Text style={{ color: "#2D7A4F", fontWeight: "600", fontSize: 13 }}>{t("view_all")}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {reminders.map((r: any, i: number) => (
              <TouchableOpacity
                key={i}
                onPress={() => router.push(r.route || "/(tabs)/track")}
                style={{
                  width: 140, backgroundColor: "#fff", borderRadius: 16,
                  padding: 14, alignItems: "center",
                  shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
                  opacity: r.empty ? 0.7 : 1,
                }}
              >
                <View style={{
                  width: 44, height: 44, borderRadius: 14,
                  backgroundColor: r.bg, alignItems: "center", justifyContent: "center", marginBottom: 8,
                }}>
                  <Ionicons name={r.icon as any} size={22} color={r.empty ? "#CCC" : "#2D7A4F"} />
                </View>
                <Text style={{ fontSize: 12, fontWeight: "700", color: r.empty ? "#AAA" : "#111", textAlign: "center", marginBottom: 6 }} numberOfLines={2}>
                  {r.title}
                </Text>
                <View style={{
                  backgroundColor: r.empty ? "#F0F0F0" : (r.subColor ? "#E8F5EE" : "#FFF0DC"),
                  borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3,
                }}>
                  <Text style={{ fontSize: 10, color: r.empty ? "#BBB" : (r.subColor || "#D68000"), fontWeight: "600" }}>
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

          {/* Quick Add Buttons */}
          <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
            <TouchableOpacity 
              onPress={() => router.push({ pathname: "/(tabs)/track", params: { action: "add_appointment" } })}
              style={{ flex: 1, backgroundColor: "#E8F5EE", paddingVertical: 12, borderRadius: 12, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 }}>
              <Ionicons name="calendar-outline" size={16} color="#2D7A4F" />
              <Text style={{ color: "#2D7A4F", fontWeight: "700", fontSize: 13 }}>+ Appointment</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => router.push({ pathname: "/(tabs)/track", params: { action: "add_medication" } })}
              style={{ flex: 1, backgroundColor: "#FFF8F0", paddingVertical: 12, borderRadius: 12, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 }}>
              <Ionicons name="medical-outline" size={16} color="#D68000" />
              <Text style={{ color: "#D68000", fontWeight: "700", fontSize: 13 }}>+ Medication</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions Grid */}
          <View style={{ marginTop: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#111", marginBottom: 12 }}>Explore Features</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              
              <TouchableOpacity 
                onPress={() => router.push("/(track)/walk")}
                style={{ flex: 1, minWidth: "45%", backgroundColor: "#F0F4FF", padding: 16, borderRadius: 16, alignItems: "center", gap: 8 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#D1E0FF", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="walk-outline" size={24} color="#2F5BCA" />
                </View>
                <Text style={{ color: "#111", fontWeight: "700", fontSize: 13 }}>Walk & Exercise</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => router.push("/(profile)/my-goals")}
                style={{ flex: 1, minWidth: "45%", backgroundColor: "#FFF4F0", padding: 16, borderRadius: 16, alignItems: "center", gap: 8 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#FFE0D1", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="flag-outline" size={24} color="#D84C10" />
                </View>
                <Text style={{ color: "#111", fontWeight: "700", fontSize: 13 }}>Daily Goals</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => router.push("/(tabs)/community")}
                style={{ flex: 1, minWidth: "45%", backgroundColor: "#F5F0FF", padding: 16, borderRadius: 16, alignItems: "center", gap: 8 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#E6D1FF", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="people-outline" size={24} color="#7B2FCA" />
                </View>
                <Text style={{ color: "#111", fontWeight: "700", fontSize: 13 }}>Community</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => router.push("/(track)/baby-growth")}
                style={{ flex: 1, minWidth: "45%", backgroundColor: "#F0FAF4", padding: 16, borderRadius: 16, alignItems: "center", gap: 8 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#D1F0DE", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="heart-outline" size={24} color="#2D7A4F" />
                </View>
                <Text style={{ color: "#111", fontWeight: "700", fontSize: 13 }}>Baby Growth</Text>
              </TouchableOpacity>

            </View>
          </View>
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
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#111" }}>{t("listen_in_your_language")}</Text>
              <Text style={{ fontSize: 11, color: "#888" }}>{t("choose_lang_desc")}</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang}
                onPress={() => handleLanguageChange(lang)}
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
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#111" }}>{t("learn_and_listen")}</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/learn")}>
              <Text style={{ color: "#2D7A4F", fontWeight: "600", fontSize: 13 }}>{t("view_all")}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {learnItems.map((item, i) => {
              const durationSecs = item.duration_seconds || item.durationSeconds || 75;
              const mins = Math.floor(durationSecs / 60);
              const secs = durationSecs % 60;
              const formattedDuration = `${mins}.${secs < 10 ? '0' : ''}${secs} min`;
              const audioUrl = item.audio_url || item.audioUrl;
              const isPlaying = playingAudioId === item.id;

              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => router.push("/(tabs)/learn")}
                  style={{
                    width: 130, backgroundColor: "#fff", borderRadius: 16, overflow: "hidden",
                    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
                  }}
                >
                  <View style={{ height: 80, backgroundColor: "#E8F5EE", alignItems: "center", justifyContent: "center" }}>
                    <Image
                      source={require("../../assets/images/9.png")}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={{ padding: 10 }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: "#111", marginBottom: 6, lineHeight: 16 }} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <Text style={{ fontSize: 10, color: "#888" }}>{formattedDuration}</Text>
                      <TouchableOpacity 
                        onPress={() => {
                          if (audioUrl) {
                            if (isPlaying) {
                              pauseSound();
                            } else {
                              playSound(audioUrl, item.id);
                            }
                          }
                        }}
                        style={{
                          width: 24, height: 24, borderRadius: 12,
                          backgroundColor: "#2D7A4F", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <Ionicons name={isPlaying ? "pause" : "play"} size={10} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
