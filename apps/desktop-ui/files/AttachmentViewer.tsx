import { effect, Image, signal, Text, token, View } from "nsh";
import { Button, Icon } from "../components/ui";
import { AppDialog } from "../components/overlay";
import { PdfDocumentPreview } from "./PdfDocumentPreview";
import { previewFile, requestFileDownload } from "./state";
import type { AttachmentFile } from "./types";
import { fileDescription } from "./types";

function ViewerContent(props: {
  file: AttachmentFile | null;
  page: number;
  onPageChange: (page: number) => void;
}) {
  const file = props.file;
  if (!file) return null;
  if (file.kind === "image" && file.src) {
    return (
      <View class="gap-2">
        <View
          class="overflow-hidden rounded-2xl border border-border"
          style={{ backgroundColor: token("panel") }}
        >
          <Image
            src={file.src}
            fadeDuration={0}
            style={{ width: "100%", height: 420, objectFit: "contain" }}
          />
        </View>
        <Text class="text-center text-[9px] text-muted-foreground">
          {file.name} · image preview from the sanitized cloud copy
        </Text>
      </View>
    );
  }
  if (file.kind === "pdf" && file.pdf) {
    return <PdfDocumentPreview file={file} page={props.page} onPageChange={props.onPageChange} />;
  }
  return (
    <View class="items-center gap-2 py-10">
      <Text class="text-[12px] font-medium text-foreground">No in-app preview</Text>
      <Text class="max-w-80 text-center text-[9.5px] leading-4 text-muted-foreground">
        Save this file to open it with its desktop app. The cloud keeps the original; only the
        verified download reaches this device.
      </Text>
    </View>
  );
}

export function AttachmentViewer() {
  const page = signal(1);
  effect(() => {
    if (previewFile()) page.set(1);
  });
  return (
    <AppDialog
      open={() => previewFile() !== null}
      onClose={() => previewFile.set(null)}
      title={previewFile()?.name ?? "Attachment"}
      description={previewFile() ? fileDescription(previewFile()!) : undefined}
      testID="file-viewer"
      width={760}
      footer={
        previewFile() ? (
          <View class="flex-row items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              testID="file-viewer-download"
              onPress={() => requestFileDownload(previewFile()!)}
            >
              <Icon name="download" size={10} tone="muted-foreground" />
              <Text class="text-[10px] font-medium">Download</Text>
            </Button>
            <Button
              variant="primary"
              size="sm"
              testID="file-viewer-close"
              onPress={() => previewFile.set(null)}
            >
              <Text class="text-[10px] font-semibold text-primary-foreground">Close</Text>
            </Button>
          </View>
        ) : undefined
      }
    >
      <ViewerContent file={previewFile()} page={page()} onPageChange={page.set} />
    </AppDialog>
  );
}
