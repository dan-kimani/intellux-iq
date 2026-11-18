import { signal, Text, token, View } from "nsh";
import { Avatar, Badge, Button, Card, Icon, SectionTitle, withAlpha } from "../components/ui";
import { useAfter } from "../components/motion";
import { SkeletonPanel } from "../components/skeletons";
import { showToast } from "../state";
import { PageActions, PageShell } from "./PageShell";
import { accessRows, devices, settingsTabs, type SettingsTab } from "./settings/data";
import { DeviceLinkDialog } from "./settings/DeviceLinkDialog";
import { SettingsDialogs } from "./settings/SettingsDialogs";
import { SectionTabs } from "../components/SectionTabs";
import { SecurityPanel } from "./settings/SecurityPanel";
import { ShortcutsPanel } from "./settings/ShortcutsPanel";
import { SettingRow } from "./settings/controls";
import { Toggle } from "../components/Toggle";
import {
  accessSettingsOpen,
  deviceLinkOpen,
  thresholds,
  thresholdsEditOpen,
  workspace,
  workspaceEditOpen,
} from "./settings/state";

const digestEnabled = () => workspace().digest;
const setDigest = (value: boolean) => workspace.set({ ...workspace(), digest: value });

function WorkspacePanel() {
  const ready = useAfter(240);
  return (
    <If when={ready()} else={<SkeletonPanel rows={4} />}>
      <Card class="gap-3 p-4">
        <SectionTitle
          action={
            <Button variant="ghost" size="sm" onPress={() => workspaceEditOpen.set(true)}>
              <Text class="text-[9px] font-medium">Edit</Text>
              <Icon name="chevronRight" size={10} tone="muted-foreground" />
            </Button>
          }
        >
          Workspace
        </SectionTitle>
        <SettingRow title="Workspace name" detail="Shown on quotes and reports">
          <Text class="text-[10.5px] text-foreground">{workspace().name}</Text>
        </SettingRow>
        <SettingRow title="Base currency" detail="Used for quotes and reports">
          <Text class="text-[10.5px] text-foreground">{workspace().currency}</Text>
        </SettingRow>
        <SettingRow title="Default timezone" detail="Business hours and follow-ups">
          <Text class="text-[10.5px] text-foreground">{workspace().timezone}</Text>
        </SettingRow>
        <SettingRow title="Weekly outcome digest" detail="Sent Monday at 08:00">
          <Toggle
            on={digestEnabled}
            onPress={() => setDigest(!digestEnabled())}
            label="Weekly outcome digest"
          />
        </SettingRow>
      </Card>
    </If>
  );
}

function DevicesPanel() {
  const ready = useAfter(300);
  return (
    <If when={ready()} else={<SkeletonPanel rows={3} />}>
      <Card class="gap-3 p-4">
        <SectionTitle
          action={
            <Button variant="outline" size="sm" onPress={() => deviceLinkOpen.set(true)}>
              <Icon name="plus" size={11} tone="muted-foreground" />
              <Text class="text-[9px] font-medium">Link device</Text>
            </Button>
          }
        >
          Devices
        </SectionTitle>
        <Each of={devices}>
          {(device: () => (typeof devices)[number]) => (
            <View class="flex-row items-center gap-2.5 border-t border-border pt-2.5 first:border-t-0 first:pt-0">
              <View
                class="h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: withAlpha(token(device().tone), "20") }}
              >
                <Icon name="panelRight" size={14} tone={device().tone} />
              </View>
              <View class="min-w-0 flex-1 gap-0.5">
                <Text class="text-[10.5px] font-medium text-foreground">{device().name}</Text>
                <Text class="text-[9px] text-muted-foreground">{device().platform}</Text>
              </View>
              <Badge variant={device().status === "This device" ? "success" : "outline"}>
                <Text
                  class="text-[8px] font-medium"
                  style={{
                    color:
                      device().status === "This device"
                        ? token("success")
                        : token("muted-foreground"),
                  }}
                >
                  {device().status}
                </Text>
              </Badge>
            </View>
          )}
        </Each>
      </Card>
    </If>
  );
}

function AccessPanel() {
  const ready = useAfter(350);
  return (
    <If when={ready()} else={<SkeletonPanel rows={4} />}>
      <Card class="gap-3 p-4">
        <SectionTitle
          action={
            <Button variant="ghost" size="sm" onPress={() => accessSettingsOpen.set(true)}>
              <Text class="text-[9px] font-medium">Manage access</Text>
              <Icon name="chevronRight" size={10} tone="muted-foreground" />
            </Button>
          }
        >
          Access
        </SectionTitle>
        <Each of={accessRows}>
          {(member: () => (typeof accessRows)[number]) => (
            <View class="flex-row items-center gap-2.5 border-t border-border pt-2.5 first:border-t-0 first:pt-0">
              <Avatar
                initials={member()
                  .name.split(" ")
                  .map((part) => part[0])
                  .join("")}
                tone={member().tone}
                size={28}
              />
              <View class="min-w-0 flex-1 gap-0.5">
                <Text class="text-[10.5px] font-medium text-foreground">{member().name}</Text>
                <Text class="text-[9px] text-muted-foreground">{member().role}</Text>
              </View>
              <Text class="text-[9px] text-muted-foreground">
                {member().devices} {member().devices === 1 ? "device" : "devices"}
              </Text>
            </View>
          )}
        </Each>
      </Card>
    </If>
  );
}

function IntelligencePanel() {
  const ready = useAfter(400);
  const autoRecovery = signal(true);
  const setAutoRecovery = (value: boolean) => autoRecovery.set(value);
  return (
    <If when={ready()} else={<SkeletonPanel rows={3} />}>
      <Card class="gap-3 p-4">
        <SectionTitle
          action={
            <Button variant="ghost" size="sm" onPress={() => thresholdsEditOpen.set(true)}>
              <Text class="text-[9px] font-medium">Edit</Text>
              <Icon name="chevronRight" size={10} tone="muted-foreground" />
            </Button>
          }
        >
          Intelligence thresholds
        </SectionTitle>
        <SettingRow title="Unanswered lead" detail="Escalate after the response SLA">
          <Text class="text-[10.5px] text-foreground">{thresholds().responseSla}</Text>
        </SettingRow>
        <SettingRow title="Silent customer" detail="Flag when there is no reply">
          <Text class="text-[10.5px] text-foreground">{thresholds().silentCustomer}</Text>
        </SettingRow>
        <SettingRow title="Opportunity inactivity" detail="Add a pipeline signal">
          <Text class="text-[10.5px] text-foreground">{thresholds().opportunityInactivity}</Text>
        </SettingRow>
        <SettingRow title="Automatic lead recovery" detail="Reassign to the next available rep">
          <Toggle
            on={autoRecovery}
            onPress={() => setAutoRecovery(!autoRecovery())}
            label="Automatic lead recovery"
          />
        </SettingRow>
      </Card>
    </If>
  );
}

export function SettingsScreen() {
  const tab = signal<SettingsTab>("Workspace");
  return (
    <>
      <PageShell
        title="Settings"
        description="Workspace, devices, access, intelligence, shortcuts, and security policy."
        testID="screen-settings"
        tabs={
          <SectionTabs
            items={settingsTabs.map((item) => ({ id: item.toLowerCase(), label: item }))}
            value={tab().toLowerCase()}
            onChange={(id) => {
              const next = settingsTabs.find((item) => item.toLowerCase() === id);
              if (next) tab.set(next);
            }}
            accessibilityLabel="Settings sections"
            testPrefix="tab-settings"
          />
        }
        actions={
          <PageActions>
            <Button variant="outline" size="sm" onPress={() => showToast("Changes saved locally.")}>
              <Icon name="check" size={12} tone="success" />
              <Text class="text-[10px] font-medium">Save changes</Text>
            </Button>
          </PageActions>
        }
      >
        <View class="max-w-5xl gap-3">
          <If when={tab() === "Workspace"}>
            <WorkspacePanel />
          </If>
          <If when={tab() === "Devices"}>
            <DevicesPanel />
          </If>
          <If when={tab() === "Access"}>
            <AccessPanel />
          </If>
          <If when={tab() === "Intelligence"}>
            <IntelligencePanel />
          </If>
          <If when={tab() === "Shortcuts"}>
            <ShortcutsPanel />
          </If>
          <If when={tab() === "Security"}>
            <SecurityPanel />
          </If>
          <Card class="gap-2 p-3.5">
            <Text class="text-[9.5px] leading-3.5 text-muted-foreground">
              Workspace settings sync through the cloud. Keyboard shortcuts stay on this device.
            </Text>
          </Card>
        </View>
      </PageShell>
      <If when={deviceLinkOpen()}>
        <DeviceLinkDialog />
      </If>
      <SettingsDialogs />
    </>
  );
}
