import { Text, View } from "nsh";
import { teamMembers } from "../../state";
import { FormLabel } from "../../components/overlay";
import { TextField } from "../../components/forms";
import { DateField } from "./DateField";
import { TimePickerField } from "./TimePickerField";
import type { ReminderFormSignals } from "./form";
import { OptionGrid } from "./OptionGrid";
import { OwnerPicker } from "./OwnerPicker";
import { TaskPicker } from "./TaskPicker";

export function ReminderPane(props: {
  form: ReminderFormSignals;
  notes: () => string;
  setNotes: (value: string) => void;
  minimumDate: number;
}) {
  const f = props.form;
  return (
    <View class="gap-4">
      <View class="gap-2 rounded-xl border border-border bg-panel p-3">
        <Text class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Remind at
        </Text>
        <View class="grid grid-cols-2 gap-2">
          <DateField
            label="Date"
            value={f.remindAt}
            onChange={f.remindAt.set}
            minDate={props.minimumDate}
            testID="reminder-date"
          />
          <TimePickerField
            label="Time"
            value={f.remindAt}
            onChange={f.remindAt.set}
            testID="reminder-time"
          />
        </View>
      </View>
      <View class="gap-1">
        <FormLabel>Attach to task</FormLabel>
        <TaskPicker value={f.taskId()} onChange={f.taskId.set} />
      </View>
      <View class="grid grid-cols-2 gap-2">
        <View class="gap-1">
          <FormLabel>Notify</FormLabel>
          <OwnerPicker
            value={teamMembers.find((member) => member.id === f.ownerId())?.name ?? "Unassigned"}
            onChange={(name) => {
              const member = teamMembers.find((row) => row.name === name);
              if (member) f.ownerId.set(member.id);
            }}
          />
        </View>
        <OptionGrid
          label="Visibility"
          options={[
            { label: "Only me", value: "private" as const },
            { label: "Team", value: "org" as const },
          ]}
          value={f.visibility()}
          onChange={f.visibility.set}
          testPrefix="reminder-visibility"
        />
      </View>
      <TextField
        label="Notes"
        value={props.notes}
        onChange={props.setNotes}
        placeholder="Add context for the reminder…"
        multiline
        testID="work-details"
      />
    </View>
  );
}
