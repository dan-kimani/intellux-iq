import { signal, Text, View } from "nsh";
import { AppDialog, DialogActions } from "./overlay";
import { TextField } from "./forms";
import { Button, Icon } from "./ui";
import { editOpportunityOpen, editingOpportunityId, opportunityLinks, showToast } from "../state";
import { setOpportunityValue } from "../screens/opportunities/actions";

export function OpportunityEditDialog() {
  const opportunity = opportunityLinks().find((row) => row.id === editingOpportunityId());
  const value = signal(opportunity?.value ?? "");
  const probability = signal(`${opportunity?.probability ?? 20}`);
  return (
    <AppDialog
      open={() => true}
      onClose={() => editOpportunityOpen.set(false)}
      title="Edit opportunity"
      description={opportunity?.name ?? "Linked opportunity"}
      width={430}
      testID="opportunity-edit-dialog"
      footer={
        <DialogActions>
          <Button variant="ghost" size="sm" onPress={() => editOpportunityOpen.set(false)}>
            <Text class="text-[10px] font-medium">Cancel</Text>
          </Button>
          <Button
            variant="primary"
            size="sm"
            testID="save-opportunity"
            onPress={() => {
              if (!opportunity) return;
              const parsed = Number.parseInt(probability(), 10);
              setOpportunityValue(
                opportunity.id,
                value().trim(),
                Number.isFinite(parsed)
                  ? Math.max(0, Math.min(100, parsed))
                  : opportunity.probability,
              );
              editOpportunityOpen.set(false);
              showToast("Opportunity value updated.");
            }}
          >
            <Icon name="check" size={11} tone="primary-foreground" />
            <Text class="text-[10px] font-semibold text-primary-foreground">Save</Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-3">
        <TextField label="Value" value={value} onChange={value.set} testID="opportunity-value" />
        <TextField
          label="Probability (%)"
          value={probability}
          onChange={probability.set}
          testID="opportunity-probability"
        />
        <Text class="text-[9px] leading-3.5 text-muted-foreground">
          Value and probability stay on the opportunity, never the conversation. A manager or the
          opportunity owner can change them.
        </Text>
      </View>
    </AppDialog>
  );
}
