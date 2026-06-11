import React, { useState } from "react";
import {
  View, Text, Image, TouchableOpacity,
  ScrollView, Dimensions, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const LANGUAGES = ["English", "Pidgin", "Yoruba", "Hausa", "Igbo"];

const REMINDERS = [
  { icon: "calendar-outline", title: "Antenatal\nAppointment", sub: "In 3 days", subColor: "#2D7A4F", bg: "#F0FAF4" },
  { icon: "medical-outline", title: "Medication", sub: "9:00 AM", subSub: "Daily reminder", bg: "#FFF8F0" },
  { icon: "walk-outline", title: "Daily Walk", sub: "10 min", subSub: "Lets move gently", bg: "#F0F4FF" },
];

const LEARN_ITEMS = [
  { title: "Nutrition for you and baby", duration: "2.30 min" },
  { title: "Managing stress the healthy way", duration: "1.45 min" },
  { title: "Danger signs in pregnancy", duration: "1.30 min" },
  { title: "Preparing for your baby's delivery", duration: "1.35" },
];

export default function HomeScreen() {
  const [selectedLang, setSelectedLang] = useState("English");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F8F8" }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

        {/* Top bar */}
        <View style={{
          flexDirection: "row", justifyContent: "space-between",
          alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10,
          backgroundColor: "#fff",
        }}>
          <TouchableOpacity onPress={() => Alert.alert("Menu", "Coming soon")}>
            <Ionicons name="menu-outline" size={26} color="#111" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Alert.alert("Notifications", "No new notifications")}
            style={{ position: "relative" }}
          >
            <Ionicons name="notifications-outline" size={26} color="#111" />
            <View style={{
              position: "absolute", top: 0, right: 0,
              width: 8, height: 8, borderRadius: 4, backgroundColor: "#E53935",
            }} />
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12, backgroundColor: "#fff" }}>
          <Text style={{ fontSize: 22, fontWeight: "800", color: "#111" }}>
            {greeting}, Ibukun!
          </Text>
        </View>

        {/* Pregnancy card */}
        <TouchableOpacity
          onPress={() => Alert.alert("Pregnancy Details", "Week 24 — 2nd Trimester\n112 days to go")}
          style={{
            marginHorizontal: 20, marginBottom: 16,
            backgroundColor: "#2D7A4F", borderRadius: 20, padding: 18,
            flexDirection: "row", alignItems: "center",
            shadowColor: "#2D7A4F", shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#A8D8BC", fontSize: 12, marginBottom: 4 }}>You are</Text>
            <Text style={{ color: "#fff", fontSize: 32, fontWeight: "800", lineHeight: 36 }}>24 weeks</Text>
            <Text style={{ color: "#A8D8BC", fontSize: 13, marginTop: 2 }}>Pregnant</Text>
            <Text style={{ color: "#A8D8BC", fontSize: 11, marginTop: 4 }}>
              2nd trimester · 112 days to go
            </Text>

            {/* Audio update pill */}
            <TouchableOpacity
              onPress={() => Alert.alert("Audio", "Playing weekly update in " + selectedLang)}
              style={{
                marginTop: 12, backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: 25, paddingHorizontal: 14, paddingVertical: 10,
                flexDirection: "row", alignItems: "center", gap: 8,
                alignSelf: "flex-start",
              }}
            >
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

          {/* Baby embryo image */}
          <Image
            source={require("../../assets/images/8.png")}
            style={{ width: 90, height: 110 }}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Today's Reminders */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#111" }}>Today's Reminders</Text>
            <TouchableOpacity onPress={() => Alert.alert("Reminders", "View all reminders")}>
              <Text style={{ color: "#2D7A4F", fontWeight: "600", fontSize: 13 }}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {REMINDERS.map((r, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => Alert.alert(r.title.replace("\n", " "), r.sub)}
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

        {/* Listen in your language */}
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
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#111" }}>
                Listen in your language
              </Text>
              <Text style={{ fontSize: 11, color: "#888" }}>
                Choose your preferred language for audio content.
              </Text>
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
                <Text style={{
                  fontSize: 12, fontWeight: "600",
                  color: selectedLang === lang ? "#fff" : "#555",
                }}>
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Learn & Listen */}
        <View style={{ paddingHorizontal: 20 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#111" }}>Learn & Listen</Text>
            <TouchableOpacity onPress={() => Alert.alert("Learn", "View all lessons")}>
              <Text style={{ color: "#2D7A4F", fontWeight: "600", fontSize: 13 }}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {LEARN_ITEMS.map((item, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => Alert.alert(item.title, "Duration: " + item.duration)}
                style={{
                  width: 130, backgroundColor: "#fff", borderRadius: 16, overflow: "hidden",
                  shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
                }}
              >
                <View style={{ height: 80, backgroundColor: "#E8F5EE", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="book-outline" size={32} color="#2D7A4F" />
                </View>
                <View style={{ padding: 10 }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: "#111", marginBottom: 6, lineHeight: 16 }}>
                    {item.title}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 10, color: "#888" }}>{item.duration}</Text>
                    <TouchableOpacity
                      onPress={() => Alert.alert("Playing", item.title)}
                      style={{
                        width: 24, height: 24, borderRadius: 12,
                        backgroundColor: "#2D7A4F", alignItems: "center", justifyContent: "center",
                      }}
                    >
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
