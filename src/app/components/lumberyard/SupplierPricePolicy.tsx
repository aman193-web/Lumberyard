import React from "react";
import { useSupplierSetup } from "../../context/SupplierSetupContext";

const INPUT = "w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors bg-white";

type Props = {
  /** Small note under the Active policy summary. */
  note?: string;
};

/**
 * The supplier's price policy — one set of fields backed by the shared setup
 * store. Rendered identically by Supplier Setup → Price policy and
 * Supplier Profile → Pricing Policy.
 */
export function SupplierPricePolicy({ note }: Props) {
  const { pricePolicy, updatePricePolicy } = useSupplierSetup();

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="sm:col-span-3 lg:col-span-1">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Lock style
          </label>
          <select
            value={pricePolicy.lockStyle}
            onChange={e => updatePricePolicy({ lockStyle: e.target.value as "cap" | "fixed" })}
            className={INPUT}
          >
            <option value="cap">CAP (buyer pays the lower of locked/market)</option>
            <option value="fixed">FIXED (exact quoted price guaranteed)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Lock window (days)
          </label>
          <input
            type="number"
            value={pricePolicy.lockWindowDays}
            onChange={e => updatePricePolicy({ lockWindowDays: e.target.value })}
            className={INPUT}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Down payment %
          </label>
          <input
            type="number"
            value={pricePolicy.downPaymentPct}
            onChange={e => updatePricePolicy({ downPaymentPct: e.target.value })}
            className={INPUT}
          />
        </div>
      </div>

      {/* Live summary */}
      <div className="bg-slate-900 rounded-2xl p-5 text-white">
        <div className="text-xs font-bold mb-3">Active policy</div>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-white/60">Model</span>
            <span className="font-semibold uppercase">{pricePolicy.lockStyle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Lock window</span>
            <span className="font-semibold">{pricePolicy.lockWindowDays || 0} days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Down payment</span>
            <span className="font-semibold">{pricePolicy.downPaymentPct || 0}%</span>
          </div>
        </div>
        {note && (
          <p className="text-[10px] text-white/40 mt-3 leading-relaxed">{note}</p>
        )}
      </div>
    </div>
  );
}

/** The copy both screens show above the fields. */
export const PRICE_POLICY_DESCRIPTION =
  "How buyers lock your prices, paid up front. CAP protects buyers if market drops; FIXED locks the quoted number.";
