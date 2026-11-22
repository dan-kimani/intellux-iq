import { signal, Text, token, View } from "nsh";
import { EmojiPicker, Popover } from "nsh/base";
import type { WhatsAppFormat } from "./whatsappFormat";

export function ComposerTool(props: {
  label: string;
  testID: string;
  children: import("nsh").JSX.Element;
  onPress?: () => void;
  filled?: boolean;
}) {
  return (
    <View
      role="button"
      accessibilityLabel={props.label}
      testID={props.testID}
      onPress={props.onPress}
      class={`h-8 w-8 shrink-0 items-center justify-center rounded-full border border-transparent ${
        props.filled ? "bg-muted" : ""
      }`}
      hoverStyle={{ backgroundColor: token("accent") }}
      activeStyle={{ opacity: 0.65 }}
      focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
    >
      {props.children}
    </View>
  );
}

function FormatTile(props: {
  label: string;
  syntax: string;
  testID: string;
  onPress: () => void;
  children: import("nsh").JSX.Element;
}) {
  return (
    <View
      role="button"
      accessibilityLabel={`${props.label}, ${props.syntax}`}
      testID={props.testID}
      onPress={props.onPress}
      class="h-9 flex-1 items-center justify-center gap-0.5 rounded-lg border border-border bg-card"
      hoverStyle={{ backgroundColor: token("accent") }}
      focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
    >
      {props.children}
      <Text class="text-[11px] text-muted-foreground">{props.label}</Text>
    </View>
  );
}

export function WhatsAppFormatMenu(props: { onFormat: (format: WhatsAppFormat) => void }) {
  const open = signal(false);
  const choose = (format: WhatsAppFormat) => {
    props.onFormat(format);
    open.set(false);
  };
  return (
    <Popover
      open={open()}
      onOpenChange={({ open: next }) => open.set(next)}
      placement="top"
      align="start"
      offset={8}
      popupClass="rounded-2xl border border-border bg-popover p-3 shadow-2xl"
      popupStyle={{ width: 258 }}
      trigger={
        <ComposerTool label="Formatting" testID="wa-format-menu">
          <Text class="text-[12px] font-semibold text-muted-foreground">Aa</Text>
        </ComposerTool>
      }
    >
      <View testID="wa-format-menu-panel" class="gap-2">
        <View class="gap-0.5">
          <Text class="text-[12px] font-semibold text-foreground">Formatting</Text>
          <Text class="text-[11px] text-muted-foreground">
            WhatsApp markup is applied around the selection.
          </Text>
        </View>
        <View class="gap-1">
          <View class="flex-row gap-1">
            <FormatTile
              label="Bold"
              syntax="*text*"
              testID="wa-format-bold"
              onPress={() => choose("bold")}
            >
              <Text class="text-[13px] font-bold text-foreground">B</Text>
            </FormatTile>
            <FormatTile
              label="Italic"
              syntax="_text_"
              testID="wa-format-italic"
              onPress={() => choose("italic")}
            >
              <Text class="text-[13px] italic text-foreground">I</Text>
            </FormatTile>
            <FormatTile
              label="Strikethrough"
              syntax="~text~"
              testID="wa-format-strike"
              onPress={() => choose("strike")}
            >
              <Text class="text-[13px] line-through text-foreground">S</Text>
            </FormatTile>
          </View>
          <View class="flex-row gap-1">
            <FormatTile
              label="Monospace"
              syntax="```text```"
              testID="wa-format-monospace"
              onPress={() => choose("monospace")}
            >
              <Text class="font-mono text-[12px] text-foreground">M</Text>
            </FormatTile>
            <FormatTile
              label="Inline code"
              syntax="`text`"
              testID="wa-format-code"
              onPress={() => choose("code")}
            >
              <Text class="font-mono text-[12px] text-foreground">`</Text>
            </FormatTile>
            <FormatTile
              label="Quote"
              syntax="> text"
              testID="wa-format-quote"
              onPress={() => choose("quote")}
            >
              <Text class="text-[14px] leading-none text-foreground">❝</Text>
            </FormatTile>
          </View>
          <View class="flex-row gap-1">
            <FormatTile
              label="Bulleted list"
              syntax="- item"
              testID="wa-format-bullet"
              onPress={() => choose("bullet")}
            >
              <Text class="text-[14px] leading-none text-foreground">•</Text>
            </FormatTile>
            <FormatTile
              label="Numbered list"
              syntax="1. item"
              testID="wa-format-numbered"
              onPress={() => choose("numbered")}
            >
              <Text class="text-[11px] font-semibold text-foreground">1.</Text>
            </FormatTile>
            <View class="flex-1" />
          </View>
        </View>
      </View>
    </Popover>
  );
}

export function WhatsAppEmojiButton(props: { onEmoji: (emoji: string) => void }) {
  const open = signal(false);
  return (
    <Popover
      open={open()}
      onOpenChange={({ open: next }) => open.set(next)}
      placement="top"
      align="start"
      offset={8}
      popupClass="overflow-hidden rounded-2xl border border-border bg-popover p-2 shadow-2xl"
      popupStyle={{ width: 336, height: 390 }}
      trigger={
        <ComposerTool label="Emoji" testID="wa-format-emoji">
          <Text class="text-[16px] leading-none">☺</Text>
        </ComposerTool>
      }
    >
      <EmojiPicker
        testID="wa-emoji-picker"
        class="h-full"
        columns={8}
        accessibilityLabel="Emoji"
        placeholder="Search emoji"
        groups={[
          "recent",
          "smileysEmotion",
          "peopleBody",
          "animalsNature",
          "foodDrink",
          "activities",
          "objects",
          "symbols",
        ]}
        itemClass="h-8 flex-1 items-center justify-center rounded-md text-[18px]"
        onSelect={({ emoji }) => {
          props.onEmoji(emoji);
          open.set(false);
        }}
      />
    </Popover>
  );
}
