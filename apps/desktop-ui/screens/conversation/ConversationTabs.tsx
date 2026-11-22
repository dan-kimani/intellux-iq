import { View } from "nsh";
import { SectionTabs } from "../../components/SectionTabs";
import type { Conversation } from "../../data";
import { attachmentsFor, quotesForConversation, starredFor } from "./threadViews";

export type ThreadTab = "conversation" | "files" | "quotes" | "starred";

export function ConversationTabs(props: {
  conversation: Conversation;
  value: ThreadTab;
  onChange: (tab: ThreadTab) => void;
}) {
  return (
    <View class="shrink-0 border-b border-border bg-background px-5 py-1">
      <SectionTabs
        accessibilityLabel="Conversation views"
        testPrefix="thread-tab"
        value={props.value}
        onChange={(id) => props.onChange(id as ThreadTab)}
        items={[
          { id: "conversation", label: "Conversation" },
          { id: "files", label: "Files", count: attachmentsFor(props.conversation).length },
          {
            id: "quotes",
            label: "Quotes",
            count: quotesForConversation(props.conversation).length,
          },
          { id: "starred", label: "Starred", count: starredFor(props.conversation).length },
        ]}
      />
    </View>
  );
}
