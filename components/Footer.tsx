import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-black/[0.06] bg-white/60 py-10 text-xs text-slate-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 text-sm">Mala Funds</span>
            <span className="text-slate-300">·</span>
            <span>Kodungallur LAC (073) Public Development Tracker</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <Link href="/" className="hover:text-slate-900 transition-colors">Overview</Link>
            <Link href="/projects" className="hover:text-slate-900 transition-colors">Projects</Link>
            <Link href="/dashboard" className="hover:text-slate-900 transition-colors">Analytics</Link>
            <Link href="/data-quality" className="hover:text-slate-900 transition-colors">Data Quality</Link>
            <Link href="/about" className="hover:text-slate-900 transition-colors">Methodology</Link>
          </div>
        </div>

        <div className="pt-4 border-t border-black/[0.04] text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Evidence-First Public Data Tool. Data harvested directly from official portals (e-Tender, Sulekha, Saankhya, Sakarma, KERI, PASK).
          </p>
          <p className="font-mono text-[10px]">
            Updated Daily · Open Data Platform
          </p>
        </div>
      </div>
    </footer>
  );
}
