import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const LANGUAGES = ["English", "Pidgin", "Yoruba", "Hausa", "Igbo"];

const FEATURES = [
  {
    icon: "grid-outline" as const,
    title: "Track",
    desc: "Track your baby's growth and your pregnancy week by week.",
  },
  {
    icon: "notifications-outline" as const,
    title: "Remind",
    desc: "Get reminders for appointments, meds and important checkups.",
  },
  {
    icon: "book-outline" as const,
    title: "Learn",
    desc: "Learn about your body, nutrition, delivery and baby care.",
  },
];

export default function OnboardScreen() {
  const [selectedLang, setSelectedLang] = useState("English");

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 36 }}
      >
        {/* Skip */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            paddingHorizontal: 20,
            paddingTop: 16,
          }}
        >
          <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")}>
            <Text style={{ color: "#2D7A4F", fontSize: 15, fontWeight: "600" }}>
              Skip
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hero row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            marginTop: 6,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 27,
                fontWeight: "800",
                color: "#111",
                lineHeight: 36,
              }}
            >
              You are not alone{"\n"}on this journey.
            </Text>
          </View>
          {/* Pregnant woman image (2.PNG) */}
          <Image
            source={require("../assets/images/2.png")}
            style={{ width: 130, height: 175 }}
            resizeMode="contain"
          />
        </View>

        {/* Feature cards */}
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 16,
            marginTop: 16,
            gap: 10,
          }}
        >
          {FEATURES.map((f) => (
            <View
              key={f.title}
              style={{
                flex: 1,
                backgroundColor: "#F7FBF8",
                borderRadius: 14,
                padding: 12,
                borderWidth: 1,
                borderColor: "#E0F0E8",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: "#E8F5EE",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                }}
              >
                <Ionicons name={f.icon} size={20} color="#2D7A4F" />
              </View>
              <Text
                style={{
                  fontWeight: "700",
                  fontSize: 13,
                  color: "#111",
                  marginBottom: 4,
                  textAlign: "center",
                }}
              >
                {f.title}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: "#777",
                  textAlign: "center",
                  lineHeight: 16,
                }}
              >
                {f.desc}
              </Text>
            </View>
          ))}
        </View>

        {/* Language picker */}
        <View style={{ paddingHorizontal: 20, marginTop: 22 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#333",
              marginBottom: 12,
            }}
          >
            Choose your preferred language
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {LANGUAGES.map((lang) => {
              const selected = selectedLang === lang;
              return (
                <TouchableOpacity
                  key={lang}
                  onPress={() => setSelectedLang(lang)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                    paddingHorizontal: 16,
                    paddingVertical: 9,
                    borderRadius: 25,
                    borderWidth: 1.5,
                    borderColor: selected ? "#2D7A4F" : "#E0E0E0",
                    backgroundColor: selected ? "#EAF6EF" : "#FAFAFA",
                  }}
                >
                  {selected && (
                    <Ionicons name="checkmark-circle" size={15} color="#2D7A4F" />
                  )}
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: selected ? "700" : "500",
                      color: selected ? "#2D7A4F" : "#555",
                    }}
                  >
                    {lang}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Get Started */}
        <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
          <TouchableOpacity
            onPress={() => router.push("/(auth)/sign-up")}
            style={{
              backgroundColor: "#2D7A4F",
              borderRadius: 14,
              paddingVertical: 17,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              shadowColor: "#2D7A4F",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
              Get Started
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>

          {/* Already have account */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 18,
            }}
          >
            <Text style={{ color: "#999", fontSize: 14 }}>
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")}>
              <Text style={{ color: "#2D7A4F", fontWeight: "700", fontSize: 14 }}>
                Log in
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Page dots */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 20,
            gap: 6,
          }}
        >
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={{
                width: i === 0 ? 20 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i === 0 ? "#2D7A4F" : "#D5D5D5",
              }}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
