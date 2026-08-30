import React from 'react';
import Link from 'next/link';
import { BarChart3, TrendingUp, Filter, ArrowRight, ShieldCheck } from 'lucide-react';
import { getStats, getStatsByYear, getStatsByPanchayat, getStatsByScheme, getStatsByCategory } from '@/lib/db';
import { formatINR } from '@/components/CurrencyDisplay';
import DashboardCharts from '@/components/DashboardCharts';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const stats = await getStats();
  const yearlyData = await getStatsByYear();
  const panchayatData = await getStatsByPanchayat();
  const schemeData = await getStatsByScheme();
  const categoryData = await getStatsByCategory();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Financial & Project Analytics Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Reconciled spending, scheme distribution, and geographic allocation for Mala & Kodungallur LAC.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs shadow-sm transition-colors"
          >
            Explore Raw Projects <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Summary KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Sanctioned
          </span>
          <div className="text-2xl font-extrabold text-teal-700 mt-1.5">
            {formatINR(stats.totalSanctioned)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Across {stats.totalProjects} tracked projects
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Tendered
          </span>
          <div className="text-2xl font-extrabold text-blue-700 mt-1.5">
            {formatINR(stats.totalTendered)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Procurement value awarded
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Tender Savings
          </span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1.5">
            +{formatINR(stats.tenderSavings)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Estimated vs awarded contracts
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Verified Paid
          </span>
          <div className="text-2xl font-extrabold text-purple-700 mt-1.5">
            {formatINR(stats.totalPaid)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Published Saankhya vouchers
          </span>
        </div>
      </div>

      {/* Interactive Charts */}
      <DashboardCharts
        yearlyData={yearlyData}
        panchayatData={panchayatData}
        schemeData={schemeData}
        categoryData={categoryData}
      />

      {/* Scheme Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Funding Schemes Distribution (LAC-ADS vs MLA SDF)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Scheme Classification</th>
                <th className="py-3 px-4">Projects</th>
                <th className="py-3 px-4">Sanctioned Outlay</th>
                <th className="py-3 px-4">Tendered Value</th>
                <th className="py-3 px-4">Verified Paid</th>
                <th className="py-3 px-4 text-right">Explorer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schemeData.map((sch) => (
                <tr key={sch.scheme} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {sch.scheme}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    {sch.projectCount}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-teal-800">
                    {formatINR(sch.sanctioned)}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-blue-700">
                    {formatINR(sch.tendered)}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-purple-700">
                    {formatINR(sch.spent)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/projects?scheme=${encodeURIComponent(sch.scheme)}`}
                      className="text-xs font-semibold text-teal-700 hover:text-teal-900"
                    >
                      Filter projects →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
