import { Scroll, Text, token, View } from "nsh";
import { FormRow } from "../../components/overlay";
import { Reveal } from "../../components/motion";
import { Badge, Button, Icon, SectionTitle, StageDot, withAlpha } from "../../components/ui";
import { activeNav, showToast } from "../../state";
import { dealStages, type Deal } from "./data";
import { advanceDealRow, dealAnchor, dealDetail, dealRows, stageLabel } from "./state";
import { nextStage } from "../../domain/stages";
import { opportunityLink } from "../work/links";
import { openWorkDialog } from "../work/state";
import { WorkSection } from "../work/WorkSection";
import { DealDetailHeader } from "./DealDetailHeader";
import { DealCardBridge } from "./DealCardBridge";
import { DealDetailSeam } from "./DealDetailSeam";

const closeDeal = () => {
  dealDetail.set(null);
  dealAnchor.set(null);
};

function advance(deal: Deal) {
  const moved = advanceDealRow(deal.id);
  closeDeal();
  if (moved) showToast(`${moved.id} moved to ${stageLabel(moved.stage)}.`);
}

function Metric(props: { label: string; value: string; tone: string }) {
  return (
    <View class="flex-1 gap-0.5 rounded-lg border border-border bg-panel p-2.5">
      <Text class="text-[11px] uppercase tracking-wider text-muted-foreground">{props.label}</Text>
      <Text class="text-[14px] font-semibold text-foreground">{props.value}</Text>
      <View
        class="h-1 rounded-full"
        style={{ width: 22, backgroundColor: token(props.tone as never) }}
      />
    </View>
  );
}

function DealDetailDialog(props: { deal: Deal }) {
  const deal = props.deal;
  return (
    <View class="absolute inset-0 z-50" testID="deal-dialog">
      <View class="absolute inset-0" onPress={closeDeal} />
      <View
        class="absolute"
        style={{
          left: dealAnchor()?.left ?? 0,
          top: dealAnchor()?.top ?? 16,
          width: dealAnchor()?.width ?? 480,
          height: dealAnchor()?.height ?? 720,
        }}
      >
        <Reveal class="h-full w-full" from="bottom">
          <View class="h-full w-full">
            <View
              class="h-full flex-col overflow-hidden rounded-2xl border border-border bg-popover"
              style={{
                borderColor: token("border"),
                boxShadow:
                  dealAnchor()?.side === "right"
                    ? "32px 18px 48px rgba(0,0,0,0.45)"
                    : "-32px 18px 48px rgba(0,0,0,0.45)",
              }}
            >
              <DealDetailHeader deal={deal} onClose={closeDeal} />
              <Scroll class="min-h-0 flex-1" scrollbar={false}>
                <View class="p-5">
                  <View class="gap-4">
                    <View class="gap-3 rounded-2xl border border-border bg-card p-4 shadow-md">
                      <View class="flex-row items-start gap-3">
                        <View class="h-11 w-11 items-center justify-center rounded-full bg-muted">
                          <Text class="text-[13px] font-semibold text-foreground">
                            {deal.company
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .slice(0, 2)}
                          </Text>
                        </View>
                        <View class="min-w-0 flex-1 gap-0.5">
                          <Text class="text-[15px] font-semibold text-foreground">
                            {deal.company}
                          </Text>
                          <Text class="text-[12px] text-muted-foreground">{deal.contact}</Text>
                          <Text class="text-[11px] text-muted-foreground">
                            {deal.email} · {deal.phone}
                          </Text>
                        </View>
                        <Badge variant={deal.stage === "won" ? "success" : "primary"}>
                          <Text
                            class="text-[11px] font-medium"
                            style={{
                              color: token(deal.stage === "won" ? "success" : "accent-foreground"),
                            }}
                          >
                            {deal.probability}%
                          </Text>
                        </Badge>
                      </View>
                      <View class="flex-row items-center justify-between border-t border-border pt-2">
                        <View class="flex-row items-center gap-2">
                          <StageDot
                            color={
                              deal.stage === "won"
                                ? "green"
                                : deal.stage === "quotation"
                                  ? "amber"
                                  : "blue"
                            }
                          />
                          <Text class="text-[12px] font-semibold capitalize text-foreground">
                            {deal.stage}
                          </Text>
                          <Text class="text-[11px] text-muted-foreground">· {deal.owner}</Text>
                        </View>
                        <Text class="text-[15px] font-semibold tabular-nums text-foreground">
                          {deal.value}
                        </Text>
                      </View>
                    </View>

                    <View class="flex-row gap-2">
                      <Metric label="Value" value={deal.value} tone="chart-3" />
                      <Metric label="Probability" value={`${deal.probability}%`} tone="chart-1" />
                      <Metric label="Expected close" value={deal.expectedClose} tone="chart-2" />
                      <Metric label="Last activity" value={deal.lastActivity} tone="chart-4" />
                    </View>

                    <View class="gap-2 rounded-xl border border-border bg-card shadow-md p-3">
                      <SectionTitle>Stage path</SectionTitle>
                      <View class="flex-row items-center gap-1">
                        <Each of={dealStages}>
                          {(stage: () => (typeof dealStages)[number], index: () => number) => {
                            const active = () =>
                              dealStages.findIndex((item) => item.id === deal.stage) >= index();
                            return (
                              <View class="flex-1 items-center gap-1">
                                <View
                                  class="h-1.5 w-full rounded-full"
                                  style={{
                                    backgroundColor: active()
                                      ? token(stage().tone)
                                      : token("muted"),
                                  }}
                                />
                                <Text
                                  class="text-[11px] text-center"
                                  style={{
                                    color: active()
                                      ? token("foreground")
                                      : token("muted-foreground"),
                                  }}
                                >
                                  {stage().label}
                                </Text>
                              </View>
                            );
                          }}
                        </Each>
                      </View>
                    </View>

                    <View class="grid grid-cols-2 gap-3">
                      <View class="gap-2 rounded-xl border border-border bg-card shadow-md p-3">
                        <SectionTitle>Contact</SectionTitle>
                        <FormRow>
                          <Text class="text-[12px] font-medium text-foreground">
                            {deal.contact}
                          </Text>
                          <Text class="text-[11px] text-muted-foreground">
                            {deal.email} · {deal.phone}
                          </Text>
                        </FormRow>
                      </View>
                      <View class="gap-2 rounded-xl border border-border bg-card shadow-md p-3">
                        <SectionTitle>Quote</SectionTitle>
                        <FormRow>
                          <Text class="text-[12px] font-medium text-foreground">
                            {deal.quoteId}
                          </Text>
                          <Text class="text-[11px] text-muted-foreground">
                            {deal.quoteId === "—"
                              ? "No quote issued yet"
                              : "Linked to this opportunity"}
                          </Text>
                        </FormRow>
                      </View>
                    </View>

                    <View class="gap-2 rounded-xl border border-border bg-card shadow-md p-3">
                      <SectionTitle
                        action={
                          <Button
                            variant="ghost"
                            size="sm"
                            onPress={() =>
                              openWorkDialog({ mode: "activity", link: opportunityLink(deal) })
                            }
                          >
                            <Icon name="plus" size={10} tone="muted-foreground" />
                            <Text class="text-[11px] font-medium">Log</Text>
                          </Button>
                        }
                      >
                        Next step
                      </SectionTitle>
                      <View class="flex-row items-center gap-2.5">
                        <View
                          class="h-6 w-6 items-center justify-center rounded-md"
                          style={{ backgroundColor: withAlpha(token("warning"), "1f") }}
                        >
                          <Icon name="calendarClock" size={12} tone="warning" />
                        </View>
                        <Text class="flex-1 text-[12px] font-medium text-foreground">
                          {deal.nextStep}
                        </Text>
                        <Text class="text-[11px] text-muted-foreground">Due this week</Text>
                      </View>
                      <Text class="text-[11px] leading-3.75 text-muted-foreground">
                        {deal.notes}
                      </Text>
                    </View>

                    <WorkSection link={opportunityLink(deal)} title="Opportunity work" limit={4} />
                    <View class="gap-2 rounded-xl border border-border bg-card shadow-md p-3">
                      <SectionTitle>Product</SectionTitle>
                      <View class="flex-row items-center justify-between">
                        <View class="gap-0.5">
                          <Text class="text-[12px] font-medium text-foreground">
                            {deal.product}
                          </Text>
                          <Text class="text-[11px] text-muted-foreground">
                            Catalog-linked · quantity and price preserved
                          </Text>
                        </View>
                        <Text class="text-[13px] font-semibold text-foreground">{deal.value}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </Scroll>
              <View class="shrink-0 flex-row items-center justify-end gap-2 border-t border-border bg-panel px-5 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => {
                    closeDeal();
                    activeNav.set("Inbox");
                  }}
                >
                  <Icon name="messageCircle" size={11} tone="muted-foreground" />
                  <Text class="text-[12px] font-medium">Message</Text>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => {
                    closeDeal();
                    activeNav.set("Quotes");
                  }}
                >
                  <Icon name="fileText" size={11} tone="muted-foreground" />
                  <Text class="text-[12px] font-medium">Open quote</Text>
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!nextStage(deal.stage)}
                  onPress={() => advance(deal)}
                >
                  <Icon name="arrowUpRight" size={11} tone="primary-foreground" />
                  <Text class="text-[12px] font-semibold text-primary-foreground">
                    Advance stage
                  </Text>
                </Button>
              </View>
            </View>
          </View>
        </Reveal>
        <DealDetailSeam />
      </View>
      <DealCardBridge deal={deal} />
    </View>
  );
}

export function DealDialog() {
  return (
    <Each of={dealRows()}>
      {(deal: () => Deal) => (
        <If when={dealDetail()?.id === deal().id}>
          <DealDetailDialog deal={deal()} />
        </If>
      )}
    </Each>
  );
}
