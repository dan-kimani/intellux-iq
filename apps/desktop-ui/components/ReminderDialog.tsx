import { signal, Text, View } from "nsh";
import { AppDialog, DialogActions } from "./overlay";
import { SelectField, TextField } from "./forms";
import { Button, Icon } from "./ui";
import { reminderDialogOpen, selectedConversation, showToast } from "../state";
import { createWorkReminder } from "../screens/work/state";
import { conversationLink } from "../screens/work/links";
import { presetTime } from "../screens/work/time";

export function ReminderDialog() {
  const due = signal("Tomorrow 09:00");
  const note = signal("");
  const conversation = selectedConversation();
  return (
    <AppDialog
      open={() => true}
      onClose={() => reminderDialogOpen.set(false)}
      title="Create follow-up"
      description="A native reminder tied to this conversation and its owner."
      width={440}
      testID="reminder-dialog"
      footer={
        <DialogActions>
          <Button variant="ghost" size="sm" onPress={() => reminderDialogOpen.set(false)}>
            <Text class="text-[12px] font-medium">Cancel</Text>
          </Button>
          <Button
            variant="primary"
            size="sm"
            testID="save-reminder"
            onPress={() => {
              createWorkReminder({
                title: note().trim() || "Follow up with this conversation",
                notes: note().trim(),
                triggerAt: due(),
                triggerAtMs: presetTime(due()),
                links: [conversationLink(conversation)],
              });
              reminderDialogOpen.set(false);
              showToast("Follow-up reminder created.");
            }}
          >
            <Icon name="calendarClock" size={11} tone="primary-foreground" />
            <Text class="text-[12px] font-semibold text-primary-foreground">Create reminder</Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-3">
        <SelectField
          label="Due"
          value={due}
          options={["In 1 hour", "Tomorrow 09:00", "In 3 days"]}
          onChange={due.set}
        />
        <TextField
          label="Note"
          value={note}
          onChange={note.set}
          placeholder="Confirm the delivery window"
          testID="reminder-note"
        />
      </View>
    </AppDialog>
  );
}
