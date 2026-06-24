'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/v1/auth/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Request failed');
      }
      const data = await res.json();
      setMessage(data.message || 'Verification code sent to your email.');
      // Pass email via query string to reset page
      router.push({ pathname: '/admin/reset-password', query: { email } });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="w-full max-w-md rounded-xl bg-white/10 backdrop-blur-lg p-8 shadow-xl">
        <h1 className="mb-6 text-center text-2xl font-bold text-white">Forgot Password</h1>
        {error && <p className="mb-4 text-center text-red-300">{error}</p>}
        {message && <p className="mb-4 text-center text-green-300">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded border border-gray-300 bg-white/20 px-3 py-2 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            className="w-full rounded bg-indigo-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            Send Reset Code
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-200">
          <a href="/admin/login" className="hover:underline">Back to Login</a>
        </div>
      </div>
    </div>
  );
}
