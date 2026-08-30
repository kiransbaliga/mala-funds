import React from 'react';
import { CheckCircle2, CircleDashed } from 'lucide-react';

export interface StageInfo {
  name: string;
  stageKey: string;
  found: boolean;
  date?: string | null;
  reference?: string | null;
  amount?: number | null;
  sourceSystem?: string;
}

interface LifecycleTimelineProps {
  stages: StageInfo[];
  currentStatus: string;
}

export default function LifecycleTimeline({ stages, currentStatus }: LifecycleTimelineProps) {
  return (
    <div className="w-full bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Project Lifecycle Stages
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail of verified administrative sanctions, tender notices, and treasury payments.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">
            {currentStatus}
          </span>
        </div>
      </div>

      {/* Responsive Grid for Timeline Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-2.5">
        {stages.map((stage, idx) => {
          return (
            <div
              key={stage.stageKey}
              className={`flex flex-col p-2.5 rounded border text-xs transition-colors ${
                stage.found
                  ? 'bg-emerald-50/50 border-emerald-200 text-slate-900'
                  : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  {idx + 1}
                </span>
                {stage.found ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <CircleDashed className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                )}
              </div>

              <span className="font-semibold text-[11px] leading-tight line-clamp-2">
                {stage.name}
              </span>

              {stage.found ? (
                <div className="mt-2 text-[10px] text-slate-600 space-y-0.5 border-t border-emerald-100 pt-1.5">
                  {stage.date && (
                    <div className="text-emerald-900 font-medium">
                      {stage.date}
                    </div>
                  )}
                  {stage.reference && (
                    <div className="truncate font-mono text-[9px] text-slate-500" title={stage.reference}>
                      {stage.reference}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-2 text-[10px] text-slate-400 italic border-t border-slate-200 pt-1.5">
                  Not in records
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
