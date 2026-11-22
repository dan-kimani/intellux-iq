import { Text, View } from "nsh";
import { Button, Card, Icon, StageDot } from "../components/ui";
import { SectionTabs, type SectionTabItem } from "../components/SectionTabs";
import { AnimatedSwap, useAfter } from "../components/motion";
import { SkeletonMetric } from "../components/skeletons";
import { PageActions, PageShell } from "./PageShell";
import { stageSummary } from "./deals/data";
import { moneyText } from "../lib/money";
import { DealDialogs } from "./deals/DealDialogs";
import { DealFilterMenu } from "./deals/DealFilterMenu";
import { PipelineBoard } from "./deals/PipelineBoard";

import { newDealOpen, pipelineScope, pipelineScopeCounts, type PipelineScope } from "./deals/state";

function DealMetrics() {
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
        <Each of={stageSummary}>
          {(item: () => (typeof stageSummary)[number]) => (
            <Card class="gap-2 p-3.5">
              <View class="flex-row items-center gap-2">
                <StageDot
                  color={
                    item().tone === "chart-3"
                      ? "green"
                      : item().tone === "chart-4"
                        ? "amber"
                        : item().tone === "chart-1"
                          ? "violet"
                          : "blue"
                  }
                />
                <Text class="text-[12px] text-muted-foreground">{item().label}</Text>
              </View>
              <Text class="text-[22px] font-semibold tabular-nums text-foreground">
                {moneyText(item().value)}
              </Text>
              <Text class="text-[12px] text-muted-foreground">{item().note}</Text>
            </Card>
          )}
        </Each>
      </View>
    </If>
  );
}

function pipelineTabs(): SectionTabItem[] {
  const counts = pipelineScopeCounts();
  return [
    { id: "all", label: "All Opportunities", count: counts.all },
    { id: "my", label: "My Opportunities", count: counts.my },
    { id: "team", label: "Team Opportunities", count: counts.team },
  ];
}

export function DealsScreen() {
  return (
    <>
      <PageShell
        title="Pipeline"
        description="Every opportunity by stage, owner, value, and next step."
        testID="screen-deals"
        tabs={
          <View class="flex-row items-center justify-between gap-3">
            <SectionTabs
              items={pipelineTabs()}
              value={pipelineScope()}
              onChange={(id) => pipelineScope.set(id as PipelineScope)}
              accessibilityLabel="Pipeline views"
              testPrefix="tab-pipeline"
            />
          </View>
        }
        actions={
          <PageActions>
            <DealFilterMenu />
            <Button variant="primary" size="sm" onPress={() => newDealOpen.set(true)}>
              <Icon name="plus" size={12} tone="primary-foreground" />
              <Text class="text-[12px] font-semibold text-primary-foreground">New opportunity</Text>
            </Button>
          </PageActions>
        }
      >
        <AnimatedSwap swapKey={pipelineScope()} layout="stack">
          {() => (
            <View class="gap-5">
              <DealMetrics />
              <PipelineBoard />
            </View>
          )}
        </AnimatedSwap>
      </PageShell>
      <DealDialogs />
    </>
  );
}
