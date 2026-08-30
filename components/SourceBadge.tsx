import React from 'react';

interface SourceBadgeProps {
  system: string;
  recordId?: string;
  url?: string;
  size?: 'sm' | 'md';
}

const SYSTEM_STYLES: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  etender: {
    label: 'e-Tender',
    bg: 'bg-blue-50/80 border-blue-200/60',
    text: 'text-blue-700',
    dot: 'bg-blue-500'
  },
  sulekha: {
    label: 'Sulekha',
    bg: 'bg-emerald-50/80 border-emerald-200/60',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500'
  },
  saankhya: {
    label: 'Saankhya',
    bg: 'bg-purple-50/80 border-purple-200/60',
    text: 'text-purple-700',
    dot: 'bg-purple-500'
  },
  sakarma: {
    label: 'Sakarma',
    bg: 'bg-amber-50/80 border-amber-200/60',
    text: 'text-amber-800',
    dot: 'bg-amber-500'
  },
  keri: {
    label: 'KERI Quality',
    bg: 'bg-rose-50/80 border-rose-200/60',
    text: 'text-rose-700',
    dot: 'bg-rose-500'
  },
  pask: {
    label: 'KWA PASK',
    bg: 'bg-cyan-50/80 border-cyan-200/60',
    text: 'text-cyan-800',
    dot: 'bg-cyan-500'
  },
  mala_panchayat: {
    label: 'Mala GP',
    bg: 'bg-teal-50/80 border-teal-200/60',
    text: 'text-teal-700',
    dot: 'bg-teal-500'
  }
};

export default function SourceBadge({ system, recordId, url, size = 'sm' }: SourceBadgeProps) {
  const normKey = system.toLowerCase().trim();
  const config = SYSTEM_STYLES[normKey] || {
    label: system,
    bg: 'bg-slate-100 border-slate-200',
    text: 'text-slate-700',
    dot: 'bg-slate-400'
  };

  const badgeContent = (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${config.text} ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      } transition-opacity`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      <span>{config.label}</span>
      {recordId && <span className="opacity-50 font-mono text-[9px]">({recordId})</span>}
    </span>
  );

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:opacity-75 transition-opacity inline-flex items-center"
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
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        High Confidence (2+ Sources)
      </span>
    );
  }
  if (norm === 'MEDIUM') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/70">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
        Direct Source Verified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/70">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
      Single Record / Inferred
    </span>
  );
}
