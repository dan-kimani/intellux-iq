import { Text, token, View } from "nsh";
import { IconButton } from "../../components/ui";
import type { Conversation } from "../../data";

export function ActivityPanel(props: { conversation: Conversation }) {
  const events = [
    {
      time: "9:33 AM",
      title: "Customer sent a product photo",
      detail: "Inbound WhatsApp media",
      tone: "chart-3" as const,
    },
    {
      time: "9:27 AM",
      title: "Quotation QT-2025-0045 sent",
      detail: "PDF · 245 KB",
      tone: "chart-2" as const,
    },
    {
      time: "9:12 AM",
      title: "Stage moved to Quotation",
      detail: "by David Mwangi",
      tone: "chart-1" as const,
    },
    {
      time: "Yesterday",
      title: "Opportunity created",
      detail: "50 units · ProMax model",
      tone: "chart-4" as const,
    },
  ];
  return (
    <View class="gap-3">
      <View class="gap-3 rounded-3xl border border-border bg-card shadow-md p-4">
        <View class="flex-row items-center justify-between">
          <View class="gap-0.5">
            <Text class="text-[13px] font-semibold text-foreground">Conversation activity</Text>
            <Text class="text-[9.5px] text-muted-foreground">
              {props.conversation.company} · org-wide audit trail
            </Text>
          </View>
          <IconButton icon="ellipsis" label="More activity actions" size={28} />
        </View>
        <View class="gap-0">
          <Each of={events}>
            {(event: () => (typeof events)[number], index: () => number) => (
              <View class="flex-row gap-2.5">
                <View class="items-center">
                  <View
                    class="mt-1 rounded-full"
                    style={{ width: 7, height: 7, backgroundColor: token(event().tone) }}
                  />
                  <If when={index() < events.length - 1}>
                    <View class="w-px flex-1 bg-border" style={{ minHeight: 30 }} />
                  </If>
                </View>
                <View class="flex-1 gap-0.5 pb-3">
                  <Text class="text-[11px] font-medium text-foreground">{event().title}</Text>
                  <Text class="text-[9.5px] text-muted-foreground">{event().detail}</Text>
                  <Text class="text-[8.5px] text-muted-foreground">{event().time}</Text>
                </View>
              </View>
            )}
          </Each>
        </View>
      </View>
      <View class="rounded-3xl border border-border bg-card shadow-md p-3.5">
        <Text class="text-[10px] leading-4 text-muted-foreground">
          Activity is a diagnostic, not a performance metric. IntelluxIQ evaluates outcomes: replies
          recovered, quotes accepted, and deals won.
        </Text>
      </View>
    </View>
  );
}
