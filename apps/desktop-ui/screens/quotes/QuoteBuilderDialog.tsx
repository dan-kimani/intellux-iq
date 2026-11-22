import { signal, Text, token, View } from "nsh";
import { AppDialog, DialogActions, FormGrid, FormRow, ModalNotice } from "../../components/overlay";
import { SelectField, TextField } from "../../components/forms";
import { Badge, Button, Icon, SectionTitle } from "../../components/ui";
import { showToast } from "../../state";
import type { QuoteRow } from "./data";
import { quoteBuilderOpen, quoteCustomerPrefill, quoteDetail, quotePdf, quoteRows } from "./state";
import { linkQuoteToOpportunity } from "../opportunities/quotes";
import { currencySymbol } from "../../lib/money";
import { Row } from "./QuoteTotalsRow";

function closeBuilder() {
  quoteBuilderOpen.set(false);
  quoteCustomerPrefill.set(null);
}

interface Line {
  id: number;
  name: string;
  sku: string;
  qty: number;
  unit: number;
}

const initialLines: Line[] = [
  { id: 1, name: "ProMax headset", sku: "IQ-PRO-50", qty: 50, unit: 497000 },
  { id: 2, name: "Retail display kit", sku: "IQ-DIS-24", qty: 1, unit: 840000 },
];

function formatMinor(value: number): string {
  return `${currencySymbol()}${Math.round(value / 100).toLocaleString("en-US")}`;
}

function subtotal(lines: Line[]): number {
  return lines.reduce((sum, line) => sum + line.qty * line.unit, 0);
}

export function QuoteBuilderDialog() {
  const prefill = quoteCustomerPrefill();
  const customer = signal(prefill?.customer ?? "");
  const opportunity = signal(prefill?.opportunity ?? "");
  const validity = signal("14 days");
  const template = signal("Classic");
  const discount = signal(0);
  const tax = signal(16);
  const lines = signal<Line[]>(initialLines);
  const total = () => subtotal(lines()) * (1 - discount() / 100) * (1 + tax() / 100);
  const updateQty = (id: number, delta: number) =>
    lines.set(
      lines().map((line) =>
        line.id === id ? { ...line, qty: Math.max(1, line.qty + delta) } : line,
      ),
    );
  const removeLine = (id: number) => lines.set(lines().filter((line) => line.id !== id));
  const addLine = () =>
    lines.set([
      ...lines(),
      { id: Date.now(), name: "Catalog item", sku: "CUSTOM", qty: 1, unit: 125000 },
    ]);
  const create = () => {
    if (!customer().trim()) {
      showToast("Customer is required.");
      return;
    }
    const id = `QT-2025-${Math.floor(1000 + Math.random() * 8999)}`;
    const row: QuoteRow = {
      id,
      customer: customer().trim(),
      opportunity: opportunity().trim() || "Unlinked opportunity",
      value: formatMinor(total()),
      owner: "Alex Morgan",
      validUntil:
        validity() === "7 days" ? "24 Nov" : validity() === "30 days" ? "17 Dec" : "22 Nov",
      status: "draft",
      issued: "Today",
      version: 1,
      items: lines().map((line) => ({
        name: line.name,
        qty: line.qty,
        price: formatMinor(line.unit),
        total: formatMinor(line.qty * line.unit),
      })),
      subtotal: formatMinor(subtotal(lines())),
      tax: formatMinor(total() - subtotal(lines()) * (1 - discount() / 100)),
      total: formatMinor(total()),
      notes:
        discount() > 0
          ? `${discount()}% discount · ${tax()}% tax`
          : `${tax()}% tax · catalog pricing`,
      acceptedAt: "—",
      viewed: "—",
      approvalStatus: discount() > 10 ? "pending" : "not_required",
    };
    quoteRows.set([row, ...quoteRows()]);
    linkQuoteToOpportunity(row);
    quotePdf.set(null);
    quoteDetail.set(row);
    closeBuilder();
    showToast(discount() > 10 ? `${id} drafted; manager approval required.` : `${id} drafted.`);
  };
  return (
    <AppDialog
      open={() => true}
      onClose={closeBuilder}
      title="New quote"
      description="Build a versioned quotation tied to an opportunity."
      width={680}
      testID="quote-builder-dialog"
      footer={
        <DialogActions>
          <Button variant="ghost" size="sm" onPress={closeBuilder}>
            <Text class="text-[12px] font-medium">Cancel</Text>
          </Button>
          <Button variant="outline" size="sm" onPress={() => showToast("Draft saved locally.")}>
            <Text class="text-[12px] font-medium">Save draft</Text>
          </Button>
          <Button variant="primary" size="sm" onPress={create} testID="create-quote">
            <Icon name="fileText" size={11} tone="primary-foreground" />
            <Text class="text-[12px] font-semibold text-primary-foreground">Create quote</Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-4">
        <FormGrid>
          <TextField
            label="Customer"
            value={customer}
            onChange={customer.set}
            placeholder="Atlas Enterprises"
            testID="quote-customer"
          />
          <TextField
            label="Opportunity"
            value={opportunity}
            onChange={opportunity.set}
            placeholder="Acme Inc. — Q4 packaging"
            testID="quote-opportunity"
          />
          <SelectField
            label="Validity"
            value={validity}
            options={["7 days", "14 days", "30 days"]}
            onChange={validity.set}
          />
          <SelectField
            label="Template"
            value={template}
            options={["Classic", "Compact", "Enterprise"]}
            onChange={template.set}
          />
        </FormGrid>
        <View class="gap-2 rounded-xl border border-border bg-card shadow-md p-3">
          <SectionTitle
            action={<Text class="text-[11px] font-medium text-highlight">Catalog</Text>}
          >
            Line items
          </SectionTitle>
          <View class="flex-row items-center gap-2 border-b border-border pb-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
            <Text class="flex-1">Product</Text>
            <Text class="w-20 text-center">Qty</Text>
            <Text class="w-24 text-right">Unit</Text>
            <Text class="w-24 text-right">Total</Text>
            <View class="w-5" />
          </View>
          <Each of={lines()}>
            {(line: () => Line) => (
              <View class="flex-row items-center gap-2 border-b border-border py-1.5 last:border-b-0">
                <View class="min-w-0 flex-1 gap-0.5">
                  <Text class="text-[11px] font-medium text-foreground">{line().name}</Text>
                  <Text class="text-[11px] text-muted-foreground">{line().sku}</Text>
                </View>
                <View class="w-20 flex-row items-center justify-center gap-1">
                  <View
                    role="button"
                    accessibilityLabel="Decrease quantity"
                    onPress={() => updateQty(line().id, -1)}
                    class="h-5 w-5 items-center justify-center rounded border border-border"
                  >
                    <Text class="text-[12px] text-foreground">−</Text>
                  </View>
                  <Text class="w-6 text-center text-[11px] font-medium text-foreground">
                    {line().qty}
                  </Text>
                  <View
                    role="button"
                    accessibilityLabel="Increase quantity"
                    onPress={() => updateQty(line().id, 1)}
                    class="h-5 w-5 items-center justify-center rounded border border-border"
                  >
                    <Text class="text-[12px] text-foreground">+</Text>
                  </View>
                </View>
                <Text class="w-24 text-right text-[11px] text-muted-foreground">
                  {formatMinor(line().unit)}
                </Text>
                <Text class="w-24 text-right text-[11px] font-semibold text-foreground">
                  {formatMinor(line().qty * line().unit)}
                </Text>
                <View
                  role="button"
                  accessibilityLabel={`Remove ${line().name}`}
                  onPress={() => removeLine(line().id)}
                  class="w-5 items-center"
                >
                  <Icon name="close" size={10} tone="muted-foreground" />
                </View>
              </View>
            )}
          </Each>
          <View
            role="button"
            accessibilityLabel="Add quote line"
            onPress={addLine}
            class="h-7 items-center justify-center rounded-md border border-dashed border-border"
            hoverStyle={{ backgroundColor: token("accent") }}
          >
            <Text class="text-[11px] font-medium text-muted-foreground">+ Add line item</Text>
          </View>
        </View>
        <View class="flex-row gap-3">
          <View class="flex-1 gap-2 rounded-xl border border-border bg-card shadow-md p-3">
            <SectionTitle>Adjustments</SectionTitle>
            <View class="flex-row items-center justify-between">
              <Text class="text-[11px] text-muted-foreground">Discount</Text>
              <View class="flex-row items-center gap-1">
                <View
                  role="button"
                  accessibilityLabel="Discount 5 percent"
                  onPress={() => discount.set(5)}
                  class="h-6 flex-row items-center justify-center rounded border border-border px-2"
                  style={{ backgroundColor: discount() === 5 ? token("accent") : "transparent" }}
                >
                  <Text class="text-[11px] font-medium text-foreground">5%</Text>
                </View>
                <View
                  role="button"
                  accessibilityLabel="Discount 10 percent"
                  onPress={() => discount.set(10)}
                  class="h-6 flex-row items-center justify-center rounded border border-border px-2"
                  style={{ backgroundColor: discount() === 10 ? token("accent") : "transparent" }}
                >
                  <Text class="text-[11px] font-medium text-foreground">10%</Text>
                </View>
                <View
                  role="button"
                  accessibilityLabel="No discount"
                  onPress={() => discount.set(0)}
                  class="h-6 flex-row items-center justify-center rounded border border-border px-2"
                  style={{ backgroundColor: discount() === 0 ? token("accent") : "transparent" }}
                >
                  <Text class="text-[11px] font-medium text-foreground">0%</Text>
                </View>
              </View>
            </View>
            <View class="flex-row items-center justify-between">
              <Text class="text-[11px] text-muted-foreground">Tax</Text>
              <Text class="text-[11px] font-medium text-foreground">{tax()}% VAT</Text>
            </View>
            <Text class="text-[11px] leading-3.5 text-muted-foreground">
              Discounts above 10% require manager approval before send.
            </Text>
          </View>
          <View class="w-48 gap-1.5 rounded-xl border border-border bg-panel p-3">
            <Row label="Subtotal" value={formatMinor(subtotal(lines()))} />
            <Row
              label="Discount"
              value={`− ${formatMinor((subtotal(lines()) * discount()) / 100)}`}
            />
            <Row
              label="Tax"
              value={`+ ${formatMinor(total() - subtotal(lines()) * (1 - discount() / 100))}`}
            />
            <View class="border-t border-border pt-1.5">
              <Row label="Total" value={formatMinor(total())} strong />
            </View>
            <Badge variant={discount() > 10 ? "warning" : "success"}>
              <Text
                class="text-[11px] font-medium"
                style={{ color: token(discount() > 10 ? "warning" : "success") }}
              >
                {discount() > 10 ? "Approval required" : "Ready to draft"}
              </Text>
            </Badge>
          </View>
        </View>
        <FormRow>
          <Text class="text-[11px] leading-3.5 text-muted-foreground">
            Quote numbers are reserved in cloud blocks. Accepted totals are immutable and linked to
            the opportunity.
          </Text>
        </FormRow>
        <ModalNotice
          title="PDFs compile on the desktop"
          detail="The cloud stores and versions the quote; the desktop renders the branded PDF locally with Typst."
        />
      </View>
    </AppDialog>
  );
}
