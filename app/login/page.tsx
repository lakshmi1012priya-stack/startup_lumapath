'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push('/ledger');
      } else {
        setError('Incorrect password. Please try again.');
        setLoading(false);
      }
    } catch {
      setError('Incorrect password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* LumaPath logo — same markup as Navbar */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <div className="leading-tight">
            <span className="text-white font-bold text-lg tracking-tight">LumaPath</span>
            <span className="block text-violet-400 text-[9px] font-semibold tracking-widest uppercase -mt-1">Digital Moi Express</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-xl">
          <h1 className="text-white font-extrabold text-xl mb-1">Admin Access</h1>
          <p className="text-slate-400 text-sm mb-6">Enter your password to access the dashboard.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5">Password</label>
              <input
                type="password"
                placeholder="Admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none text-sm"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-lg shadow-violet-900/40"
            >
              {loading ? '⏳ Verifying...' : 'Access Dashboard'}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-slate-400 hover:text-violet-400 text-sm transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
