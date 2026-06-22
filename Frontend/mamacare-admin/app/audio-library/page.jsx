"use client";
import { useState, useEffect } from "react";
import {
  Music,
  Headphones,
  FileText,
  Archive,
  SlidersHorizontal,
  Languages,
  Search,
  Play,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ServerCrash,
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const LANGUAGE_STYLES = {
  English: "bg-[#E8F5EE] text-[#1A7A4A]",
  Yoruba: "bg-purple-50 text-purple-600",
  Pidgin: "bg-yellow-50 text-yellow-700",
  Hausa: "bg-blue-50 text-blue-600",
  Igbo: "bg-pink-50 text-pink-600",
};

const STATUS_STYLES = {
  Published: "bg-[#E8F5EE] text-[#1A7A4A]",
  Draft: "bg-yellow-50 text-yellow-700",
  Archived: "bg-gray-100 text-gray-500",
};

function LanguageBadge({ language }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${LANGUAGE_STYLES[language] || "bg-gray-100 text-gray-500"}`}>
      {language || "—"}
    </span>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLES[status] || "bg-gray-100 text-gray-500"}`}>
      {status || "—"}
    </span>
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
      <p className="text-sm font-medium text-gray-500">No audio found</p>
      <p className="text-xs text-gray-400 mt-1">{message}</p>
    </div>
  );
}

const PAGE_SIZE = 10;

export default function AudioLibraryPage() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [languageFilter, setLanguageFilter] = useState("All Languages");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem("mc_token");
    if (!token) { setLoading(false); return; }

    fetch(`${BASE_URL}/api/v1/audio`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setTracks(
        Array.isArray(data) ? data : data?.audio || data?.tracks || data?.content || []
      ))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All Categories", ...Array.from(new Set(tracks.map(t => t.category).filter(Boolean)))];
  const languages = ["All Languages", ...Array.from(new Set(tracks.map(t => t.language).filter(Boolean)))];

  const filtered = tracks.filter(t => {
    const title = t.title || t.name || "";
    const matchSearch = title.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "All Categories" || t.category === categoryFilter;
    const matchLang = languageFilter === "All Languages" || t.language === languageFilter;
    return matchSearch && matchCat && matchLang;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageNumbers = Array.from({ length: Math.min(4, totalPages) }, (_, i) => i + 1);

  const total = tracks.length;
  const published = tracks.filter(t => t.status === "Published").length;
  const drafts = tracks.filter(t => t.status === "Draft").length;
  const archived = tracks.filter(t => t.status === "Archived").length;

  const publishedPct = total > 0 ? ((published / total) * 100).toFixed(1) : "0.0";
  const draftsPct = total > 0 ? ((drafts / total) * 100).toFixed(1) : "0.0";
  const archivedPct = total > 0 ? ((archived / total) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-2">
          <SlidersHorizontal size={13} className="text-gray-400" />
          <select
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
            className="text-sm text-gray-600 outline-none bg-transparent"
          >
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-2">
          <Languages size={13} className="text-gray-400" />
          <select
            value={languageFilter}
            onChange={e => { setLanguageFilter(e.target.value); setPage(1); }}
            className="text-sm text-gray-600 outline-none bg-transparent"
          >
            {languages.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 w-full sm:w-56">
          <Search size={13} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search audio..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="bg-transparent text-sm text-gray-600 outline-none w-full placeholder-gray-400"
          />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Audio", value: total, sub: "All time", icon: Music, bg: "bg-purple-50", color: "text-purple-500" },
          { label: "Published", value: published, sub: `${publishedPct}%`, icon: Headphones, bg: "bg-[#E8F5EE]", color: "text-[#1A7A4A]" },
          { label: "Drafts", value: drafts, sub: `${draftsPct}%`, icon: FileText, bg: "bg-yellow-50", color: "text-yellow-600" },
          { label: "Archived", value: archived, sub: `${archivedPct}%`, icon: Archive, bg: "bg-red-50", color: "text-red-500" },
        ].map(({ label, value, sub, icon: Icon, bg, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-1">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                <Icon size={18} className={color} />
              </div>
              <p className="text-xs text-gray-400 font-medium">{label}</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{loading ? "—" : value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <Spinner />
        ) : error ? (
          <EmptyState message="Could not load audio tracks. Check your connection or API configuration." />
        ) : filtered.length === 0 ? (
          <EmptyState message={
            search || categoryFilter !== "All Categories" || languageFilter !== "All Languages"
              ? "No tracks match your search or filters."
              : "No audio has been uploaded yet."
          } />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 text-xs border-b border-gray-100">
                    <th className="px-5 py-3.5 text-left font-medium">Title</th>
                    <th className="px-4 py-3.5 text-left font-medium hidden sm:table-cell">Category</th>
                    <th className="px-4 py-3.5 text-left font-medium">Language</th>
                    <th className="px-4 py-3.5 text-left font-medium hidden md:table-cell">Duration</th>
                    <th className="px-4 py-3.5 text-left font-medium">Status</th>
                    <th className="px-4 py-3.5 text-left font-medium hidden lg:table-cell">Updated On</th>
                    <th className="px-4 py-3.5 text-left font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map((t, i) => {
                    const title = t.title || t.name || "Untitled";
                    return (
                      <tr key={t.id || i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <button className="w-7 h-7 rounded-full bg-[#E8F5EE] flex items-center justify-center flex-shrink-0 hover:bg-[#1A7A4A] group transition-colors">
                              <Play size={11} className="text-[#1A7A4A] group-hover:text-white ml-0.5" />
                            </button>
                            <span className="font-semibold text-gray-800 text-xs">{title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-500 text-xs hidden sm:table-cell">{t.category || "—"}</td>
                        <td className="px-4 py-4"><LanguageBadge language={t.language || ""} /></td>
                        <td className="px-4 py-4 text-gray-500 text-xs hidden md:table-cell">{t.duration || "—"}</td>
                        <td className="px-4 py-4"><StatusBadge status={t.status || ""} /></td>
                        <td className="px-4 py-4 text-gray-400 text-xs hidden lg:table-cell">{t.updatedOn || t.updatedAt || "—"}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <button className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors">
                              <Edit2 size={14} />
                            </button>
                            <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} tracks
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
    </div>
  );
}