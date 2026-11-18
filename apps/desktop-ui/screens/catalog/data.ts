export type ProductStatus = "active" | "low" | "draft";

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: string;
  stock: number;
  status: ProductStatus;
  tone: "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5";
  description: string;
  cost: string;
  margin: string;
  reorderAt: number;
  variants: string[];
  media: number;
  barcode: string;
  supplier: string;
  updated: string;
}

export const products: Product[] = [
  {
    id: "p1",
    sku: "IQ-PRO-50",
    name: "ProMax headset",
    category: "Audio",
    price: "KES 12,500",
    stock: 84,
    status: "active",
    tone: "chart-1",
    description: "Over-ear wireless headset with 40h battery and ANC.",
    cost: "KES 8,900",
    margin: "28.8%",
    reorderAt: 20,
    variants: ["Black", "Sand"],
    media: 4,
    barcode: "616123450001",
    supplier: "Shenzhen Audio Co.",
    updated: "2h ago",
  },
  {
    id: "p2",
    sku: "IQ-DIS-24",
    name: "Retail display kit",
    category: "Displays",
    price: "KES 8,400",
    stock: 12,
    status: "low",
    tone: "chart-2",
    description: "Retail display kit with shelf talkers and demo stand.",
    cost: "KES 6,100",
    margin: "27.4%",
    reorderAt: 10,
    variants: ["Standard"],
    media: 3,
    barcode: "616123450002",
    supplier: "Display Works",
    updated: "4h ago",
  },
  {
    id: "p3",
    sku: "IQ-ACC-40",
    name: "Accessory bundle",
    category: "Accessories",
    price: "KES 4,200",
    stock: 140,
    status: "active",
    tone: "chart-3",
    description: "Headset, stand, and travel pouch bundle.",
    cost: "KES 3,000",
    margin: "28.6%",
    reorderAt: 30,
    variants: ["Retail", "Corporate"],
    media: 2,
    barcode: "616123450003",
    supplier: "Shenzhen Audio Co.",
    updated: "Yesterday",
  },
  {
    id: "p4",
    sku: "IQ-OFF-12",
    name: "Office audio pack",
    category: "Audio",
    price: "KES 18,900",
    stock: 6,
    status: "low",
    tone: "chart-4",
    description: "Five-pack audio kit for office meeting rooms.",
    cost: "KES 14,200",
    margin: "24.9%",
    reorderAt: 8,
    variants: ["Black"],
    media: 2,
    barcode: "616123450004",
    supplier: "Shenzhen Audio Co.",
    updated: "Yesterday",
  },
  {
    id: "p5",
    sku: "IQ-RET-80",
    name: "Retail starter pack",
    category: "Displays",
    price: "KES 24,000",
    stock: 32,
    status: "active",
    tone: "chart-5",
    description: "Starter merchandising pack for new retail partners.",
    cost: "KES 19,500",
    margin: "18.8%",
    reorderAt: 12,
    variants: ["Standard"],
    media: 5,
    barcode: "616123450005",
    supplier: "Display Works",
    updated: "2d ago",
  },
  {
    id: "p6",
    sku: "IQ-ACC-41",
    name: "Travel case",
    category: "Accessories",
    price: "KES 2,800",
    stock: 0,
    status: "draft",
    tone: "chart-2",
    description: "Hard-shell travel case for headsets and cables.",
    cost: "KES 2,100",
    margin: "25.0%",
    reorderAt: 15,
    variants: ["Black"],
    media: 1,
    barcode: "616123450006",
    supplier: "Accessory Hub",
    updated: "3d ago",
  },
];

export const categories = ["All", "Audio", "Displays", "Accessories"] as const;

export const catalogMetrics = [
  { label: "Active products", value: "86", note: "4 categories", tone: "chart-1" as const },
  { label: "Low stock", value: "3", note: "Below 10 units", tone: "chart-4" as const },
  { label: "Catalog value", value: "KES 2.4M", note: "At list price", tone: "chart-3" as const },
];
