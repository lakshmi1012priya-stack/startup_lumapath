'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useState } from 'react';

const MOCK_GUESTS = [
  { name: 'Ramesh Kumar', village: 'Thanjavur', amount: 5000, allocation: 'Both' },
  { name: 'Meena Devi', village: 'Madurai', amount: 3001, allocation: 'Bride' },
  { name: 'Subramaniam P.', village: 'Coimbatore', amount: 5101, allocation: 'Groom' },
  { name: 'Kavitha S.', village: 'Chennai', amount: 3906, allocation: 'Both' },
];

const FEATURES = [
  {
    icon: '📲',
    title: 'UPI QR Payments',
    desc: 'Instant UPI QR code generation per event. Guests scan and pay in seconds — no cash handling required.',
    iconBg: 'bg-violet-500/15',
    titleHover: 'group-hover:text-violet-400',
    borderHover: 'hover:border-violet-500',
  },
  {
    icon: '📊',
    title: 'Real-time Ledger',
    desc: 'Every transaction logged instantly. Full A–Z searchable master ledger with zero latency.',
    iconBg: 'bg-emerald-500/15',
    titleHover: 'group-hover:text-emerald-400',
    borderHover: 'hover:border-emerald-500',
  },
  {
    icon: '🧾',
    title: 'Dual Receipts',
    desc: 'Serverless receipt generation in PNG and CSV. Guest copy + host archive, every time.',
    iconBg: 'bg-violet-500/15',
    titleHover: 'group-hover:text-violet-400',
    borderHover: 'hover:border-violet-500',
  },
  {
    icon: '👰🤵',
    title: 'Split Host Dashboards',
    desc: 'Dedicated real-time dashboards for Bride and Groom with clean gift separation and analytics.',
    iconBg: 'bg-emerald-500/15',
    titleHover: 'group-hover:text-emerald-400',
    borderHover: 'hover:border-emerald-500',
  },
  {
    icon: '📥',
    title: 'CSV Export',
    desc: 'One-click export of full master ledger for accounting, family records, or CA filing.',
    iconBg: 'bg-violet-500/15',
    titleHover: 'group-hover:text-violet-400',
    borderHover: 'hover:border-violet-500',
  },
  {
    icon: '📡',
    title: 'Offline Resilience',
    desc: 'localStorage fallback ensures no entry is ever lost, even during network interruptions.',
    iconBg: 'bg-emerald-500/15',
    titleHover: 'group-hover:text-emerald-400',
    borderHover: 'hover:border-emerald-500',
  },
];

const PRICING = [
  {
    name: 'Basic',
    price: '₹2,999',
    desc: 'Perfect for intimate gatherings',
    features: ['Up to 500 guests', '1 event', 'UPI QR payments', 'Real-time ledger', 'Digital receipts', 'CSV export'],
    popular: false,
    cta: 'Get Started',
  },
  {
    name: 'Professional',
    price: '₹5,999',
    desc: 'Full suite for grand weddings',
    features: ['Up to 2,000 guests', '3 events', 'Full feature suite', 'Split host dashboards', 'Priority email support', 'Custom event branding'],
    popular: true,
    cta: 'Book Now — Most Popular',
  },
  {
    name: 'Enterprise',
    price: '₹9,999',
    desc: 'For large families & event planners',
    features: ['Unlimited guests', 'Unlimited events', 'White-label branding', 'Priority phone support', 'Dedicated account manager', 'Custom integrations'],
    popular: false,
    cta: 'Contact Sales',
  },
];

const LEADERSHIP = [
  {
    initials: 'LP',
    name: 'Lakshmi Priya A.',
    title: 'CEO & Founder',
    desc: 'Visionary leader driving the modernization of South Indian gifting traditions through fintech innovation.',
    gradient: 'from-violet-600 to-violet-900',
  },
  {
    initials: 'NG',
    name: 'Nivethaa G.',
    title: 'Co-Founder',
    desc: 'Product strategist focused on user experience and seamless digital-to-tradition bridging.',
    gradient: 'from-emerald-600 to-emerald-900',
  },
  {
    initials: 'HK',
    name: 'Harsika K.K.',
    title: 'Co-Founder',
    desc: 'Technology architect leading cloud-native infrastructure and real-time data systems.',
    gradient: 'from-violet-600 to-emerald-800',
  },
  {
    initials: 'SB',
    name: 'Sushmitha B.',
    title: 'Co-Founder',
    desc: 'Operations and partnerships lead ensuring flawless event-day deployments across venues.',
    gradient: 'from-violet-800 to-violet-600',
  },
];

const DEMO_MODULES = [
  {
    href: '/pay',
    icon: '📲',
    title: 'QR Payment Portal',
    desc: 'Guest submits Moi amount via UPI, Cash, or Card. Instant receipt generated.',
    badge: 'Guest-Facing',
    badgeClass: 'text-emerald-400',
  },
  {
    href: '/bride',
    icon: '👰',
    title: "Bride's Gift Hub",
    desc: "Priya's real-time dashboard — all gifts allocated to bride, with live totals.",
    badge: 'Bride Dashboard',
    badgeClass: 'text-violet-400',
  },
  {
    href: '/groom',
    icon: '🤵',
    title: "Groom's Gift Hub",
    desc: "Suresh's real-time dashboard — gifts allocated to groom, live analytics.",
    badge: 'Groom Dashboard',
    badgeClass: 'text-violet-400',
  },
  {
    href: '/ledger',
    icon: '📒',
    title: 'Master Ledger',
    desc: 'Unified financial archive — search, filter, and export full transaction history.',
    badge: 'Admin',
    badgeClass: 'text-slate-400',
  },
];

export default function HomePage() {
  const [bookingData, setBookingData] = useState({
    eventName: '',
    venue: '',
    date: '',
    package: 'Professional',
  });
  const [contractGenerated, setContractGenerated] = useState(false);

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingData.eventName || !bookingData.venue || !bookingData.date) {
      alert('Please fill in all fields.');
      return;
    }
    setContractGenerated(true);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      {/* ── HERO ── */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-slate-900 via-slate-900 to-violet-950 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-900/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 border border-violet-500/50 bg-violet-500/10 rounded-full px-4 py-1.5 text-xs font-semibold text-violet-300 tracking-widest uppercase mb-6">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
                Cloud-Native Gifting Fintech
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-6">
                Modernizing Cultural Cash Gifting for the{' '}
                <span className="bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
                  Digital Era
                </span>
              </h1>

              <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-lg">
                LumaPath&apos;s Digital Moi Express replaces manual paper registers with instant UPI QR payments,
                serverless dual-receipt generation, and real-time A–Z ledgers — built for South Indian wedding traditions.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <a
                  href="#pricing"
                  className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition-all shadow-lg shadow-violet-900/50 hover:shadow-violet-800/60"
                >
                  Book Your Event Contract →
                </a>
                <a
                  href="#demo"
                  className="px-6 py-3 rounded-xl border border-violet-500 text-violet-300 hover:bg-violet-500/10 font-semibold text-sm transition-all"
                >
                  ▶ Test Live App Demo
                </a>
              </div>

              {/* Live App Banner */}
              <a
                href="https://digital-moi-express.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 border border-emerald-500/50 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-900/40 group"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-pulse"></span>
                🚀 Live Deployment: digital-moi-express.vercel.app
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            {/* Right — Dashboard Mockup */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl p-6 relative">
              {/* Top bar */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <span className="text-white font-bold">Suresh &amp; Priya Wedding</span>
                  <span className="block text-slate-400 text-xs mt-0.5">Raja Mahal, Chennai — 15 Dec 2024</span>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/40 rounded-full px-3 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-emerald-300 text-xs font-semibold">LIVE SYSTEM ACTIVE</span>
                </div>
              </div>

              {/* Total stat */}
              <div className="bg-gradient-to-r from-violet-700/40 to-violet-900/40 border border-violet-700/50 rounded-xl p-4 mb-4">
                <span className="text-slate-400 text-xs uppercase tracking-wider">Total Moi Collected</span>
                <div className="text-3xl font-extrabold text-white mt-1">₹17,008</div>
                <span className="text-emerald-400 text-xs font-semibold">↑ 4 contributions recorded</span>
              </div>

              {/* Guest rows */}
              <div className="space-y-2">
                {MOCK_GUESTS.map((g, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-900/60 rounded-lg px-3 py-2.5 border border-slate-700/50">
                    <div>
                      <span className="text-white text-sm font-medium">{g.name}</span>
                      <span className="block text-slate-500 text-xs">{g.village}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold text-sm">₹{g.amount.toLocaleString('en-IN')}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        g.allocation === 'Both'
                          ? 'bg-violet-500/20 text-violet-300'
                          : g.allocation === 'Bride'
                          ? 'bg-pink-500/20 text-pink-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}>{g.allocation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-violet-400 text-sm font-semibold uppercase tracking-widest">Platform Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Everything You Need for a Digital Moi</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">From QR scanning to CSV export — every feature crafted for South Indian wedding hosts and guests.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`bg-slate-800 rounded-xl p-6 border border-slate-700 ${f.borderHover} transition-all shadow-lg group cursor-default`}
              >
                <div className={`text-3xl mb-4 w-12 h-12 rounded-xl flex items-center justify-center ${f.iconBg}`}>
                  {f.icon}
                </div>
                <h3 className={`text-white font-bold text-lg mb-2 ${f.titleHover} transition-colors`}>{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE DEMO ── */}
      <section id="demo" className="py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-emerald-400 text-sm font-semibold uppercase tracking-widest">Live Modules</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Try the Live App Modules</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">
              All modules are fully functional — click any card to open the live demo, or visit{' '}
              <a href="https://digital-moi-express.vercel.app" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline underline-offset-2">
                digital-moi-express.vercel.app
              </a>
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {DEMO_MODULES.map((m) => (
              <a
                key={m.href}
                href={m.href}
                className="group bg-slate-800 rounded-xl border border-slate-700 hover:border-violet-500 p-6 transition-all shadow-lg hover:shadow-violet-900/30 flex flex-col"
              >
                <div className="text-4xl mb-4">{m.icon}</div>
                <span className={`text-xs font-semibold uppercase tracking-wider mb-2 ${m.badgeClass}`}>{m.badge}</span>
                <h3 className="text-white font-bold text-base mb-2 group-hover:text-violet-400 transition-colors">{m.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed flex-1">{m.desc}</p>
                <div className="mt-4 text-violet-400 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Open module <span>→</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-violet-400 text-sm font-semibold uppercase tracking-widest">Deployment Contracts</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Deployment Contracts &amp; Pricing</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">Transparent, event-based pricing with instant contract generation. No hidden charges.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {PRICING.map((p) => (
              <div
                key={p.name}
                className={`relative rounded-2xl border p-8 flex flex-col transition-all shadow-xl ${
                  p.popular
                    ? 'bg-gradient-to-b from-violet-900/60 to-slate-800 border-violet-500 shadow-violet-900/40'
                    : 'bg-slate-800 border-slate-700'
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs font-bold px-4 py-1 rounded-full tracking-wider">
                    ★ MOST POPULAR
                  </div>
                )}
                <div className="mb-5">
                  <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider">{p.name}</span>
                  <div className="text-3xl font-extrabold text-white mt-1">{p.price}</div>
                  <p className="text-slate-400 text-sm mt-1">{p.desc}</p>
                </div>
                <ul className="space-y-2.5 flex-1 mb-8">
                  {p.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm text-slate-300">
                      <svg className={`w-4 h-4 flex-shrink-0 ${p.popular ? 'text-violet-400' : 'text-emerald-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feat}
                    </li>
                  ))}
                </ul>
                <a
                  href="#booking"
                  className={`w-full py-3 rounded-xl text-sm font-semibold text-center transition-all ${
                    p.popular
                      ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-900/40'
                      : 'border border-slate-600 hover:border-violet-500 text-slate-300 hover:text-white'
                  }`}
                >
                  {p.cta}
                </a>
              </div>
            ))}
          </div>

          {/* Booking form */}
          <div id="booking" className="max-w-2xl mx-auto bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-xl">
            <h3 className="text-white font-bold text-xl mb-2">Generate Your Deployment Contract</h3>
            <p className="text-slate-400 text-sm mb-6">Fill in your event details to instantly generate a custom deployment contract.</p>

            {!contractGenerated ? (
              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-1">Event Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Suresh & Priya Wedding"
                    value={bookingData.eventName}
                    onChange={(e) => setBookingData({ ...bookingData, eventName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-1">Venue</label>
                  <input
                    type="text"
                    placeholder="e.g. Raja Mahal, Chennai"
                    value={bookingData.venue}
                    onChange={(e) => setBookingData({ ...bookingData, venue: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-1">Event Date</label>
                  <input
                    type="date"
                    value={bookingData.date}
                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-violet-500 focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-1">Package Tier</label>
                  <select
                    value={bookingData.package}
                    onChange={(e) => setBookingData({ ...bookingData, package: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-violet-500 focus:outline-none text-sm"
                  >
                    <option>Basic</option>
                    <option>Professional</option>
                    <option>Enterprise</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition-all shadow-lg shadow-violet-900/40 mt-2"
                >
                  Generate Contract →
                </button>
              </form>
            ) : (
              <div className="bg-slate-900/60 rounded-xl border border-emerald-500/40 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-emerald-400 font-semibold">Contract Generated!</span>
                    <span className="block text-slate-400 text-xs">Reference: LMP-{Date.now().toString().slice(-6)}</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {[['Event', bookingData.eventName], ['Venue', bookingData.venue], ['Date', bookingData.date], ['Package', bookingData.package]].map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-slate-700 pb-1.5">
                      <span className="text-slate-400">{k}</span>
                      <span className="text-white font-medium">{v}</span>
                    </div>
                  ))}
                </div>
                <p className="text-slate-400 text-xs mt-4">Our team will contact you within 24 hours to confirm your deployment.</p>
                <button
                  onClick={() => setContractGenerated(false)}
                  className="mt-4 text-violet-400 hover:text-violet-300 text-xs underline underline-offset-2"
                >
                  Submit another request
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── LEADERSHIP ── */}
      <section id="leadership" className="py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-emerald-400 text-sm font-semibold uppercase tracking-widest">The Team</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Our Leadership Team</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">Built by innovators who understand both technology and South Indian cultural traditions.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {LEADERSHIP.map((l) => (
              <div key={l.name} className="bg-slate-800 rounded-2xl border border-slate-700 hover:border-violet-500/60 p-6 text-center transition-all shadow-lg group">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${l.gradient} mx-auto mb-4 flex items-center justify-center shadow-lg`}>
                  <span className="text-white font-extrabold text-xl">{l.initials}</span>
                </div>
                <h3 className="text-white font-bold text-base group-hover:text-violet-400 transition-colors">{l.name}</h3>
                <span className="text-violet-400 text-xs font-semibold uppercase tracking-wider block mt-1 mb-3">{l.title}</span>
                <p className="text-slate-400 text-sm leading-relaxed">{l.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NATIONAL VISION ── */}
      <section id="vision" className="py-20 bg-gradient-to-br from-slate-900 via-violet-950/30 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-violet-400 text-sm font-semibold uppercase tracking-widest">India&apos;s Digital Future</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Aligned with India&apos;s Digital Future</h2>
            <p className="text-slate-400 mt-3 max-w-2xl mx-auto">
              LumaPath&apos;s Digital Moi Express is proudly aligned with the Government of India&apos;s flagship digital payment and technology initiatives, contributing to a cashless, connected India.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              {
                icon: '🇮🇳',
                label: 'Digital India Initiative',
                desc: 'Advancing paperless, real-time digital transactions aligned with the Digital India programme for inclusive financial infrastructure.',
              },
              {
                icon: '🏭',
                label: 'Aatmanirbhar Bharat',
                desc: 'Built entirely by Indian founders, for Indian traditions — a self-reliant fintech solution eliminating dependency on cash-based manual systems.',
              },
              {
                icon: '💡',
                label: 'Saptadhara — Technology & Innovation',
                desc: 'Directly supporting the Technology & Innovation pillar of NEP&apos;s Saptadhara framework by digitizing a centuries-old cultural practice.',
              },
            ].map((v) => (
              <div key={v.label} className="bg-slate-800/60 rounded-2xl border border-slate-700 hover:border-violet-500/50 p-7 transition-all shadow-lg text-center">
                <div className="text-5xl mb-5">{v.icon}</div>
                <h3 className="text-white font-bold text-base mb-3">{v.label}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>

          {/* Live deployment CTA */}
          <div className="text-center">
            <div className="inline-block bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
              <p className="text-slate-300 text-sm mb-3">Experience the live deployment now</p>
              <a
                href="https://digital-moi-express.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-700 hover:to-emerald-700 text-white font-bold text-sm transition-all shadow-lg"
              >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                🚀 Visit digital-moi-express.vercel.app
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
