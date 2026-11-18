import { Text, token, View } from "nsh";
import { shortcutLabel } from "../../screens/settings/shortcuts";
import { Icon, Kbd } from "../ui";
import type { PaletteResult } from "./search";

export function Hint(props: { keys: string; label: string }) {
  return (
    <View class="flex-row items-center gap-1.5">
      <Kbd>{props.keys}</Kbd>
      <Text class="text-[8.5px] text-muted-foreground">{props.label}</Text>
    </View>
  );
}

export function ResultRow(props: {
  item: PaletteResult;
  active: boolean;
  onHover: () => void;
  onPress: () => void;
}) {
  const showKind = props.item.kind !== "Command" && props.item.kind !== "Screen";
  return (
    <View
      role="button"
      accessibilityLabel={`${props.item.label}, ${props.item.kind}`}
      accessibilityState={{ selected: props.active }}
      testID={`command-result-${props.item.key}`}
      onPress={props.onPress}
      onMouseEnter={props.onHover}
      class="h-12 flex-row items-center gap-3 rounded-lg px-2.5"
      style={{ backgroundColor: props.active ? token("accent") : "transparent" }}
      hoverStyle={{ backgroundColor: token("accent") }}
      focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
    >
      <View
        class="h-8 w-8 items-center justify-center rounded-lg"
        style={{ backgroundColor: props.active ? token("primary") : token("muted") }}
      >
        <Icon
          name={props.item.icon}
          size={14}
          tone={props.active ? "primary-foreground" : "muted-foreground"}
        />
      </View>
      <View class="min-w-0 flex-1 gap-0.5">
        <Text class="text-[12.5px] font-medium text-foreground" style={{ numberOfLines: 1 }}>
          {props.item.label}
        </Text>
        <Text class="text-[10px] text-muted-foreground" style={{ numberOfLines: 1 }}>
          {props.item.detail}
        </Text>
      </View>
      <If when={props.item.shortcutId}>
        <Kbd>{props.item.shortcutId ? shortcutLabel(props.item.shortcutId) : ""}</Kbd>
      </If>
      <If when={!props.item.shortcutId && showKind}>
        <Text class="text-[8px] uppercase tracking-wide text-muted-foreground">
          {props.item.kind}
        </Text>
      </If>
    </View>
  );
}
