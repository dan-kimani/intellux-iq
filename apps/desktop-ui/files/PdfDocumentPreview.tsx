import { Text, token, View } from "nsh";
import { Button } from "../components/ui";
import type { AttachmentFile } from "./types";

/** A sanitized PDF page, drawn natively so it reads in both themes. */
export function PdfDocumentPreview(props: {
  file: AttachmentFile;
  page: number;
  onPageChange: (page: number) => void;
}) {
  const pdf = props.file.pdf;
  if (!pdf) return null;
  const pages = Math.max(1, pdf.pages);
  const offset = pdf.lines.length > 0 ? ((props.page - 1) * 3) % pdf.lines.length : 0;
  const lines = [...pdf.lines.slice(offset), ...pdf.lines.slice(0, offset)];
  return (
    <View class="w-full items-center gap-3">
      <View
        testID="file-pdf-preview"
        class="w-full max-w-130 gap-3.5 p-7"
        style={{
          backgroundColor: token("document"),
          borderWidth: 1,
          borderColor: token("document-border"),
          borderRadius: 3,
        }}
      >
        <View class="flex-row items-start justify-between">
          <View class="gap-0.5">
            <Text
              class="text-[9px] font-bold uppercase tracking-widest"
              style={{ color: token("document-accent") }}
            >
              Acme Trading Ltd
            </Text>
            <Text class="text-[8px]" style={{ color: token("document-muted") }}>
              Nairobi, Kenya · sales@acmetrading.co.ke
            </Text>
          </View>
          <View class="items-end gap-0.5">
            <Text class="text-[8px]" style={{ color: token("document-muted") }}>
              Cloud-sanitized copy
            </Text>
            <Text class="text-[8px] font-medium" style={{ color: token("document-accent") }}>
              Page {props.page} of {pages}
            </Text>
          </View>
        </View>
        <View class="gap-1">
          <Text
            class="text-[23px] font-semibold tracking-tight"
            style={{ color: token("document-foreground") }}
          >
            {pdf.title}
          </Text>
          <Text class="text-[10px]" style={{ color: token("document-muted") }}>
            {pdf.subtitle}
          </Text>
        </View>
        <View style={{ height: 1, backgroundColor: token("document-border") }} />
        <View class="gap-2">
          <Each of={lines}>
            {(line: () => string) => (
              <Text class="text-[10.5px] leading-5" style={{ color: token("document-foreground") }}>
                {line()}
              </Text>
            )}
          </Each>
        </View>
        <View
          class="mt-2 flex-row items-center justify-between border-t pt-3"
          style={{ borderColor: token("document-border") }}
        >
          <Text class="text-[8px]" style={{ color: token("document-muted") }}>
            Page {props.page} · verified attachment
          </Text>
          <Text class="text-[8px] font-semibold" style={{ color: token("document-accent") }}>
            Acme Trading Ltd
          </Text>
        </View>
      </View>
      <View class="flex-row items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          testID="file-viewer-prev"
          disabled={props.page <= 1}
          accessibilityLabel="Previous page"
          onPress={() => props.onPageChange(Math.max(1, props.page - 1))}
        >
          <Text class="text-[9.5px] font-medium">Previous</Text>
        </Button>
        <Text class="min-w-20 text-center text-[9.5px] text-muted-foreground">
          Page {props.page} of {pages}
        </Text>
        <Button
          variant="outline"
          size="sm"
          testID="file-viewer-next"
          disabled={props.page >= pages}
          accessibilityLabel="Next page"
          onPress={() => props.onPageChange(Math.min(pages, props.page + 1))}
        >
          <Text class="text-[9.5px] font-medium">Next</Text>
        </Button>
      </View>
      <Text class="max-w-130 text-center text-[8.5px] leading-3.5 text-muted-foreground">
        Rendered from the sanitized PDF page synced by the cloud. Interactive forms and external
        links stay disabled in the preview.
      </Text>
    </View>
  );
}
