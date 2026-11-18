import { signal, Text, View } from "nsh";
import { Badge, Button, Card, Icon, SectionTitle } from "../../components/ui";
import { SettingRow } from "./controls";
import { Toggle } from "../../components/Toggle";
import { useAfter } from "../../components/motion";
import { SkeletonPanel } from "../../components/skeletons";
import { showToast } from "../../state";

export function SecurityPanel() {
  const ready = useAfter(380);
  const autoLock = signal(true);
  const lease = signal(true);
  return (
    <If when={ready()} else={<SkeletonPanel rows={4} />}>
      <View class="gap-3">
        <Card class="gap-3 p-4">
          <SectionTitle
            action={
              <Badge variant="success">
                <Text class="text-[8px] font-medium text-success">Policy enforced</Text>
              </Badge>
            }
          >
            Security & sessions
          </SectionTitle>
          <SettingRow title="Auto-lock" detail="Idle desktop lock after 10 minutes">
            <Toggle on={autoLock} onPress={() => autoLock.set(!autoLock())} label="Auto-lock" />
          </SettingRow>
          <SettingRow title="Offline lease" detail="Reads and quotes remain available for 7 days">
            <Toggle on={lease} onPress={() => lease.set(!lease())} label="Offline lease" />
          </SettingRow>
          <SettingRow
            title="Failed unlock attempts"
            detail="Local cryptographic wipe after 3 failures"
          >
            <Text class="text-[10.5px] text-warning">3 attempts</Text>
          </SettingRow>
          <SettingRow title="Device posture" detail="OS version, disk encryption, app version">
            <Text class="text-[10.5px] font-medium text-success">Healthy</Text>
          </SettingRow>
        </Card>
        <Card class="gap-2 p-4">
          <SectionTitle>Local data boundary</SectionTitle>
          <View class="flex-row items-center gap-2.5">
            <View class="h-7 w-7 items-center justify-center rounded-md bg-accent">
              <Icon name="shieldCheck" size={13} tone="highlight" />
            </View>
            <View class="min-w-0 flex-1 gap-0.5">
              <Text class="text-[10px] font-medium text-foreground">SQLCipher cache</Text>
              <Text class="text-[9px] text-muted-foreground">
                Key stays in the OS keychain; conversations, quotes, and catalog metadata are
                encrypted at rest.
              </Text>
            </View>
          </View>
          <View class="flex-row gap-2">
            <Stat label="Cursor" value="18,442" />
            <Stat label="Lease" value="7 days" />
            <Stat label="Wipe" value="Ready" />
            <Stat label="Last check" value="2m ago" />
          </View>
          <Button
            variant="outline"
            size="sm"
            onPress={() => showToast("Security policy refreshed from the cloud.")}
          >
            <Icon name="shieldCheck" size={11} tone="muted-foreground" />
            <Text class="text-[9.5px] font-medium">Refresh policy</Text>
          </Button>
        </Card>
      </View>
    </If>
  );
}

function Stat(props: { label: string; value: string }) {
  return (
    <View class="flex-1 gap-0.5 rounded-lg border border-border bg-panel p-2">
      <Text class="text-[7.5px] uppercase tracking-wide text-muted-foreground">{props.label}</Text>
      <Text class="text-[9.5px] font-semibold text-foreground">{props.value}</Text>
    </View>
  );
}
