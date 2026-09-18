import React from "react";
import { Target, AlertTriangle, Send, ArrowRight, CheckCircle2 } from "lucide-react";
import { CoverageStats, GO_LIVE_COVERAGE_FLOOR } from "../../../lib/catalogMatching";

type Props = {
  stats: CoverageStats;
  /** Jump to the view that clears the biggest remaining blocker. */
  onResolve: () => void;
  onRequestReview: () => void;
  onOpenReadiness?: () => void;
};

/**
 * Persistent coverage panel — confirmed-match coverage against the go-live
 * floor, what is left, and a visible path out when the floor is unreachable.
 */
export function CoveragePanel({ stats, onResolve, onRequestReview, onOpenReadiness }: Props) {
  const { coverage, meetsFloor, itemsToFloor, confirmed, total } = stats;

  return (
    <div className={`rounded-2xl border shadow-sm p-5 ${
      meetsFloor ? "bg-green-50 border-green-200" : "bg-white border-slate-100"
    }`}>
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="flex items-start gap-4 min-w-[260px]">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            meetsFloor ? "bg-green-100 text-green-600" : "bg-amber-50 text-amber-600"
          }`}>
            {meetsFloor ? <CheckCircle2 size={18} /> : <Target size={18} />}
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${meetsFloor ? "text-green-700" : "text-slate-900"}`}>
                {coverage}%
              </span>
              <span className="text-xs text-slate-500">confirmed-match coverage</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {confirmed.toLocaleString()} of {total.toLocaleString()} items confirmed · go-live floor {GO_LIVE_COVERAGE_FLOOR}%
            </div>
          </div>
        </div>

        {/* Progress against the floor */}
        <div className="flex-1 min-w-[240px]">
          <div className="relative h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${meetsFloor ? "bg-green-500" : "bg-amber-500"}`}
              style={{ width: `${Math.max(coverage, 1)}%` }}
            />
            {/* Floor marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-slate-900"
              style={{ left: `${GO_LIVE_COVERAGE_FLOOR}%` }}
              title={`Go-live floor: ${GO_LIVE_COVERAGE_FLOOR}%`}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-400">
            <span>0%</span>
            <span className="font-semibold text-slate-600">floor {GO_LIVE_COVERAGE_FLOOR}%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Plain-language status */}
      <div className="mt-4 pt-4 border-t border-slate-200/70">
        {meetsFloor ? (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-green-800">
              <span className="font-semibold">Catalog step satisfied.</span>{" "}
              You are above the {GO_LIVE_COVERAGE_FLOOR}% floor — this no longer blocks go-live.
            </p>
            {onOpenReadiness && (
              <button
                onClick={onOpenReadiness}
                className="text-xs font-semibold text-green-800 hover:underline flex items-center gap-1 flex-shrink-0"
              >
                Go-live readiness <ArrowRight size={12} />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              <span className="font-semibold">You need {GO_LIVE_COVERAGE_FLOOR}% coverage to go live —{" "}
              {itemsToFloor.toLocaleString()} more {itemsToFloor === 1 ? "item" : "items"} to resolve.</span>{" "}
              <span className="text-slate-500">
                {stats.highConfidencePending > 0
                  ? `${stats.highConfidencePending.toLocaleString()} are high-confidence and can be accepted in one action.`
                  : `${stats.noMatch.toLocaleString()} have no match and ${stats.needsReview.toLocaleString()} need your eyes.`}
              </span>
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={onResolve}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5"
              >
                Resolve the next {Math.min(itemsToFloor, stats.pending).toLocaleString()} <ArrowRight size={12} />
              </button>
              {onOpenReadiness && (
                <button
                  onClick={onOpenReadiness}
                  className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-medium px-4 py-2 rounded-xl text-xs transition-colors"
                >
                  Overall readiness
                </button>
              )}
            </div>

            {/* Below-floor exit — never a silent dead end */}
            <div className="flex items-start gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
              <AlertTriangle size={13} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-[11px] text-blue-800 leading-relaxed">
                <span className="font-semibold">Stock items that are not in the master catalog?</span>{" "}
                You will not reach the floor on matching alone. Request those items be added to
                the master, then ask us to review your coverage — we can clear the step manually.
                <button
                  onClick={onRequestReview}
                  className="ml-1.5 font-semibold underline inline-flex items-center gap-1"
                >
                  <Send size={10} /> Request a coverage review
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
