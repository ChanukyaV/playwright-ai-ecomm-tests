import { Product } from "./types";

export const DEFAULT_PAGE_SIZE = 12;
export const PAGE_SIZE_OPTIONS = [12, 24, 48] as const;
export const MAX_PAGE_SIZE = 100;

export interface CatalogFilter {
  q?: string;
  /** Case-insensitive exact category name; empty / "all" means every category. */
  category?: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function filterProducts(
  products: Product[],
  { q, category }: CatalogFilter
): Product[] {
  const needle = q?.trim().toLowerCase();
  const cat = category?.trim().toLowerCase();

  return products.filter((p) => {
    if (cat && cat !== "all" && p.category.toLowerCase() !== cat) return false;
    if (!needle) return true;
    return (
      p.name.toLowerCase().includes(needle) ||
      p.category.toLowerCase().includes(needle) ||
      p.description.toLowerCase().includes(needle)
    );
  });
}

export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number
): PagedResult<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    total,
    totalPages,
  };
}

export function getCategories(
  products: Product[]
): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of products) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  return [...counts.entries()].map(([name, count]) => ({ name, count }));
}

/** Parses a positive integer, returning undefined when the value is not one. */
export function parsePositiveInt(value: string | null | undefined): number | undefined {
  if (value === null || value === undefined || !/^\d+$/.test(value)) return undefined;
  const n = Number(value);
  return n >= 1 ? n : undefined;
}
