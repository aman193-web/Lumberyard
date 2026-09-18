// ─── Mock Data for Lumberyard App ─────────────────────────────────────────────

export type ProjectStatus = "draft" | "in-progress" | "takeoff-ready" | "ordered" | "delivering" | "completed";
export type DeliveryPhase = "foundation" | "framing" | "exterior" | "interior";
export type DeliveryStatus = "scheduled" | "in-transit" | "delivered" | "delayed";
export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered";

export interface Project {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  type: string;
  status: ProjectStatus;
  jurisdiction: string;
  buildingCode: string;
  description: string;
  estimatedCompletion: string;
  createdAt: string;
  blueprintsUploaded: number;
  totalMaterials: number;
  totalCost: number;
  lumberyard?: string;
  thumbnail?: string;
}

export interface TakeoffItem {
  id: string;
  category: string;
  subcategory: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface Lumberyard {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  distance: number;
  rating: number;
  reviewCount: number;
  deliveryReliability: number;
  materialQuality: number;
  communicationRating: number;
  priceRange: "$" | "$$" | "$$$";
  deliveryAvailable: boolean;
  deliveryRadius: number;
  specialties: string[];
  certifications: string[];
  responseTime: string;
  minOrderValue: number;
  established: number;
}

export interface Delivery {
  id: string;
  projectId: string;
  projectName: string;
  phase: DeliveryPhase;
  status: DeliveryStatus;
  scheduledDate: string;
  timeSlot: string;
  lumberyard: string;
  items: number;
  totalWeight: string;
  address: string;
  driver?: string;
  trackingId?: string;
  notes?: string;
}

export interface CatalogProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  species?: string;
  dimensions?: string;
  unitOfMeasure: string;
  price: number;
  stock: number;
  minOrder: number;
  inStock: boolean;
  grade?: string;
}

export interface Order {
  id: string;
  projectName: string;
  contractorName: string;
  contractorPhone: string;
  items: number;
  totalValue: number;
  status: OrderStatus;
  phase: DeliveryPhase;
  deliveryDate: string;
  createdAt: string;
  address: string;
  notes?: string;
}

export interface CapacitySlot {
  date: string;
  slots: number;
  booked: number;
  blocked: boolean;
}

export interface TakeoffReview {
  id: string;
  projectId: string;
  projectName: string;
  contractorName: string;
  address: string;
  submittedAt: string;
  status: "pending" | "in-review" | "approved" | "revision-needed";
  priority: "low" | "medium" | "high";
  itemCount: number;
  estimatedValue: number;
  notes?: string;
}

export interface RFQ {
  id: string;
  projectName: string;
  contractorName: string;
  contractorCompany: string;
  contractorPhone: string;
  contractorEmail: string;
  address: string;
  projectType: string;
  deliveryDate: string;
  submittedAt: string;
  status: "new" | "quoted" | "accepted" | "declined" | "expired";
  priority: "low" | "medium" | "high" | "urgent";
  itemCount: number;
  estimatedValue?: number;
  notes?: string;
  items: {
    category: string;
    description: string;
    quantity: number;
    unit: string;
  }[];
}

// ─── Projects ──────────────────────────────────────────────────────────────────
export const mockProjects: Project[] = [
  {
    id: "proj-001",
    name: "2847 Oak Ridge Dr — Single Family Residence",
    address: "2847 Oak Ridge Dr",
    city: "Austin",
    state: "TX",
    zip: "78701",
    type: "Single Family Residence",
    status: "in-progress",
    jurisdiction: "City of Austin",
    buildingCode: "IBC 2021",
    description: "New construction 2,400 sqft single-family home with attached 2-car garage.",
    estimatedCompletion: "2025-08-15",
    createdAt: "2025-01-10",
    blueprintsUploaded: 6,
    totalMaterials: 142,
    totalCost: 48200,
    lumberyard: "Austin Timber Supply",
    thumbnail: "https://images.unsplash.com/photo-1763263385516-953ae09448f7?w=400&q=80",
  },
  {
    id: "proj-002",
    name: "531 Riverside Ave — Commercial Renovation",
    address: "531 Riverside Ave",
    city: "Austin",
    state: "TX",
    zip: "78704",
    type: "Commercial Renovation",
    status: "takeoff-ready",
    jurisdiction: "Travis County",
    buildingCode: "IBC 2021",
    description: "Interior renovation of 1,800 sqft retail space including structural modifications.",
    estimatedCompletion: "2025-05-30",
    createdAt: "2025-01-22",
    blueprintsUploaded: 4,
    totalMaterials: 89,
    totalCost: 31600,
    thumbnail: "https://images.unsplash.com/photo-1540731062915-dee7155e669f?w=400&q=80",
  },
  {
    id: "proj-003",
    name: "9102 Cedar Bluff Ct — ADU Addition",
    address: "9102 Cedar Bluff Ct",
    city: "Round Rock",
    state: "TX",
    zip: "78681",
    type: "ADU Addition",
    status: "ordered",
    jurisdiction: "City of Round Rock",
    buildingCode: "IRC 2021",
    description: "600 sqft detached accessory dwelling unit with full kitchen and bath.",
    estimatedCompletion: "2025-04-20",
    createdAt: "2025-01-05",
    blueprintsUploaded: 3,
    totalMaterials: 67,
    totalCost: 22800,
    lumberyard: "Central Texas Lumber Co",
    thumbnail: "https://images.unsplash.com/photo-1772442198624-4fc4d7281e89?w=400&q=80",
  },
  {
    id: "proj-004",
    name: "418 Willow Creek Ln — Deck & Pergola",
    address: "418 Willow Creek Ln",
    city: "Cedar Park",
    state: "TX",
    zip: "78613",
    type: "Outdoor Structure",
    status: "delivering",
    jurisdiction: "City of Cedar Park",
    buildingCode: "IRC 2021",
    description: "600 sqft composite deck with attached 400 sqft pergola structure.",
    estimatedCompletion: "2025-03-10",
    createdAt: "2024-12-28",
    blueprintsUploaded: 2,
    totalMaterials: 38,
    totalCost: 14500,
    lumberyard: "Hill Country Lumber",
    thumbnail: "https://images.unsplash.com/photo-1540731062915-dee7155e669f?w=400&q=80",
  },
  {
    id: "proj-005",
    name: "7731 Mesa Verde Dr — Roof Replacement",
    address: "7731 Mesa Verde Dr",
    city: "Pflugerville",
    state: "TX",
    zip: "78660",
    type: "Roof Replacement",
    status: "completed",
    jurisdiction: "City of Pflugerville",
    buildingCode: "IRC 2021",
    description: "Full roof replacement with new OSB decking, underlayment, and architectural shingles.",
    estimatedCompletion: "2025-02-15",
    createdAt: "2024-12-15",
    blueprintsUploaded: 2,
    totalMaterials: 24,
    totalCost: 8900,
    lumberyard: "Austin Timber Supply",
  },
];

// ─── Takeoff Items ─────────────────────────────────────────────────────────────
export const mockTakeoffItems: TakeoffItem[] = [
  // Framing Lumber
  { id: "t-001", category: "Framing Lumber", subcategory: "Wall Framing", description: "2x4x8 Douglas Fir Stud (Kiln-Dried)", quantity: 342, unit: "EA", unitPrice: 4.89, totalPrice: 1672.38 },
  { id: "t-002", category: "Framing Lumber", subcategory: "Wall Framing", description: "2x4x10 Douglas Fir", quantity: 48, unit: "EA", unitPrice: 6.45, totalPrice: 309.60 },
  { id: "t-003", category: "Framing Lumber", subcategory: "Header Material", description: "4x12x12 Douglas Fir", quantity: 12, unit: "EA", unitPrice: 42.80, totalPrice: 513.60 },
  { id: "t-004", category: "Framing Lumber", subcategory: "Plate Material", description: "2x4x16 Douglas Fir (PT)", quantity: 64, unit: "EA", unitPrice: 9.20, totalPrice: 588.80 },
  { id: "t-005", category: "Framing Lumber", subcategory: "Floor Joists", description: "2x10x16 Douglas Fir", quantity: 86, unit: "EA", unitPrice: 18.60, totalPrice: 1599.60 },
  { id: "t-006", category: "Framing Lumber", subcategory: "Rafters", description: "2x8x16 Douglas Fir", quantity: 72, unit: "EA", unitPrice: 14.30, totalPrice: 1029.60 },
  // Sheathing
  { id: "t-007", category: "Sheathing & Panels", subcategory: "Wall Sheathing", description: '7/16" OSB 4x8 Panel', quantity: 124, unit: "SHT", unitPrice: 22.40, totalPrice: 2777.60 },
  { id: "t-008", category: "Sheathing & Panels", subcategory: "Roof Decking", description: '7/16" OSB 4x8 Panel', quantity: 96, unit: "SHT", unitPrice: 22.40, totalPrice: 2150.40 },
  { id: "t-009", category: "Sheathing & Panels", subcategory: "Subfloor", description: '3/4" T&G Plywood 4x8', quantity: 68, unit: "SHT", unitPrice: 48.90, totalPrice: 3325.20 },
  // Engineered Wood
  { id: "t-010", category: "Engineered Wood", subcategory: "LVL Beams", description: "3-1/2\" x 11-7/8\" x 20' LVL Beam", quantity: 4, unit: "EA", unitPrice: 284.00, totalPrice: 1136.00 },
  { id: "t-011", category: "Engineered Wood", subcategory: "TJI Joists", description: "9-1/2\" TJI 360 Joist x 20'", quantity: 38, unit: "EA", unitPrice: 62.40, totalPrice: 2371.20 },
  // Exterior
  { id: "t-012", category: "Exterior", subcategory: "Siding", description: 'HardiePlank 7.25" Smooth Lap Siding', quantity: 28, unit: "SQ", unitPrice: 148.00, totalPrice: 4144.00 },
  { id: "t-013", category: "Exterior", subcategory: "Trim", description: "5/4x6x16 PVC Trim Board", quantity: 42, unit: "EA", unitPrice: 32.60, totalPrice: 1369.20 },
  // Roofing
  { id: "t-014", category: "Roofing", subcategory: "Underlayment", description: "Synthetic Roof Underlayment 10sq Roll", quantity: 8, unit: "RL", unitPrice: 89.00, totalPrice: 712.00 },
  { id: "t-015", category: "Roofing", subcategory: "Shingles", description: "Owens Corning Duration Architectural 30yr", quantity: 26, unit: "SQ", unitPrice: 138.00, totalPrice: 3588.00 },
  // Fasteners
  { id: "t-016", category: "Fasteners & Hardware", subcategory: "Nails", description: "16d Framing Nails 50lb Box", quantity: 8, unit: "BX", unitPrice: 78.40, totalPrice: 627.20 },
  { id: "t-017", category: "Fasteners & Hardware", subcategory: "Connectors", description: "Simpson Strong-Tie H2.5A Hurricane Ties", quantity: 144, unit: "EA", unitPrice: 1.82, totalPrice: 262.08 },
  // Insulation
  { id: "t-018", category: "Insulation", subcategory: "Batt Insulation", description: 'R-21 Kraft-Faced 6" Batt 15" x 93"', quantity: 32, unit: "BG", unitPrice: 52.80, totalPrice: 1689.60 },
  { id: "t-019", category: "Insulation", subcategory: "Attic Insulation", description: "R-38 Blown-In Fiberglass (bag)", quantity: 48, unit: "BG", unitPrice: 22.50, totalPrice: 1080.00 },
];

// ─── Lumberyards ──────────────────────────────────────────────────────────────
export const mockLumberyards: Lumberyard[] = [
  {
    id: "ly-001",
    name: "Austin Timber Supply",
    address: "4210 Industrial Blvd",
    city: "Austin",
    state: "TX",
    distance: 3.2,
    rating: 4.8,
    reviewCount: 247,
    deliveryReliability: 96,
    materialQuality: 94,
    communicationRating: 92,
    priceRange: "$$",
    deliveryAvailable: true,
    deliveryRadius: 50,
    specialties: ["Framing Lumber", "Engineered Wood", "Roofing"],
    certifications: ["FSC Certified", "SFI Member"],
    responseTime: "< 2 hours",
    minOrderValue: 500,
    established: 1987,
  },
  {
    id: "ly-002",
    name: "Central Texas Lumber Co",
    address: "8801 N Lamar Blvd",
    city: "Austin",
    state: "TX",
    distance: 5.8,
    rating: 4.6,
    reviewCount: 189,
    deliveryReliability: 91,
    materialQuality: 96,
    communicationRating: 88,
    priceRange: "$$$",
    deliveryAvailable: true,
    deliveryRadius: 75,
    specialties: ["Hardwood", "Decking", "Siding", "Trim"],
    certifications: ["FSC Certified"],
    responseTime: "< 4 hours",
    minOrderValue: 750,
    established: 1972,
  },
  {
    id: "ly-003",
    name: "Hill Country Lumber",
    address: "225 Ranch Road 12",
    city: "Wimberley",
    state: "TX",
    distance: 8.4,
    rating: 4.5,
    reviewCount: 124,
    deliveryReliability: 88,
    materialQuality: 92,
    communicationRating: 95,
    priceRange: "$",
    deliveryAvailable: true,
    deliveryRadius: 40,
    specialties: ["Framing Lumber", "Sheathing", "Fasteners"],
    certifications: ["SFI Member"],
    responseTime: "< 1 hour",
    minOrderValue: 250,
    established: 2003,
  },
  {
    id: "ly-004",
    name: "Builders Source Supply",
    address: "12500 W Highway 290",
    city: "Dripping Springs",
    state: "TX",
    distance: 12.1,
    rating: 4.3,
    reviewCount: 98,
    deliveryReliability: 85,
    materialQuality: 89,
    communicationRating: 87,
    priceRange: "$",
    deliveryAvailable: true,
    deliveryRadius: 35,
    specialties: ["Concrete Accessories", "Framing", "Insulation"],
    certifications: [],
    responseTime: "< 6 hours",
    minOrderValue: 300,
    established: 2015,
  },
  {
    id: "ly-005",
    name: "Texas Truss & Panel",
    address: "3300 Commerce Dr",
    city: "Georgetown",
    state: "TX",
    distance: 18.7,
    rating: 4.7,
    reviewCount: 312,
    deliveryReliability: 94,
    materialQuality: 98,
    communicationRating: 91,
    priceRange: "$$$",
    deliveryAvailable: true,
    deliveryRadius: 100,
    specialties: ["Roof Trusses", "Floor Trusses", "Engineered Wood", "LVL Beams"],
    certifications: ["FSC Certified", "SFI Member", "SBCA Member"],
    responseTime: "< 2 hours",
    minOrderValue: 1000,
    established: 1998,
  },
];

// ─── Deliveries ────────────────────────────────────────────────────────────────
export const mockDeliveries: Delivery[] = [
  {
    id: "del-001",
    projectId: "proj-001",
    projectName: "2847 Oak Ridge Dr",
    phase: "framing",
    status: "scheduled",
    scheduledDate: "2025-02-18",
    timeSlot: "7:00 AM – 10:00 AM",
    lumberyard: "Austin Timber Supply",
    items: 28,
    totalWeight: "8,400 lbs",
    address: "2847 Oak Ridge Dr, Austin, TX 78701",
    driver: "Marcus T.",
    trackingId: "ATS-2025-0218-001",
  },
  {
    id: "del-002",
    projectId: "proj-001",
    projectName: "2847 Oak Ridge Dr",
    phase: "exterior",
    status: "scheduled",
    scheduledDate: "2025-03-12",
    timeSlot: "8:00 AM – 12:00 PM",
    lumberyard: "Austin Timber Supply",
    items: 14,
    totalWeight: "3,200 lbs",
    address: "2847 Oak Ridge Dr, Austin, TX 78701",
  },
  {
    id: "del-003",
    projectId: "proj-003",
    projectName: "9102 Cedar Bluff Ct",
    phase: "foundation",
    status: "delivered",
    scheduledDate: "2025-01-28",
    timeSlot: "6:30 AM – 9:00 AM",
    lumberyard: "Central Texas Lumber Co",
    items: 8,
    totalWeight: "2,100 lbs",
    address: "9102 Cedar Bluff Ct, Round Rock, TX 78681",
    driver: "James K.",
    trackingId: "CTL-2025-0128-003",
  },
  {
    id: "del-004",
    projectId: "proj-004",
    projectName: "418 Willow Creek Ln",
    phase: "framing",
    status: "in-transit",
    scheduledDate: "2025-02-12",
    timeSlot: "7:00 AM – 11:00 AM",
    lumberyard: "Hill Country Lumber",
    items: 22,
    totalWeight: "5,800 lbs",
    address: "418 Willow Creek Ln, Cedar Park, TX 78613",
    driver: "Ray M.",
    trackingId: "HCL-2025-0212-004",
  },
];

// ─── Lumberyard Orders ─────────────────────────────────────────────────────────
export const mockOrders: Order[] = [
  {
    id: "ord-001",
    projectName: "2847 Oak Ridge Dr — SFR",
    contractorName: "Mike Torres Construction",
    contractorPhone: "(512) 555-0142",
    items: 28,
    totalValue: 18400,
    status: "confirmed",
    phase: "framing",
    deliveryDate: "2025-02-18",
    createdAt: "2025-02-10",
    address: "2847 Oak Ridge Dr, Austin TX 78701",
  },
  {
    id: "ord-002",
    projectName: "531 Riverside Ave — Commercial",
    contractorName: "Apex Build Group",
    contractorPhone: "(512) 555-0287",
    items: 14,
    totalValue: 9200,
    status: "processing",
    phase: "interior",
    deliveryDate: "2025-02-22",
    createdAt: "2025-02-12",
    address: "531 Riverside Ave, Austin TX 78704",
  },
  {
    id: "ord-003",
    projectName: "418 Willow Creek Ln — Deck",
    contractorName: "Precision Outdoor Structures",
    contractorPhone: "(512) 555-0391",
    items: 22,
    totalValue: 6800,
    status: "shipped",
    phase: "framing",
    deliveryDate: "2025-02-12",
    createdAt: "2025-02-08",
    address: "418 Willow Creek Ln, Cedar Park TX 78613",
    notes: "Gate code: #4521. Drive to rear of property.",
  },
  {
    id: "ord-004",
    projectName: "7731 Mesa Verde Dr — Roof",
    contractorName: "Summit Roofing LLC",
    contractorPhone: "(512) 555-0458",
    items: 8,
    totalValue: 4100,
    status: "delivered",
    phase: "exterior",
    deliveryDate: "2025-02-05",
    createdAt: "2025-01-30",
    address: "7731 Mesa Verde Dr, Pflugerville TX 78660",
  },
  {
    id: "ord-005",
    projectName: "9102 Cedar Bluff Ct — ADU",
    contractorName: "BuildRight Austin",
    contractorPhone: "(512) 555-0513",
    items: 36,
    totalValue: 22100,
    status: "pending",
    phase: "framing",
    deliveryDate: "2025-03-05",
    createdAt: "2025-02-14",
    address: "9102 Cedar Bluff Ct, Round Rock TX 78681",
  },
];

// ─── Product Catalog ───────────────────────────────────────────────────────────
export const mockCatalog: CatalogProduct[] = [
  { id: "p-001", sku: "LBR-2408-DF", name: "2x4x8 Douglas Fir Stud KD", category: "Framing Lumber", species: "Douglas Fir", dimensions: '1.5" x 3.5" x 96"', unitOfMeasure: "EA", price: 4.89, stock: 2840, minOrder: 50, inStock: true, grade: "#2 & Better" },
  { id: "p-002", sku: "LBR-2410-DF", name: "2x4x10 Douglas Fir KD", category: "Framing Lumber", species: "Douglas Fir", dimensions: '1.5" x 3.5" x 120"', unitOfMeasure: "EA", price: 6.45, stock: 1420, minOrder: 25, inStock: true, grade: "#2 & Better" },
  { id: "p-003", sku: "LBR-2416-DF", name: "2x4x16 Douglas Fir PT", category: "Framing Lumber", species: "Douglas Fir", dimensions: '1.5" x 3.5" x 192"', unitOfMeasure: "EA", price: 9.20, stock: 680, minOrder: 25, inStock: true, grade: "#2 PT" },
  { id: "p-004", sku: "LBR-2816-DF", name: "2x8x16 Douglas Fir", category: "Framing Lumber", species: "Douglas Fir", dimensions: '1.5" x 7.25" x 192"', unitOfMeasure: "EA", price: 14.30, stock: 520, minOrder: 10, inStock: true, grade: "#2 & Better" },
  { id: "p-005", sku: "LBR-2x10-16", name: "2x10x16 Douglas Fir", category: "Framing Lumber", species: "Douglas Fir", dimensions: '1.5" x 9.25" x 192"', unitOfMeasure: "EA", price: 18.60, stock: 340, minOrder: 10, inStock: true, grade: "#2 & Better" },
  { id: "p-006", sku: "SHT-OSB716-48", name: '7/16" OSB Sheathing 4x8', category: "Sheathing", dimensions: "4' x 8' x 7/16\"", unitOfMeasure: "SHT", price: 22.40, stock: 1840, minOrder: 50, inStock: true },
  { id: "p-007", sku: "SHT-PLY34-48", name: '3/4" T&G Plywood Subfloor', category: "Sheathing", dimensions: "4' x 8' x 3/4\"", unitOfMeasure: "SHT", price: 48.90, stock: 920, minOrder: 20, inStock: true },
  { id: "p-008", sku: "ENG-LVL-3512", name: "3.5\" x 11-7/8\" LVL Beam 20'", category: "Engineered Wood", dimensions: "3.5\" x 11-7/8\" x 240\"", unitOfMeasure: "EA", price: 284.00, stock: 42, minOrder: 1, inStock: true },
  { id: "p-009", sku: "ENG-TJI-360", name: "TJI 360 Floor Joist 9.5\" x 20'", category: "Engineered Wood", dimensions: "9.5\" x 240\"", unitOfMeasure: "EA", price: 62.40, stock: 186, minOrder: 5, inStock: true },
  { id: "p-010", sku: "INS-R21-15", name: 'R-21 Kraft Batt 15" x 93"', category: "Insulation", dimensions: '15" x 93"', unitOfMeasure: "BG", price: 52.80, stock: 280, minOrder: 5, inStock: true },
  { id: "p-011", sku: "HRD-16D-50", name: "16d Framing Nails 50lb Box", category: "Fasteners", unitOfMeasure: "BX", price: 78.40, stock: 120, minOrder: 1, inStock: true },
  { id: "p-012", sku: "HRD-H2A-100", name: "Simpson H2.5A Hurricane Tie", category: "Fasteners", unitOfMeasure: "BX (100ct)", price: 182.00, stock: 48, minOrder: 1, inStock: true },
  { id: "p-013", sku: "EXT-HLP-725", name: 'HardiePlank 7.25" Lap Siding', category: "Exterior", unitOfMeasure: "SQ", price: 148.00, stock: 0, minOrder: 2, inStock: false },
  { id: "p-014", sku: "ROOF-DUR-30", name: "Duration Architectural Shingle 30yr", category: "Roofing", unitOfMeasure: "SQ", price: 138.00, stock: 84, minOrder: 1, inStock: true },
];

// ─── Capacity Slots ────────────────────────────────────────────────────────────
export const mockCapacitySlots: CapacitySlot[] = [
  { date: "2025-02-17", slots: 4, booked: 4, blocked: false },
  { date: "2025-02-18", slots: 4, booked: 2, blocked: false },
  { date: "2025-02-19", slots: 4, booked: 1, blocked: false },
  { date: "2025-02-20", slots: 4, booked: 3, blocked: false },
  { date: "2025-02-21", slots: 4, booked: 0, blocked: false },
  { date: "2025-02-22", slots: 0, booked: 0, blocked: true },
  { date: "2025-02-23", slots: 0, booked: 0, blocked: true },
  { date: "2025-02-24", slots: 4, booked: 2, blocked: false },
  { date: "2025-02-25", slots: 4, booked: 4, blocked: false },
  { date: "2025-02-26", slots: 4, booked: 1, blocked: false },
  { date: "2025-02-27", slots: 4, booked: 0, blocked: false },
  { date: "2025-02-28", slots: 4, booked: 2, blocked: false },
];

// ─── Takeoff Reviews (Architect) ───────────────────────────────────────────────
export const mockTakeoffReviews: TakeoffReview[] = [
  {
    id: "rev-001",
    projectId: "proj-001",
    projectName: "2847 Oak Ridge Dr — SFR",
    contractorName: "Mike Torres Construction",
    address: "2847 Oak Ridge Dr, Austin, TX",
    submittedAt: "2025-02-10T09:30:00",
    status: "pending",
    priority: "high",
    itemCount: 142,
    estimatedValue: 48200,
  },
  {
    id: "rev-002",
    projectId: "proj-002",
    projectName: "531 Riverside Ave — Commercial",
    contractorName: "Apex Build Group",
    address: "531 Riverside Ave, Austin, TX",
    submittedAt: "2025-02-11T14:15:00",
    status: "in-review",
    priority: "medium",
    itemCount: 89,
    estimatedValue: 31600,
    notes: "Verify structural beam sizing per engineering specs. Check load calculations for floor 2.",
  },
  {
    id: "rev-003",
    projectId: "proj-003",
    projectName: "9102 Cedar Bluff Ct — ADU",
    contractorName: "BuildRight Austin",
    address: "9102 Cedar Bluff Ct, Round Rock, TX",
    submittedAt: "2025-02-08T11:00:00",
    status: "approved",
    priority: "low",
    itemCount: 67,
    estimatedValue: 22800,
    notes: "All items verified. LVL beam spec matches structural drawings.",
  },
  {
    id: "rev-004",
    projectId: "proj-004",
    projectName: "418 Willow Creek Ln — Deck",
    contractorName: "Precision Outdoor Structures",
    address: "418 Willow Creek Ln, Cedar Park, TX",
    submittedAt: "2025-02-13T16:45:00",
    status: "revision-needed",
    priority: "high",
    itemCount: 38,
    estimatedValue: 14500,
    notes: "Post base hardware does not meet ICC-ES code for frost depth in Travis County. Specify Simpson AB46Z or equivalent.",
  },
];

// ─── Analytics Data ────────────────────────────────────────────────────────────
export const spendingByMonth = [
  { month: "Aug", spend: 12400 },
  { month: "Sep", spend: 18900 },
  { month: "Oct", spend: 24100 },
  { month: "Nov", spend: 16800 },
  { month: "Dec", spend: 9200 },
  { month: "Jan", spend: 31400 },
  { month: "Feb", spend: 48200 },
];

export const categoryBreakdown = [
  { name: "Framing Lumber", value: 38, color: "#15803d" },
  { name: "Sheathing", value: 22, color: "#16a34a" },
  { name: "Engineered Wood", value: 18, color: "#22c55e" },
  { name: "Exterior", value: 12, color: "#86efac" },
  { name: "Roofing", value: 6, color: "#bbf7d0" },
  { name: "Other", value: 4, color: "#dcfce7" },
];

export const lumberyardRevenue = [
  { month: "Aug", revenue: 82400 },
  { month: "Sep", revenue: 94200 },
  { month: "Oct", revenue: 118600 },
  { month: "Nov", revenue: 103800 },
  { month: "Dec", revenue: 76200 },
  { month: "Jan", revenue: 129400 },
  { month: "Feb", revenue: 141800 },
];

export const deliveryPerformance = [
  { week: "W1", onTime: 94, delayed: 6 },
  { week: "W2", onTime: 97, delayed: 3 },
  { week: "W3", onTime: 91, delayed: 9 },
  { week: "W4", onTime: 96, delayed: 4 },
  { week: "W5", onTime: 98, delayed: 2 },
  { week: "W6", onTime: 95, delayed: 5 },
];

// ─── RFQs (Request for Quotation) ─────────────────────────────────────────────
export const mockRFQs: RFQ[] = [
  {
    id: "rfq-001",
    projectName: "2847 Oak Ridge Dr",
    contractorName: "David Martinez",
    contractorCompany: "Martinez Custom Homes",
    contractorPhone: "(512) 555-0892",
    contractorEmail: "david@martinezcustomhomes.com",
    address: "2847 Oak Ridge Dr, Austin, TX 78701",
    projectType: "Single Family Residence",
    deliveryDate: "2026-04-15",
    submittedAt: "2026-03-17T08:30:00",
    status: "new",
    priority: "urgent",
    itemCount: 142,
    notes: "Rush project — need quote within 24 hours. Foundation pour scheduled for April 18.",
    items: [
      // Foundation (18 items)
      { category: "Foundation", description: "2×4×8 Douglas Fir Stud", quantity: 342, unit: "EA" },
      { category: "Foundation", description: "2×4×10 Douglas Fir", quantity: 48, unit: "EA" },
      { category: "Foundation", description: "4×12×12 Douglas Fir", quantity: 12, unit: "EA" },
      { category: "Foundation", description: "2×6×12 Pressure Treated", quantity: 86, unit: "EA" },
      { category: "Foundation", description: "4×4×8 PT Post", quantity: 24, unit: "EA" },
      { category: "Foundation", description: "2×8×10 PT Sill Plate", quantity: 120, unit: "EA" },
      { category: "Foundation", description: "1/2\" Anchor Bolts", quantity: 200, unit: "EA" },
      { category: "Foundation", description: "Simpson HDU2 Holdown", quantity: 16, unit: "EA" },
      { category: "Foundation", description: "Sill Seal Foam 3.5\"x50'", quantity: 8, unit: "RL" },
      { category: "Foundation", description: "J-Bolt 1/2\"x10\"", quantity: 180, unit: "EA" },
      { category: "Foundation", description: "Foundation Vent 16×8", quantity: 12, unit: "EA" },
      { category: "Foundation", description: "Concrete Form Tube 8\"x8'", quantity: 18, unit: "EA" },
      { category: "Foundation", description: "Rebar #4 Grade 60 20'", quantity: 45, unit: "EA" },
      { category: "Foundation", description: "Rebar Tie Wire 16ga", quantity: 3, unit: "RL" },
      { category: "Foundation", description: "Vapor Barrier 6mil 20×100'", quantity: 4, unit: "RL" },
      { category: "Foundation", description: "Gravel Base 3/4\" Clean", quantity: 18, unit: "TON" },
      { category: "Foundation", description: "Termite Shield 8\"", quantity: 240, unit: "LF" },
      { category: "Foundation", description: "Foundation Drain 4\" Perf", quantity: 180, unit: "LF" },
      
      // Floor System (22 items)
      { category: "Floor System", description: "2×10×16 Floor Joist", quantity: 92, unit: "EA" },
      { category: "Floor System", description: "2×10×14 Floor Joist", quantity: 48, unit: "EA" },
      { category: "Floor System", description: "2×10×12 Rim Board", quantity: 36, unit: "EA" },
      { category: "Floor System", description: "3/4\" T&G Plywood Subfloor 4×8", quantity: 84, unit: "SHT" },
      { category: "Floor System", description: "3.5\"×11-7/8\" LVL Beam 24'", quantity: 6, unit: "EA" },
      { category: "Floor System", description: "3.5\"×14\" LVL Beam 20'", quantity: 4, unit: "EA" },
      { category: "Floor System", description: "TJI 360 11-7/8\" × 20'", quantity: 28, unit: "EA" },
      { category: "Floor System", description: "Simpson IUS Joist Hanger 2×10", quantity: 184, unit: "EA" },
      { category: "Floor System", description: "Simpson LUS Joist Hanger 2×10", quantity: 96, unit: "EA" },
      { category: "Floor System", description: "Simpson FB Face Mount Hanger", quantity: 48, unit: "EA" },
      { category: "Floor System", description: "Joist Hanger Nails 1.5\"×10d", quantity: 5, unit: "LB" },
      { category: "Floor System", description: "Subfloor Adhesive PL400", quantity: 24, unit: "TUBE" },
      { category: "Floor System", description: "2-1/8\" Subfloor Screws", quantity: 8, unit: "LB" },
      { category: "Floor System", description: "Rim Board Adhesive", quantity: 12, unit: "TUBE" },
      { category: "Floor System", description: "Bridging Metal 2×10", quantity: 120, unit: "EA" },
      { category: "Floor System", description: "Squeak Relief Screws", quantity: 500, unit: "EA" },
      { category: "Floor System", description: "Engineered I-Joist 14\" Web", quantity: 16, unit: "EA" },
      { category: "Floor System", description: "LVL Header 1.75\"×11.25\"×16'", quantity: 8, unit: "EA" },
      { category: "Floor System", description: "Beam Pocket Material", quantity: 24, unit: "EA" },
      { category: "Floor System", description: "Floor Truss Connector Plates", quantity: 36, unit: "EA" },
      { category: "Floor System", description: "Subfloor Shims Composite", quantity: 200, unit: "EA" },
      { category: "Floor System", description: "Floor Joist Tape 2-7/8\"", quantity: 6, unit: "RL" },
      
      // Walls Framing (28 items)
      { category: "Walls Framing", description: "2×4×8 Precut Stud 92-5/8\"", quantity: 486, unit: "EA" },
      { category: "Walls Framing", description: "2×6×8 Exterior Wall Stud", quantity: 124, unit: "EA" },
      { category: "Walls Framing", description: "2×4×12 Top/Bottom Plate", quantity: 96, unit: "EA" },
      { category: "Walls Framing", description: "2×6×12 Exterior Plate", quantity: 72, unit: "EA" },
      { category: "Walls Framing", description: "2×8×12 Header Material", quantity: 36, unit: "EA" },
      { category: "Walls Framing", description: "2×10×12 Header Material", quantity: 28, unit: "EA" },
      { category: "Walls Framing", description: "2×12×12 Header Material", quantity: 16, unit: "EA" },
      { category: "Walls Framing", description: "4×6×8 Post Header", quantity: 8, unit: "EA" },
      { category: "Walls Framing", description: "7/16\" OSB Wall Sheathing 4×8", quantity: 148, unit: "SHT" },
      { category: "Walls Framing", description: "1/2\" ZIP System Sheathing 4×8", quantity: 64, unit: "SHT" },
      { category: "Walls Framing", description: "ZIP System Tape 3.75\"", quantity: 12, unit: "RL" },
      { category: "Walls Framing", description: "Tyvek Housewrap 9'×150'", quantity: 4, unit: "RL" },
      { category: "Walls Framing", description: "Housewrap Tape 2.83\"", quantity: 6, unit: "RL" },
      { category: "Walls Framing", description: "Simpson H2.5A Hurricane Tie", quantity: 486, unit: "EA" },
      { category: "Walls Framing", description: "Simpson A35 Angle Clip", quantity: 240, unit: "EA" },
      { category: "Walls Framing", description: "Simpson HDU2 Holdown", quantity: 32, unit: "EA" },
      { category: "Walls Framing", description: "Simpson LSSJ Strap Tie", quantity: 48, unit: "EA" },
      { category: "Walls Framing", description: "16d Common Nails 50lb", quantity: 8, unit: "BX" },
      { category: "Walls Framing", description: "8d Common Nails 50lb", quantity: 6, unit: "BX" },
      { category: "Walls Framing", description: "1-1/4\" Roofing Cap Nails", quantity: 4, unit: "BX" },
      { category: "Walls Framing", description: "King Stud 2×6×10", quantity: 24, unit: "EA" },
      { category: "Walls Framing", description: "Jack Stud 2×6×8", quantity: 32, unit: "EA" },
      { category: "Walls Framing", description: "Cripple Stud 2×4 Assorted", quantity: 120, unit: "EA" },
      { category: "Walls Framing", description: "Fire Blocking 2×4×14.5\"", quantity: 200, unit: "EA" },
      { category: "Walls Framing", description: "Corner Bracing Simpson", quantity: 64, unit: "EA" },
      { category: "Walls Framing", description: "Wall Bracing T-Strap", quantity: 48, unit: "EA" },
      { category: "Walls Framing", description: "Shear Panel Fasteners", quantity: 12000, unit: "EA" },
      { category: "Walls Framing", description: "Bottom Plate Gasket 3.5\"", quantity: 8, unit: "RL" },
      
      // Stairs (12 items)
      { category: "Stairs", description: "2×12×16 Stair Stringer", quantity: 6, unit: "EA" },
      { category: "Stairs", description: "1×12×8 Oak Tread", quantity: 14, unit: "EA" },
      { category: "Stairs", description: "1×8×8 Oak Riser", quantity: 13, unit: "EA" },
      { category: "Stairs", description: "4×4×42 Newel Post Oak", quantity: 2, unit: "EA" },
      { category: "Stairs", description: "2×6×8 Landing Joist", quantity: 8, unit: "EA" },
      { category: "Stairs", description: "3/4\" Plywood Landing", quantity: 4, unit: "SHT" },
      { category: "Stairs", description: "Stair Handrail Oak 8'", quantity: 2, unit: "EA" },
      { category: "Stairs", description: "Stair Balusters 32\" Oak", quantity: 24, unit: "EA" },
      { category: "Stairs", description: "Stair Brackets L-Angle", quantity: 12, unit: "EA" },
      { category: "Stairs", description: "Tread Nosing Oak 1-1/4\"", quantity: 42, unit: "LF" },
      { category: "Stairs", description: "Stair Riser Clips", quantity: 52, unit: "EA" },
      { category: "Stairs", description: "Construction Adhesive", quantity: 8, unit: "TUBE" },
      
      // Roof System (38 items)
      { category: "Roof System", description: "2×6×16 Rafter", quantity: 124, unit: "EA" },
      { category: "Roof System", description: "2×8×18 Ridge Board", quantity: 8, unit: "EA" },
      { category: "Roof System", description: "2×6×8 Collar Tie", quantity: 48, unit: "EA" },
      { category: "Roof System", description: "2×4×12 Purlin", quantity: 72, unit: "EA" },
      { category: "Roof System", description: "2×10×20 Hip Rafter", quantity: 6, unit: "EA" },
      { category: "Roof System", description: "2×8×16 Valley Rafter", quantity: 8, unit: "EA" },
      { category: "Roof System", description: "Roof Truss 24' Fink", quantity: 32, unit: "EA" },
      { category: "Roof System", description: "Roof Truss 28' Scissor", quantity: 16, unit: "EA" },
      { category: "Roof System", description: "7/16\" OSB Roof Deck 4×8", quantity: 96, unit: "SHT" },
      { category: "Roof System", description: "1/2\" CDX Plywood Deck", quantity: 42, unit: "SHT" },
      { category: "Roof System", description: "Synthetic Underlayment 10sq", quantity: 8, unit: "RL" },
      { category: "Roof System", description: "Ice & Water Shield 2sq", quantity: 12, unit: "RL" },
      { category: "Roof System", description: "Ridge Vent Shingle-Over 20'", quantity: 6, unit: "EA" },
      { category: "Roof System", description: "Drip Edge Aluminum 10'", quantity: 48, unit: "EA" },
      { category: "Roof System", description: "Valley Flashing 10'", quantity: 16, unit: "EA" },
      { category: "Roof System", description: "Step Flashing 8×8", quantity: 84, unit: "EA" },
      { category: "Roof System", description: "Owens Corning Duration Shingles", quantity: 26, unit: "SQ" },
      { category: "Roof System", description: "Hip & Ridge Shingles", quantity: 8, unit: "BDL" },
      { category: "Roof System", description: "Starter Strip Shingles", quantity: 6, unit: "BDL" },
      { category: "Roof System", description: "Roofing Nails 1-1/4\" Coil", quantity: 24, unit: "BX" },
      { category: "Roof System", description: "Cap Nails Plastic 1\"", quantity: 8, unit: "BX" },
      { category: "Roof System", description: "Hurricane Clips H2.5", quantity: 156, unit: "EA" },
      { category: "Roof System", description: "Truss Plates 20ga", quantity: 128, unit: "EA" },
      { category: "Roof System", description: "Gable Vent 18×24 Louvered", quantity: 4, unit: "EA" },
      { category: "Roof System", description: "Soffit Vent Continuous 3\"", quantity: 180, unit: "LF" },
      { category: "Roof System", description: "Roof Cement Plastic", quantity: 12, unit: "TUB" },
      { category: "Roof System", description: "Roof Sealant Polyurethane", quantity: 8, unit: "TUBE" },
      { category: "Roof System", description: "Plumber Boot Flashing 3\"", quantity: 6, unit: "EA" },
      { category: "Roof System", description: "Chimney Cricket Flashing", quantity: 2, unit: "EA" },
      { category: "Roof System", description: "Skylight Flashing Kit 2×4", quantity: 4, unit: "EA" },
      { category: "Roof System", description: "Fascia Board 2×8×16 Cedar", quantity: 24, unit: "EA" },
      { category: "Roof System", description: "Rake Board 1×6×12 Cedar", quantity: 16, unit: "EA" },
      { category: "Roof System", description: "Lookout Blocking 2×4", quantity: 96, unit: "EA" },
      { category: "Roof System", description: "Bird Blocking 2×6×22.5\"", quantity: 62, unit: "EA" },
      { category: "Roof System", description: "Structural Ridge Beam LVL", quantity: 4, unit: "EA" },
      { category: "Roof System", description: "Rafter Ties Simpson RT2", quantity: 124, unit: "EA" },
      { category: "Roof System", description: "Ridge Board Connector", quantity: 8, unit: "EA" },
      { category: "Roof System", description: "Roof Deck Adhesive", quantity: 16, unit: "TUBE" },
      
      // Cornice & Exterior (18 items)
      { category: "Cornice & Exterior", description: "1×12×16 Pine Fascia", quantity: 28, unit: "EA" },
      { category: "Cornice & Exterior", description: "1×8×12 Soffit Board", quantity: 48, unit: "EA" },
      { category: "Cornice & Exterior", description: "Vinyl Soffit Vented 12\"", quantity: 32, unit: "SQ" },
      { category: "Cornice & Exterior", description: "Aluminum Fascia Coil 24\"", quantity: 4, unit: "RL" },
      { category: "Cornice & Exterior", description: "J-Channel Vinyl White", quantity: 240, unit: "LF" },
      { category: "Cornice & Exterior", description: "F-Channel Vinyl", quantity: 180, unit: "LF" },
      { category: "Cornice & Exterior", description: "Outside Corner Post Vinyl", quantity: 16, unit: "EA" },
      { category: "Cornice & Exterior", description: "Window Trim 1×4×12 PVC", quantity: 48, unit: "EA" },
      { category: "Cornice & Exterior", description: "Door Trim 1×6×12 PVC", quantity: 24, unit: "EA" },
      { category: "Cornice & Exterior", description: "Frieze Board 1×8×16 Cedar", quantity: 18, unit: "EA" },
      { category: "Cornice & Exterior", description: "Water Table 1×10×12", quantity: 24, unit: "EA" },
      { category: "Cornice & Exterior", description: "Gable Trim 1×6×16", quantity: 12, unit: "EA" },
      { category: "Cornice & Exterior", description: "Crown Molding 4-1/2\" PVC", quantity: 160, unit: "LF" },
      { category: "Cornice & Exterior", description: "Soffit Nailer 2×2×8", quantity: 64, unit: "EA" },
      { category: "Cornice & Exterior", description: "Exterior Caulk OSI Quad", quantity: 24, unit: "TUBE" },
      { category: "Cornice & Exterior", description: "Trim Coil Nails Aluminum", quantity: 4, unit: "BX" },
      { category: "Cornice & Exterior", description: "PVC Trim Adhesive", quantity: 12, unit: "TUBE" },
      { category: "Cornice & Exterior", description: "Gutter Guards 5\" Mesh", quantity: 180, unit: "LF" },
      
      // Miscellaneous (6 items)
      { category: "Miscellaneous", description: "R-21 Batt Insulation 15\"", quantity: 68, unit: "BG" },
      { category: "Miscellaneous", description: "R-38 Blown Insulation", quantity: 48, unit: "BG" },
      { category: "Miscellaneous", description: "Spray Foam Can 24oz", quantity: 12, unit: "EA" },
      { category: "Miscellaneous", description: "Construction Lumber Crayons", quantity: 6, unit: "BX" },
      { category: "Miscellaneous", description: "Lumber Tarp 20×30 Heavy", quantity: 4, unit: "EA" },
      { category: "Miscellaneous", description: "Utility Knife Blades 100pk", quantity: 3, unit: "PK" },
    ],
  },
  {
    id: "rfq-002",
    projectName: "8821 Commerce Park Dr — Commercial Build-Out",
    contractorName: "Jessica Taylor",
    contractorCompany: "Taylor Commercial Construction",
    contractorPhone: "(512) 555-0743",
    contractorEmail: "jtaylor@taylorcommercial.com",
    address: "8821 Commerce Park Dr, Round Rock, TX 78681",
    projectType: "Commercial New Construction",
    deliveryDate: "2026-04-28",
    submittedAt: "2026-03-16T14:20:00",
    status: "new",
    priority: "high",
    itemCount: 124,
    estimatedValue: 62400,
    notes: "Multi-phase project. Looking for long-term supplier partnership. First delivery mid-April, second delivery early May.",
    items: [
      { category: "Framing Lumber", description: "2x4x10 Metal Studs", quantity: 340, unit: "EA" },
      { category: "Sheathing", description: "5/8\" Type X Drywall", quantity: 280, unit: "SHT" },
      { category: "Insulation", description: "R-19 Batt Insulation", quantity: 68, unit: "BG" },
      { category: "Exterior", description: "ACM Panels 4x8", quantity: 42, unit: "SHT" },
    ],
  },
  {
    id: "rfq-003",
    projectName: "3314 River Oaks Blvd — Deck Addition",
    contractorName: "Robert Chen",
    contractorCompany: "Outdoor Living Pros",
    contractorPhone: "(512) 555-0621",
    contractorEmail: "rob@outdoorlivingpros.com",
    address: "3314 River Oaks Blvd, Austin, TX 78704",
    projectType: "Deck / Pergola",
    deliveryDate: "2026-03-28",
    submittedAt: "2026-03-15T11:45:00",
    status: "quoted",
    priority: "medium",
    itemCount: 32,
    estimatedValue: 8900,
    notes: "Customer prefers composite decking. Need pricing for both Trex and TimberTech options.",
    items: [
      { category: "Decking", description: "Trex Composite Decking 5/4x6x20", quantity: 120, unit: "EA" },
      { category: "Framing Lumber", description: "2x8x16 PT Douglas Fir Joists", quantity: 28, unit: "EA" },
      { category: "Fasteners", description: "Deck screws & hidden fasteners", quantity: 4, unit: "BX" },
    ],
  },
  {
    id: "rfq-004",
    projectName: "7456 Sunset Valley Rd — Kitchen Remodel",
    contractorName: "Amanda Brooks",
    contractorCompany: "Brooks Remodeling",
    contractorPhone: "(512) 555-0534",
    contractorEmail: "amanda@brooksremodeling.com",
    address: "7456 Sunset Valley Rd, Austin, TX 78745",
    projectType: "Interior Renovation",
    deliveryDate: "2026-04-05",
    submittedAt: "2026-03-14T09:15:00",
    status: "quoted",
    priority: "low",
    itemCount: 18,
    estimatedValue: 3200,
    items: [
      { category: "Framing Lumber", description: "2x4x8 Studs for wall removal", quantity: 24, unit: "EA" },
      { category: "Sheathing", description: "1/2\" Drywall 4x8", quantity: 32, unit: "SHT" },
      { category: "Insulation", description: "R-13 Sound Batt", quantity: 12, unit: "BG" },
    ],
  },
  {
    id: "rfq-005",
    projectName: "5602 Hill Country Ln — Garage Addition",
    contractorName: "Carlos Rodriguez",
    contractorCompany: "Rodriguez Builders",
    contractorPhone: "(512) 555-0418",
    contractorEmail: "carlos@rodriguezbuilders.com",
    address: "5602 Hill Country Ln, Dripping Springs, TX 78620",
    projectType: "Garage / Carport",
    deliveryDate: "2026-04-22",
    submittedAt: "2026-03-12T16:00:00",
    status: "accepted",
    priority: "medium",
    itemCount: 56,
    estimatedValue: 14200,
    notes: "Quote accepted. Ready to place order. Please confirm delivery date availability.",
    items: [
      { category: "Framing Lumber", description: "2x4x8 Studs", quantity: 180, unit: "EA" },
      { category: "Framing Lumber", description: "2x6x12 Rafters", quantity: 48, unit: "EA" },
      { category: "Sheathing", description: "7/16\" OSB Roof Deck", quantity: 64, unit: "SHT" },
      { category: "Roofing", description: "30-year Architectural Shingles", quantity: 12, unit: "SQ" },
    ],
  },
  {
    id: "rfq-006",
    projectName: "9940 Lakeway Blvd — ADU Construction",
    contractorName: "Sarah Johnson",
    contractorCompany: "Modern ADU Solutions",
    contractorPhone: "(512) 555-0892",
    contractorEmail: "sarah@modernadusolutions.com",
    address: "9940 Lakeway Blvd, Lakeway, TX 78734",
    projectType: "ADU / Guest House",
    deliveryDate: "2026-05-10",
    submittedAt: "2026-03-11T13:30:00",
    status: "declined",
    priority: "low",
    itemCount: 72,
    notes: "Outside delivery radius. Declined.",
    items: [
      { category: "Framing Lumber", description: "2x4x8 Studs", quantity: 240, unit: "EA" },
      { category: "Sheathing", description: "OSB Wall Sheathing", quantity: 96, unit: "SHT" },
    ],
  },
];