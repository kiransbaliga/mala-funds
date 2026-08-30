import React from 'react';
import Link from 'next/link';
import { Search, Filter, MapPin, ShieldCheck, ArrowRight, AlertTriangle, Layers } from 'lucide-react';
import { getAllProjects } from '@/lib/db';
import { formatINR } from '@/components/CurrencyDisplay';
import SourceBadge, { ConfidenceBadge } from '@/components/SourceBadge';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Project Explorer
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Forensic cross-source public development project registry for Mala Block & Kodungallur LAC.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-teal-500"></span>
          Showing {projects.length} of {total} Reconciled Projects
        </div>
      </div>

      {/* Filter Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {/* Search query */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Search Keywords</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                name="q"
                defaultValue={params.q || ''}
                placeholder="Search road, school, locality..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Financial Year */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Financial Year</label>
            <select
              name="year"
              defaultValue={params.year || ''}
              className="w-full py-2 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="">All Years</option>
              <option value="2024-25">2024-25</option>
              <option value="2023-24">2023-24</option>
              <option value="2022-23">2022-23</option>
            </select>
          </div>

          {/* Grama Panchayat */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Grama Panchayat</label>
            <select
              name="panchayat"
              defaultValue={params.panchayat || ''}
              className="w-full py-2 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Scheme</label>
            <select
              name="scheme"
              defaultValue={params.scheme || ''}
              className="w-full py-2 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="">All Schemes</option>
              <option value="LAC-ADS">LAC-ADS</option>
              <option value="MLA SDF">MLA SDF</option>
              <option value="Grama Panchayat Development Fund">GP Plan Fund</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
            <select
              name="status"
              defaultValue={params.status || ''}
              className="w-full py-2 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Awarded">Awarded</option>
              <option value="Tendered">Tendered</option>
              <option value="Administrative Sanction">Administrative Sanction</option>
            </select>
          </div>

          <div className="lg:col-span-6 flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
              >
                Apply Filters
              </button>
              <Link
                href="/projects"
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
              >
                Reset
              </Link>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Sort by:</span>
              <select
                name="sortBy"
                defaultValue={params.sortBy || ''}
                className="py-1 px-2 text-xs bg-slate-50 border border-slate-200 rounded-md"
              >
                <option value="">Default (Year & Date)</option>
                <option value="amount-desc">Highest Amount</option>
                <option value="amount-asc">Lowest Amount</option>
                <option value="name">Project Name (A-Z)</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Projects Table */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No matching projects found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or clearing some filters to see projects.
          </p>
          <Link
            href="/projects"
            className="inline-block mt-2 px-3 py-1.5 text-xs font-semibold bg-teal-700 text-white rounded-lg"
          >
            Clear All Filters
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Project & Locality</th>
                  <th className="py-3 px-4">Financial Year</th>
                  <th className="py-3 px-4">Scheme (Original & Norm)</th>
                  <th className="py-3 px-4">Sanctioned</th>
                  <th className="py-3 px-4">Tendered</th>
                  <th className="py-3 px-4">Actual Paid</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Sources / Evidence</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map((proj) => {
                  const sourcesList = proj.sources_summary ? proj.sources_summary.split(',') : [];
                  return (
                    <tr key={proj.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="py-3.5 px-4 max-w-xs">
                        <Link
                          href={`/projects/${proj.id}`}
                          className="font-bold text-slate-900 hover:text-teal-700 line-clamp-2"
                        >
                          {proj.canonical_name}
                        </Link>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{proj.grama_panchayat || proj.local_body}</span>
                          {proj.ward && <span className="font-medium text-slate-700">· {proj.ward}</span>}
                        </div>
                        {proj.discrepancy_summary && (
                          <div className="mt-1.5 text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block">
                            ⚠ Lifecycle Variance Noted
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-900">{proj.financial_year}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block">{proj.scheme_normalized}</span>
                        <span className="text-[10px] text-slate-500 font-mono block line-clamp-1" title={proj.scheme_original}>
                          {proj.scheme_original}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-medium text-slate-800">{formatINR(proj.sanctioned_amount)}</span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-medium text-blue-700">{formatINR(proj.tender_value)}</span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-medium text-purple-700">{formatINR(proj.paid_amount)}</span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          proj.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : proj.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
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
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-xs transition-colors"
                        >
                          Dossier <ArrowRight className="w-3 h-3" />
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
