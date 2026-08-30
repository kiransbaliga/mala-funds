import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-black/[0.06]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
            Analytics & Allocations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Spending trends, scheme distribution, and geographic allocation for Mala Block & Kodungallur LAC.
          </p>
        </div>
        <Link
          href="/projects"
          className="text-xs font-semibold px-3 py-1.5 rounded-apple bg-black text-white hover:bg-slate-800 transition-colors shadow-apple-sm w-fit"
        >
          View Raw Projects →
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-5 rounded-apple-lg border border-black/[0.06] shadow-apple space-y-1">
          <span className="text-[11px] font-semibold text-teal-700 uppercase tracking-wider block">
            Sanctioned Outlay
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900">
            {formatINR(stats.totalSanctioned)}
          </div>
          <span className="text-[11px] text-slate-500 block">
            {stats.totalProjects} tracked projects
          </span>
        </div>

        <div className="bg-white p-5 rounded-apple-lg border border-black/[0.06] shadow-apple space-y-1">
          <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">
            Tendered Value
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900">
            {formatINR(stats.totalTendered)}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Contract awards in e-Tender
          </span>
        </div>

        <div className="bg-white p-5 rounded-apple-lg border border-black/[0.06] shadow-apple space-y-1">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
            Tender Savings
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-700">
            +{formatINR(stats.tenderSavings)}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Estimate vs awarded contract
          </span>
        </div>

        <div className="bg-white p-5 rounded-apple-lg border border-black/[0.06] shadow-apple space-y-1">
          <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider block">
            Verified Paid
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900">
            {formatINR(stats.totalPaid)}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Published Saankhya vouchers
          </span>
        </div>
      </div>

      {/* Interactive Charts Component */}
      <DashboardCharts
        yearlyData={yearlyData}
        panchayatData={panchayatData}
        schemeData={schemeData}
        categoryData={categoryData}
      />

      {/* Scheme Distribution Table */}
      <div className="bg-white rounded-apple-lg border border-black/[0.06] p-6 shadow-apple space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
          Funding Schemes Distribution
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/[0.02] border-b border-black/[0.05] text-slate-500 font-medium uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Scheme</th>
                <th className="py-2.5 px-3">Projects</th>
                <th className="py-2.5 px-3">Sanctioned Outlay</th>
                <th className="py-2.5 px-3">Tendered Value</th>
                <th className="py-2.5 px-3">Actual Paid</th>
                <th className="py-2.5 px-3 text-right">Explorer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {schemeData.map((sch) => (
                <tr key={sch.scheme} className="hover:bg-black/[0.015]">
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {sch.scheme}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700">
                    {sch.projectCount}
                  </td>
                  <td className="py-3 px-3 font-medium text-teal-800">
                    {formatINR(sch.sanctioned)}
                  </td>
                  <td className="py-3 px-3 font-medium text-blue-700">
                    {formatINR(sch.tendered)}
                  </td>
                  <td className="py-3 px-3 font-medium text-purple-700">
                    {formatINR(sch.spent)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      href={`/projects?scheme=${encodeURIComponent(sch.scheme)}`}
                      className="inline-flex items-center gap-0.5 text-xs font-semibold text-system-blue hover:opacity-80"
                    >
                      Filter <ChevronRight className="w-3.5 h-3.5" />
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
