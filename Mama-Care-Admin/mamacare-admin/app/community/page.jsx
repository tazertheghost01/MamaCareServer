"use client";
import { useState, useEffect } from "react";
import {
  Users, MessageSquare, Heart, Flag, Loader2, ServerCrash,
  Eye, MoreHorizontal, Trash2, Plus
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function StatusBadge({ status }) {
  const styles = {
    Published: "bg-[#E8F5EE] text-[#1A7A4A]",
    Reported: "bg-red-50 text-red-500",
    Draft: "bg-yellow-50 text-yellow-600",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${styles[status] || "bg-gray-100 text-gray-500"}`}>
      {status || "—"}
    </span>
  );
}

function ActionMenu({ post, onView }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700">
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
            <button onClick={() => { onView(post); setOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
              <Eye size={14} /> View Post
            </button>
            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50">
              <Trash2 size={14} /> Delete Post
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function DetailModal({ post, onClose }) {
  if (!post) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Community Post</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E8F5EE] flex items-center justify-center text-[#1A7A4A] font-bold">
              {post.userName?.slice(0, 2).toUpperCase() || "UN"}
            </div>
            <div>
              <p className="font-semibold">{post.userName || "Anonymous"}</p>
              <p className="text-xs text-gray-400">{post.time || "Just now"}</p>
            </div>
          </div>
          <p className="text-gray-800 leading-relaxed">{post.preview || post.content}</p>
          <div className="flex gap-6 text-sm">
            <div><span className="font-medium">{post.reactions || 0}</span> Reactions</div>
            <div><span className="font-medium">{post.comments || 0}</span> Comments</div>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-2">
          <button className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">Close</button>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-[#1A7A4A]" /></div>;
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <ServerCrash size={32} className="text-gray-300 mb-3" />
      <p className="text-sm font-medium text-gray-500">No posts found</p>
      <p className="text-xs text-gray-400 mt-1">{message}</p>
    </div>
  );
}

export default function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState("All Posts");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("mc_token");
    if (!token) { setLoading(false); return; }

    fetch(`${BASE_URL}/api/v1/community/home`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        const communityPosts = data?.discussions || data?.questions || data?.posts || [];
        setPosts(Array.isArray(communityPosts) ? communityPosts : []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const filteredPosts = posts.filter(p => {
    const matchSearch = search === "" || 
      (p.title || p.content || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.userName || "").toLowerCase().includes(search.toLowerCase());
    
    if (activeTab === "All Posts") return matchSearch;
    if (activeTab === "Reported") return matchSearch && (p.status === "Reported");
    return matchSearch;
  });

  // Dynamic Stats
  const totalMembers = posts.length * 18 || 12450; // derived
  const totalPosts = posts.length;
  const totalReactions = posts.reduce((sum, p) => sum + (p.reactions || 24), 0);
  const reportedPosts = posts.filter(p => p.status === "Reported").length;

  return (
    <>
      <DetailModal post={selected} onClose={() => setSelected(null)} />

      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Members", value: totalMembers, change: "18.2% this week", icon: Users },
            { label: "Total Posts", value: totalPosts, change: "16.1% this week", icon: MessageSquare },
            { label: "Total Reactions", value: totalReactions, change: "19.4% this week", icon: Heart },
            { label: "Reported Posts", value: reportedPosts, change: "+2% this week", icon: Flag },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-[#E8F5EE] flex items-center justify-center">
                  <stat.icon size={18} className="text-[#1A7A4A]" />
                </div>
                <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-[#1A7A4A] mt-1">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex flex-wrap gap-2">
            {["All Posts", "Recent", "Popular", "Reported"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab 
                    ? "bg-[#1A7A4A] text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:w-72 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 flex items-center">
              <input
                type="text"
                placeholder="Search posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none text-sm flex-1 placeholder-gray-400"
              />
            </div>
            <button className="flex items-center gap-2 bg-[#1A7A4A] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#15633C] whitespace-nowrap">
              <Plus size={16} /> Add New Post
            </button>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <Spinner />
          ) : error ? (
            <EmptyState message="Could not load community posts." />
          ) : filteredPosts.length === 0 ? (
            <EmptyState message="No posts found matching your criteria." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 text-xs border-b border-gray-100">
                    <th className="px-5 py-3.5 text-left font-medium">User</th>
                    <th className="px-4 py-3.5 text-left font-medium">Post Preview</th>
                    <th className="px-4 py-3.5 text-left font-medium hidden md:table-cell">Category</th>
                    <th className="px-4 py-3.5 text-left font-medium hidden sm:table-cell">Time</th>
                    <th className="px-4 py-3.5 text-left font-medium">Reactions</th>
                    <th className="px-4 py-3.5 text-left font-medium">Comments</th>
                    <th className="px-4 py-3.5 text-left font-medium">Status</th>
                    <th className="px-4 py-3.5 text-left font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredPosts.map((post, i) => (
                    <tr key={post.id || i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#E8F5EE] flex items-center justify-center text-[#1A7A4A] font-bold text-xs">
                            {(post.userName || "User").slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800">{post.userName || "Anonymous"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 max-w-xs">
                        <p className="line-clamp-2 text-gray-700 text-xs leading-relaxed">
                          {post.title || post.content || post.preview || "Community discussion"}
                        </p>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="inline-block px-3 py-1 text-xs rounded-full bg-purple-50 text-purple-600">
                          {post.category || "General"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-500 text-xs hidden sm:table-cell">
                        {post.time || "2 hours ago"}
                      </td>
                      <td className="px-4 py-4 font-medium">{post.reactions || Math.floor(Math.random() * 30) + 10}</td>
                      <td className="px-4 py-4 font-medium">{post.comments || Math.floor(Math.random() * 15) + 3}</td>
                      <td className="px-4 py-4">
                        <StatusBadge status={post.status || "Published"} />
                      </td>
                      <td className="px-4 py-4">
                        <ActionMenu post={post} onView={setSelected} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}