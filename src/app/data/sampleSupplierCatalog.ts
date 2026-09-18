import { MasterItem } from "./masterCatalog";
import { toCsv } from "../lib/csv";

/**
 * Builds a realistic supplier POS export from the master catalog — the messy
 * kind of file matching actually has to cope with: abbreviated descriptions,
 * reordered wording, missing species, different units, items that are not in
 * the master at all, mixed price ages, and a handful of unreadable rows.
 *
 * Deterministic, so the same catalog always produces the same sample.
 */

const HEADERS = [
  "item_no", "description", "dept", "size", "species", "grade",
  "uom", "unit_price", "price_date",
];

/** Small deterministic PRNG so the sample never shifts between runs. */
function makeRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const ABBREVIATIONS: [RegExp, string][] = [
  [/douglas fir/gi, "DF"],
  [/southern yellow pine/gi, "SYP"],
  [/western red cedar/gi, "WRC"],
  [/treated/gi, "TRTD"],
  [/pressure/gi, "PRES"],
  [/plywood/gi, "PLY"],
  [/sheathing/gi, "SHTG"],
  [/engineered/gi, "ENG"],
  [/exterior/gi, "EXT"],
  [/interior/gi, "INT"],
  [/galvanized/gi, "GALV"],
  [/composite/gi, "COMP"],
  [/prehung/gi, "PREHG"],
  [/insulation/gi, "INSUL"],
  [/hardware/gi, "HDW"],
  [/\bstandard\b/gi, "STD"],
  [/\bnominal\b/gi, "NOM"],
];

function abbreviate(name: string): string {
  let out = name;
  ABBREVIATIONS.forEach(([pattern, short]) => { out = out.replace(pattern, short); });
  return out.replace(/["']/g, "").toUpperCase();
}

/** Heavier mangling: abbreviate, drop punctuation, reorder to length-first. */
function mangle(name: string, random: () => number): string {
  const abbreviated = abbreviate(name).replace(/[()]/g, "");
  const parts = abbreviated.split(/\s+/).filter(Boolean);
  if (parts.length > 2 && random() > 0.5) {
    const last = parts.pop()!;
    return [last, ...parts].join(" ");
  }
  return parts.join(" ");
}

/** Items a yard stocks that the master catalog has never heard of. */
const NOT_IN_MASTER = [
  ["SHOP-RAG-50", "SHOP RAGS BULK 50LB BALE", "Supplies", "", "", "", "BALE", "42.00"],
  ["DEL-FUEL-SUR", "FUEL SURCHARGE - DELIVERY", "Services", "", "", "", "EA", "35.00"],
  ["RENT-BOOM-DAY", "BOOM TRUCK RENTAL PER DAY", "Services", "", "", "", "DAY", "650.00"],
  ["CUST-MILL-01", "CUSTOM MILLING SETUP FEE", "Services", "", "", "", "EA", "125.00"],
  ["PALLET-DEP", "PALLET DEPOSIT REFUNDABLE", "Supplies", "", "", "", "EA", "18.00"],
  ["SAFETY-VEST-L", "HI-VIS SAFETY VEST LARGE", "Supplies", "", "", "", "EA", "14.50"],
  ["COFFEE-SVC", "JOBSITE COFFEE SERVICE MONTHLY", "Services", "", "", "", "MO", "89.00"],
  ["SHRINKWRAP-18", "STRETCH WRAP 18IN X 1500FT", "Supplies", "", "", "", "RL", "31.75"],
  ["YARD-SIGN-4X8", "YARD ADVERTISING SIGN 4X8", "Supplies", "", "", "", "EA", "210.00"],
  ["DUNNAGE-MIX", "MIXED DUNNAGE LUMBER BUNDLE", "Supplies", "", "", "", "BDL", "64.00"],
];

/** Units a POS might use that disagree with the master's purchase unit. */
const ODD_UNITS = ["PC", "PCS", "BDL", "LOT", "CTN"];

function priceFor(item: MasterItem, random: () => number): string {
  const base = item.itemClass === "engineered_wood" ? 120
    : item.itemClass === "doors" ? 240
    : item.itemClass === "siding" ? 58
    : item.itemClass === "hardware" || item.itemClass === "fasteners" ? 22
    : 14;
  return (base * (0.6 + random() * 1.4)).toFixed(2);
}

function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function buildSampleSupplierCsv(master: MasterItem[]): string {
  const random = makeRandom(20260918);

  // Spread the sample across categories rather than taking the first N rows.
  const byClass = new Map<string, MasterItem[]>();
  master.forEach(item => {
    const list = byClass.get(item.itemClass) ?? [];
    list.push(item);
    byClass.set(item.itemClass, list);
  });

  const picked: MasterItem[] = [];
  const classes = [...byClass.keys()].sort();
  let cursor = 0;
  while (picked.length < 240 && cursor < 400) {
    classes.forEach(c => {
      const list = byClass.get(c)!;
      const item = list[(cursor * 7) % list.length];
      if (item && !picked.includes(item)) picked.push(item);
    });
    cursor++;
  }

  const rows: string[][] = [];

  picked.slice(0, 240).forEach((item, i) => {
    const bucket = i % 20;
    let description: string;
    let species = item.species;
    let size = item.nominalSize;
    let grade = item.grade;

    if (bucket < 9) {
      // Clean export — matches the master exactly.
      description = item.name;
    } else if (bucket < 14) {
      // Abbreviated but recognisable.
      description = abbreviate(item.name);
      if (random() > 0.6) species = "";
    } else if (bucket < 17) {
      // Heavily mangled and stripped of attributes.
      description = mangle(item.name, random);
      species = "";
      grade = "";
      if (random() > 0.5) size = "";
    } else {
      // Described as an equivalent rather than the exact item.
      description = `${abbreviate(item.name)} OR EQUAL`;
      grade = "";
    }

    const unit = bucket % 6 === 0
      ? ODD_UNITS[i % ODD_UNITS.length]
      : item.uomPurchase;

    // Mixed price ages: current, stale, and not supplied at all.
    const priceBucket = i % 5;
    const price = priceBucket === 4 ? "" : priceFor(item, random);
    const priceDate = priceBucket === 4 ? ""
      : priceBucket === 3 ? dateOffset(120 + (i % 200))
      : dateOffset(i % 25);

    rows.push([
      `ATS-${String(1000 + i)}`,
      description,
      item.itemClass.replace(/_/g, " "),
      size,
      species,
      grade,
      unit,
      price,
      priceDate,
    ]);
  });

  // Items the yard stocks that the master catalog does not list.
  NOT_IN_MASTER.forEach((row, i) => {
    rows.push([...row, dateOffset(i * 3)]);
  });

  // Rows that cannot be imported at all — these drive the exception report.
  rows.push(["ATS-2001", "", "lumber", "", "", "", "EA", "12.00", dateOffset(4)]);          // no description
  rows.push(["", "2X6 SYP #2 TREATED 12FT", "lumber", "2x6", "SYP", "#2", "EA", "18.40", dateOffset(6)]); // no SKU
  rows.push(["ATS-1000", "DUPLICATE OF FIRST LINE", "lumber", "", "", "", "EA", "9.00", dateOffset(2)]);  // duplicate SKU
  rows.push(["ATS-2003", "OSB SHEATHING 7/16 4X8", "panels", "4x8", "", "", "SHT", "CALL", dateOffset(3)]); // price not a number
  rows.push(["", "", "", "", "", "", "", "", ""]);                                           // empty row

  return toCsv(HEADERS, rows);
}
