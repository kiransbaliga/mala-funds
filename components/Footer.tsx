import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                M
              </span>
              <span className="font-bold text-white text-sm tracking-tight">
                Mala Funds
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Kodungallur LAC · 073
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              A serious, non-partisan public data transparency initiative tracking MLA Special Development Funds (MLA SDF), LAC-ADS, and decentralized local development projects across Mala Block and Kodungallur constituency.
            </p>
            <p className="text-[11px] text-slate-500">
              Not affiliated with any political campaign. Grounded strictly in official Kerala LSGD, e-Tender, and Treasury records.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-2.5">
              Government Sources
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <a href="https://etenders.kerala.gov.in" target="_blank" rel="noreferrer" className="hover:text-slate-200 transition-colors">
                  Kerala e-Tender Portal
                </a>
              </li>
              <li>
                <a href="https://sulekha.lsgkerala.gov.in" target="_blank" rel="noreferrer" className="hover:text-slate-200 transition-colors">
                  Sulekha Plan Monitoring
                </a>
              </li>
              <li>
                <a href="https://saankhya.lsgkerala.gov.in" target="_blank" rel="noreferrer" className="hover:text-slate-200 transition-colors">
                  Saankhya Local Accounting
                </a>
              </li>
              <li>
                <a href="https://sakarma.lsgkerala.gov.in" target="_blank" rel="noreferrer" className="hover:text-slate-200 transition-colors">
                  Sakarma Council Resolutions
                </a>
              </li>
              <li>
                <a href="https://keri.kerala.gov.in" target="_blank" rel="noreferrer" className="hover:text-slate-200 transition-colors">
                  KERI Material Testing
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-2.5">
              Civic Navigation
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <Link href="/projects" className="hover:text-slate-200 transition-colors">
                  Project Explorer
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-slate-200 transition-colors">
                  Financial Analytics
                </Link>
              </li>
              <li>
                <Link href="/data-quality" className="hover:text-slate-200 transition-colors">
                  Source Overlap Matrix
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-slate-200 transition-colors">
                  Methodology & Geography
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500 text-[11px]">
          <div>
            Open government data pipeline · Mala Block Panchayat & Kodungallur LAC · Thrissur, Kerala
          </div>
          <div className="font-mono">
            Idempotent Ingestion Engine
          </div>
        </div>
      </div>
    </footer>
  );
}
