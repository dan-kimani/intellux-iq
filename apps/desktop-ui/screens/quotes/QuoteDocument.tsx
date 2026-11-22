import { moneyText } from "../../lib/money";
import { Text, token, View } from "nsh";
import { Logo } from "../../components/ui";
import type { QuoteRow } from "./data";
import { amountInWords } from "./quoteWords";

function documentText(
  color: "document-foreground" | "document-muted" | "document-accent" = "document-foreground",
) {
  return { color: token(color) };
}

export function QuoteDocument(props: { quote: QuoteRow; width: () => number }) {
  const quote = props.quote;
  return (
    <View class="items-center pb-6 pt-2">
      <View
        class="gap-5 border border-border p-9 shadow-2xl"
        style={{
          width: props.width(),
          backgroundColor: token("document"),
          borderColor: token("document-border"),
        }}
      >
        <View
          class="flex-row items-start justify-between border-b pb-4"
          style={{ borderColor: token("document-border") }}
        >
          <View class="flex-row items-start gap-3">
            <Logo size={38} />
            <View class="gap-1">
              <Text class="text-[20px] font-semibold" style={documentText()}>
                Acme Trading Inc.
              </Text>
              <Text class="text-[11px] leading-3" style={documentText("document-muted")}>
                Hudson Yards · New York, US
              </Text>
              <Text class="text-[11px] leading-3" style={documentText("document-muted")}>
                sales@acmetrading.com · +1 415 555 0132
              </Text>
              <Text class="text-[11px] leading-3" style={documentText("document-muted")}>
                PIN: P051234567X · VAT: 0165432A
              </Text>
            </View>
          </View>
          <View class="items-end gap-1">
            <Text
              class="text-[24px] font-semibold tracking-wider"
              style={documentText("document-accent")}
            >
              QUOTATION
            </Text>
            <Text
              class="text-[11px] uppercase tracking-wider"
              style={documentText("document-muted")}
            >
              IntelluxIQ document
            </Text>
            <View
              class="mt-1 rounded border px-2 py-0.5"
              style={{ borderColor: token("document-accent") }}
            >
              <Text
                class="text-[11px] font-semibold uppercase tracking-wider"
                style={documentText("document-accent")}
              >
                {quote.status}
              </Text>
            </View>
          </View>
        </View>

        <View class="flex-row justify-between gap-6">
          <View class="flex-1 gap-1">
            <Text
              class="text-[11px] font-semibold uppercase tracking-wider"
              style={documentText("document-muted")}
            >
              Prepared for
            </Text>
            <Text class="text-[14px] font-semibold" style={documentText()}>
              {quote.customer}
            </Text>
            <Text class="text-[11px]" style={documentText("document-muted")}>
              {quote.opportunity}
            </Text>
            <Text class="text-[11px]" style={documentText("document-muted")}>
              New York, US
            </Text>
          </View>
          <View class="w-48 gap-1">
            <Meta label="Quote number" value={quote.id} />
            <Meta label="Quote date" value={quote.issued} />
            <Meta label="Expiry date" value={quote.validUntil} />
            <Meta label="Salesperson" value={quote.owner} />
            <Meta label="Reference" value="OPP-2025-0123" />
          </View>
        </View>

        <View
          class="overflow-hidden rounded border"
          style={{ borderColor: token("document-border") }}
        >
          <View class="flex-row px-2 py-2" style={{ backgroundColor: token("document-soft") }}>
            <Text
              class="w-6 text-[11px] font-semibold uppercase tracking-wider"
              style={documentText("document-muted")}
            >
              #
            </Text>
            <Text
              class="flex-1 text-[11px] font-semibold uppercase tracking-wider"
              style={documentText("document-muted")}
            >
              Item & description
            </Text>
            <Text
              class="w-10 text-right text-[11px] font-semibold uppercase tracking-wider"
              style={documentText("document-muted")}
            >
              Qty
            </Text>
            <Text
              class="w-20 text-right text-[11px] font-semibold uppercase tracking-wider"
              style={documentText("document-muted")}
            >
              Rate
            </Text>
            <Text
              class="w-20 text-right text-[11px] font-semibold uppercase tracking-wider"
              style={documentText("document-muted")}
            >
              Amount
            </Text>
          </View>
          <Each of={quote.items}>
            {(item: () => (typeof quote.items)[number], index: () => number) => (
              <View
                class="flex-row border-t px-2 py-2"
                style={{ borderColor: token("document-border") }}
              >
                <Text class="w-6 text-[11px]" style={documentText("document-muted")}>
                  {index() + 1}
                </Text>
                <View class="flex-1 gap-0.5">
                  <Text class="text-[11px] font-medium" style={documentText()}>
                    {item().name}
                  </Text>
                  <Text class="text-[11px]" style={documentText("document-muted")}>
                    HSN 8518 ·{" "}
                    {item().name === "ProMax headset" ? "Wireless audio" : "Catalog item"}
                  </Text>
                </View>
                <Text class="w-10 text-right text-[11px] tabular-nums" style={documentText()}>
                  {item().qty}
                </Text>
                <Text class="w-20 text-right text-[11px] tabular-nums" style={documentText()}>
                  {item().price}
                </Text>
                <Text
                  class="w-20 text-right text-[11px] font-medium tabular-nums"
                  style={documentText()}
                >
                  {item().total}
                </Text>
              </View>
            )}
          </Each>
        </View>

        <View class="flex-row justify-end">
          <View class="w-56 gap-1">
            <Summary label="Subtotal" value={quote.subtotal} />
            <Summary label="Discount" value={moneyText("$0")} />
            <Summary label="VAT (16%)" value={quote.tax} />
            <View
              class="flex-row items-center justify-between border-t pt-1"
              style={{ borderColor: token("document-border") }}
            >
              <Text
                class="text-[11px] font-semibold uppercase tracking-wider"
                style={documentText()}
              >
                Total
              </Text>
              <Text class="text-[13px] font-semibold tabular-nums" style={documentText()}>
                {quote.total}
              </Text>
            </View>
          </View>
        </View>
        <View class="rounded px-2 py-1.5" style={{ backgroundColor: token("document-soft") }}>
          <Text class="text-[11px] italic" style={documentText("document-muted")}>
            Amount in words: {amountInWords(quote.total)}
          </Text>
        </View>

        <View
          class="flex-row justify-between gap-6 border-t pt-3"
          style={{ borderColor: token("document-border") }}
        >
          <View class="flex-1 gap-1">
            <Text
              class="text-[11px] font-semibold uppercase tracking-wider"
              style={documentText("document-muted")}
            >
              Notes
            </Text>
            <Text class="text-[11px] leading-3" style={documentText()}>
              Thank you for your business. Please reference the quote number when ordering.
            </Text>
            <Text class="text-[11px] leading-3" style={documentText("document-muted")}>
              {quote.notes}
            </Text>
          </View>
          <View class="w-40 items-end justify-end gap-3">
            <Text class="text-[11px]" style={documentText("document-muted")}>
              For Acme Trading Inc.
            </Text>
            <View class="h-px w-32" style={{ backgroundColor: token("document-border") }} />
            <Text class="text-[11px]" style={documentText("document-muted")}>
              Authorised signature
            </Text>
          </View>
        </View>

        <View
          class="flex-row items-center justify-between border-t pt-2"
          style={{ borderColor: token("document-border") }}
        >
          <Text class="text-[11px]" style={documentText("document-muted")}>
            Acme Trading Inc. · sales@acmetrading.com · +1 415 555 0132
          </Text>
          <Text class="text-[11px]" style={documentText("document-muted")}>
            Page 1 of 1
          </Text>
        </View>
      </View>
    </View>
  );
}

function Meta(props: { label: string; value: string }) {
  return (
    <View class="flex-row items-center justify-between">
      <Text class="text-[11px]" style={documentText("document-muted")}>
        {props.label}
      </Text>
      <Text class="text-[11px] font-medium" style={documentText()}>
        {props.value}
      </Text>
    </View>
  );
}

function Summary(props: { label: string; value: string }) {
  return (
    <View class="flex-row items-center justify-between">
      <Text class="text-[11px]" style={documentText("document-muted")}>
        {props.label}
      </Text>
      <Text class="text-[11px] font-medium" style={documentText()}>
        {props.value}
      </Text>
    </View>
  );
}
