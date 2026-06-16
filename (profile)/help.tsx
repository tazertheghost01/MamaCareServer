import React, { useState } from "react";
import {
  View, Text, Image, TouchableOpacity,
  ScrollView, Modal, TextInput, ActivityIndicator,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useRef } from "react";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

async function authHeaders() {
  const token = await SecureStore.getItemAsync("accessToken");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

const FAQ_ITEMS = [
  { q: "How do I track my pregnancy?", a: "Go to the Home tab to see your weekly pregnancy progress, or tap Pregnancy Overview in your Profile." },
  { q: "How do I add a reminder?", a: "Go to the Track tab and tap 'Add Reminder' to add appointments or medications." },
  { q: "Can I change my due date?", a: "Yes. Go to Profile → Pregnancy Overview and contact support to update your date." },
  { q: "How do I change my language?", a: "Go to Profile → Settings → Language to choose your preferred language." },
  { q: "Is my data secure?", a: "Yes. All your data is encrypted and stored securely. We never share your personal information." },
];

export default function HelpScreen() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [sending, setSending] = useState(false);

  const toastAnim = useRef(new Animated.Value(-100)).current;
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
      Animated.delay(3000),
      Animated.timing(toastAnim, { toValue: -100, duration: 350, useNativeDriver: true }),
    ]).start();
  };

  const handleSendFeedback = async () => {
    if (!feedback.trim()) return;
    setSending(true);
    try {
      const headers = await authHeaders();
      await fetch(`${BASE_URL}/api/v1/support/feedback`, {
        method: "POST",
        headers,
        body: JSON.stringify({ message: feedback.trim() }),
      });
      setShowFeedbackModal(false);
      setFeedback("");
      showToast("Feedback sent! Thank you 💚");
    } catch (e) {
      showToast("Could not send feedback. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const HELP_ITEMS = [
    {
      icon: "chatbubble-outline",
      title: "FAQ",
      desc: "Find answers to common questions",
      onPress: () => setExpandedFaq(expandedFaq === -1 ? null : -1),
      showFaq: true,
    },
    {
      icon: "headset-outline",
      title: "Contact Us",
      desc: "Chat or email our support team",
      onPress: () => {},
    },
    {
      icon: "flag-outline",
      title: "Report an Issue",
      desc: "Let us know if something is not working",
      onPress: () => setShowFeedbackModal(true),
    },
    {
      icon: "star-outline",
      title: "Feedback",
      desc: "Share your feedback with us",
      onPress: () => setShowFeedbackModal(true),
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>

      {/* Toast */}
      <Animated.View style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 999,
        transform: [{ translateY: toastAnim }],
        backgroundColor: "#2D7A4F",
        paddingHorizontal: 20, paddingVertical: 14,
        flexDirection: "row", alignItems: "center", gap: 10,
        elevation: 10,
      }}>
        <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
        <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600", flex: 1 }}>{toastMsg}</Text>
      </Animated.View>

      {/* Feedback Modal */}
      <Modal visible={showFeedbackModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Text style={{ fontSize: 17, fontWeight: "800", color: "#111" }}>Send Feedback</Text>
              <TouchableOpacity onPress={() => setShowFeedbackModal(false)}>
                <Ionicons name="close" size={24} color="#555" />
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder="Tell us what's on your mind..."
              placeholderTextColor="#BDBDBD"
              value={feedback}
              onChangeText={setFeedback}
              multiline
              numberOfLines={5}
              style={{
                borderWidth: 1, borderColor: "#EFEFEF", borderRadius: 12,
                backgroundColor: "#FAFAFA", padding: 14, fontSize: 14,
                color: "#333", height: 120, textAlignVertical: "top", marginBottom: 16,
              }}
            />
            <TouchableOpacity
              onPress={handleSendFeedback}
              disabled={sending}
              style={{
                backgroundColor: sending ? "#7AAF90" : "#2D7A4F",
                borderRadius: 14, paddingVertical: 15, alignItems: "center",
              }}
            >
              {sending
                ? <ActivityIndicator color="#fff" />
                : <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Send</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={{
        flexDirection: "row", alignItems: "center", gap: 10,
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14,
        borderBottomWidth: 1, borderBottomColor: "#F5F5F5",
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, justifyContent: "center" }}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "800", color: "#111" }}>Help & Support</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* Hero banner */}
        <View style={{
          marginHorizontal: 20, marginTop: 16, marginBottom: 24,
          backgroundColor: "#F0FAF4", borderRadius: 20, padding: 18,
          flexDirection: "row", alignItems: "center",
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#2D7A4F", marginBottom: 6 }}>
              How can we help you?
            </Text>
            <Text style={{ fontSize: 13, color: "#555", lineHeight: 20 }}>
              We are here for you, Mama.
            </Text>
          </View>
          <Image
            source={require("../../assets/images/12.png")}
            style={{ width: 90, height: 100 }}
            resizeMode="contain"
          />
        </View>

        {/* Section title */}
        <Text style={{ fontSize: 15, fontWeight: "800", color: "#111", paddingHorizontal: 20, marginBottom: 12 }}>
          Get Help
        </Text>

        {/* Help items */}
        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          {HELP_ITEMS.map((item, i) => (
            <View key={item.title}>
              <TouchableOpacity
                onPress={item.onPress}
                style={{
                  flexDirection: "row", alignItems: "center", gap: 14,
                  backgroundColor: "#fff", borderRadius: 14, padding: 14,
                  shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
                }}
              >
                <View style={{
                  width: 40, height: 40, borderRadius: 12,
                  backgroundColor: "#E8F5EE", alignItems: "center", justifyContent: "center",
                }}>
                  <Ionicons name={item.icon as any} size={20} color="#2D7A4F" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: "#111", marginBottom: 2 }}>{item.title}</Text>
                  <Text style={{ fontSize: 12, color: "#888" }}>{item.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#CCC" />
              </TouchableOpacity>

              {/* FAQ expanded */}
              {item.showFaq && expandedFaq === -1 && (
                <View style={{ backgroundColor: "#FAFAFA", borderRadius: 14, padding: 14, marginTop: 8, gap: 10 }}>
                  {FAQ_ITEMS.map((faq, fi) => (
                    <TouchableOpacity
                      key={fi}
                      onPress={() => setExpandedFaq(expandedFaq === fi ? null : fi)}
                      style={{ borderBottomWidth: fi < FAQ_ITEMS.length - 1 ? 1 : 0, borderBottomColor: "#F0F0F0", paddingBottom: 10 }}
                    >
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text style={{ fontSize: 13, fontWeight: "700", color: "#111", flex: 1, paddingRight: 8 }}>
                          {faq.q}
                        </Text>
                        <Ionicons name={expandedFaq === fi ? "chevron-up" : "chevron-down"} size={16} color="#AAA" />
                      </View>
                      {expandedFaq === fi && (
                        <Text style={{ fontSize: 12, color: "#666", lineHeight: 18, marginTop: 8 }}>
                          {faq.a}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}