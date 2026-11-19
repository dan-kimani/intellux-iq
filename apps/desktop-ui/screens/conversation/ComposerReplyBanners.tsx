import { Text, View } from "nsh";
import { Icon, IconButton } from "../../components/ui";
import { Reveal } from "../../components/motion";
import { setDraftFor } from "../../state";
import { clearReply, editingMessage, replyTarget } from "./message-actions";
import { ReplyQuote } from "./ReplyQuote";

export function ComposerReplyBanners(props: { conversationId: string }) {
  const replying = () => {
    const target = replyTarget();
    return target?.conversationId === props.conversationId ? target : null;
  };
  const editing = () => {
    const target = editingMessage();
    return target?.conversationId === props.conversationId ? target : null;
  };
  return (
    <>
      <If when={editing()}>
        <Reveal
          from="bottom"
          class="mb-2 flex-row items-center gap-2 rounded-lg border border-border bg-panel px-2.5 py-1.5"
        >
          <Icon name="pencil" size={11} tone="highlight" />
          <Text class="flex-1 text-[9.5px] font-medium text-foreground">Editing message</Text>
          <IconButton
            icon="close"
            label="Cancel edit"
            size={24}
            testID="composer-cancel-edit"
            onPress={() => {
              editingMessage.set(null);
              setDraftFor(props.conversationId, "");
            }}
          />
        </Reveal>
      </If>
      <If when={replying()}>
        <Reveal
          from="bottom"
          class="mb-2 flex-row items-center gap-2 rounded-lg border border-border bg-panel px-2.5 py-1.5"
        >
          <View class="min-w-0 flex-1">
            <ReplyQuote replyTo={{ from: replying()!.from, text: replying()!.text }} />
          </View>
          <IconButton
            icon="close"
            label="Cancel reply"
            size={24}
            testID="composer-cancel-reply"
            onPress={clearReply}
          />
        </Reveal>
      </If>
    </>
  );
}
