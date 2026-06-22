import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({ label, value, change, positive, icon: Icon, iconBg }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-3 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg || "bg-[#E8F5EE]"}`}>
        <Icon size={18} className="text-[#1A7A4A]" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium leading-tight">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5">{value?.toLocaleString()}</p>
        {change !== undefined && (
          <div className={`flex items-center gap-1 mt-0.5 text-[11px] font-medium ${positive ? "text-[#1A7A4A]" : "text-red-500"}`}>
            {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            <span>{change}</span>
          </div>
        )}
      </div>
    </div>
  );
}
