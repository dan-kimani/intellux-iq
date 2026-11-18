import { Text, token, View } from "nsh";
import { ActionMenu } from "../../components/ActionMenu";
import { Badge, Button, Card, Icon } from "../../components/ui";
import { activeNav, activeNavChild } from "../../state";
import { dealRows } from "../deals/state";
import { quoteStatusStyles, type QuoteRow } from "../quotes/data";
import {
  duplicateQuote,
  markQuoteSent,
  quoteBuilderOpen,
  quoteCustomerPrefill,
  quoteDetail,
  quotePdf,
  quoteRows,
  quoteTab,
} from "../quotes/state";
import type { ContactRow } from "./data";

function relatedQuotes(contact: ContactRow): QuoteRow[] {
  return quoteRows().filter(
    (quote) => quote.customer.trim().toLowerCase() === contact.company.trim().toLowerCase(),
  );
}

function openQuote(quote: QuoteRow, preview: boolean) {
  quoteTab.set("all");
  activeNavChild.set("quotes");
  activeNav.set("Quotes");
  quoteDetail.set(quote);
  quotePdf.set(preview ? quote : null);
}

function newQuoteFor(contact: ContactRow) {
  const deal = dealRows().find(
    (row) =>
      row.contact.trim().toLowerCase() === contact.name.trim().toLowerCase() ||
      row.company.trim().toLowerCase() === contact.company.trim().toLowerCase(),
  );
  quoteCustomerPrefill.set({
    customer: contact.company,
    opportunity: deal?.name ?? `${contact.company} — new opportunity`,
  });
  quoteTab.set("all");
  activeNavChild.set("quotes");
  activeNav.set("Quotes");
  quoteBuilderOpen.set(true);
}

function statusTone(status: QuoteRow["status"]): string {
  const variant = quoteStatusStyles[status].variant;
  return variant === "success"
    ? token("success")
    : variant === "warning"
      ? token("warning")
      : variant === "primary"
        ? token("accent-foreground")
        : token("muted-foreground");
}

export function ContactQuotes(props: { contact: ContactRow }) {
  const quotes = relatedQuotes(props.contact);
  return (
    <Card class="overflow-hidden">
      <View class="flex-row items-center gap-3 border-b border-border px-5 py-3.5">
        <View class="flex-row items-center gap-2">
          <Text class="text-[13.5px] font-semibold text-foreground">Quotations</Text>
          <Badge variant="outline">
            <Text class="text-[9px] text-muted-foreground">{quotes.length}</Text>
          </Badge>
        </View>
        <View class="flex-1" />
        <Button variant="outline" size="sm" onPress={() => newQuoteFor(props.contact)}>
          <Icon name="plus" size={11} tone="muted-foreground" />
          <Text class="text-[10.5px] font-medium">New quote</Text>
        </Button>
      </View>

      <If when={quotes.length === 0}>
        <View class="items-center gap-2 px-5 py-8">
          <View class="h-9 w-9 items-center justify-center rounded-lg bg-muted">
            <Icon name="fileText" size={15} tone="muted-foreground" />
          </View>
          <Text class="text-[11.5px] font-medium text-foreground">No quotations yet</Text>
          <Text class="text-[10px] text-muted-foreground">
            Raise the first quotation for {props.contact.company}.
          </Text>
        </View>
      </If>

      <Each of={quotes}>
        {(quote: () => QuoteRow) => (
          <View
            role="button"
            accessibilityLabel={`Open ${quote().id}`}
            onPress={() => openQuote(quote(), false)}
            class="flex-row items-center gap-4 border-b border-border px-5 py-3.5 last:border-b-0"
            hoverStyle={{ backgroundColor: token("accent") }}
            focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: -2 }}
          >
            <View class="min-w-0 flex-1 gap-1">
              <View class="flex-row items-center gap-2">
                <Text class="font-mono text-[10.5px] font-medium text-foreground">
                  {quote().id}
                </Text>
                <Badge variant={quoteStatusStyles[quote().status].variant}>
                  <Text
                    class="text-[9px] font-medium capitalize"
                    style={{ color: statusTone(quote().status) }}
                  >
                    {quoteStatusStyles[quote().status].label}
                  </Text>
                </Badge>
              </View>
              <Text class="text-[10.5px] text-muted-foreground" style={{ numberOfLines: 1 }}>
                {quote().opportunity}
              </Text>
            </View>
            <View class="w-28 items-end gap-0.5">
              <Text class="text-[12px] font-semibold text-foreground">{quote().value}</Text>
              <Text class="text-[9.5px] text-muted-foreground">Valid to {quote().validUntil}</Text>
            </View>
            <View class="flex-row items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                accessibilityLabel="Preview PDF"
                onPress={() => openQuote(quote(), true)}
              >
                <Icon name="printer" size={11} tone="muted-foreground" />
              </Button>
              <ActionMenu
                testID={`contact-quote-menu-${quote().id}`}
                width={210}
                trigger={
                  <View
                    role="button"
                    accessibilityLabel="Quote actions"
                    class="h-8 w-8 items-center justify-center rounded-md"
                    hoverStyle={{ backgroundColor: token("accent") }}
                  >
                    <Icon name="ellipsis" size={14} tone="muted-foreground" />
                  </View>
                }
                groups={[
                  [
                    {
                      id: "open",
                      label: "Open quotation",
                      icon: "arrowUpRight",
                      onSelect: () => openQuote(quote(), false),
                    },
                    {
                      id: "pdf",
                      label: "Preview PDF",
                      icon: "printer",
                      onSelect: () => openQuote(quote(), true),
                    },
                  ],
                  [
                    {
                      id: "send",
                      label: "Mark as sent",
                      icon: "send",
                      disabled: quote().status !== "draft",
                      onSelect: () => markQuoteSent(quote().id),
                    },
                    {
                      id: "duplicate",
                      label: "Duplicate quote",
                      icon: "fileText",
                      onSelect: () => duplicateQuote(quote().id),
                    },
                  ],
                ]}
              />
            </View>
          </View>
        )}
      </Each>
    </Card>
  );
}
