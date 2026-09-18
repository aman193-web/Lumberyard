import { MasterItem, tokenize, SUBSTITUTABLE_POLICIES } from "../data/masterCatalog";

/**
 * Column mapping, matching and scoring for a supplier catalog import.
 * Deterministic and local — this stands in for the real matching service.
 */

// ─── Supplier side ────────────────────────────────────────────────────────────

/** The fields the importer needs out of whatever file the supplier hands us. */
export type SupplierField =
  | "sku" | "description" | "size" | "species" | "grade"
  | "unit" | "price" | "priceDate" | "category";

export const SUPPLIER_FIELDS: { id: SupplierField; label: string; required: boolean; hint: string }[] = [
  { id: "description", label: "Description",     required: true,  hint: "What the item is — used for matching" },
  { id: "sku",         label: "Supplier SKU",    required: true,  hint: "Your internal item number" },
  { id: "unit",        label: "Unit of measure", required: false, hint: "EA, LF, SHT, BX…" },
  { id: "price",       label: "Price",           required: false, hint: "Blank imports as needs-confirmation" },
  { id: "priceDate",   label: "Price effective", required: false, hint: "Drives price freshness" },
  { id: "size",        label: "Size",            required: false, hint: "Improves match confidence" },
  { id: "species",     label: "Species",         required: false, hint: "Improves match confidence" },
  { id: "grade",       label: "Grade",           required: false, hint: "Improves match confidence" },
  { id: "category",    label: "Category",        required: false, hint: "Used for filtering only" },
];

/** Header names we recognise without the supplier having to map anything. */
const HEADER_HINTS: Record<SupplierField, string[]> = {
  sku:         ["sku", "item", "item_no", "itemnumber", "item number", "product code", "code", "part", "vendor_sku", "variant_id"],
  description: ["description", "product_name", "name", "product", "item description", "desc", "vendor_sku_desc"],
  size:        ["size", "nominal_size_text", "nominal size", "dimension", "dimensions", "actual_size_text"],
  species:     ["species", "species_group", "material", "wood"],
  grade:       ["grade", "lumber_grade", "design_grade", "quality"],
  unit:        ["unit", "uom", "uom_purchase", "unit of measure", "unitofmeasure", "price_uom", "uom_takeoff"],
  price:       ["price", "unit price", "cost", "list price", "unit_price"],
  priceDate:   ["price_effective_date", "price_date", "price effective", "effective date", "price date", "effective", "as of", "date"],
  category:    ["category", "item_class", "dept", "class", "department", "family", "group"],
};

export function detectColumnMapping(headers: string[]): Record<SupplierField, string> {
  const mapping = {} as Record<SupplierField, string>;
  const normalized = headers.map(h => h.toLowerCase().trim());
  const taken = new Set<string>();

  (Object.keys(HEADER_HINTS) as SupplierField[]).forEach(field => {
    for (const hint of HEADER_HINTS[field]) {
      const idx = normalized.findIndex((h, i) => h === hint && !taken.has(headers[i]));
      if (idx !== -1) { mapping[field] = headers[idx]; taken.add(headers[idx]); return; }
    }
    for (const hint of HEADER_HINTS[field]) {
      const idx = normalized.findIndex((h, i) => h.includes(hint) && !taken.has(headers[i]));
      if (idx !== -1) { mapping[field] = headers[idx]; taken.add(headers[idx]); return; }
    }
    mapping[field] = "";
  });

  return mapping;
}

export type SupplierRow = {
  id: string;
  /** 1-based line number in the uploaded file, for the exception report. */
  line: number;
  sku: string;
  description: string;
  size: string;
  species: string;
  grade: string;
  unit: string;
  price: string;
  priceDate: string;
  category: string;
};

export type ImportException = {
  line: number;
  reason: string;
  detail: string;
  raw: string;
};

/** Split the parsed file into importable rows and an exception report. */
export function buildSupplierRows(
  headers: string[],
  rows: string[][],
  mapping: Record<SupplierField, string>,
): { rows: SupplierRow[]; exceptions: ImportException[] } {
  const index = (field: SupplierField) => headers.indexOf(mapping[field] ?? "");
  const idx = {
    sku: index("sku"), description: index("description"), size: index("size"),
    species: index("species"), grade: index("grade"), unit: index("unit"),
    price: index("price"), priceDate: index("priceDate"), category: index("category"),
  };

  const out: SupplierRow[] = [];
  const exceptions: ImportException[] = [];
  const seenSkus = new Map<string, number>();

  rows.forEach((row, i) => {
    const line = i + 2; // +1 for zero-index, +1 for the header line
    const get = (k: keyof typeof idx) => (idx[k] >= 0 ? (row[idx[k]] ?? "").trim() : "");

    const description = get("description");
    const sku = get("sku");
    const raw = row.slice(0, 6).join(", ");

    if (!description && !sku) {
      exceptions.push({ line, reason: "Empty row", detail: "No SKU and no description — nothing to import.", raw });
      return;
    }
    if (!description) {
      exceptions.push({ line, reason: "Missing description", detail: `SKU ${sku} has no description, so it cannot be matched.`, raw });
      return;
    }
    if (!sku) {
      exceptions.push({ line, reason: "Missing SKU", detail: `"${truncate(description, 48)}" has no supplier SKU.`, raw });
      return;
    }

    const priceText = get("price");
    if (priceText && !isNumeric(priceText)) {
      exceptions.push({ line, reason: "Invalid price", detail: `"${priceText}" is not a number.`, raw });
      return;
    }

    const previous = seenSkus.get(sku.toLowerCase());
    if (previous !== undefined) {
      exceptions.push({ line, reason: "Duplicate SKU", detail: `${sku} already imported on line ${previous}.`, raw });
      return;
    }
    seenSkus.set(sku.toLowerCase(), line);

    out.push({
      id: `s-${line}`,
      line,
      sku,
      description,
      size: get("size"),
      species: get("species"),
      grade: get("grade"),
      unit: get("unit"),
      price: priceText,
      priceDate: get("priceDate"),
      category: get("category"),
    });
  });

  return { rows: out, exceptions };
}

function isNumeric(value: string): boolean {
  return !Number.isNaN(parseFloat(value.replace(/[$,\s]/g, "")));
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

// ─── Matching ─────────────────────────────────────────────────────────────────

export type Confidence = "high" | "medium" | "low" | "none";

export type RowStatus =
  | "pending"      // awaiting a decision
  | "confirmed"    // supplier confirmed the match
  | "rejected"     // supplier rejected it; back in the queue as unmatched
  | "not_carried"  // supplier says they do not stock this — not sellable
  | "requested";   // asked Super Admin to add it to the master catalog

export type Freshness = "current" | "stale" | "needs_confirmation";

export type Candidate = {
  sku: string;
  score: number;
  reasons: string[];
};

export type MatchRow = {
  id: string;
  supplier: SupplierRow;
  /** Master SKU of the proposed or assigned match. */
  masterSku: string | null;
  confidence: Confidence;
  score: number;
  status: RowStatus;
  /** True when the pairing is a substitute rather than an exact equivalent. */
  isSubstitute: boolean;
  /** Substitutes under this policy cannot be confirmed without explicit approval. */
  approvalRequired: boolean;
  substituteApproved: boolean;
  unitMismatch: boolean;
  freshness: Freshness;
  priceConfirmed: boolean;
  reasons: string[];
  alternates: Candidate[];
  /** True once the supplier has changed the proposed match by hand. */
  manuallyAssigned: boolean;
};

const STALE_AFTER_DAYS = 30;

/** Token -> master item indices, skipping tokens too common to narrow anything. */
type MasterIndex = {
  postings: Map<string, number[]>;
  bySku: Map<string, MasterItem>;
  items: MasterItem[];
};

export function buildMasterIndex(items: MasterItem[]): MasterIndex {
  const postings = new Map<string, number[]>();
  items.forEach((item, i) => {
    new Set(item.tokens).forEach(token => {
      const list = postings.get(token);
      if (list) list.push(i);
      else postings.set(token, [i]);
    });
  });

  // A token present in more than a fifth of the catalog tells us nothing.
  const ceiling = Math.max(40, Math.floor(items.length * 0.2));
  postings.forEach((list, token) => { if (list.length > ceiling) postings.delete(token); });

  const bySku = new Map(items.map(item => [item.sku, item]));
  return { postings, bySku, items };
}

const MAX_CANDIDATES = 25;

function scoreAgainst(row: SupplierRow, rowTokens: Set<string>, item: MasterItem): Candidate {
  const reasons: string[] = [];
  let score = 0;

  // Token overlap (Dice coefficient) does most of the work.
  const itemTokens = new Set(item.tokens);
  let shared = 0;
  itemTokens.forEach(t => { if (rowTokens.has(t)) shared++; });
  const dice = (2 * shared) / (rowTokens.size + itemTokens.size || 1);
  score += dice * 0.62;
  if (shared > 0) {
    reasons.push(`${shared} of ${itemTokens.size} master terms matched`);
  }

  // A shared SKU is decisive.
  const supplierSku = row.sku.toLowerCase();
  if (supplierSku && (supplierSku === item.sku.toLowerCase() || supplierSku.startsWith(`${item.sku.toLowerCase()}-`))) {
    score += 0.34;
    reasons.push(`Supplier SKU matches master SKU ${item.sku}`);
  }

  // Declared attributes corroborate the text match.
  if (row.size && item.nominalSize && normalizeSize(row.size) === normalizeSize(item.nominalSize)) {
    score += 0.07; reasons.push(`Nominal size ${item.nominalSize} agrees`);
  }
  if (row.species && item.species && row.species.toLowerCase().replace(/[^a-z]/g, "") === item.species.toLowerCase().replace(/[^a-z]/g, "")) {
    score += 0.05; reasons.push(`Species ${item.species} agrees`);
  }
  if (row.grade && item.grade && row.grade.toLowerCase() === item.grade.toLowerCase()) {
    score += 0.04; reasons.push(`Grade ${item.grade} agrees`);
  }
  if (row.category && item.itemClass && rowTokens.has(item.itemClass.split("_")[0])) {
    score += 0.02;
  }

  // An exact description match removes all doubt.
  if (row.description.trim().toLowerCase() === item.name.trim().toLowerCase()) {
    score += 0.2; reasons.push("Description is identical to the master item");
  }

  return { sku: item.sku, score: Math.min(1, score), reasons };
}

function normalizeSize(value: string): string {
  return value.toLowerCase().replace(/[\s"']/g, "").replace(/×/g, "x");
}

export function matchRow(row: SupplierRow, index: MasterIndex): MatchRow {
  const rowTokens = new Set(tokenize([row.description, row.species, row.size, row.grade].join(" ")));

  // Gather candidates from the inverted index.
  const hits = new Map<number, number>();
  rowTokens.forEach(token => {
    const list = index.postings.get(token);
    if (!list) return;
    list.forEach(i => hits.set(i, (hits.get(i) ?? 0) + 1));
  });

  const candidates = [...hits.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_CANDIDATES)
    .map(([i]) => scoreAgainst(row, rowTokens, index.items[i]))
    .sort((a, b) => b.score - a.score);

  const best = candidates[0];
  const confidence = confidenceFor(best?.score ?? 0);
  const master = best ? index.bySku.get(best.sku) ?? null : null;

  const exactName = master
    ? row.description.trim().toLowerCase() === master.name.trim().toLowerCase()
    : false;
  const substitutable = master ? SUBSTITUTABLE_POLICIES.includes(master.substitutionPolicy) : false;
  const isSubstitute = !!master && !exactName && substitutable && confidence !== "none";

  return {
    id: row.id,
    supplier: row,
    masterSku: confidence === "none" ? null : master?.sku ?? null,
    confidence,
    score: best?.score ?? 0,
    status: "pending",
    isSubstitute,
    approvalRequired: isSubstitute,
    substituteApproved: false,
    unitMismatch: !!master && hasUnitMismatch(row.unit, master),
    freshness: freshnessFor(row),
    priceConfirmed: false,
    reasons: best?.reasons ?? [],
    alternates: candidates.slice(1, 4),
    manuallyAssigned: false,
  };
}

export function confidenceFor(score: number): Confidence {
  if (score >= 0.8) return "high";
  if (score >= 0.58) return "medium";
  if (score >= 0.38) return "low";
  return "none";
}

function hasUnitMismatch(unit: string, master: MasterItem): boolean {
  const u = unit.trim().toUpperCase();
  if (!u) return false;
  return u !== master.uomPurchase.toUpperCase() && u !== master.uomTakeoff.toUpperCase();
}

export function freshnessFor(row: SupplierRow): Freshness {
  const price = parseFloat((row.price || "").replace(/[$,\s]/g, ""));
  if (!row.price || Number.isNaN(price) || price <= 0) return "needs_confirmation";
  if (!row.priceDate) return "needs_confirmation";

  const date = new Date(row.priceDate);
  if (Number.isNaN(date.getTime())) return "needs_confirmation";

  const ageDays = (Date.now() - date.getTime()) / 86_400_000;
  return ageDays > STALE_AFTER_DAYS ? "stale" : "current";
}

/** Match every row, yielding progress so the UI can show a real import bar. */
export async function matchAll(
  rows: SupplierRow[],
  master: MasterItem[],
  onProgress?: (done: number, total: number) => void,
): Promise<MatchRow[]> {
  const index = buildMasterIndex(master);
  const out: MatchRow[] = [];
  const CHUNK = 150;

  for (let i = 0; i < rows.length; i += CHUNK) {
    for (const row of rows.slice(i, i + CHUNK)) out.push(matchRow(row, index));
    onProgress?.(Math.min(i + CHUNK, rows.length), rows.length);
    // Yield so the progress bar can paint.
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  return out;
}

// ─── Master catalog search ────────────────────────────────────────────────────

export type MasterSearchFilters = {
  query: string;
  itemClass: string;
  species: string;
};

export function searchMaster(
  master: MasterItem[],
  filters: MasterSearchFilters,
  limit = 40,
): MasterItem[] {
  const terms = tokenize(filters.query);
  const results: { item: MasterItem; score: number }[] = [];

  for (const item of master) {
    if (filters.itemClass && item.itemClass !== filters.itemClass) continue;
    if (filters.species && item.species !== filters.species) continue;

    if (terms.length === 0) {
      results.push({ item, score: 0 });
    } else {
      const tokens = new Set(item.tokens);
      let hits = 0;
      terms.forEach(t => {
        if (tokens.has(t)) hits += 1;
        else if (item.name.toLowerCase().includes(t)) hits += 0.6;
      });
      if (hits > 0) results.push({ item, score: hits / terms.length });
    }
    if (terms.length === 0 && results.length >= limit) break;
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => r.item);
}

// ─── Aggregates ───────────────────────────────────────────────────────────────

export const GO_LIVE_COVERAGE_FLOOR = 85;

export type CoverageStats = {
  total: number;
  confirmed: number;
  pending: number;
  needsReview: number;
  noMatch: number;
  substitutes: number;
  notCarried: number;
  requested: number;
  highConfidencePending: number;
  coverage: number;
  itemsToFloor: number;
  meetsFloor: boolean;
  staleOrUnconfirmedPrices: number;
};

export function computeCoverage(rows: MatchRow[]): CoverageStats {
  const total = rows.length;
  const confirmed = rows.filter(r => r.status === "confirmed").length;
  const notCarried = rows.filter(r => r.status === "not_carried").length;
  const requested = rows.filter(r => r.status === "requested").length;
  const open = rows.filter(r => r.status === "pending" || r.status === "rejected");

  const noMatch = open.filter(r => r.confidence === "none" || r.status === "rejected").length;
  const needsReview = open.filter(r => r.confidence === "medium" || r.confidence === "low").length;
  const substitutes = rows.filter(r => r.isSubstitute && r.status !== "confirmed").length;
  const highConfidencePending = rows.filter(
    r => r.status === "pending" && r.confidence === "high" && !r.approvalRequired,
  ).length;

  const coverage = total === 0 ? 0 : Math.round((confirmed / total) * 100);
  const needed = Math.ceil((GO_LIVE_COVERAGE_FLOOR / 100) * total);

  return {
    total,
    confirmed,
    pending: open.length,
    needsReview,
    noMatch,
    substitutes,
    notCarried,
    requested,
    highConfidencePending,
    coverage,
    itemsToFloor: Math.max(0, needed - confirmed),
    meetsFloor: coverage >= GO_LIVE_COVERAGE_FLOOR,
    staleOrUnconfirmedPrices: rows.filter(r => r.freshness !== "current" && !r.priceConfirmed).length,
  };
}
