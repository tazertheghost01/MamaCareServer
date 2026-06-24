"use client";
import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, Edit2, Volume2, Globe } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LearnTipsPage() {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = () => {
    setLoading(true);
    fetch(`${BASE_URL}/api/v1/learn/tips`)
      .then(r => r.json())
      .then(data => setTips(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this tip?")) return;
    try {
      const token = localStorage.getItem("mc_token");
      await fetch(`${BASE_URL}/api/v1/admin/learn/cards/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTips();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Learn Tips</h2>
          <p className="text-sm text-gray-500">Manage educational content and translations for users.</p>
        </div>
        <button
          className="bg-[#1A7A4A] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-[#14603A]"
        >
          <Plus size={16} /> Add New Tip
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center"><Loader2 size={24} className="animate-spin text-[#1A7A4A]" /></div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Duration</th>
                <th className="px-6 py-3">Translations</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tips.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-gray-400">No tips found.</td>
                </tr>
              ) : tips.map(tip => (
                <tr key={tip.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-semibold">{tip.category}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{tip.duration || "N/A"}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {tip.translations && tip.translations.map(t => (
                        <div key={t.language} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs">
                          <Globe size={12} className="text-gray-500" />
                          <span className="uppercase font-semibold text-gray-600">{t.language}</span>
                          {t.audioUrl && <Volume2 size={12} className="text-blue-500 ml-1" />}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button className="text-gray-400 hover:text-blue-500"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(tip.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
