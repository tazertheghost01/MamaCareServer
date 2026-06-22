"use client";
import { useState, useEffect } from "react";
import {
  ArrowUpRight,
  RefreshCw,
  CheckCircle2,
  Clock,
  SlidersHorizontal,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  ServerCrash,
  ExternalLink,
  Megaphone,
  HelpCircle,
  Headphones,
  X,
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const STATUS_STYLES = {
  Open: "bg-blue-50 text-blue-600",
  "In Progress": "bg-yellow-50 text-yellow-700",
  Resolved: "bg-[#E8F5EE] text-[#1A7A4A]",
  Closed: "bg-gray-100 text-gray-500",
  Received: "bg-purple-50 text-purple-600",
};

const PRIORITY_STYLES = {
  High: "bg-red-50 text-red-500",
  Medium: "bg-yellow-50 text-yellow-700",
  Low: "bg-[#E8F5EE] text-[#1A7A4A]",
};

const CATEGORY_STYLES = {
  Technical: "bg-blue-50 text-blue-600",
  Bug: "bg-red-50 text-red-500",
  General: "bg-gray-100 text-gray-600",
  Feedback: "bg-purple-50 text-purple-600",
  Billing: "bg-yellow-50 text-yellow-700",
};

const QUICK_LINKS = [
  { label: "View All Requests", icon: ExternalLink, href: "#" },
  { label: "Add Announcement", icon: Megaphone, href: "#" },
  { label: "Manage FAQs", icon: HelpCircle, href: "#" },
  { label: "Contact Support Team", icon: Headphones, href: "#" },
];

const TABS = ["All", "Open", "In Progress", "Resolved", "Closed"];
const PAGE_SIZE = 10;

const STATIC_FAQS = [
  "How do I reset my password?",
  "How can I update my due date?",
  "Why am I not receiving reminders?",
  "How do I delete my account?",
];

function StatusBadge({ status }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLES[status] || "bg-gray-100 text-gray-500"}`}>
      {status || "—"}
    </span>
  );
}

function PriorityBadge({ priority }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${PRIORITY_STYLES[priority] || "bg-gray-100 text-gray-500"}`}>
      {priority || "—"}
    </span>
  );
}

function CategoryBadge({ category }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${CATEGORY_STYLES[category] || "bg-gray-100 text-gray-500"}`}>
      {category || "—"}
    </span>
  );
}

function DonutChart({ open, inProgress, resolved, total }) {
  const size = 120; const r = 44; const cx = size / 2; const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const segments = [
    { key: "Open", count: open, color: "#3B82F6" },
    { key: "In Progress", count: inProgress, color: "#F59E0B" },
    { key: "Resolved", count: resolved, color: "#1A7A4A" },
  ];
  let offset = 0;
  const rendered = segments.map(s => {
    const pct = total > 0 ? s.count / total : 0;
    const dash = pct * circumference;
    const seg = { ...s, dash, offset };
    offset += dash;
    return seg;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth="16" />
      {rendered.map((s, i) => (
        <circle
          key={i} cx={cx} cy={cy} r={r} fill="none"
          stroke={s.color} strokeWidth="16"
          strokeDasharray={`${s.dash} ${circumference - s.dash}`}
          strokeDashoffset={-s.offset}
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
        />
      ))}
      <text x={cx} y={cy - 5} textAnchor="middle" fill="#1E293B" fontSize="16" fontWeight="700">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#94A3B8" fontSize="8">Total</text>
    </svg>
  );
}

function FAQItem({ question }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen(o => !o)}
      className="w-full flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 text-left"
    >
      <span className="text-xs text-gray-700 font-medium pr-2">{question}</span>
      {open ? <ChevronUp size={13} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={13} className="text-gray-400 flex-shrink-0" />}
    </button>
  );
}

function DetailModal({ ticket, onClose }) {
  if (!ticket) return null;
  const name = ticket.name || ticket.userName || `${ticket.firstName || ""} ${ticket.lastName || ""}`.trim() || "Unknown";
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Ticket Details</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={16} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E8F5EE] flex items-center justify-center text-[#1A7A4A] font-bold text-xs flex-shrink-0">
              {name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{name}</p>
              <p className="text-xs text-gray-400">{ticket.email || ticket.userEmail || "—"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Subject", value: ticket.subject || ticket.title || "—" },
              { label: "Category", value: ticket.category || "—" },
              { label: "Status", value: ticket.status || "—" },
              { label: "Priority", value: ticket.priority || "—" },
              { label: "Date", value: ticket.date || ticket.createdAt || "—" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 font-medium">{label}</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
              </div>
            ))}
          </div>
          {(ticket.message || ticket.preview || ticket.body) && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 font-medium mb-1">Message</p>
              <p className="text-sm text-gray-700">{ticket.message || ticket.preview || ticket.body}</p>
            </div>
          )}
        </div>
        <div className="px-6 pb-5 flex gap-2">
          <button className="flex-1 py-2.5 rounded-xl bg-[#1A7A4A] text-white text-sm font-semibold hover:bg-[#15633C]">Mark Resolved</button>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50">Close</button>
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
      <p className="text-sm font-medium text-gray-500">No tickets found</p>
      <p className="text-xs text-gray-400 mt-1">{message}</p>
    </div>
  );
}

export default function SupportFeedbackPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("mc_token");
    if (!token) { setLoading(false); return; }

    fetch(`${BASE_URL}/api/v1/support/tickets`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setTickets(
        Array.isArray(data) ? data : data?.tickets || data?.content || []
      ))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const total = tickets.length;
  const open = tickets.filter(t => t.status === "Open").length;
  const inProgress = tickets.filter(t => t.status === "In Progress").length;
  const resolved = tickets.filter(t => t.status === "Resolved").length;

  const categories = ["All Categories", ...Array.from(new Set(tickets.map(t => t.category).filter(Boolean)))];

  const filtered = tickets.filter(t => {
    const matchTab = activeTab === "All" || t.status === activeTab;
    const matchCat = categoryFilter === "All Categories" || t.category === categoryFilter;
    return matchTab && matchCat;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageNumbers = Array.from({ length: Math.min(4, totalPages) }, (_, i) => i + 1);

  const openPct = total > 0 ? ((open / total) * 100).toFixed(1) : "0";
  const inProgressPct = total > 0 ? ((inProgress / total) * 100).toFixed(1) : "0";
  const resolvedPct = total > 0 ? ((resolved / total) * 100).toFixed(1) : "0";

  return (
    <>
      <DetailModal ticket={selected} onClose={() => setSelected(null)} />
      <div className="space-y-5">

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Requests", value: total, icon: RefreshCw, bg: "bg-[#E8F5EE]", color: "text-[#1A7A4A]", sub: "18.2% / this week" },
            { label: "Open", value: open, icon: ArrowUpRight, bg: "bg-blue-50", color: "text-blue-500", sub: "16.1% / this week" },
            { label: "In Progress", value: inProgress, icon: Clock, bg: "bg-yellow-50", color: "text-yellow-600", sub: "9.4% / this week" },
            { label: "Resolved", value: resolved, icon: CheckCircle2, bg: "bg-purple-50", color: "text-purple-500", sub: "10.4% this week" },
          ].map(({ label, value, icon: Icon, bg, color, sub }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                  <Icon size={16} className={color} />
                </div>
                <p className="text-xs text-gray-400 font-medium">{label}</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{loading ? "—" : value}</p>
              <p className="text-[11px] text-[#1A7A4A] mt-0.5 font-medium">{sub}</p>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex flex-col xl:flex-row gap-4">

          {/* Table */}
          <div className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex flex-wrap items-center gap-1 px-5 py-4 border-b border-gray-100">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === tab ? "bg-[#1A7A4A] text-white" : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5">
                <SlidersHorizontal size={12} className="text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
                  className="text-xs text-gray-600 outline-none bg-transparent"
                >
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {loading ? (
              <Spinner />
            ) : error ? (
              <EmptyState message="Could not load support tickets. Check your connection or API configuration." />
            ) : filtered.length === 0 ? (
              <EmptyState message={activeTab !== "All" || categoryFilter !== "All Categories"
                ? "No tickets match your filter."
                : "No support tickets have been submitted yet."} />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-400 text-xs border-b border-gray-100">
                        <th className="px-5 py-3.5 text-left font-medium">User</th>
                        <th className="px-4 py-3.5 text-left font-medium">Subject</th>
                        <th className="px-4 py-3.5 text-left font-medium hidden sm:table-cell">Category</th>
                        <th className="px-4 py-3.5 text-left font-medium">Status</th>
                        <th className="px-4 py-3.5 text-left font-medium hidden md:table-cell">Priority</th>
                        <th className="px-4 py-3.5 text-left font-medium hidden lg:table-cell">Date</th>
                        <th className="px-4 py-3.5 text-left font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {paginated.map((t, i) => {
                        const name = t.name || t.userName || `${t.firstName || ""} ${t.lastName || ""}`.trim() || "Unknown";
                        const email = t.email || t.userEmail || "";
                        return (
                          <tr key={t.id || i} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#E8F5EE] flex items-center justify-center text-[#1A7A4A] font-bold text-xs flex-shrink-0">
                                  {name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-800 text-xs">{name}</p>
                                  <p className="text-[11px] text-gray-400 hidden sm:block">{email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 max-w-[160px]">
                              <p className="text-xs font-semibold text-gray-800 truncate">{t.subject || t.title || "—"}</p>
                              <p className="text-[11px] text-gray-400 truncate">{t.message || t.preview || ""}</p>
                            </td>
                            <td className="px-4 py-4 hidden sm:table-cell"><CategoryBadge category={t.category || ""} /></td>
                            <td className="px-4 py-4"><StatusBadge status={t.status || ""} /></td>
                            <td className="px-4 py-4 hidden md:table-cell"><PriorityBadge priority={t.priority || ""} /></td>
                            <td className="px-4 py-4 text-gray-400 text-xs hidden lg:table-cell">{t.date || t.createdAt || "—"}</td>
                            <td className="px-4 py-4">
                              <button
                                onClick={() => setSelected(t)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                              >
                                <Eye size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                      <ChevronLeft size={14} />
                    </button>
                    {pageNumbers.map(n => (
                      <button key={n} onClick={() => setPage(n)} className={`w-7 h-7 rounded-lg text-xs font-medium ${page === n ? "bg-[#1A7A4A] text-white" : "text-gray-500 hover:bg-gray-100"}`}>{n}</button>
                    ))}
                    {totalPages > 4 && (
                      <>
                        <span className="text-gray-400 text-xs px-1">...</span>
                        <button onClick={() => setPage(totalPages)} className={`w-7 h-7 rounded-lg text-xs font-medium ${page === totalPages ? "bg-[#1A7A4A] text-white" : "text-gray-500 hover:bg-gray-100"}`}>{totalPages}</button>
                      </>
                    )}
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right sidebar */}
          <div className="w-full xl:w-64 space-y-4 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-center mb-4">
                <DonutChart open={open} inProgress={inProgress} resolved={resolved} total={total} />
              </div>
              <div className="space-y-2">
                {[
                  { label: "Open", value: open, pct: openPct, color: "bg-blue-500" },
                  { label: "In Progress", value: inProgress, pct: inProgressPct, color: "bg-yellow-500" },
                  { label: "Resolved", value: resolved, pct: resolvedPct, color: "bg-[#1A7A4A]" },
                ].map(({ label, value, pct, color }) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />
                      <span className="text-gray-600">{label}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{value} ({pct}%)</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-xs font-bold text-gray-700 mb-3">Quick Links</p>
              <div className="space-y-1">
                {QUICK_LINKS.map(({ label, icon: Icon, href }) => (
                  <a key={label} href={href} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-2.5">
                      <Icon size={14} className="text-gray-400 group-hover:text-[#1A7A4A]" />
                      <span className="text-xs text-gray-600 font-medium">{label}</span>
                    </div>
                    <ChevronRight size={12} className="text-gray-300" />
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-gray-700">Frequently Asked Questions</p>
                <a href="#" className="text-[11px] text-[#1A7A4A] font-medium hover:underline">View All</a>
              </div>
              {STATIC_FAQS.map(q => <FAQItem key={q} question={q} />)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}