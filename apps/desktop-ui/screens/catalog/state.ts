import { signal } from "nsh";
import { products, type Product } from "./data";

export const productRows = signal<Product[]>(products);
export const productDetail = signal<Product | null>(null);
export const newProductOpen = signal(false);
export const catalogImportOpen = signal(false);
export const catalogLowStock = signal(false);

export const productDispatch = signal<Product | null>(null);

export function catalogTabItems() {
  return [
    { id: "all", label: "Catalogue", count: productRows().length },
    {
      id: "low",
      label: "Low stock",
      count: productRows().filter((product) => product.status === "low" || product.stock === 0)
        .length,
    },
  ];
}

function tokens(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 3);
}

/** Resolves a free-text opportunity line (e.g. "50 units · ProMax") to a catalog product. */
export function matchProductLine(line: string): Product | null {
  const haystack = line.toLowerCase();
  const direct = productRows().find((product) => haystack.includes(product.name.toLowerCase()));
  if (direct) return direct;
  const candidates = tokens(haystack);
  return (
    productRows().find((product) => {
      const names = [...tokens(product.name), ...tokens(product.category)];
      return names.some((token) => candidates.includes(token));
    }) ?? null
  );
}
