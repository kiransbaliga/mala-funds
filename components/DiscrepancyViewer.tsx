import React from 'react';
import { AlertTriangle, Info, ArrowRight } from 'lucide-react';
import { formatINR } from './CurrencyDisplay';

interface DiscrepancyViewerProps {
  sanctionedAmount?: number | null;
  tenderValue?: number | null;
  estimatedValue?: number | null;
  paidAmount?: number | null;
  summary?: string | null;
}

export default function DiscrepancyViewer({
  sanctionedAmount,
  tenderValue,
  estimatedValue,
  paidAmount,
  summary
}: DiscrepancyViewerProps) {
  const hasValues = (sanctionedAmount && tenderValue) || (tenderValue && paidAmount);

  if (!summary && !hasValues) return null;

  const tenderSavings = estimatedValue && tenderValue ? estimatedValue - tenderValue : null;
  const paymentVariance = tenderValue && paidAmount ? paidAmount - tenderValue : null;

  return (
    <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-5 shadow-sm text-slate-800">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-100 text-amber-800 mt-0.5">
          <Info className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-amber-900 flex items-center gap-2">
            Multi-Source Cross-Check & Lifecycle Variance Analysis
          </h4>
          <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
            Government data systems record different financial checkpoints along the project lifecycle. Discrepancies between estimated, tendered, and paid figures represent procurement variance and measurement deductions.
          </p>

          {/* Side-by-side comparison table */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200">
              <span className="text-[11px] font-medium text-slate-500 block">Sulekha Sanction</span>
              <span className="text-sm font-bold text-slate-900">{formatINR(sanctionedAmount)}</span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200">
              <span className="text-[11px] font-medium text-slate-500 block">e-Tender Contract</span>
              <span className="text-sm font-bold text-slate-900">{formatINR(tenderValue)}</span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200">
              <span className="text-[11px] font-medium text-slate-500 block">Saankhya Paid</span>
              <span className="text-sm font-bold text-slate-900">{formatINR(paidAmount)}</span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200">
              <span className="text-[11px] font-medium text-slate-500 block">Tender Savings</span>
              <span className="text-sm font-bold text-emerald-700">
                {tenderSavings !== null ? (tenderSavings > 0 ? `+${formatINR(tenderSavings)}` : formatINR(tenderSavings)) : 'N/A'}
              </span>
            </div>
          </div>

          {summary && (
            <div className="mt-3 p-2.5 rounded-lg bg-amber-100/60 border border-amber-200 text-xs text-amber-950 font-medium">
              <strong>Observation:</strong> {summary}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
