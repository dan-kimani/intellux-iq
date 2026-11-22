import type { JSX } from "nsh";
import { Text, token, View } from "nsh";
import { Button, Icon } from "../../components/ui";
import { activeNav, activeNavChild, showToast } from "../../state";
import { matchProductLine, productDetail } from "../catalog/state";
import { stageLabel } from "../../domain/stages";
import type { StageEvent } from "../../state/inbox";
import type { QuoteRow } from "../quotes/data";
import type { OpportunityDetail } from "../opportunities/detail";
import { QuoteSummary } from "../opportunities/QuoteSummary";

export function PanelSection(props: {
  title: string;
  action?: JSX.Element;
  children?: JSX.Element;
}) {
  return (
    <View class="gap-2 rounded-xl border border-border bg-card p-3">
      <View class="flex-row items-center gap-2">
        <Text class="flex-1 text-[12px] font-semibold text-foreground">{props.title}</Text>
        {props.action}
      </View>
      {props.children}
    </View>
  );
}

export function Fact(props: { label: string; value: string }) {
  return (
    <View class="gap-0.5 rounded-lg bg-muted p-2">
      <Text class="text-[11px] uppercase tracking-wider text-muted-foreground">{props.label}</Text>
      <Text class="text-[12px] font-medium text-foreground" style={{ numberOfLines: 2 }}>
        {props.value}
      </Text>
    </View>
  );
}

export function weightedValue(detail: OpportunityDetail): string {
  const amount = Number(detail.value.replace(/\D/g, ""));
  if (!Number.isFinite(amount) || amount <= 0) return "—";
  const weighted = Math.round((amount * detail.probability) / 100);
  return `$${weighted.toLocaleString("en-GB")}`;
}

export function HistorySection(props: { history: StageEvent[] }) {
  const events = () => props.history.toReversed();
  return (
    <PanelSection
      title="Stage history"
      action={
        <Text class="text-[11px] text-muted-foreground">
          {props.history.length} {props.history.length === 1 ? "event" : "events"}
        </Text>
      }
    >
      <View class="gap-0">
        <Each of={events()}>
          {(event: () => StageEvent, index: () => number) => (
            <View class="flex-row gap-2.5">
              <View class="items-center">
                <View
                  class="mt-1 rounded-full"
                  style={{
                    width: 6,
                    height: 6,
                    backgroundColor:
                      event().to === "won"
                        ? token("success")
                        : event().to === "lost"
                          ? token("warning")
                          : token("primary"),
                  }}
                />
                <If when={index() < events().length - 1}>
                  <View class="w-px flex-1 bg-border" style={{ minHeight: 18 }} />
                </If>
              </View>
              <View class="flex-1 gap-0.5 pb-2.5">
                <Text class="text-[11px] font-medium text-foreground">
                  {event().from === null
                    ? `Added at ${stageLabel(event().to)}`
                    : `${stageLabel(event().from!)} → ${stageLabel(event().to)}`}
                </Text>
                <Text class="text-[11px] text-muted-foreground">
                  {event().at} · {event().by}
                </Text>
                <If when={event().note}>
                  <Text class="text-[11px] leading-3.5 text-muted-foreground">{event().note}</Text>
                </If>
              </View>
            </View>
          )}
        </Each>
      </View>
    </PanelSection>
  );
}

export function ProductsSection(props: { detail: OpportunityDetail; onEdit: () => void }) {
  return (
    <PanelSection
      title="Products"
      action={
        <Button variant="ghost" size="sm" testID="opportunity-edit-product" onPress={props.onEdit}>
          <Icon name="pencil" size={9} tone="muted-foreground" />
          <Text class="text-[11px] font-medium">Edit</Text>
        </Button>
      }
    >
      <View
        role="button"
        accessibilityLabel={`Open product ${props.detail.product}`}
        testID="opportunity-product"
        onPress={() => {
          const product = matchProductLine(props.detail.product);
          if (!product) {
            showToast("No catalog product matches this opportunity line.");
            return;
          }
          productDetail.set(product);
          activeNavChild.set("catalog");
          activeNav.set("Catalog");
        }}
        class="flex-row items-center gap-2 rounded-md p-1"
        hoverStyle={{ backgroundColor: token("accent") }}
      >
        <View class="h-7 w-7 items-center justify-center rounded-md bg-muted">
          <Icon name="package" size={13} tone="muted-foreground" />
        </View>
        <View class="min-w-0 flex-1 gap-0.5">
          <Text class="text-[12px] font-medium text-foreground" style={{ numberOfLines: 2 }}>
            {props.detail.product}
          </Text>
          <Text class="text-[11px] text-muted-foreground">Catalog line · quote source</Text>
        </View>
        <Icon name="chevronRight" size={10} tone="muted-foreground" />
      </View>
    </PanelSection>
  );
}

export function QuotesSection(props: {
  detail: OpportunityDetail;
  quote: QuoteRow | null;
  onCreate: () => void;
}) {
  return (
    <PanelSection
      title="Quotations"
      action={
        <Text class="text-[11px] text-muted-foreground">
          {props.quote ? "1 linked" : "None yet"}
        </Text>
      }
    >
      <If
        when={props.quote}
        else={
          <View class="gap-2">
            <Text class="text-[11px] leading-3.5 text-muted-foreground">
              A quote belongs to this opportunity, not the conversation.
            </Text>
            <Button
              variant="outline"
              size="sm"
              testID="opportunity-create-quote-empty"
              onPress={props.onCreate}
            >
              <Icon name="fileText" size={9} tone="muted-foreground" />
              <Text class="text-[11px] font-medium">Create quote</Text>
            </Button>
          </View>
        }
      >
        <View class="gap-2">
          <QuoteSummary quote={props.quote!} />
          <Button variant="ghost" size="sm" testID="opportunity-new-quote" onPress={props.onCreate}>
            <Icon name="plus" size={9} tone="muted-foreground" />
            <Text class="text-[11px] font-medium">New quote version</Text>
          </Button>
        </View>
      </If>
    </PanelSection>
  );
}
