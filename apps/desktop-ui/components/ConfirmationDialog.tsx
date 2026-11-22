import type { JSX } from "nsh";
import { signal, Text, token, View } from "nsh";
import { AppDialog, DialogActions } from "./overlay";
import { Button, Icon } from "./ui";

export interface ConfirmationRequest {
  title: string;
  description: string;
  confirmLabel?: string;
  icon?: "trash" | "info";
  onConfirm: () => void;
}

export const confirmationRequest = signal<ConfirmationRequest | null>(null);

export function requestConfirmation(request: ConfirmationRequest): void {
  confirmationRequest.set(request);
}

export function closeConfirmation(): void {
  confirmationRequest.set(null);
}

function currentConfirmation() {
  return confirmationRequest();
}

export function ConfirmDialogHost(): JSX.Element {
  return (
    <If when={currentConfirmation()}>
      <AppDialog
        open={() => true}
        onClose={closeConfirmation}
        title={currentConfirmation()?.title ?? ""}
        description={currentConfirmation()?.description}
        testID="confirm-dialog"
        width={430}
        footer={
          <DialogActions>
            <Button
              variant="ghost"
              size="sm"
              testID="confirm-dialog-cancel"
              onPress={closeConfirmation}
            >
              <Text class="text-[12px] font-medium">Cancel</Text>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              testID="confirm-dialog-delete"
              onPress={() => {
                const action = currentConfirmation();
                closeConfirmation();
                action?.onConfirm();
              }}
            >
              <Icon
                name={currentConfirmation()?.icon ?? "trash"}
                size={11}
                tone="alert-foreground"
              />
              <Text class="text-[12px] font-semibold text-alert-foreground">
                {currentConfirmation()?.confirmLabel ?? "Delete"}
              </Text>
            </Button>
          </DialogActions>
        }
      >
        <View class="flex-row items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 p-3">
          <View
            class="mt-0.5 h-6 w-6 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: token("destructive") }}
          >
            <Icon name={currentConfirmation()?.icon ?? "trash"} size={12} tone="alert-foreground" />
          </View>
          <Text class="min-w-0 flex-1 text-[12px] leading-4.5 text-muted-foreground">
            This action cannot be undone. Nothing is removed until you confirm.
          </Text>
        </View>
      </AppDialog>
    </If>
  );
}
