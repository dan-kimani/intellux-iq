import type { Tokens } from "nsh";
import { Text, View } from "nsh";
import { Card, type IconName } from "../../components/ui";
import { previewQuote } from "../quotes/state";
import { quotesAtRisk, topOwner } from "./dashboard";
import { money } from "./data";
import { navTo } from "./nav";
import { CardHead, IconTile, LinkAction, TinyButton } from "./parts";
import { overdueTasks, todayTasks } from "./state";

function overdueCount(): number {
  return overdueTasks().length;
}

function dueTodayCount(): number {
  return todayTasks().length;
}

function InsightRow(props: {
  icon: IconName;
  tone: keyof Tokens;
  title: string;
  detail: string;
  actionLabel: string;
  onPress: () => void;
  testID: string;
}) {
  return (
    <View class="flex-row items-center gap-2.5 border-t border-border py-2 first:border-t-0 first:pt-0">
      <IconTile icon={props.icon} tone={props.tone} size={30} iconSize={13} />
      <View class="min-w-0 flex-1 gap-0.5">
        <Text class="text-[12px] font-semibold text-foreground">{props.title}</Text>
        <Text class="text-[11px] leading-3.5 text-muted-foreground" style={{ numberOfLines: 2 }}>
          {props.detail}
        </Text>
      </View>
      <TinyButton
        label={props.actionLabel}
        onPress={props.onPress}
        testID={props.testID}
        accessibilityLabel={`${props.title}: ${props.actionLabel}`}
      />
    </View>
  );
}

export function KeyInsights() {
  const atRisk = quotesAtRisk;
  const owner = topOwner;

  const previewFirstAtRisk = () => {
    const quote = atRisk().rows[0];
    if (quote) previewQuote(quote);
    else navTo("Quotes", "quotes");
  };

  return (
    <Card class="gap-2 p-4" testID="home-insights">
      <CardHead
        title="Key insights"
        subtitle="What needs a decision next"
        action={
          <LinkAction label="View insights" onPress={() => navTo("Analytics", "analytics")} />
        }
      />

      <View class="flex-1 justify-between">
        <InsightRow
          icon="zap"
          tone="warning"
          title="Revenue at risk"
          detail={`${atRisk().count} quotations worth ${money(atRisk().value)} are waiting on a reply.`}
          actionLabel="Review quote"
          onPress={previewFirstAtRisk}
          testID="home-insight-quotes"
        />
        <InsightRow
          icon="bell"
          tone="series-5"
          title="Follow-up alert"
          detail={`${overdueCount()} overdue follow-up${overdueCount() === 1 ? "" : "s"} and ${dueTodayCount()} due today. Clear these before the pipeline cools.`}
          actionLabel="Recovery"
          onPress={() => navTo("Recovery", "recovery")}
          testID="home-insight-follow-ups"
        />
        <InsightRow
          icon="star"
          tone="series-4"
          title="Top performer"
          detail={
            owner()
              ? `${owner()?.owner} closed ${money(owner()?.won ?? 0)} across ${owner()?.deals ?? 0} deals.`
              : "No closed-won revenue in the current period."
          }
          actionLabel="View team"
          onPress={() => navTo("Analytics", "analytics")}
          testID="home-insight-team"
        />
      </View>

      <View class="border-t border-border pt-2">
        <Text class="text-[11px] text-muted-foreground">
          Deterministic rules from quotes, follow-ups, and owned opportunities.
        </Text>
      </View>
    </Card>
  );
}
