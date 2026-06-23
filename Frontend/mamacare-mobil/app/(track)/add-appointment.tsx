import React, { useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, ScrollView,
  Modal, ActivityIndicator, Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

async function authHeaders() {
  const token = await SecureStore.getItemAsync("accessToken");
  return { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
}

const TYPES = ["CHECKUP", "ULTRASOUND", "BLOOD_TEST", "DELIVERY", "FOLLOW_UP"];
const TYPE_LABELS: Record<string, string> = {
  CHECKUP: "Checkup", ULTRASOUND: "Ultrasound",
  BLOOD_TEST: "Blood Test", DELIVERY: "Delivery", FOLLOW_UP: "Follow Up",
};
const REMINDER_OPTIONS = [
  { label: "On time", value: "ON_TIME" },
  { label: "15 mins before", value: "FIFTEEN_MINUTES_BEFORE" },
  { label: "30 mins before", value: "THIRTY_MINUTES_BEFORE" },
];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function AddAppointmentScreen() {
  const [form, setForm] = useState({
    type: "CHECKUP",
    day: new Date().getDate(),
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    hour: 10, minute: 0, ampm: "AM",
    location: "",
    notes: "",
    reminder: "ON_TIME",
    reminderEnabled: true,
  });
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const toastAnim = useRef(new Animated.Value(-100)).current;
  const [toastMsg, setToastMsg] = useState("");
  const [toastSuccess, setToastSuccess] = useState(false);

  const showToast = (msg: string, success = false) => {
    setToastMsg(msg); setToastSuccess(success);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
      Animated.delay(3000),
      Animated.timing(toastAnim, { toValue: -100, duration: 350, useNativeDriver: true }),
    ]).start();
  };

  const buildDate = () => {
    const mm = String(form.month + 1).padStart(2, "0");
    const dd = String(form.day).padStart(2, "0");
    return `${form.year}-${mm}-${dd}`;
  };

  const buildTime = () => {
    const h = form.ampm === "PM" && form.hour !== 12 ? form.hour + 12 : form.ampm === "AM" && form.hour === 12 ? 0 : form.hour;
    const hh = String(h).padStart(2, "0");
    const min = String(form.minute).padStart(2, "0");
    return `${hh}:${min}:00`;
  };

  const mapType = (type: string) => {
    switch (type) {
      case "CHECKUP": return "ANTENATAL";
      case "ULTRASOUND": return "ULTRASOUND";
      case "BLOOD_TEST": return "LAB_TEST";
      case "DELIVERY": return "OTHER";
      case "FOLLOW_UP": return "DOCTOR_CONSULTATION";
      default: return "OTHER";
    }
  };

  const handleSave = async () => {
    if (!form.location.trim()) {
      showToast("Please add a location for the appointment.");
      return;
    }
    setSaving(true);
    try {
      const headers = await authHeaders();
      const response = await fetch(`${BASE_URL}/api/v1/appointments`, {
        method: "POST", headers,
        body: JSON.stringify({
          appointment_type: mapType(form.type),
          appointment_date: buildDate(),
          appointment_time: buildTime(),
          timezone: "Africa/Lagos",
          location_name: form.location.trim() || undefined,
          notes: form.notes.trim() || undefined,
          reminder_enabled: form.reminderEnabled,
          reminder_offsets: form.reminderEnabled ? [form.reminder] : [],
        }),
      });
      if (response.ok || response.status === 201) {
        showToast("Appointment saved!", true);
        setTimeout(() => router.back(), 1500);
      } else {
        const data = await response.json();
        showToast(data.message || "Failed to save appointment.");
      }
    } catch (e) {
      showToast("No connection. Please try again.");
    } finally { setSaving(false); }
  };

  const days = Array.from({ length: new Date(form.year, form.month + 1, 0).getDate() }, (_, i) => i + 1);
  const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() + i);
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = [0, 15, 30, 45];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Toast */}
      <Animated.View style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 999,
        transform: [{ translateY: toastAnim }],
        backgroundColor: toastSuccess ? "#2D7A4F" : "#C62828",
        paddingHorizontal: 20, paddingVertical: 14,
        flexDirection: "row", alignItems: "center", gap: 10, elevation: 10,
      }}>
        <Ionicons name={toastSuccess ? "checkmark-circle-outline" : "alert-circle-outline"} size={20} color="#fff" />
        <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600", flex: 1 }}>{toastMsg}</Text>
      </Animated.View>

      {/* Type picker modal */}
      <PickerModal visible={showTypePicker} onClose={() => setShowTypePicker(false)} title="Appointment Type">
        {TYPES.map((t) => (
          <TouchableOpacity key={t} onPress={() => { setForm({ ...form, type: t }); setShowTypePicker(false); }}
            style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F5F5F5" }}>
            <Text style={{ fontSize: 15, color: form.type === t ? "#2D7A4F" : "#333", fontWeight: form.type === t ? "700" : "500" }}>{TYPE_LABELS[t]}</Text>
            {form.type === t && <Ionicons name="checkmark" size={20} color="#2D7A4F" />}
          </TouchableOpacity>
        ))}
      </PickerModal>

      {/* Date picker modal */}
      <PickerModal visible={showDatePicker} onClose={() => setShowDatePicker(false)} title="Select Date">
        <Text style={pickerLabel}>Month</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {MONTHS.map((m, i) => (
              <TouchableOpacity key={m} onPress={() => setForm({ ...form, month: i })}
                style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: form.month === i ? "#2D7A4F" : "#F5F5F5" }}>
                <Text style={{ color: form.month === i ? "#fff" : "#555", fontWeight: "600" }}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <Text style={pickerLabel}>Day</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {days.map((d) => (
              <TouchableOpacity key={d} onPress={() => setForm({ ...form, day: d })}
                style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: form.day === d ? "#2D7A4F" : "#F5F5F5", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: form.day === d ? "#fff" : "#555", fontWeight: "600" }}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <Text style={pickerLabel}>Year</Text>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
          {years.map((y) => (
            <TouchableOpacity key={y} onPress={() => setForm({ ...form, year: y })}
              style={{ flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: form.year === y ? "#2D7A4F" : "#F5F5F5", alignItems: "center" }}>
              <Text style={{ color: form.year === y ? "#fff" : "#555", fontWeight: "600" }}>{y}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity onPress={() => setShowDatePicker(false)} style={confirmBtn}>
          <Text style={confirmBtnText}>Confirm</Text>
        </TouchableOpacity>
      </PickerModal>

      {/* Time picker modal */}
      <PickerModal visible={showTimePicker} onClose={() => setShowTimePicker(false)} title="Select Time">
        <Text style={pickerLabel}>Hour</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {hours.map((h) => (
              <TouchableOpacity key={h} onPress={() => setForm({ ...form, hour: h })}
                style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: form.hour === h ? "#2D7A4F" : "#F5F5F5", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: form.hour === h ? "#fff" : "#555", fontWeight: "600" }}>{h}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <Text style={pickerLabel}>Minute</Text>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
          {minutes.map((m) => (
            <TouchableOpacity key={m} onPress={() => setForm({ ...form, minute: m })}
              style={{ flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: form.minute === m ? "#2D7A4F" : "#F5F5F5", alignItems: "center" }}>
              <Text style={{ color: form.minute === m ? "#fff" : "#555", fontWeight: "600" }}>{String(m).padStart(2, "0")}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
          {["AM", "PM"].map((ap) => (
            <TouchableOpacity key={ap} onPress={() => setForm({ ...form, ampm: ap })}
              style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: form.ampm === ap ? "#2D7A4F" : "#F5F5F5", alignItems: "center" }}>
              <Text style={{ color: form.ampm === ap ? "#fff" : "#555", fontWeight: "700" }}>{ap}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity onPress={() => setShowTimePicker(false)} style={confirmBtn}>
          <Text style={confirmBtnText}>Confirm</Text>
        </TouchableOpacity>
      </PickerModal>

      {/* Header */}
      <View style={{
        flexDirection: "row", alignItems: "center", gap: 10,
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14,
        borderBottomWidth: 1, borderBottomColor: "#F5F5F5",
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, justifyContent: "center" }}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "800", color: "#111" }}>Add Appointment</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Title */}
        <View style={{ paddingHorizontal: 24, marginTop: 20, marginBottom: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#2D7A4F", marginBottom: 4 }}>
            Schedule your appointment
          </Text>
          <Text style={{ fontSize: 13, color: "#888" }}>
            Stay on track for a healthy you and baby
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 14 }}>

          {/* Appointment Type */}
          <FormRow icon="calendar-outline" label="Appointment Type" value={TYPE_LABELS[form.type]} onPress={() => setShowTypePicker(true)} />

          {/* Date */}
          <FormRow
            icon="calendar-outline"
            label="Date"
            value={`${MONTHS[form.month]} ${form.day}, ${form.year}`}
            onPress={() => setShowDatePicker(true)}
          />

          {/* Time */}
          <FormRow
            icon="time-outline"
            label="Time"
            value={`${form.hour}:${String(form.minute).padStart(2, "0")} ${form.ampm}`}
            onPress={() => setShowTimePicker(true)}
          />

          {/* Location */}
          <FormRow
            icon="location-outline"
            label="Location"
            value={form.location || "Federal Medical Center, Jabi, Abuja."}
            onPress={() => setShowLocationPicker(true)}
          />

          {/* Notes */}
          <FormRow
            icon="document-text-outline"
            label="Notes (Optional)"
            value={form.notes || "Add any notes or description"}
            onPress={() => {}}
            muted={!form.notes}
          />

          {/* Set Reminder */}
          <View style={{
            backgroundColor: "#F0FAF4", borderRadius: 14, padding: 16,
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Ionicons name="notifications-outline" size={20} color="#2D7A4F" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#111" }}>Set Reminder</Text>
                <Text style={{ fontSize: 12, color: "#888" }}>We will remind you before your appointment.</Text>
              </View>
              <TouchableOpacity
                onPress={() => setForm({ ...form, reminderEnabled: !form.reminderEnabled })}
                style={{
                  width: 44, height: 24, borderRadius: 12,
                  backgroundColor: form.reminderEnabled ? "#2D7A4F" : "#CCC",
                  justifyContent: "center",
                  paddingHorizontal: 2,
                }}
              >
                <View style={{
                  width: 20, height: 20, borderRadius: 10, backgroundColor: "#fff",
                  alignSelf: form.reminderEnabled ? "flex-end" : "flex-start",
                }} />
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {REMINDER_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setForm({ ...form, reminder: opt.value })}
                  style={{
                    flex: 1, paddingVertical: 8, borderRadius: 20, alignItems: "center",
                    backgroundColor: form.reminder === opt.value ? "#2D7A4F" : "#fff",
                    borderWidth: 1, borderColor: form.reminder === opt.value ? "#2D7A4F" : "#E0E0E0",
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: "600", color: form.reminder === opt.value ? "#fff" : "#555" }}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Save button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={{
              backgroundColor: saving ? "#7AAF90" : "#2D7A4F",
              borderRadius: 14, paddingVertical: 17, alignItems: "center", marginTop: 8,
              shadowColor: "#2D7A4F", shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
            }}
          >
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Save Appointment</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FormRow({ icon, label, value, onPress, muted = false }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={{
      flexDirection: "row", alignItems: "center", gap: 14,
      backgroundColor: "#fff", borderRadius: 14, padding: 14,
      borderWidth: 1, borderColor: "#F0F0F0",
      shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    }}>
      <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: "#E8F5EE", alignItems: "center", justifyContent: "center" }}>
        <Ionicons name={icon} size={19} color="#2D7A4F" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, color: "#888", marginBottom: 2 }}>{label}</Text>
        <Text style={{ fontSize: 14, fontWeight: muted ? "400" : "600", color: muted ? "#BBB" : "#111" }}>{value}</Text>
      </View>
      <Ionicons name="chevron-down" size={16} color="#CCC" />
    </TouchableOpacity>
  );
}

function PickerModal({ visible, onClose, title, children }: any) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "80%" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <Text style={{ fontSize: 17, fontWeight: "800", color: "#111" }}>{title}</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#555" /></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const pickerLabel = { fontSize: 12, fontWeight: "600" as const, color: "#888", marginBottom: 8 };
const confirmBtn = { backgroundColor: "#2D7A4F", borderRadius: 14, paddingVertical: 14, alignItems: "center" as const };
const confirmBtnText = { color: "#fff", fontWeight: "700" as const, fontSize: 15 };
