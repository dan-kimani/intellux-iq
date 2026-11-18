import { Image, Text, token, View } from "nsh";
import headphones from "../../assets/images/headphones.jpg";
import { Card, Icon, SectionTitle } from "../../components/ui";
import { activeNav, activeNavChild } from "../../state";
import type { QuoteRow } from "../quotes/data";
import { quoteDetail, quotePdf, quoteRows, quoteTab } from "../quotes/state";
import type { ContactRow } from "./data";

function relatedQuotes(contact: ContactRow): QuoteRow[] {
  return quoteRows().filter(
    (quote) => quote.customer.trim().toLowerCase() === contact.company.trim().toLowerCase(),
  );
}

function openQuoteDocument(quote: QuoteRow) {
  quoteTab.set("all");
  activeNavChild.set("quotes");
  activeNav.set("Quotes");
  quoteDetail.set(quote);
  quotePdf.set(quote);
}

export function ContactMedia(props: { contact: ContactRow }) {
  const quotes = relatedQuotes(props.contact);
  const latest = quotes[0];
  const items = () => {
    const seen = new Map<string, { name: string; qty: number; price: string; total: string }>();
    for (const quote of quotes) {
      for (const item of quote.items) {
        const existing = seen.get(item.name);
        if (existing) existing.qty += item.qty;
        else seen.set(item.name, { ...item });
      }
    }
    return [...seen.values()];
  };

  return (
    <View class="gap-5">
      <Card class="overflow-hidden">
        <View class="flex-row items-center justify-between border-b border-border px-5 py-3.5">
          <SectionTitle>Products sent</SectionTitle>
          <Text class="text-[9.5px] text-muted-foreground">
            {items().length} {items().length === 1 ? "line" : "lines"} from quotations
          </Text>
        </View>
        <If when={items().length === 0}>
          <View class="px-5 py-6">
            <Text class="text-[10.5px] text-muted-foreground">
              No products have been sent to this customer yet.
            </Text>
          </View>
        </If>
        <Each of={items()}>
          {(item: () => { name: string; qty: number; price: string; total: string }) => (
            <View class="flex-row items-center gap-3 border-b border-border px-5 py-3 last:border-b-0">
              <View class="h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Icon name="package" size={14} tone="muted-foreground" />
              </View>
              <View class="min-w-0 flex-1 gap-0.5">
                <Text class="text-[11.5px] font-medium text-foreground">{item().name}</Text>
                <Text class="text-[9.5px] text-muted-foreground">
                  {item().qty} × {item().price}
                </Text>
              </View>
              <Text class="text-[11.5px] font-semibold text-foreground">{item().total}</Text>
            </View>
          )}
        </Each>
      </Card>

      <Card class="gap-3 p-5">
        <View class="flex-row items-center justify-between">
          <SectionTitle>Photos & documents</SectionTitle>
          <Text class="text-[9.5px] text-muted-foreground">{quotes.length + 2} files</Text>
        </View>
        <View class="grid grid-cols-3 gap-3">
          <View class="overflow-hidden rounded-lg border border-border bg-panel">
            <Image src={headphones} style={{ width: "100%", height: 88, objectFit: "cover" }} />
            <View class="gap-0.5 px-2.5 py-2">
              <Text class="text-[10.5px] font-medium text-foreground">Product photo</Text>
              <Text class="text-[9px] text-muted-foreground">ProMax headset</Text>
            </View>
          </View>
          <If when={latest}>
            <View
              role="button"
              accessibilityLabel={`Preview ${latest?.id ?? ""} PDF`}
              onPress={() => latest && openQuoteDocument(latest)}
              class="gap-2 rounded-lg border border-border bg-panel p-3"
              hoverStyle={{ backgroundColor: token("accent") }}
            >
              <View class="h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <Icon name="fileText" size={14} tone="muted-foreground" />
              </View>
              <View class="gap-0.5">
                <Text class="text-[10.5px] font-medium text-foreground">
                  Quotation {latest?.id}
                </Text>
                <Text class="text-[9px] text-muted-foreground">PDF · 245 KB</Text>
              </View>
            </View>
          </If>
          <View class="gap-2 rounded-lg border border-border bg-panel p-3">
            <View class="h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <Icon name="printer" size={14} tone="muted-foreground" />
            </View>
            <View class="gap-0.5">
              <Text class="text-[10.5px] font-medium text-foreground">Delivery note</Text>
              <Text class="text-[9px] text-muted-foreground">PDF · 88 KB</Text>
            </View>
          </View>
        </View>
      </Card>
    </View>
  );
}
