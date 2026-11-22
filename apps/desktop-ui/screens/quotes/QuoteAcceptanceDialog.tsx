import { signal, Text, token, View } from "nsh";
import { AppDialog, DialogActions, FormRow, ModalNotice } from "../../components/overlay";
import { TextField } from "../../components/forms";
import { Button, Icon } from "../../components/ui";
import type { QuoteRow } from "./data";
import { recordAcceptance } from "./state";

const closeAcceptance = (onClose: () => void) => onClose();

export function QuoteAcceptanceDialog(props: { quote: QuoteRow; onClose: () => void }) {
  const reference = signal("");
  const note = signal("");
  const confirmed = signal(false);
  const valid = () => confirmed() && reference().trim().length > 0;
  return (
    <AppDialog
      open={() => true}
      onClose={() => closeAcceptance(props.onClose)}
      title="Record customer acceptance"
      description={`${props.quote.id} · ${props.quote.customer}`}
      width={540}
      testID="quote-acceptance-dialog"
      footer={
        <DialogActions>
          <Button variant="ghost" size="sm" onPress={props.onClose}>
            <Text class="text-[13px] font-medium">Cancel</Text>
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!valid()}
            testID="confirm-quote-acceptance"
            onPress={() => {
              recordAcceptance(props.quote, reference().trim(), note().trim());
              props.onClose();
            }}
          >
            <Icon name="check" size={12} tone="primary-foreground" />
            <Text class="text-[13px] font-semibold text-primary-foreground">Record acceptance</Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-4">
        <ModalNotice
          icon="shieldCheck"
          title="Acceptance is an audited commercial event"
          detail="Record the customer’s written acceptance or purchase-order reference. The action is recorded with the user and timestamp."
        />
        <TextField
          label="Customer PO / acceptance reference"
          value={reference}
          onChange={reference.set}
          placeholder="PO-2025-0117 or email confirmation"
          testID="acceptance-reference"
        />
        <TextField
          label="Internal note"
          value={note}
          onChange={note.set}
          placeholder="Optional context for finance or delivery"
        />
        <View
          role="button"
          accessibilityLabel="Confirm customer acceptance"
          onPress={() => confirmed.set(!confirmed())}
          class="flex-row items-start gap-2.5 rounded-lg border border-border bg-panel p-3"
          hoverStyle={{ backgroundColor: token("accent") }}
        >
          <View
            class="mt-0.5 h-4 w-4 items-center justify-center rounded border"
            style={{
              borderColor: confirmed() ? token("primary") : token("border"),
              backgroundColor: confirmed() ? token("primary") : "transparent",
            }}
          >
            <If when={confirmed()}>
              <Icon name="check" size={10} tone="primary-foreground" />
            </If>
          </View>
          <View class="min-w-0 flex-1 gap-0.5">
            <Text class="text-[13px] font-medium text-foreground">
              I confirm the customer accepted this quotation
            </Text>
            <Text class="text-[12px] leading-4 text-muted-foreground">
              This records a deliberate internal acceptance with an audit trail. It does not mark
              the opportunity won automatically.
            </Text>
          </View>
        </View>
        <FormRow>
          <Text class="text-[12px] text-muted-foreground">
            Accepted totals remain locked. The opportunity owner or manager can still update the
            deal stage separately.
          </Text>
        </FormRow>
      </View>
    </AppDialog>
  );
}
