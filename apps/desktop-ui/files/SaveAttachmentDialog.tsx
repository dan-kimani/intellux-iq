import { effect, signal, Text, token, View } from "nsh";
import { Button, Icon } from "../components/ui";
import { AppDialog } from "../components/overlay";
import { TextField } from "../components/forms";
import { showToast } from "../state";
import { FileThumb } from "./FileThumb";
import { pendingDownload } from "./state";
import type { AttachmentFile } from "./types";
import { fileDescription } from "./types";

const destinations = ["Downloads", "Documents", "Desktop"];

function FileSummary(props: { file: AttachmentFile | null }) {
  if (!props.file) return null;
  return (
    <View class="flex-row items-center gap-3 rounded-xl border border-border bg-panel p-3">
      <FileThumb file={props.file} height={46} />
      <View class="min-w-0 flex-1 gap-0.5">
        <Text class="text-[12px] font-medium text-foreground" style={{ numberOfLines: 2 }}>
          {props.file.name}
        </Text>
        <Text class="text-[11px] text-muted-foreground">{fileDescription(props.file)}</Text>
      </View>
      <View class="rounded-md border border-border bg-card px-2 py-1">
        <Text class="text-[11px] font-medium text-muted-foreground">Ready to save</Text>
      </View>
    </View>
  );
}

export function SaveAttachmentDialog() {
  const destination = signal("Downloads");
  const name = signal("");
  effect(() => {
    const file = pendingDownload();
    if (file) {
      destination.set("Downloads");
      name.set(file.name);
    }
  });
  const save = () => {
    const target = pendingDownload();
    if (!target) return;
    const savedName = name().trim();
    if (!savedName) {
      showToast("Enter a file name before saving.");
      return;
    }
    pendingDownload.set(null);
    showToast(`Saved ${savedName} to ${destination()}.`);
  };
  return (
    <AppDialog
      open={() => pendingDownload() !== null}
      onClose={() => pendingDownload.set(null)}
      title="Save attachment"
      description="Choose a folder, then save the verified download."
      testID="save-file-dialog"
      width={540}
      footer={
        <View class="flex-row items-center gap-2">
          <Button variant="ghost" size="sm" onPress={() => pendingDownload.set(null)}>
            <Text class="text-[12px] font-medium">Cancel</Text>
          </Button>
          <Button variant="primary" size="sm" testID="confirm-save-file" onPress={save}>
            <Icon name="download" size={10} tone="primary-foreground" />
            <Text class="text-[12px] font-semibold text-primary-foreground">Save</Text>
          </Button>
        </View>
      }
    >
      <View class="gap-4">
        <FileSummary file={pendingDownload()} />
        <View class="gap-1.5">
          <Text class="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
            Save to
          </Text>
          <View class="gap-0.5 rounded-xl border border-border bg-card p-1">
            <Each of={destinations}>
              {(folder: () => string) => (
                <View
                  role="button"
                  accessibilityLabel={`Save to ${folder()}`}
                  testID={`save-location-${folder().toLowerCase()}`}
                  onPress={() => destination.set(folder())}
                  class="flex-row items-center gap-2 rounded-lg px-2.5 py-2"
                  style={{
                    backgroundColor: destination() === folder() ? token("accent") : "transparent",
                  }}
                  hoverStyle={{ backgroundColor: token("accent") }}
                >
                  <Icon
                    name="folder"
                    size={13}
                    tone={destination() === folder() ? "foreground" : "muted-foreground"}
                  />
                  <View class="min-w-0 flex-1">
                    <Text class="text-[12px] font-medium text-foreground">{folder()}</Text>
                  </View>
                  <If when={destination() === folder()}>
                    <Icon name="check" size={11} tone="success" />
                  </If>
                </View>
              )}
            </Each>
          </View>
          <Text class="text-[11px] text-muted-foreground">
            This device · Home / {destination()}
          </Text>
        </View>
        <TextField label="File name" value={name} onChange={name.set} testID="save-file-name" />
        <View class="flex-row items-start gap-2 rounded-lg border border-border bg-panel p-3">
          <Icon name="shieldCheck" size={11} tone="success" />
          <Text class="min-w-0 flex-1 text-[11px] leading-3.5 text-muted-foreground">
            The cloud verifies the attachment before the desktop writes it. Provider credentials and
            SMTP/IMAP never reach this device.
          </Text>
        </View>
      </View>
    </AppDialog>
  );
}
