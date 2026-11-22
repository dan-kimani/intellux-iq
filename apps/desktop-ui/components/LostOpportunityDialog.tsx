import { signal, Text, View } from "nsh";
import { AppDialog, DialogActions } from "./overlay";
import { TextField } from "./forms";
import { Button, Icon } from "./ui";
import { opportunityLinks, showToast } from "../state";
import { setOpportunityStage } from "../screens/opportunities/actions";
import { closeLostReason, lostOpportunityId } from "../screens/opportunities/state";
import { stageLabel } from "../domain/stages";

export function LostOpportunityDialog() {
  const id = lostOpportunityId();
  const opportunity = opportunityLinks().find((row) => row.id === id);
  const reason = signal("");
  return (
    <AppDialog
      open={() => true}
      onClose={closeLostReason}
      title="Mark opportunity lost"
      description={opportunity ? opportunity.name : "Close this opportunity with a reason."}
      width={430}
      testID="lost-opportunity-dialog"
      footer={
        <DialogActions>
          <Button variant="ghost" size="sm" onPress={closeLostReason}>
            <Text class="text-[12px] font-medium">Cancel</Text>
          </Button>
          <Button
            variant="primary"
            size="sm"
            testID="confirm-lost"
            onPress={() => {
              if (!id || reason().trim().length < 3) {
                showToast("Add a short reason before closing as lost.");
                return;
              }
              const moved = setOpportunityStage(id, "lost", reason().trim());
              closeLostReason();
              if (moved) showToast(`Opportunity moved to ${stageLabel(moved.stage)}.`);
            }}
          >
            <Icon name="close" size={11} tone="primary-foreground" />
            <Text class="text-[12px] font-semibold text-primary-foreground">Mark lost</Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-3">
        <TextField
          label="Lost reason"
          value={reason}
          onChange={reason.set}
          placeholder="Budget moved to next quarter"
          hint="Required · feeds win/loss analytics"
          testID="lost-reason"
        />
        <Text class="text-[11px] leading-3.5 text-muted-foreground">
          The stage move and reason are written to the opportunity's history. They are not stored on
          the conversation.
        </Text>
      </View>
    </AppDialog>
  );
}
