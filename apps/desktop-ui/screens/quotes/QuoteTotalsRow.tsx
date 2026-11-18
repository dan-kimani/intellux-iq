import { Text, View } from "nsh";

export function Row(props: { label: string; value: string; strong?: boolean }) {
  return (
    <View class="flex-row items-center justify-between">
      <Text class="text-[9px] text-muted-foreground">{props.label}</Text>
      <Text
        class={
          props.strong
            ? "text-[11px] font-semibold text-foreground"
            : "text-[9.5px] font-medium text-foreground"
        }
      >
        {props.value}
      </Text>
    </View>
  );
}
