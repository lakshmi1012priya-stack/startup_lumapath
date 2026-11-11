'use client';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ReceiptModal from '@/components/ReceiptModal';

type Allocation = 'Both' | 'Bride' | 'Groom';
type PaymentMode = 'UPI Transfer' | 'Cash to Counter' | 'Card';

interface Submission {
  transactionId: string;
  name: string;
  address: string;
  phone: string;
  amount: number;
  allocation: Allocation;
  paymentMode: PaymentMode;
  timestamp: string;
  event: string;
}

export default function PayPage() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [allocation, setAllocation] = useState<Allocation>('Both');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI Transfer');
  const [submitting, setSubmitting] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !phone.trim() || !amountStr.trim()) {
      alert('Please fill in all fields.');
      return;
    }
    const amount = parseInt(amountStr, 10);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid Moi amount.');
      return;
    }

    setSubmitting(true);

    let submission: Submission | null = null;

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          address: address.trim(),
          phone: phone.trim(),
          amount,
          allocation,
          paymentMode,
        }),
      });

      if (res.status === 201) {
        submission = (await res.json()) as Submission;
      }
    } catch {
      // Network error — fall through to localStorage fallback
    }

    if (!submission) {
      // localStorage fallback
      const counter = parseInt(localStorage.getItem('moi_tx_counter') ?? '100001', 10);
      const transactionId = `MOI-${counter.toString().padStart(6, '0')}`;
      localStorage.setItem('moi_tx_counter', (counter + 1).toString());

      submission = {
        transactionId,
        name: name.trim(),
        address: address.trim(),
        phone: `+91 ${phone.trim()}`,
        amount,
        allocation,
        paymentMode,
        timestamp: new Date().toISOString(),
        event: 'Suresh & Priya Wedding | Raja Mahal, Chennai',
      };
    }

    // Always persist to localStorage as offline fallback
    const existing: Submission[] = JSON.parse(localStorage.getItem('moi_submissions') ?? '[]');
    existing.push(submission);
    localStorage.setItem('moi_submissions', JSON.stringify(existing));

    setSubmitting(false);
    setCurrentSubmission(submission);
  };

  const handleClose = () => {
    setCurrentSubmission(null);
    setName('');
    setAddress('');
    setPhone('');
    setAmountStr('');
    setAllocation('Both');
    setPaymentMode('UPI Transfer');
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      {currentSubmission && (
        <ReceiptModal submission={currentSubmission} onClose={handleClose} />
      )}

      <div className="pt-24 pb-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8">
          <Link href="/" className="text-slate-400 hover:text-violet-400 text-sm flex items-center gap-1 mb-4 transition-colors">
            ← Back to Home
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">QR Payment Portal</h1>
              <p className="text-slate-400 text-sm mt-1">
                <span className="text-violet-300 font-semibold">Suresh &amp; Priya Wedding</span> · Raja Mahal, Chennai
              </p>
            </div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 rounded-full px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-300 text-xs font-semibold">ACCEPTING CONTRIBUTIONS</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left — QR Card */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-xl h-fit">
            <h2 className="text-white font-bold text-lg mb-5">Scan &amp; Pay via UPI</h2>

            {/* QR visual */}
            <div className="bg-white rounded-2xl p-5 mb-5 mx-auto w-fit">
              <div className="w-48 h-48 relative">
                {/* Outer corner markers */}
                {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0'].map((pos) => (
                  <div key={pos} className={`absolute ${pos} w-10 h-10 border-4 border-slate-900`} style={{
                    borderRight: pos.includes('left-0') && !pos.includes('right') ? 'none' : undefined,
                    borderBottom: pos.includes('top-0') ? 'none' : undefined,
                    borderLeft: pos.includes('right-0') ? 'none' : undefined,
                  }} />
                ))}
                {/* Inner grid of squares to simulate QR */}
                <div className="grid grid-cols-10 gap-0.5 p-3 w-full h-full">
                  {Array.from({ length: 100 }).map((_, i) => {
                    const on = [0,1,3,5,7,9,10,14,15,19,20,21,25,28,30,34,36,40,42,46,50,55,60,65,70,75,80,85,90,95,22,33,44,55,66,77,88,99,11,22,45,56,67,2,13,24,35,47,58,69,8,18,29,38,48,59,68,79,89].includes(i);
                    return (
                      <div
                        key={i}
                        className={`rounded-sm ${on ? 'bg-slate-900' : 'bg-transparent'}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="text-center mb-5">
              <div className="bg-slate-900 rounded-lg px-4 py-2 inline-block">
                <span className="text-violet-300 font-mono font-bold text-sm">sureshpriya@upi</span>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between bg-slate-900/60 rounded-lg px-4 py-2.5 border border-slate-700">
                <span className="text-slate-400">Event</span>
                <span className="text-white font-medium">Suresh &amp; Priya Wedding</span>
              </div>
              <div className="flex justify-between bg-slate-900/60 rounded-lg px-4 py-2.5 border border-slate-700">
                <span className="text-slate-400">Venue</span>
                <span className="text-white font-medium">Raja Mahal, Chennai</span>
              </div>
              {amountStr && parseInt(amountStr, 10) > 0 && (
                <div className="flex justify-between bg-violet-500/20 rounded-lg px-4 py-2.5 border border-violet-500/40">
                  <span className="text-violet-300">Amount</span>
                  <span className="text-white font-bold">₹{parseInt(amountStr, 10).toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            <div className="mt-5 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
              <p className="text-emerald-400 text-xs font-semibold">🔒 Secured by LumaPath Digital Moi Express</p>
              <p className="text-slate-500 text-xs mt-1">All transactions are digitally logged and receipted</p>
            </div>
          </div>

          {/* Right — Guest Form */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-xl">
            <h2 className="text-white font-bold text-lg mb-5">Guest Information</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1.5">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none w-full text-sm"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1.5">Address / Village *</label>
                <input
                  type="text"
                  placeholder="e.g. Thanjavur, Tamil Nadu"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none w-full text-sm"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1.5">Phone Number *</label>
                <div className="flex">
                  <span className="bg-slate-700 border border-r-0 border-slate-600 rounded-l-lg px-3 py-3 text-slate-300 text-sm font-medium">+91</span>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="flex-1 bg-slate-900 border border-slate-600 rounded-r-lg px-4 py-3 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1.5">Moi Amount (₹) *</label>
                <div className="flex">
                  <span className="bg-slate-700 border border-r-0 border-slate-600 rounded-l-lg px-3 py-3 text-slate-300 text-sm font-medium">₹</span>
                  <input
                    type="number"
                    placeholder="e.g. 1001"
                    value={amountStr}
                    min={1}
                    onChange={(e) => setAmountStr(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-600 rounded-r-lg px-4 py-3 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Allocation */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Gift Allocation *</label>
                <div className="flex gap-2">
                  {(['Both', 'Bride', 'Groom'] as Allocation[]).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAllocation(opt)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                        allocation === opt
                          ? 'bg-violet-600 border-violet-500 text-white'
                          : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-violet-500/60 hover:text-slate-300'
                      }`}
                    >
                      {opt === 'Both' ? '💑 Both' : opt === 'Bride' ? '👰 Bride' : '🤵 Groom'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Payment Mode *</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  {(['UPI Transfer', 'Cash to Counter', 'Card'] as PaymentMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMode(mode)}
                      className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium border transition-all text-center ${
                        paymentMode === mode
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-emerald-500/60 hover:text-slate-300'
                      }`}
                    >
                      {mode === 'UPI Transfer' ? '📲 UPI' : mode === 'Cash to Counter' ? '💵 Cash' : '💳 Card'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-lg shadow-violet-900/40 mt-2"
              >
                {submitting ? '⏳ Processing...' : '✓ Submit Moi Gift & Generate Receipt'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
