import React, { useMemo } from "react";
import { useNavigate } from "react-router";
import { BadgeCheck, CalendarClock, FileText, DollarSign } from "lucide-react";
import { useQuoteContext } from "../../context/QuoteContext";

const ACTIVE_RFQ_ID = "rfq-001";

interface QuoteBannerProps {
  /** When true, renders flush inside a parent card (no outer border/shadow/project header) */
  inline?: boolean;
}

export function QuoteBanner({ inline = false }: QuoteBannerProps) {
  const navigate = useNavigate();
  const { getQuote } = useQuoteContext();
  const receivedQuote = getQuote(ACTIVE_RFQ_ID);

  const quoteByCategory = useMemo(() => {
    if (!receivedQuote) return [];
    const groups: Record<string, { items: number; total: number }> = {};
    for (const item of receivedQuote.items) {
      if (!groups[item.category]) groups[item.category] = { items: 0, total: 0 };
      groups[item.category].items += 1;
      groups[item.category].total += item.total;
    }
    return Object.entries(groups).map(([category, data]) => ({ category, ...data }));
  }, [receivedQuote]);

  if (!receivedQuote) return null;

  const validUntilDisplay = new Date(receivedQuote.validUntil).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  const inner = (
    <>
      {/* 3-Step Progress */}
      <div className="flex items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-green-700">Request Sent</span>
        </div>
        <div className="flex-1 h-0.5 bg-green-400 mx-3 rounded-full" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 ring-4 ring-green-100">
            <BadgeCheck size={13} className="text-white" />
          </div>
          <span className="text-xs font-semibold text-green-700">Quote Received</span>
        </div>
        <div className="flex-1 h-0.5 bg-slate-200 mx-3 rounded-full" />
        <div className="flex items-center gap-2 opacity-50">
          <div className="w-6 h-6 rounded-full border-2 border-slate-300 bg-white flex items-center justify-center flex-shrink-0">
            <DollarSign size={11} className="text-slate-400" />
          </div>
          <span className="text-xs font-medium text-slate-500">Place Order</span>
        </div>
      </div>

      {/* Quote meta bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-2.5 border-b border-slate-100 bg-green-50/60 text-xs text-green-800">
        <span className="flex items-center gap-1 font-medium">
          <BadgeCheck size={12} /> From: {receivedQuote.lumberyardName}
        </span>
        <span className="text-green-300 hidden sm:inline">|</span>
        <span className="flex items-center gap-1">
          <CalendarClock size={12} /> Valid until {validUntilDisplay}
        </span>
        <span className="text-green-300 hidden sm:inline">|</span>
        <span className="flex items-center gap-1">
          <FileText size={12} /> {receivedQuote.paymentTerms}
        </span>
        <span className="text-green-300 hidden sm:inline">|</span>
        <span>{receivedQuote.items.length} items · {quoteByCategory.length} categories</span>
      </div>

      {/* Category breakdown + summary */}
      <div className="px-5 py-4">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Category rows */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-3 text-xs font-semibold text-slate-400 uppercase mb-2 pb-1 border-b border-slate-100">
              <span>Category</span>
              <span className="text-center">Items</span>
              <span className="text-right">Subtotal</span>
            </div>
            {quoteByCategory.map(row => (
              <div key={row.category} className="grid grid-cols-3 text-sm py-1.5 border-b border-slate-50 last:border-0">
                <span className="text-slate-700 font-medium truncate pr-2">{row.category}</span>
                <span className="text-center text-slate-500 text-xs">{row.items}</span>
                <span className="text-right font-semibold text-slate-900">
                  ${row.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            ))}
            <div className="grid grid-cols-3 text-sm py-1.5 mt-1 border-t border-slate-200">
              <span className="text-slate-500">Delivery</span>
              <span />
              <span className="text-right text-slate-900">${receivedQuote.deliveryFee.toFixed(2)}</span>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <div className="bg-slate-50 rounded-xl p-4 h-full flex flex-col justify-between">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Materials subtotal</span>
                  <span className="font-medium text-slate-800">
                    ${receivedQuote.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Delivery</span>
                  <span className="font-medium text-slate-800">${receivedQuote.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="text-xl font-bold text-green-700">
                    ${receivedQuote.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); navigate("/contractor/checkout"); }}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
                <DollarSign size={14} /> Place Order
              </button>
              <p className="text-xs text-slate-400 mt-2 text-center">
                Prices locked until {validUntilDisplay} · {receivedQuote.paymentTerms}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  if (inline) {
    return (
      <div className="border-t border-slate-100 overflow-hidden">
        {inner}
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md">
      {/* Project Header — only shown in standalone mode */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Active Project</p>
          <h2 className="text-base font-bold text-slate-900">2847 Oak Ridge Dr</h2>
          <p className="text-xs text-slate-500 mt-0.5">Single Family Residence · Austin, TX · 142 items</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-green-100 text-green-700 border border-green-200">
          <BadgeCheck size={13} /> Quote Received
        </span>
      </div>
      {inner}
    </div>
  );
}