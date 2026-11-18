import { Text, token, View } from "nsh";
import { Icon, SectionTitle } from "../components/ui";
import { openFilePreview, requestFileDownload } from "./state";
import { FileThumb } from "./FileThumb";
import type { AttachmentFile } from "./types";
import { fileDescription, isPreviewable } from "./types";

function AttachmentRow(props: { file: AttachmentFile }) {
  const preview = isPreviewable(props.file);
  return (
    <View
      role="button"
      accessibilityLabel={`${preview ? "Preview" : "Save"} ${props.file.name}`}
      accessibilityHint={preview ? "Opens the file viewer" : "Opens the save sheet"}
      testID={`file-${props.file.id}`}
      onPress={() => (preview ? openFilePreview(props.file) : requestFileDownload(props.file))}
      class="flex-row items-center gap-2.5 rounded-xl px-2 py-1.5"
      hoverStyle={{ backgroundColor: token("accent") }}
      activeStyle={{ opacity: 0.74 }}
      focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
    >
      <FileThumb file={props.file} />
      <View class="min-w-0 flex-1 gap-0.5">
        <Text class="text-[10.5px] font-medium text-foreground" style={{ numberOfLines: 1 }}>
          {props.file.name}
        </Text>
        <Text class="text-[9px] text-muted-foreground">{fileDescription(props.file)}</Text>
      </View>
      <View class="flex-row items-center gap-1 rounded-md border border-border bg-card px-1.5 py-1">
        <Text class="text-[8.5px] font-medium text-muted-foreground">
          {preview ? "Preview" : "Save"}
        </Text>
        <Icon name={preview ? "expand" : "download"} size={9} tone="muted-foreground" />
      </View>
    </View>
  );
}

export function AttachmentList(props: { files: AttachmentFile[] }) {
  return (
    <View
      testID="mail-attachments"
      class="gap-2 rounded-3xl border border-border bg-card p-3 shadow-md"
    >
      <View class="flex-row items-center gap-2">
        <SectionTitle>Attachments</SectionTitle>
        <View class="h-4 min-w-4 items-center justify-center rounded-md bg-muted px-1">
          <Text class="text-[8px] font-semibold text-muted-foreground">{props.files.length}</Text>
        </View>
        <View class="flex-1" />
        <Text class="text-[8.5px] text-muted-foreground">
          Images and PDFs preview · other files save
        </Text>
      </View>
      <View class="gap-0.5">
        <Each of={props.files}>
          {(file: () => AttachmentFile) => <AttachmentRow file={file()} />}
        </Each>
      </View>
    </View>
  );
}
