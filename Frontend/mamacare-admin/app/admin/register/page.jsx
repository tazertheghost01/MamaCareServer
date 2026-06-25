"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Baby, Mail, Lock, User, Phone, Loader2, AlertCircle } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const router = useRouter();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    fetch(`${BASE_URL}/api/v1/home/summary`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setStats(data); })
      .catch(() => { });
  }, []);

  const STAT_ITEMS = [
    { label: "Members", value: stats?.totalUsers },
    { label: "Active Pregnancies", value: stats?.activePregnancies },
    { label: "Reminders Sent", value: stats?.remindersSent },
  ];

  const fmt = (v) => v == null ? "—" : v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phoneNumber: form.phone,
          password: form.password,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Registration failed. Please try again.");
      }
      router.push("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#F8FAFB] flex overflow-hidden">

      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex lg:w-[42%] bg-[#1A7A4A] relative overflow-hidden flex-col items-center justify-center p-10">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-28 -right-14 w-[420px] h-[420px] rounded-full bg-white/5" />

        <div className="relative z-10 text-center max-w-xs">
          <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-6 border border-white/20">
            <Baby size={32} color="white" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3 leading-tight">MamaCare<br />Admin</h1>
          <p className="text-white/65 text-sm leading-relaxed">
            Create your admin account to start managing the MamaCare platform.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-2">
            {STAT_ITEMS.map(({ label, value }) => (
              <div key={label} className="bg-white/10 rounded-xl p-3 border border-white/10">
                <p className="text-lg font-bold text-white">{fmt(value)}</p>
                <p className="text-white/55 text-[10px] mt-0.5 leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 overflow-y-auto">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-6 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-[#1A7A4A] flex items-center justify-center">
              <Baby size={18} color="white" strokeWidth={1.5} />
            </div>
            <span className="text-lg font-bold text-[#1A7A4A]">MamaCare Admin</span>
          </div>

          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-900">Create account</h2>
            <p className="text-gray-400 text-sm mt-0.5">Register a new admin account</p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-600 rounded-xl px-3.5 py-2.5 mb-4 text-xs">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">

            {/* First + Last name row */}
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { key: "firstName", label: "First Name", placeholder: "Ada" },
                { key: "lastName", label: "Last Name", placeholder: "Okonkwo" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">{label}</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={e => set(key, e.target.value)}
                      required
                      className="w-full pl-8 pr-2 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white outline-none placeholder-gray-300 focus:border-[#1A7A4A] focus:ring-2 focus:ring-[#1A7A4A]/10 transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  placeholder="admin@mamacareng.com"
                  value={form.email}
                  onChange={e => set("email", e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white outline-none placeholder-gray-300 focus:border-[#1A7A4A] focus:ring-2 focus:ring-[#1A7A4A]/10 transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Phone Number</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="tel"
                  placeholder="+234 800 000 0000"
                  value={form.phone}
                  onChange={e => set("phone", e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white outline-none placeholder-gray-300 focus:border-[#1A7A4A] focus:ring-2 focus:ring-[#1A7A4A]/10 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={e => set("password", e.target.value)}
                  required
                  className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white outline-none placeholder-gray-300 focus:border-[#1A7A4A] focus:ring-2 focus:ring-[#1A7A4A]/10 transition-all"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A7A4A] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#15633C] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
            >
              {loading ? <><Loader2 size={15} className="animate-spin" />Creating account...</> : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-4">
            Already have an account?{" "}
            <a href="/admin/login" className="text-[#1A7A4A] font-semibold hover:underline">Sign in</a>
          </p>

          <p className="text-center text-xs text-gray-400 mt-3">
            MamaCare Admin &copy; {new Date().getFullYear()} &mdash; For authorised personnel only
          </p>
        </div>
      </div>
    </div>
  );
}