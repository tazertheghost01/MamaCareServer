"use client";
import { useState, useEffect } from "react";
import { Loader2, Plus, UploadCloud, Trash2, Edit2 } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DailyGoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadText, setUploadText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = () => {
    setLoading(true);
    const token = localStorage.getItem("mc_token");
    fetch(`${BASE_URL}/api/v1/admin/daily-goals`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setGoals(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleBulkUpload = async () => {
    if (!uploadText.trim()) return;
    setUploading(true);
    try {
      const token = localStorage.getItem("mc_token");
      const res = await fetch(`${BASE_URL}/api/v1/admin/daily-goals/bulk`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "text/plain"
        },
        body: uploadText
      });
      if (res.ok) {
        setUploadText("");
        setShowUploadModal(false);
        fetchGoals();
      } else {
        alert("Upload failed.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;
    try {
      const token = localStorage.getItem("mc_token");
      await fetch(`${BASE_URL}/api/v1/admin/daily-goals/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchGoals();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">System Daily Goals</h2>
          <p className="text-sm text-gray-500">Manage the global goals that appear for users based on their pregnancy day.</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-[#1A7A4A] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-[#14603A]"
        >
          <UploadCloud size={16} /> Bulk Upload Goals
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center"><Loader2 size={24} className="animate-spin text-[#1A7A4A]" /></div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3">Day</th>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {goals.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-gray-400">No system goals found.</td>
                </tr>
              ) : goals.map(goal => (
                <tr key={goal.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {goal.pregnancyDay <= 0 ? "Everyday" : `Day ${goal.pregnancyDay}`}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{goal.title}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">{goal.category}</span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button className="text-gray-400 hover:text-blue-500"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(goal.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-2">Bulk Upload Goals</h3>
            <p className="text-sm text-gray-500 mb-4">
              Paste one goal per line. They will be added sequentially starting from the next available pregnancy day.
            </p>
            <textarea
              className="w-full h-64 border border-gray-200 rounded-lg p-3 text-sm mb-4 outline-none focus:border-[#1A7A4A]"
              placeholder="Drink plenty of water...&#10;Go for a 15-minute walk...&#10;Take prenatal vitamins..."
              value={uploadText}
              onChange={(e) => setUploadText(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkUpload}
                disabled={uploading}
                className="bg-[#1A7A4A] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#14603A]"
              >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                Upload List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
