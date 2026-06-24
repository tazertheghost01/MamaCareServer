import React, { useState, useEffect } from "react";
import {
  View, Text, Image, TouchableOpacity,
  ScrollView, ActivityIndicator, Dimensions, Alert,
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
  const [archiving, setArchiving] = useState(false);
  const [archived, setArchived] = useState(false);

  useEffect(() => { loadAppointment(); }, []);

  const loadAppointment = async () => {
    setLoading(true);
    setArchived(false);
    try {
      const headers = await authHeaders();
      const res = await fetch(`${BASE_URL}/api/v1/appointments/upcoming/next`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.has_upcoming_appointment && data.appointment) {
          const appt = data.appointment;
          setAppointment(appt);
          if (appt.checklist?.length) {
            setChecklist(appt.checklist.map((c: any) => ({
              id: String(c.id),
              itemName: c.text,
              isCompleted: c.completed,
            })));
          } else {
            setChecklist(DEFAULT_CHECKLIST);
          }
        } else {
          setAppointment(null);
          setChecklist(DEFAULT_CHECKLIST);
        }
      }
    } catch (e) {}
    finally { setLoading(false); }
  };

  // Returns true if the appointment date+time is in the past
  const isAppointmentPast = () => {
    if (!appointment?.appointment_date || !appointment?.appointment_time) return false;
    const [y, mo, d] = appointment.appointment_date.split("-").map(Number);
    const [h, m] = appointment.appointment_time.split(":").map(Number);
    const apptDateTime = new Date(y, mo - 1, d, h, m);
    return apptDateTime < new Date();
  };

  const archiveAppointment = async (outcome: "done" | "not_done") => {
    if (!appointment?.id) return;
    setArchiving(true);
    try {
      const headers = await authHeaders();
      const endpoint = outcome === "done" ? "complete" : "missed";
      const res = await fetch(`${BASE_URL}/api/v1/appointments/${appointment.id}/${endpoint}`, {
        method: "PATCH", headers,
      });
      if (res.ok) {
        setArchived(true);
        setAppointment(null);
      }
    } catch (e) {}
    finally { setArchiving(false); }
  };

  const handleDone = () => {
    Alert.alert(
      "Great job! 🎉",
      "Mark this appointment as completed?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes, Done!", onPress: () => archiveAppointment("done") },
      ]
    );
  };

  const handleNotDone = () => {
    Alert.alert(
      "Missed appointment",
      "Mark this appointment as not attended?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes, Not Done", style: "destructive", onPress: () => archiveAppointment("not_done") },
      ]
    );
  };

  const toggleChecklist = async (itemId: string, current: boolean) => {
    if (!appointment?.id) return;
    setChecklist((prev) => prev.map((c) => c.id === itemId ? { ...c, isCompleted: !current } : c));
    try {
      const headers = await authHeaders();
      await fetch(`${BASE_URL}/api/v1/appointments/${appointment.id}/checklist/${itemId}`, {
        method: "PATCH", headers,
        body: JSON.stringify({ completed: !current }),
      });
    } catch (e) {}
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "--";
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-NG", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "--";
    const [h, m] = timeStr.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  const isPast = appointment ? isAppointmentPast() : false;

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
            {isPast ? "How did it go?" : "Upcoming Appointment"}
          </Text>

          {loading ? (
            <ActivityIndicator color="#2D7A4F" />
          ) : archived ? (
            /* Archived success state */
            <View style={{
              backgroundColor: "#F0FAF4", borderRadius: 16, padding: 24,
              alignItems: "center", borderWidth: 1, borderColor: "#D4EDDA",
            }}>
              <Ionicons name="checkmark-circle" size={44} color="#2D7A4F" />
              <Text style={{ fontSize: 15, color: "#2D7A4F", marginTop: 10, fontWeight: "700" }}>
                Appointment archived
              </Text>
              <Text style={{ fontSize: 12, color: "#888", marginTop: 4, textAlign: "center" }}>
                Well done! Add your next appointment below.
              </Text>
            </View>
          ) : appointment && isPast ? (
            /* Past appointment — Done / Not Done flow */
            <View style={{
              backgroundColor: "#fff", borderRadius: 16, padding: 16,
              borderWidth: 1, borderColor: "#FFE0B2",
              shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
            }}>
              {/* Appointment details */}
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#FFF3E0", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="time-outline" size={22} color="#E65100" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: "#E65100", marginBottom: 2, fontWeight: "600" }}>Past Appointment</Text>
                  <Text style={{ fontSize: 15, fontWeight: "800", color: "#111", marginBottom: 2 }}>
                    {appointment.appointment_type_label || "Appointment"}
                  </Text>
                  <Text style={{ fontSize: 13, color: "#555", marginBottom: 4 }}>
                    {formatDate(appointment.appointment_date)}
                  </Text>
                  <Text style={{ fontSize: 13, color: "#888" }}>
                    {formatTime(appointment.appointment_time)}
                    {appointment.location_name ? `  ·  ${appointment.location_name}` : ""}
                  </Text>
                </View>
              </View>

              {/* Divider */}
              <View style={{ height: 1, backgroundColor: "#F5F5F5", marginBottom: 16 }} />

              <Text style={{ fontSize: 13, color: "#555", marginBottom: 12, textAlign: "center" }}>
                Did you attend this appointment?
              </Text>

              {/* Done / Not Done buttons */}
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  onPress={handleDone}
                  disabled={archiving}
                  style={{
                    flex: 1, paddingVertical: 14, borderRadius: 14,
                    backgroundColor: "#2D7A4F", alignItems: "center",
                    flexDirection: "row", justifyContent: "center", gap: 6,
                    opacity: archiving ? 0.6 : 1,
                  }}
                >
                  <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>Done ✓</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleNotDone}
                  disabled={archiving}
                  style={{
                    flex: 1, paddingVertical: 14, borderRadius: 14,
                    backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#E53935",
                    alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6,
                    opacity: archiving ? 0.6 : 1,
                  }}
                >
                  <Ionicons name="close-circle-outline" size={18} color="#E53935" />
                  <Text style={{ color: "#E53935", fontWeight: "700", fontSize: 14 }}>Not Done</Text>
                </TouchableOpacity>
              </View>

              {archiving && (
                <ActivityIndicator color="#2D7A4F" style={{ marginTop: 12 }} />
              )}
            </View>
          ) : appointment ? (
            /* Upcoming appointment card */
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
                  <Text style={{ fontSize: 12, color: "#888", marginBottom: 2 }}>
                    {appointment.appointment_type_label || "Next Appointment"}
                  </Text>
                  <Text style={{ fontSize: 16, fontWeight: "800", color: "#111", marginBottom: 4 }}>
                    {formatDate(appointment.appointment_date)}
                  </Text>
                  <Text style={{ fontSize: 14, color: "#555", marginBottom: 6 }}>
                    {formatTime(appointment.appointment_time)}
                  </Text>
                  {appointment.location_name && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Ionicons name="location-outline" size={14} color="#888" />
                      <Text style={{ fontSize: 12, color: "#888", flex: 1 }}>{appointment.location_name}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Days to go */}
              {appointment.days_to_go != null && (
                <View style={{
                  marginTop: 12, backgroundColor: "#F0FAF4", borderRadius: 12, padding: 12,
                  flexDirection: "row", alignItems: "center", gap: 10,
                }}>
                  <Ionicons name="notifications-outline" size={18} color="#2D7A4F" />
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#2D7A4F" }}>
                      {appointment.days_to_go === 0 ? "Today!" : `${appointment.days_to_go} day${appointment.days_to_go === 1 ? "" : "s"} to go`}
                    </Text>
                    <Text style={{ fontSize: 11, color: "#888" }}>
                      We'll send you a reminder before your appointment.
                    </Text>
                  </View>
                </View>
              )}
            </View>
          ) : (
            /* No appointment */
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