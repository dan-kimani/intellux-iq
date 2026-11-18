import { Text, token, View } from "nsh";
import { AppDialog, DialogActions, ModalNotice } from "../../components/overlay";
import { Badge, Button, Icon, SectionTitle, withAlpha } from "../../components/ui";
import { activeNav, showToast } from "../../state";
import type { RecoverySignal } from "./data";
import { recoveryDetail, recoveryResolved, recoveryRows } from "./state";

const closeSignal = () => recoveryDetail.set(null);

function resolveSignal(signal: RecoverySignal, outcome: string) {
  recoveryRows.set(recoveryRows().filter((row) => row.id !== signal.id));
  recoveryResolved.set(recoveryResolved() + 1);
  closeSignal();
  showToast(`${signal.entity.split(" · ")[0]} resolved: ${outcome}.`);
}

function SignalDialog(props: { signal: RecoverySignal }) {
  const signal = props.signal;
  return (
    <AppDialog
      open={() => true}
      onClose={closeSignal}
      title={signal.title}
      description={`${signal.rule} · ${signal.entity}`}
      width={600}
      testID="recovery-dialog"
      footer={
        <DialogActions>
          <Button
            variant="ghost"
            size="sm"
            onPress={() => resolveSignal(signal, "dismissed with reason")}
          >
            <Text class="text-[10px] font-medium">Dismiss</Text>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onPress={() => {
              closeSignal();
              activeNav.set("Inbox");
              showToast("Opening the related conversation.");
            }}
          >
            <Icon name="messageCircle" size={11} tone="muted-foreground" />
            <Text class="text-[10px] font-medium">Reply</Text>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onPress={() => resolveSignal(signal, "follow-up created")}
          >
            <Icon name="calendarClock" size={11} tone="primary-foreground" />
            <Text class="text-[10px] font-semibold text-primary-foreground">Create follow-up</Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-4">
        <View class="flex-row items-center gap-3 rounded-3xl border border-border bg-card shadow-md p-3">
          <View
            class="h-9 w-9 items-center justify-center rounded-lg"
            style={{ backgroundColor: withAlpha(token(signal.tone), "20") }}
          >
            <Icon name={signal.icon} size={16} tone={signal.tone} />
          </View>
          <View class="min-w-0 flex-1 gap-0.5">
            <Text class="text-[11px] font-semibold text-foreground">{signal.entity}</Text>
            <Text class="text-[9px] text-muted-foreground">
              Owner: {signal.owner} · Age: {signal.age} · Value: {signal.value}
            </Text>
          </View>
          <Badge
            variant={
              signal.severity === "urgent"
                ? "warning"
                : signal.severity === "high"
                  ? "primary"
                  : "outline"
            }
          >
            <Text
              class="text-[8px] font-semibold capitalize"
              style={{
                color: token(
                  signal.severity === "urgent"
                    ? "warning"
                    : signal.severity === "high"
                      ? "accent-foreground"
                      : "muted-foreground",
                ),
              }}
            >
              {signal.severity}
            </Text>
          </Badge>
        </View>
        <View class="gap-2 rounded-3xl border border-border bg-card shadow-md p-3">
          <SectionTitle>Evidence</SectionTitle>
          <Each of={signal.evidence}>
            {(item: () => string) => (
              <View class="flex-row items-start gap-2">
                <View
                  class="mt-1.5 h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: token(signal.tone) }}
                />
                <Text class="flex-1 text-[9.5px] leading-3.75 text-muted-foreground">{item()}</Text>
              </View>
            )}
          </Each>
        </View>
        <View class="gap-2 rounded-3xl border border-border bg-card shadow-md p-3">
          <SectionTitle>Recommended next step</SectionTitle>
          <Text class="text-[10px] leading-4 text-foreground">{signal.recommended}</Text>
          <View class="flex-row items-center gap-2 rounded-md bg-muted px-2.5 py-1.5">
            <Icon name="sparkles" size={11} tone="highlight" />
            <Text class="text-[9px] text-muted-foreground">
              Deterministic rule · no AI dependency
            </Text>
          </View>
        </View>
        <ModalNotice
          title="Dismissal is not recovery"
          detail="Resolve the signal only when the customer replied, the opportunity advanced, or a documented follow-up completed."
        />
      </View>
    </AppDialog>
  );
}

export function RecoveryDialog() {
  return (
    <Each of={recoveryRows()}>
      {(signal: () => RecoverySignal) => (
        <If when={recoveryDetail()?.id === signal().id}>
          <SignalDialog signal={signal()} />
        </If>
      )}
    </Each>
  );
}
