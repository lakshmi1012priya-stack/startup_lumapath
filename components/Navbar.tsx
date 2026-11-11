'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <div className="leading-tight">
              <span className="text-white font-bold text-lg tracking-tight">LumaPath</span>
              <span className="block text-violet-400 text-[9px] font-semibold tracking-widest uppercase -mt-1">Digital Moi Express</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="/#features" className="text-slate-300 hover:text-violet-400 transition-colors">Features</a>
            <a href="/#demo" className="text-slate-300 hover:text-violet-400 transition-colors">Interactive App</a>
            <a href="/#pricing" className="text-slate-300 hover:text-violet-400 transition-colors">Contract &amp; Pricing</a>
            <a href="/#leadership" className="text-slate-300 hover:text-violet-400 transition-colors">Leadership</a>
            <a href="/#vision" className="text-slate-300 hover:text-violet-400 transition-colors">National Vision</a>
            <a
              href="https://digital-moi-express.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
            >
              🚀 Live App
            </a>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/#pricing"
              className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors shadow-lg shadow-violet-900/40"
            >
              Book Event Now
            </a>
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden text-slate-300 hover:text-white p-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-4 pt-2 border-t border-slate-700 space-y-2">
            {([['/#features','Features'],['/#demo','Interactive App'],['/#pricing','Contract & Pricing'],['/#leadership','Leadership'],['/#vision','National Vision']] as [string, string][]).map(([href, label]) => (
              <a key={href} href={href} onClick={() => setOpen(false)} className="block px-3 py-2 text-slate-300 hover:text-violet-400 text-sm">{label}</a>
            ))}
            <a
              href="https://digital-moi-express.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-2 text-emerald-400 font-semibold text-sm"
            >🚀 Live App</a>
            <a href="/#pricing" className="block mt-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold text-center">
              Book Event Now
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
