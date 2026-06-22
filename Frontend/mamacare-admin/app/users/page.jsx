"use client";
import { useState, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  Download,
  UserPlus,
  MoreHorizontal,
  Eye,
  Ban,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ServerCrash,
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function StatusBadge({ status }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${status === "Active" ? "bg-[#E8F5EE] text-[#1A7A4A]" : "bg-red-50 text-red-500"}`}>
      {status}
    </span>
  );
}

function ActionMenu({ user }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700">
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
              <Eye size={14} /> View Profile
            </button>
            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50">
              <Ban size={14} /> {user.status === "Active" ? "Deactivate" : "Activate"}
            </button>
            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50">
              <Trash2 size={14} /> Delete User
            </button>
          </div>
        </>
      )}
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
      <p className="text-sm font-medium text-gray-500">No users found</p>
      <p className="text-xs text-gray-400 mt-1">{message}</p>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All Users");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem("mc_token");
    if (!token) { setLoading(false); return; }

    // No user-list endpoint exists yet — this will gracefully show empty state
    fetch(`${BASE_URL}/api/v1/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setUsers(Array.isArray(data) ? data : data?.users || data?.content || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    const name = u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim();
    const matchSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      (u.location || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "All Users" ||
      (filter === "Active" && u.status === "Active") ||
      (filter === "Inactive" && u.status === "Inactive");
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Users</h2>
            <p className="text-sm text-gray-400 mt-0.5">Manage all registered users on the platform.</p>
          </div>
          <button className="flex items-center gap-2 bg-[#1A7A4A] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#15633C] transition-colors self-start">
            <UserPlus size={16} />
            Add New User
          </button>
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-5">
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
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="text-sm text-gray-600 outline-none bg-transparent"
              >
                <option>All Users</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-700">
              <Download size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <Spinner />
        ) : error ? (
          <EmptyState message="Could not load users. The user list endpoint may not be available yet." />
        ) : filtered.length === 0 ? (
          <EmptyState message={search || filter !== "All Users" ? "No users match your search or filter." : "No users have been registered yet."} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 text-xs border-b border-gray-100">
                    <th className="px-5 py-3.5 text-left font-medium">User</th>
                    <th className="px-4 py-3.5 text-left font-medium">Location</th>
                    <th className="px-4 py-3.5 text-left font-medium hidden sm:table-cell">Gestational Age</th>
                    <th className="px-4 py-3.5 text-left font-medium hidden md:table-cell">Joined On</th>
                    <th className="px-4 py-3.5 text-left font-medium">Status</th>
                    <th className="px-4 py-3.5 text-left font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((u, i) => {
                    const name = u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Unknown";
                    return (
                      <tr key={u.id || i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#E8F5EE] flex items-center justify-center text-[#1A7A4A] font-bold text-xs flex-shrink-0">
                              {name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-xs">{name}</p>
                              <p className="text-[11px] text-gray-400 hidden sm:block">{u.email || ""}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-500 text-xs">{u.location || "—"}</td>
                        <td className="px-4 py-4 text-gray-500 text-xs hidden sm:table-cell">{u.gestationalAge || "—"}</td>
                        <td className="px-4 py-4 text-gray-400 text-xs hidden md:table-cell">{u.joinedOn || u.createdAt || "—"}</td>
                        <td className="px-4 py-4"><StatusBadge status={u.status || "Active"} /></td>
                        <td className="px-4 py-4"><ActionMenu user={u} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
              <p className="text-xs text-gray-400">Showing {filtered.length} of {users.length} users</p>
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
  );
}
