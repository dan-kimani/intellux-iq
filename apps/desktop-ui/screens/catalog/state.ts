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
