import React, { useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Modal, ActivityIndicator, Animated,
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

const FREQUENCIES = ["DAILY", "WEEKLY", "AS_NEEDED"];
const FREQ_LABELS: Record<string, string> = {
  DAILY: "Daily", WEEKLY: "Weekly", AS_NEEDED: "As Needed",
};
const REMINDER_OPTIONS = [
  { label: "On time", value: "ON_TIME" },
  { label: "15 mins before", value: "FIFTEEN_MINUTES_BEFORE" },
  { label: "30 mins before", value: "THIRTY_MINUTES_BEFORE" },
];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = [0, 15, 30, 45];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function AddMedicationScreen() {
  const [form, setForm] = useState({
    medicationName: "",
    dosage: "",
    frequency: "DAILY",
    hour: 8, minute: 0, ampm: "AM",
    startDay: new Date().getDate(),
    startMonth: new Date().getMonth(),
    startYear: new Date().getFullYear(),
    notes: "",
    reminder: "ON_TIME",
  });
  const [showFreqPicker, setShowFreqPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const buildTime = () => {
    const h = form.ampm === "PM" && form.hour !== 12 ? form.hour + 12 : form.ampm === "AM" && form.hour === 12 ? 0 : form.hour;
    return `${String(h).padStart(2, "0")}:${String(form.minute).padStart(2, "0")}:00`;
  };

  const buildDate = () => {
    const mm = String(form.startMonth + 1).padStart(2, "0");
    const dd = String(form.startDay).padStart(2, "0");
    return `${form.startYear}-${mm}-${dd}`;
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.medicationName.trim()) e.medicationName = "Medication name is required.";
    if (!form.dosage.trim()) e.dosage = "Dosage is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const headers = await authHeaders();

      const response = await fetch(`${BASE_URL}/api/v1/medications`, {
        method: "POST", headers,
        body: JSON.stringify({
          medicine_name: form.medicationName.trim(),
          dose: form.dosage.trim(),
          frequency: form.frequency,
          medication_time: buildTime(),
          start_date: buildDate(),
          timezone: "Africa/Lagos",
          reminder_enabled: true,
          reminder_offset: form.reminder,
          notes: form.notes.trim() || undefined,
        }),
      });
      if (response.ok || response.status === 201) {
        showToast("Medication saved!", true);
        setTimeout(() => router.back(), 1500);
      } else {
        const data = await response.json();
        showToast(data.message || "Failed to save medication.");
      }
    } catch (e) {
      showToast("No connection. Please try again.");
    } finally { setSaving(false); }
  };

  const days = Array.from({ length: new Date(form.startYear, form.startMonth + 1, 0).getDate() }, (_, i) => i + 1);
  const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() + i);

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

      {/* Frequency picker */}
      <Modal visible={showFreqPicker} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Text style={{ fontSize: 17, fontWeight: "800", color: "#111" }}>Select Frequency</Text>
              <TouchableOpacity onPress={() => setShowFreqPicker(false)}><Ionicons name="close" size={24} color="#555" /></TouchableOpacity>
            </View>
            {FREQUENCIES.map((f) => (
              <TouchableOpacity key={f} onPress={() => { setForm({ ...form, frequency: f }); setShowFreqPicker(false); }}
                style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F5F5F5" }}>
                <Text style={{ fontSize: 15, color: form.frequency === f ? "#2D7A4F" : "#333", fontWeight: form.frequency === f ? "700" : "500" }}>{FREQ_LABELS[f]}</Text>
                {form.frequency === f && <Ionicons name="checkmark" size={20} color="#2D7A4F" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Time picker */}
      <Modal visible={showTimePicker} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Text style={{ fontSize: 17, fontWeight: "800", color: "#111" }}>Select Time</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}><Ionicons name="close" size={24} color="#555" /></TouchableOpacity>
            </View>
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#888", marginBottom: 8 }}>Hour</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {HOURS.map((h) => (
                  <TouchableOpacity key={h} onPress={() => setForm({ ...form, hour: h })}
                    style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: form.hour === h ? "#2D7A4F" : "#F5F5F5", alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ color: form.hour === h ? "#fff" : "#555", fontWeight: "600" }}>{h}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#888", marginBottom: 8 }}>Minute</Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
              {MINUTES.map((m) => (
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
            <TouchableOpacity onPress={() => setShowTimePicker(false)} style={{ backgroundColor: "#2D7A4F", borderRadius: 14, paddingVertical: 14, alignItems: "center" }}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "#F5F5F5" }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, justifyContent: "center" }}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "800", color: "#111" }}>Add Medication</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 40 }}>

        <View style={{ paddingHorizontal: 24, marginTop: 20, marginBottom: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#2D7A4F", marginBottom: 4 }}>Add your medicine</Text>
          <Text style={{ fontSize: 13, color: "#888" }}>Get reminders and take your medicine on time.</Text>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 16 }}>

          {/* Medicine Name */}
          <View>
            <Text style={labelStyle}>Medicine Name</Text>
            <View style={[inputRow, errors.medicationName ? { borderColor: "#E53935" } : {}]}>
              <View style={inputIcon}><Ionicons name="medical-outline" size={18} color="#2D7A4F" /></View>
              <TextInput
                placeholder="e.g Folic Acid"
                placeholderTextColor="#BDBDBD"
                value={form.medicationName}
                onChangeText={(v) => { setForm({ ...form, medicationName: v }); setErrors({ ...errors, medicationName: "" }); }}
                style={{ flex: 1, fontSize: 14, color: "#333" }}
              />
            </View>
            {errors.medicationName ? <Text style={errorStyle}>{errors.medicationName}</Text> : null}
          </View>

          {/* Dose */}
          <View>
            <Text style={labelStyle}>Dose</Text>
            <View style={[inputRow, errors.dosage ? { borderColor: "#E53935" } : {}]}>
              <View style={inputIcon}><Ionicons name="medical-outline" size={18} color="#2D7A4F" /></View>
              <TextInput
                placeholder="e.g 1 tablet"
                placeholderTextColor="#BDBDBD"
                value={form.dosage}
                onChangeText={(v) => { setForm({ ...form, dosage: v }); setErrors({ ...errors, dosage: "" }); }}
                style={{ flex: 1, fontSize: 14, color: "#333" }}
              />
            </View>
            {errors.dosage ? <Text style={errorStyle}>{errors.dosage}</Text> : null}
          </View>

          {/* Frequency */}
          <View>
            <Text style={labelStyle}>Frequency</Text>
            <TouchableOpacity onPress={() => setShowFreqPicker(true)} style={inputRow}>
              <View style={inputIcon}><Ionicons name="time-outline" size={18} color="#2D7A4F" /></View>
              <Text style={{ flex: 1, fontSize: 14, color: "#333" }}>{FREQ_LABELS[form.frequency]}</Text>
              <Ionicons name="chevron-down" size={16} color="#CCC" />
            </TouchableOpacity>
          </View>

          {/* Time */}
          <View>
            <Text style={labelStyle}>Time</Text>
            <TouchableOpacity onPress={() => setShowTimePicker(true)} style={inputRow}>
              <View style={inputIcon}><Ionicons name="time-outline" size={18} color="#2D7A4F" /></View>
              <Text style={{ flex: 1, fontSize: 14, color: "#333" }}>
                {`${form.hour}:${String(form.minute).padStart(2, "0")} ${form.ampm}`}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#CCC" />
            </TouchableOpacity>
          </View>

          {/* Notes */}
          <View>
            <Text style={labelStyle}>Start Date (Optional)</Text>
            <View style={inputRow}>
              <View style={inputIcon}><Ionicons name="document-text-outline" size={18} color="#2D7A4F" /></View>
              <TextInput
                placeholder="Add your notes or instruction"
                placeholderTextColor="#BDBDBD"
                value={form.notes}
                onChangeText={(v) => setForm({ ...form, notes: v })}
                style={{ flex: 1, fontSize: 14, color: "#333" }}
              />
            </View>
          </View>

          {/* Set Reminder */}
          <View style={{ backgroundColor: "#F0FAF4", borderRadius: 14, padding: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Ionicons name="notifications-outline" size={20} color="#2D7A4F" />
              <View>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#111" }}>Set Reminder</Text>
                <Text style={{ fontSize: 12, color: "#888" }}>We will remind you when it is time...</Text>
              </View>
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
              : <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Save Medication</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const labelStyle = { fontSize: 13, fontWeight: "600" as const, color: "#444", marginBottom: 8 };
const inputRow = {
  flexDirection: "row" as const, alignItems: "center" as const,
  borderWidth: 1, borderColor: "#EFEFEF", borderRadius: 12,
  backgroundColor: "#FAFAFA", paddingRight: 14, height: 52, gap: 0,
};
const inputIcon = {
  width: 48, height: 52, alignItems: "center" as const, justifyContent: "center" as const,
};
const errorStyle = { color: "#E53935", fontSize: 12, marginTop: 4, marginLeft: 4 };
