import { Text, View } from "nsh";

export function Stat(props: { label: string; value: string }) {
  return (
    <View class="flex-1 gap-0.5 rounded-lg border border-border bg-panel p-2.5">
      <Text class="text-[8.5px] uppercase tracking-wide text-muted-foreground">{props.label}</Text>
      <Text class="text-[14px] font-semibold text-foreground">{props.value}</Text>
    </View>
  );
}
