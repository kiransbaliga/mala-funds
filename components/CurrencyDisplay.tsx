import React from 'react';

export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Unknown';
  }
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatFullINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Not found in public records';
  }
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

interface CurrencyDisplayProps {
  amount: number | null | undefined;
  label?: string;
  className?: string;
  sourceSystem?: string;
  sourceRecordId?: string;
  sourceUrl?: string;
  showLakhSuffix?: boolean;
}

export default function CurrencyDisplay({
  amount,
  label,
  className = '',
  sourceSystem,
  sourceRecordId,
  sourceUrl,
}: CurrencyDisplayProps) {
  const isFound = amount !== null && amount !== undefined && !isNaN(amount);

  return (
    <div className={`flex flex-col ${className}`}>
      {label && <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>}
      <div className="flex items-baseline gap-1.5 mt-0.5">
        <span className={`font-semibold tracking-tight ${isFound ? 'text-slate-900' : 'text-slate-400 italic text-sm'}`}>
          {isFound ? formatINR(amount) : 'Unknown'}
        </span>
        {isFound && (
          <span className="text-xs text-slate-500">
            ({formatFullINR(amount)})
          </span>
        )}
      </div>
      {sourceSystem && (
        <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-500"></span>
          <span>Source: <strong className="text-slate-700">{sourceSystem}</strong></span>
          {sourceRecordId && <span className="text-slate-400">({sourceRecordId})</span>}
        </div>
      )}
    </div>
  );
}
