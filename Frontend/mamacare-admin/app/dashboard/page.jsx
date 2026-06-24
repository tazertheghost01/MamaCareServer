"use client";
import { useState, useEffect } from "react";
import {
  Users,
  Baby,
  CalendarCheck,
  Bell,
  MessageSquare,
  UserPlus,
  CalendarPlus,
  SendHorizontal,
  FilePlus,
  MoreHorizontal,
  ArrowRight,
  Clock,
  Loader2,
  ServerCrash,
} from "lucide-react";
import StatCard from "@/components/StatCard";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function StatusBadge({ status }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${status === "Active" ? "bg-[#E8F5EE] text-[#1A7A4A]" : "bg-red-50 text-red-500"}`}>
      {status}
    </span>
  );
}

const LOCATION_DATA = [
  { city: "Lagos", pct: 35, color: "#1A7A4A" },
  { city: "Abuja", pct: 20, color: "#4CAF82" },
  { city: "Oyo", pct: 12, color: "#F4C542" },
  { city: "Kano", pct: 7, color: "#F48C6F" },
  { city: "Others", pct: 10, color: "#CBD5E1" },
];

const QUICK_ACTIONS = [
  { label: "Add New User", icon: UserPlus, href: "/users?new=1", color: "bg-[#E8F5EE] text-[#1A7A4A]" },
  { label: "Add Audio", icon: FilePlus, href: "/audio-library?new=1", color: "bg-purple-50 text-purple-600" },
  { label: "Send Notification", icon: SendHorizontal, href: "/notifications?new=1", color: "bg-yellow-50 text-yellow-600" },
  { label: "Create Content", icon: FilePlus, href: "/community?new=1", color: "bg-red-50 text-red-500" },
];

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 size={24} className="animate-spin text-[#1A7A4A]" />
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <ServerCrash size={32} className="text-gray-300 mb-3" />
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("mc_user");
    if (stored) setUser(JSON.parse(stored));

    const token = localStorage.getItem("mc_token");
    if (!token) { setLoading(false); return; }

        fetch(`${BASE_URL}/api/v1/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        // Map metrics to a dictionary for easy access
        const metricMap = {};
        (data?.metrics || []).forEach(m => {
          metricMap[m.key] = m.value;
        });
        const mappedSummary = {
          totalUsers: metricMap.total_users ?? "—",
          activePregnancies: metricMap.active_pregnancies ?? "—",
          appointments: metricMap.appointments ?? "—",
          remindersSent: metricMap.reminders_sent ?? "—",
          communityPosts: metricMap.community_posts ?? "—",
          // Placeholder values for optional fields
          growthData: [],
          locationData: [],
          totalUsersCount: metricMap.total_users ?? 0,
        };
        setSummary(mappedSummary);
        const recentActivities = data?.recentActivities || [];
        const recentUsers = recentActivities.filter(a => a.type === "USER");
        setRecentUsers(recentUsers);
        setActivity(recentActivities);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const displayName = user?.name || user?.firstName || "Admin";

  return (
    <div className="space-y-6">
      {/* Welcome row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Welcome back, {displayName}!</h2>
          <p className="text-sm text-gray-400">Here is what is happening with MamaCare.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-2 self-start">
          <CalendarCheck size={14} />
          <span>May 19 – May 25, 2026</span>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <EmptyState message="Could not load dashboard data. Check your connection or API configuration." />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
            <StatCard label="Total Users" value={summary?.totalUsers ?? "—"} change={summary?.userGrowthChange} positive icon={Users} iconBg="bg-[#E8F5EE]" />
            <StatCard label="Active Pregnancies" value={summary?.activePregnancies ?? "—"} change={summary?.pregnancyChange} positive icon={Baby} iconBg="bg-pink-50" />
            <StatCard label="Appointments" value={summary?.appointments ?? "—"} change={summary?.appointmentsChange} positive icon={CalendarCheck} iconBg="bg-blue-50" />
            <StatCard label="Reminders Sent" value={summary?.remindersSent ?? "—"} change={summary?.remindersChange} positive icon={Bell} iconBg="bg-yellow-50" />
            <StatCard label="Community Posts" value={summary?.communityPosts ?? "—"} change={summary?.postsChange} positive icon={MessageSquare} iconBg="bg-purple-50" />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-gray-800">User Growth</p>
                <select className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-500 outline-none">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                </select>
              </div>
              {summary?.growthData?.length > 0 ? (
                <UserGrowthChart data={summary.growthData} />
              ) : (
                <EmptyState message="No growth data available yet." />
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="font-semibold text-gray-800 mb-4">Users by Location</p>
              {summary?.locationData?.length > 0 ? (
                <>
                  <div className="flex items-center justify-center mb-4">
                    <DonutChart data={summary.locationData} total={summary.totalUsers} />
                  </div>
                  <div className="space-y-2">
                    {summary.locationData.map(d => (
                      <div key={d.city} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                          <span className="text-gray-600">{d.city}</span>
                        </div>
                        <span className="font-semibold text-gray-800">{d.pct}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState message="No location data available yet." />
              )}
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Recent users */}
            <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <p className="font-semibold text-gray-800">Recent Users</p>
                <a href="/users" className="flex items-center gap-1 text-xs text-[#1A7A4A] font-medium hover:underline">
                  View all users <ArrowRight size={12} />
                </a>
              </div>
              {recentUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-400 text-xs">
                        <th className="px-5 py-3 text-left font-medium">User</th>
                        <th className="px-4 py-3 text-left font-medium">Location</th>
                        <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Gest. Age</th>
                        <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Joined On</th>
                        <th className="px-4 py-3 text-left font-medium">Status</th>
                        <th className="px-4 py-3 text-left font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {recentUsers.map((u, i) => (
                        <tr key={i} className="hover:bg-gray-50/50">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-[#E8F5EE] flex items-center justify-center text-[#1A7A4A] font-bold text-[11px] flex-shrink-0">
                                {(u.name || u.firstName || "U").slice(0, 2).toUpperCase()}
                              </div>
                              <span className="font-medium text-gray-800 text-xs">{u.name || `${u.firstName} ${u.lastName}`}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-gray-500 text-xs">{u.location || "—"}</td>
                          <td className="px-4 py-3.5 text-gray-500 text-xs hidden sm:table-cell">{u.gestationalAge || "—"}</td>
                          <td className="px-4 py-3.5 text-gray-400 text-xs hidden md:table-cell">{u.joinedOn || u.createdAt || "—"}</td>
                          <td className="px-4 py-3.5"><StatusBadge status={u.status || "Active"} /></td>
                          <td className="px-4 py-3.5">
                            <button className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100">
                              <MoreHorizontal size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState message="No users yet." />
              )}
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {/* Recent activity */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-semibold text-gray-800">Recent Activity</p>
                  <a href="#" className="text-xs text-[#1A7A4A] font-medium hover:underline">View All</a>
                </div>
                {activity.length > 0 ? (
                  <div className="space-y-3">
                    {activity.map((a, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#E8F5EE] flex items-center justify-center flex-shrink-0">
                          <Bell size={12} className="text-[#1A7A4A]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-gray-800 leading-tight">{a.text}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{a.sub}</p>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 flex-shrink-0">
                          <Clock size={10} />
                          {a.time}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState message="No recent activity." />
                )}
              </div>

              {/* Quick actions — always visible */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <p className="font-semibold text-gray-800 mb-4">Quick Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_ACTIONS.map(q => (
                    <a key={q.label} href={q.href} className={`flex flex-col items-center gap-2 p-3 rounded-xl text-center text-xs font-medium hover:opacity-80 transition-opacity ${q.color}`}>
                      <q.icon size={20} />
                      {q.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function UserGrowthChart({ data }) {
  const values = data.map(d => d.value);
  const labels = data.map(d => d.label);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const w = 540; const h = 160; const pad = 12;

  const coords = values.map((v, i) => [
    pad + (i / (values.length - 1)) * (w - pad * 2),
    pad + ((max - v) / (max - min || 1)) * (h - pad * 2),
  ]);

  const pathD = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const areaD = `${pathD} L${coords[coords.length - 1][0]},${h} L${coords[0][0]},${h} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h + 28}`} className="w-full min-w-[300px]">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1A7A4A" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#1A7A4A" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#chartGrad)" />
        <path d={pathD} fill="none" stroke="#1A7A4A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {coords.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.5" fill="#1A7A4A" stroke="white" strokeWidth="2" />)}
        {labels.map((l, i) => {
          const x = pad + (i / (labels.length - 1)) * (w - pad * 2);
          return <text key={i} x={x} y={h + 18} textAnchor="middle" fill="#94A3B8" fontSize="10">{l}</text>;
        })}
      </svg>
    </div>
  );
}

function DonutChart({ data, total }) {
  const size = 130; const r = 48; const cx = size / 2; const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const segments = data.map(d => {
    const dash = (d.pct / 100) * circumference;
    const seg = { ...d, dash, offset };
    offset += dash;
    return seg;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth="18" />
      {segments.map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth="18"
          strokeDasharray={`${s.dash} ${circumference - s.dash}`}
          strokeDashoffset={-s.offset}
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }} />
      ))}
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#1E293B" fontSize="16" fontWeight="700">
        {total >= 1000 ? `${(total / 1000).toFixed(0)}K` : total}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#94A3B8" fontSize="8">Total</text>
    </svg>
  );
}
