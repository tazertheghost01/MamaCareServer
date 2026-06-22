import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, ScrollView,
  ActivityIndicator, RefreshControl, Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

async function authHeaders() {
  const token = await SecureStore.getItemAsync("accessToken");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

export default function CommunityScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [communityData, setCommunityData] = useState<any>(null);

  const loadData = async () => {
    try {
      const headers = await authHeaders();
      const res = await fetch(`${BASE_URL}/api/v1/community/home`, { headers });
      if (res.ok) {
        setCommunityData(await res.json());
      }
    } catch (e) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F8F8", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2D7A4F" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F8F8" }}>
      {/* Header */}
      <View style={{
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14, backgroundColor: "#fff",
      }}>
        <Text style={{ fontSize: 22, fontWeight: "800", color: "#111" }}>Community</Text>
        <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#F0FAF4", alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="search" size={20} color="#2D7A4F" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2D7A4F" />}
      >
        {/* Your Groups */}
        {communityData?.my_groups && communityData.my_groups.length > 0 && (
          <View style={{ marginTop: 16, paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#111", marginBottom: 12 }}>Your Groups</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {communityData.my_groups.map((group: any) => (
                <View key={group.id} style={{
                  width: 130, backgroundColor: "#fff", borderRadius: 16, padding: 16,
                  alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
                }}>
                  <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#E8F5EE", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                    <Ionicons name="people" size={20} color="#2D7A4F" />
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#111", textAlign: "center", marginBottom: 4 }} numberOfLines={2}>
                    {group.name}
                  </Text>
                  <Text style={{ fontSize: 11, color: "#888" }}>{group.member_count} members</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Discussions */}
        <View style={{ marginTop: 24, paddingHorizontal: 20 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#111" }}>Recent Discussions</Text>
            <TouchableOpacity>
              <Text style={{ color: "#2D7A4F", fontWeight: "600", fontSize: 13 }}>See all</Text>
            </TouchableOpacity>
          </View>

          {communityData?.discussions?.map((disc: any) => (
            <View key={disc.id} style={{
              backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12,
              shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
            }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#E0E0E0", overflow: "hidden" }}>
                  <Image source={{ uri: disc.author_avatar_url || "https://ui-avatars.com/api/?name=" + disc.author_name }} style={{ width: 36, height: 36 }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: "#111" }}>{disc.author_name}</Text>
                  <Text style={{ fontSize: 11, color: "#888" }}>{new Date(disc.created_at).toLocaleDateString()}</Text>
                </View>
                <View style={{ backgroundColor: "#F0FAF4", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                  <Text style={{ fontSize: 10, color: "#2D7A4F", fontWeight: "600" }}>{disc.group_name}</Text>
                </View>
              </View>

              <Text style={{ fontSize: 15, fontWeight: "700", color: "#111", marginBottom: 6 }}>{disc.title}</Text>
              <Text style={{ fontSize: 13, color: "#555", lineHeight: 20, marginBottom: 14 }} numberOfLines={3}>
                {disc.preview_text}
              </Text>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 16, borderTopWidth: 1, borderTopColor: "#F5F5F5", paddingTop: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Ionicons name="heart-outline" size={18} color="#888" />
                  <Text style={{ fontSize: 12, color: "#888" }}>{disc.like_count}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Ionicons name="chatbubble-outline" size={17} color="#888" />
                  <Text style={{ fontSize: 12, color: "#888" }}>{disc.comment_count}</Text>
                </View>
              </View>
            </View>
          ))}
          
          {(!communityData?.discussions || communityData.discussions.length === 0) && (
             <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <Ionicons name="chatbubbles-outline" size={48} color="#CCC" />
                <Text style={{ marginTop: 10, color: "#888", fontSize: 14 }}>No discussions yet.</Text>
             </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={{
        position: "absolute", bottom: 20, right: 20, width: 56, height: 56,
        borderRadius: 28, backgroundColor: "#2D7A4F", alignItems: "center", justifyContent: "center",
        shadowColor: "#2D7A4F", shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
      }}>
        <Ionicons name="pencil" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
