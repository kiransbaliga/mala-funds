import React from 'react';
import Link from 'next/link';
import { Layers, ShieldCheck, Database, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { getSourceOverlap, getAllProjects, getMongoDb } from '@/lib/db';
import SourceBadge from '@/components/SourceBadge';

export const dynamic = 'force-dynamic';

export default async function DataQualityPage() {
  const overlap = await getSourceOverlap();
  const db = await getMongoDb();
  const logs = await db.collection('ingestion_logs').find({}).sort({ started_at: -1 }).limit(5).toArray();
  const allProjects = (await getAllProjects({ limit: 100 })).projects;

  const total = allProjects.length;
  const withTender = allProjects.filter(p => p.tender_value !== null).length;
  const withSanction = allProjects.filter(p => p.sanctioned_amount !== null).length;
  const withPaid = allProjects.filter(p => p.paid_amount !== null).length;
  const withMultipleSources = allProjects.filter(p => p.source_count >= 2).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Source Overlap & Data Quality Audit
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Direct statistical reconciliation across government databases via MongoDB Atlas.
        </p>
      </div>

      {/* Section 1: Completeness Health */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Multi-Source Corroboration
          </span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1.5">
            {((withMultipleSources / (total || 1)) * 100).toFixed(0)}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {withMultipleSources} of {total} verified by ≥2 systems
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Sanction Record Found
          </span>
          <div className="text-2xl font-extrabold text-teal-700 mt-1.5">
            {((withSanction / (total || 1)) * 100).toFixed(0)}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {withSanction} of {total} AS records located
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Tender / Procurement Found
          </span>
          <div className="text-2xl font-extrabold text-blue-700 mt-1.5">
            {((withTender / (total || 1)) * 100).toFixed(0)}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {withTender} of {total} e-Tender NITs matched
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Payment Vouchers Published
          </span>
          <div className="text-2xl font-extrabold text-purple-700 mt-1.5">
            {((withPaid / (total || 1)) * 100).toFixed(0)}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {withPaid} of {total} with treasury disbursement
          </span>
        </div>
      </div>

      {/* Section 2: Overlap Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Harvested Source Counts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-teal-700" />
            Raw Records Harvested by System
          </h3>
          <div className="divide-y divide-slate-100">
            {overlap.systemCounts.map((sys) => (
              <div key={sys.source_system} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SourceBadge system={sys.source_system} />
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {sys.count} records
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cross-Source Overlap Pairs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-700" />
            Cross-Source Entity Reconciliations
          </h3>
          <p className="text-xs text-slate-500">
            Number of canonical projects corroborated simultaneously by both government portals:
          </p>
          <div className="divide-y divide-slate-100">
            {overlap.crossMatches.map((m) => (
              <div key={m.label} className="py-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">
                  {m.label}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-teal-50 text-teal-800 border border-teal-200">
                  {m.count} projects matched
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: Ingestion Logs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Data Pipeline Ingestion & Idempotency Logs
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">System</th>
                <th className="py-3 px-4">Records Found</th>
                <th className="py-3 px-4">Reconciled New</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {logs.map((log: any, idx: number) => (
                <tr key={log._id || idx} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-800">{log.source_system}</td>
                  <td className="py-3 px-4 text-slate-800">{log.records_found}</td>
                  <td className="py-3 px-4 text-emerald-700">{log.records_new}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      ✓ {log.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-sans text-xs">{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
