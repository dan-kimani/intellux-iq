import { Scroll, Text, token, View } from "nsh";
import { AppDialog, DialogActions } from "../../components/overlay";
import { Avatar, Button, Icon } from "../../components/ui";
import type { Conversation } from "../../data";
import { allConversations, showToast } from "../../state";
import {
  forwardMessage,
  forwardingMessage,
  messagePreview,
  type ActionableMessage,
} from "./message-actions";

function closeForwarding() {
  forwardingMessage.set(null);
}

export function ForwardDialog(props: { conversation: Conversation; message: ActionableMessage }) {
  const targets = () =>
    allConversations().filter(
      (conversation) =>
        conversation.channel === "whatsapp" && conversation.id !== props.conversation.id,
    );
  return (
    <AppDialog
      open={() => true}
      onClose={closeForwarding}
      title="Forward message"
      description={messagePreview(props.message)}
      width={430}
      testID="forward-dialog"
      footer={
        <DialogActions>
          <Button variant="ghost" size="sm" onPress={closeForwarding}>
            <Text class="text-[12px] font-medium">Cancel</Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-2">
        <Text class="text-[11px] text-muted-foreground">
          Choose a WhatsApp conversation. The message is forwarded as you.
        </Text>
        <Scroll style={{ maxHeight: 420 }} scrollbar={false}>
          <Each of={targets()}>
            {(target: () => Conversation) => (
              <View
                role="button"
                accessibilityLabel={`Forward to ${target().name}`}
                testID={`forward-target-${target().id}`}
                onPress={() => {
                  forwardMessage(props.message, target());
                  forwardingMessage.set(null);
                  showToast(`Message forwarded to ${target().name}.`);
                }}
                class="flex-row items-center gap-3 rounded-lg px-2 py-2"
                hoverStyle={{ backgroundColor: token("accent") }}
              >
                <Avatar name={target().name} size={30} />
                <View class="min-w-0 flex-1">
                  <Text class="text-[12px] font-medium text-foreground">{target().name}</Text>
                  <Text class="text-[11px] text-muted-foreground">{target().company}</Text>
                </View>
                <Icon name="forward" size={12} tone="muted-foreground" />
              </View>
            )}
          </Each>
        </Scroll>
      </View>
    </AppDialog>
  );
}
