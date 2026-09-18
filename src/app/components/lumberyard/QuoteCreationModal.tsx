import React, { useState, useEffect, useMemo } from "react";
import { X, Plus, Trash2, DollarSign, Calendar, Package, AlertCircle, Check, ChevronDown, ChevronRight, Tag } from "lucide-react";
import type { RFQ } from "../../data/mockData";
import { mockCatalog } from "../../data/mockData";
import { useQuoteContext } from "../../context/QuoteContext";

interface QuoteItem {
  id: string;
  category: string;
  description: string;
  requestedQty: number;
  quotedQty: number;
  unit: string;
  unitPrice: number;
  total: number;
  inStock: boolean;
  notes?: string;
  catalogPrice?: number;
  catalogName?: string;
}

interface QuoteCreationModalProps {
  rfq: RFQ | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (quoteData: any) => void;
}

// ─── Catalog Price Matching ────────────────────────────────────────────────────

// Comprehensive price reference for all RFQ line items (market rates, Austin TX)
const PRICE_LOOKUP: Record<string, number> = {
  // Foundation
  "2×4×8 Douglas Fir Stud": 4.89,
  "2×4×10 Douglas Fir": 6.45,
  "4×12×12 Douglas Fir": 38.50,
  "2×6×12 Pressure Treated": 12.80,
  "4×4×8 PT Post": 11.20,
  "2×8×10 PT Sill Plate": 14.60,
  '1/2" Anchor Bolts': 0.85,
  "Simpson HDU2 Holdown": 28.40,
  'Sill Seal Foam 3.5"x50\'': 8.90,
  '1/2"x10"': 1.20,
  "Foundation Vent 16×8": 6.50,
  'Concrete Form Tube 8"x8\'': 12.40,
  "Rebar #4 Grade 60 20'": 18.75,
  "Rebar Tie Wire 16ga": 22.40,
  "Vapor Barrier 6mil 20×100'": 68.90,
  '3/4" Clean': 42.00,
  'Termite Shield 8"': 0.65,
  '4" Perf': 0.85,
  // Floor System
  "2×10×16 Floor Joist": 18.60,
  "2×10×14 Floor Joist": 16.40,
  "2×10×12 Rim Board": 14.20,
  '3/4" T&G Plywood Subfloor 4×8': 48.90,
  "3.5\"×11-7/8\" LVL Beam 24'": 338.00,
  "3.5\"×14\" LVL Beam 20'": 412.00,
  "TJI 360 11-7/8\" × 20'": 62.40,
  "Simpson IUS Joist Hanger 2×10": 1.85,
  "Simpson LUS Joist Hanger 2×10": 2.10,
  "Simpson FB Face Mount Hanger": 3.20,
  '1.5"×10d': 4.80,
  "Subfloor Adhesive PL400": 6.40,
  '2-1/8" Subfloor Screws': 18.60,
  "Rim Board Adhesive": 6.40,
  "Bridging Metal 2×10": 2.40,
  "Squeak Relief Screws": 0.08,
  '14" Web': 88.40,
  "LVL Header 1.75\"×11.25\"×16'": 186.00,
  "Beam Pocket Material": 8.40,
  "Floor Truss Connector Plates": 3.60,
  "Subfloor Shims Composite": 0.45,
  '2-7/8"': 28.40,
  // Walls Framing
  '2×4×8 Precut Stud 92-5/8"': 4.89,
  "2×6×8 Exterior Wall Stud": 7.20,
  "2×4×12 Top/Bottom Plate": 7.80,
  "2×6×12 Exterior Plate": 11.40,
  "2×8×12 Header Material": 16.80,
  "2×10×12 Header Material": 21.40,
  "2×12×12 Header Material": 26.80,
  "4×6×8 Post Header": 18.60,
  '7/16" OSB Wall Sheathing 4×8': 22.40,
  '1/2" ZIP System Sheathing 4×8': 38.60,
  '3.75"': 42.80,
  "Tyvek Housewrap 9'×150'": 128.40,
  '2.83"': 18.60,
  "Simpson H2.5A Hurricane Tie": 1.82,
  "Simpson A35 Angle Clip": 1.24,
  "Simpson LSSJ Strap Tie": 4.60,
  "16d Common Nails 50lb": 78.40,
  "8d Common Nails 50lb": 64.80,
  '1-1/4" Roofing Cap Nails': 42.60,
  "King Stud 2×6×10": 9.20,
  "Jack Stud 2×6×8": 7.60,
  "Cripple Stud 2×4 Assorted": 4.20,
  '2×4×14.5"': 1.80,
  "Corner Bracing Simpson": 8.40,
  "Wall Bracing T-Strap": 6.20,
  "Shear Panel Fasteners": 0.12,
  '3.5"': 22.40,
  // Stairs
  "2×12×16 Stair Stringer": 42.80,
  "1×12×8 Oak Tread": 38.60,
  "1×8×8 Oak Riser": 24.40,
  "4×4×42 Newel Post Oak": 68.40,
  "2×6×8 Landing Joist": 8.20,
  "3/4\" Plywood Landing": 48.90,
  "Stair Handrail Oak 8'": 84.60,
  '32" Oak': 12.40,
  "Stair Brackets L-Angle": 3.60,
  "Tread Nosing Oak 1-1/4\"": 6.80,
  "Stair Riser Clips": 0.85,
  "Construction Adhesive": 6.40,
  // Roof System
  "2×6×16 Rafter": 11.60,
  "2×8×18 Ridge Board": 18.40,
  "2×6×8 Collar Tie": 7.20,
  "2×4×12 Purlin": 7.80,
  "2×10×20 Hip Rafter": 28.40,
  "2×8×16 Valley Rafter": 16.40,
  "Roof Truss 24' Fink": 186.00,
  "Roof Truss 28' Scissor": 242.00,
  '7/16" OSB Roof Deck 4×8': 22.40,
  "1/2\" CDX Plywood Deck": 36.80,
  "Synthetic Underlayment 10sq": 68.40,
  "Ice & Water Shield 2sq": 84.60,
  "Ridge Vent Shingle-Over 20'": 42.80,
  "Drip Edge Aluminum 10'": 8.40,
  "Valley Flashing 10'": 12.60,
  "Step Flashing 8×8": 1.80,
  "Owens Corning Duration Shingles": 138.00,
  "Hip & Ridge Shingles": 48.60,
  "Starter Strip Shingles": 38.40,
  '1-1/4" Coil': 32.80,
  'Cap Nails Plastic 1"': 28.40,
  "Hurricane Clips H2.5": 1.62,
  "Truss Plates 20ga": 2.40,
  "Gable Vent 18×24 Louvered": 24.80,
  '3" Continuous': 1.40,
  "Roof Cement Plastic": 8.60,
  "Roof Sealant Polyurethane": 12.40,
  'Plumber Boot Flashing 3"': 18.60,
  "Chimney Cricket Flashing": 84.60,
  "Skylight Flashing Kit 2×4": 48.40,
  "Fascia Board 2×8×16 Cedar": 28.60,
  "Rake Board 1×6×12 Cedar": 14.40,
  "Lookout Blocking 2×4": 4.20,
  '2×6×22.5"': 2.80,
  "Structural Ridge Beam LVL": 284.00,
  "Rafter Ties Simpson RT2": 2.40,
  "Ridge Board Connector": 6.80,
  "Roof Deck Adhesive": 8.40,
  // Cornice & Exterior
  "1×12×16 Pine Fascia": 32.40,
  "1×8×12 Soffit Board": 18.60,
  'Vinyl Soffit Vented 12"': 48.40,
  '24"': 84.60,
  "J-Channel Vinyl White": 0.65,
  "F-Channel Vinyl": 0.55,
  "Outside Corner Post Vinyl": 6.40,
  "1×4×12 PVC": 12.80,
  "1×6×12 PVC": 18.40,
  "Frieze Board 1×8×16 Cedar": 24.60,
  "Water Table 1×10×12": 22.40,
  "Gable Trim 1×6×16": 16.80,
  '4-1/2" PVC': 3.60,
  "Soffit Nailer 2×2×8": 3.20,
  "Exterior Caulk OSI Quad": 8.40,
  "Trim Coil Nails Aluminum": 32.80,
  "PVC Trim Adhesive": 6.40,
  '5" Mesh': 2.80,
  // Miscellaneous
  'R-21 Batt Insulation 15"': 52.80,
  "R-38 Blown Insulation": 68.40,
  "Spray Foam Can 24oz": 12.40,
  "Construction Lumber Crayons": 8.40,
  "Lumber Tarp 20×30 Heavy": 42.80,
  "Utility Knife Blades 100pk": 6.40,
};

// Lookup by description — try exact match first, then keyword scan of the table
function lookupPrice(description: string): number | null {
  // 1. Exact match
  if (PRICE_LOOKUP[description] !== undefined) return PRICE_LOOKUP[description];

  // 2. Key substring match — find any key that appears inside the description or vice-versa
  const descLower = description.toLowerCase().replace(/×/g, "x");
  for (const [key, price] of Object.entries(PRICE_LOOKUP)) {
    const keyLower = key.toLowerCase().replace(/×/g, "x");
    if (descLower.includes(keyLower) || keyLower.includes(descLower)) {
      return price;
    }
  }
  return null;
}

function normalizeStr(str: string): string {
  return str
    .toLowerCase()
    .replace(/×/g, "x")
    .replace(/["""'']/g, "")
    .replace(/[^a-z0-9x\/\.\-\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(str: string): string[] {
  return normalizeStr(str)
    .split(/[\s\-\/,]+/)
    .filter((t) => t.length > 1);
}

function findCatalogMatch(description: string): { price: number; name: string } | null {
  const descTokens = tokenize(description);
  let bestProduct = null;
  let bestScore = 0;

  for (const product of mockCatalog) {
    const productNorm = normalizeStr(product.name);
    const productTokens = tokenize(product.name);

    let score = 0;
    for (const token of descTokens) {
      if (productTokens.includes(token) || productNorm.includes(token)) {
        score++;
      }
    }
    // Require at least 2 matching tokens and a better score to avoid false positives
    if (score >= 2 && score > bestScore) {
      bestScore = score;
      bestProduct = product;
    }
  }

  return bestProduct ? { price: bestProduct.price, name: bestProduct.name } : null;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function QuoteCreationModal({ rfq, isOpen, onClose, onSubmit }: QuoteCreationModalProps) {
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [deliveryFee, setDeliveryFee] = useState(150);
  const [validUntil, setValidUntil] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [notes, setNotes] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const { submitQuote } = useQuoteContext();

  // Initialize quote items from RFQ, auto-fill prices from catalog
  useEffect(() => {
    if (!rfq) return;

    const initialItems: QuoteItem[] = rfq.items.map((item, idx) => {
      const match = findCatalogMatch(item.description);
      // Fallback: use comprehensive price lookup table covering all 142 items
      const lookedUp = !match ? lookupPrice(item.description) : null;
      const unitPrice = match ? match.price : (lookedUp ?? 0);
      return {
        id: `item-${idx}`,
        category: item.category,
        description: item.description,
        requestedQty: item.quantity,
        quotedQty: item.quantity,
        unit: item.unit,
        unitPrice,
        total: unitPrice * item.quantity,
        inStock: true,
        catalogPrice: match?.price,
        catalogName: match?.name,
      };
    });
    setQuoteItems(initialItems);

    // Expand all categories by default
    const cats = new Set(rfq.items.map((i) => i.category));
    setExpandedCategories(cats);

    // Set default expiration date (14 days from now)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    setValidUntil(futureDate.toISOString().split("T")[0]);
  }, [rfq]);

  const updateItem = (id: string, field: keyof QuoteItem, value: any) => {
    setQuoteItems((items) =>
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === "quotedQty" || field === "unitPrice") {
            updated.total = updated.quotedQty * updated.unitPrice;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setQuoteItems((items) => items.filter((item) => item.id !== id));
  };

  const addCustomItem = () => {
    const newItem: QuoteItem = {
      id: `custom-${Date.now()}`,
      category: "Additional Item",
      description: "",
      requestedQty: 0,
      quotedQty: 1,
      unit: "EA",
      unitPrice: 0,
      total: 0,
      inStock: true,
    };
    setQuoteItems([...quoteItems, newItem]);
    setExpandedCategories((prev) => new Set([...prev, "Additional Item"]));
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const collapseAll = () => setExpandedCategories(new Set());
  const expandAll = () => setExpandedCategories(new Set(quoteItems.map((i) => i.category)));

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, QuoteItem[]> = {};
    for (const item of quoteItems) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    return groups;
  }, [quoteItems]);

  const categoryOrder = useMemo(() => {
    const seen = new Set<string>();
    const order: string[] = [];
    for (const item of quoteItems) {
      if (!seen.has(item.category)) {
        seen.add(item.category);
        order.push(item.category);
      }
    }
    return order;
  }, [quoteItems]);

  const subtotal = quoteItems.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal + deliveryFee;
  const catalogMatchCount = quoteItems.filter((i) => i.catalogPrice !== undefined).length;
  const zeroPriceCount = quoteItems.filter((i) => i.unitPrice === 0).length;

  // Valid as long as a date is set and there are items — warn about $0 rows but don't block
  const isValid = !!validUntil && quoteItems.length > 0;

  const handleSubmit = () => {
    if (!rfq) return;
    const quoteData = {
      rfqId: rfq.id,
      lumberyardName: "Austin Timber Supply",
      items: quoteItems,
      subtotal,
      deliveryFee,
      total,
      validUntil,
      paymentTerms,
      notes,
      submittedAt: new Date().toISOString(),
    };
    // Push to shared quote store so contractor side sees the same data
    submitQuote(quoteData as any);
    setShowSuccess(true);
    setTimeout(() => {
      onSubmit?.(quoteData);
      onClose();
    }, 1500);
  };

  if (!isOpen || !rfq) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Create Quote</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {rfq.contractorCompany} · {rfq.projectName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Success Overlay */}
        {showSuccess && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Quote Sent Successfully!</h3>
              <p className="text-sm text-slate-500">Contractor will be notified via email</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid lg:grid-cols-3 gap-6 p-6">
            {/* Left: RFQ Summary */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 sticky top-0">
                <h3 className="text-xs font-semibold text-slate-700 uppercase mb-3">Request Details</h3>

                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Contractor</div>
                    <div className="font-medium text-slate-900">{rfq.contractorName}</div>
                    <div className="text-slate-600 text-xs">{rfq.contractorEmail}</div>
                    <div className="text-slate-600 text-xs">{rfq.contractorPhone}</div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500 mb-1">Delivery Address</div>
                    <div className="text-slate-900">{rfq.address}</div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500 mb-1">Requested Delivery</div>
                    <div className="text-slate-900">
                      {new Date(rfq.deliveryDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500 mb-1">Project Type</div>
                    <div className="text-slate-900">{rfq.projectType}</div>
                  </div>

                  {rfq.notes && (
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Special Instructions</div>
                      <div className="text-slate-900 bg-blue-50 border border-blue-100 rounded-lg p-2 text-xs leading-relaxed">
                        {rfq.notes}
                      </div>
                    </div>
                  )}
                </div>

                {/* Catalog Match Summary */}
                {catalogMatchCount > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag size={12} className="text-green-600" />
                      <h3 className="text-xs font-semibold text-slate-700 uppercase">Catalog Auto-Fill</h3>
                    </div>
                    <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2 text-xs text-green-700">
                      <span className="font-semibold">{catalogMatchCount}</span> of{" "}
                      <span className="font-semibold">{quoteItems.length}</span> items priced from your catalog.
                      Review and adjust as needed.
                    </div>
                  </div>
                )}

                {/* Quote Summary */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <h3 className="text-xs font-semibold text-slate-700 uppercase mb-3">Quote Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-semibold text-slate-900">${subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Delivery</span>
                      <span className="font-semibold text-slate-900">${deliveryFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200">
                      <span className="font-semibold text-slate-900">Total</span>
                      <span className="text-lg font-bold text-green-700">${total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Quote Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Materials */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-slate-900">Materials & Pricing</h3>
                    <span className="text-xs text-slate-400">
                      {categoryOrder.length} categories · {quoteItems.length} items
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <button onClick={expandAll} className="hover:text-slate-600 transition-colors">Expand all</button>
                      <span>·</span>
                      <button onClick={collapseAll} className="hover:text-slate-600 transition-colors">Collapse all</button>
                    </div>
                    <button
                      onClick={addCustomItem}
                      className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium"
                    >
                      <Plus size={12} /> Add Item
                    </button>
                  </div>
                </div>

                {/* Category Accordions */}
                <div className="space-y-2">
                  {categoryOrder.map((category) => {
                    const items = groupedItems[category] || [];
                    const isExpanded = expandedCategories.has(category);
                    const categorySubtotal = items.reduce((s, i) => s + i.total, 0);
                    const catalogMatchedInCat = items.filter((i) => i.catalogPrice !== undefined).length;

                    return (
                      <div
                        key={category}
                        className="border border-slate-200 rounded-xl overflow-hidden transition-all"
                      >
                        {/* Accordion Header */}
                        <button
                          onClick={() => toggleCategory(category)}
                          className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                        >
                          <div className="flex-shrink-0 text-slate-400">
                            {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-800">{category}</span>
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-slate-200 text-slate-600">
                                {items.length} items
                              </span>
                              {catalogMatchedInCat > 0 && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                                  <Tag size={9} />
                                  {catalogMatchedInCat} catalog
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex-shrink-0 text-right">
                            {categorySubtotal > 0 ? (
                              <span className="text-sm font-bold text-slate-900">
                                ${categorySubtotal.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-xs text-amber-500 font-medium">Pricing needed</span>
                            )}
                          </div>
                        </button>

                        {/* Accordion Body */}
                        {isExpanded && (
                          <div className="divide-y divide-slate-100">
                            {items.map((item) => (
                              <div
                                key={item.id}
                                className="bg-white px-4 py-3 hover:bg-slate-50/50 transition-colors"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex-1 space-y-2.5">
                                    {/* Description */}
                                    <input
                                      type="text"
                                      value={item.description}
                                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                                      placeholder="Item description"
                                      className="w-full text-sm font-medium text-slate-900 border-0 border-b border-transparent hover:border-slate-200 focus:border-amber-500 focus:outline-none px-0 py-0.5"
                                    />

                                    {/* Quantity & Pricing Grid */}
                                    <div className="grid grid-cols-4 gap-3">
                                      <div>
                                        <label className="text-xs text-slate-500 block mb-1">Requested</label>
                                        <div className="text-sm font-medium text-slate-600">
                                          {item.requestedQty} {item.unit}
                                        </div>
                                      </div>

                                      <div>
                                        <label className="text-xs text-slate-500 block mb-1">Quoted Qty</label>
                                        <input
                                          type="number"
                                          value={item.quotedQty}
                                          onChange={(e) =>
                                            updateItem(item.id, "quotedQty", parseFloat(e.target.value) || 0)
                                          }
                                          className="w-full text-sm px-2 py-1 border border-slate-200 rounded-lg focus:border-amber-500 focus:outline-none"
                                        />
                                      </div>

                                      <div>
                                        <label className="text-xs text-slate-500 block mb-1">Unit Price ($)</label>
                                        <div className="relative">
                                          <input
                                            type="number"
                                            step="0.01"
                                            value={item.unitPrice || ""}
                                            onChange={(e) =>
                                              updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)
                                            }
                                            placeholder="0.00"
                                            className={`w-full text-sm px-2 py-1 border rounded-lg focus:outline-none transition-colors ${
                                              item.catalogPrice !== undefined
                                                ? "border-green-300 focus:border-green-500 bg-green-50/40"
                                                : "border-slate-200 focus:border-amber-500"
                                            }`}
                                          />
                                        </div>
                                        {item.catalogPrice !== undefined && (
                                          <div className="flex items-center gap-1 mt-1">
                                            <Tag size={9} className="text-green-600 flex-shrink-0" />
                                            <span className="text-xs text-green-600 truncate">
                                              Catalog: ${item.catalogPrice.toFixed(2)}
                                            </span>
                                            {item.unitPrice !== item.catalogPrice && (
                                              <button
                                                onClick={() => updateItem(item.id, "unitPrice", item.catalogPrice!)}
                                                className="text-xs text-green-700 underline hover:no-underline ml-auto flex-shrink-0"
                                                title="Reset to catalog price"
                                              >
                                                Reset
                                              </button>
                                            )}
                                          </div>
                                        )}
                                      </div>

                                      <div>
                                        <label className="text-xs text-slate-500 block mb-1">Total</label>
                                        <div className="text-sm font-bold text-slate-900 py-1">
                                          ${item.total.toLocaleString()}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Stock Status & Notes */}
                                    <div className="flex items-center gap-3">
                                      <label className="flex items-center gap-2 text-xs">
                                        <input
                                          type="checkbox"
                                          checked={item.inStock}
                                          onChange={(e) => updateItem(item.id, "inStock", e.target.checked)}
                                          className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                                        />
                                        <span className="text-slate-600">In Stock</span>
                                      </label>
                                      <input
                                        type="text"
                                        value={item.notes || ""}
                                        onChange={(e) => updateItem(item.id, "notes", e.target.value)}
                                        placeholder="Add notes (lead time, substitutions, etc.)"
                                        className="flex-1 text-xs px-2 py-1 border border-slate-200 rounded-lg focus:border-amber-500 focus:outline-none text-slate-600"
                                      />
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => removeItem(item.id)}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors flex-shrink-0"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Additional Charges */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Additional Charges</h3>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-slate-700 block mb-1">Delivery Fee</label>
                      <p className="text-xs text-slate-500">
                        Standard delivery to {rfq.address.split(",")[1]?.trim()}
                      </p>
                    </div>
                    <div className="w-32">
                      <div className="relative">
                        <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="number"
                          step="10"
                          value={deliveryFee}
                          onChange={(e) => setDeliveryFee(parseFloat(e.target.value) || 0)}
                          className="w-full text-sm pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Terms & Conditions</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Quote Valid Until</label>
                    <div className="relative">
                      <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="date"
                        value={validUntil}
                        onChange={(e) => setValidUntil(e.target.value)}
                        className="w-full text-sm pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Payment Terms</label>
                    <select
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:border-amber-500 focus:outline-none"
                    >
                      <option>Due on Delivery</option>
                      <option>Net 15</option>
                      <option>Net 30</option>
                      <option>Net 60</option>
                      <option>50% Deposit, 50% on Delivery</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any special terms, conditions, or important information for the contractor..."
                  rows={4}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              {zeroPriceCount > 0 && isValid && (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle size={14} />
                  <span>{zeroPriceCount} item{zeroPriceCount > 1 ? "s" : ""} still need pricing — you can send and update later</span>
                </div>
              )}
              {!isValid && (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle size={14} />
                  <span>Set a quote expiration date to send</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!isValid}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Send Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}