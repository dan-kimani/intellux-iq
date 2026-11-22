import { signal, Text, token, View } from "nsh";
import { AppDialog, DialogActions, FormGrid, ModalNotice } from "../../components/overlay";
import { ChoiceCards, SelectField, TextField } from "../../components/forms";
import { Badge, Button, Icon } from "../../components/ui";
import { showToast } from "../../state";
import type { AutomationRule } from "./data";
import { recentRuns } from "./data";
import { automationRows, newRuleOpen, runLogOpen } from "./state";

const closeNew = () => newRuleOpen.set(false);
const closeLog = () => runLogOpen.set(false);

function NewRuleForm() {
  const title = signal("");
  const trigger = signal("No reply for 30 min");
  const action = signal("Reassign + notify manager");
  const description = signal("");
  const category = signal("Lead recovery");
  const save = () => {
    if (!title().trim()) {
      showToast("Rule name is required.");
      return;
    }
    const row: AutomationRule = {
      id: `r${Date.now()}`,
      title: title().trim(),
      description: description().trim() || "Deterministic desktop rule.",
      trigger: trigger(),
      action: action(),
      runs: "0 this month",
      tone: "chart-2",
      enabled: true,
      lastRun: "Never",
      successRate: "—",
      category: category(),
    };
    automationRows.set([...automationRows(), row]);
    closeNew();
    showToast(`${row.title} is active.`);
  };
  return (
    <AppDialog
      open={() => true}
      onClose={closeNew}
      title="New automation"
      description="Create a deterministic rule with an explainable trigger and action."
      width={560}
      testID="new-rule-dialog"
      footer={
        <DialogActions>
          <Button variant="ghost" size="sm" onPress={closeNew}>
            <Text class="text-[12px] font-medium">Cancel</Text>
          </Button>
          <Button variant="primary" size="sm" onPress={save} testID="create-rule">
            <Icon name="plus" size={11} tone="primary-foreground" />
            <Text class="text-[12px] font-semibold text-primary-foreground">Create rule</Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-4">
        <FormGrid>
          <TextField
            label="Rule name"
            value={title}
            onChange={title.set}
            placeholder="Unanswered lead recovery"
            testID="rule-title"
          />
          <SelectField
            label="Category"
            value={() => "Lead recovery"}
            options={["Lead recovery", "Quotes", "Pipeline", "Follow-ups"]}
            onChange={() => undefined}
          />
          <SelectField
            label="Trigger"
            value={trigger}
            options={[
              "No reply for 30 min",
              "Quote sent 3 days ago",
              "No activity for 7 days",
              "Task due now",
            ]}
            onChange={trigger.set}
          />
          <SelectField
            label="Action"
            value={action}
            options={[
              "Reassign + notify manager",
              "Create follow-up task",
              "Add intelligence signal",
              "Desktop notification",
            ]}
            onChange={action.set}
          />
        </FormGrid>
        <TextField
          label="Description"
          value={description}
          onChange={description.set}
          placeholder="What should the team understand about this rule?"
        />
        <ChoiceCards
          value={() => "Active"}
          options={[
            {
              value: "Active",
              title: "Enable immediately",
              detail: "The rule starts applying on the next matching event.",
            },
            {
              value: "Paused",
              title: "Save as paused",
              detail: "Keep the rule ready without running it.",
            },
          ]}
          onChange={() => undefined}
        />
        <ModalNotice
          title="Deterministic before AI"
          detail="Rules are explainable and testable. They never depend on a model call to decide what happens."
        />
      </View>
    </AppDialog>
  );
}

function RunLogForm() {
  const runs = [
    ...recentRuns,
    {
      name: "Quote follow-up",
      detail: "Follow-up task created for QT-2025-0042",
      time: "2h ago",
      tone: "chart-2" as const,
      status: "success",
      duration: "0.9s",
    },
    {
      name: "Follow-up due",
      detail: "Notified Leo Brandt",
      time: "3h ago",
      tone: "chart-3" as const,
      status: "success",
      duration: "0.3s",
    },
    {
      name: "Unanswered lead recovery",
      detail: "No matching event",
      time: "4h ago",
      tone: "chart-1" as const,
      status: "skipped",
      duration: "0.0s",
    },
  ];
  return (
    <AppDialog
      open={() => true}
      onClose={closeLog}
      title="Automation run log"
      description="Every run is deterministic, auditable, and scoped to the org."
      width={640}
      testID="run-log-dialog"
      footer={
        <DialogActions>
          <Button variant="outline" size="sm" onPress={closeLog}>
            <Text class="text-[12px] font-medium">Close</Text>
          </Button>
          <Button variant="primary" size="sm" onPress={() => showToast("Run log exported.")}>
            <Icon name="download" size={11} tone="primary-foreground" />
            <Text class="text-[12px] font-semibold text-primary-foreground">Export log</Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-4">
        <View class="flex-row gap-2">
          <View class="flex-1 gap-0.5 rounded-lg border border-border bg-panel p-2.5">
            <Text class="text-[11px] uppercase tracking-wider text-muted-foreground">
              Runs today
            </Text>
            <Text class="text-[16px] font-semibold tabular-nums text-foreground">42</Text>
          </View>
          <View class="flex-1 gap-0.5 rounded-lg border border-border bg-panel p-2.5">
            <Text class="text-[11px] uppercase tracking-wider text-muted-foreground">
              Success rate
            </Text>
            <Text class="text-[16px] font-semibold tabular-nums text-success">98.6%</Text>
          </View>
          <View class="flex-1 gap-0.5 rounded-lg border border-border bg-panel p-2.5">
            <Text class="text-[11px] uppercase tracking-wider text-muted-foreground">
              Time saved
            </Text>
            <Text class="text-[16px] font-semibold tabular-nums text-foreground">3.4h</Text>
          </View>
        </View>
        <View class="gap-0.5 rounded-xl border border-border bg-card shadow-md p-3">
          <View class="flex-row items-center gap-2 border-b border-border pb-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
            <Text class="flex-1">Rule / run</Text>
            <Text class="w-16 text-right">Status</Text>
            <Text class="w-14 text-right">Duration</Text>
            <Text class="w-16 text-right">When</Text>
          </View>
          <Each of={runs}>
            {(run: () => (typeof runs)[number]) => (
              <View class="flex-row items-center gap-2 border-b border-border py-2 last:border-b-0">
                <View class="min-w-0 flex-1 flex-row items-center gap-2">
                  <View
                    class="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: token(run().tone) }}
                  />
                  <View class="min-w-0 gap-0.5">
                    <Text class="text-[11px] font-medium text-foreground">{run().name}</Text>
                    <Text class="text-[11px] text-muted-foreground" style={{ numberOfLines: 1 }}>
                      {run().detail}
                    </Text>
                  </View>
                </View>
                <View class="w-16 items-end">
                  <Badge variant={run().status === "success" ? "success" : "outline"}>
                    <Text
                      class="text-[11px] font-medium"
                      style={{
                        color: token(run().status === "success" ? "success" : "muted-foreground"),
                      }}
                    >
                      {run().status}
                    </Text>
                  </Badge>
                </View>
                <Text class="w-14 text-right text-[11px] text-muted-foreground">
                  {run().duration}
                </Text>
                <Text class="w-16 text-right text-[11px] text-muted-foreground">{run().time}</Text>
              </View>
            )}
          </Each>
        </View>
        <ModalNotice
          icon="shieldCheck"
          title="Audit without noise"
          detail="A skipped run is as useful as a success: it proves the rule evaluated and did not match."
        />
      </View>
    </AppDialog>
  );
}

export function AutomationDialogs() {
  return (
    <>
      <If when={newRuleOpen()}>
        <NewRuleForm />
      </If>
      <If when={runLogOpen()}>
        <RunLogForm />
      </If>
    </>
  );
}
