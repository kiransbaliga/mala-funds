import React from 'react';

interface SourceBadgeProps {
  system: string;
  recordId?: string;
  url?: string;
  size?: 'sm' | 'md';
}

const SYSTEM_STYLES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  etender: {
    label: 'Kerala e-Tender',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200'
  },
  sulekha: {
    label: 'Kerala Sulekha',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200'
  },
  saankhya: {
    label: 'Kerala Saankhya',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200'
  },
  sakarma: {
    label: 'Kerala Sakarma',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200'
  },
  keri: {
    label: 'KERI Quality Tests',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200'
  },
  pask: {
    label: 'KWA PASK',
    bg: 'bg-cyan-50',
    text: 'text-cyan-800',
    border: 'border-cyan-200'
  },
  mala_panchayat: {
    label: 'Mala Panchayat',
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200'
  }
};

export default function SourceBadge({ system, recordId, url, size = 'sm' }: SourceBadgeProps) {
  const normKey = system.toLowerCase().trim();
  const config = SYSTEM_STYLES[normKey] || {
    label: system,
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200'
  };

  const badgeContent = (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${config.bg} ${config.text} ${config.border} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75"></span>
      {config.label}
      {recordId && <span className="opacity-60 font-mono text-[10px]">({recordId})</span>}
    </span>
  );

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:opacity-80 transition-opacity"
        title={`View record in ${config.label}`}
      >
        {badgeContent}
      </a>
    );
  }

  return badgeContent;
}

export function ConfidenceBadge({ level }: { level: 'HIGH' | 'MEDIUM' | 'LOW' | string }) {
  const norm = level.toUpperCase();
  if (norm === 'HIGH') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
        ✓ High Confidence (2+ Sources)
      </span>
    );
  }
  if (norm === 'MEDIUM') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
        ● Direct Source Verified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
      ⚠ Derived / Inferred
    </span>
  );
}
