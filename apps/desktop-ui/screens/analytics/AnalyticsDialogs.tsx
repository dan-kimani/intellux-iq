import { moneyText } from "../../lib/money";
import { signal, Text, token, View } from "nsh";
import { AppDialog, DialogActions, FormGrid, ModalNotice } from "../../components/overlay";
import { ChoiceCards, SelectField, TextField } from "../../components/forms";
import { Avatar, Badge, Button, Icon, SectionTitle } from "../../components/ui";
import { showToast } from "../../state";
import { analyticsPeriod, team, recentActivity } from "./data";
import {
  analyticsActivityOpen,
  analyticsExportOpen,
  analyticsInsightOpen,
  analyticsTeamOpen,
} from "./state";
import { Stat } from "./Stat";

const closeTeam = () => analyticsTeamOpen.set(false);
const closeActivity = () => analyticsActivityOpen.set(false);
const closeInsight = () => analyticsInsightOpen.set(false);
const closeExport = () => analyticsExportOpen.set(false);

function TeamDialog() {
  return (
    <AppDialog
      open={() => true}
      onClose={closeTeam}
      title="Team outcomes"
      description="Commercial results for the selected period."
      width={620}
      testID="team-detail-dialog"
      footer={
        <DialogActions>
          <Button variant="outline" size="sm" onPress={closeTeam}>
            <Text class="text-[12px] font-medium">Close</Text>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onPress={() => {
              closeTeam();
              showToast("Team report exported.");
            }}
          >
            <Icon name="download" size={11} tone="primary-foreground" />
            <Text class="text-[12px] font-semibold text-primary-foreground">
              Export team report
            </Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-3">
        <View class="flex-row gap-2">
          <Stat label="Revenue won" value={moneyText("$1.28M")} />
          <Stat label="Deals won" value="347" />
          <Stat label="Conversion" value="11.2%" />
        </View>
        <View class="gap-0.5 rounded-xl border border-border bg-card shadow-md p-3">
          <View class="flex-row items-center gap-2 border-b border-border pb-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
            <Text class="flex-1">Sales rep</Text>
            <Text class="w-16 text-right">Conv.</Text>
            <Text class="w-14 text-right">Won</Text>
            <Text class="w-20 text-right">Attainment</Text>
          </View>
          <Each of={team}>
            {(member: () => (typeof team)[number]) => (
              <View class="flex-row items-center gap-2 border-b border-border py-2 last:border-b-0">
                <View class="min-w-0 flex-1 flex-row items-center gap-2">
                  <Avatar name={member().name} size={22} />
                  <Text class="text-[11px] font-medium text-foreground">{member().name}</Text>
                </View>
                <Text class="w-16 text-right text-[11px] text-muted-foreground">
                  {member().conversations}
                </Text>
                <Text class="w-14 text-right text-[11px] font-medium text-foreground">
                  {member().deals}
                </Text>
                <View class="w-20 items-end">
                  <Badge variant={member().conversion >= 12 ? "success" : "outline"}>
                    <Text
                      class="text-[11px] font-medium"
                      style={{
                        color: token(member().conversion >= 12 ? "success" : "muted-foreground"),
                      }}
                    >
                      {Math.round((member().conversion / 15) * 100)}%
                    </Text>
                  </Badge>
                </View>
              </View>
            )}
          </Each>
        </View>
        <ModalNotice
          title="Outcomes, not activity"
          detail="Revenue won, accepted quotes, and cycle time decide performance. Message counts are diagnostics only."
        />
      </View>
    </AppDialog>
  );
}

function ActivityDialog() {
  return (
    <AppDialog
      open={() => true}
      onClose={closeActivity}
      title="Activity log"
      description="Deterministic events across conversations, quotes, and opportunities."
      width={580}
      testID="activity-log-dialog"
      footer={
        <DialogActions>
          <Button variant="outline" size="sm" onPress={closeActivity}>
            <Text class="text-[12px] font-medium">Close</Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-0.5 rounded-xl border border-border bg-card shadow-md p-3">
        <Each of={recentActivity}>
          {(item: () => (typeof recentActivity)[number]) => (
            <View class="flex-row items-start gap-2.5 border-b border-border py-2.5 last:border-b-0">
              <View class="mt-0.5 h-6 w-6 items-center justify-center rounded-md bg-muted">
                <Icon name={item().icon} size={11} tone={item().tone} />
              </View>
              <View class="min-w-0 flex-1 gap-0.5">
                <Text class="text-[12px] font-medium text-foreground">{item().title}</Text>
                <Text class="text-[11px] text-muted-foreground">{item().meta}</Text>
              </View>
              <Icon name="chevronRight" size={10} tone="muted-foreground" />
            </View>
          )}
        </Each>
      </View>
    </AppDialog>
  );
}

function InsightDialog() {
  return (
    <AppDialog
      open={() => true}
      onClose={closeInsight}
      title="Conversion insight"
      description="Explainable signal · deterministic rule"
      width={500}
      testID="insight-detail-dialog"
      footer={
        <DialogActions>
          <Button variant="ghost" size="sm" onPress={closeInsight}>
            <Text class="text-[12px] font-medium">Dismiss</Text>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onPress={() => {
              closeInsight();
              showToast("Follow-up task created from insight.");
            }}
          >
            <Icon name="check" size={11} tone="primary-foreground" />
            <Text class="text-[12px] font-semibold text-primary-foreground">Create follow-up</Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-4">
        <View class="flex-row items-center gap-3 rounded-xl border border-border bg-card shadow-md p-3">
          <View class="h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
            <Icon name="sparkles" size={17} tone="warning" />
          </View>
          <View class="gap-0.5">
            <Text class="text-[13px] font-semibold text-foreground">
              +1.1% conversion this month
            </Text>
            <Text class="text-[11px] text-muted-foreground">
              Compared with the previous 30-day window
            </Text>
          </View>
        </View>
        <View class="gap-2">
          <SectionTitle>Why this fired</SectionTitle>
          <Text class="text-[12px] leading-4 text-muted-foreground">
            Accepted quotes rose faster than issued quotes, and recovered leads converted at 2.4×
            the baseline. The rule is deterministic: accepted ÷ issued, compared with the prior
            period.
          </Text>
        </View>
        <View class="grid grid-cols-2 gap-2">
          <Stat label="Accepted quotes" value="7" />
          <Stat label="Issued quotes" value="12" />
          <Stat label="Recovered leads" value="9" />
          <Stat label="Recovered conversion" value="22%" />
        </View>
        <ModalNotice
          icon="zap"
          title="No model on the core path"
          detail="The insight explains the data; the team decides the action."
        />
      </View>
    </AppDialog>
  );
}

function ExportDialog() {
  const range = signal(analyticsPeriod() === "30D" ? "Last 30 days" : "Custom range");
  const format = signal("PDF");
  const reportType = signal("Full outcome report");
  return (
    <AppDialog
      open={() => true}
      onClose={closeExport}
      title="Export report"
      description="Share an outcome report with the team."
      width={500}
      testID="export-report-dialog"
      footer={
        <DialogActions>
          <Button variant="ghost" size="sm" onPress={closeExport}>
            <Text class="text-[12px] font-medium">Cancel</Text>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onPress={() => {
              closeExport();
              showToast(`${format()} ${reportType().toLowerCase()} generated.`);
            }}
            testID="generate-report"
          >
            <Icon name="download" size={11} tone="primary-foreground" />
            <Text class="text-[12px] font-semibold text-primary-foreground">Generate report</Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-4">
        <FormGrid>
          <SelectField
            label="Range"
            value={range}
            options={["Last 7 days", "Last 30 days", "Last 90 days", "Custom range"]}
            onChange={range.set}
          />
          <SelectField
            label="Format"
            value={format}
            options={["PDF", "CSV", "PNG"]}
            onChange={format.set}
          />
        </FormGrid>
        <TextField
          label="Report name"
          value={() => "sales-outcomes-november"}
          onChange={() => undefined}
          hint="Prototype name"
        />
        <ChoiceCards
          value={() => "Full outcome report"}
          options={[
            {
              value: "Full outcome report",
              title: "Full outcome report",
              detail: "KPIs, trend, pipeline, team, products, and insights.",
            },
            {
              value: "Executive summary",
              title: "Executive summary",
              detail: "One page of outcomes for the leadership review.",
            },
          ]}
          onChange={() => undefined}
        />
        <ModalNotice
          title="Business value, not activity"
          detail="Reports lead with revenue, accepted quotes, cycle time, and recovered leads."
        />
      </View>
    </AppDialog>
  );
}

export function AnalyticsDialogs() {
  return (
    <>
      <If when={analyticsTeamOpen()}>
        <TeamDialog />
      </If>
      <If when={analyticsActivityOpen()}>
        <ActivityDialog />
      </If>
      <If when={analyticsInsightOpen()}>
        <InsightDialog />
      </If>
      <If when={analyticsExportOpen()}>
        <ExportDialog />
      </If>
    </>
  );
}
