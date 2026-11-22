import { signal, Text, token, View } from "nsh";
import { MailMessageCard } from "./MailMessageCard";
import type { MailItem } from "../screens/inbox/mail";

export function MailThreadMessages(props: { messages: MailItem[]; latestId: string }) {
  const expanded = signal<string[]>([]);
  const ordered = () => props.messages.toReversed();
  const earlier = () => ordered().filter((message) => message.id !== props.latestId);
  const allExpanded = () =>
    earlier().length > 1 && earlier().every((message) => expanded().includes(message.id));
  const toggle = (id: string) => {
    expanded.set(
      expanded().includes(id)
        ? expanded().filter((current) => current !== id)
        : [...expanded(), id],
    );
  };
  return (
    <View class="gap-2">
      <If when={earlier().length > 1}>
        <View class="flex-row items-center justify-end">
          <View
            role="button"
            accessibilityLabel={
              allExpanded() ? "Collapse earlier messages" : "Expand earlier messages"
            }
            testID={allExpanded() ? "mail-thread-collapse-all" : "mail-thread-expand-all"}
            onPress={() => {
              expanded.set(allExpanded() ? [] : earlier().map((message) => message.id));
            }}
            class="h-6 items-center justify-center rounded-md border border-border px-2"
            hoverStyle={{ backgroundColor: token("accent") }}
          >
            <Text class="text-[10px] font-medium text-muted-foreground">
              {allExpanded() ? "Collapse all" : "Expand all"}
            </Text>
          </View>
        </View>
      </If>

      <View class="relative gap-2 pl-5">
        <View class="absolute bottom-4 left-1.5 top-4 w-px bg-border" />
        <Each of={ordered()}>
          {(message: () => MailItem) => (
            <View class="relative">
              <View class="absolute -left-4 top-4 h-2 w-2 rounded-full border border-border bg-background" />
              <MailMessageCard
                item={message()}
                latest={message().id === props.latestId}
                expanded={expanded().includes(message().id)}
                onToggle={() => toggle(message().id)}
              />
            </View>
          )}
        </Each>
      </View>
    </View>
  );
}
