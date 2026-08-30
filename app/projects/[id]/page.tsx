import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  ChevronLeft, 
  ExternalLink, 
  ShieldCheck, 
  Calendar, 
  Award, 
  Layers, 
  Banknote, 
  Wrench,
  CheckCircle2
} from 'lucide-react';
import { getProjectById } from '@/lib/db';
import { formatINR, formatFullINR } from '@/components/CurrencyDisplay';
import SourceBadge, { ConfidenceBadge } from '@/components/SourceBadge';
import LifecycleTimeline, { StageInfo } from '@/components/LifecycleTimeline';
import DiscrepancyViewer from '@/components/DiscrepancyViewer';

export const dynamic = 'force-dynamic';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    notFound();
  }

  const primarySanction = project.sanctions[0];
  const primaryTender = project.tenders[0];
  const primaryPlan = project.plans[0];
  const primaryPayment = project.payments[0];

  // Construct evidence-backed lifecycle stages
  const stages: StageInfo[] = [
    {
      name: 'Annual Plan',
      stageKey: 'proposed',
      found: !!primaryPlan || !!project.governance_records.length,
      date: primaryPlan?.plan_year || null,
      reference: primaryPlan?.sector ? `Sector: ${primaryPlan.sector}` : null,
      sourceSystem: 'Sulekha / Sakarma'
    },
    {
      name: 'Admin Sanction (AS)',
      stageKey: 'as',
      found: !!primarySanction?.as_number,
      date: primarySanction?.as_date,
      reference: primarySanction?.as_number,
      amount: primarySanction?.sanctioned_amount,
      sourceSystem: 'Kerala Sulekha'
    },
    {
      name: 'Tech Sanction (TS)',
      stageKey: 'ts',
      found: !!primarySanction?.ts_number,
      date: primarySanction?.ts_date,
      reference: primarySanction?.ts_number,
      sourceSystem: 'LSGD Engineering'
    },
    {
      name: 'Tender Published',
      stageKey: 'tendered',
      found: !!primaryTender?.tender_id,
      date: primaryTender?.published_date,
      reference: primaryTender?.tender_id,
      amount: primaryTender?.estimated_value,
      sourceSystem: 'e-Tender'
    },
    {
      name: 'Contract Awarded',
      stageKey: 'awarded',
      found: !!primaryTender?.award_date || !!primaryTender?.contractor,
      date: primaryTender?.award_date,
      reference: primaryTender?.contractor ? `Contractor: ${primaryTender.contractor}` : null,
      amount: primaryTender?.tender_value,
      sourceSystem: 'e-Tender'
    },
    {
      name: 'Work In Progress',
      stageKey: 'work_started',
      found: project.status === 'In Progress' || project.status === 'Completed' || !!project.engineering_records.length,
      date: project.executions[0]?.start_date || null,
      reference: project.engineering_records[0]?.agreement_reference || null,
      sourceSystem: 'LSGD / KERI'
    },
    {
      name: 'Site Completed',
      stageKey: 'completed',
      found: project.status === 'Completed',
      date: project.executions[0]?.actual_completion_date || null,
      reference: project.status === 'Completed' ? 'Completion verified' : null,
      sourceSystem: 'Sulekha'
    },
    {
      name: 'Bills Submitted',
      stageKey: 'billed',
      found: !!primaryPayment?.bill_reference,
      date: primaryPayment?.transaction_date || null,
      reference: primaryPayment?.bill_reference || null,
      sourceSystem: 'Saankhya'
    },
    {
      name: 'Treasury Paid',
      stageKey: 'paid',
      found: !!primaryPayment?.payment_status && primaryPayment.payment_status.includes('Paid'),
      date: primaryPayment?.transaction_date,
      reference: primaryPayment?.treasury_reference,
      amount: primaryPayment?.amount,
      sourceSystem: 'Saankhya / BiMS'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-black/[0.06] px-3 py-1.5 rounded-apple shadow-apple-sm transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> All Projects
        </Link>
      </div>

      {/* Main Dossier Card (Apple Grouped Card) */}
      <div className="bg-white rounded-apple-lg border border-black/[0.06] p-6 sm:p-8 shadow-apple space-y-5">
        {/* Geography Breadcrumb */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span>Kerala</span>
          <span className="text-slate-300">›</span>
          <span>{project.district}</span>
          <span className="text-slate-300">›</span>
          <span className="text-slate-900 font-semibold">{project.assembly_constituency}</span>
          {project.block_panchayat && (
            <>
              <span className="text-slate-300">›</span>
              <span>{project.block_panchayat}</span>
            </>
          )}
          {project.grama_panchayat && (
            <>
              <span className="text-slate-300">›</span>
              <span className="text-slate-900 font-semibold">{project.grama_panchayat}</span>
            </>
          )}
          {project.ward && (
            <>
              <span className="text-slate-300">›</span>
              <span className="px-2 py-0.5 rounded-full bg-black/[0.04] text-slate-700 font-mono text-[11px]">
                {project.ward}
              </span>
            </>
          )}
        </div>

        {/* Title and ID */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-2 max-w-4xl">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 leading-tight">
              {project.canonical_name}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              {project.description}
            </p>
          </div>
          <div className="flex flex-col items-start lg:items-end gap-2 flex-shrink-0">
            <ConfidenceBadge level={project.confidence_level} />
            <span className="text-[11px] text-slate-400 font-mono">
              ID: {project.id}
            </span>
          </div>
        </div>

        {/* Meta traits */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-black/[0.04] text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Financial Year: <strong className="text-slate-900">{project.financial_year}</strong></span>
          </div>
          <span className="text-slate-300">·</span>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Award className="w-3.5 h-3.5 text-slate-400" />
            <span>Scheme: <strong className="text-slate-900">{project.scheme_normalized}</strong></span>
          </div>
          <span className="text-slate-300">·</span>
          <div className="text-slate-500">
            Original Text: <span className="font-mono text-[11px] text-slate-700 bg-black/[0.03] px-1.5 py-0.5 rounded">&quot;{project.scheme_original}&quot;</span>
          </div>
        </div>
      </div>

      {/* Financial Comparison Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-5 rounded-apple-lg border border-black/[0.06] shadow-apple space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Administrative Sanction
          </span>
          <div className="text-2xl font-bold text-teal-700">
            {formatINR(project.sanctioned_amount)}
          </div>
          <span className="text-[11px] text-slate-500 block">
            {project.sanctioned_amount ? formatFullINR(project.sanctioned_amount) : 'Not recorded'}
          </span>
          <div className="mt-3 pt-2 border-t border-black/[0.04] text-[10px] text-slate-400 flex items-center justify-between font-mono">
            <span>Sulekha</span>
            <span>{primarySanction?.as_number || '—'}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-apple-lg border border-black/[0.06] shadow-apple space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Tender / Contract Award
          </span>
          <div className="text-2xl font-bold text-blue-700">
            {formatINR(project.tender_value)}
          </div>
          <span className="text-[11px] text-slate-500 block">
            {project.tender_value ? formatFullINR(project.tender_value) : 'Not tendered yet'}
          </span>
          <div className="mt-3 pt-2 border-t border-black/[0.04] text-[10px] text-slate-400 flex items-center justify-between font-mono">
            <span>e-Tender</span>
            <span>{primaryTender?.tender_id || '—'}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-apple-lg border border-black/[0.06] shadow-apple space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Verified Actual Paid
          </span>
          <div className="text-2xl font-bold text-purple-700">
            {formatINR(project.paid_amount)}
          </div>
          <span className="text-[11px] text-slate-500 block">
            {project.paid_amount ? formatFullINR(project.paid_amount) : 'No vouchers published'}
          </span>
          <div className="mt-3 pt-2 border-t border-black/[0.04] text-[10px] text-slate-400 flex items-center justify-between font-mono">
            <span>Saankhya</span>
            <span>{primaryPayment?.voucher_number || '—'}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-apple-lg border border-black/[0.06] shadow-apple space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Tender Savings
          </span>
          {project.estimated_value && project.tender_value ? (
            <>
              <div className="text-2xl font-bold text-emerald-700">
                +{formatINR(project.estimated_value - project.tender_value)}
              </div>
              <span className="text-[11px] text-slate-500 block">
                Estimated ₹{((project.estimated_value)/100000).toFixed(2)}L vs Award ₹{((project.tender_value)/100000).toFixed(2)}L
              </span>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-slate-400">N/A</div>
              <span className="text-[11px] text-slate-500 block">Requires both estimate & tender</span>
            </>
          )}
          <div className="mt-3 pt-2 border-t border-black/[0.04] text-[10px] text-slate-400 font-mono">
            Derived Procurement Metric
          </div>
        </div>
      </div>

      {/* Multi-Source Discrepancy Reconciliation */}
      <DiscrepancyViewer
        sanctionedAmount={project.sanctioned_amount}
        tenderValue={project.tender_value}
        estimatedValue={project.estimated_value}
        paidAmount={project.paid_amount}
        summary={project.discrepancy_summary}
      />

      {/* Lifecycle Timeline */}
      <LifecycleTimeline stages={stages} currentStatus={project.status} />

      {/* Direct Source Provenance Table */}
      <div className="bg-white rounded-apple-lg border border-black/[0.06] p-6 shadow-apple space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.05]">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Source Provenance Records ({project.sources.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct links and reference IDs in public government software archives.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/[0.02] border-b border-black/[0.05] text-slate-500 font-medium uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Source Portal</th>
                <th className="py-2.5 px-3">Record Identifier</th>
                <th className="py-2.5 px-3">Source Record Title</th>
                <th className="py-2.5 px-3">Verification</th>
                <th className="py-2.5 px-3 text-right">Government Archive</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {project.sources.map((src) => (
                <tr key={src.id} className="hover:bg-black/[0.015] transition-colors">
                  <td className="py-3 px-3 whitespace-nowrap">
                    <SourceBadge system={src.source_system} />
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] font-medium text-slate-800">
                    {src.source_record_id}
                  </td>
                  <td className="py-3 px-3 max-w-xs text-slate-600">
                    {src.source_title}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      ✓ Direct Record
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <a
                      href={src.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-apple bg-black/[0.04] hover:bg-black/[0.08] text-slate-800 text-xs font-semibold transition-colors"
                    >
                      Open Portal <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Governance Resolutions (Sakarma) */}
      {project.governance_records.length > 0 && (
        <div className="bg-white rounded-apple-lg border border-black/[0.06] p-6 shadow-apple space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-600" />
            Panchayat Council Resolutions (Sakarma)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {project.governance_records.map((gov) => (
              <div key={gov.id} className="p-4 rounded-apple bg-amber-50/40 border border-amber-200/50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-950 font-mono">{gov.resolution}</span>
                  <span className="text-slate-400 font-mono text-[11px]">{gov.meeting_date}</span>
                </div>
                <div className="text-xs text-slate-600">
                  {gov.local_body} · Meeting: {gov.meeting_id}
                </div>
                <p className="text-xs text-slate-800 leading-relaxed bg-white/80 p-3 rounded-apple border border-amber-200/40">
                  {gov.decision}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engineering Quality Test Records (KERI) */}
      {project.engineering_records.length > 0 && (
        <div className="bg-white rounded-apple-lg border border-black/[0.06] p-6 shadow-apple space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-4 h-4 text-rose-600" />
            Engineering Quality & Material Tests (KERI)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {project.engineering_records.map((eng) => (
              <div key={eng.id} className="p-4 rounded-apple bg-rose-50/40 border border-rose-200/50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-rose-950 font-mono">{eng.report_id}</span>
                  <span className="text-slate-400 font-mono text-[11px]">{eng.test_date}</span>
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  {eng.test_type}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-3 rounded-apple border border-rose-200/40">
                  {eng.description}
                </p>
                <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 inline-block">
                  Result: {eng.result}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Treasury Transactions & Payments (Saankhya) */}
      {project.payments.length > 0 && (
        <div className="bg-white rounded-apple-lg border border-black/[0.06] p-6 shadow-apple space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Banknote className="w-4 h-4 text-purple-600" />
            Treasury Disbursement Vouchers (Saankhya)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/[0.02] border-b border-black/[0.05] text-slate-500 font-medium uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Voucher No</th>
                  <th className="py-2.5 px-3">Bill Reference</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Treasury UTR</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {project.payments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-black/[0.015]">
                    <td className="py-3 px-3 font-mono font-medium text-purple-950">
                      {pay.voucher_number}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">
                      {pay.bill_reference}
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-mono">
                      {pay.transaction_date}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {formatFullINR(pay.amount)}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                      {pay.treasury_reference}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-800 border border-purple-200/60">
                        {pay.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
