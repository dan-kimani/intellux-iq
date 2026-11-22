import { Text, token, View } from "nsh";
import type { AttachmentFile } from "./types";

/** All sanitized PDF pages, stacked vertically and scrolled by the viewer. */
export function PdfDocumentPreview(props: { file: AttachmentFile }) {
  const pdf = props.file.pdf;
  if (!pdf) return null;
  const pages = Math.max(1, pdf.pages);
  return (
    <View class="w-full gap-4">
      <Each of={Array.from({ length: pages }, (_, index) => index + 1)}>
        {(page: () => number) => {
          const offset = pdf.lines.length > 0 ? ((page() - 1) * 3) % pdf.lines.length : 0;
          const lines = [...pdf.lines.slice(offset), ...pdf.lines.slice(0, offset)];
          return (
            <View
              testID={`file-pdf-page-${page()}`}
              class="w-full gap-3.5 p-7"
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
                    class="text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: token("document-accent") }}
                  >
                    Acme Trading Inc.
                  </Text>
                  <Text class="text-[11px]" style={{ color: token("document-muted") }}>
                    New York, US · sales@acmetrading.com
                  </Text>
                </View>
                <View class="items-end gap-0.5">
                  <Text class="text-[11px]" style={{ color: token("document-muted") }}>
                    Cloud-sanitized copy
                  </Text>
                  <Text class="text-[11px] font-medium" style={{ color: token("document-accent") }}>
                    Page {page()} of {pages}
                  </Text>
                </View>
              </View>
              <View class="gap-1">
                <Text
                  class="text-[24px] font-semibold"
                  style={{ color: token("document-foreground") }}
                >
                  {pdf.title}
                </Text>
                <Text class="text-[12px]" style={{ color: token("document-muted") }}>
                  {pdf.subtitle}
                </Text>
              </View>
              <View style={{ height: 1, backgroundColor: token("document-border") }} />
              <View class="gap-2">
                <Each of={lines}>
                  {(line: () => string) => (
                    <Text
                      class="text-[12px] leading-5"
                      style={{ color: token("document-foreground") }}
                    >
                      {line()}
                    </Text>
                  )}
                </Each>
              </View>
              <View
                class="mt-2 flex-row items-center justify-between border-t pt-3"
                style={{ borderColor: token("document-border") }}
              >
                <Text class="text-[11px]" style={{ color: token("document-muted") }}>
                  Page {page()} · verified attachment
                </Text>
                <Text class="text-[11px] font-semibold" style={{ color: token("document-accent") }}>
                  Acme Trading Inc.
                </Text>
              </View>
            </View>
          );
        }}
      </Each>
      <Text class="text-center text-[11px] leading-3.5 text-muted-foreground">
        Rendered from the sanitized PDF pages synced by the cloud. Interactive forms and external
        links stay disabled in the preview.
      </Text>
    </View>
  );
}
