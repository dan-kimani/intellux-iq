import { signal, Text, token, View } from "nsh";
import { AppDialog, DialogActions, ModalNotice } from "../../components/overlay";
import { Button, Icon } from "../../components/ui";
import { attachmentOpen, attachmentPreset, composerAttachment, showToast } from "../../state";

const closeAttachments = () => {
  attachmentOpen.set(false);
  attachmentPreset.set(null);
};

export function AttachmentDialog() {
  const selected = signal<string | null>(attachmentPreset());
  const optimize = signal(true);
  const options = [
    {
      id: "file",
      icon: "paperclip" as const,
      title: "Document",
      detail: "PDF, DOCX, XLSX · max 100 MB",
    },
    {
      id: "image",
      icon: "image" as const,
      title: "Image",
      detail: "JPEG or PNG · max 5 MB · WebP is not accepted",
    },
    {
      id: "voice",
      icon: "mic" as const,
      title: "Voice note",
      detail: "OGG/Opus · max 16 MB · 0:32 sample",
    },
  ];
  return (
    <AppDialog
      open={() => true}
      onClose={closeAttachments}
      title="Add attachment"
      description="Attach a file, image, or voice note to the message."
      width={500}
      testID="attachment-dialog"
      footer={
        <DialogActions>
          <Button variant="ghost" size="sm" onPress={closeAttachments}>
            <Text class="text-[12px] font-medium">Cancel</Text>
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!selected()}
            onPress={() => {
              const label = selected()
                ? (options.find((option) => option.id === selected())?.title ?? "File")
                : "File";
              composerAttachment.set(
                selected() === "image" && optimize() ? `${label} · optimized` : label,
              );
              closeAttachments();
              showToast(`${label} attached to the draft.`);
            }}
            testID="confirm-attachment"
          >
            <Icon name="paperclip" size={11} tone="primary-foreground" />
            <Text class="text-[12px] font-semibold text-primary-foreground">Attach</Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-4">
        <View class="gap-1.5">
          <Each of={options}>
            {(option: () => (typeof options)[number]) => (
              <View
                role="button"
                accessibilityLabel={option().title}
                onPress={() => selected.set(option().id)}
                class="flex-row items-center gap-2.5 rounded-xl border p-3"
                style={{
                  backgroundColor: selected() === option().id ? token("accent") : "transparent",
                  borderColor: selected() === option().id ? token("ring") : token("border"),
                }}
                hoverStyle={{ backgroundColor: token("accent") }}
              >
                <View class="h-8 w-8 items-center justify-center rounded-lg bg-muted">
                  <Icon name={option().icon} size={14} tone="muted-foreground" />
                </View>
                <View class="min-w-0 flex-1 gap-0.5">
                  <Text class="text-[12px] font-medium text-foreground">{option().title}</Text>
                  <Text class="text-[11px] text-muted-foreground">{option().detail}</Text>
                </View>
                <View
                  class="h-4 w-4 items-center justify-center rounded-full border"
                  style={{
                    borderColor: selected() === option().id ? token("primary") : token("border"),
                  }}
                >
                  <If when={selected() === option().id}>
                    <View class="h-2 w-2 rounded-full bg-primary" />
                  </If>
                </View>
              </View>
            )}
          </Each>
        </View>
        <View class="gap-2 rounded-lg border border-border bg-panel p-2.5">
          <View class="flex-row items-center justify-between">
            <Text class="text-[11px] font-medium text-foreground">Desktop preflight</Text>
            <View
              role="button"
              accessibilityLabel="Toggle optimize for WhatsApp"
              onPress={() => optimize.set(!optimize())}
              class="h-5 flex-row items-center gap-1 rounded border border-border px-1.5"
              hoverStyle={{ backgroundColor: token("accent") }}
            >
              <View
                class="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: optimize() ? token("success") : token("muted-foreground"),
                }}
              />
              <Text class="text-[11px] font-medium text-foreground">Optimize</Text>
            </View>
          </View>
          <Text class="text-[11px] leading-3.5 text-muted-foreground">
            Format, size, dimensions, and codec are checked locally. Images are converted to
            JPEG/PNG for WhatsApp; originals stay local.
          </Text>
        </View>
        <ModalNotice
          icon="shieldCheck"
          title="Cloud media owns delivery"
          detail="The desktop never uploads directly to a provider. The cloud validates, caches, and sends the media."
        />
      </View>
    </AppDialog>
  );
}
