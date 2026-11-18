import { Text, token, View } from "nsh";
import { AppDialog, DialogActions, ModalNotice } from "./overlay";
import { Badge, Button, Icon, SectionTitle, withAlpha } from "./ui";
import {
  drainOutbox,
  online,
  outbox,
  retryOutbox,
  showToast,
  syncOpen,
  type OutboxItem,
} from "../state";

const closeSync = () => syncOpen.set(false);
const pendingItems = () => outbox().filter((item) => item.status !== "sent");

export function SyncDialog() {
  return (
    <If when={syncOpen()}>
      <SyncPanel />
    </If>
  );
}

function SyncPanel() {
  return (
    <AppDialog
      open={() => true}
      onClose={closeSync}
      title="Sync & outbox"
      description="Local cache, cloud connection, and outbound message state."
      width={560}
      testID="sync-dialog"
      footer={
        <DialogActions>
          <Button
            variant="ghost"
            size="sm"
            onPress={() => {
              const next = !online();
              online.set(next);
              if (next) drainOutbox();
              showToast(
                next
                  ? "Back online. Outbox draining."
                  : "Working offline. Drafts and reads stay local.",
              );
            }}
            testID="toggle-online"
          >
            <Icon name={online() ? "zap" : "workflow"} size={11} tone="muted-foreground" />
            <Text class="text-[10px] font-medium">{online() ? "Work offline" : "Go online"}</Text>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onPress={() => {
              retryOutbox();
              showToast("Outbox retry queued.");
            }}
          >
            <Icon name="send" size={11} tone="muted-foreground" />
            <Text class="text-[10px] font-medium">Retry outbox</Text>
          </Button>
          <Button variant="primary" size="sm" onPress={closeSync}>
            <Text class="text-[10px] font-semibold text-primary-foreground">Done</Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-4">
        <View class="flex-row items-center gap-3 rounded-3xl border border-border bg-card shadow-md p-3">
          <View
            class="h-9 w-9 items-center justify-center rounded-lg"
            style={{
              backgroundColor: withAlpha(token(online() ? "success" : "warning"), "22"),
            }}
          >
            <Icon
              name={online() ? "checkCheck" : "workflow"}
              size={16}
              tone={online() ? "success" : "warning"}
            />
          </View>
          <View class="min-w-0 flex-1 gap-0.5">
            <Text class="text-[11px] font-semibold text-foreground">
              {online() ? "Cloud synced" : "Offline mode"}
            </Text>
            <Text class="text-[9px] text-muted-foreground">
              {online()
                ? "Cursor 18,442 · last event 2s ago"
                : "Reads and drafts remain local; sends queue in the outbox."}
            </Text>
          </View>
          <Badge variant={online() ? "success" : "warning"}>
            <Text
              class="text-[8px] font-medium"
              style={{ color: token(online() ? "success" : "warning") }}
            >
              {online() ? "Live" : "Queued"}
            </Text>
          </Badge>
        </View>
        <View class="flex-row gap-2">
          <Stat label="Pending" value={String(pendingItems().length)} />
          <Stat label="Sent today" value="42" />
          <Stat label="Last sync" value="2s ago" />
          <Stat label="Local cache" value="84 MB" />
        </View>
        <View class="gap-1 rounded-3xl border border-border bg-card shadow-md p-3">
          <SectionTitle>Outbox</SectionTitle>
          <Each of={outbox()}>
            {(item: () => OutboxItem) => (
              <View class="flex-row items-center gap-2 border-t border-border py-2 first:border-t-0 first:pt-0">
                <View
                  class="h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: token(
                      item().status === "sent"
                        ? "success"
                        : item().status === "failed"
                          ? "destructive"
                          : "warning",
                    ),
                  }}
                />
                <Text
                  class="min-w-0 flex-1 text-[9.5px] text-foreground"
                  style={{ numberOfLines: 1 }}
                >
                  {item().text}
                </Text>
                <Text class="text-[8.5px] capitalize text-muted-foreground">{item().status}</Text>
                <Text class="w-14 text-right text-[8.5px] text-muted-foreground">
                  {item().time}
                </Text>
              </View>
            )}
          </Each>
        </View>
        <ModalNotice
          title="Cloud is authoritative"
          detail="Desktop writes are commands. The outbox preserves text when the cloud is down; the server rejects unauthorized or stale writes."
        />
      </View>
    </AppDialog>
  );
}

function Stat(props: { label: string; value: string }) {
  return (
    <View class="flex-1 gap-0.5 rounded-lg border border-border bg-panel p-2.5">
      <Text class="text-[8px] uppercase tracking-wide text-muted-foreground">{props.label}</Text>
      <Text class="text-[13px] font-semibold text-foreground">{props.value}</Text>
    </View>
  );
}
