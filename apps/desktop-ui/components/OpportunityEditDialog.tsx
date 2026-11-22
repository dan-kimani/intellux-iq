import { signal, Text, View } from "nsh";
import { AppDialog, DialogActions } from "./overlay";
import { TextField } from "./forms";
import { Button, Icon } from "./ui";
import { editOpportunityOpen, editingOpportunityId, opportunityLinks, showToast } from "../state";
import { updateOpportunityDetails } from "../screens/opportunities/actions";
import { dealRows } from "../screens/deals/state";

export function OpportunityEditDialog() {
  const opportunity = opportunityLinks().find((row) => row.id === editingOpportunityId());
  const deal = dealRows().find((row) => row.id === editingOpportunityId());
  const value = signal(deal?.value ?? opportunity?.value ?? "");
  const probability = signal(`${deal?.probability ?? opportunity?.probability ?? 20}`);
  const product = signal(deal?.product ?? opportunity?.product ?? "");
  const expectedClose = signal(deal?.expectedClose ?? opportunity?.expectedClose ?? "");
  const nextStep = signal(deal?.nextStep ?? opportunity?.nextStep ?? "");
  const save = () => {
    if (!opportunity) return;
    const parsed = Number.parseInt(probability(), 10);
    updateOpportunityDetails(opportunity.id, {
      value: value().trim(),
      probability: Number.isFinite(parsed)
        ? Math.max(0, Math.min(100, parsed))
        : opportunity.probability,
      product: product().trim(),
      expectedClose: expectedClose().trim(),
      nextStep: nextStep().trim(),
    });
    editOpportunityOpen.set(false);
    showToast("Opportunity updated.");
  };
  return (
    <AppDialog
      open={() => true}
      onClose={() => editOpportunityOpen.set(false)}
      title="Edit opportunity"
      description={opportunity?.name ?? "Linked opportunity"}
      width={470}
      testID="opportunity-edit-dialog"
      footer={
        <DialogActions>
          <Button variant="ghost" size="sm" onPress={() => editOpportunityOpen.set(false)}>
            <Text class="text-[12px] font-medium">Cancel</Text>
          </Button>
          <Button variant="primary" size="sm" testID="save-opportunity" onPress={save}>
            <Icon name="check" size={11} tone="primary-foreground" />
            <Text class="text-[12px] font-semibold text-primary-foreground">Save</Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-3">
        <TextField
          label="Estimated value"
          value={value}
          onChange={value.set}
          testID="opportunity-value"
        />
        <TextField
          label="Probability (%)"
          value={probability}
          onChange={probability.set}
          testID="opportunity-probability"
        />
        <TextField
          label="Product / quantity"
          value={product}
          onChange={product.set}
          placeholder="50 units · ProMax"
          testID="opportunity-product"
        />
        <View class="flex-row gap-2">
          <View class="flex-1">
            <TextField
              label="Expected close"
              value={expectedClose}
              onChange={expectedClose.set}

              testID="opportunity-close"
            />
          </View>
          <View class="flex-1">
            <TextField
              label="Next step"
              value={nextStep}
              onChange={nextStep.set}

              testID="opportunity-next"
            />
          </View>
        </View>
        <Text class="text-[11px] leading-3.5 text-muted-foreground">
          Value and probability stay on the opportunity, never the conversation. Stage moves are
          recorded separately in the opportunity's history.
        </Text>
      </View>
    </AppDialog>
  );
}
