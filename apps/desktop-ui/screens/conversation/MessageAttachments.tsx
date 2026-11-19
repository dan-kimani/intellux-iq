import type { JSX } from "nsh";
import { Image, Text, token, View } from "nsh";
import { Icon, IconButton, withAlpha } from "../../components/ui";
import { FileThumb } from "../../files/FileThumb";
import { openFilePreview, requestFileDownload } from "../../files/state";
import { attachmentFile, fileKindLabel, imageAttachment, isPreviewable } from "../../files/types";
import type { Message } from "../../data";
import { BubbleMeta } from "./BubbleMeta";
import { statusFor } from "./message-status";

type ImageMessage = Extract<Message, { kind: "image" }>;
type FileMessage = Extract<Message, { kind: "file" }>;

export function ImageBubble(props: { message: ImageMessage; actions?: JSX.Element }) {
  const m = props.message;
  const outgoing = m.from === "me";
  const file = () => imageAttachment(m.fileName ?? "WhatsApp image", m.size ?? "1.4 MB", m.image);
  return (
    <View
      class="relative max-w-97.5 gap-1"
      style={{ alignSelf: outgoing ? "flex-end" : "flex-start" }}
    >
      <View class="relative overflow-hidden rounded-3xl border border-border bg-card shadow-md">
        <View
          role="button"
          accessibilityLabel="View image"
          accessibilityHint={file().name}
          testID={`wa-image-${file().id}`}
          onPress={() => openFilePreview(file())}
          hoverStyle={{ opacity: 0.92 }}
        >
          <Image
            src={m.image}
            fadeDuration={0}
            style={{ width: 370, height: 238, objectFit: "cover" }}
          />
          <View
            class="absolute right-2 top-2 h-6 w-6 items-center justify-center rounded-full"
            style={{ backgroundColor: withAlpha(token("background"), "cc"), pointerEvents: "none" }}
          >
            <Icon name="expand" size={11} tone="foreground" />
          </View>
          <View class="absolute bottom-2 right-2 flex-row items-center gap-1">
            <View
              class="rounded px-1.5 py-0.5"
              style={{
                backgroundColor: withAlpha(token("background"), "cc"),
                pointerEvents: "none",
              }}
            >
              <Text class="text-[9px]" style={{ color: token("foreground") }}>
                {m.time}
              </Text>
            </View>
            <If when={props.actions}>
              <View
                class="rounded-full"
                style={{ backgroundColor: withAlpha(token("background"), "cc") }}
              >
                {props.actions}
              </View>
            </If>
          </View>
        </View>
      </View>
      <If when={m.caption}>
        <Text class="text-[10px] text-muted-foreground">{m.caption}</Text>
      </If>
    </View>
  );
}

export function FileBubble(props: { message: FileMessage; actions?: JSX.Element }) {
  const m = props.message;
  const outgoing = m.from === "me";
  const file = () => attachmentFile(m.fileName, m.size);
  const preview = () => isPreviewable(file());
  return (
    <View
      class="max-w-107.5 gap-1.5 rounded-xl rounded-tr-sm px-4 py-3"
      style={{
        alignSelf: outgoing ? "flex-end" : "flex-start",
        backgroundColor: token("bubble-file"),
      }}
    >
      <View class="flex-row items-center gap-2.5">
        <View
          role="button"
          accessibilityLabel={`${preview() ? "Preview" : "Save"} ${m.fileName}`}
          testID={`wa-file-${file().id}`}
          onPress={() => (preview() ? openFilePreview(file()) : requestFileDownload(file()))}
          class="min-w-0 flex-1 flex-row items-center gap-2.5 rounded-lg"
          hoverStyle={{ opacity: 0.82 }}
          activeStyle={{ opacity: 0.7 }}
          focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 2 }}
        >
          <FileThumb file={file()} height={40} />
          <View class="min-w-0 flex-1 gap-0.5">
            <Text
              class="text-[12px] font-medium text-bubble-file-foreground"
              style={{ numberOfLines: 1 }}
            >
              {m.fileName}
            </Text>
            <View class="flex-row items-center gap-1">
              <Text class="text-[9.5px] text-bubble-file-foreground/70">
                {m.size} · {fileKindLabel[file().kind]} · {preview() ? "Preview" : "Save"}
              </Text>
              <Icon name={preview() ? "eye" : "download"} size={9} tone="bubble-file-foreground" />
            </View>
          </View>
        </View>
        <IconButton
          icon="download"
          label="Download attachment"
          size={28}
          tone="bubble-file-foreground"
          onPress={() => requestFileDownload(file())}
        />
      </View>
      <BubbleMeta time={m.time} outgoing={outgoing} status={statusFor(m)} actions={props.actions} />
    </View>
  );
}
