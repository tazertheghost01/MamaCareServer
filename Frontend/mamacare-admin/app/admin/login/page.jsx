"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/v1/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      // Store JWT securely (localStorage for demo; consider httpOnly cookie in production)
      localStorage.setItem('accessToken', data.accessToken);
      router.push('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="w-full max-w-md rounded-xl bg-white/10 backdrop-blur-lg p-8 shadow-xl">
        <h1 className="mb-6 text-center text-2xl font-bold text-white">Admin Login</h1>
        {error && <p className="mb-4 text-center text-red-300">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            Sign In
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-200">
          <a href="/admin/forgot-password" className="hover:underline">Forgot password?</a> |{' '}
          <a href="/admin/register" className="hover:underline">Create admin account</a>
        </div>
      </div>
    </div>
  );
}
