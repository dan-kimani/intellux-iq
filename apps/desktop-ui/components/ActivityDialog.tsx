import { signal, Text, View } from "nsh";
import { AppDialog, DialogActions, FormRow } from "./overlay";
import { ChoiceCards, SelectField, TextField } from "./forms";
import { Button, Icon } from "./ui";
import type { ActivityKind } from "../screens/activity";

const close = (onClose: () => void) => onClose();

export function ActivityDialog(props: {
  title: string;
  description: string;
  onClose: () => void;
  onSave: (entry: { kind: ActivityKind; text: string; meta: string }) => void;
}) {
  const kind = signal<ActivityKind>("note");
  const text = signal("");
  const due = signal("Today");
  return (
    <AppDialog
      open={() => true}
      onClose={() => close(props.onClose)}
      title={props.title}
      description={props.description}
      width={520}
      testID="activity-dialog"
      footer={
        <DialogActions>
          <Button variant="ghost" size="sm" onPress={props.onClose}>
            <Text class="text-[10px] font-medium">Cancel</Text>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onPress={() => {
              if (!text().trim()) return;
              props.onSave({
                kind: kind(),
                text: text().trim(),
                meta: kind() === "task" ? `Due ${due()}` : "Internal note",
              });
              props.onClose();
            }}
            testID="save-activity"
          >
            <Icon name="check" size={11} tone="primary-foreground" />
            <Text class="text-[10px] font-semibold text-primary-foreground">Save</Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-3">
        <ChoiceCards
          value={() => (kind() === "note" ? "Internal note" : "Follow-up task")}
          options={[
            {
              value: "Internal note",
              title: "Internal note",
              detail: "Visible to the team; never sent to the customer.",
            },
            {
              value: "Follow-up task",
              title: "Follow-up task",
              detail: "Scheduled reminder tied to this record.",
            },
          ]}
          onChange={(value) => kind.set(value === "Internal note" ? "note" : "task")}
        />
        <TextField
          label={kind() === "task" ? "Task" : "Note"}
          value={text}
          onChange={text.set}
          placeholder={
            kind() === "task" ? "Call about the delivery window" : "What should the team know?"
          }
          testID="activity-text"
        />
        <If when={kind() === "task"}>
          <SelectField
            label="Due"
            value={due}
            options={["Today", "Tomorrow", "Next week"]}
            onChange={due.set}
          />
        </If>
        <FormRow>
          <Text class="text-[9px] leading-3.5 text-muted-foreground">
            Notes and tasks are internal. They do not count as customer outcomes; task completion
            does.
          </Text>
        </FormRow>
      </View>
    </AppDialog>
  );
}
