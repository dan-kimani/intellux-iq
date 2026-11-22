import { signal, Text, View } from "nsh";
import { AppDialog, DialogActions } from "../../components/overlay";
import { TextField } from "../../components/forms";
import { Button, Icon } from "../../components/ui";
import { followUpRows } from "../home/state";
import { completeTaskWithOutcome } from "../work/state";

export function TaskOutcomeDialog(props: { taskId: string; onClose: () => void }) {
  const outcome = signal("");
  const task = () => followUpRows().find((row) => row.id === props.taskId);
  return (
    <AppDialog
      open={() => true}
      onClose={props.onClose}
      title="Complete task"
      description={task()?.title ?? "Close this task with an outcome."}
      width={440}
      testID="task-outcome-dialog"
      footer={
        <DialogActions>
          <Button variant="ghost" size="sm" onPress={props.onClose}>
            <Text class="text-[12px] font-medium">Cancel</Text>
          </Button>
          <Button
            variant="primary"
            size="sm"
            testID="save-task-outcome"
            onPress={() => {
              completeTaskWithOutcome(props.taskId, outcome());
              props.onClose();
            }}
          >
            <Icon name="check" size={11} tone="primary-foreground" />
            <Text class="text-[12px] font-semibold text-primary-foreground">Complete</Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-2">
        <TextField
          label="Outcome"
          value={outcome}
          onChange={outcome.set}
          placeholder="What happened? Add the result the team should remember."
          testID="task-outcome"
        />
        <Text class="text-[11px] text-muted-foreground">
          The outcome is saved on the task and in its activity history.
        </Text>
      </View>
    </AppDialog>
  );
}
