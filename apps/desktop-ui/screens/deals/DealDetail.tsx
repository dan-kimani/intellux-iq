import { signal, Text, token, View } from "nsh";
import { AppDialog, DialogActions, FormRow, ModalNotice } from "../../components/overlay";
import { ActivityDialog } from "../../components/ActivityDialog";
import { Badge, Button, Icon, SectionTitle, StageDot, withAlpha } from "../../components/ui";
import { activeNav, showToast } from "../../state";
import { dealStages, type Deal } from "./data";
import { advanceDealRow, dealDetail, dealRows, stageLabel } from "./state";
import { addDealActivity, dealActivities, type ActivityEntry } from "../activity";

const closeDeal = () => dealDetail.set(null);

function advance(deal: Deal) {
  const moved = advanceDealRow(deal.id);
  closeDeal();
  if (moved) showToast(`${moved.id} moved to ${stageLabel(moved.stage)}.`);
}

function Metric(props: { label: string; value: string; tone: string }) {
  return (
    <View class="flex-1 gap-0.5 rounded-lg border border-border bg-panel p-2.5">
      <Text class="text-[8.5px] uppercase tracking-wide text-muted-foreground">{props.label}</Text>
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
  const activityOpen = signal(false);
  const activity = () => dealActivities()[deal.id] ?? [];
  return (
    <AppDialog
      open={() => true}
      onClose={closeDeal}
      title={deal.name}
      description={`${deal.company} · ${deal.id}`}
      width={600}
      testID="deal-dialog"
      footer={
        <DialogActions>
          <Button
            variant="ghost"
            size="sm"
            onPress={() => {
              closeDeal();
              activeNav.set("Inbox");
            }}
          >
            <Icon name="messageCircle" size={11} tone="muted-foreground" />
            <Text class="text-[10px] font-medium">Message</Text>
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
            <Text class="text-[10px] font-medium">Open quote</Text>
          </Button>
          <Button variant="primary" size="sm" onPress={() => advance(deal)}>
            <Icon name="arrowUpRight" size={11} tone="primary-foreground" />
            <Text class="text-[10px] font-semibold text-primary-foreground">Advance stage</Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-4">
        <View class="flex-row items-center gap-3 rounded-3xl border border-border bg-card shadow-md p-3">
          <StageDot
            color={deal.stage === "won" ? "green" : deal.stage === "quotation" ? "amber" : "blue"}
          />
          <View class="min-w-0 flex-1 gap-0.5">
            <Text class="text-[9px] uppercase tracking-wide text-muted-foreground">
              Current stage
            </Text>
            <Text class="text-[12px] font-semibold capitalize text-foreground">{deal.stage}</Text>
          </View>
          <View class="items-end gap-0.5">
            <Text class="text-[9px] text-muted-foreground">Owner</Text>
            <Text class="text-[10.5px] font-medium text-foreground">{deal.owner}</Text>
          </View>
          <Badge variant={deal.stage === "won" ? "success" : "primary"}>
            <Text
              class="text-[8.5px] font-medium"
              style={{ color: token(deal.stage === "won" ? "success" : "accent-foreground") }}
            >
              {deal.probability}%
            </Text>
          </Badge>
        </View>

        <View class="flex-row gap-2">
          <Metric label="Value" value={deal.value} tone="chart-3" />
          <Metric label="Probability" value={`${deal.probability}%`} tone="chart-1" />
          <Metric label="Expected close" value={deal.expectedClose} tone="chart-2" />
          <Metric label="Last activity" value={deal.lastActivity} tone="chart-4" />
        </View>

        <View class="gap-2 rounded-3xl border border-border bg-card shadow-md p-3">
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
                      style={{ backgroundColor: active() ? token(stage().tone) : token("muted") }}
                    />
                    <Text
                      class="text-[8px] text-center"
                      style={{ color: active() ? token("foreground") : token("muted-foreground") }}
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
          <View class="gap-2 rounded-3xl border border-border bg-card shadow-md p-3">
            <SectionTitle>Contact</SectionTitle>
            <FormRow>
              <Text class="text-[11px] font-medium text-foreground">{deal.contact}</Text>
              <Text class="text-[9px] text-muted-foreground">
                {deal.email} · {deal.phone}
              </Text>
            </FormRow>
          </View>
          <View class="gap-2 rounded-3xl border border-border bg-card shadow-md p-3">
            <SectionTitle>Quote</SectionTitle>
            <FormRow>
              <Text class="text-[11px] font-medium text-foreground">{deal.quoteId}</Text>
              <Text class="text-[9px] text-muted-foreground">
                {deal.quoteId === "—" ? "No quote issued yet" : "Linked to this opportunity"}
              </Text>
            </FormRow>
          </View>
        </View>

        <View class="gap-2 rounded-3xl border border-border bg-card shadow-md p-3">
          <SectionTitle
            action={
              <Button variant="ghost" size="sm" onPress={() => activityOpen.set(true)}>
                <Icon name="plus" size={10} tone="muted-foreground" />
                <Text class="text-[8.5px] font-medium">Log</Text>
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
            <Text class="flex-1 text-[10px] font-medium text-foreground">{deal.nextStep}</Text>
            <Text class="text-[9px] text-muted-foreground">Due this week</Text>
          </View>
          <Text class="text-[9.5px] leading-3.75 text-muted-foreground">{deal.notes}</Text>
        </View>

        <If when={activity().length > 0}>
          <View class="gap-2 rounded-3xl border border-border bg-card shadow-md p-3">
            <SectionTitle>Activity</SectionTitle>
            <Each of={activity()}>
              {(entry: () => ActivityEntry) => (
                <View class="flex-row items-start gap-2 border-t border-border pt-2 first:border-t-0 first:pt-0">
                  <View
                    class="mt-1 h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: token(entry().kind === "task" ? "warning" : "info") }}
                  />
                  <View class="min-w-0 flex-1 gap-0.5">
                    <Text class="text-[9.5px] text-foreground">{entry().text}</Text>
                    <Text class="text-[8px] text-muted-foreground">
                      {entry().kind === "task" ? "Task" : "Note"} · {entry().meta} · {entry().at}
                    </Text>
                  </View>
                </View>
              )}
            </Each>
          </View>
        </If>
        <View class="gap-2 rounded-3xl border border-border bg-card shadow-md p-3">
          <SectionTitle>Product</SectionTitle>
          <View class="flex-row items-center justify-between">
            <View class="gap-0.5">
              <Text class="text-[10.5px] font-medium text-foreground">{deal.product}</Text>
              <Text class="text-[9px] text-muted-foreground">
                Catalog-linked · quantity and price preserved
              </Text>
            </View>
            <Text class="text-[12px] font-semibold text-foreground">{deal.value}</Text>
          </View>
        </View>

        <If when={activityOpen()}>
          <ActivityDialog
            title="Log activity"
            description={`Internal note or task for ${deal.id}`}
            onClose={() => activityOpen.set(false)}
            onSave={(entry) =>
              addDealActivity(deal.id, { id: `a${Date.now()}`, ...entry, at: "Just now" })
            }
          />
        </If>
        <ModalNotice
          title="Opportunities own the commercial state"
          detail="Stage, value, products, and quotes stay on this opportunity. Conversations only carry messages and channel identity."
        />
      </View>
    </AppDialog>
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
