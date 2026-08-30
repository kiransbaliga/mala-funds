import React from 'react';
import Link from 'next/link';
import { Search, ChevronRight, AlertCircle, RotateCcw } from 'lucide-react';
import { getAllProjects } from '@/lib/db';
import { formatINR } from '@/components/CurrencyDisplay';
import SourceBadge from '@/components/SourceBadge';

export const dynamic = 'force-dynamic';

interface ProjectsPageProps {
  searchParams: Promise<{
    q?: string;
    year?: string;
    scheme?: string;
    panchayat?: string;
    ward?: string;
    category?: string;
    status?: string;
    confidence?: string;
    sortBy?: string;
  }>;
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const params = await searchParams;
  const { projects, total } = await getAllProjects({
    q: params.q,
    year: params.year,
    scheme: params.scheme,
    panchayat: params.panchayat,
    ward: params.ward,
    category: params.category,
    status: params.status,
    confidence: params.confidence,
    sortBy: params.sortBy,
    limit: 100
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Apple Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-black/[0.06]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
            Project Explorer
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified public development projects across Mala Block & Kodungallur LAC.
          </p>
        </div>
        <div className="text-xs font-medium text-slate-600 px-3 py-1 bg-white rounded-full border border-black/[0.06] shadow-apple-sm w-fit">
          Showing <strong>{projects.length}</strong> of <strong>{total}</strong> Projects
        </div>
      </div>

      {/* Filter Card (Apple Settings Style) */}
      <div className="bg-white rounded-apple-lg border border-black/[0.06] p-5 shadow-apple space-y-4">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {/* Search query */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Keywords</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                name="q"
                defaultValue={params.q || ''}
                placeholder="Search road, school, ward..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-black/[0.03] border border-black/[0.06] rounded-apple focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/70"
              />
            </div>
          </div>

          {/* Financial Year */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Financial Year</label>
            <select
              name="year"
              defaultValue={params.year || ''}
              className="w-full py-1.5 px-2.5 text-xs bg-black/[0.03] border border-black/[0.06] rounded-apple focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/70"
            >
              <option value="">All Years</option>
              <option value="2024-25">2024-25</option>
              <option value="2023-24">2023-24</option>
              <option value="2022-23">2022-23</option>
            </select>
          </div>

          {/* Grama Panchayat */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Panchayat</label>
            <select
              name="panchayat"
              defaultValue={params.panchayat || ''}
              className="w-full py-1.5 px-2.5 text-xs bg-black/[0.03] border border-black/[0.06] rounded-apple focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/70"
            >
              <option value="">All Panchayats</option>
              <option value="Mala">Mala GP</option>
              <option value="Kuzhur">Kuzhur GP</option>
              <option value="Poyya">Poyya GP</option>
              <option value="Annamanada">Annamanada GP</option>
              <option value="Puthenchira">Puthenchira GP</option>
            </select>
          </div>

          {/* Scheme */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Scheme</label>
            <select
              name="scheme"
              defaultValue={params.scheme || ''}
              className="w-full py-1.5 px-2.5 text-xs bg-black/[0.03] border border-black/[0.06] rounded-apple focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/70"
            >
              <option value="">All Schemes</option>
              <option value="LAC-ADS">LAC-ADS</option>
              <option value="MLA SDF">MLA SDF</option>
              <option value="Grama Panchayat Development Fund">GP Plan Fund</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Status</label>
            <select
              name="status"
              defaultValue={params.status || ''}
              className="w-full py-1.5 px-2.5 text-xs bg-black/[0.03] border border-black/[0.06] rounded-apple focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/70"
            >
              <option value="">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Awarded">Awarded</option>
              <option value="Tendered">Tendered</option>
              <option value="Administrative Sanction">Administrative Sanction</option>
            </select>
          </div>

          <div className="lg:col-span-6 flex items-center justify-between pt-2 border-t border-black/[0.04]">
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-4 py-1.5 bg-black hover:bg-slate-800 text-white font-medium text-xs rounded-apple transition-transform active:scale-95 shadow-apple-sm"
              >
                Apply
              </button>
              <Link
                href="/projects"
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-black/[0.04] rounded-apple"
              >
                Reset
              </Link>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Sort:</span>
              <select
                name="sortBy"
                defaultValue={params.sortBy || ''}
                className="py-1 px-2 text-xs bg-black/[0.03] border border-black/[0.06] rounded-apple focus:bg-white"
              >
                <option value="">Default (Year & Date)</option>
                <option value="amount-desc">Highest Amount</option>
                <option value="amount-asc">Lowest Amount</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Projects List View */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-apple-lg border border-black/[0.06] p-12 text-center space-y-3 shadow-apple">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No matching projects found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords or clearing some filters.
          </p>
          <Link
            href="/projects"
            className="inline-block mt-2 px-3 py-1.5 text-xs font-semibold bg-black text-white rounded-apple"
          >
            Clear Filters
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-apple-lg border border-black/[0.06] shadow-apple overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/[0.02] border-b border-black/[0.05] text-slate-500 font-medium uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Project & Locality</th>
                  <th className="py-3 px-4">Year & Scheme</th>
                  <th className="py-3 px-4">Sanctioned</th>
                  <th className="py-3 px-4">Tendered</th>
                  <th className="py-3 px-4">Paid</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Sources</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {projects.map((proj) => {
                  const sourcesList = proj.sources_summary ? proj.sources_summary.split(',') : [];
                  return (
                    <tr key={proj.id} className="hover:bg-black/[0.015] transition-colors group">
                      <td className="py-3.5 px-4 max-w-xs">
                        <Link
                          href={`/projects/${proj.id}`}
                          className="font-semibold text-slate-900 group-hover:text-system-blue transition-colors line-clamp-2"
                        >
                          {proj.canonical_name}
                        </Link>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {proj.grama_panchayat || proj.local_body} {proj.ward ? `· ${proj.ward}` : ''}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-900">{proj.financial_year}</span>
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
      )}
    </div>
  );
}
