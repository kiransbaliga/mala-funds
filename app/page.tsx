import React from 'react';
import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  ChevronRight, 
  ShieldCheck, 
  FileText,
  TrendingUp,
  Layers
} from 'lucide-react';
import { getStats, getAllProjects, getStatsByPanchayat } from '@/lib/db';
import { formatINR } from '@/components/CurrencyDisplay';
import SourceBadge from '@/components/SourceBadge';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const stats = await getStats();
  const recentProjects = (await getAllProjects({ limit: 8 })).projects;
  const panchayatStats = await getStatsByPanchayat();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* 1. Apple-style Hero Section */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-black/[0.05] text-slate-700 font-mono text-[11px] font-medium border border-black/[0.04]">
            Kodungallur LAC · 073 · Thrissur
          </span>
        </div>

        <div className="space-y-2 max-w-3xl">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-950 leading-[1.12]">
            Where is Mala&apos;s development money going?
          </h1>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed pt-1">
            An open civic transparency registry tracking MLA constituency-development funds (<strong>LAC-ADS / MLA SDF</strong>) and public development projects across <strong>Mala Block</strong> and <strong>Kodungallur LAC</strong>.
          </p>
        </div>

        {/* Apple Spotlight Search Field */}
        <div className="pt-3 max-w-2xl">
          <form action="/projects" method="GET" className="relative flex items-center group">
            <Search className="absolute left-4 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
            <input
              type="text"
              name="q"
              placeholder="Search roads, schools, hospitals, wards (e.g. Vattakkotta, Eravathur)..."
              className="w-full pl-11 pr-24 py-3 bg-white text-slate-900 rounded-apple-lg border border-black/[0.08] shadow-apple-sm focus:outline-none focus:ring-2 focus:ring-black/80 text-sm transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="absolute right-2 px-3.5 py-1.5 bg-black hover:bg-slate-800 text-white font-medium text-xs rounded-apple transition-transform active:scale-95"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-xs text-slate-500">
            <span className="text-slate-400 font-medium">Quick suggestions:</span>
            <Link href="/projects?q=Vattakkotta" className="px-2.5 py-0.5 rounded-full bg-white border border-black/[0.06] hover:border-black/20 text-slate-700 shadow-apple-sm transition-colors">Vattakkotta</Link>
            <Link href="/projects?q=Eravathur" className="px-2.5 py-0.5 rounded-full bg-white border border-black/[0.06] hover:border-black/20 text-slate-700 shadow-apple-sm transition-colors">Eravathur</Link>
            <Link href="/projects?q=Hospital" className="px-2.5 py-0.5 rounded-full bg-white border border-black/[0.06] hover:border-black/20 text-slate-700 shadow-apple-sm transition-colors">Mala Hospital</Link>
            <Link href="/projects?q=Ramavilasam" className="px-2.5 py-0.5 rounded-full bg-white border border-black/[0.06] hover:border-black/20 text-slate-700 shadow-apple-sm transition-colors">School Classrooms</Link>
          </div>
        </div>
      </section>

      {/* 2. Apple Fitness/Summary Metric Tiles */}
      <section>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="bg-white p-5 rounded-apple-lg border border-black/[0.06] shadow-apple space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Tracked Projects
            </span>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {stats.totalProjects}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              Reconciled across portals
            </span>
          </div>

          <div className="bg-white p-5 rounded-apple-lg border border-black/[0.06] shadow-apple space-y-1">
            <span className="text-[11px] font-semibold text-teal-700 uppercase tracking-wider block">
              Sanctioned Outlay
            </span>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {formatINR(stats.totalSanctioned)}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              Administrative Sanctions (AS)
            </span>
          </div>

          <div className="bg-white p-5 rounded-apple-lg border border-black/[0.06] shadow-apple space-y-1">
            <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">
              Tendered Value
            </span>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {formatINR(stats.totalTendered)}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              Awarded contract values
            </span>
          </div>

          <div className="bg-white p-5 rounded-apple-lg border border-black/[0.06] shadow-apple space-y-1">
            <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider block">
              Verified Paid
            </span>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {formatINR(stats.totalPaid)}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              Treasury payment vouchers
            </span>
          </div>

          <div className="bg-white p-5 rounded-apple-lg border border-black/[0.06] shadow-apple space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
              Source Portals
            </span>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {stats.totalSources}
            </div>
            <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% verified links
            </span>
          </div>
        </div>
      </section>

      {/* 3. Inset Grouped Panchayat Cards (Apple Settings/App Store Style) */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Panchayat Allocations
            </h2>
            <p className="text-xs text-slate-500">
              Constituent local bodies within Mala Block & Kodungallur LAC.
            </p>
          </div>
          <Link
            href="/about"
            className="text-xs font-semibold text-system-blue hover:opacity-80 flex items-center gap-0.5"
          >
            Geography guide <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {panchayatStats.map((p) => (
            <Link
              key={p.name}
              href={`/projects?panchayat=${encodeURIComponent(p.name)}`}
              className="bg-white p-4 rounded-apple border border-black/[0.06] hover:border-black/[0.15] shadow-apple hover:shadow-apple-lg transition-all active:scale-[0.99] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-900">{p.name}</span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-black/[0.05] text-slate-700">
                  {p.projectCount} {p.projectCount === 1 ? 'proj' : 'projs'}
                </span>
              </div>
              <div className="mt-3 pt-2.5 border-t border-black/[0.04] text-xs space-y-1 text-slate-500">
                <div className="flex justify-between">
                  <span>Sanctioned:</span>
                  <span className="font-semibold text-slate-900">{formatINR(p.sanctioned)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tendered:</span>
                  <span className="font-semibold text-slate-900">{formatINR(p.tendered)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Recent Development Projects Table (Apple Inset Table View) */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Recent Development Projects
            </h2>
            <p className="text-xs text-slate-500">
              Inspect verified administrative sanctions, tender notices, and treasury payments.
            </p>
          </div>
          <Link
            href="/projects"
            className="text-xs font-semibold px-3 py-1.5 rounded-apple bg-black text-white hover:bg-slate-800 transition-colors shadow-apple-sm"
          >
            All Projects ({stats.totalProjects}) →
          </Link>
        </div>

        <div className="bg-white rounded-apple-lg border border-black/[0.06] shadow-apple overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/[0.02] border-b border-black/[0.05] text-slate-500 font-medium uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Project & Location</th>
                  <th className="py-3 px-4">Year & Scheme</th>
                  <th className="py-3 px-4">Sanctioned</th>
                  <th className="py-3 px-4">Tendered</th>
                  <th className="py-3 px-4">Paid</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Evidence</th>
                  <th className="py-3 px-4 text-right">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {recentProjects.map((proj) => {
                  const sourcesList = proj.sources_summary ? proj.sources_summary.split(',') : [];
                  return (
                    <tr key={proj.id} className="hover:bg-black/[0.015] transition-colors group">
                      <td className="py-3.5 px-4 max-w-xs">
                        <Link href={`/projects/${proj.id}`} className="font-semibold text-slate-900 group-hover:text-system-blue transition-colors line-clamp-2">
                          {proj.canonical_name}
                        </Link>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {proj.grama_panchayat || proj.local_body} {proj.ward ? `· ${proj.ward}` : ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-medium text-slate-900">{proj.financial_year}</span>
                        <div className="text-[10px] text-slate-400 font-mono">{proj.scheme_normalized}</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-900">
                        {formatINR(proj.sanctioned_amount)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-blue-700">
                        {formatINR(proj.tender_value)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-purple-700">
                        {formatINR(proj.paid_amount)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          proj.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                            : proj.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200/60'
                            : 'bg-amber-50 text-amber-800 border border-amber-200/60'
                        }`}>
                          {proj.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {sourcesList.map((sys) => (
                            <SourceBadge key={sys} system={sys} size="sm" />
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          href={`/projects/${proj.id}`}
                          className="inline-flex items-center gap-0.5 text-xs font-semibold text-system-blue hover:opacity-80"
                        >
                          View <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
