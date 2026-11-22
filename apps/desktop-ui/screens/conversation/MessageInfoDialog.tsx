import { Text, View } from "nsh";
import { AppDialog, DialogActions } from "../../components/overlay";
import { Button, Icon } from "../../components/ui";
import type { Conversation } from "../../data";
import { statusFor } from "./message-status";
import { messageInfo, messageKindLabel, type ActionableMessage } from "./message-actions";

function statusText(message: ActionableMessage): string {
  if (message.from !== "me") return "Received";
  const status = statusFor(message);
  if (status === "read") return "Read";
  if (status === "delivered") return "Delivered";
  if (status === "sent") return "Sent";
  if (status === "failed") return "Failed";
  return "Sending…";
}

function InfoRow(props: { label: string; value: string }) {
  return (
    <View class="flex-row items-start justify-between gap-4 border-b border-border py-2 last:border-b-0">
      <Text class="text-[12px] text-muted-foreground">{props.label}</Text>
      <Text class="max-w-60 text-right text-[12px] font-medium text-foreground">{props.value}</Text>
    </View>
  );
}

function closeMessageInfo() {
  messageInfo.set(null);
}

export function MessageInfoDialog(props: {
  conversation: Conversation;
  message: ActionableMessage;
}) {
  return (
    <AppDialog
      open={() => true}
      onClose={closeMessageInfo}
      title="Message info"
      description={`${props.conversation.name} · ${messageKindLabel(props.message)}`}
      width={390}
      testID="message-info-dialog"
      footer={
        <DialogActions>
          <Button variant="ghost" size="sm" onPress={closeMessageInfo}>
            <Text class="text-[12px] font-medium">Close</Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-3">
        <View class="flex-row items-center gap-2 rounded-xl border border-border bg-panel px-3 py-2.5">
          <View class="h-8 w-8 items-center justify-center rounded-full bg-accent">
            <Icon
              name={props.message.from === "me" ? "send" : "inbox"}
              size={14}
              tone="highlight"
            />
          </View>
          <View class="min-w-0 flex-1">
            <Text class="text-[12px] font-semibold text-foreground">
              {props.message.from === "me"
                ? "Sent by you"
                : `Received from ${props.conversation.name}`}
            </Text>
            <Text class="text-[11px] text-muted-foreground">{props.message.time}</Text>
          </View>
        </View>
        <View>
          <InfoRow label="Status" value={statusText(props.message)} />
          <InfoRow label="Type" value={messageKindLabel(props.message)} />
          <InfoRow label="Message ID" value={props.message.id} />
          <InfoRow label="Storage" value="Cloud · synced to this device" />
        </View>
      </View>
    </AppDialog>
  );
}
