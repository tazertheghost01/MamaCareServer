import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, ScrollView,
  ActivityIndicator, Switch, Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

const { width } = Dimensions.get("window");
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

async function authHeaders() {
  const token = await SecureStore.getItemAsync("accessToken");
  return { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
}

const MED_TIPS = [
  { icon: "water-outline", title: "Take with water", desc: "It helps your body absorb it better." },
  { icon: "time-outline", title: "Be consistent", desc: "Try not to miss your daily dose." },
  { icon: "person-outline", title: "Talk to your doctor", desc: "If you experience any side effects." },
];

export default function MedicationScreen() {
  const [loading, setLoading] = useState(true);
  const [meds, setMeds] = useState<any[]>([]);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [totalToday, setTotalToday] = useState(0);
  const [takenToday, setTakenToday] = useState(0);

  useEffect(() => { loadMeds(); }, []);

  const loadMeds = async () => {
    try {
      const headers = await authHeaders();
      const res = await fetch(`${BASE_URL}/api/v1/medications/today`, { headers });
      if (res.ok) {
        const data = await res.json();
        const list = data.today_medications || [];
        const allMeds = Array.isArray(list) ? list : [];
        setMeds(allMeds);
        setTotalToday(allMeds.length);
        setTakenToday(allMeds.filter((m: any) => m.taken_today).length);
      }
    } catch (e) {}
    finally { setLoading(false); }
  };

  const markTaken = async (medId: number) => {
    setMeds((prev) => prev.map((m) => (m.id === medId) ? { ...m, taken_today: true } : m));
    setTakenToday((t) => t + 1);
    try {
      const headers = await authHeaders();
      await fetch(`${BASE_URL}/api/v1/medications/${medId}/taken`, { method: "PATCH", headers });
    } catch (e) {}
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View style={{
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14,
        borderBottomWidth: 1, borderBottomColor: "#F5F5F5",
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, justifyContent: "center" }}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={{ fontSize: 17, fontWeight: "800", color: "#111" }}>Medication</Text>
        <TouchableOpacity>
          <Ionicons name="arrow-forward" size={24} color="#111" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* Hero */}
        <View style={{
          marginHorizontal: 20, marginTop: 16, marginBottom: 20,
          backgroundColor: "#F0FAF4", borderRadius: 20, padding: 20,
          flexDirection: "row", alignItems: "center",
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: "800", color: "#2D7A4F", lineHeight: 28, marginBottom: 10 }}>
              Take your{"\n"}medicine, stay{"\n"}strong for you{"\n"}and your baby.
            </Text>
            <TouchableOpacity style={{
              flexDirection: "row", alignItems: "center", gap: 8,
              backgroundColor: "#fff", borderRadius: 25, paddingHorizontal: 14,
              paddingVertical: 8, alignSelf: "flex-start",
              shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
            }}>
              <Ionicons name="volume-medium-outline" size={15} color="#2D7A4F" />
              <Text style={{ fontSize: 12, color: "#2D7A4F", fontWeight: "600" }}>Listen in yoruba</Text>
              <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: "#2D7A4F", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="play" size={9} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
          {/* Medication icon placeholder */}
          <View style={{ width: 90, height: 100, alignItems: "center", justifyContent: "center" }}>
            <View style={{ width: 60, height: 70, borderRadius: 16, backgroundColor: "#2D7A4F", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="medical" size={32} color="#fff" />
            </View>
            <View style={{ flexDirection: "row", gap: 4, marginTop: 6 }}>
              {[0, 1].map((i) => (
                <View key={i} style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: "#E53935" }} />
              ))}
            </View>
          </View>
        </View>

        {/* Progress */}
        {totalToday > 0 && (
          <View style={{
            marginHorizontal: 20, marginBottom: 16, padding: 14,
            backgroundColor: "#F8F8F8", borderRadius: 14,
            flexDirection: "row", alignItems: "center", gap: 12,
          }}>
            <View style={{ flex: 1, height: 6, backgroundColor: "#E0E0E0", borderRadius: 3, overflow: "hidden" }}>
              <View style={{ height: "100%", width: `${(takenToday / totalToday) * 100}%`, backgroundColor: "#2D7A4F", borderRadius: 3 }} />
            </View>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#2D7A4F" }}>
              {takenToday}/{totalToday} taken
            </Text>
          </View>
        )}

        {/* Today's Medication */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text style={{ fontSize: 15, fontWeight: "800", color: "#111", marginBottom: 12 }}>
            Today's Medication
          </Text>
          {loading ? (
            <ActivityIndicator color="#2D7A4F" />
          ) : meds.length === 0 ? (
            <View style={{ backgroundColor: "#F8F8F8", borderRadius: 16, padding: 24, alignItems: "center" }}>
              <Ionicons name="medical-outline" size={40} color="#CCC" />
              <Text style={{ fontSize: 14, color: "#AAA", marginTop: 10, fontWeight: "600" }}>No medications today</Text>
              <Text style={{ fontSize: 12, color: "#BBB", marginTop: 4 }}>Add your first medication below</Text>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {meds.map((med, i) => (
                <View key={med.id || i} style={{
                  backgroundColor: "#fff", borderRadius: 14, padding: 14,
                  borderWidth: 1, borderColor: "#F0F0F0",
                  flexDirection: "row", alignItems: "center", gap: 14,
                  shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
                }}>
                  <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: "#E8F5EE", alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name="medical-outline" size={20} color="#2D7A4F" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: "#111", marginBottom: 2 }}>
                      {med.medicine_name}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#888" }}>
                      {med.dose} · {med.display_time || formatTime(med.medication_time)}
                    </Text>
                    {med.notes && <Text style={{ fontSize: 11, color: "#AAA", marginTop: 2 }}>{med.notes}</Text>}
                  </View>
                  {med.taken_today ? (
                    <View style={{ backgroundColor: "#E8F5EE", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Ionicons name="checkmark" size={14} color="#2D7A4F" />
                      <Text style={{ fontSize: 11, color: "#2D7A4F", fontWeight: "700" }}>Taken</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => markTaken(med.id)}
                      style={{ backgroundColor: "#2D7A4F", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}
                    >
                      <Text style={{ fontSize: 11, color: "#fff", fontWeight: "700" }}>Mark Taken</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              {/* View all link */}
              <TouchableOpacity style={{ alignItems: "center", paddingVertical: 8 }}>
                <Text style={{ color: "#2D7A4F", fontWeight: "600", fontSize: 13 }}>View all</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Medicine Reminder toggle */}
        <View style={{
          marginHorizontal: 20, marginBottom: 20,
          backgroundColor: "#F0FAF4", borderRadius: 14, padding: 14,
          flexDirection: "row", alignItems: "center", gap: 12,
        }}>
          <Ionicons name="notifications-outline" size={22} color="#2D7A4F" />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#111" }}>Medicine Reminder</Text>
            <Text style={{ fontSize: 12, color: "#888" }}>
              {meds[0]?.reminder_text || (meds[0]?.medication_time ? `We will remind you at ${meds[0].display_time || formatTime(meds[0].medication_time)} everyday` : "We will remind you at the set time everyday")}
            </Text>
          </View>
          <Switch value={reminderEnabled} onValueChange={setReminderEnabled} trackColor={{ false: "#E0E0E0", true: "#2D7A4F" }} thumbColor="#fff" />
        </View>

        {/* Tips */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text style={{ fontSize: 15, fontWeight: "800", color: "#111", marginBottom: 12 }}>
            Medication Tips
          </Text>
          <View style={{ gap: 10 }}>
            {MED_TIPS.map((tip) => (
              <View key={tip.title} style={{
                flexDirection: "row", alignItems: "center", gap: 14,
                backgroundColor: "#fff", borderRadius: 14, padding: 14,
                shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
              }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "#E8F5EE", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name={tip.icon as any} size={19} color="#2D7A4F" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#111", marginBottom: 2 }}>{tip.title}</Text>
                  <Text style={{ fontSize: 12, color: "#888" }}>{tip.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Add Medication button */}
        <View style={{ paddingHorizontal: 20 }}>
          <TouchableOpacity
            onPress={() => router.push("/(track)/add-medication")}
            style={{
              backgroundColor: "#2D7A4F", borderRadius: 14, paddingVertical: 17,
              flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
              shadowColor: "#2D7A4F", shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
            }}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Add Medication</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}