"use client";
import { useState, useEffect } from "react";
import {
  Bell,
  Pill,
  CalendarCheck,
  PersonStanding,
  SlidersHorizontal,
  Download,
  MoreHorizontal,
  Eye,
  Send,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  CalendarRange,
  Loader2,
  ServerCrash,
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const REMINDER_TYPE_CFG = {
  Medication: { icon: Pill, bg: "bg-[#E8F5EE]", color: "text-[#1A7A4A]" },
  Appointment: { icon: CalendarCheck, bg: "bg-blue-50", color: "text-blue-500" },
  "Walk Reminder": { icon: PersonStanding, bg: "bg-yellow-50", color: "text-yellow-600" },
};

const STATUS_STYLES = {
  Sent: "bg-[#E8F5EE] text-[#1A7A4A]",
  Pending: "bg-yellow-50 text-yellow-600",
  Failed: "bg-red-50 text-red-500",
};

function TypeCell({ type }) {
  const cfg = REMINDER_TYPE_CFG[type] || { icon: Bell, bg: "bg-gray-50", color: "text-gray-400" };
  const Icon = cfg.icon;
  return (
    <div className="flex items-center gap-2">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
        <Icon size={13} className={cfg.color} />
      </div>
      <span className="text-xs font-semibold text-gray-700">{type || "—"}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLES[status] || "bg-gray-100 text-gray-500"}`}>
      {status || "—"}
    </span>
  );
}

function ActionMenu({ reminder, onView }) {
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
            <button onClick={() => { onView(reminder); setOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
              <Eye size={14} /> View Details
            </button>
            {reminder.status !== "Sent" && (
              <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50">
                <Send size={14} /> Send Now
              </button>
            )}
            {reminder.status === "Failed" && (
              <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50">
                <AlertCircle size={14} /> Retry
              </button>
            )}
            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function DetailModal({ reminder, onClose }) {
  if (!reminder) return null;
  const cfg = REMINDER_TYPE_CFG[reminder.type] || { icon: Bell, bg: "bg-gray-50", color: "text-gray-400" };
  const Icon = cfg.icon;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Reminder Details</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={16} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cfg.bg}`}>
              <Icon size={22} className={cfg.color} />
            </div>
            <div>
              <p className="font-bold text-gray-900">{reminder.title || "—"}</p>
              <StatusBadge status={reminder.status} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Type", value: reminder.type || "—" },
              { label: "Audience", value: reminder.audience || "—" },
              { label: "Scheduled Time", value: reminder.scheduledTime || reminder.scheduledAt || "—" },
              { label: "Sent On", value: reminder.sentOn || reminder.sentAt || "—" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 font-medium">{label}</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 pb-5 flex gap-2">
          {reminder.status !== "Sent" && (
            <button className="flex-1 py-2.5 rounded-xl bg-[#1A7A4A] text-white text-sm font-semibold hover:bg-[#15633C]">
              {reminder.status === "Failed" ? "Retry" : "Send Now"}
            </button>
          )}
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={24} className="animate-spin text-[#1A7A4A]" />
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <ServerCrash size={32} className="text-gray-300 mb-3" />
      <p className="text-sm font-medium text-gray-500">No reminders found</p>
      <p className="text-xs text-gray-400 mt-1">{message}</p>
    </div>
  );
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All States");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("mc_token");
    if (!token) { setLoading(false); return; }

    fetch(`${BASE_URL}/api/v1/medications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setReminders(Array.isArray(data) ? data : data?.medications || data?.content || (data ? [data] : [])))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const total = reminders.length;
  const sent = reminders.filter(r => r.status === "Sent").length;
  const pending = reminders.filter(r => r.status === "Pending").length;
  const failed = reminders.filter(r => r.status === "Failed").length;
  const types = new Set(reminders.map(r => r.type).filter(Boolean)).size;

  const filtered = reminders.filter(r =>
    statusFilter === "All States" || r.status === statusFilter
  );

  return (
    <>
      <DetailModal reminder={selected} onClose={() => setSelected(null)} />
      <div className="space-y-5">

        {/* Date range */}
        <div className="flex justify-end">
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-2">
            <CalendarRange size={14} />
            <span>May 19 – May 25, 2026</span>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Sent", value: sent, icon: CheckCircle2, bg: "bg-[#E8F5EE]", color: "text-[#1A7A4A]" },
            { label: "Pending", value: pending, icon: Clock, bg: "bg-blue-50", color: "text-blue-500" },
            { label: "Failed", value: failed, icon: XCircle, bg: "bg-red-50", color: "text-red-500" },
            { label: "Reminder Types", value: types, icon: Bell, bg: "bg-purple-50", color: "text-purple-500" },
          ].map(({ label, value, icon: Icon, bg, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                <Icon size={18} className={color} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">{label}</p>
                <p className="text-xl font-bold text-gray-900">{loading ? "—" : value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
            <p className="font-semibold text-gray-800">All Reminders</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2">
                <SlidersHorizontal size={13} className="text-gray-400" />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm text-gray-600 outline-none bg-transparent">
                  <option>All States</option>
                  <option>Sent</option>
                  <option>Pending</option>
                  <option>Failed</option>
                </select>
              </div>
              <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-700">
                <Download size={16} />
              </button>
            </div>
          </div>

          {loading ? (
            <Spinner />
          ) : error ? (
            <EmptyState message="Could not load reminders. Check your connection or API configuration." />
          ) : filtered.length === 0 ? (
            <EmptyState message={statusFilter !== "All States" ? "No reminders match your filter." : "No reminders have been sent yet."} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-400 text-xs border-b border-gray-100">
                      <th className="px-5 py-3.5 text-left font-medium">Type</th>
                      <th className="px-4 py-3.5 text-left font-medium">Title</th>
                      <th className="px-4 py-3.5 text-left font-medium hidden sm:table-cell">Audience</th>
                      <th className="px-4 py-3.5 text-left font-medium hidden md:table-cell">Scheduled Time</th>
                      <th className="px-4 py-3.5 text-left font-medium">Status</th>
                      <th className="px-4 py-3.5 text-left font-medium hidden lg:table-cell">Sent On</th>
                      <th className="px-4 py-3.5 text-left font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((r, i) => (
                      <tr key={r.id || i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4"><TypeCell type={r.type} /></td>
                        <td className="px-4 py-4 text-gray-700 text-xs font-medium max-w-[140px]">
                          <span className="block truncate">{r.title || r.name || "—"}</span>
                        </td>
                        <td className="px-4 py-4 hidden sm:table-cell">
                          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                            <Users size={12} className="text-gray-400" />
                            {r.audience || "All Users"}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-400 text-xs hidden md:table-cell">{r.scheduledTime || r.scheduledAt || "—"}</td>
                        <td className="px-4 py-4"><StatusBadge status={r.status} /></td>
                        <td className="px-4 py-4 text-gray-400 text-xs hidden lg:table-cell">{r.sentOn || r.sentAt || "—"}</td>
                        <td className="px-4 py-4"><ActionMenu reminder={r} onView={setSelected} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
                <p className="text-xs text-gray-400">Showing {filtered.length} of {total} reminders</p>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft size={14} />
                  </button>
                  {[1, 2, 3, 4].map(n => (
                    <button key={n} onClick={() => setPage(n)} className={`w-7 h-7 rounded-lg text-xs font-medium ${page === n ? "bg-[#1A7A4A] text-white" : "text-gray-500 hover:bg-gray-100"}`}>{n}</button>
                  ))}
                  <span className="text-gray-400 text-xs px-1">...</span>
                  <button className="w-7 h-7 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100">10</button>
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400" onClick={() => setPage(p => p + 1)}>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
