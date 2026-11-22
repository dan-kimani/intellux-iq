import { Text, token, View } from "nsh";
import { Badge, Card, Icon, SectionTitle, withAlpha } from "../components/ui";
import { useAfter } from "../components/motion";
import { Skeleton, SkeletonMetric } from "../components/skeletons";
import { PageShell } from "./PageShell";
import { currencySymbol, moneyText } from "../lib/money";
import { recoveredThisWeek, severityStyles, type RecoverySignal } from "./recovery/data";
import { RecoveryDialog } from "./recovery/RecoveryDialog";
import { recoveryDetail, recoveryFilter, recoveryResolved, recoveryRows } from "./recovery/state";

const openSignals = () => recoveryRows().length;
const urgentSignals = () => recoveryRows().filter((signal) => signal.severity === "urgent").length;
const activeFilter = () => recoveryFilter();
const visibleSignals = () =>
  recoveryRows().filter((signal) =>
    activeFilter() === "all"
      ? true
      : activeFilter() === "urgent"
        ? signal.severity === "urgent"
        : signal.owner === "Unassigned",
  );

function RecoveryMetrics() {
  const ready = useAfter(150);
  return (
    <If
      when={ready()}
      else={
        <View class="grid grid-cols-4 gap-3">
          <SkeletonMetric />
          <SkeletonMetric />
          <SkeletonMetric />
          <SkeletonMetric />
        </View>
      }
    >
      <View class="grid grid-cols-4 gap-3">
        <Card class="gap-2 p-3.5">
          <View class="flex-row items-center justify-between">
            <Text class="text-[12px] text-muted-foreground">Open signals</Text>
            <Icon name="bell" size={12} tone="chart-4" />
          </View>
          <Text class="text-[22px] font-semibold tabular-nums text-foreground">
            {openSignals()}
          </Text>
          <Text class="text-[12px] text-muted-foreground">Across conversations and quotes</Text>
        </Card>
        <Card class="gap-2 p-3.5">
          <View class="flex-row items-center justify-between">
            <Text class="text-[12px] text-muted-foreground">Urgent</Text>
            <Icon name="zap" size={12} tone="warning" />
          </View>
          <Text class="text-[22px] font-semibold tabular-nums text-warning">{urgentSignals()}</Text>
          <Text class="text-[12px] text-muted-foreground">Needs action now</Text>
        </Card>
        <Card class="gap-2 p-3.5">
          <View class="flex-row items-center justify-between">
            <Text class="text-[12px] text-muted-foreground">Recovered this month</Text>
            <Icon name="check" size={12} tone="success" />
          </View>
          <Text class="text-[22px] font-semibold tabular-nums text-success">
            {18 + recoveryResolved()}
          </Text>
          <Text class="text-[12px] text-muted-foreground">Resolved by an outcome</Text>
        </Card>
        <Card class="gap-2 p-3.5">
          <View class="flex-row items-center justify-between">
            <Text class="text-[12px] text-muted-foreground">Value at risk</Text>
            <Icon name="briefcase" size={12} tone="chart-1" />
          </View>
          <Text class="text-[22px] font-semibold tabular-nums text-foreground">
            {moneyText("$1.4M")}
          </Text>
          <Text class="text-[12px] text-muted-foreground">Open opportunity value</Text>
        </Card>
      </View>
    </If>
  );
}

function RecoveryQueue() {
  const ready = useAfter(260);

  return (
    <Card class="min-w-0 flex-1 overflow-hidden">
      <View class="flex-row items-center gap-2 border-b border-border px-4 py-3">
        <Text class="text-[14px] font-semibold text-foreground">Intervention queue</Text>
        <View class="flex-row items-center gap-1 rounded-md bg-muted p-1">
          <Each of={["all", "urgent", "unassigned"] as const}>
            {(item: () => "all" | "urgent" | "unassigned") => (
              <View
                role="button"
                accessibilityLabel={`Filter ${item()} recovery signals`}
                onPress={() => recoveryFilter.set(item())}
                class="h-6 items-center justify-center rounded px-2"
                style={{
                  backgroundColor: activeFilter() === item() ? token("card") : "transparent",
                }}
              >
                <Text
                  class="text-[12px] font-medium capitalize"
                  style={{
                    color:
                      activeFilter() === item() ? token("foreground") : token("muted-foreground"),
                  }}
                >
                  {item()}
                </Text>
              </View>
            )}
          </Each>
        </View>
        <View class="flex-1" />
        <Text class="text-[12px] tabular-nums text-muted-foreground">
          {visibleSignals().length} signals
        </Text>
      </View>
      <View class="flex-row items-center gap-3 border-b border-border bg-panel-strong px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <Text class="w-16">Severity</Text>
        <Text class="flex-1">Signal</Text>
        <Text class="w-28">Owner</Text>
        <Text class="w-12 text-right">Age</Text>
        <Text class="w-14 text-right">Value</Text>
        <View class="w-12" />
      </View>
      <If
        when={ready()}
        else={
          <View class="gap-2 p-3">
            <Skeleton class="h-12" />
            <Skeleton class="h-12" />
            <Skeleton class="h-12" />
            <Skeleton class="h-12" />
          </View>
        }
      >
        <Each of={visibleSignals()}>
          {(signal: () => RecoverySignal) => (
            <View
              role="button"
              accessibilityLabel={`Open signal ${signal().title}`}
              onPress={() => recoveryDetail.set(signal())}
              class="flex-row items-center gap-3 border-b border-border px-4 py-3 transition-colors last:border-b-0"
              hoverStyle={{ backgroundColor: token("accent") }}
            >
              <View class="w-16">
                <Badge variant={severityStyles[signal().severity].variant}>
                  <Text
                    class="text-[11px] font-semibold"
                    style={{ color: token(severityStyles[signal().severity].color as never) }}
                  >
                    {severityStyles[signal().severity].label}
                  </Text>
                </Badge>
              </View>
              <View class="min-w-0 flex-1 flex-row items-center gap-2.5">
                <View
                  class="h-7 w-7 items-center justify-center rounded-md"
                  style={{ backgroundColor: withAlpha(token(signal().tone), "1f") }}
                >
                  <Icon name={signal().icon} size={12} tone={signal().tone} />
                </View>
                <View class="min-w-0 gap-0.5">
                  <Text
                    class="text-[12px] font-medium leading-4 text-foreground"
                    style={{ numberOfLines: 2 }}
                  >
                    {signal().title}
                  </Text>
                  <Text class="text-[11px] text-muted-foreground" style={{ numberOfLines: 2 }}>
                    {signal().entity} · {signal().rule}
                  </Text>
                </View>
              </View>
              <Text class="w-28 text-[11px] text-muted-foreground">{signal().owner}</Text>
              <Text class="w-12 text-right text-[11px] tabular-nums text-muted-foreground">
                {signal().age}
              </Text>
              <Text class="w-14 text-right text-[11px] font-medium tabular-nums text-foreground">
                {moneyText(signal().value).replace(currencySymbol(), "")}
              </Text>
              <View class="w-12 items-end">
                <Icon name="chevronRight" size={11} tone="muted-foreground" />
              </View>
            </View>
          )}
        </Each>
        <If when={visibleSignals().length === 0}>
          <View class="items-center gap-1 py-12">
            <Text class="text-[12px] font-medium text-success">Queue clear</Text>
            <Text class="text-[12px] text-muted-foreground">
              Every signal has a documented outcome.
            </Text>
          </View>
        </If>
      </If>
    </Card>
  );
}

function RecoverySide() {
  const ready = useAfter(360);
  return (
    <View class="w-72 shrink-0 gap-3">
      <If
        when={ready()}
        else={
          <>
            <Skeleton class="h-48 rounded-xl" />
            <Skeleton class="h-48 rounded-xl" />
          </>
        }
      >
        <Card class="gap-3 p-4">
          <SectionTitle
            action={
              <Badge variant="success">
                <Text class="text-[11px] font-medium text-success">Deterministic</Text>
              </Badge>
            }
          >
            Recovery playbook
          </SectionTitle>
          <Step number="1" text="Acknowledge the signal and read the evidence." />
          <Step number="2" text="Reply, reassign, or create a documented follow-up." />
          <Step
            number="3"
            text="Resolve only when the customer replies or the opportunity advances."
          />
          <View class="rounded-md bg-muted px-2.5 py-2">
            <Text class="text-[11px] leading-3.75 text-muted-foreground">
              Dismissal without action is not a recovery. It is recorded and audited.
            </Text>
          </View>
        </Card>
        <Card class="gap-3 p-4">
          <SectionTitle>Recovered this week</SectionTitle>
          <Each of={recoveredThisWeek}>
            {(item: () => (typeof recoveredThisWeek)[number]) => (
              <View class="flex-row items-start gap-2.5 border-t border-border pt-2.5 first:border-t-0 first:pt-0">
                <View class="mt-1 h-1.5 w-1.5 rounded-full bg-success" />
                <View class="min-w-0 flex-1 gap-0.5">
                  <Text class="text-[12px] font-medium text-foreground">{item().title}</Text>
                  <Text class="text-[11px] text-muted-foreground">{item().detail}</Text>
                </View>
                <Text class="text-[11px] text-muted-foreground">{item().time}</Text>
              </View>
            )}
          </Each>
        </Card>
        <Card
          class="gap-2 p-4"
          style={{
            backgroundImage: `linear-gradient(145deg, ${withAlpha(token("success"), "16")}, transparent 80%)`,
          }}
        >
          <Text class="text-[11px] uppercase tracking-wider text-muted-foreground">
            Outcome impact
          </Text>
          <Text class="text-[20px] font-semibold tabular-nums text-success">
            {moneyText("$680K")}
          </Text>
          <Text class="text-[12px] leading-4 text-muted-foreground">
            Recovered pipeline this month. Measured by resolution outcome — not messages sent.
          </Text>
        </Card>
      </If>
    </View>
  );
}

function Step(props: { number: string; text: string }) {
  return (
    <View class="flex-row items-start gap-2.5">
      <View class="h-5 w-5 items-center justify-center rounded-full bg-accent">
        <Text class="text-[11px] font-semibold text-highlight">{props.number}</Text>
      </View>
      <Text class="flex-1 text-[11px] leading-3.5 text-muted-foreground">{props.text}</Text>
    </View>
  );
}

export function RecoveryScreen() {
  return (
    <>
      <PageShell
        title="Follow-ups"
        description="Deterministic signals that need a real outcome — not more activity."
        testID="screen-recovery"
      >
        <RecoveryMetrics />
        <View class="flex-row gap-3">
          <RecoveryQueue />
          <RecoverySide />
        </View>
      </PageShell>
      <RecoveryDialog />
    </>
  );
}
