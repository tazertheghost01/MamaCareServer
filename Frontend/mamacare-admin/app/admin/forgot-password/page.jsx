"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Baby, Mail, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Request failed. Please try again.");
      }
      setSent(true);
      setTimeout(() => router.push(`/reset-password?email=${encodeURIComponent(email)}`), 2000);
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
            Enter the email address linked to your admin account and we'll send you a reset code.
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-[#1A7A4A] flex items-center justify-center">
              <Baby size={18} color="white" strokeWidth={1.5} />
            </div>
            <span className="text-lg font-bold text-[#1A7A4A]">MamaCare Admin</span>
          </div>

          {sent ? (
            /* ── Success state ── */
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#E8F5EE] flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={32} className="text-[#1A7A4A]" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-1">
                We sent a reset code to
              </p>
              <p className="text-gray-700 font-semibold text-sm mb-6">{email}</p>
              <p className="text-xs text-gray-400">Redirecting you to reset your password...</p>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Forgot password?</h2>
                <p className="text-gray-400 text-sm mt-0.5">
                  Enter your email and we'll send you a reset code.
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-600 rounded-xl px-3.5 py-2.5 mb-4 text-xs">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="email"
                      placeholder="admin@mamacareng.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white outline-none placeholder-gray-300 focus:border-[#1A7A4A] focus:ring-2 focus:ring-[#1A7A4A]/10 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1A7A4A] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#15633C] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
                >
                  {loading ? (
                    <><Loader2 size={15} className="animate-spin" />Sending code...</>
                  ) : (
                    "Send Reset Code"
                  )}
                </button>
              </form>
            </>
          )}

          <a href="/login" className="flex items-center justify-center gap-1.5 text-sm text-gray-400 hover:text-[#1A7A4A] transition-colors mt-6">
            <ArrowLeft size={14} />
            Back to Sign In
          </a>

          <p className="text-center text-xs text-gray-400 mt-4">
            MamaCare Admin &copy; {new Date().getFullYear()} &mdash; For authorised personnel only
          </p>
        </div>
      </div>
    </div>
  );
}