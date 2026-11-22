import { Text, token, View } from "nsh";
import { AttachmentList } from "../../files/AttachmentRow";
import { Badge, Icon } from "../../components/ui";
import { allConversations, selectConversation, showToast } from "../../state";
import type { Conversation } from "../../data";
import { attachmentsForConversations } from "../conversation/threadViews";
import {
  messageById,
  messagePreview,
  openMessageRef,
  overrideFor,
} from "../conversation/message-actions";
import { unlinkConversationOpportunity } from "../opportunities/actions";
import type { OpportunityDetail } from "../opportunities/detail";
import { closeOpportunityPanel } from "./panelState";
import { PanelSection } from "./OpportunitySections";

export function LinkedConversationsSection(props: { detail: OpportunityDetail }) {
  const conversations = () => props.detail.linkedConversations;
  return (
    <PanelSection
      title="Linked conversations"
      action={
        <Text class="text-[11px] text-muted-foreground">
          {conversations().length} {conversations().length === 1 ? "channel" : "channels"}
        </Text>
      }
    >
      <If
        when={conversations().length > 0}
        else={
          <Text class="text-[11px] leading-3.5 text-muted-foreground">
            This opportunity is not linked to a conversation yet.
          </Text>
        }
      >
        <View class="gap-0.5">
          <Each of={conversations()}>
            {(conversation: () => Conversation) => (
              <View class="flex-row items-center gap-1 rounded-md px-1 py-1">
                <View
                  role="button"
                  accessibilityLabel={`Open ${conversation().name}`}
                  testID={`open-conversation-${conversation().id}`}
                  onPress={() => {
                    selectConversation(conversation().id);
                    closeOpportunityPanel();
                  }}
                  class="min-w-0 flex-1 flex-row items-center gap-1.5"
                  hoverStyle={{ opacity: 0.8 }}
                >
                  <Icon
                    name={conversation().channel === "whatsapp" ? "messageCircle" : "mail"}
                    size={10}
                    tone="muted-foreground"
                  />
                  <Text
                    class="min-w-0 flex-1 text-[11px] font-medium text-foreground"
                    style={{ numberOfLines: 2 }}
                  >
                    {conversation().name}
                  </Text>
                  <If when={props.detail.source?.conversationId === conversation().id}>
                    <Badge variant="outline">
                      <Text class="text-[11px] text-muted-foreground">Source</Text>
                    </Badge>
                  </If>
                </View>
                <If
                  when={
                    conversations().length > 1 &&
                    props.detail.source?.conversationId !== conversation().id
                  }
                >
                  <View
                    role="button"
                    accessibilityLabel={`Unlink ${conversation().name}`}
                    testID={`unlink-opportunity-${conversation().id}`}
                    onPress={() => {
                      const removed = unlinkConversationOpportunity(
                        conversation(),
                        props.detail.id,
                      );
                      showToast(
                        removed
                          ? "Conversation unlinked from the opportunity."
                          : "An opportunity must keep at least one conversation.",
                      );
                    }}
                    class="h-5 w-5 items-center justify-center rounded"
                    hoverStyle={{ backgroundColor: token("accent") }}
                  >
                    <Icon name="close" size={9} tone="muted-foreground" />
                  </View>
                </If>
              </View>
            )}
          </Each>
        </View>
      </If>
    </PanelSection>
  );
}

export function SourceMessageSection(props: { detail: OpportunityDetail }) {
  const source = props.detail.source;
  if (!source) return null;
  const conversation = () =>
    allConversations().find((row) => row.id === source.conversationId) ??
    props.detail.linkedConversations[0];
  const message = () => {
    const row = conversation();
    return row ? messageById(row, source.messageId) : undefined;
  };
  return (
    <PanelSection title="Source message">
      <If
        when={message()}
        else={
          <Text class="text-[11px] leading-3.5 text-muted-foreground">
            The original message is no longer available.
          </Text>
        }
      >
        <View class="gap-1.5 rounded-lg border border-border bg-panel p-2.5">
          <View class="flex-row items-center gap-1.5">
            <Icon name="messageCircle" size={9} tone="muted-foreground" />
            <Text class="min-w-0 flex-1 text-[11px] font-medium text-muted-foreground">
              {conversation()?.name}
            </Text>
            <Text class="text-[11px] text-muted-foreground">{message()?.time}</Text>
          </View>
          <Text class="text-[12px] leading-4 text-foreground" style={{ numberOfLines: 4 }}>
            {message()
              ? (overrideFor(message()!.id).text ?? messagePreview(message()!))
              : "Message unavailable"}
          </Text>
          <View
            role="button"
            accessibilityLabel="Open the source conversation"
            testID="opportunity-source-open"
            onPress={() => {
              const row = conversation();
              if (!row) return;
              selectConversation(row.id);
              openMessageRef(row.id, source.messageId);
              closeOpportunityPanel();
            }}
            class="h-6 flex-row items-center gap-1 self-start rounded border border-border px-2"
            hoverStyle={{ backgroundColor: token("accent") }}
          >
            <Text class="text-[11px] font-medium text-foreground">Open conversation</Text>
            <Icon name="arrowUpRight" size={8} tone="muted-foreground" />
          </View>
        </View>
      </If>
    </PanelSection>
  );
}

export function FilesSection(props: { detail: OpportunityDetail }) {
  const files = () => attachmentsForConversations(props.detail.linkedConversations);
  return (
    <If
      when={files().length > 0}
      else={
        <PanelSection title="Files">
          <Text class="text-[11px] leading-3.5 text-muted-foreground">
            Files shared in linked conversations appear here.
          </Text>
        </PanelSection>
      }
    >
      <AttachmentList files={files()} />
    </If>
  );
}
