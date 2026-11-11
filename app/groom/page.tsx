'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Submission {
  transactionId: string;
  name: string;
  address: string;
  phone: string;
  amount: number;
  allocation: string;
  paymentMode: string;
  timestamp: string;
  event: string;
}

type TabFilter = 'All' | 'Groom Only' | 'Shared';

export default function GroomPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<TabFilter>('All');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/submissions');
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        if (res.ok) {
          const data: Submission[] = await res.json();
          setSubmissions(data);
          return;
        }
      } catch {
        // Network error — fall back to localStorage
      }
      const data: Submission[] = JSON.parse(localStorage.getItem('moi_submissions') ?? '[]');
      setSubmissions(data);
    };
    load();
  }, [router]);

  // Groom-relevant: Groom or Both
  const groomRelevant = submissions.filter(
    (s) => s.allocation === 'Groom' || s.allocation === 'Both'
  );

  const totalReceived = groomRelevant.reduce((acc, s) => acc + s.amount, 0);
  const guestCount = groomRelevant.length;
  const groomOnly = groomRelevant.filter((s) => s.allocation === 'Groom').reduce((acc, s) => acc + s.amount, 0);
  const sharedBoth = groomRelevant.filter((s) => s.allocation === 'Both').reduce((acc, s) => acc + s.amount, 0);

  const tabFiltered = groomRelevant.filter((s) => {
    if (tab === 'Groom Only') return s.allocation === 'Groom';
    if (tab === 'Shared') return s.allocation === 'Both';
    return true;
  });

  const filtered = tabFiltered
    .filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.address.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-slate-400 hover:text-violet-400 text-sm flex items-center gap-1 mb-4 transition-colors">
            ← Back to Home
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">🤵 Suresh&apos;s Gift Hub</h1>
              <p className="text-slate-400 text-sm mt-1">Suresh &amp; Priya Wedding · Raja Mahal, Chennai</p>
            </div>
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/40 rounded-full px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              <span className="text-blue-300 text-xs font-semibold">GROOM DASHBOARD</span>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Received', value: `₹${totalReceived.toLocaleString('en-IN')}`, icon: '💰' },
            { label: 'Guest Count', value: guestCount.toString(), icon: '👥' },
            { label: 'Groom Only', value: `₹${groomOnly.toLocaleString('en-IN')}`, icon: '🤵' },
            { label: 'Shared (Both)', value: `₹${sharedBoth.toLocaleString('en-IN')}`, icon: '💑' },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{stat.icon}</span>
                <span className="text-slate-400 text-xs font-medium">{stat.label}</span>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or village..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none text-sm"
            />
          </div>
          <div className="flex gap-1 bg-slate-800 border border-slate-700 rounded-lg p-1">
            {(['All', 'Groom Only', 'Shared'] as TabFilter[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  tab === t
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Table / List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-slate-800 rounded-2xl border border-slate-700">
            <div className="text-5xl mb-4">🤵</div>
            <h3 className="text-white font-bold text-lg mb-2">No contributions yet</h3>
            <p className="text-slate-400 text-sm mb-4">Contributions will appear here as guests submit their Moi gifts.</p>
            <Link href="/pay" className="inline-block px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors">
              Go to Payment Portal
            </Link>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-900/60 border-b border-slate-700">
                    <th className="px-4 py-3 text-left text-slate-400 font-semibold">#</th>
                    <th className="px-4 py-3 text-left text-slate-400 font-semibold">Guest Name</th>
                    <th className="px-4 py-3 text-left text-slate-400 font-semibold hidden md:table-cell">Village / Address</th>
                    <th className="px-4 py-3 text-left text-slate-400 font-semibold hidden lg:table-cell">Phone</th>
                    <th className="px-4 py-3 text-right text-slate-400 font-semibold">Amount</th>
                    <th className="px-4 py-3 text-center text-slate-400 font-semibold">For</th>
                    <th className="px-4 py-3 text-left text-slate-400 font-semibold hidden lg:table-cell">Mode</th>
                    <th className="px-4 py-3 text-left text-slate-400 font-semibold hidden xl:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <tr key={s.transactionId} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="text-white font-medium">{s.name}</div>
                        <div className="text-slate-500 text-xs font-mono">{s.transactionId}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-300 hidden md:table-cell">{s.address}</td>
                      <td className="px-4 py-3 text-slate-300 hidden lg:table-cell">{s.phone}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-white font-bold">₹{s.amount.toLocaleString('en-IN')}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          s.allocation === 'Both'
                            ? 'bg-violet-500/20 text-violet-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}>{s.allocation}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 hidden lg:table-cell">{s.paymentMode}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs hidden xl:table-cell">
                        {new Date(s.timestamp).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900/40 border-t border-slate-600">
                    <td colSpan={4} className="px-4 py-3 text-slate-400 font-semibold">Total ({filtered.length} entries)</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-emerald-400 font-extrabold">
                        ₹{filtered.reduce((acc, s) => acc + s.amount, 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
