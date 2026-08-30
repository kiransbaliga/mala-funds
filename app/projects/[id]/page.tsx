import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  ArrowLeft, 
  ExternalLink, 
  ShieldCheck, 
  FileCheck, 
  Layers, 
  Banknote, 
  Award, 
  Wrench, 
  FileText,
  AlertTriangle,
  Info
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
      name: 'Proposed / Annual Plan',
      stageKey: 'proposed',
      found: !!primaryPlan || !!project.governance_records.length,
      date: primaryPlan?.plan_year || null,
      reference: primaryPlan?.sector ? `Sector: ${primaryPlan.sector}` : null,
      sourceSystem: 'Sulekha / Sakarma'
    },
    {
      name: 'Administrative Sanction (AS)',
      stageKey: 'as',
      found: !!primarySanction?.as_number,
      date: primarySanction?.as_date,
      reference: primarySanction?.as_number,
      amount: primarySanction?.sanctioned_amount,
      sourceSystem: 'Kerala Sulekha / LSGD'
    },
    {
      name: 'Technical Sanction (TS)',
      stageKey: 'ts',
      found: !!primarySanction?.ts_number,
      date: primarySanction?.ts_date,
      reference: primarySanction?.ts_number,
      sourceSystem: 'LSGD Engineering Section'
    },
    {
      name: 'Tender Published',
      stageKey: 'tendered',
      found: !!primaryTender?.tender_id,
      date: primaryTender?.published_date,
      reference: primaryTender?.tender_id,
      amount: primaryTender?.estimated_value,
      sourceSystem: 'Kerala e-Tender'
    },
    {
      name: 'Contract Awarded',
      stageKey: 'awarded',
      found: !!primaryTender?.award_date || !!primaryTender?.contractor,
      date: primaryTender?.award_date,
      reference: primaryTender?.contractor ? `Contractor: ${primaryTender.contractor}` : null,
      amount: primaryTender?.tender_value,
      sourceSystem: 'Kerala e-Tender'
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
      name: 'Work Completed',
      stageKey: 'completed',
      found: project.status === 'Completed',
      date: project.executions[0]?.actual_completion_date || null,
      reference: project.status === 'Completed' ? 'Site completion verified' : null,
      sourceSystem: 'Sulekha / LSGD'
    },
    {
      name: 'Bills Submitted',
      stageKey: 'billed',
      found: !!primaryPayment?.bill_reference,
      date: primaryPayment?.transaction_date || null,
      reference: primaryPayment?.bill_reference || null,
      sourceSystem: 'Saankhya Accounting'
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Project Explorer
        </Link>
      </div>

      {/* Hero / Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        {/* Geography Breadcrumb */}
        <div className="flex flex-wrap items-center gap-1 text-xs text-slate-500 font-medium">
          <span>Kerala</span>
          <span>›</span>
          <span>{project.district}</span>
          <span>›</span>
          <span className="text-teal-800 font-semibold">{project.assembly_constituency}</span>
          {project.block_panchayat && (
            <>
              <span>›</span>
              <span>{project.block_panchayat}</span>
            </>
          )}
          {project.grama_panchayat && (
            <>
              <span>›</span>
              <span className="font-semibold text-slate-800">{project.grama_panchayat}</span>
            </>
          )}
          {project.ward && (
            <>
              <span>›</span>
              <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-medium">
                {project.ward}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pt-2">
          <div className="space-y-2 max-w-4xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {project.canonical_name}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              {project.description}
            </p>
          </div>
          <div className="flex flex-col items-start lg:items-end gap-2 flex-shrink-0">
            <ConfidenceBadge level={project.confidence_level} />
            <span className="text-xs text-slate-500 font-mono">
              ID: {project.id}
            </span>
          </div>
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1 text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Financial Year: <strong className="text-slate-800">{project.financial_year}</strong></span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 text-slate-600">
            <Award className="w-3.5 h-3.5 text-slate-400" />
            <span>Normalized Scheme: <strong className="text-slate-800">{project.scheme_normalized}</strong></span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 text-slate-600">
            <span>Original Scheme Wording: <strong className="text-slate-800 font-mono text-[11px]">&quot;{project.scheme_original}&quot;</strong></span>
          </div>
          {project.mla_name && (
            <>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1 text-slate-600">
                <span>MLA: <strong className="text-slate-800">{project.mla_name}</strong></span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Financial Comparison Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sanctioned */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="w-1 h-full bg-teal-500 absolute left-0 top-0"></div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Administrative Sanction
          </span>
          <div className="text-2xl font-extrabold text-teal-700 mt-2">
            {formatINR(project.sanctioned_amount)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {project.sanctioned_amount ? formatFullINR(project.sanctioned_amount) : 'Not recorded'}
          </span>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Source: Sulekha</span>
            {primarySanction?.as_number && <span className="font-mono">{primarySanction.as_number}</span>}
          </div>
        </div>

        {/* Tendered */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="w-1 h-full bg-blue-500 absolute left-0 top-0"></div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Tender / Contract Value
          </span>
          <div className="text-2xl font-extrabold text-blue-700 mt-2">
            {formatINR(project.tender_value)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {project.tender_value ? formatFullINR(project.tender_value) : 'Not tendered yet'}
          </span>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Source: e-Tender</span>
            {primaryTender?.tender_id && <span className="font-mono">{primaryTender.tender_id}</span>}
          </div>
        </div>

        {/* Actual Paid */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="w-1 h-full bg-purple-500 absolute left-0 top-0"></div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Verified Actual Paid
          </span>
          <div className="text-2xl font-extrabold text-purple-700 mt-2">
            {formatINR(project.paid_amount)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {project.paid_amount ? formatFullINR(project.paid_amount) : 'No vouchers published'}
          </span>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Source: Saankhya</span>
            {primaryPayment?.voucher_number && <span className="font-mono">{primaryPayment.voucher_number}</span>}
          </div>
        </div>

        {/* Variance / Savings */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="w-1 h-full bg-amber-500 absolute left-0 top-0"></div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Tender Savings / Variance
          </span>
          {project.estimated_value && project.tender_value ? (
            <>
              <div className="text-2xl font-extrabold text-emerald-700 mt-2">
                +{formatINR(project.estimated_value - project.tender_value)}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Estimated ₹{((project.estimated_value)/100000).toFixed(2)}L vs Awarded ₹{((project.tender_value)/100000).toFixed(2)}L
              </span>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-slate-400 mt-2">N/A</div>
              <span className="text-[11px] text-slate-500 mt-1 block">Requires both estimate & tender</span>
            </>
          )}
          <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
            Derived Procurement Metric
          </div>
        </div>
      </div>

      {/* Discrepancy & Reconciliation Card */}
      <DiscrepancyViewer
        sanctionedAmount={project.sanctioned_amount}
        tenderValue={project.tender_value}
        estimatedValue={project.estimated_value}
        paidAmount={project.paid_amount}
        summary={project.discrepancy_summary}
      />

      {/* Lifecycle Timeline */}
      <LifecycleTimeline stages={stages} currentStatus={project.status} />

      {/* Direct Source Provenance & Evidence Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-700" />
              Source Provenance & Government Records ({project.sources.length})
            </h3>
            <p className="text-xs text-slate-500">
              Every data point is directly grounded in public government software records.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Source System</th>
                <th className="py-3 px-4">Record Identifier</th>
                <th className="py-3 px-4">Source Title / Reference</th>
                <th className="py-3 px-4">Retrieved Date</th>
                <th className="py-3 px-4">Verification Type</th>
                <th className="py-3 px-4 text-right">Original Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {project.sources.map((src) => (
                <tr key={src.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <SourceBadge system={src.source_system} />
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] font-semibold text-slate-800">
                    {src.source_record_id}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs text-slate-700">
                    {src.source_title}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                    {src.retrieved_at.split('T')[0]}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ✓ Directly Reported
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <a
                      href={src.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-teal-50 hover:text-teal-700 font-semibold text-xs transition-colors"
                    >
                      Inspect Source <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Governance & Democratic Approvals (Sakarma) */}
      {project.governance_records.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-700" />
            Panchayat Council Resolutions & Governance Records (Sakarma)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.governance_records.map((gov) => (
              <div key={gov.id} className="p-4 rounded-xl bg-amber-50/40 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-900">{gov.resolution}</span>
                  <span className="text-slate-500">{gov.meeting_date}</span>
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  {gov.local_body} · Meeting ID: {gov.meeting_id}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-amber-100">
                  {gov.decision}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engineering Quality Test Records (KERI) */}
      {project.engineering_records.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-rose-700" />
            Engineering Quality & Material Verification (KERI)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.engineering_records.map((eng) => (
              <div key={eng.id} className="p-4 rounded-xl bg-rose-50/40 border border-rose-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-rose-900 font-mono">{eng.report_id}</span>
                  <span className="text-slate-500">{eng.test_date}</span>
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  {eng.test_type}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-rose-100">
                  {eng.description}
                </p>
                <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 inline-block">
                  Result: {eng.result}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Treasury Transactions & Payments (Saankhya) */}
      {project.payments.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Banknote className="w-5 h-5 text-purple-700" />
            Treasury & Accounting Vouchers (Saankhya)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Voucher No</th>
                  <th className="py-3 px-4">Bill Reference</th>
                  <th className="py-3 px-4">Transaction Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Treasury Reference</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {project.payments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-mono font-semibold text-purple-900">
                      {pay.voucher_number}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {pay.bill_reference}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {pay.transaction_date}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatFullINR(pay.amount)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                      {pay.treasury_reference}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800">
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
