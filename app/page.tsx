import React from 'react';
import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  Info,
  CheckCircle2,
  Clock,
  FileText
} from 'lucide-react';
import { getStats, getAllProjects, getStatsByPanchayat } from '@/lib/db';
import { formatINR } from '@/components/CurrencyDisplay';
import SourceBadge from '@/components/SourceBadge';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const stats = await getStats();
  const recentProjects = (await getAllProjects({ limit: 6 })).projects;
  const panchayatStats = await getStatsByPanchayat();

  return (
    <div className="space-y-8 pb-16">
      {/* Editorial Civic Header / Hero */}
      <section className="bg-white border-b border-slate-200 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-teal-600"></span>
            Kodungallur LAC · Mala Block · Thrissur
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Where is Mala&apos;s development money going?
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
            Track how MLA constituency development funds (<strong>LAC-ADS / MLA SDF</strong>) and local public works are sanctioned, tendered, executed, and paid across <strong>Mala Grama Panchayat</strong>, <strong>Mala Block</strong>, and the <strong>Kodungallur constituency</strong>.
          </p>

          {/* Clean Search Form */}
          <div className="pt-2">
            <form action="/projects" method="GET" className="flex flex-col sm:flex-row gap-2 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search by road, school, hospital, locality (e.g. Vattakkotta, Eravathur)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-slate-900 rounded-lg border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 text-sm"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg transition-colors whitespace-nowrap"
              >
                Search Projects
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-xs text-slate-500">
              <span className="font-medium text-slate-700">Quick filters:</span>
              <Link href="/projects?q=Vattakkotta" className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700">Vattakkotta</Link>
              <Link href="/projects?q=Eravathur" className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700">Eravathur</Link>
              <Link href="/projects?q=Ramavilasam" className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700">Ramavilasam School</Link>
              <Link href="/projects?q=Hospital" className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700">Mala Hospital</Link>
              <Link href="/projects?category=Water+Supply" className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700">Drinking Water</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Tracked Projects
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {stats.totalProjects}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Reconciled across portals
            </span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
              Sanctioned Outlay
            </span>
            <div className="text-2xl font-extrabold text-teal-900 mt-1">
              {formatINR(stats.totalSanctioned)}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Administrative Sanctions (AS)
            </span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
              Tendered Value
            </span>
            <div className="text-2xl font-extrabold text-blue-900 mt-1">
              {formatINR(stats.totalTendered)}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              e-Tender contract values
            </span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block">
              Verified Paid
            </span>
            <div className="text-2xl font-extrabold text-purple-900 mt-1">
              {formatINR(stats.totalPaid)}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Saankhya treasury vouchers
            </span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Sources Corroborated
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {stats.totalSources} Portals
            </div>
            <span className="text-[11px] text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% verified links
            </span>
          </div>
        </div>

        {/* Civic Disclosure Alert */}
        <div className="mt-4 p-3.5 rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Evidence-First Rule:</strong> We never assume tender amount equals expenditure. Sanctions, tender awards, and treasury disbursements represent distinct stages of the project lifecycle.
          </div>
        </div>
      </section>

      {/* Panchayat Breakdown */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-1">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Panchayat Allocations (Mala Block)
              </h2>
              <p className="text-xs text-slate-500">
                Distinct local body jurisdictions within the Kodungallur LAC.
              </p>
            </div>
            <Link href="/about" className="text-xs font-semibold text-teal-800 hover:text-teal-900 flex items-center gap-1">
              Geography Guide <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {panchayatStats.map((p) => (
              <Link
                key={p.name}
                href={`/projects?panchayat=${encodeURIComponent(p.name)}`}
                className="p-3.5 rounded-md border border-slate-200 hover:border-slate-400 transition-colors bg-slate-50/50 hover:bg-white flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{p.name}</span>
                  <span className="text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                    {p.projectCount} {p.projectCount === 1 ? 'project' : 'projects'}
                  </span>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200/60 text-xs space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>Sanctioned:</span>
                    <strong className="text-slate-900">{formatINR(p.sanctioned)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Tendered:</span>
                    <strong className="text-slate-900">{formatINR(p.tendered)}</strong>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Projects Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Recent Development Projects
            </h2>
            <p className="text-xs text-slate-500">
              Click any project to inspect sanctions, tender BOQ, contractor awards, and payment vouchers.
            </p>
          </div>
          <Link
            href="/projects"
            className="text-xs font-semibold px-3 py-1.5 rounded-md bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            View All ({stats.totalProjects}) →
          </Link>
        </div>

        {/* Responsive Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Year & Scheme</th>
                  <th className="py-3 px-4">Sanctioned</th>
                  <th className="py-3 px-4">Tendered</th>
                  <th className="py-3 px-4">Paid</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Sources</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentProjects.map((proj) => {
                  const sourcesList = proj.sources_summary ? proj.sources_summary.split(',') : [];
                  return (
                    <tr key={proj.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 max-w-xs">
                        <Link href={`/projects/${proj.id}`} className="font-semibold text-slate-900 hover:text-teal-800 line-clamp-2">
                          {proj.canonical_name}
                        </Link>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                        <span>{proj.grama_panchayat || proj.local_body}</span>
                        {proj.ward && <span className="text-slate-400 font-mono text-[11px]"> · {proj.ward}</span>}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-medium text-slate-900">{proj.financial_year}</span>
                        <div className="text-[10px] text-slate-500 font-mono">{proj.scheme_normalized}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-800">
                        {formatINR(proj.sanctioned_amount)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-blue-800">
                        {formatINR(proj.tender_value)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-purple-800">
                        {formatINR(proj.paid_amount)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          proj.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : proj.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {proj.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {sourcesList.map((sys) => (
                            <SourceBadge key={sys} system={sys} size="sm" />
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <Link
                          href={`/projects/${proj.id}`}
                          className="font-semibold text-slate-900 hover:text-teal-800"
                        >
                          Dossier →
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
