import React from 'react';
import { Info } from 'lucide-react';
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

  return (
    <div className="bg-amber-50/60 border border-amber-200/70 rounded-apple-lg p-5 shadow-apple-sm text-slate-800 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="text-sm font-semibold text-amber-950">
            Multi-Source Financial Cross-Check & Variance
          </h4>
          <p className="text-xs text-amber-900/80 leading-relaxed">
            Government databases record different lifecycle points. Estimated budgets, awarded bids, and measured site disbursements reflect legitimate procurement variances.
          </p>
        </div>
      </div>

      {/* Grid of comparison values */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        <div className="bg-white/80 p-3 rounded-apple border border-amber-200/50">
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">Sulekha Sanction</span>
          <span className="text-sm font-semibold text-slate-900 mt-0.5 block">{formatINR(sanctionedAmount)}</span>
        </div>
        <div className="bg-white/80 p-3 rounded-apple border border-amber-200/50">
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">e-Tender Award</span>
          <span className="text-sm font-semibold text-slate-900 mt-0.5 block">{formatINR(tenderValue)}</span>
        </div>
        <div className="bg-white/80 p-3 rounded-apple border border-amber-200/50">
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">Saankhya Paid</span>
          <span className="text-sm font-semibold text-slate-900 mt-0.5 block">{formatINR(paidAmount)}</span>
        </div>
        <div className="bg-white/80 p-3 rounded-apple border border-amber-200/50">
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">Tender Savings</span>
          <span className="text-sm font-semibold text-emerald-700 mt-0.5 block">
            {tenderSavings !== null ? (tenderSavings > 0 ? `+${formatINR(tenderSavings)}` : formatINR(tenderSavings)) : 'N/A'}
          </span>
        </div>
      </div>

      {summary && (
        <div className="text-xs text-amber-950 font-medium bg-amber-100/50 p-2.5 rounded-apple border border-amber-200/40">
          <span className="font-semibold">Note:</span> {summary}
        </div>
      )}
    </div>
  );
}
