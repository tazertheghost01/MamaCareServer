import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Audio } from "expo-av";
import { useTranslation } from "react-i18next";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

async function authHeaders() {
  const token = await SecureStore.getItemAsync("accessToken");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

export default function BabyGrowthScreen() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [growthData, setGrowthData] = useState<any>(null);
  
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadData();
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, []);

  const loadData = async () => {
    try {
      const headers = await authHeaders();
      const res = await fetch(`${BASE_URL}/api/v1/baby-growth/today/localized`, { headers });
      if (res.ok) {
        setGrowthData(await res.json());
      }
    } catch (e) {
      console.log("Failed to load baby growth", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAudioPress = async () => {
    if (!growthData?.audio_update?.audio_url) return;
    
    if (isPlaying) {
      if (sound) await sound.pauseAsync();
      setIsPlaying(false);
      return;
    }

    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
    } else {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: growthData.audio_update.audio_url.startsWith("http") ? growthData.audio_update.audio_url : `${BASE_URL}${growthData.audio_update.audio_url}` },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && !status.isPlaying && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F8F8", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2D7A4F" />
      </SafeAreaView>
    );
  }

  if (!growthData) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F8F8", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#888", marginTop: 20 }}>Unable to load baby growth data.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20, padding: 10 }}>
          <Text style={{ color: "#2D7A4F", fontWeight: "700" }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: "center" }}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#111", marginLeft: 10 }}>
            {growthData.screen_title || "Baby's Growth"}
          </Text>
        </View>

        {/* Hero Section */}
        <View style={{ paddingHorizontal: 20, marginTop: 10, alignItems: "center" }}>
          <View style={{ 
            width: 140, height: 140, borderRadius: 70, backgroundColor: "#F0FAF4", 
            justifyContent: "center", alignItems: "center", marginBottom: 20 
          }}>
            <Image 
              source={require("../../assets/images/8.png")} 
              style={{ width: 100, height: 100 }} 
              resizeMode="contain" 
            />
          </View>
          <Text style={{ fontSize: 24, fontWeight: "800", color: "#111", textAlign: "center", marginBottom: 8 }}>
            {growthData.pregnancy_status?.message || "Your Pregnancy"}
          </Text>
          <Text style={{ fontSize: 15, color: "#555", textAlign: "center", lineHeight: 22, paddingHorizontal: 20 }}>
            {growthData.hero_message}
          </Text>
        </View>

        {/* Audio Pill */}
        {growthData.audio_update?.audio_url && (
          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <TouchableOpacity 
              onPress={handleAudioPress}
              style={{
                backgroundColor: "#2D7A4F", borderRadius: 16, padding: 16,
                flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                shadowColor: "#2D7A4F", shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" }}>
                  <Ionicons name={isPlaying ? "pause" : "play"} size={20} color="#fff" />
                </View>
                <View>
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
                    {growthData.audio_update.label || "Listen to weekly update"}
                  </Text>
                  <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 }}>
                    {Math.floor(growthData.audio_update.duration_seconds / 60)}:{(growthData.audio_update.duration_seconds % 60).toString().padStart(2, '0')} min audio
                  </Text>
                </View>
              </View>
              <Ionicons name="volume-high-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Growth Stats */}
        {growthData.growth_this_week && (
          <View style={{ paddingHorizontal: 20, marginTop: 30 }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#111", marginBottom: 16 }}>Growth this week</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              <View style={{ flex: 1, minWidth: "45%", backgroundColor: "#F9F9F9", borderRadius: 16, padding: 16, alignItems: "center" }}>
                <Ionicons name="resize-outline" size={24} color="#2D7A4F" style={{ marginBottom: 8 }} />
                <Text style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Length</Text>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#111", textAlign: "center" }}>{growthData.growth_this_week.length_label}</Text>
              </View>
              <View style={{ flex: 1, minWidth: "45%", backgroundColor: "#F9F9F9", borderRadius: 16, padding: 16, alignItems: "center" }}>
                <Ionicons name="barbell-outline" size={24} color="#D68000" style={{ marginBottom: 8 }} />
                <Text style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Weight</Text>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#111", textAlign: "center" }}>{growthData.growth_this_week.weight_label}</Text>
              </View>
              {growthData.growth_this_week.heartbeat_label && (
                <View style={{ width: "100%", backgroundColor: "#FFF5F5", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Ionicons name="heart" size={24} color="#E53935" />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, color: "#888", marginBottom: 2 }}>Heartbeat</Text>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: "#111" }}>{growthData.growth_this_week.heartbeat_label}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Happenings */}
        {growthData.happenings && growthData.happenings.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginTop: 30 }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#111", marginBottom: 16 }}>What's happening</Text>
            <View style={{ gap: 12 }}>
              {growthData.happenings.map((happening: any, index: number) => (
                <View key={index} style={{ flexDirection: "row", gap: 12, backgroundColor: "#F9F9F9", padding: 16, borderRadius: 16 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#2D7A4F", marginTop: 6 }} />
                  <Text style={{ flex: 1, fontSize: 14, color: "#333", lineHeight: 22 }}>{happening.text}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Disclaimer */}
        {growthData.disclaimer && (
          <View style={{ paddingHorizontal: 20, marginTop: 30 }}>
            <Text style={{ fontSize: 12, color: "#AAA", textAlign: "center", fontStyle: "italic", lineHeight: 18 }}>
              {growthData.disclaimer}
            </Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
