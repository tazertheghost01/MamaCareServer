"use client";
import { useState, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  Download,
  Plus,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Baby,
  Loader2,
  ServerCrash,
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const TRIMESTER_STYLES = {
  "1st Trimester": "bg-blue-50 text-blue-600",
  "2nd Trimester": "bg-pink-50 text-pink-600",
  "3rd Trimester": "bg-yellow-50 text-yellow-700",
};

function TrimesterBadge({ trimester }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${TRIMESTER_STYLES[trimester] || "bg-gray-100 text-gray-500"}`}>
      {trimester || "—"}
    </span>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${status === "Active" ? "bg-[#E8F5EE] text-[#1A7A4A]" : "bg-red-50 text-red-500"}`}>
      {status}
    </span>
  );
}

function ActionMenu({ record, onView }) {
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
            <button onClick={() => { onView(record); setOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
              <Eye size={14} /> View Details
            </button>
            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50">
              <Edit2 size={14} /> Edit Record
            </button>
            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50">
              <Trash2 size={14} /> Delete Record
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function DetailModal({ record, onClose }) {
  if (!record) return null;
  const name = record.name || `${record.firstName || ""} ${record.lastName || ""}`.trim() || "Unknown";
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Pregnancy Details</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={16} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 font-bold text-sm">
              {name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-gray-900">{name}</p>
              <p className="text-sm text-gray-400">{record.phone || record.phoneNumber || "—"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Trimester", value: record.trimester || "—" },
              { label: "Gestational Age", value: record.gestationalAge || record.weeksPregnant ? `${record.weeksPregnant} weeks` : "—" },
              { label: "Status", value: record.status || "—" },
              { label: "Joined On", value: record.joinedOn || record.createdAt || "—" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 font-medium">{label}</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 pb-5 flex gap-2">
          <button className="flex-1 py-2.5 rounded-xl bg-[#1A7A4A] text-white text-sm font-semibold hover:bg-[#15633C]">Edit Record</button>
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
      <p className="text-sm font-medium text-gray-500">No records found</p>
      <p className="text-xs text-gray-400 mt-1">{message}</p>
    </div>
  );
}

export default function PregnanciesPage() {
  const [pregnancies, setPregnancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All Users");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("mc_token");
    if (!token) { setLoading(false); return; }

    fetch(`${BASE_URL}/api/v1/pregnancy/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setPregnancies(Array.isArray(data) ? data : data?.pregnancies || data?.content || (data ? [data] : [])))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const filtered = pregnancies.filter(p => {
    const name = p.name || `${p.firstName || ""} ${p.lastName || ""}`.trim();
    const matchSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "All Users" ||
      (filter === "Active" && p.status === "Active") ||
      (filter === "Inactive" && p.status === "Inactive") ||
      filter === p.trimester;
    return matchSearch && matchFilter;
  });

  const count = (t) => pregnancies.filter(p => p.trimester === t).length;

  return (
    <>
      <DetailModal record={selected} onClose={() => setSelected(null)} />
      <div className="space-y-5">

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Pregnancies", value: pregnancies.length, bg: "bg-pink-50", color: "text-pink-500" },
            { label: "1st Trimester", value: count("1st Trimester"), bg: "bg-blue-50", color: "text-blue-500" },
            { label: "2nd Trimester", value: count("2nd Trimester"), bg: "bg-[#E8F5EE]", color: "text-[#1A7A4A]" },
            { label: "3rd Trimester", value: count("3rd Trimester"), bg: "bg-yellow-50", color: "text-yellow-600" },
          ].map(({ label, value, bg, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                <Baby size={18} className={color} />
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
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Pregnancies</h2>
                <p className="text-xs text-gray-400 mt-0.5">Monitor and manage pregnancy information.</p>
              </div>
              <button className="flex items-center gap-2 bg-[#1A7A4A] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#15633C] transition-colors self-start">
                <Plus size={16} />
                Add New Pregnancy
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-full sm:w-64">
                <Search size={14} className="text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-transparent text-sm text-gray-600 outline-none w-full placeholder-gray-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2">
                  <SlidersHorizontal size={14} className="text-gray-400" />
                  <select value={filter} onChange={e => setFilter(e.target.value)} className="text-sm text-gray-600 outline-none bg-transparent">
                    <option>All Users</option>
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>1st Trimester</option>
                    <option>2nd Trimester</option>
                    <option>3rd Trimester</option>
                  </select>
                </div>
                <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-700">
                  <Download size={16} />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <Spinner />
          ) : error ? (
            <EmptyState message="Could not load pregnancy records. The endpoint may not be available yet." />
          ) : filtered.length === 0 ? (
            <EmptyState message={search || filter !== "All Users" ? "No records match your search or filter." : "No pregnancy records have been added yet."} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-400 text-xs border-b border-gray-100">
                      <th className="px-5 py-3.5 text-left font-medium">User</th>
                      <th className="px-4 py-3.5 text-left font-medium">Trimester</th>
                      <th className="px-4 py-3.5 text-left font-medium hidden sm:table-cell">Gestational Age</th>
                      <th className="px-4 py-3.5 text-left font-medium hidden md:table-cell">Joined On</th>
                      <th className="px-4 py-3.5 text-left font-medium">Status</th>
                      <th className="px-4 py-3.5 text-left font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((p, i) => {
                      const name = p.name || `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Unknown";
                      const age = p.gestationalAge || (p.weeksPregnant ? `${p.weeksPregnant} weeks` : "—");
                      return (
                        <tr key={p.id || i} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 font-bold text-xs flex-shrink-0">
                                {name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                              </div>
                              <span className="font-semibold text-gray-800 text-xs">{name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4"><TrimesterBadge trimester={p.trimester} /></td>
                          <td className="px-4 py-4 text-gray-500 text-xs hidden sm:table-cell">{age}</td>
                          <td className="px-4 py-4 text-gray-400 text-xs hidden md:table-cell">{p.joinedOn || p.createdAt || "—"}</td>
                          <td className="px-4 py-4"><StatusBadge status={p.status || "Active"} /></td>
                          <td className="px-4 py-4"><ActionMenu record={p} onView={setSelected} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
                <p className="text-xs text-gray-400">Showing {filtered.length} of {pregnancies.length} records</p>
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
