import React, { useState, useEffect } from "react";
import {
  View, Text, Image, TouchableOpacity,
  ScrollView, ActivityIndicator, Dimensions,
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

const DEFAULT_CHECKLIST = [
  { id: "1", itemName: "Prepare questions to ask your doctor.", isCompleted: true },
  { id: "2", itemName: "Take your hospital card.", isCompleted: true },
  { id: "3", itemName: "Come with previous test result (If there's any)", isCompleted: false },
];

export default function AppointmentScreen() {
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<any>(null);
  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST);

  useEffect(() => { loadAppointment(); }, []);

  const loadAppointment = async () => {
    try {
      const headers = await authHeaders();
      const res = await fetch(`${BASE_URL}/api/v1/appointments/upcoming/next`, { headers });
      if (res.ok) {
        const data = await res.json();
        setAppointment(data);
        if (data.checklistItems?.length) setChecklist(data.checklistItems);
      }
    } catch (e) {}
    finally { setLoading(false); }
  };

  const toggleChecklist = async (itemId: string, current: boolean) => {
    if (!appointment?.id) return;
    setChecklist((prev) => prev.map((c) => c.id === itemId ? { ...c, isCompleted: !current } : c));
    try {
      const headers = await authHeaders();
      await fetch(`${BASE_URL}/api/v1/appointments/${appointment.id}/checklist/${itemId}`, {
        method: "PATCH", headers,
        body: JSON.stringify({ isCompleted: !current }),
      });
    } catch (e) {}
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "--";
    return new Date(dateStr).toLocaleDateString("en-NG", {
      month: "long", day: "numeric", year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "--";
    return new Date(dateStr).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
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
        <Text style={{ fontSize: 17, fontWeight: "800", color: "#111" }}>Antenatal Appointment</Text>
        <TouchableOpacity>
          <Ionicons name="arrow-forward" size={24} color="#111" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* Hero */}
        <View style={{
          marginHorizontal: 20, marginTop: 16, marginBottom: 16,
          backgroundColor: "#F0FAF4", borderRadius: 20, padding: 20,
          flexDirection: "row", alignItems: "center",
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontWeight: "800", color: "#2D7A4F", lineHeight: 30, marginBottom: 8 }}>
              Your health,{"\n"}your baby's{"\n"}future.
            </Text>
            <Text style={{ fontSize: 13, color: "#555", marginBottom: 14 }}>
              Let's keep every appointment.
            </Text>
            <TouchableOpacity style={{
              flexDirection: "row", alignItems: "center", gap: 8,
              backgroundColor: "#fff", borderRadius: 25,
              paddingHorizontal: 14, paddingVertical: 8, alignSelf: "flex-start",
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
          <Image source={require("../../assets/images/6.png")} style={{ width: 110, height: 130 }} resizeMode="contain" />
        </View>

        {/* Upcoming Appointment */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text style={{ fontSize: 15, fontWeight: "800", color: "#111", marginBottom: 12 }}>
            Upcoming Appointment
          </Text>
          {loading ? (
            <ActivityIndicator color="#2D7A4F" />
          ) : appointment ? (
            <View style={{
              backgroundColor: "#fff", borderRadius: 16, padding: 16,
              borderWidth: 1, borderColor: "#F0F0F0",
              shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
            }}>
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 14 }}>
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#E8F5EE", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="calendar-outline" size={22} color="#2D7A4F" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: "#888", marginBottom: 2 }}>Next Appointment</Text>
                  <Text style={{ fontSize: 16, fontWeight: "800", color: "#111", marginBottom: 4 }}>
                    {formatDate(appointment.appointmentDate)}
                  </Text>
                  <Text style={{ fontSize: 14, color: "#555", marginBottom: 6 }}>
                    {formatTime(appointment.appointmentDate)}
                  </Text>
                  {appointment.description && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Ionicons name="location-outline" size={14} color="#888" />
                      <Text style={{ fontSize: 12, color: "#888", flex: 1 }}>{appointment.description}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Days to go */}
              {appointment.daysUntilAppointment != null && (
                <View style={{
                  marginTop: 12, backgroundColor: "#F0FAF4", borderRadius: 12, padding: 12,
                  flexDirection: "row", alignItems: "center", gap: 10,
                }}>
                  <Ionicons name="notifications-outline" size={18} color="#2D7A4F" />
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#2D7A4F" }}>
                      {appointment.daysUntilAppointment} days to go
                    </Text>
                    <Text style={{ fontSize: 11, color: "#888" }}>
                      We'll send you a reminder before your appointment.
                    </Text>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View style={{
              backgroundColor: "#F8F8F8", borderRadius: 16, padding: 24,
              alignItems: "center", borderWidth: 1, borderColor: "#F0F0F0",
            }}>
              <Ionicons name="calendar-outline" size={40} color="#CCC" />
              <Text style={{ fontSize: 14, color: "#AAA", marginTop: 10, fontWeight: "600" }}>
                No upcoming appointments
              </Text>
              <Text style={{ fontSize: 12, color: "#BBB", marginTop: 4 }}>
                Add your first appointment below
              </Text>
            </View>
          )}
        </View>

        {/* Checklist */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text style={{ fontSize: 15, fontWeight: "800", color: "#111", marginBottom: 12 }}>
            Appointment Checklist
          </Text>
          <View style={{ gap: 10 }}>
            {checklist.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => toggleChecklist(item.id, item.isCompleted)}
                style={{ flexDirection: "row", alignItems: "center", gap: 14 }}
              >
                <View style={{
                  width: 24, height: 24, borderRadius: 12, borderWidth: 2,
                  borderColor: item.isCompleted ? "#2D7A4F" : "#DDD",
                  backgroundColor: item.isCompleted ? "#2D7A4F" : "transparent",
                  alignItems: "center", justifyContent: "center",
                }}>
                  {item.isCompleted && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
                <Text style={{
                  fontSize: 14, color: item.isCompleted ? "#888" : "#111",
                  textDecorationLine: item.isCompleted ? "line-through" : "none",
                  flex: 1,
                }}>
                  {item.itemName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Buttons */}
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          <TouchableOpacity style={{
            borderRadius: 14, paddingVertical: 16, alignItems: "center",
            borderWidth: 1.5, borderColor: "#2D7A4F",
          }}>
            <Text style={{ color: "#2D7A4F", fontWeight: "700", fontSize: 15 }}>Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(track)/add-appointment")}
            style={{
              backgroundColor: "#2D7A4F", borderRadius: 14, paddingVertical: 16,
              flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
              shadowColor: "#2D7A4F", shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
            }}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Add Appointment</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}