import { Text, View } from "nsh";
import { TextField } from "../../components/forms";
import { activityKinds } from "./dialog-data";
import { DateField } from "./DateField";
import { TimePickerField } from "./TimePickerField";
import type { ActivityFormSignals } from "./form";
import { OptionGrid } from "./OptionGrid";

export function ActivityPane(props: { form: ActivityFormSignals }) {
  const f = props.form;
  return (
    <View class="gap-4">
      <OptionGrid
        label="Activity type"
        options={activityKinds}
        value={f.kind()}
        onChange={f.kind.set}
        testPrefix="activity-kind"
      />
      <View class="gap-2 rounded-xl border border-border bg-panel p-3">
        <Text class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          When it happened
        </Text>
        <View class="grid grid-cols-2 gap-2">
          <DateField
            label="Date"
            value={f.occurredAt}
            onChange={f.occurredAt.set}
            testID="activity-date"
          />
          <TimePickerField
            label="Time"
            value={f.occurredAt}
            onChange={f.occurredAt.set}
            testID="activity-time"
          />
        </View>
      </View>
      <TextField
        label="Participants"
        value={f.participants}
        onChange={f.participants.set}
        placeholder="Maya Lin, Alex Morgan"
        testID="activity-participants"
      />
      <TextField
        label="Outcome"
        value={f.outcome}
        onChange={f.outcome.set}
        placeholder="What happened, what was agreed, and what comes next…"
        multiline
        testID="work-details"
      />
    </View>
  );
}
