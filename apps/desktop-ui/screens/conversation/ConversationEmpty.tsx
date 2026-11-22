import { Text, View } from "nsh";
import { Icon, type IconName } from "../../components/ui";

export function ConversationEmpty(props: { icon: IconName; title: string; detail: string }) {
  return (
    <View class="items-center gap-2 rounded-2xl border border-dashed border-border px-6 py-10">
      <View class="h-9 w-9 items-center justify-center rounded-full bg-muted">
        <Icon name={props.icon} size={15} tone="muted-foreground" />
      </View>
      <Text class="text-[12px] font-medium text-foreground">{props.title}</Text>
      <Text class="max-w-75 text-center text-[11px] leading-4 text-muted-foreground">
        {props.detail}
      </Text>
    </View>
  );
}
