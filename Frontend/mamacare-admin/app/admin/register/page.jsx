"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
export default function AdminRegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/v1/auth/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phoneNumber: phone,
          password,
          // role will be forced server‑side
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Registration failed');
      }
      const data = await res.json();
      // After registration, redirect to login
      router.push('/admin/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="w-full max-w-md rounded-xl bg-white/10 backdrop-blur-lg p-8 shadow-xl">
        <h1 className="mb-6 text-center text-2xl font-bold text-white">Create Admin Account</h1>
        {error && <p className="mb-4 text-center text-red-300">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="w-full rounded border border-gray-300 bg-white/20 px-3 py-2 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="w-full rounded border border-gray-300 bg-white/20 px-3 py-2 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded border border-gray-300 bg-white/20 px-3 py-2 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full rounded border border-gray-300 bg-white/20 px-3 py-2 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded border border-gray-300 bg-white/20 px-3 py-2 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            className="w-full rounded bg-indigo-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            Register
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-200">
          <a href="/admin/login" className="hover:underline">Already have an account? Sign in</a>
        </div>
      </div>
    </div>
  );
}
