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

type TabFilter = 'All Gifts' | 'Bride Only' | 'Groom Only';

export default function LedgerPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<TabFilter>('All Gifts');

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

  const totalCollected = submissions.reduce((acc, s) => acc + s.amount, 0);
  const totalGuests = submissions.length;
  const avgGift = totalGuests > 0 ? Math.round(totalCollected / totalGuests) : 0;

  const tabFiltered = submissions.filter((s) => {
    if (tab === 'Bride Only') return s.allocation === 'Bride';
    if (tab === 'Groom Only') return s.allocation === 'Groom';
    return true;
  });

  const filtered = tabFiltered
    .filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.address.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const displayTotal = filtered.reduce((acc, s) => acc + s.amount, 0);

  const handleExportCSV = async () => {
    const filename = `master-ledger-${Date.now()}.csv`;

    try {
      const res = await fetch('/api/export');
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        return;
      }
    } catch {
      // Network error — fall back to client-side CSV build
    }

    // Client-side CSV fallback
    const headers = ['#', 'Transaction ID', 'Guest Name', 'Village/Address', 'Phone', 'Amount (INR)', 'Gift For', 'Payment Mode', 'Date'];
    const rows = filtered.map((s, i) => [
      i + 1,
      s.transactionId,
      `"${s.name}"`,
      `"${s.address}"`,
      s.phone,
      s.amount,
      s.allocation,
      s.paymentMode,
      new Date(s.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

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
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">📒 Master Ledger</h1>
              <p className="text-slate-400 text-sm mt-1">Digital Moi Express · Suresh &amp; Priya Wedding</p>
            </div>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all shadow-lg shadow-emerald-900/40"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Master Ledger (CSV)
            </button>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Collected', value: `₹${totalCollected.toLocaleString('en-IN')}`, icon: '💰', color: 'violet' },
            { label: 'Total Guests', value: totalGuests.toString(), icon: '👥', color: 'emerald' },
            { label: 'Average Gift', value: `₹${avgGift.toLocaleString('en-IN')}`, icon: '📊', color: 'violet' },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-lg flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                stat.color === 'violet' ? 'bg-violet-500/15' : 'bg-emerald-500/15'
              }`}>
                {stat.icon}
              </div>
              <div>
                <div className="text-slate-400 text-xs font-medium">{stat.label}</div>
                <div className="text-2xl font-extrabold text-white mt-0.5">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Fuzzy search by name or village..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none text-sm"
            />
          </div>
          <div className="flex gap-1 bg-slate-800 border border-slate-700 rounded-lg p-1">
            {(['All Gifts', 'Bride Only', 'Groom Only'] as TabFilter[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
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

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-slate-800 rounded-2xl border border-slate-700">
            <div className="text-5xl mb-4">📒</div>
            <h3 className="text-white font-bold text-lg mb-2">No entries found</h3>
            <p className="text-slate-400 text-sm mb-4">
              {submissions.length === 0
                ? 'No contributions have been recorded yet.'
                : 'No results match your search or filter.'}
            </p>
            {submissions.length === 0 && (
              <Link href="/pay" className="inline-block px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors">
                Go to Payment Portal
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-900/60 border-b border-slate-700">
                    <th className="px-4 py-3 text-left text-slate-400 font-semibold">#</th>
                    <th className="px-4 py-3 text-left text-slate-400 font-semibold">Transaction ID</th>
                    <th className="px-4 py-3 text-left text-slate-400 font-semibold">Guest Name</th>
                    <th className="px-4 py-3 text-left text-slate-400 font-semibold hidden md:table-cell">Village / Address</th>
                    <th className="px-4 py-3 text-left text-slate-400 font-semibold hidden lg:table-cell">Phone</th>
                    <th className="px-4 py-3 text-right text-slate-400 font-semibold">Amount (₹)</th>
                    <th className="px-4 py-3 text-center text-slate-400 font-semibold">For</th>
                    <th className="px-4 py-3 text-left text-slate-400 font-semibold hidden lg:table-cell">Mode</th>
                    <th className="px-4 py-3 text-left text-slate-400 font-semibold hidden xl:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <tr key={s.transactionId} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                      <td className="px-4 py-3 font-mono text-xs text-violet-300">{s.transactionId}</td>
                      <td className="px-4 py-3 text-white font-medium">{s.name}</td>
                      <td className="px-4 py-3 text-slate-300 hidden md:table-cell">{s.address}</td>
                      <td className="px-4 py-3 text-slate-300 hidden lg:table-cell">{s.phone}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-white font-bold">₹{s.amount.toLocaleString('en-IN')}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          s.allocation === 'Both'
                            ? 'bg-violet-500/20 text-violet-300'
                            : s.allocation === 'Bride'
                            ? 'bg-pink-500/20 text-pink-300'
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
                  <tr className="bg-slate-900/40 border-t-2 border-slate-600">
                    <td colSpan={5} className="px-4 py-3 text-slate-300 font-bold">
                      Total — {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-emerald-400 font-extrabold text-base">
                        ₹{displayTotal.toLocaleString('en-IN')}
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
