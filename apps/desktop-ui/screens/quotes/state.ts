import { signal } from "nsh";
import { showToast } from "../../state";
import { quotes, type QuoteRow } from "./data";
import type { QuoteAcceptance } from "./quoteMeta";

export const quoteRows = signal<QuoteRow[]>(quotes);
export const quoteDetail = signal<QuoteRow | null>(quotes[0] ?? null);
export const quoteBuilderOpen = signal(false);

export interface QuotePrefill {
  customer: string;
  opportunity: string;
}

export const quoteCustomerPrefill = signal<QuotePrefill | null>(null);
export const quotePdf = signal<QuoteRow | null>(null);
export const quotePreview = signal<QuoteRow | null>(null);

export const quoteAcceptance = signal<Record<string, QuoteAcceptance>>({});

export type QuoteTab = "all" | "drafts" | "pending" | "sent" | "accepted";

export const quoteTab = signal<QuoteTab>("all");

export function quoteTabCounts(): Record<QuoteTab, number> {
  const rows = quoteRows();
  return {
    all: rows.length,
    drafts: rows.filter((row) => row.status === "draft").length,
    pending: rows.filter((row) => row.approvalStatus === "pending").length,
    sent: rows.filter((row) => row.status === "sent").length,
    accepted: rows.filter((row) => row.status === "accepted").length,
  };
}

export function visibleQuoteRows(): QuoteRow[] {
  const tab = quoteTab();
  if (tab === "all") return quoteRows();
  return quoteRows().filter((row) => {
    if (tab === "drafts") return row.status === "draft";
    if (tab === "pending") return row.approvalStatus === "pending";
    if (tab === "sent") return row.status === "sent";
    return row.status === "accepted";
  });
}

function patchQuote(id: string, patch: Partial<QuoteRow>): QuoteRow | null {
  const source = quoteRows().find((row) => row.id === id);
  if (!source) return null;
  const updated: QuoteRow = { ...source, ...patch };
  quoteRows.set(quoteRows().map((row) => (row.id === id ? updated : row)));
  if (quoteDetail()?.id === id) quoteDetail.set(updated);
  if (quotePdf()?.id === id) quotePdf.set(updated);
  if (quotePreview()?.id === id) quotePreview.set(updated);
  return updated;
}

export function openQuote(quote: QuoteRow): void {
  quotePdf.set(null);
  quoteDetail.set(quote);
}

export function previewQuotePdf(quote: QuoteRow): void {
  quoteDetail.set(quote);
  quotePdf.set(quote);
}

export function previewQuote(quote: QuoteRow): void {
  quotePreview.set(quote);
}

export function markQuoteSent(id: string): void {
  const quote = quoteRows().find((row) => row.id === id);
  if (!quote) return;
  if (quote.approvalStatus === "pending") {
    showToast("Manager approval is required before sending.");
    return;
  }
  patchQuote(id, { status: "sent" });
  showToast(`${id} queued for cloud egress.`);
}

export function duplicateQuote(id: string): void {
  const source = quoteRows().find((row) => row.id === id);
  if (!source) return;
  const copy: QuoteRow = {
    ...source,
    id: nextQuoteId(),
    status: "draft",
    version: 1,
    issued: "Today",
    acceptedAt: "—",
    viewed: "Not viewed",
    approvalStatus: "not_required",
  };
  quoteRows.set([copy, ...quoteRows()]);
  openQuote(copy);
  showToast(`${copy.id} drafted from ${source.id}.`);
}

function nextQuoteId(): string {
  const highest = quoteRows().reduce((max, row) => {
    const value = Number(row.id.split("-")[2]);
    return Number.isFinite(value) ? Math.max(max, value) : max;
  }, 0);
  return `QT-2025-${String(highest + 1).padStart(4, "0")}`;
}

export function recordAcceptance(quote: QuoteRow, reference: string, note: string): void {
  quoteRows.set(
    quoteRows().map((row) =>
      row.id === quote.id ? { ...row, status: "accepted", acceptedAt: "Just now" } : row,
    ),
  );
  quoteAcceptance.set({
    ...quoteAcceptance(),
    [quote.id]: { reference, note, by: "Alex Morgan", at: "Just now" },
  });
}
