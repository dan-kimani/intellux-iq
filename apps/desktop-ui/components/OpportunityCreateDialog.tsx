import { signal, Text, View } from "nsh";
import { AppDialog, DialogActions, FormGrid, ModalNotice } from "./overlay";
import { SelectField, TextField } from "./forms";
import { Button, Icon } from "./ui";
import { allConversations, currentMember, showToast } from "../state";
import { openStages, stageLabel, stageOrder, type Stage } from "../domain/stages";
import { createOpportunity, opportunityOwnerOptions } from "../screens/opportunities/actions";
import { closeNewOpportunity, opportunityDraft } from "../screens/opportunities/state";
import { openOpportunityPanel } from "../screens/details/panelState";

export function OpportunityCreateDialog() {
  const draft = opportunityDraft();
  const conversation = allConversations().find((row) => row.id === draft?.conversationId);
  const name = signal("");
  const value = signal("");
  const product = signal("");
  const expectedClose = signal("");
  const nextStep = signal("");
  const owner = signal(currentMember.name);
  const stage = signal<Stage>("enquiry");

  const save = () => {
    if (!conversation) return;
    if (!name().trim()) {
      showToast("Give the opportunity a name.");
      return;
    }
    const deal = createOpportunity({
      conversation,
      name: name(),
      value: value(),
      product: product(),
      stage: stage(),
      owner: owner(),
      expectedClose: expectedClose(),
      nextStep: nextStep(),
      sourceMessageId: draft?.sourceMessageId,
    });
    closeNewOpportunity();
    openOpportunityPanel(deal.id, conversation.id);
    showToast(`${deal.name} created.`);
  };

  return (
    <AppDialog
      open={() => true}
      onClose={closeNewOpportunity}
      title="New opportunity"
      description={
        conversation
          ? `${conversation.name} · ${conversation.company}`
          : "Create a sales pursuit for this contact."
      }
      width={560}
      testID="new-opportunity-dialog"
      footer={
        <DialogActions>
          <Button variant="ghost" size="sm" onPress={closeNewOpportunity}>
            <Text class="text-[12px] font-medium">Cancel</Text>
          </Button>
          <Button variant="primary" size="sm" onPress={save} testID="create-opportunity">
            <Icon name="plus" size={11} tone="primary-foreground" />
            <Text class="text-[12px] font-semibold text-primary-foreground">
              Create opportunity
            </Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-4">
        <FormGrid>
          <TextField
            label="Opportunity"
            value={name}
            onChange={name.set}
            placeholder="Acme — Q4 packaging"
            hint="Required"
            testID="new-opportunity-name"
          />
          <TextField
            label="Estimated value"
            value={value}
            onChange={value.set}
            placeholder="$248,500"
            testID="new-opportunity-value"
          />
          <TextField
            label="Product / quantity"
            value={product}
            onChange={product.set}
            placeholder="50 units · ProMax"
            testID="new-opportunity-product"
          />
          <TextField
            label="Expected close"
            value={expectedClose}
            onChange={expectedClose.set}
            placeholder="22 Nov"
            testID="new-opportunity-close"
          />
        </FormGrid>
        <FormGrid>
          <SelectField
            label="Owner"
            value={owner}
            options={opportunityOwnerOptions()}
            onChange={owner.set}
          />
          <SelectField
            label="Starting stage"
            value={() => stageLabel(stage())}
            options={openStages.map((item) => stageLabel(item))}
            onChange={(label) => {
              const match = stageOrder.find((item) => stageLabel(item) === label);
              if (match) stage.set(match);
            }}
          />
        </FormGrid>
        <TextField
          label="Next step"
          value={nextStep}
          onChange={nextStep.set}
          placeholder="Confirm quantities and send a quote"
          testID="new-opportunity-next"
        />
        <ModalNotice
          icon="shieldCheck"
          title="One opportunity per pursuit"
          detail="Stage, value, products, and quotes live on the opportunity. The conversation keeps the messages."
        />
      </View>
    </AppDialog>
  );
}
