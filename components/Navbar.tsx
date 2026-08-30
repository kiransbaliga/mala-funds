'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Compass, 
  ListOrdered, 
  BarChart3, 
  CheckCircle2, 
  Info,
  Menu,
  X,
  ShieldCheck
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: Compass },
  { href: '/projects', label: 'Projects', icon: ListOrdered },
  { href: '/dashboard', label: 'Analytics', icon: BarChart3 },
  { href: '/data-quality', label: 'Data Quality', icon: CheckCircle2 },
  { href: '/about', label: 'Methodology', icon: Info },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-black/[0.06] transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Apple Style Brand Title */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs shadow-apple-sm transition-transform group-active:scale-95">
              M
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-slate-900 text-base tracking-tight">
                Mala Funds
              </span>
              <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">
                Kodungallur LAC · 073
              </span>
            </div>
          </Link>

          {/* Segmented Navigation Control (Apple Style) */}
          <nav className="hidden md:flex items-center bg-black/[0.04] p-1 rounded-apple-sm border border-black/[0.04]">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-[8px] text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-apple-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-system-blue' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Status Badge */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Evidence-First</span>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden p-1.5 rounded-lg text-slate-700 hover:bg-black/[0.05] transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileNavOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-2xl border-t border-black/[0.06] px-4 py-3 space-y-1 shadow-apple">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-black/[0.05] text-slate-900 font-semibold'
                    : 'text-slate-600 hover:bg-black/[0.02]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-system-blue' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
