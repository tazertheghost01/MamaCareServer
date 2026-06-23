import React, { useEffect, useMemo, useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type PickerMode = "date" | "time";

type Props = {
  visible: boolean;
  mode: PickerMode;
  title: string;
  initialValue?: string;
  onClose: () => void;
  onConfirm: (value: string) => void;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = [0, 15, 30, 45];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function parseDateValue(value?: string) {
  if (!value) return new Date();
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function parseTimeValue(value?: string) {
  if (!value) return { hour: 8, minute: 0, period: "AM" as const };
  const [rawHour = "8", rawMinute = "0"] = value.split(":");
  const hour24 = Number.parseInt(rawHour, 10);
  const minute = Number.parseInt(rawMinute, 10);
  if (Number.isNaN(hour24) || Number.isNaN(minute)) {
    return { hour: 8, minute: 0, period: "AM" as const };
  }
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return { hour, minute, period };
}

export default function DateTimePickerSheet({ visible, mode, title, initialValue, onClose, onConfirm }: Props) {
  const [selectedDate, setSelectedDate] = useState(() => parseDateValue(initialValue));
  const [selectedTime, setSelectedTime] = useState(() => parseTimeValue(initialValue));

  useEffect(() => {
    if (!visible) return;
    setSelectedDate(parseDateValue(initialValue));
    setSelectedTime(parseTimeValue(initialValue));
  }, [visible, initialValue]);

  const yearRange = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];
  }, []);

  const daysInMonth = useMemo(() => {
    return new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
  }, [selectedDate]);

  const confirmDate = () => {
    const year = selectedDate.getFullYear();
    const month = pad(selectedDate.getMonth() + 1);
    const day = pad(selectedDate.getDate());
    onConfirm(`${year}-${month}-${day}`);
  };

  const confirmTime = () => {
    const hour24 =
      selectedTime.period === "PM" && selectedTime.hour !== 12
        ? selectedTime.hour + 12
        : selectedTime.period === "AM" && selectedTime.hour === 12
          ? 0
          : selectedTime.hour;
    onConfirm(`${pad(hour24)}:${pad(selectedTime.minute)}:00`);
  };

  const content = mode === "date" ? (
    <View style={{ gap: 14 }}>
      <Text style={labelStyle}>Month</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {MONTHS.map((month, index) => (
            <TouchableOpacity
              key={month}
              onPress={() => setSelectedDate(new Date(selectedDate.getFullYear(), index, selectedDate.getDate()))}
              style={[chipStyle, selectedDate.getMonth() === index ? activeChipStyle : inactiveChipStyle]}
            >
              <Text style={selectedDate.getMonth() === index ? activeTextStyle : inactiveTextStyle}>{month}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Text style={labelStyle}>Day</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
            <TouchableOpacity
              key={day}
              onPress={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day))}
              style={[dayChipStyle, selectedDate.getDate() === day ? activeChipStyle : inactiveChipStyle]}
            >
              <Text style={selectedDate.getDate() === day ? activeTextStyle : inactiveTextStyle}>{day}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Text style={labelStyle}>Year</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {yearRange.map((year) => (
          <TouchableOpacity
            key={year}
            onPress={() => setSelectedDate(new Date(year, selectedDate.getMonth(), selectedDate.getDate()))}
            style={[yearChipStyle, selectedDate.getFullYear() === year ? activeChipStyle : inactiveChipStyle]}
          >
            <Text style={selectedDate.getFullYear() === year ? activeTextStyle : inactiveTextStyle}>{year}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  ) : (
    <View style={{ gap: 14 }}>
      <Text style={labelStyle}>Hour</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {HOURS.map((hour) => (
            <TouchableOpacity
              key={hour}
              onPress={() => setSelectedTime({ ...selectedTime, hour })}
              style={[timeChipStyle, selectedTime.hour === hour ? activeChipStyle : inactiveChipStyle]}
            >
              <Text style={selectedTime.hour === hour ? activeTextStyle : inactiveTextStyle}>{hour}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Text style={labelStyle}>Minute</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {MINUTES.map((minute) => (
          <TouchableOpacity
            key={minute}
            onPress={() => setSelectedTime({ ...selectedTime, minute })}
            style={[minuteChipStyle, selectedTime.minute === minute ? activeChipStyle : inactiveChipStyle]}
          >
            <Text style={selectedTime.minute === minute ? activeTextStyle : inactiveTextStyle}>{pad(minute)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        {["AM", "PM"].map((period) => (
          <TouchableOpacity
            key={period}
            onPress={() => setSelectedTime({ ...selectedTime, period: period as "AM" | "PM" })}
            style={[periodChipStyle, selectedTime.period === period ? activeChipStyle : inactiveChipStyle]}
          >
            <Text style={selectedTime.period === period ? activeTextStyle : inactiveTextStyle}>{period}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#111" }}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#555" />
            </TouchableOpacity>
          </View>

          {content}

          <TouchableOpacity
            onPress={mode === "date" ? confirmDate : confirmTime}
            style={{ backgroundColor: "#2D7A4F", borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 22 }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const labelStyle = { fontSize: 12, fontWeight: "600" as const, color: "#666" };
const chipStyle = { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 };
const dayChipStyle = { width: 42, height: 42, borderRadius: 21, alignItems: "center" as const, justifyContent: "center" as const };
const yearChipStyle = { flex: 1, alignItems: "center" as const };
const timeChipStyle = { width: 44, height: 44, borderRadius: 22, alignItems: "center" as const, justifyContent: "center" as const };
const minuteChipStyle = { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center" as const };
const periodChipStyle = { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" as const };
const activeChipStyle = { backgroundColor: "#2D7A4F" };
const inactiveChipStyle = { backgroundColor: "#F5F5F5" };
const activeTextStyle = { color: "#fff", fontWeight: "700" as const };
const inactiveTextStyle = { color: "#555", fontWeight: "600" as const };
