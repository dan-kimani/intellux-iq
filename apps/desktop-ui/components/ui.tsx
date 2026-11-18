import type { ImageAsset, JSX, Tokens } from "nsh";
import { Image, Text, token, View } from "nsh";
import type { AvatarTone } from "../data";
import { Icon, icons, type IconName, Logo } from "./icon";
import { withAlpha } from "./theme";

export { Icon, icons, type IconName, Logo, withAlpha };

const toneToken: Record<AvatarTone, keyof Tokens> = {
  violet: "chart-1",
  blue: "chart-2",
  green: "chart-3",
  amber: "chart-4",
  rose: "chart-5",
  slate: "muted-foreground",
};

export function Avatar(props: {
  photo?: ImageAsset;
  initials: string;
  tone?: AvatarTone;
  size?: number;
  online?: boolean;
  class?: string;
}) {
  const size = props.size ?? 42;
  const accent = token(toneToken[props.tone ?? "slate"]) as string;
  return (
    <View class={`relative shrink-0 ${props.class ?? ""}`} style={{ width: size, height: size }}>
      <View
        class="h-full w-full items-center justify-center overflow-hidden rounded-full border border-border"
        style={{ backgroundColor: withAlpha(accent, "20") }}
      >
        <If
          when={props.photo}
          else={
            <Text style={{ fontSize: size * 0.3, fontWeight: "600", color: accent }}>
              {props.initials}
            </Text>
          }
        >
          <Image src={props.photo} style={{ width: size, height: size }} />
        </If>
      </View>
      <If when={props.online}>
        <View
          class="absolute rounded-full border-2 border-background bg-success"
          style={{
            width: Math.max(9, Math.round(size * 0.22)),
            height: Math.max(9, Math.round(size * 0.22)),
            right: 0,
            bottom: 0,
          }}
        />
      </If>
    </View>
  );
}

export function Verified(props: { size?: number }) {
  const size = props.size ?? 14;
  return (
    <View
      class="items-center justify-center rounded-full bg-info"
      style={{ width: size, height: size }}
    >
      <Icon name="check" size={size * 0.68} tone="info-foreground" />
    </View>
  );
}

export function Badge(props: {
  children?: JSX.Element;
  variant?: "default" | "primary" | "success" | "warning" | "outline";
  class?: string;
}) {
  const variant = props.variant ?? "default";
  const classes = {
    default: "bg-muted text-muted-foreground border-transparent",
    primary: "bg-accent text-accent-foreground border-accent",
    success: "border-transparent",
    warning: "border-transparent",
    outline: "bg-transparent text-muted-foreground border-border",
  }[variant];
  const dynamicStyle =
    variant === "success"
      ? { backgroundColor: withAlpha(token("success"), "1f"), color: token("success") }
      : variant === "warning"
        ? { backgroundColor: withAlpha(token("warning"), "1f"), color: token("warning") }
        : {};
  return (
    <View
      class={`h-5.5 flex-row items-center gap-1 rounded-md border px-2 ${classes} ${props.class ?? ""}`}
      style={dynamicStyle}
    >
      {props.children}
    </View>
  );
}

export function Button(props: {
  children?: JSX.Element;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md";
  class?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}) {
  const variant = props.variant ?? "secondary";
  const classes = {
    primary: "bg-primary text-primary-foreground border-primary hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80",
    outline: "bg-transparent text-foreground border-border hover:bg-accent",
    ghost:
      "bg-transparent text-muted-foreground border-transparent hover:bg-accent hover:text-accent-foreground",
  }[variant];
  const size = props.size === "sm" ? "h-8 px-2.5 text-xs" : "h-9 px-3 text-[13px]";
  return (
    <View
      role="button"
      accessibilityLabel={props.accessibilityLabel}
      testID={props.testID}
      onPress={props.onPress}
      disabled={props.disabled}
      class={`flex-row items-center justify-center gap-2 rounded-lg border font-medium ${size} ${classes} ${props.class ?? ""}`}
      hoverStyle={{ opacity: 0.9 }}
      activeStyle={{ opacity: 0.72 }}
      focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 2 }}
      disabledStyle={{ opacity: 0.45 }}
    >
      {props.children}
    </View>
  );
}

export function IconButton(props: {
  icon: IconName;
  label: string;
  onPress?: () => void;
  size?: number;
  active?: boolean;
  tone?: keyof Tokens;
  class?: string;
  disabled?: boolean;
  testID?: string;
}) {
  const size = props.size ?? 32;
  return (
    <View
      role="button"
      accessibilityLabel={props.label}
      testID={props.testID}
      tooltip={<Text class="text-xs text-foreground">{props.label}</Text>}
      onPress={props.onPress}
      disabled={props.disabled}
      class={`items-center justify-center rounded-lg border border-transparent ${props.active ? "bg-accent" : ""} ${props.class ?? ""}`}
      style={{ width: size, height: size }}
      hoverStyle={{ backgroundColor: token("accent") }}
      activeStyle={{ opacity: 0.65 }}
      focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 2 }}
      disabledStyle={{ opacity: 0.4 }}
    >
      <Icon
        name={props.icon}
        size={Math.round(size * 0.52)}
        tone={props.tone ?? (props.active ? "accent-foreground" : "muted-foreground")}
      />
    </View>
  );
}

export function Kbd(props: { children?: JSX.Element }) {
  return (
    <View class="h-5.5 min-w-5.5 items-center justify-center rounded-md border border-border bg-panel-strong px-1.5">
      <Text class="text-[10px] font-medium text-muted-foreground">{props.children}</Text>
    </View>
  );
}

export function Separator(props: { class?: string }) {
  return <View class={`h-px w-full bg-border ${props.class ?? ""}`} />;
}

export function SectionTitle(props: { children?: JSX.Element; action?: JSX.Element }) {
  return (
    <View class="flex-row items-center justify-between">
      <Text
        class="text-[11px] font-semibold uppercase text-muted-foreground"
        style={{ letterSpacing: 0.8 }}
      >
        {props.children}
      </Text>
      {props.action}
    </View>
  );
}

export function StageDot(props: { color: "violet" | "blue" | "green" | "amber" }) {
  const map = { violet: "chart-1", blue: "chart-2", green: "chart-3", amber: "chart-4" } as const;
  return (
    <View
      class="rounded-full"
      style={{ width: 8, height: 8, backgroundColor: token(map[props.color]) }}
    />
  );
}

export function Card(props: {
  children?: JSX.Element;
  class?: string;
  testID?: string;
  style?: object;
}) {
  return (
    <View
      testID={props.testID}
      class={`rounded-3xl border border-border bg-card shadow-md ${props.class ?? ""}`}
      style={props.style}
    >
      {props.children}
    </View>
  );
}
