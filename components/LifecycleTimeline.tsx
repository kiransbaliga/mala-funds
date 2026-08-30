import React from 'react';
import { Check, Circle } from 'lucide-react';

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
    <div className="w-full bg-white rounded-apple-lg border border-black/[0.06] p-6 shadow-apple space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-black/[0.05] gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
            Lifecycle & Procurement Audit Trail
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Sequential progression across administrative sanctions, tendering, and treasury release.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 font-medium">Status:</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-black/[0.05] text-slate-900 border border-black/[0.04]">
            {currentStatus}
          </span>
        </div>
      </div>

      {/* Apple Milestone Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3">
        {stages.map((stage, idx) => {
          return (
            <div
              key={stage.stageKey}
              className={`flex flex-col p-3 rounded-apple border transition-all ${
                stage.found
                  ? 'bg-slate-50/80 border-black/[0.08] text-slate-900 shadow-apple-sm'
                  : 'bg-black/[0.01] border-black/[0.04] text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  0{idx + 1}
                </span>
                {stage.found ? (
                  <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-300 stroke-[1.5]" />
                )}
              </div>

              <span className="font-semibold text-xs leading-snug line-clamp-2 text-slate-800">
                {stage.name}
              </span>

              {stage.found ? (
                <div className="mt-2 text-[10px] text-slate-500 space-y-0.5 border-t border-black/[0.04] pt-2">
                  {stage.date && (
                    <div className="font-medium text-slate-900 font-mono">
                      {stage.date}
                    </div>
                  )}
                  {stage.reference && (
                    <div className="truncate font-mono text-[9px] text-slate-400" title={stage.reference}>
                      {stage.reference}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-2 text-[10px] text-slate-400 italic border-t border-black/[0.04] pt-2">
                  Unverified
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
