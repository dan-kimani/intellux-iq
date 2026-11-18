import { Text, token, View } from "nsh";
import type { QuoteRow } from "./data";
import { amountInWords } from "./quoteWords";

function ink(color: "document-foreground" | "document-muted" = "document-foreground") {
  return { color: token(color) };
}

export function QuoteRecordItems(props: { quote: QuoteRow }) {
  const quote = props.quote;
  return (
    <View class="gap-0">
      <View class="gap-0">
        <View class="flex-row border-y py-2.5" style={{ borderColor: token("document-border") }}>
          <Text
            class="w-8 text-[12.5px] font-semibold uppercase tracking-wide"
            style={ink("document-muted")}
          >
            #
          </Text>
          <Text
            class="flex-1 text-[12.5px] font-semibold uppercase tracking-wide"
            style={ink("document-muted")}
          >
            Item & description
          </Text>
          <Text
            class="w-14 text-right text-[12.5px] font-semibold uppercase tracking-wide"
            style={ink("document-muted")}
          >
            Qty
          </Text>
          <Text
            class="w-24 text-right text-[12.5px] font-semibold uppercase tracking-wide"
            style={ink("document-muted")}
          >
            Rate
          </Text>
          <Text
            class="w-20 text-right text-[12.5px] font-semibold uppercase tracking-wide"
            style={ink("document-muted")}
          >
            Tax
          </Text>
          <Text
            class="w-28 text-right text-[12.5px] font-semibold uppercase tracking-wide"
            style={ink("document-muted")}
          >
            Amount
          </Text>
        </View>
        <Each of={quote.items}>
          {(item: () => (typeof quote.items)[number], index: () => number) => (
            <View
              class="flex-row items-start border-b py-4"
              style={{ borderColor: token("document-border") }}
            >
              <Text class="w-8 text-[13px]" style={ink("document-muted")}>
                {index() + 1}
              </Text>
              <View class="min-w-0 flex-1 gap-1">
                <Text class="text-[14px] font-medium" style={ink()}>
                  {item().name}
                </Text>
                <Text class="text-[12px]" style={ink("document-muted")}>
                  HSN 8518 · Catalog item · {quote.notes}
                </Text>
              </View>
              <Text class="w-14 text-right text-[13.5px]" style={ink()}>
                {item().qty}
              </Text>
              <Text class="w-24 text-right text-[13.5px]" style={ink()}>
                {item().price}
              </Text>
              <Text class="w-20 text-right text-[13px]" style={ink("document-muted")}>
                16%
              </Text>
              <Text class="w-28 text-right text-[14px] font-semibold" style={ink()}>
                {item().total}
              </Text>
            </View>
          )}
        </Each>
      </View>

      <View class="flex-row justify-end">
        <View class="w-72 gap-2">
          <Row label="Subtotal" value={quote.subtotal} />
          <Row label="Discount" value="KES 0" />
          <Row label="VAT (16%)" value={quote.tax} />
          <View
            class="flex-row items-center justify-between border-t pt-2"
            style={{ borderColor: token("document-border") }}
          >
            <Text class="text-[13px] font-semibold uppercase tracking-wide" style={ink()}>
              Total due
            </Text>
            <Text class="text-[24px] font-semibold tracking-tight" style={ink()}>
              {quote.total}
            </Text>
          </View>
        </View>
      </View>
      <Text class="text-[12px] italic" style={ink("document-muted")}>
        Amount in words: {amountInWords(quote.total)}
      </Text>
    </View>
  );
}

function Row(props: { label: string; value: string }) {
  return (
    <View class="flex-row items-center justify-between">
      <Text class="text-[13px]" style={ink("document-muted")}>
        {props.label}
      </Text>
      <Text class="text-[13.5px] font-medium" style={ink()}>
        {props.value}
      </Text>
    </View>
  );
}
