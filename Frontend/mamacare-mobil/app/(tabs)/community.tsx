import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, Modal,
  RefreshControl,
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

// ─── Types ────────────────────────────────────────────────
type Group = {
  id: number;
  name: string;
  memberCount: number;
  isMember: boolean;
  description?: string;
};

type Discussion = {
  id: number;
  title: string;
  groupName: string;
  authorName: string;
  replyCount: number;
  createdAt: string;
};

type CommunityEvent = {
  id: number;
  title: string;
  date: string;
  time: string;
  attendeeCount: number;
  isRegistered: boolean;
};

type HomeData = {
  groups?: Group[];
  discussions?: Discussion[];
  featuredEvent?: CommunityEvent;
  copyText?: string;
};

type Tab = "home" | "groups" | "discussions" | "events";

export default function CommunityScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Home data from single endpoint
  const [homeData, setHomeData] = useState<HomeData>({});
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAskModal, setShowAskModal] = useState(false);
  const [showDiscussionModal, setShowDiscussionModal] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // Forms
  const [questionText, setQuestionText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Local optimistic state layered on top of homeData
  const [groupOverrides, setGroupOverrides] = useState<Record<number, { isMember: boolean; memberCount: number }>>({});
  const [eventOverrides, setEventOverrides] = useState<Record<number, boolean>>({});

  useEffect(() => { loadHome(); }, []);

  // ─── Search debounce ──────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults(null); return; }
    const t = setTimeout(() => doSearch(searchQuery), 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const doSearch = async (q: string) => {
    setSearching(true);
    try {
      const headers = await authHeaders();
      const res = await fetch(`${BASE_URL}/api/v1/community/search?query=${encodeURIComponent(q)}`, { headers });
      if (res.ok) setSearchResults(await res.json());
    } catch (e) {}
    finally { setSearching(false); }
  };

  // ─── Load home ────────────────────────────────────────
  const loadHome = async () => {
    setLoading(true);
    try {
      const headers = await authHeaders();
      const res = await fetch(`${BASE_URL}/api/v1/community/home`, { headers });
      if (res.ok) {
        const data = await res.json();
        setHomeData(data);
      }
    } catch (e) {}
    finally { setLoading(false); }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setGroupOverrides({});
    setEventOverrides({});
    await loadHome();
    setRefreshing(false);
  }, []);

  // ─── Groups ───────────────────────────────────────────
  const groups: Group[] = homeData.groups ?? [];

  const resolvedGroup = (g: Group) => ({
    ...g,
    ...(groupOverrides[g.id] ?? {}),
  });

  const handleJoinGroup = async (groupId: number, isMember: boolean) => {
    // Optimistic
    setGroupOverrides((prev) => ({
      ...prev,
      [groupId]: {
        isMember: !isMember,
        memberCount: (resolvedGroup(groups.find((g) => g.id === groupId)!)).memberCount + (isMember ? -1 : 1),
      },
    }));
    try {
      const headers = await authHeaders();
      const method = isMember ? "DELETE" : "POST";
      const res = await fetch(`${BASE_URL}/api/v1/community/groups/${groupId}/join`, { method, headers });
      if (!res.ok) {
        // Revert
        setGroupOverrides((prev) => ({
          ...prev,
          [groupId]: { isMember, memberCount: groups.find((g) => g.id === groupId)!.memberCount },
        }));
      }
    } catch (e) {
      setGroupOverrides((prev) => ({
        ...prev,
        [groupId]: { isMember, memberCount: groups.find((g) => g.id === groupId)!.memberCount },
      }));
    }
  };

  // ─── Discussions ──────────────────────────────────────
  const discussions: Discussion[] = homeData.discussions ?? [];

  const handleAskQuestion = async () => {
    if (!questionText.trim()) return;
    setSubmitting(true);
    try {
      const headers = await authHeaders();
      const res = await fetch(`${BASE_URL}/api/v1/community/questions`, {
        method: "POST", headers,
        body: JSON.stringify({ title: questionText.trim() }),
      });
      if (res.ok) {
        setShowAskModal(false);
        setQuestionText("");
        loadHome();
      }
    } catch (e) {}
    finally { setSubmitting(false); }
  };

  const openDiscussion = async (d: Discussion) => {
    setSelectedDiscussion(d);
    setShowDiscussionModal(true);
    setComments([]);
    setLoadingComments(true);
    try {
      const headers = await authHeaders();
      const res = await fetch(`${BASE_URL}/api/v1/community/discussions/${d.id}/comments`, { headers });
      if (res.ok) {
        const data = await res.json();
        setComments(Array.isArray(data) ? data : data.comments ?? []);
      }
    } catch (e) {}
    finally { setLoadingComments(false); }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedDiscussion) return;
    setSubmitting(true);
    try {
      const headers = await authHeaders();
      const res = await fetch(`${BASE_URL}/api/v1/community/discussions/${selectedDiscussion.id}/comments`, {
        method: "POST", headers,
        body: JSON.stringify({ content: replyText.trim() }),
      });
      if (res.ok) {
        setReplyText("");
        // Reload comments
        const res2 = await fetch(`${BASE_URL}/api/v1/community/discussions/${selectedDiscussion.id}/comments`, { headers });
        if (res2.ok) {
          const data = await res2.json();
          setComments(Array.isArray(data) ? data : data.comments ?? []);
        }
      }
    } catch (e) {}
    finally { setSubmitting(false); }
  };

  // ─── Events ───────────────────────────────────────────
  const featuredEvent: CommunityEvent | undefined = homeData.featuredEvent;

  const isEventRegistered = (id: number, base: boolean) =>
    eventOverrides[id] !== undefined ? eventOverrides[id] : base;

  const handleRegisterEvent = async (eventId: number, currentlyRegistered: boolean) => {
    setEventOverrides((prev) => ({ ...prev, [eventId]: !currentlyRegistered }));
    try {
      const headers = await authHeaders();
      const res = await fetch(`${BASE_URL}/api/v1/community/events/${eventId}/register`, {
        method: "POST", headers,
      });
      if (!res.ok) {
        setEventOverrides((prev) => ({ ...prev, [eventId]: currentlyRegistered }));
      }
    } catch (e) {
      setEventOverrides((prev) => ({ ...prev, [eventId]: currentlyRegistered }));
    }
  };

  // ─── Helpers ──────────────────────────────────────────
  const timeAgo = (dateStr: string) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return "just now";
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const filteredDiscussions = searchResults?.discussions ?? discussions.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredGroups = searchResults?.groups ?? groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const TABS: { key: Tab; label: string }[] = [
    { key: "home", label: "Home" },
    { key: "groups", label: "Groups" },
    { key: "discussions", label: "Discuss" },
    { key: "events", label: "Events" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F8F8" }}>

      {/* ── Ask Question Modal ── */}
      <Modal visible={showAskModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Text style={{ fontSize: 17, fontWeight: "800", color: "#111" }}>Ask a Question</Text>
              <TouchableOpacity onPress={() => setShowAskModal(false)}>
                <Ionicons name="close" size={24} color="#555" />
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder="What's on your mind, Mama?"
              placeholderTextColor="#BDBDBD"
              value={questionText}
              onChangeText={setQuestionText}
              multiline
              numberOfLines={4}
              style={{
                borderWidth: 1, borderColor: "#EFEFEF", borderRadius: 12,
                backgroundColor: "#FAFAFA", padding: 14, fontSize: 14,
                color: "#333", minHeight: 100, textAlignVertical: "top", marginBottom: 16,
              }}
            />
            <TouchableOpacity
              onPress={handleAskQuestion}
              disabled={submitting}
              style={{ backgroundColor: submitting ? "#7AAF90" : "#2D7A4F", borderRadius: 14, paddingVertical: 15, alignItems: "center" }}
            >
              {submitting
                ? <ActivityIndicator color="#fff" />
                : <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Post Question</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Discussion Detail Modal ── */}
      <Modal visible={showDiscussionModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "85%" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ fontSize: 15, fontWeight: "800", color: "#111", flex: 1, marginRight: 12 }} numberOfLines={2}>
                {selectedDiscussion?.title}
              </Text>
              <TouchableOpacity onPress={() => { setShowDiscussionModal(false); setComments([]); }}>
                <Ionicons name="close" size={24} color="#555" />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 11, color: "#AAA", marginBottom: 14 }}>
              {selectedDiscussion?.groupName} · {selectedDiscussion?.authorName} · {timeAgo(selectedDiscussion?.createdAt ?? "")}
            </Text>

            {/* Comments */}
            <ScrollView style={{ maxHeight: 260 }} showsVerticalScrollIndicator={false}>
              {loadingComments ? (
                <ActivityIndicator color="#2D7A4F" style={{ marginTop: 20 }} />
              ) : comments.length === 0 ? (
                <View style={{ alignItems: "center", paddingVertical: 24 }}>
                  <Ionicons name="chatbubble-outline" size={32} color="#CCC" />
                  <Text style={{ fontSize: 13, color: "#AAA", marginTop: 8 }}>No replies yet. Be the first!</Text>
                </View>
              ) : (
                <View style={{ gap: 12 }}>
                  {comments.map((c: any, i: number) => (
                    <View key={c.id ?? i} style={{ flexDirection: "row", gap: 10 }}>
                      <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: "#E8F5EE", alignItems: "center", justifyContent: "center" }}>
                        <Ionicons name="person" size={14} color="#2D7A4F" />
                      </View>
                      <View style={{ flex: 1, backgroundColor: "#F8F8F8", borderRadius: 12, padding: 10 }}>
                        <Text style={{ fontSize: 12, fontWeight: "700", color: "#111", marginBottom: 3 }}>
                          {c.authorName ?? c.author ?? "Mama"}
                        </Text>
                        <Text style={{ fontSize: 13, color: "#444", lineHeight: 18 }}>{c.content ?? c.text}</Text>
                        <Text style={{ fontSize: 10, color: "#BBB", marginTop: 4 }}>{timeAgo(c.createdAt)}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            {/* Reply input */}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <TextInput
                placeholder="Write a reply..."
                placeholderTextColor="#BDBDBD"
                value={replyText}
                onChangeText={setReplyText}
                style={{
                  flex: 1, borderWidth: 1, borderColor: "#EFEFEF", borderRadius: 12,
                  backgroundColor: "#FAFAFA", paddingHorizontal: 14, height: 46, fontSize: 14, color: "#333",
                }}
              />
              <TouchableOpacity
                onPress={handleReply}
                disabled={submitting}
                style={{ width: 46, height: 46, borderRadius: 12, backgroundColor: "#2D7A4F", alignItems: "center", justifyContent: "center" }}
              >
                {submitting
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Ionicons name="send" size={18} color="#fff" />
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Header ── */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#F0F0F0" }}>
        <View style={{ marginBottom: 14 }}>
          <Text style={{ fontSize: 22, fontWeight: "800", color: "#111" }}>You are not</Text>
          <Text style={{ fontSize: 22, fontWeight: "800", color: "#2D7A4F" }}>alone, Mama! 💚</Text>
        </View>
        {/* Search */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#F5F5F5", borderRadius: 12, paddingHorizontal: 14, height: 44 }}>
          <Ionicons name="search-outline" size={18} color="#AAA" />
          <TextInput
            placeholder="Search questions, topics or moms"
            placeholderTextColor="#BDBDBD"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, fontSize: 13, color: "#333" }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(""); setSearchResults(null); }}>
              <Ionicons name="close-circle" size={18} color="#AAA" />
            </TouchableOpacity>
          )}
          {searching && <ActivityIndicator size="small" color="#2D7A4F" />}
        </View>
      </View>

      {/* ── Quick actions ── */}
      <View style={{ flexDirection: "row", paddingHorizontal: 20, paddingVertical: 14, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#F0F0F0", gap: 10 }}>
        {[
          { icon: "help-circle-outline", label: "Ask a\nQuestion", onPress: () => setShowAskModal(true) },
          { icon: "chatbubbles-outline", label: "Discussion", onPress: () => setActiveTab("discussions") },
          { icon: "people-outline", label: "Groups", onPress: () => setActiveTab("groups") },
          { icon: "calendar-outline", label: "Events", onPress: () => setActiveTab("events") },
        ].map((action) => (
          <TouchableOpacity key={action.label} onPress={action.onPress} style={{ flex: 1, alignItems: "center", gap: 6 }}>
            <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: "#F0FAF4", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name={action.icon as any} size={22} color="#2D7A4F" />
            </View>
            <Text style={{ fontSize: 11, color: "#444", fontWeight: "600", textAlign: "center", lineHeight: 15 }}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Tab nav ── */}
      <View style={{ flexDirection: "row", backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#F0F0F0" }}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={{
              flex: 1, paddingVertical: 12, alignItems: "center",
              borderBottomWidth: 2,
              borderBottomColor: activeTab === tab.key ? "#2D7A4F" : "transparent",
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "700", color: activeTab === tab.key ? "#2D7A4F" : "#AAA" }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2D7A4F" />}
      >

        {/* ══════════ HOME TAB ══════════ */}
        {activeTab === "home" && (
          <View>
            {/* Join a Group */}
            <View style={{ paddingHorizontal: 20, marginTop: 20, marginBottom: 20 }}>
              <Text style={{ fontSize: 15, fontWeight: "800", color: "#111", marginBottom: 12 }}>Join a Group</Text>
              {loading ? (
                <ActivityIndicator color="#2D7A4F" />
              ) : groups.length === 0 ? (
                <View style={{ backgroundColor: "#F8F8F8", borderRadius: 14, padding: 20, alignItems: "center" }}>
                  <Ionicons name="people-outline" size={32} color="#CCC" />
                  <Text style={{ fontSize: 13, color: "#AAA", marginTop: 8 }}>No groups available</Text>
                </View>
              ) : (
                <View style={{ backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "#F0F0F0", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 }}>
                  <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#F5F5F5", paddingVertical: 10 }}>
                    {groups.slice(0, 3).map((g, i) => (
                      <View key={g.id} style={{ flex: 1, alignItems: "center", borderRightWidth: i < 2 ? 1 : 0, borderRightColor: "#F5F5F5" }}>
                        <Text style={{ fontSize: 12, fontWeight: "700", color: "#111", textAlign: "center", paddingHorizontal: 8 }}>{g.name}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={{ flexDirection: "row", paddingVertical: 12 }}>
                    {groups.slice(0, 3).map((g, i) => {
                      const resolved = resolvedGroup(g);
                      return (
                        <View key={g.id} style={{ flex: 1, alignItems: "center", gap: 8, borderRightWidth: i < 2 ? 1 : 0, borderRightColor: "#F5F5F5" }}>
                          <Text style={{ fontSize: 11, color: "#888" }}>
                            {resolved.memberCount >= 1000 ? `${(resolved.memberCount / 1000).toFixed(1)}K` : resolved.memberCount} members
                          </Text>
                          <TouchableOpacity
                            onPress={() => handleJoinGroup(g.id, resolved.isMember)}
                            style={{ paddingHorizontal: 18, paddingVertical: 6, borderRadius: 20, backgroundColor: resolved.isMember ? "#E8F5EE" : "#2D7A4F" }}
                          >
                            <Text style={{ fontSize: 12, fontWeight: "700", color: resolved.isMember ? "#2D7A4F" : "#fff" }}>
                              {resolved.isMember ? "Leave" : "Join"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>

            {/* Popular Discussions */}
            <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text style={{ fontSize: 15, fontWeight: "800", color: "#111" }}>Popular Discussion</Text>
                <TouchableOpacity onPress={() => setActiveTab("discussions")}>
                  <Text style={{ color: "#2D7A4F", fontWeight: "600", fontSize: 13 }}>View All</Text>
                </TouchableOpacity>
              </View>
              {loading ? (
                <ActivityIndicator color="#2D7A4F" />
              ) : discussions.length === 0 ? (
                <View style={{ backgroundColor: "#F8F8F8", borderRadius: 14, padding: 20, alignItems: "center" }}>
                  <Ionicons name="chatbubbles-outline" size={32} color="#CCC" />
                  <Text style={{ fontSize: 13, color: "#AAA", marginTop: 8 }}>No discussions yet</Text>
                </View>
              ) : (
                <View style={{ gap: 8 }}>
                  {discussions.slice(0, 3).map((d) => (
                    <DiscussionCard key={d.id} d={d} onPress={() => openDiscussion(d)} timeAgo={timeAgo} />
                  ))}
                </View>
              )}
            </View>

            {/* Featured Event */}
            {featuredEvent && (
              <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
                <Text style={{ fontSize: 15, fontWeight: "800", color: "#111", marginBottom: 12 }}>Featured Event</Text>
                <EventCard
                  ev={featuredEvent}
                  registered={isEventRegistered(featuredEvent.id, featuredEvent.isRegistered)}
                  onRegister={() => handleRegisterEvent(featuredEvent.id, isEventRegistered(featuredEvent.id, featuredEvent.isRegistered))}
                />
              </View>
            )}

            {/* Safe space banner */}
            <View style={{ marginHorizontal: 20, backgroundColor: "#F0FAF4", borderRadius: 14, padding: 16, flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#2D7A4F", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="heart" size={18} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#2D7A4F" }}>Be kind, be supportive, be you.</Text>
                <Text style={{ fontSize: 11, color: "#888", marginTop: 2 }}>This is a safe space for every mama.</Text>
              </View>
            </View>
          </View>
        )}

        {/* ══════════ GROUPS TAB ══════════ */}
        {activeTab === "groups" && (
          <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
            <Text style={{ fontSize: 15, fontWeight: "800", color: "#111", marginBottom: 14 }}>All Groups</Text>
            {loading ? (
              <ActivityIndicator color="#2D7A4F" style={{ marginTop: 40 }} />
            ) : filteredGroups.length === 0 ? (
              <View style={{ alignItems: "center", marginTop: 60 }}>
                <Ionicons name="people-outline" size={48} color="#CCC" />
                <Text style={{ fontSize: 14, color: "#AAA", marginTop: 12, fontWeight: "600" }}>
                  {searchQuery ? "No groups match your search" : "No groups available"}
                </Text>
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                {filteredGroups.map((g: Group) => {
                  const resolved = resolvedGroup(g);
                  return (
                    <View key={g.id} style={{ backgroundColor: "#fff", borderRadius: 14, padding: 16, flexDirection: "row", alignItems: "center", gap: 14, borderWidth: 1, borderColor: "#F0F0F0", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 }}>
                      <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: "#E8F5EE", alignItems: "center", justifyContent: "center" }}>
                        <Ionicons name="people-outline" size={22} color="#2D7A4F" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: "700", color: "#111", marginBottom: 3 }}>{g.name}</Text>
                        <Text style={{ fontSize: 12, color: "#888" }}>{resolved.memberCount.toLocaleString()} members</Text>
                        {g.description ? <Text style={{ fontSize: 11, color: "#AAA", marginTop: 2 }} numberOfLines={1}>{g.description}</Text> : null}
                      </View>
                      <TouchableOpacity
                        onPress={() => handleJoinGroup(g.id, resolved.isMember)}
                        style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: resolved.isMember ? "#F5F5F5" : "#2D7A4F", borderWidth: resolved.isMember ? 1 : 0, borderColor: "#E0E0E0" }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: "700", color: resolved.isMember ? "#888" : "#fff" }}>
                          {resolved.isMember ? "Leave" : "Join"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* ══════════ DISCUSSIONS TAB ══════════ */}
        {activeTab === "discussions" && (
          <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <Text style={{ fontSize: 15, fontWeight: "800", color: "#111" }}>Discussions</Text>
              <TouchableOpacity
                onPress={() => setShowAskModal(true)}
                style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#2D7A4F", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }}
              >
                <Ionicons name="add" size={16} color="#fff" />
                <Text style={{ fontSize: 12, color: "#fff", fontWeight: "700" }}>Ask</Text>
              </TouchableOpacity>
            </View>
            {loading ? (
              <ActivityIndicator color="#2D7A4F" style={{ marginTop: 40 }} />
            ) : filteredDiscussions.length === 0 ? (
              <View style={{ alignItems: "center", marginTop: 60 }}>
                <Ionicons name="chatbubbles-outline" size={48} color="#CCC" />
                <Text style={{ fontSize: 14, color: "#AAA", marginTop: 12, fontWeight: "600" }}>
                  {searchQuery ? "No discussions match your search" : "No discussions yet"}
                </Text>
                {!searchQuery && <Text style={{ fontSize: 12, color: "#BBB", marginTop: 4 }}>Be the first to ask a question</Text>}
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                {filteredDiscussions.map((d: Discussion) => (
                  <DiscussionCard key={d.id} d={d} onPress={() => openDiscussion(d)} timeAgo={timeAgo} />
                ))}
              </View>
            )}
          </View>
        )}

        {/* ══════════ EVENTS TAB ══════════ */}
        {activeTab === "events" && (
          <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
            <Text style={{ fontSize: 15, fontWeight: "800", color: "#111", marginBottom: 14 }}>Events</Text>
            {loading ? (
              <ActivityIndicator color="#2D7A4F" style={{ marginTop: 40 }} />
            ) : !featuredEvent ? (
              <View style={{ alignItems: "center", marginTop: 60 }}>
                <Ionicons name="calendar-outline" size={48} color="#CCC" />
                <Text style={{ fontSize: 14, color: "#AAA", marginTop: 12, fontWeight: "600" }}>No events available</Text>
              </View>
            ) : (
              <EventCard
                ev={featuredEvent}
                registered={isEventRegistered(featuredEvent.id, featuredEvent.isRegistered)}
                onRegister={() => handleRegisterEvent(featuredEvent.id, isEventRegistered(featuredEvent.id, featuredEvent.isRegistered))}
              />
            )}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────
function DiscussionCard({ d, onPress, timeAgo }: { d: Discussion; onPress: () => void; timeAgo: (s: string) => string }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ backgroundColor: "#fff", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#F0F0F0", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}
    >
      <Text style={{ fontSize: 14, fontWeight: "700", color: "#111", marginBottom: 8, lineHeight: 20 }}>{d.title}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: "#E8F5EE", alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="person" size={12} color="#2D7A4F" />
        </View>
        <Text style={{ fontSize: 11, color: "#888" }}>{d.groupName}</Text>
        <Text style={{ fontSize: 11, color: "#CCC" }}>·</Text>
        <Text style={{ fontSize: 11, color: "#888" }}>{d.authorName}</Text>
        <View style={{ flex: 1 }} />
        <Ionicons name="chatbubble-outline" size={13} color="#AAA" />
        <Text style={{ fontSize: 11, color: "#AAA" }}>{d.replyCount}</Text>
        <Text style={{ fontSize: 11, color: "#CCC" }}>{timeAgo(d.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}

function EventCard({ ev, registered, onRegister }: { ev: CommunityEvent; registered: boolean; onRegister: () => void }) {
  return (
    <View style={{ backgroundColor: "#fff", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#F0F0F0", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: "#E8F5EE", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 20 }}>📅</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FFEBEE", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#E53935" }} />
              <Text style={{ fontSize: 10, color: "#E53935", fontWeight: "700" }}>LIVE</Text>
            </View>
          </View>
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#111", marginBottom: 3 }}>{ev.title}</Text>
          <Text style={{ fontSize: 12, color: "#888" }}>{ev.date} {ev.time}</Text>
          <Text style={{ fontSize: 11, color: "#AAA", marginTop: 2 }}>
            {ev.attendeeCount >= 1000 ? `${(ev.attendeeCount / 1000).toFixed(1)}K` : ev.attendeeCount} attending
          </Text>
        </View>
        <TouchableOpacity
          onPress={onRegister}
          style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: registered ? "#E8F5EE" : "#2D7A4F" }}
        >
          <Text style={{ fontSize: 12, fontWeight: "700", color: registered ? "#2D7A4F" : "#fff" }}>
            {registered ? "Registered ✓" : "Register Now"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}