import { Text, View } from "nsh";

export function Row(props: { label: string; value: string; strong?: boolean }) {
  return (
    <View class="flex-row items-center justify-between">
      <Text class="text-[11px] text-muted-foreground">{props.label}</Text>
      <Text
        class={
          props.strong
            ? "text-[12px] font-semibold tabular-nums text-foreground"
            : "text-[11px] font-medium tabular-nums text-foreground"
        }
      >
        {props.value}
      </Text>
    </View>
  );
}
