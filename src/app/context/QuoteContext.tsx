import React, { createContext, useContext, useState, ReactNode, useMemo } from "react";
import type { SubmittedQuote } from "../data/priceData";
import { computeQuoteFromRFQ } from "../data/priceData";
import { mockRFQs } from "../data/mockData";

interface QuoteContextValue {
  quotes: Record<string, SubmittedQuote>;
  submitQuote: (quote: SubmittedQuote) => void;
  getQuote: (rfqId: string) => SubmittedQuote | null;
}

const QuoteContext = createContext<QuoteContextValue | null>(null);

export function QuoteProvider({ children }: { children: ReactNode }) {
  // Pre-populate rfq-001 so both sides see data immediately (simulates a quote already on file)
  const initialQuotes = useMemo<Record<string, SubmittedQuote>>(() => {
    const rfq001 = mockRFQs.find((r) => r.id === "rfq-001");
    if (!rfq001) return {};
    return { "rfq-001": computeQuoteFromRFQ(rfq001) };
  }, []);

  const [quotes, setQuotes] = useState<Record<string, SubmittedQuote>>(initialQuotes);

  const submitQuote = (quote: SubmittedQuote) => {
    setQuotes((prev) => ({ ...prev, [quote.rfqId]: quote }));
  };

  const getQuote = (rfqId: string): SubmittedQuote | null => quotes[rfqId] ?? null;

  return (
    <QuoteContext.Provider value={{ quotes, submitQuote, getQuote }}>
      {children}
    </QuoteContext.Provider>
  );
}

export function useQuoteContext() {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error("useQuoteContext must be used within <QuoteProvider>");
  return ctx;
}
