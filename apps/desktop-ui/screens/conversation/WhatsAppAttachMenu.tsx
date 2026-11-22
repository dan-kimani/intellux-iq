import { signal, Text, token, View } from "nsh";
import { Popover } from "nsh/base";
import type { AttachmentKind } from "../../state";
import { Icon, withAlpha } from "../../components/ui";
import { ComposerTool } from "./WhatsAppComposerTools";

function AttachItem(props: {
  label: string;
  testID: string;
  icon: "fileText" | "image" | "mic" | "zap";
  tone: "series-1" | "series-2" | "series-3" | "series-4" | "series-6";
  onPress: () => void;
}) {
  return (
    <View
      role="button"
      accessibilityLabel={props.label}
      testID={props.testID}
      onPress={props.onPress}
      class="h-9 flex-row items-center gap-2.5 rounded-lg px-2"
      hoverStyle={{ backgroundColor: token("accent") }}
      activeStyle={{ opacity: 0.7 }}
      focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: -2 }}
    >
      <View
        class="h-6 w-6 items-center justify-center rounded-md"
        style={{ backgroundColor: withAlpha(token(props.tone), "20") }}
      >
        <Icon name={props.icon} size={13} tone={props.tone} />
      </View>
      <Text class="text-[12px] text-foreground">{props.label}</Text>
    </View>
  );
}

export function WhatsAppAttachMenu(props: {
  onAttach: (kind: AttachmentKind) => void;
  onQuickReplies: () => void;
}) {
  const open = signal(false);
  const choose = (kind: AttachmentKind) => {
    open.set(false);
    props.onAttach(kind);
  };
  return (
    <Popover
      open={open()}
      onOpenChange={({ open: next }) => open.set(next)}
      placement="top"
      align="start"
      offset={8}
      popupClass="rounded-2xl border border-border bg-popover p-1.5 shadow-2xl"
      popupStyle={{ width: 228 }}
      trigger={
        <ComposerTool label="Add attachment" testID="wa-attach-menu" filled>
          <Icon name="paperclip" size={15} tone="muted-foreground" />
        </ComposerTool>
      }
    >
      <View testID="wa-attachment-menu" class="gap-0.5">
        <Text class="px-2 pb-1 pt-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Attach
        </Text>
        <AttachItem
          label="Document"
          testID="wa-attach-document"
          icon="fileText"
          tone="series-2"
          onPress={() => choose("file")}
        />
        <AttachItem
          label="Photos & videos"
          testID="wa-attach-image"
          icon="image"
          tone="series-1"
          onPress={() => choose("image")}
        />
        <AttachItem
          label="Audio"
          testID="wa-attach-audio"
          icon="mic"
          tone="series-4"
          onPress={() => choose("voice")}
        />
        <View class="my-1 h-px bg-border" />
        <AttachItem
          label="Quick replies"
          testID="wa-attach-quick-replies"
          icon="zap"
          tone="series-3"
          onPress={() => {
            open.set(false);
            props.onQuickReplies();
          }}
        />
      </View>
    </Popover>
  );
}
