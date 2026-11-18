import type { JSX } from "nsh";
import { Text, View } from "nsh";

export function SettingRow(props: { title: string; detail: string; children?: JSX.Element }) {
  return (
    <View class="flex-row items-center gap-4 border-t border-border py-2.5 first:border-t-0 first:pt-0">
      <View class="min-w-0 flex-1 gap-0.5">
        <Text class="text-[11.5px] font-medium text-foreground">{props.title}</Text>
        <Text class="text-[10px] text-muted-foreground">{props.detail}</Text>
      </View>
      {props.children}
    </View>
  );
}
