import { signal, Text, token, View } from "nsh";
import { AppDialog, DialogActions, FormGrid, FormRow, ModalNotice } from "../../components/overlay";
import { ChoiceCards, SelectField, TextField } from "../../components/forms";
import { Avatar, Badge, Button, Icon, SectionTitle } from "../../components/ui";
import { showToast } from "../../state";
import { accessRows } from "./data";
import type { CurrencyCode } from "../../lib/money";
import {
  accessSettingsOpen,
  setCurrency,
  thresholds,
  thresholdsEditOpen,
  workspace,
  workspaceEditOpen,
} from "./state";

const closeWorkspace = () => workspaceEditOpen.set(false);
const closeAccess = () => accessSettingsOpen.set(false);
const closeThresholds = () => thresholdsEditOpen.set(false);

function WorkspaceForm() {
  const name = signal(workspace().name);
  const currency = signal(workspace().currency);
  const timezone = signal(workspace().timezone);
  const digest = signal(workspace().digest ? "Outcome digest" : "Off");
  return (
    <AppDialog
      open={() => true}
      onClose={closeWorkspace}
      title="Edit workspace"
      description="These values drive quotes, reports, and business hours."
      width={520}
      testID="workspace-settings-dialog"
      footer={
        <DialogActions>
          <Button variant="ghost" size="sm" onPress={closeWorkspace}>
            <Text class="text-[12px] font-medium">Cancel</Text>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onPress={() => {
              setCurrency(currency() as CurrencyCode);
              workspace.set({
                ...workspace(),
                name: name(),
                timezone: timezone(),
              });
              closeWorkspace();
              showToast("Workspace settings saved.");
            }}
            testID="save-workspace-settings"
          >
            <Icon name="check" size={11} tone="primary-foreground" />
            <Text class="text-[12px] font-semibold text-primary-foreground">Save changes</Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-4">
        <TextField label="Workspace name" value={name} onChange={name.set} />
        <FormGrid>
          <SelectField
            label="Base currency"
            value={currency}
            options={["USD", "EUR", "GBP", "KES"]}
            onChange={(value) => currency.set(value as CurrencyCode)}
            testID="currency-select"
          />
          <SelectField
            label="Timezone"
            value={timezone}
            options={["America/New_York", "Europe/London", "Asia/Singapore", "UTC"]}
            onChange={timezone.set}
          />
        </FormGrid>
        <ChoiceCards
          value={digest}
          options={[
            {
              value: "Outcome digest",
              title: "Weekly outcome digest",
              detail: "Send Monday at 08:00 with revenue, accepted quotes, and recovered leads.",
            },
            { value: "Off", title: "Off", detail: "Only inbox notifications until re-enabled." },
          ]}
          onChange={digest.set}
        />
        <ModalNotice
          title="Shared through the cloud"
          detail="Prototype: saved locally. Base currency will come from cloud console org policy."
        />
      </View>
    </AppDialog>
  );
}

function AccessForm() {
  const invite = signal("");
  const inviteRole = signal("Sales");
  return (
    <AppDialog
      open={() => true}
      onClose={closeAccess}
      title="Manage access"
      description="Members, roles, and linked devices for this workspace."
      width={560}
      testID="access-settings-dialog"
      footer={
        <DialogActions>
          <Button variant="ghost" size="sm" onPress={closeAccess}>
            <Text class="text-[12px] font-medium">Close</Text>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onPress={() => {
              closeAccess();
              showToast("Invite queued through the cloud.");
            }}
            testID="send-invite"
          >
            <Icon name="send" size={11} tone="primary-foreground" />
            <Text class="text-[12px] font-semibold text-primary-foreground">Send invite</Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-4">
        <View class="gap-2 rounded-xl border border-border bg-card shadow-md p-3">
          <SectionTitle>Workspace members</SectionTitle>
          <Each of={accessRows}>
            {(member: () => (typeof accessRows)[number]) => (
              <View class="flex-row items-center gap-2.5 border-t border-border pt-2.5 first:border-t-0 first:pt-0">
                <Avatar name={member().name} size={26} />
                <View class="min-w-0 flex-1 gap-0.5">
                  <Text class="text-[12px] font-medium text-foreground">{member().name}</Text>
                  <Text class="text-[11px] text-muted-foreground">
                    {member().role} · {member().devices} device(s)
                  </Text>
                </View>
                <Badge variant={member().role === "Sales Manager" ? "primary" : "outline"}>
                  <Text
                    class="text-[11px] font-medium"
                    style={{
                      color:
                        member().role === "Sales Manager"
                          ? token("accent-foreground")
                          : token("muted-foreground"),
                    }}
                  >
                    {member().role === "Sales Manager" ? "Manager" : "Sales"}
                  </Text>
                </Badge>
              </View>
            )}
          </Each>
        </View>
        <TextField
          label="Invite teammate"
          value={invite}
          onChange={invite.set}
          placeholder="teammate@company.com"
          hint="Owner or admin"
        />
        <FormRow>
          <ChoiceCards
            value={inviteRole}
            options={[
              {
                value: "Sales",
                title: "Sales",
                detail:
                  "Read all CRM data; write messages in assigned conversations and owned opportunities.",
              },
              {
                value: "Manager",
                title: "Manager",
                detail: "Manage assignments, opportunities, and team outcomes.",
              },
            ]}
            onChange={inviteRole.set}
          />
        </FormRow>
        <ModalNotice
          icon="shieldCheck"
          title="Tenant-scoped access"
          detail="Memberships connect users to one org. Roles do not bypass conversation assignment or opportunity ownership."
        />
      </View>
    </AppDialog>
  );
}

function ThresholdsForm() {
  const sla = signal(thresholds().responseSla);
  const silent = signal(thresholds().silentCustomer);
  const inactive = signal(thresholds().opportunityInactivity);
  return (
    <AppDialog
      open={() => true}
      onClose={closeThresholds}
      title="Intelligence thresholds"
      description="Deterministic rules that turn events into a next step."
      width={520}
      testID="thresholds-settings-dialog"
      footer={
        <DialogActions>
          <Button variant="ghost" size="sm" onPress={closeThresholds}>
            <Text class="text-[12px] font-medium">Cancel</Text>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onPress={() => {
              thresholds.set({
                responseSla: sla(),
                silentCustomer: silent(),
                opportunityInactivity: inactive(),
              });
              closeThresholds();
              showToast("Thresholds saved.");
            }}
            testID="save-thresholds"
          >
            <Icon name="check" size={11} tone="primary-foreground" />
            <Text class="text-[12px] font-semibold text-primary-foreground">Save thresholds</Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-4">
        <SelectField
          label="Unanswered lead"
          value={sla}
          options={["15 minutes", "30 minutes", "1 hour", "4 hours"]}
          onChange={sla.set}
        />
        <SelectField
          label="Silent customer"
          value={silent}
          options={["1 business day", "3 business days", "7 days"]}
          onChange={silent.set}
        />
        <SelectField
          label="Opportunity inactivity"
          value={inactive}
          options={["3 days", "7 days", "14 days"]}
          onChange={inactive.set}
        />
        <ModalNotice
          icon="zap"
          title="Explainable at every step"
          detail="Signals are computed from conversation and opportunity events. No AI model is on the core path."
        />
      </View>
    </AppDialog>
  );
}

export function SettingsDialogs() {
  return (
    <>
      <If when={workspaceEditOpen()}>
        <WorkspaceForm />
      </If>
      <If when={accessSettingsOpen()}>
        <AccessForm />
      </If>
      <If when={thresholdsEditOpen()}>
        <ThresholdsForm />
      </If>
    </>
  );
}
