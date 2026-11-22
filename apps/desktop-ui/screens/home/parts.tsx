import type { JSX, Tokens } from "nsh";
import { Text, token, View } from "nsh";
import { Icon, withAlpha, type IconName } from "../../components/ui";

export function CardHead(props: { title: string; subtitle?: string; action?: JSX.Element }) {
  return (
    <View class="flex-row flex-wrap items-start justify-between gap-2">
      <View class="min-w-0 gap-0.5">
        <Text class="text-[14px] font-semibold text-foreground">{props.title}</Text>
        <If when={props.subtitle}>
          <Text class="text-[11px] text-muted-foreground" style={{ numberOfLines: 2 }}>
            {props.subtitle}
          </Text>
        </If>
      </View>
      {props.action}
    </View>
  );
}

export function LinkAction(props: {
  label: string;
  onPress: () => void;
  testID?: string;
  accessibilityLabel?: string;
}) {
  return (
    <View
      role="button"
      accessibilityLabel={props.accessibilityLabel ?? props.label}
      testID={props.testID}
      onPress={props.onPress}
      class="flex-row items-center gap-0.5 rounded px-1 py-0.5"
      hoverStyle={{ backgroundColor: token("accent") }}
      focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
    >
      <Text class="text-[11px] font-medium text-highlight">{props.label}</Text>
      <Icon name="chevronRight" size={9} tone="highlight" />
    </View>
  );
}

export function TinyButton(props: {
  label: string;
  onPress: () => void;
  testID?: string;
  accessibilityLabel?: string;
}) {
  return (
    <View
      role="button"
      accessibilityLabel={props.accessibilityLabel ?? props.label}
      testID={props.testID}
      onPress={props.onPress}
      class="h-6.5 shrink-0 items-center justify-center rounded-md border border-border px-2"
      hoverStyle={{ backgroundColor: token("accent"), borderColor: token("ring") }}
      focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
    >
      <Text class="text-[11px] font-medium text-foreground">{props.label}</Text>
    </View>
  );
}

export function IconTile(props: {
  icon: IconName;
  tone: keyof Tokens;
  size?: number;
  iconSize?: number;
  class?: string;
}) {
  const size = props.size ?? 28;
  return (
    <View
      class={`shrink-0 items-center justify-center rounded-lg ${props.class ?? ""}`}
      style={{
        width: size,
        height: size,
        backgroundColor: withAlpha(token(props.tone) as string, "24"),
      }}
    >
      <Icon name={props.icon} size={props.iconSize ?? 13} tone={props.tone} />
    </View>
  );
}

export function ToneTag(props: { label: string; tone: keyof Tokens }) {
  return (
    <View
      class="rounded px-1 py-0.5"
      style={{ backgroundColor: withAlpha(token(props.tone) as string, "24") }}
    >
      <Text class="text-[11px] font-medium" style={{ color: token(props.tone) as string }}>
        {props.label}
      </Text>
    </View>
  );
}
