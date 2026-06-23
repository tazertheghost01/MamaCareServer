"use client";
import { useState, useEffect } from "react";
import {
  Bell, Send, Clock, Eye, MoreHorizontal, Trash2, Loader2, ServerCrash
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const STATUS_STYLES = {
  Sent: "bg-[#E8F5EE] text-[#1A7A4A]",
  Scheduled: "bg-blue-50 text-blue-600",
  Pending: "bg-yellow-50 text-yellow-600",
  Failed: "bg-red-50 text-red-500",
};

function StatusBadge({ status }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLES[status] || "bg-gray-100 text-gray-500"}`}>
      {status || "—"}
    </span>
  );
}

const STATUS_LABELS = {
  DRAFT: "Pending",
  SCHEDULED: "Scheduled",
  SENT: "Sent",
  FAILED: "Failed",
};

const TYPE_LABELS = {
  REMINDER: "Reminder",
  MEDICATION: "Medication",
  WALK: "Walk",
  GENERAL: "General",
  ALERT: "Alert",
  COMMUNITY: "General",
};

function TypeBadge({ type }) {
  const colors = {
    Reminder: "bg-purple-50 text-purple-600",
    Medication: "bg-pink-50 text-pink-600",
    Walk: "bg-yellow-50 text-yellow-700",
    General: "bg-blue-50 text-blue-600",
    Alert: "bg-red-50 text-red-500",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${colors[type] || "bg-gray-100 text-gray-500"}`}>
      {type}
    </span>
  );
}

function ActionMenu({ notification, onView }) {
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
            <button onClick={() => { onView(notification); setOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
              <Eye size={14} /> View Details
            </button>
            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50">
              <Send size={14} /> Send Now
            </button>
            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function DetailModal({ notification, onClose }) {
  if (!notification) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Notification Details</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <Clock size={16} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="font-bold text-gray-900 text-lg">{notification.title}</p>
            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Type", value: notification.type },
              { label: "Audience", value: notification.audience },
              { label: "Status", value: notification.status },
              { label: "Scheduled", value: notification.scheduledTime },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 font-medium">{label}</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{value || "—"}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 pb-5 flex gap-2">
          <button className="flex-1 py-2.5 rounded-xl bg-[#1A7A4A] text-white text-sm font-semibold hover:bg-[#15633C]">Send Again</button>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50">Close</button>
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
      <p className="text-sm font-medium text-gray-500">No notifications found</p>
      <p className="text-xs text-gray-400 mt-1">{message}</p>
    </div>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState("All Notifications");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("mc_token");
    if (!token) { setLoading(false); return; }

    fetch(`${BASE_URL}/api/v1/admin/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (notificationRes) => {
        if (!notificationRes.ok) {
          throw new Error("Failed to load notifications");
        }
        const raw = await notificationRes.json().catch(() => []);
        const mapped = (Array.isArray(raw) ? raw : raw?.notifications || raw?.content || []).map(n => ({
          id: n.id,
          title: n.title || "Notification",
          message: n.body || n.message || "",
          type: TYPE_LABELS[n.type] || n.type || "General",
          audience: n.audience || "All Users",
          status: STATUS_LABELS[n.status] || n.status || "Pending",
          scheduledTime: n.scheduledAt || n.scheduled_time || "—",
          sentOn: n.sentAt || n.sent_at || "—",
        }));
        setNotifications(mapped);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const totalSent = notifications.filter(n => n.status === "Sent").length;
  const scheduled = notifications.filter(n => n.status === "Scheduled").length;
  const pending = notifications.filter(n => n.status === "Pending").length;
  const failed = notifications.filter(n => n.status === "Failed").length;

  const filtered = notifications.filter(n => {
    if (activeTab === "All Notifications") return true;
    return n.status === activeTab;
  });

  return (
    <>
      <DetailModal notification={selected} onClose={() => setSelected(null)} />
      <div className="space-y-5">

        {/* Dynamic Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Sent", value: totalSent, change: "— this week" },
            { label: "Scheduled", value: scheduled, change: "— this week" },
            { label: "Pending", value: pending, change: "— this week" },
            { label: "Failed", value: failed, change: "— this week" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <p className="text-xs text-gray-400 font-medium">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? "—" : s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.change}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-3 bg-white rounded-2xl border border-gray-100 p-4">
          {["All Notifications", "Scheduled", "Sent", "Pending", "Failed"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === tab ? "bg-[#1A7A4A] text-white" : "text-gray-600 hover:bg-gray-100"}`}
            >
              {tab}
            </button>
          ))}
          <button className="ml-auto bg-[#1A7A4A] text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-[#15633C]">
            <Send size={16} /> New Notification
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <Spinner />
          ) : error ? (
            <EmptyState message="Could not load notifications. Check your connection." />
          ) : filtered.length === 0 ? (
            <EmptyState message="No notifications match the selected filter." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 text-xs border-b border-gray-100">
                    <th className="px-5 py-3.5 text-left font-medium">Title</th>
                    <th className="px-4 py-3.5 text-left font-medium">Type</th>
                    <th className="px-4 py-3.5 text-left font-medium">Audience</th>
                    <th className="px-4 py-3.5 text-left font-medium">Status</th>
                    <th className="px-4 py-3.5 text-left font-medium">Scheduled Time</th>
                    <th className="px-4 py-3.5 text-left font-medium">Sent On</th>
                    <th className="px-4 py-3.5 text-left font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((n, i) => (
                    <tr key={n.id || i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4 font-medium text-gray-800">{n.title}</td>
                      <td className="px-4 py-4"><TypeBadge type={n.type} /></td>
                      <td className="px-4 py-4 text-gray-600 text-xs">{n.audience}</td>
                      <td className="px-4 py-4"><StatusBadge status={n.status} /></td>
                      <td className="px-4 py-4 text-gray-500 text-xs">{n.scheduledTime || "—"}</td>
                      <td className="px-4 py-4 text-gray-500 text-xs">{n.sentOn || "—"}</td>
                      <td className="px-4 py-4"><ActionMenu notification={n} onView={setSelected} /></td>
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

