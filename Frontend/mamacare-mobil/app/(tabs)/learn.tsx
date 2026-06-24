import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
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

const CATEGORIES = ["All", "Nutrition", "Medication", "Baby Growth", "Wellness"];

// Translate category backend/display names to localized translation keys
const getCategoryTranslationKey = (category: string) => {
  switch (category.toLowerCase()) {
    case "nutrition": return "categories.nutrition";
    case "medication": return "categories.medication";
    case "baby growth":
    case "baby_growth":
      return "categories.baby_growth";
    case "wellness": return "categories.wellness";
    default: return "categories.all";
  }
};

const getDisplayCategory = (cat: string) => {
  if (!cat) return "Wellness";
  switch (cat.toUpperCase().trim()) {
    case "NUTRITION": return "Nutrition";
    case "MEDICATION": return "Medication";
    case "BABY_GROWTH": return "Baby Growth";
    case "WELLNESS": return "Wellness";
    default: return cat;
  }
};

// Fallback learn items if API has no content yet or fails
const FALLBACK_ITEMS = [
  { id: "nutrition-fall", title: "Nutrition for you and baby", duration_seconds: 150, category: "NUTRITION" },
  { id: "stress-fall", title: "Managing stress the healthy way", duration_seconds: 105, category: "WELLNESS" },
  { id: "med-fall", title: "Water helps medicines move safely", duration_seconds: 90, category: "MEDICATION" },
  { id: "growth-fall", title: "Your baby can hear your voice", duration_seconds: 110, category: "BABY_GROWTH" },
];

async function authHeaders() {
  const token = await SecureStore.getItemAsync("accessToken");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

export default function LearnScreen() {
  const { t, i18n } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const [learnItems, setLearnItems] = useState<any[]>(FALLBACK_ITEMS);
  const [heroTitle, setHeroTitle] = useState("Small steps,\nhealthy you,\nhealthy baby.");
  const [heroAudioUrl, setHeroAudioUrl] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState("English");

  // Audio player state
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Tips section translated helper
  const TIPS = [
    { icon: "restaurant-outline", title: t("categories.nutrition"), desc: t("tip_nutrition_desc", "Eat healthy for you and baby.") },
    { icon: "water-outline", title: t("tip_hydration_title", "Stay Hydrated"), desc: t("tip_hydration_desc", "Drink enough water daily.") },
    { icon: "moon-outline", title: t("tip_rest_title", "Get Enough Rest"), desc: t("tip_rest_desc", "Good rest supports health.") },
    { icon: "happy-outline", title: t("categories.wellness"), desc: t("tip_stress_desc", "Stay calm and think positive.") },
  ];

  useEffect(() => {
    loadLanguageAndContent();
  }, []);

  useEffect(() => {
    const currentLangCode = i18n.language || "en";
    const mappedName = reverseLanguageMap[currentLangCode] || "English";
    setSelectedLang(mappedName);
    loadContent(currentLangCode);
  }, [i18n.language]);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const loadLanguageAndContent = async () => {
    setLoading(true);
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
            loadContent(langCode);
          }
        } else {
          loadContent(i18n.language || "en");
        }
      } else {
        loadContent(i18n.language || "en");
      }
    } catch (e) {
      console.log("Error loading preferences in learn screen", e);
      loadContent(i18n.language || "en");
    } finally {
      setLoading(false);
    }
  };

  const loadContent = async (langCode: string) => {
    try {
      const headers = await authHeaders();
      // Fetch dynamic translation metadata from getHome
      const homeResponse = await fetch(`${BASE_URL}/api/v1/learn/home?lang=${langCode}`, { headers });
      if (homeResponse.ok) {
        const data = await homeResponse.json();
        if (data.hero_message) {
          setHeroTitle(data.hero_message);
        }
      }

      // Fetch tips
      const tipsResponse = await fetch(`${BASE_URL}/api/v1/learn/tips?lang=${langCode}`, { headers });
      if (tipsResponse.ok) {
        const tipsData = await tipsResponse.json();
        if (Array.isArray(tipsData) && tipsData.length > 0) {
          setLearnItems(tipsData);
          // Set hero audio url to first tip's audio if available as a showcase
          if (tipsData[0] && (tipsData[0].audio_url || tipsData[0].audioUrl)) {
            setHeroAudioUrl(tipsData[0].audio_url || tipsData[0].audioUrl);
          }
        }
      }
    } catch (e) {
      console.log("Error loading learn screen content", e);
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

  const filtered = selectedCategory === "All"
    ? learnItems
    : learnItems.filter((i) => getDisplayCategory(i.category) === selectedCategory);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F8F8" }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* Header */}
        <View style={{
          flexDirection: "row", alignItems: "center", gap: 10,
          paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14,
          backgroundColor: "#fff",
        }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, justifyContent: "center" }}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#111" }}>{t("health_tips")}</Text>
        </View>

        {/* Hero banner */}
        <View style={{
          marginHorizontal: 20, marginTop: 16, marginBottom: 16,
          backgroundColor: "#F0FAF4", borderRadius: 20, padding: 20,
          flexDirection: "row", alignItems: "center",
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#2D7A4F", lineHeight: 26, marginBottom: 12 }}>
              {heroTitle}
            </Text>
            <TouchableOpacity 
              onPress={() => {
                if (heroAudioUrl) {
                  const audioKey = "hero-audio";
                  if (playingAudioId === audioKey) {
                    pauseSound();
                  } else {
                    playSound(heroAudioUrl, audioKey);
                  }
                }
              }}
              style={{
                flexDirection: "row", alignItems: "center", gap: 8,
                backgroundColor: "#fff", borderRadius: 25,
                paddingHorizontal: 14, paddingVertical: 8,
                alignSelf: "flex-start",
                shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
              }}
            >
              <Ionicons name={playingAudioId === "hero-audio" ? "pause" : "volume-medium-outline"} size={16} color="#2D7A4F" />
              <Text style={{ fontSize: 12, color: "#2D7A4F", fontWeight: "600" }}>
                {t("listen_in_lang", { lang: selectedLang })}
              </Text>
              <View style={{
                width: 24, height: 24, borderRadius: 12,
                backgroundColor: "#2D7A4F", alignItems: "center", justifyContent: "center",
              }}>
                <Ionicons name={playingAudioId === "hero-audio" ? "pause" : "play"} size={10} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
          <Image
            source={require("../../assets/images/9.png")}
            style={{ width: 110, height: 130 }}
            resizeMode="contain"
          />
        </View>

        {/* Category pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 20, marginBottom: 16 }}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={{
                paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                backgroundColor: selectedCategory === cat ? "#2D7A4F" : "#fff",
                borderWidth: 1,
                borderColor: selectedCategory === cat ? "#2D7A4F" : "#E8E8E8",
              }}
            >
              <Text style={{
                fontSize: 13, fontWeight: "600",
                color: selectedCategory === cat ? "#fff" : "#555",
              }}>
                {t(getCategoryTranslationKey(cat))}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {selectedCategory === "All" && (
          <>
            {/* Tips section */}
            <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: "#111", marginBottom: 12 }}>{t("tips")}</Text>
              <View style={{ gap: 10 }}>
                {TIPS.map((tip) => (
                  <TouchableOpacity
                    key={tip.title}
                    style={{
                      flexDirection: "row", alignItems: "center", gap: 14,
                      backgroundColor: "#fff", borderRadius: 14, padding: 14,
                      shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
                    }}
                  >
                    <View style={{
                      width: 40, height: 40, borderRadius: 12,
                      backgroundColor: "#F0FAF4", alignItems: "center", justifyContent: "center",
                    }}>
                      <Ionicons name={tip.icon as any} size={20} color="#2D7A4F" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: "700", color: "#111", marginBottom: 2 }}>
                        {tip.title}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#888" }}>{tip.desc}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#CCC" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Tip of the Day */}
            <View style={{
              marginHorizontal: 20, marginBottom: 20,
              backgroundColor: "#F0FAF4", borderRadius: 16, padding: 16,
              borderLeftWidth: 4, borderLeftColor: "#2D7A4F",
            }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Ionicons name="bulb-outline" size={18} color="#2D7A4F" />
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#2D7A4F" }}>{t("tips") + " " + t("days_to_go").substring(5)}</Text>
              </View>
              <Text style={{ fontSize: 13, color: "#555", lineHeight: 20 }}>
                {learnItems && learnItems[0] ? learnItems[0].title : "Eat a variety of fruits and vegetables everyday."}
              </Text>
            </View>
          </>
        )}

        {/* Learn & Listen list */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#111", marginBottom: 12 }}>
            {t("learn_and_listen")}
          </Text>
          {loading ? (
            <ActivityIndicator color="#2D7A4F" />
          ) : (
            <View style={{ gap: 10 }}>
              {filtered.map((item, i) => {
                const durationSecs = item.duration_seconds || item.durationSeconds || 75;
                const mins = Math.floor(durationSecs / 60);
                const secs = durationSecs % 60;
                const formattedDuration = `${mins}.${secs < 10 ? '0' : ''}${secs} min`;
                const audioUrl = item.audio_url || item.audioUrl;
                const isPlaying = playingAudioId === item.id;

                return (
                  <TouchableOpacity
                    key={i}
                    style={{
                      flexDirection: "row", alignItems: "center", gap: 12,
                      backgroundColor: "#fff", borderRadius: 14, padding: 12,
                      shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
                    }}
                  >
                    <View style={{
                      width: 56, height: 56, borderRadius: 12,
                      backgroundColor: "#E8F5EE", alignItems: "center", justifyContent: "center",
                      overflow: "hidden",
                    }}>
                      <Image
                        source={require("../../assets/images/9.png")}
                        style={{ width: 56, height: 56 }}
                        resizeMode="cover"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: "700", color: "#111", marginBottom: 4, lineHeight: 18 }}>
                        {item.title}
                      </Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Ionicons name="time-outline" size={12} color="#AAA" />
                        <Text style={{ fontSize: 11, color: "#AAA" }}>{formattedDuration}</Text>
                        <View style={{
                          backgroundColor: "#E8F5EE", borderRadius: 10,
                          paddingHorizontal: 8, paddingVertical: 2, marginLeft: 4,
                        }}>
                          <Text style={{ fontSize: 10, color: "#2D7A4F", fontWeight: "600" }}>
                            {t(getCategoryTranslationKey(getDisplayCategory(item.category)))}
                          </Text>
                        </View>
                      </View>
                    </View>
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
                        width: 32, height: 32, borderRadius: 16,
                        backgroundColor: "#2D7A4F", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <Ionicons name={isPlaying ? "pause" : "play"} size={13} color="#fff" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
