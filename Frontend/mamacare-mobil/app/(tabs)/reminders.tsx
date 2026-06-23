import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, ScrollView,
  Switch, ActivityIndicator, Modal, TextInput, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import DateTimePickerSheet from "../../components/DateTimePickerSheet";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

async function authHeaders() {
  const token = await SecureStore.getItemAsync("accessToken");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

const APPOINTMENT_TYPES = ["CHECKUP", "ULTRASOUND", "BLOOD_TEST", "DELIVERY", "FOLLOW_UP"];
const REMINDER_OFFSETS = ["ON_TIME", "FIFTEEN_MINUTES_BEFORE", "THIRTY_MINUTES_BEFORE"];
const OFFSET_LABELS: Record<string, string> = {
  ON_TIME: "On time",
  FIFTEEN_MINUTES_BEFORE: "15 mins before",
  THIRTY_MINUTES_BEFORE: "30 mins before",
};

function mapAppointmentType(type: string) {
  switch (type) {
    case "CHECKUP":
      return "ANTENATAL";
    case "ULTRASOUND":
      return "ULTRASOUND";
    case "BLOOD_TEST":
      return "LAB_TEST";
    case "DELIVERY":
      return "OTHER";
    case "FOLLOW_UP":
      return "DOCTOR_CONSULTATION";
    default:
      return "OTHER";
  }
}

function getTrimester(weeks: number) {
  if (weeks <= 12) return "1st Trimester";
  if (weeks <= 26) return "2nd Trimester";
  return "3rd Trimester";
}

export default function RemindersScreen() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed">("upcoming");
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [walkFitness, setWalkFitness] = useState<any>(null);
  const [pregnancyWeeks, setPregnancyWeeks] = useState<number>(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<"appointment" | "medication">("appointment");
  const [showAppointmentDatePicker, setShowAppointmentDatePicker] = useState(false);
  const [showAppointmentTimePicker, setShowAppointmentTimePicker] = useState(false);
  const [showMedicationTimePicker, setShowMedicationTimePicker] = useState(false);

  const [apptForm, setApptForm] = useState({
    title: "", description: "", appointmentDate: "",
    appointmentTime: "09:00:00", appointmentType: "CHECKUP", reminderOffset: "ON_TIME",
  });
  const [medForm, setMedForm] = useState({
    medicationName: "", dosage: "", frequency: "DAILY",
    quantity: "", reminderTime: "08:00:00", notes: "",
  });

  const getFriendlySaveError = (data: any, fallback: string) => {
    const raw = [data?.message, data?.detail, data?.error, data?.errors?.[0]?.message]
      .find((value) => typeof value === "string" && value.trim().length > 0) as string | undefined;
    if (raw && /deserialize|LocalDate|date|time|format|parse/i.test(raw)) {
      return "Please choose the date and time using the picker.";
    }
    return fallback;
  };

  const formatAppointmentDate = () => {
    if (!apptForm.appointmentDate) return "Select date";
    return new Date(`${apptForm.appointmentDate}T12:00:00`).toLocaleDateString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatAppointmentTime = () => apptForm.appointmentTime ? apptForm.appointmentTime.slice(0, 5) : "Select time";
  const formatMedicationTime = () => medForm.reminderTime ? medForm.reminderTime.slice(0, 5) : "Select time";

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const headers = await authHeaders();
      const [apptRes, medRes, walkRes, pregnancyRes] = await Promise.all([
        fetch(`${BASE_URL}/api/v1/appointments/upcoming/next`, { headers }),
        fetch(`${BASE_URL}/api/v1/medications/today`, { headers }),
        fetch(`${BASE_URL}/api/v1/walk-exercise/home`, { headers }),
        fetch(`${BASE_URL}/api/v1/pregnancy/me`, { headers }),
      ]);

      if (apptRes.ok) {
        const data = await apptRes.json();
        setAppointments(data?.appointment ? [data.appointment] : []);
      }
      if (medRes.ok) {
        const data = await medRes.json();
        setMedications(Array.isArray(data) ? data : data.today_medications || []);
      }
      if (walkRes.ok) {
        const data = await walkRes.json();
        setWalkFitness(data);
      }
      if (pregnancyRes.ok) {
        const data = await pregnancyRes.json();
        setPregnancyWeeks(data.week || data.weeksOfPregnancy || data.gestationalWeek || 0);
      } else {
        // fallback from SecureStore
        const stored = await SecureStore.getItemAsync("pregnancyWeeks");
        if (stored) setPregnancyWeeks(parseInt(stored));
      }
    } catch (e) {}
    finally { setLoading(false); }
  };

  const handleAddAppointment = async () => {
    if (!apptForm.title || !apptForm.appointmentDate || !apptForm.appointmentTime) {
      Alert.alert("Missing fields", "Please select a title, date, and time.");
      return;
    }
    try {
      const headers = await authHeaders();
      const response = await fetch(`${BASE_URL}/api/v1/appointments/`, {
        method: "POST", headers,
        body: JSON.stringify({
          appointment_type: mapAppointmentType(apptForm.appointmentType),
          appointment_date: apptForm.appointmentDate,
          appointment_time: apptForm.appointmentTime,
          timezone: "Africa/Lagos",
          location_name: apptForm.title.trim(),
          notes: apptForm.description.trim() || undefined,
          reminder_enabled: true,
          reminder_offsets: [apptForm.reminderOffset],
        }),
      });
      if (!response.ok && response.status !== 201) {
        const data = await response.json().catch(() => ({}));
        Alert.alert("Could not save appointment", getFriendlySaveError(data, "Please check the selected date and time and try again."));
        return;
      }
      setShowAddModal(false);
      setApptForm({ title: "", description: "", appointmentDate: "", appointmentTime: "09:00:00", appointmentType: "CHECKUP", reminderOffset: "ON_TIME" });
      loadData();
    } catch (e) {
      Alert.alert("Could not save appointment", "Please check the selected date and time and try again.");
    }
  };

  const handleAddMedication = async () => {
    if (!medForm.medicationName || !medForm.reminderTime) {
      Alert.alert("Missing fields", "Please select a medication name and reminder time.");
      return;
    }
    try {
      const headers = await authHeaders();
      const today = new Date().toISOString().split("T")[0];
      const response = await fetch(`${BASE_URL}/api/v1/medications/`, {
        method: "POST", headers,
        body: JSON.stringify({
          medicine_name: medForm.medicationName,
          dose: medForm.dosage,
          frequency: medForm.frequency,
          start_date: today,
          timezone: "Africa/Lagos",
          reminder_enabled: true,
          reminder_offset: "ON_TIME",
          medication_time: medForm.reminderTime,
          notes: medForm.notes,
        }),
      });
      if (!response.ok && response.status !== 201) {
        const data = await response.json().catch(() => ({}));
        Alert.alert("Could not save medication", getFriendlySaveError(data, "Please check the selected time and try again."));
        return;
      }
      setShowAddModal(false);
      setMedForm({ medicationName: "", dosage: "", frequency: "DAILY", quantity: "", reminderTime: "08:00:00", notes: "" });
      loadData();
    } catch (e) {
      Alert.alert("Could not save medication", "Please check the selected time and try again.");
    }
  };

  const handleMarkMedTaken = async (medId: number) => {
    try {
      const headers = await authHeaders();
      await fetch(`${BASE_URL}/api/v1/medications/${medId}/taken`, { method: "PATCH", headers });
      loadData();
    } catch (e) {}
  };

  // Walk derived values — same logic as walk.tsx
  const goalMin = 15;
  const todayMin = walkFitness?.todaysSteps ? Math.floor(walkFitness.todaysSteps / 100) : 0;
  const walkProgress = Math.min(todayMin / goalMin, 1);
  const walkGoalMet = walkProgress >= 1;

  // Baby growth
  const trimester = pregnancyWeeks > 0 ? getTrimester(pregnancyWeeks) : null;

  const allReminders = [
    // Appointments
    ...appointments.map((a) => ({
      id: a.id,
      type: "appointment",
      icon: "calendar-outline" as const,
      title: a.appointmentTypeLabel || a.locationName || "Antenatal Appointment",
      date: a.appointmentDate
        ? new Date(`${a.appointmentDate}T${a.appointmentTime || "00:00:00"}`).toLocaleDateString("en-NG", {
            month: "short", day: "numeric", year: "numeric",
            hour: "2-digit", minute: "2-digit",
          })
        : "",
      sub: a.daysToGo != null ? `In ${a.daysToGo} days` : "",
      completed: a.status === "COMPLETED",
      color: "#F0FAF4",
      route: "/(track)/appointment",
      badge: null,
    })),

    // Medications
    ...medications.map((m) => ({
      id: m.medicationId || m.id,
      type: "medication",
      icon: "medical-outline" as const,
      title: m.medicine_name || m.medicationName,
      date: m.medication_time ? formatTime(m.medication_time) : (m.reminderTime ? formatTime(m.reminderTime) : ""),
      sub: "Daily reminder",
      completed: m.taken_today || m.isTaken || false,
      color: "#FFF8F0",
      route: "/(track)/medication",
      badge: !m.taken_today && !m.isTaken ? "Mark Taken" : null,
    })),

    // Walk — from API + goal progress
    {
      id: "walk",
      type: "walk",
      icon: "walk-outline" as const,
      title: "Walk & Exercise",
      date: walkFitness
        ? `${todayMin} / ${goalMin} min today`
        : "Start your walk session",
      sub: walkGoalMet
        ? "🎉 Goal achieved! Amazing work!"
        : walkFitness
        ? "Keep going! You are doing great."
        : "Let's move gently today.",
      completed: walkGoalMet,
      color: "#F0F4FF",
      route: "/(track)/walk",
      badge: null,
    },

    // Baby growth — week + trimester
    ...(pregnancyWeeks > 0
      ? [{
          id: "baby-growth",
          type: "baby-growth",
          icon: "heart-outline" as const,
          title: "Baby Growth",
          date: `Week ${pregnancyWeeks}`,
          sub: trimester ?? "",
          completed: false,
          color: "#FCE4EC",
          route: "/(track)/baby-growth",
          badge: null,
        }]
      : []),
  ];

  const filtered = activeTab === "upcoming"
    ? allReminders.filter((r) => !r.completed)
    : allReminders.filter((r) => r.completed);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F8F8" }}>
      <DateTimePickerSheet
        visible={showAppointmentDatePicker}
        mode="date"
        title="Select Appointment Date"
        initialValue={apptForm.appointmentDate}
        onClose={() => setShowAppointmentDatePicker(false)}
        onConfirm={(value) => {
          setApptForm({ ...apptForm, appointmentDate: value });
          setShowAppointmentDatePicker(false);
        }}
      />
      <DateTimePickerSheet
        visible={showAppointmentTimePicker}
        mode="time"
        title="Select Appointment Time"
        initialValue={apptForm.appointmentTime}
        onClose={() => setShowAppointmentTimePicker(false)}
        onConfirm={(value) => {
          setApptForm({ ...apptForm, appointmentTime: value });
          setShowAppointmentTimePicker(false);
        }}
      />
      <DateTimePickerSheet
        visible={showMedicationTimePicker}
        mode="time"
        title="Select Reminder Time"
        initialValue={medForm.reminderTime}
        onClose={() => setShowMedicationTimePicker(false)}
        onConfirm={(value) => {
          setMedForm({ ...medForm, reminderTime: value });
          setShowMedicationTimePicker(false);
        }}
      />

      {/* Add Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "90%" }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: "800", color: "#111" }}>Add Reminder</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Ionicons name="close" size={24} color="#555" />
                </TouchableOpacity>
              </View>

              {/* Appointment / Medication toggle */}
              <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
                {(["appointment", "medication"] as const).map((t) => (
                  <TouchableOpacity key={t} onPress={() => setAddType(t)} style={{
                    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center",
                    backgroundColor: addType === t ? "#2D7A4F" : "#F5F5F5",
                  }}>
                    <Text style={{ color: addType === t ? "#fff" : "#555", fontWeight: "700", fontSize: 13 }}>
                      {t === "appointment" ? "Appointment" : "Medication"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {addType === "appointment" ? (
                <View style={{ gap: 12 }}>
                  <FormField placeholder="Title" value={apptForm.title} onChangeText={(v: string) => setApptForm({ ...apptForm, title: v })} />
                  <FormField placeholder="Description" value={apptForm.description} onChangeText={(v: string) => setApptForm({ ...apptForm, description: v })} />
                  <TouchableOpacity
                    onPress={() => setShowAppointmentDatePicker(true)}
                    style={{
                      borderWidth: 1,
                      borderColor: "#EFEFEF",
                      borderRadius: 12,
                      backgroundColor: "#FAFAFA",
                      paddingHorizontal: 14,
                      height: 50,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ fontSize: 14, color: apptForm.appointmentDate ? "#333" : "#BDBDBD" }}>
                      {apptForm.appointmentDate ? formatAppointmentDate() : "Select appointment date"}
                    </Text>
                    <Ionicons name="calendar-outline" size={18} color="#2D7A4F" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShowAppointmentTimePicker(true)}
                    style={{
                      borderWidth: 1,
                      borderColor: "#EFEFEF",
                      borderRadius: 12,
                      backgroundColor: "#FAFAFA",
                      paddingHorizontal: 14,
                      height: 50,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ fontSize: 14, color: apptForm.appointmentTime ? "#333" : "#BDBDBD" }}>
                      {apptForm.appointmentTime ? formatAppointmentTime() : "Select appointment time"}
                    </Text>
                    <Ionicons name="time-outline" size={18} color="#2D7A4F" />
                  </TouchableOpacity>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: "#444" }}>Appointment Type</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {APPOINTMENT_TYPES.map((t) => (
                      <TouchableOpacity key={t} onPress={() => setApptForm({ ...apptForm, appointmentType: t })} style={{
                        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                        backgroundColor: apptForm.appointmentType === t ? "#2D7A4F" : "#F5F5F5",
                      }}>
                        <Text style={{ fontSize: 12, fontWeight: "600", color: apptForm.appointmentType === t ? "#fff" : "#555" }}>
                          {t.replace("_", " ")}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: "#444", marginTop: 4 }}>Reminder</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {REMINDER_OFFSETS.map((r) => (
                      <TouchableOpacity key={r} onPress={() => setApptForm({ ...apptForm, reminderOffset: r })} style={{
                        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                        backgroundColor: apptForm.reminderOffset === r ? "#2D7A4F" : "#F5F5F5",
                      }}>
                        <Text style={{ fontSize: 12, fontWeight: "600", color: apptForm.reminderOffset === r ? "#fff" : "#555" }}>
                          {OFFSET_LABELS[r]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <TouchableOpacity onPress={handleAddAppointment} style={{ backgroundColor: "#2D7A4F", borderRadius: 14, paddingVertical: 15, alignItems: "center", marginTop: 12 }}>
                    <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Save Appointment</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ gap: 12 }}>
                  <FormField placeholder="Medication name" value={medForm.medicationName} onChangeText={(v: string) => setMedForm({ ...medForm, medicationName: v })} />
                  <FormField placeholder="Dosage (e.g. 1 tablet)" value={medForm.dosage} onChangeText={(v: string) => setMedForm({ ...medForm, dosage: v })} />
                  <FormField placeholder="Quantity (e.g. 30)" value={medForm.quantity} onChangeText={(v: string) => setMedForm({ ...medForm, quantity: v })} keyboardType="numeric" />
                  <TouchableOpacity
                    onPress={() => setShowMedicationTimePicker(true)}
                    style={{
                      borderWidth: 1,
                      borderColor: "#EFEFEF",
                      borderRadius: 12,
                      backgroundColor: "#FAFAFA",
                      paddingHorizontal: 14,
                      height: 50,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ fontSize: 14, color: medForm.reminderTime ? "#333" : "#BDBDBD" }}>
                      {medForm.reminderTime ? formatMedicationTime() : "Select reminder time"}
                    </Text>
                    <Ionicons name="time-outline" size={18} color="#2D7A4F" />
                  </TouchableOpacity>
                  <FormField placeholder="Notes (optional)" value={medForm.notes} onChangeText={(v: string) => setMedForm({ ...medForm, notes: v })} />
                  <TouchableOpacity onPress={handleAddMedication} style={{ backgroundColor: "#2D7A4F", borderRadius: 14, paddingVertical: 15, alignItems: "center", marginTop: 12 }}>
                    <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Save Medication</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* Header */}
        <View style={{
          flexDirection: "row", alignItems: "center", justifyContent: "space-between",
          paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14, backgroundColor: "#fff",
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, justifyContent: "center" }}>
              <Ionicons name="arrow-back" size={24} color="#111" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#111" }}>Reminders</Text>
          </View>
        </View>

        {/* Alert toggle */}
        <View style={{
          flexDirection: "row", alignItems: "center", justifyContent: "space-between",
          marginHorizontal: 20, marginTop: 16, marginBottom: 16,
          backgroundColor: "#fff", borderRadius: 14, padding: 16,
          shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Ionicons name="notifications-outline" size={22} color="#888" />
            <View>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#111" }}>Reminder Alerts</Text>
              <Text style={{ fontSize: 12, color: "#888" }}>Get reminded about important things.</Text>
            </View>
          </View>
          <Switch
            value={alertsEnabled}
            onValueChange={setAlertsEnabled}
            trackColor={{ false: "#E0E0E0", true: "#2D7A4F" }}
            thumbColor="#fff"
          />
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: "row", marginHorizontal: 20, marginBottom: 16, backgroundColor: "#F5F5F5", borderRadius: 12, padding: 4 }}>
          {(["upcoming", "completed"] as const).map((tab) => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={{
              flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center",
              backgroundColor: activeTab === tab ? "#fff" : "transparent",
              shadowColor: activeTab === tab ? "#000" : "transparent",
              shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4,
              elevation: activeTab === tab ? 2 : 0,
            }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: activeTab === tab ? "#2D7A4F" : "#888" }}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Reminder cards */}
        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          {loading ? (
            <ActivityIndicator color="#2D7A4F" style={{ marginTop: 20 }} />
          ) : filtered.length === 0 ? (
            <View style={{ alignItems: "center", marginTop: 40 }}>
              <Ionicons name="calendar-outline" size={48} color="#CCC" />
              <Text style={{ fontSize: 15, color: "#AAA", marginTop: 12, fontWeight: "600" }}>
                No {activeTab} reminders
              </Text>
            </View>
          ) : (
            filtered.map((r: any, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => router.push(r.route as any)}
                style={{
                  flexDirection: "row", alignItems: "center", gap: 14,
                  backgroundColor: "#fff", borderRadius: 14, padding: 14,
                  shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
                }}
              >
                {/* Icon */}
                <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: r.color, alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name={r.icon} size={20} color="#2D7A4F" />
                </View>

                {/* Text */}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: "#111", marginBottom: 3 }}>{r.title}</Text>
                  <Text style={{ fontSize: 12, color: "#888" }}>{r.date}</Text>
                  {r.sub ? <Text style={{ fontSize: 11, color: "#AAA", marginTop: 1 }}>{r.sub}</Text> : null}
                </View>

                {/* Right side */}
                {r.type === "medication" && !r.completed && (
                  <TouchableOpacity
                    onPress={(e) => { e.stopPropagation(); handleMarkMedTaken(r.id); }}
                    style={{ backgroundColor: "#E8F5EE", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}
                  >
                    <Text style={{ fontSize: 11, color: "#2D7A4F", fontWeight: "700" }}>Taken</Text>
                  </TouchableOpacity>
                )}
                {r.completed
                  ? <Ionicons name="checkmark-circle" size={22} color="#2D7A4F" />
                  : r.type !== "medication"
                    ? <Ionicons name="chevron-forward" size={18} color="#CCC" />
                    : null
                }
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Add button */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            style={{
              backgroundColor: "#2D7A4F", borderRadius: 14, paddingVertical: 17,
              flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
              shadowColor: "#2D7A4F", shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
            }}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Add Reminder</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function formatTime(timeStr: string) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function FormField({ placeholder, value, onChangeText, keyboardType = "default" }: any) {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#BDBDBD"
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      style={{
        borderWidth: 1, borderColor: "#EFEFEF", borderRadius: 12,
        backgroundColor: "#FAFAFA", paddingHorizontal: 14, height: 50, fontSize: 14, color: "#333",
      }}
    />
  );
}
