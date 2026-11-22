import { Image, Share, Text, token, View } from "nsh";
import { Button, Icon, IconButton } from "../components/ui";
import { showToast } from "../state";
import { AppDialog } from "../components/overlay";
import { RightDrawer } from "../components/RightDrawer";
import { PdfDocumentPreview } from "./PdfDocumentPreview";
import { previewFile, requestFileDownload } from "./state";
import type { AttachmentFile } from "./types";
import { fileDescription } from "./types";

function DownloadAction() {
  const file = previewFile();
  if (!file) return null;
  return (
    <Button
      variant="outline"
      size="sm"
      testID="file-viewer-download"
      onPress={() => requestFileDownload(file)}
    >
      <Icon name="download" size={10} tone="muted-foreground" />
      <Text class="text-[12px] font-medium">Download</Text>
    </Button>
  );
}

async function shareCurrentFile() {
  const file = previewFile();
  if (!file) return;
  try {
    if (!(await Share.available())) {
      showToast("Sharing is not available on this device.");
      return;
    }
    await Share.show({
      title: file.name,
      text: `${file.name} · ${fileDescription(file)}`,
    });
  } catch {
    showToast("Could not open the share sheet.");
  }
}

function PdfHeaderActions() {
  return (
    <View class="flex-row items-center gap-0.5">
      <IconButton
        icon="share"
        label="Share PDF"
        size={30}
        testID="file-viewer-share"
        onPress={shareCurrentFile}
      />
      <IconButton
        icon="download"
        label="Download PDF"
        size={30}
        testID="file-viewer-download-header"
        onPress={() => {
          const file = previewFile();
          if (file) requestFileDownload(file);
        }}
      />
    </View>
  );
}

function CloseAction() {
  return (
    <Button
      variant="primary"
      size="sm"
      testID="file-viewer-close"
      onPress={() => previewFile.set(null)}
    >
      <Text class="text-[12px] font-semibold text-primary-foreground">Close</Text>
    </Button>
  );
}

function ViewerContent(props: { file: AttachmentFile | null }) {
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
        <Text class="text-center text-[11px] text-muted-foreground">
          {file.name} · image preview from the sanitized cloud copy
        </Text>
      </View>
    );
  }
  return (
    <View class="items-center gap-2 py-10">
      <Text class="text-[13px] font-medium text-foreground">No in-app preview</Text>
      <Text class="max-w-80 text-center text-[11px] leading-4 text-muted-foreground">
        Save this file to open it with its desktop app. The cloud keeps the original; only the
        verified download reaches this device.
      </Text>
    </View>
  );
}

function isPdf(file: AttachmentFile | null): boolean {
  return file?.kind === "pdf" && Boolean(file.pdf);
}

function currentPdf(): AttachmentFile | null {
  return isPdf(previewFile()) ? previewFile() : null;
}

export function AttachmentViewer() {
  return (
    <>
      <RightDrawer
        open={currentPdf() !== null}
        onClose={() => previewFile.set(null)}
        title={previewFile()?.name ?? "PDF"}
        description={previewFile() ? fileDescription(previewFile()!) : undefined}
        width={900}
        testID="file-viewer"
        headerActions={<PdfHeaderActions />}
      >
        <If when={currentPdf()}>
          <PdfDocumentPreview file={currentPdf()!} />
        </If>
      </RightDrawer>

      <AppDialog
        open={() => previewFile() !== null && !isPdf(previewFile())}
        onClose={() => previewFile.set(null)}
        title={previewFile()?.name ?? "Attachment"}
        description={previewFile() ? fileDescription(previewFile()!) : undefined}
        testID="file-viewer"
        width={760}
        footer={
          previewFile() ? (
            <View class="flex-row items-center gap-2">
              <DownloadAction />
              <CloseAction />
            </View>
          ) : undefined
        }
      >
        <ViewerContent file={previewFile()} />
      </AppDialog>
    </>
  );
}
