import { Text, token, View } from "nsh";
import { Badge, Icon } from "../../components/ui";
import type { QuoteRow } from "../quotes/data";
import { previewQuote } from "../quotes/state";

function statusVariant(status: QuoteRow["status"]): "success" | "warning" | "primary" | "outline" {
  if (status === "accepted") return "success";
  if (status === "expired") return "warning";
  if (status === "sent") return "primary";
  return "outline";
}

function statusTone(status: QuoteRow["status"]): string {
  if (status === "accepted") return token("success");
  if (status === "expired") return token("warning");
  if (status === "sent") return token("accent-foreground");
  return token("muted-foreground");
}

export function QuoteSummary(props: { quote: QuoteRow }) {
  return (
    <View class="gap-2 rounded-lg border border-border bg-panel p-2.5">
      <View class="flex-row items-center gap-2">
        <View class="h-6 w-6 items-center justify-center rounded-md bg-muted">
          <Icon name="fileText" size={12} tone="muted-foreground" />
        </View>
        <View class="min-w-0 flex-1 gap-0.5">
          <Text class="text-[12px] font-semibold text-foreground" style={{ numberOfLines: 2 }}>
            {props.quote.id}
          </Text>
          <Text class="text-[11px] text-muted-foreground" style={{ numberOfLines: 1 }}>
            {props.quote.opportunity}
          </Text>
        </View>
        <Badge variant={statusVariant(props.quote.status)}>
          <Text
            class="text-[11px] font-medium capitalize"
            style={{ color: statusTone(props.quote.status) }}
          >
            {props.quote.status}
          </Text>
        </Badge>
      </View>
      <View class="flex-row items-center gap-2">
        <Text class="text-[13px] font-semibold text-foreground">{props.quote.total}</Text>
        <Text class="text-[11px] text-muted-foreground">Valid until {props.quote.validUntil}</Text>
        <View class="flex-1" />
        <View
          role="button"
          accessibilityLabel={`Open quote ${props.quote.id}`}
          testID={`open-quote-${props.quote.id}`}
          onPress={() => previewQuote(props.quote)}
          class="h-6 flex-row items-center gap-1 rounded border border-border px-2"
          hoverStyle={{ backgroundColor: token("accent") }}
        >
          <Text class="text-[11px] font-medium text-foreground">Open</Text>
          <Icon name="arrowUpRight" size={9} tone="muted-foreground" />
        </View>
      </View>
    </View>
  );
}
