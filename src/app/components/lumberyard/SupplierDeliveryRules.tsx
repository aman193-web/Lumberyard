import React from "react";
import { Truck, Info } from "lucide-react";
import { useSupplierSetup } from "../../context/SupplierSetupContext";

const INPUT = "w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors bg-white";

const WHO_DELIVERS_LABELS: Record<string, string> = {
  "our-trucks": "Our trucks",
  "third-party": "Third-party carrier",
  "customer-pickup": "Customer pickup",
};

/** Example distances used to show what the rules actually cost a buyer. */
const EXAMPLE_DISTANCES = [5, 15, 30];

/**
 * Delivery pricing — base fee, free miles, per-mile rate and who drives.
 * Backed by the shared setup store and rendered identically by Supplier
 * Setup → Delivery rules and Supplier Profile → Delivery Rules.
 */
export function SupplierDeliveryRules() {
  const { deliveryRules, updateDeliveryRules } = useSupplierSetup();
  const { baseFee, freeMiles, perMileRate, whoDelivers } = deliveryRules;

  const base = parseFloat(baseFee) || 0;
  const free = parseFloat(freeMiles) || 0;
  const perMile = parseFloat(perMileRate) || 0;

  const quoteFor = (miles: number) => base + Math.max(0, miles - free) * perMile;

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Base fee ($)
              </label>
              <input
                type="number"
                value={baseFee}
                onChange={e => updateDeliveryRules({ baseFee: e.target.value })}
                className={INPUT}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Free miles
              </label>
              <input
                type="number"
                value={freeMiles}
                onChange={e => updateDeliveryRules({ freeMiles: e.target.value })}
                className={INPUT}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Then $/mile
              </label>
              <input
                type="number"
                value={perMileRate}
                onChange={e => updateDeliveryRules({ perMileRate: e.target.value })}
                className={INPUT}
              />
            </div>
          </div>

          <div className="max-w-xs">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Who delivers
            </label>
            <select
              value={whoDelivers}
              onChange={e => updateDeliveryRules({ whoDelivers: e.target.value as typeof whoDelivers })}
              className={INPUT}
            >
              <option value="our-trucks">Our trucks</option>
              <option value="third-party">Third-party carrier</option>
              <option value="customer-pickup">Customer pickup</option>
            </select>
          </div>

          {/* What a buyer actually pays */}
          <div className="border border-slate-100 rounded-2xl overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <Info size={12} className="text-slate-400" />
              <span className="text-[11px] font-semibold text-slate-600">
                What a buyer is quoted
              </span>
            </div>
            <div className="divide-y divide-slate-50">
              {EXAMPLE_DISTANCES.map(miles => (
                <div key={miles} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-slate-600">
                    {miles}-mile delivery
                    {miles <= free && <span className="text-[10px] text-green-600 font-semibold ml-2">within free miles</span>}
                  </span>
                  <span className="text-sm font-bold text-slate-900">${quoteFor(miles).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live summary */}
        <div className="bg-slate-900 rounded-2xl p-5 text-white self-start">
          <div className="text-xs font-bold mb-3 flex items-center gap-2">
            <Truck size={12} /> Active delivery rules
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-white/60">Base fee</span>
              <span className="font-semibold">${base.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Free miles</span>
              <span className="font-semibold">{free}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Then per mile</span>
              <span className="font-semibold">${perMile.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-white/10">
              <span className="text-white/60">Delivered by</span>
              <span className="font-semibold">{WHO_DELIVERS_LABELS[whoDelivers]}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const DELIVERY_RULES_DESCRIPTION =
  "Your delivery pricing — a base fee, free miles, then a per-mile rate.";
