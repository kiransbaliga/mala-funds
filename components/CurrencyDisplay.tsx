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
    return 'Not recorded in public files';
  }
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

interface CurrencyDisplayProps {
  amount: number | null | undefined;
  label?: string;
  className?: string;
  sourceSystem?: string;
  sourceRecordId?: string;
}

export default function CurrencyDisplay({
  amount,
  label,
  className = '',
  sourceSystem,
  sourceRecordId,
}: CurrencyDisplayProps) {
  const isFound = amount !== null && amount !== undefined && !isNaN(amount);

  return (
    <div className={`flex flex-col ${className}`}>
      {label && <span className="text-[11px] font-medium text-slate-500 tracking-tight">{label}</span>}
      <div className="flex items-baseline gap-1.5 mt-0.5">
        <span className={`font-semibold tracking-tight ${isFound ? 'text-slate-900' : 'text-slate-400 italic text-sm'}`}>
          {isFound ? formatINR(amount) : 'Unknown'}
        </span>
        {isFound && (
          <span className="text-[11px] text-slate-500 font-normal">
            ({formatFullINR(amount)})
          </span>
        )}
      </div>
      {sourceSystem && (
        <div className="mt-1 text-[10px] text-slate-500 flex items-center gap-1 font-mono">
          <span className="w-1 h-1 rounded-full bg-slate-400"></span>
          <span>Source: {sourceSystem} {sourceRecordId ? `(${sourceRecordId})` : ''}</span>
        </div>
      )}
    </div>
  );
}
