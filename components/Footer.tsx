import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <div>
                <span className="text-white font-bold text-lg">LumaPath</span>
                <span className="block text-violet-400 text-[9px] font-semibold tracking-widest uppercase -mt-1">Digital Moi Express</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
              Modernizing South Indian monetary wedding gift tracking with cloud-native technology, UPI payments, and real-time digital ledgers.
            </p>
            <a
              href="https://digital-moi-express.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
            >
              🚀 Live Deployment
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* App Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">App Modules</h3>
            <ul className="space-y-2 text-sm">
              {([['/', 'Landing'], ['/pay', 'QR Payment'], ['/bride', 'Bride Dashboard'], ['/groom', 'Groom Dashboard'], ['/ledger', 'Master Ledger']] as [string, string][]).map(([href, label]) => (
                <li key={href}><Link href={href} className="text-slate-400 hover:text-violet-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Leadership */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">Company</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>CEO: Lakshmi Priya A.</li>
              <li>Co-Founder: Nivethaa G.</li>
              <li>Co-Founder: Harsika K.K.</li>
              <li>Co-Founder: Sushmitha B.</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© 2024 LumaPath. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <a href="https://digital-moi-express.vercel.app" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 font-medium">
              digital-moi-express.vercel.app
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
