import { Text, View } from "nsh";
import { Icon } from "../../components/ui";
import type { Conversation } from "../../data";
import { assignmentFor } from "../../state";

export function ComposerReadOnly(props: { conversation: Conversation }) {
  const owner = assignmentFor(props.conversation);
  return (
    <View class="shrink-0 border-t border-border bg-background px-4 py-3">
      <View class="flex-row items-center gap-3 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2.5">
        <View class="h-7 w-7 items-center justify-center rounded-md bg-warning/15">
          <Icon name="shieldCheck" size={13} tone="warning" />
        </View>
        <View class="min-w-0 flex-1 gap-0.5">
          <Text class="text-[10px] font-medium text-foreground">Read-only conversation</Text>
          <Text class="text-[9px] text-muted-foreground">
            {owner
              ? `Owned by ${owner.name}. Only the owner or a manager can send messages.`
              : "Unassigned conversations are read-only for sales until a manager or routing assigns them."}
          </Text>
        </View>
      </View>
    </View>
  );
}
