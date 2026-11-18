import type { Tokens } from "nsh";
import { Image, Text, token, View } from "nsh";
import { Icon, type IconName, withAlpha } from "../components/ui";
import type { AttachmentFile, FileKind } from "./types";
import { fileExtension } from "./types";

const kinds: Record<FileKind, { tone: keyof Tokens; icon: IconName }> = {
  pdf: { tone: "series-5", icon: "fileText" },
  image: { tone: "series-6", icon: "image" },
  document: { tone: "series-1", icon: "fileText" },
  spreadsheet: { tone: "series-3", icon: "table" },
  presentation: { tone: "series-4", icon: "presentation" },
  archive: { tone: "series-2", icon: "archive" },
  text: { tone: "muted-foreground", icon: "fileText" },
  audio: { tone: "series-5", icon: "mic" },
  video: { tone: "series-2", icon: "video" },
  other: { tone: "muted-foreground", icon: "fileText" },
};

/** A file's type as a colored tile, or its own picture when it is an image. */
export function FileThumb(props: { file: AttachmentFile; height?: number }) {
  const height = props.height ?? 44;
  const width = Math.round(height * 0.84);
  const look = kinds[props.file.kind];
  if (props.file.kind === "image" && props.file.src) {
    return (
      <View
        accessibilityElementsHidden
        class="shrink-0 overflow-hidden rounded-lg border border-border bg-muted"
        style={{ width, height }}
      >
        <Image
          src={props.file.src}
          fadeDuration={0}
          style={{ width, height, objectFit: "cover" }}
        />
      </View>
    );
  }
  return (
    <View
      accessibilityElementsHidden
      class="shrink-0 overflow-hidden rounded-lg border"
      style={{
        width,
        height,
        backgroundColor: withAlpha(token(look.tone) as string, "16"),
        borderColor: withAlpha(token(look.tone) as string, "38"),
      }}
    >
      <View style={{ height: 3, backgroundColor: token(look.tone) as string }} />
      <View class="flex-1 items-center justify-center">
        <Icon name={look.icon} size={Math.round(height * 0.36)} tone={look.tone} />
      </View>
      <Text
        class="w-full pb-0.5 text-center font-semibold tracking-wide"
        style={{
          fontSize: Math.max(6, Math.round(height * 0.14)),
          color: token(look.tone) as string,
        }}
      >
        {fileExtension(props.file.name)}
      </Text>
    </View>
  );
}
