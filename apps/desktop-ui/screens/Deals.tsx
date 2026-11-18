import { Scroll, Text, token, View } from "nsh";
import { Badge, Button, Card, Icon, StageDot } from "../components/ui";
import { SectionTabs, type SectionTabItem } from "../components/SectionTabs";
import { useAfter } from "../components/motion";
import { Skeleton, SkeletonMetric } from "../components/skeletons";
import { PageActions, PageShell } from "./PageShell";
import { dealStages, stageSummary, type Deal } from "./deals/data";
import { DealContextMenu } from "./deals/DealContextMenu";
import { DealDialog } from "./deals/DealDetail";
import { DealDialogs } from "./deals/DealDialogs";
import { DealFilterMenu } from "./deals/DealFilterMenu";
import {
  dealDetail,
  filteredDeals,
  newDealOpen,
  pipelineScope,
  pipelineScopeCounts,
  type PipelineScope,
} from "./deals/state";

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
                <Text class="text-[10.5px] text-muted-foreground">{item().label}</Text>
              </View>
              <Text class="text-[22px] font-semibold tracking-tight text-foreground">
                {item().value}
              </Text>
              <Text class="text-[10px] text-muted-foreground">{item().note}</Text>
            </Card>
          )}
        </Each>
      </View>
    </If>
  );
}

function DealCard(props: { deal: Deal }) {
  return (
    <DealContextMenu
      deal={props.deal}
      trigger={
        <View
          role="button"
          testID={`deal-${props.deal.id}`}
          accessibilityLabel={`Open ${props.deal.name}`}
          onPress={() => dealDetail.set(props.deal)}
          class="gap-2 rounded-lg border border-border bg-panel p-3 transition-colors"
          hoverStyle={{ backgroundColor: token("accent"), borderColor: token("ring") }}
          focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 2 }}
        >
          <Text class="text-[11.5px] font-medium leading-4 text-foreground">{props.deal.name}</Text>
          <Text class="text-[10px] text-muted-foreground">{props.deal.product}</Text>
          <View class="flex-row items-center justify-between gap-2 pt-1">
            <Text class="text-[11.5px] font-semibold text-foreground">{props.deal.value}</Text>
            <Text class="text-[9.5px] text-muted-foreground">{props.deal.age}</Text>
          </View>
          <View class="flex-row items-center justify-between border-t border-border pt-1.5">
            <Text class="text-[9.5px] text-muted-foreground">{props.deal.owner}</Text>
            <View class="h-4 w-4 items-center justify-center rounded-full bg-muted">
              <Text class="text-[8px] font-semibold text-muted-foreground">
                {props.deal.owner
                  .split(" ")
                  .map((p) => p[0])
                  .join("")}
              </Text>
            </View>
          </View>
        </View>
      }
    />
  );
}

function DealColumn(props: { stage: (typeof dealStages)[number] }) {
  const columnDeals = filteredDeals().filter((deal) => deal.stage === props.stage.id);
  return (
    <View class="w-48 shrink-0 gap-2">
      <View class="flex-row items-center justify-between rounded-md border border-border bg-panel-strong px-2.5 py-2">
        <View class="flex-row items-center gap-1.5">
          <StageDot
            color={
              props.stage.tone === "chart-2"
                ? "blue"
                : props.stage.tone === "chart-1"
                  ? "violet"
                  : props.stage.tone === "chart-3"
                    ? "green"
                    : "amber"
            }
          />
          <Text class="text-[11px] font-semibold text-foreground">{props.stage.label}</Text>
        </View>
        <Text class="text-[10px] text-muted-foreground">{columnDeals.length}</Text>
      </View>
      <View class="gap-2">
        <Each of={columnDeals}>{(deal: () => Deal) => <DealCard deal={deal()} />}</Each>
        <If when={columnDeals.length === 0}>
          <View class="items-center rounded-lg border border-dashed border-border py-5">
            <Text class="text-[10px] text-muted-foreground">No deals</Text>
          </View>
        </If>
      </View>
    </View>
  );
}

function DealBoard() {
  const ready = useAfter(300);
  return (
    <If
      when={ready()}
      else={
        <View class="gap-2">
          <View class="flex-row gap-3">
            <Skeleton class="h-8 w-48" />
            <Skeleton class="h-8 w-48" />
            <Skeleton class="h-8 w-48" />
            <Skeleton class="h-8 w-48" />
            <Skeleton class="h-8 w-48" />
          </View>
          <View class="flex-row gap-3">
            <Skeleton class="h-40 flex-1" />
            <Skeleton class="h-32 flex-1" />
            <Skeleton class="h-40 flex-1" />
            <Skeleton class="h-32 flex-1" />
            <Skeleton class="h-32 flex-1" />
          </View>
        </View>
      }
    >
      <Card class="gap-3 p-3">
        <View class="flex-row items-center justify-between px-1">
          <View class="flex-row items-center gap-2">
            <Icon name="briefcase" size={14} tone="muted-foreground" />
            <Text class="text-[12px] font-semibold text-foreground">Open pipeline</Text>
          </View>
          <Badge variant="outline">
            <Text class="text-[10px] text-muted-foreground">
              {filteredDeals().length} opportunities · KES 1.86M
            </Text>
          </Badge>
        </View>
        <Scroll horizontal class="min-h-0" scrollbar={false}>
          <View class="flex-row gap-3">
            <Each of={dealStages}>
              {(stage: () => (typeof dealStages)[number]) => <DealColumn stage={stage()} />}
            </Each>
          </View>
        </Scroll>
      </Card>
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
          <SectionTabs
            items={pipelineTabs()}
            value={pipelineScope()}
            onChange={(id) => pipelineScope.set(id as PipelineScope)}
            accessibilityLabel="Pipeline views"
            testPrefix="tab-pipeline"
          />
        }
        actions={
          <PageActions>
            <DealFilterMenu />
            <Button variant="primary" size="sm" onPress={() => newDealOpen.set(true)}>
              <Icon name="plus" size={12} tone="primary-foreground" />
              <Text class="text-[10px] font-semibold text-primary-foreground">New opportunity</Text>
            </Button>
          </PageActions>
        }
      >
        <DealMetrics />
        <DealBoard />
      </PageShell>
      <DealDialog />
      <DealDialogs />
    </>
  );
}
