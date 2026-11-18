import { Text, token, View } from "nsh";
import { Icon, Logo } from "../../components/ui";
import type { QuoteRow } from "./data";
import { QuoteRecordItems } from "./QuoteRecordItems";
import { customerFor, quoteSteps, type QuoteAcceptance } from "./quoteMeta";

function ink(
  color: "document-foreground" | "document-muted" | "document-accent" = "document-foreground",
) {
  return { color: token(color) };
}

export function QuoteRecord(props: { quote: QuoteRow; acceptance?: QuoteAcceptance }) {
  const quote = props.quote;
  const customer = customerFor(quote);
  const steps = quoteSteps(quote);
  return (
    <View
      class="w-full max-w-245 gap-7 p-10 shadow-2xl"
      style={{ backgroundColor: token("document") }}
    >
      <View class="flex-row items-start justify-between gap-8">
        <View class="flex-row items-start gap-4">
          <Logo size={44} />
          <View class="gap-1">
            <Text class="text-[22px] font-semibold tracking-tight" style={ink()}>
              Acme Trading Ltd
            </Text>
            <Text class="text-[12.5px] leading-5" style={ink("document-muted")}>
              Westlands Business Park · Nairobi, Kenya
            </Text>
            <Text class="text-[12.5px] leading-5" style={ink("document-muted")}>
              sales@acmetrading.co.ke · +254 712 345 678
            </Text>
            <Text class="text-[11.5px] leading-4" style={ink("document-muted")}>
              PIN: P051234567X · VAT: 0165432A
            </Text>
          </View>
        </View>
        <View class="items-end gap-1.5">
          <Text class="text-[26px] font-semibold tracking-[0.16em]" style={ink("document-accent")}>
            QUOTATION
          </Text>
          <Text class="text-[22px] font-semibold tracking-tight" style={ink()}>
            {quote.id}
          </Text>
          <Text class="text-[12px]" style={ink("document-muted")}>
            Issued {quote.issued} · Expires {quote.validUntil}
          </Text>
          <View
            class="mt-1 rounded border px-2.5 py-1"
            style={{ borderColor: token("document-accent") }}
          >
            <Text
              class="text-[10.5px] font-semibold uppercase tracking-[0.14em]"
              style={ink("document-accent")}
            >
              {quote.status}
            </Text>
          </View>
        </View>
      </View>

      <View
        class="flex-row justify-between gap-12 border-t pt-5"
        style={{ borderColor: token("document-border") }}
      >
        <View class="flex-1 gap-1">
          <Text class="text-[13px] font-semibold" style={ink("document-muted")}>
            Prepared for
          </Text>
          <Text class="text-[15px] font-semibold" style={ink()}>
            {quote.customer}
          </Text>
          <Text class="text-[13px] leading-5" style={ink("document-muted")}>
            {customer.contact} · {customer.email}
          </Text>
          <Text class="text-[13px] leading-5" style={ink("document-muted")}>
            {customer.phone}
          </Text>
          <Text class="text-[13px] leading-5" style={ink("document-muted")}>
            {customer.address}
          </Text>
        </View>
        <View class="w-76 gap-2">
          <Text class="text-[13px] font-semibold" style={ink("document-muted")}>
            Opportunity
          </Text>
          <Text class="text-[14px] font-semibold" style={ink()}>
            {quote.opportunity}
          </Text>
          <View class="flex-row justify-between">
            <Text class="text-[12px]" style={ink("document-muted")}>
              Owner
            </Text>
            <Text class="text-[12.5px] font-medium" style={ink()}>
              {quote.owner}
            </Text>
          </View>
          <View class="flex-row justify-between">
            <Text class="text-[12px]" style={ink("document-muted")}>
              Reference
            </Text>
            <Text class="text-[12.5px] font-medium" style={ink()}>
              OPP-2025-0123
            </Text>
          </View>
          <View class="flex-row justify-between">
            <Text class="text-[12px]" style={ink("document-muted")}>
              Currency
            </Text>
            <Text class="text-[12.5px] font-medium" style={ink()}>
              KES
            </Text>
          </View>
        </View>
      </View>

      <View class="gap-3 rounded-md px-4 py-3" style={{ backgroundColor: token("document-soft") }}>
        <View class="flex-row items-center justify-between">
          <Text class="text-[12.5px] font-semibold" style={ink()}>
            Document status
          </Text>
          <Text class="text-[11.5px]" style={ink("document-muted")}>
            {quote.approvalStatus === "pending"
              ? "Manager approval required"
              : "Commercial document"}
          </Text>
        </View>
        <View class="flex-row items-start">
          <Each of={steps}>
            {(step: () => (typeof steps)[number], index: () => number) => (
              <View class="flex-1 flex-row items-start">
                <View class="items-center gap-1">
                  <View
                    class="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: step().done
                        ? token("document-accent")
                        : token("document-border"),
                    }}
                  />
                  <Text
                    class="w-16 text-center text-[10.5px] leading-3"
                    style={ink(step().done ? "document-foreground" : "document-muted")}
                  >
                    {step().label}
                  </Text>
                </View>
                <If when={index() < steps.length - 1}>
                  <View
                    class="mt-1 h-px flex-1"
                    style={{ backgroundColor: token("document-border") }}
                  />
                </If>
              </View>
            )}
          </Each>
        </View>
        <View class="flex-row gap-4">
          <Each of={steps}>
            {(step: () => (typeof steps)[number]) => (
              <Text class="flex-1 text-[10.5px]" style={ink("document-muted")}>
                {step().at}
              </Text>
            )}
          </Each>
        </View>
      </View>

      <QuoteRecordItems quote={quote} />
      <View class="gap-2 border-t pt-4" style={{ borderColor: token("document-border") }}>
        <Text class="text-[13.5px] font-semibold" style={ink()}>
          Document activity
        </Text>
        <Activity text={`Created by ${quote.owner}`} time={quote.issued} />
        <Activity text="Sent to the customer from sales@acmetrading.co.ke" time={quote.issued} />
        <Activity text={`Customer viewed the quote · ${quote.viewed}`} time="Latest" />
        <If when={props.acceptance}>
          <Activity
            text={`Accepted by customer · ${props.acceptance?.reference}`}
            time={`${props.acceptance?.at} · ${props.acceptance?.by}`}
            tone="success"
          />
        </If>
      </View>

      <If when={props.acceptance}>
        <View
          class="flex-row items-start gap-2 rounded-md px-3 py-2"
          style={{ backgroundColor: token("document-soft") }}
        >
          <Icon name="shieldCheck" size={13} tone="success" />
          <View class="flex-1 gap-0.5">
            <Text class="text-[12.5px] font-medium" style={ink()}>
              Customer acceptance recorded
            </Text>
            <Text class="text-[11.5px]" style={ink("document-muted")}>
              Reference {props.acceptance?.reference} · recorded by {props.acceptance?.by} ·{" "}
              {props.acceptance?.at}
            </Text>
          </View>
        </View>
      </If>

      <View
        class="flex-row justify-between gap-10 border-t pt-5"
        style={{ borderColor: token("document-border") }}
      >
        <View class="flex-1 gap-2">
          <Text class="text-[13px] font-semibold" style={ink()}>
            Notes & terms
          </Text>
          <Text class="text-[13px] leading-5" style={ink("document-muted")}>
            Thank you for your business. Please reference the quote number when ordering.
          </Text>
          <Text class="text-[12px] leading-5" style={ink("document-muted")}>
            {quote.notes}
          </Text>
        </View>
        <View class="w-52 gap-2">
          <Text class="text-[13px] font-semibold" style={ink()}>
            Delivery
          </Text>
          <Text class="text-[12.5px] leading-5" style={ink("document-muted")}>
            Included · Nairobi region
          </Text>
          <Text class="text-[12.5px] leading-5" style={ink("document-muted")}>
            Payment: Net 14 days
          </Text>
          <Text class="text-[12.5px] leading-5" style={ink("document-muted")}>
            Warranty: 12 months
          </Text>
        </View>
        <View class="w-48 items-end justify-end gap-3">
          <Text class="text-[12px]" style={ink("document-muted")}>
            For Acme Trading Ltd
          </Text>
          <View class="h-px w-36" style={{ backgroundColor: token("document-border") }} />
          <Text class="text-[11px]" style={ink("document-muted")}>
            Authorised signature
          </Text>
        </View>
      </View>

      <View
        class="flex-row items-center justify-between border-t pt-3"
        style={{ borderColor: token("document-border") }}
      >
        <Text class="text-[11px]" style={ink("document-muted")}>
          Acme Trading Ltd · sales@acmetrading.co.ke · +254 712 345 678
        </Text>
        <Text class="text-[11px]" style={ink("document-muted")}>
          Page 1 of 1
        </Text>
      </View>
    </View>
  );
}

function Activity(props: { text: string; time: string; tone?: "success" }) {
  return (
    <View class="flex-row items-center gap-2.5">
      <View
        class="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: token(props.tone === "success" ? "success" : "document-accent") }}
      />
      <Text class="min-w-0 flex-1 text-[13px]" style={ink()}>
        {props.text}
      </Text>
      <Text class="text-[12px]" style={ink("document-muted")}>
        {props.time}
      </Text>
    </View>
  );
}
