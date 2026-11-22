import { Text, token, View } from "nsh";
import { Icon, type IconName, withAlpha } from "../../components/ui";
import type { FollowUpKind } from "../home/data";

const actions: {
  value: FollowUpKind;
  lines: string[];
  icon: IconName;
  tone: "series-1" | "series-2" | "success" | "series-4" | "series-6" | "series-5" | "highlight";
}[] = [
  { value: "call", lines: ["Call"], icon: "phone", tone: "series-1" },
  { value: "email", lines: ["Email"], icon: "mail", tone: "series-2" },
  { value: "whatsapp", lines: ["WhatsApp"], icon: "whatsapp", tone: "success" },
  { value: "meeting", lines: ["Meeting"], icon: "calendarClock", tone: "series-4" },
  { value: "quote", lines: ["Quote", "follow-up"], icon: "fileText", tone: "series-6" },
  { value: "proposal", lines: ["Prepare", "proposal"], icon: "presentation", tone: "series-5" },
  { value: "task", lines: ["General", "task"], icon: "checkCheck", tone: "highlight" },
];

export function TaskActionRow(props: {
  value: FollowUpKind;
  onChange: (value: FollowUpKind) => void;
}) {
  return (
    <View class="gap-1.5">
      <Text class="text-[11px] uppercase tracking-wider text-muted-foreground">Next action</Text>
      <View class="grid grid-cols-4 gap-2">
        <Each of={actions}>
          {(action: () => (typeof actions)[number]) => {
            const selected = () => props.value === action().value;
            return (
              <View
                role="button"
                accessibilityLabel={action().lines.join(" ")}
                testID={`task-action-${action().value}`}
                onPress={() => props.onChange(action().value)}
                class="relative h-14 flex-col items-center justify-center gap-1 rounded-md border"
                style={{
                  backgroundColor: selected() ? withAlpha(token("success"), "20") : token("panel"),
                  borderColor: selected() ? token("success") : token("border"),
                }}
                hoverStyle={{ borderColor: token("ring") }}
              >
                <Icon
                  name={action().icon}
                  size={17}
                  tone={selected() ? "success" : action().tone}
                />
                <View class="items-center">
                  <Each of={action().lines}>
                    {(line: () => string) => (
                      <Text
                        class="text-[11px] leading-3 font-medium"
                        style={{ color: selected() ? token("success") : token("foreground") }}
                      >
                        {line()}
                      </Text>
                    )}
                  </Each>
                </View>
                <If when={selected()}>
                  <View class="absolute right-0.5 top-0.5">
                    <Icon name="check" size={9} tone="success" />
                  </View>
                </If>
              </View>
            );
          }}
        </Each>
      </View>
    </View>
  );
}
