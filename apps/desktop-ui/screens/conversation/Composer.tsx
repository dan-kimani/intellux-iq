import { effect, keymap, signal, Text, token, View } from "nsh";
import { Badge, Button, Icon } from "../../components/ui";
import { AttachmentDialog } from "./AttachmentDialog";
import { ComposerInputBar } from "./ComposerInputBar";
import { ComposerReplyBanners } from "./ComposerReplyBanners";
import {
  clearReply,
  editingMessage,
  replyTarget,
  sentReplyTo,
  updateMessageOverride,
} from "./message-actions";
import { ComposerReadOnly } from "./ComposerReadOnly";
import { SlashCommandMenu } from "./SlashCommandMenu";
import { TemplatePicker } from "./TemplatePicker";
import {
  appliedTemplate,
  assignmentFor,
  attachmentOpen,
  attachmentPreset,
  canWriteConversation,
  composerAttachment,
  composerPrefill,
  draftFor,
  enqueueMessage,
  isAssignedToMe,
  online,
  selectedConversation,
  sentKind,
  sentMessage,
  sentRevision,
  sentTemplate,
  setDraftFor,
  showToast,
  templateOpen,
  assignConversationTo,
  currentMember,
  tagDialogOpen,
  reminderDialogOpen,
} from "../../state";

export function Composer(props: { onSent?: () => void }) {
  const conversation = selectedConversation();
  const draft = () => draftFor(conversation.id);
  const setDraft = (value: string) => setDraftFor(conversation.id, value);
  const replying = () => {
    const target = replyTarget();
    return target?.conversationId === conversation.id ? target : null;
  };
  const editing = () => {
    const target = editingMessage();
    return target?.conversationId === conversation.id ? target : null;
  };
  const noteMode = signal(false);
  const windowClosed = () =>
    conversation.channel === "whatsapp" && (conversation.windowMinutes ?? 0) <= 0;
  const writable = () => canWriteConversation(conversation);
  effect(() => {
    const target = replyTarget();
    if (target && target.conversationId !== conversation.id) clearReply();
  });
  effect(() => {
    const target = editingMessage();
    if (!target || target.conversationId === conversation.id) return;
    editingMessage.set(null);
    setDraftFor(target.conversationId, "");
  });
  effect(() => {
    const prefill = composerPrefill();
    if (!prefill) return;
    setDraftFor(conversation.id, prefill);
    composerPrefill.set(null);
  });

  const send = () => {
    if (!writable()) return;
    const text = draft().trim();
    if (!text) return;
    const reply = replying();
    const edit = editing();
    if (edit) {
      updateMessageOverride(edit.messageId, { text });
      editingMessage.set(null);
      setDraft("");
      clearReply();
      showToast("Message edited.");
      props.onSent?.();
      return;
    }
    if (noteMode()) {
      sentKind.set("note");
      sentTemplate.set(null);
      sentReplyTo.set(null);
      sentMessage.set(text);
      sentRevision.set(sentRevision() + 1);
      setDraft("");
      clearReply();
      showToast("Internal note added. Team-visible only.");
      props.onSent?.();
      return;
    }
    if (windowClosed() && !appliedTemplate()) {
      showToast("The 24-hour window is closed. Use an approved template.");
      return;
    }
    if (!assignmentFor(conversation)) {
      assignConversationTo(conversation.id, currentMember.id);
    }
    sentKind.set("message");
    sentTemplate.set(appliedTemplate());
    sentReplyTo.set(reply ? { from: reply.from, text: reply.text } : null);
    sentMessage.set(text);
    sentRevision.set(sentRevision() + 1);
    clearReply();
    enqueueMessage(text);
    setDraft("");
    composerAttachment.set(null);
    appliedTemplate.set(null);
    showToast(
      online()
        ? windowClosed()
          ? "Template queued through cloud egress."
          : "Message queued through cloud egress."
        : "Offline — message queued in the outbox.",
    );
    props.onSent?.();
  };

  if (!writable()) return <ComposerReadOnly conversation={conversation} />;

  const owner = () => assignmentFor(conversation);
  return (
    <View class="shrink-0 border-t border-border bg-background px-4 py-3">
      <If when={!isAssignedToMe(conversation)}>
        <View class="mb-2 flex-row items-center gap-2 rounded-md border border-border bg-panel px-2.5 py-1.5">
          <Icon name="users" size={10} tone="muted-foreground" />
          <Text class="flex-1 text-[11px] text-muted-foreground">
            {owner()
              ? `Manager override — owned by ${owner()!.name}.`
              : "Unassigned — sending will assign this conversation to you."}
          </Text>
        </View>
      </If>
      <If when={composerAttachment()}>
        <View class="mb-2 flex-row items-center gap-2 self-start rounded-lg border border-border bg-panel px-2.5 py-1.5">
          <Icon name="paperclip" size={11} tone="muted-foreground" />
          <Text class="text-[11px] font-medium text-foreground">
            {composerAttachment()} attached
          </Text>
          <View
            role="button"
            accessibilityLabel="Remove attachment"
            onPress={() => composerAttachment.set(null)}
          >
            <Icon name="close" size={10} tone="muted-foreground" />
          </View>
        </View>
      </If>
      <If when={appliedTemplate()}>
        <View class="mb-2 flex-row items-center gap-2 rounded-lg border border-border bg-panel px-2.5 py-1.5">
          <Badge variant="success">
            <Text class="text-[11px] font-medium text-success">APPROVED TEMPLATE</Text>
          </Badge>
          <Text class="flex-1 text-[11px] font-medium text-foreground">
            {appliedTemplate()?.name} · {appliedTemplate()?.language.toUpperCase()}
          </Text>
          <View
            role="button"
            accessibilityLabel="Remove template"
            onPress={() => {
              appliedTemplate.set(null);
              setDraft("");
            }}
          >
            <Icon name="close" size={10} tone="muted-foreground" />
          </View>
        </View>
      </If>
      <If when={windowClosed() && !appliedTemplate() && !noteMode()}>
        <View class="mb-2 flex-row items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2">
          <Icon name="shieldCheck" size={12} tone="warning" />
          <Text class="flex-1 text-[11px] text-muted-foreground">
            24-hour window closed. Only an approved template can re-engage this customer.
          </Text>
          <Button
            variant="outline"
            size="sm"
            testID="choose-window-template"
            onPress={() => templateOpen.set(true)}
          >
            <Text class="text-[11px] font-medium text-foreground">Choose template</Text>
          </Button>
        </View>
      </If>
      <If when={draft().trim().startsWith("/") && !draft().includes(" ")}>
        <SlashCommandMenu
          onTemplate={() => {
            setDraft("");
            templateOpen.set(true);
          }}
          onNote={() => {
            noteMode.set(true);
            setDraft("");
          }}
          onTag={() => {
            setDraft("");
            tagDialogOpen.set(true);
          }}
          onRemind={() => {
            setDraft("");
            reminderDialogOpen.set(true);
          }}
        />
      </If>
      <ComposerReplyBanners conversationId={conversation.id} />
      <ComposerInputBar
        channel={conversation.channel}
        draft={draft}
        setDraft={setDraft}
        onSend={send}
        onOpenTemplate={() => templateOpen.set(true)}
        onAddAttachment={() => attachmentOpen.set(true)}
        onAttach={(kind) => {
          attachmentPreset.set(kind);
          attachmentOpen.set(true);
        }}
        windowClosed={windowClosed()}
        hasTemplate={Boolean(appliedTemplate())}
        noteMode={noteMode()}
      />
      <View class="mt-1.5 flex-row items-center justify-between pl-1">
        <View class="flex-row items-center gap-2">
          <Text class="text-[11px] text-muted-foreground">
            {online()
              ? conversation.channel === "whatsapp" && windowClosed()
                ? "Template egress only · 24h window closed"
                : "Sends through IntelluxIQ cloud"
              : "Offline — sends wait in the outbox"}
          </Text>
          <View
            role="button"
            accessibilityLabel="Toggle internal note"
            testID="composer-note-mode"
            onPress={() => noteMode.set(!noteMode())}
            class="rounded px-1 py-0.5"
            style={{ backgroundColor: noteMode() ? token("accent") : "transparent" }}
          >
            <Text
              class="text-[11px] font-medium"
              style={{ color: noteMode() ? token("highlight") : token("muted-foreground") }}
            >
              Internal note
            </Text>
          </View>
        </View>
        <Text class="text-[11px] text-muted-foreground">
          {conversation.channel === "whatsapp"
            ? `Enter to send · ${keymap.label("mod+enter")} new line`
            : `${keymap.label("mod+enter")} to send`}
        </Text>
      </View>
      <If when={attachmentOpen()}>
        <AttachmentDialog />
      </If>
      <If when={templateOpen()}>
        <TemplatePicker
          windowClosed={windowClosed()}
          channel={conversation.channel}
          onUse={(text, template) => {
            setDraft(text);
            appliedTemplate.set(template);
            templateOpen.set(false);
          }}
        />
      </If>
    </View>
  );
}
