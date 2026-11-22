import { Image, Text, token, View } from "nsh";
import { Icon } from "../components/ui";
import { FileThumb } from "./FileThumb";
import { openFilePreview, requestFileDownload } from "./state";
import { fileDescription, isPreviewable } from "./types";
import type { AttachmentFile } from "./types";

function AttachmentPreview(props: { file: AttachmentFile }) {
  const preview = isPreviewable(props.file);
  return (
    <View
      role="button"
      accessibilityLabel={`${preview ? "Preview" : "Save"} ${props.file.name}`}
      accessibilityHint={preview ? "Opens the file viewer" : "Opens the save sheet"}
      testID={`file-${props.file.id}`}
      onPress={() => (preview ? openFilePreview(props.file) : requestFileDownload(props.file))}
      class="w-30 shrink-0 gap-1 rounded-lg border border-border bg-panel p-1.5"
      hoverStyle={{ backgroundColor: token("accent"), borderColor: token("ring") }}
      activeStyle={{ opacity: 0.74 }}
      focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
    >
      <View class="relative h-20 w-full overflow-hidden rounded-md bg-muted">
        <If
          when={props.file.kind === "image" && props.file.src}
          else={
            <View class="h-full w-full items-center justify-center">
              <FileThumb file={props.file} height={62} />
            </View>
          }
        >
          <Image
            src={props.file.src!}
            fadeDuration={0}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </If>
        <View class="absolute right-1 top-1 h-5 w-5 items-center justify-center rounded-md border border-border bg-background/90">
          <Icon name={preview ? "expand" : "download"} size={10} tone="muted-foreground" />
        </View>
      </View>
      <Text
        class="text-[11px] font-medium leading-3.5 text-foreground"
        style={{ numberOfLines: 2 }}
      >
        {props.file.name}
      </Text>
      <Text class="text-[10px] leading-3 text-muted-foreground" style={{ numberOfLines: 1 }}>
        {fileDescription(props.file)}
      </Text>
    </View>
  );
}

export function AttachmentPreviews(props: { files: AttachmentFile[] }) {
  return (
    <View testID="mail-attachment-previews" class="flex-row flex-wrap gap-2">
      <Each of={props.files}>
        {(file: () => AttachmentFile) => <AttachmentPreview file={file()} />}
      </Each>
    </View>
  );
}
