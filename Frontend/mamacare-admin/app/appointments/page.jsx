"use client";
import { useState, useEffect } from "react";
import {
  CalendarCheck,
  SlidersHorizontal,
  Download,
  MoreHorizontal,
  Eye,
  Bell,
  Trash2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  MapPin,
  Building2,
  XCircle,
  CalendarClock,
  CalendarRange,
  Loader2,
  ServerCrash,
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const STATUS_STYLES = {
  Upcoming: "bg-pink-50 text-pink-600",
  Completed: "bg-[#E8F5EE] text-[#1A7A4A]",
  Missed: "bg-red-50 text-red-500",
};

const REMINDER_STYLES = {
  Sent: "bg-[#E8F5EE] text-[#1A7A4A]",
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

function ReminderBadge({ reminder }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${REMINDER_STYLES[reminder] || "bg-gray-100 text-gray-500"}`}>
      {reminder || "—"}
    </span>
  );
}

function ActionMenu({ appt, onView }) {
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
            <button onClick={() => { onView(appt); setOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
              <Eye size={14} /> View Details
            </button>
            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50">
              <Bell size={14} /> Send Reminder
            </button>
            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#1A7A4A] hover:bg-[#E8F5EE]">
              <CheckCircle2 size={14} /> Mark Completed
            </button>
            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50">
              <Trash2 size={14} /> Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function DetailModal({ appt, onClose }) {
  if (!appt) return null;
  const name = appt.name || `${appt.firstName || ""} ${appt.lastName || ""}`.trim() || "Unknown";
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Appointment Details</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={16} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#E8F5EE] flex items-center justify-center text-[#1A7A4A] font-bold text-sm">
              {name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-gray-900">{name}</p>
              <StatusBadge status={appt.status} />
            </div>
          </div>
          <div className="space-y-3">
            {[
              { icon: Building2, label: "Hospital / Clinic", value: appt.hospital || appt.hospitalName || "—" },
              { icon: Clock, label: "Date & Time", value: appt.dateTime || appt.appointmentDate || "—" },
              { icon: MapPin, label: "Location", value: appt.location || "—" },
              { icon: Bell, label: "Reminder Status", value: appt.reminder || appt.reminderStatus || "—" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <Icon size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 font-medium">{label}</p>
                  <p className="text-sm font-semibold text-gray-800">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 pb-5 flex gap-2">
          <button className="flex-1 py-2.5 rounded-xl bg-[#1A7A4A] text-white text-sm font-semibold hover:bg-[#15633C]">Send Reminder</button>
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
      <p className="text-sm font-medium text-gray-500">No appointments found</p>
      <p className="text-xs text-gray-400 mt-1">{message}</p>
    </div>
  );
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [hospitalFilter, setHospitalFilter] = useState("All Hospitals");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("mc_token");
    if (!token) { setLoading(false); return; }

    // Fetch next upcoming appointment — expand to list endpoint when backend adds it
    fetch(`${BASE_URL}/api/v1/appointments/upcoming/next`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setAppointments(Array.isArray(data) ? data : data?.appointments || data?.content || (data ? [data] : [])))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const total = appointments.length;
  const upcoming = appointments.filter(a => a.status === "Upcoming").length;
  const completed = appointments.filter(a => a.status === "Completed").length;
  const missed = appointments.filter(a => a.status === "Missed").length;

  const locations = ["All Locations", ...new Set(appointments.map(a => a.location).filter(Boolean))];

  const filtered = appointments.filter(a => {
    const matchLocation = locationFilter === "All Locations" || a.location === locationFilter;
    return matchLocation;
  });

  return (
    <>
      <DetailModal appt={selected} onClose={() => setSelected(null)} />
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
            { label: "Total Appointments", value: total, icon: CalendarCheck, bg: "bg-[#E8F5EE]", color: "text-[#1A7A4A]" },
            { label: "Upcoming", value: upcoming, icon: CalendarClock, bg: "bg-blue-50", color: "text-blue-500" },
            { label: "Completed", value: completed, icon: CheckCircle2, bg: "bg-[#E8F5EE]", color: "text-[#1A7A4A]" },
            { label: "Missed", value: missed, icon: XCircle, bg: "bg-red-50", color: "text-red-500" },
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
            <p className="font-semibold text-gray-800">All Appointments</p>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2">
                <SlidersHorizontal size={13} className="text-gray-400" />
                <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="text-sm text-gray-600 outline-none bg-transparent">
                  {locations.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2">
                <Building2 size={13} className="text-gray-400" />
                <select value={hospitalFilter} onChange={e => setHospitalFilter(e.target.value)} className="text-sm text-gray-600 outline-none bg-transparent">
                  <option>All Hospitals</option>
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
            <EmptyState message="Could not load appointments. The list endpoint may not be available yet." />
          ) : filtered.length === 0 ? (
            <EmptyState message={locationFilter !== "All Locations" ? "No appointments match your filter." : "No appointments have been recorded yet."} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-400 text-xs border-b border-gray-100">
                      <th className="px-5 py-3.5 text-left font-medium">User</th>
                      <th className="px-4 py-3.5 text-left font-medium hidden sm:table-cell">Hospital / Clinic</th>
                      <th className="px-4 py-3.5 text-left font-medium hidden md:table-cell">Date & Time</th>
                      <th className="px-4 py-3.5 text-left font-medium">Status</th>
                      <th className="px-4 py-3.5 text-left font-medium hidden sm:table-cell">Reminder</th>
                      <th className="px-4 py-3.5 text-left font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((a, i) => {
                      const name = a.name || `${a.firstName || ""} ${a.lastName || ""}`.trim() || "Unknown";
                      return (
                        <tr key={a.id || i} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#E8F5EE] flex items-center justify-center text-[#1A7A4A] font-bold text-xs flex-shrink-0">
                                {name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                              </div>
                              <span className="font-semibold text-gray-800 text-xs">{name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-gray-500 text-xs hidden sm:table-cell">{a.hospital || a.hospitalName || "—"}</td>
                          <td className="px-4 py-4 text-gray-500 text-xs hidden md:table-cell">{a.dateTime || a.appointmentDate || "—"}</td>
                          <td className="px-4 py-4"><StatusBadge status={a.status} /></td>
                          <td className="px-4 py-4 hidden sm:table-cell"><ReminderBadge reminder={a.reminder || a.reminderStatus} /></td>
                          <td className="px-4 py-4"><ActionMenu appt={a} onView={setSelected} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
                <p className="text-xs text-gray-400">Showing {filtered.length} of {total} appointments</p>
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
