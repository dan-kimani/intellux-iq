import type { JSX } from "nsh";
import { ContextActions, type ContextAction } from "./ContextActions";
import type { Conversation } from "../data";
import {
  assignmentDialogOpen,
  isUnread,
  markConversationRead,
  markConversationUnread,
  selectConversation,
  showToast,
} from "../state";

function conversationGroups(conversation: Conversation): ContextAction[][] {
  const unread = isUnread(conversation);
  return [
    [
      {
        id: "open",
        label: "Open conversation",
        icon: "messageCircle",
        description: "Show the thread and contact context",
        onSelect: () => selectConversation(conversation.id),
      },
      {
        id: unread ? "read" : "unread",
        label: unread ? "Mark as read" : "Mark as unread",
        icon: "check",
        description: unread
          ? "Clear the unread state for this conversation"
          : "Keep this conversation unread in the inbox",
        onSelect: () => {
          if (unread) {
            markConversationRead(conversation.id);
            showToast("Conversation marked read.");
          } else {
            markConversationUnread(conversation.id);
            showToast("Conversation marked unread.");
          }
        },
      },
    ],
    [
      {
        id: "assign",
        label: "Reassign conversation",
        icon: "users",
        description: "Change the messaging owner",
        onSelect: () => {
          selectConversation(conversation.id);
          assignmentDialogOpen.set(true);
        },
      },
    ],
  ];
}

export function ConversationContextMenu(props: {
  conversation: Conversation;
  trigger: JSX.Element;
}) {
  return (
    <ContextActions
      testID={`conversation-context-${props.conversation.id}`}
      width={236}
      trigger={props.trigger}
      groups={conversationGroups(props.conversation)}
    />
  );
}
