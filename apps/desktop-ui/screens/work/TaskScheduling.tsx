import { Text, token, View } from "nsh";
import { ActionMenu } from "../../components/ActionMenu";
import { FormLabel } from "../../components/overlay";
import { Icon } from "../../components/ui";
import { teamMembers } from "../../state";
import { DateField } from "./DateField";
import { DateTimeField } from "./DateTimeField";
import { OptionGrid } from "./OptionGrid";
import { OwnerPicker } from "./OwnerPicker";
import { TimePickerField } from "./TimePickerField";
import type { TaskFormSignals } from "./form";

const reminderLeads = [
  { label: "At due time", value: "due" as const },
  { label: "15 min before", value: "15m" as const },
  { label: "1 hour before", value: "1h" as const },
  { label: "1 day before", value: "1d" as const },
  { label: "Custom", value: "custom" as const },
];

function leadLabel(value: string): string {
  return reminderLeads.find((row) => row.value === value)?.label ?? "15 min before";
}

export function TaskScheduling(props: {
  form: TaskFormSignals;
  minimumDate: number;
  editing?: boolean;
}) {
  const f = props.form;
  return (
    <View class="w-full gap-2.5 rounded-xl border border-border bg-panel p-3">
      <Text class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Scheduling
      </Text>
      <If when={props.editing}>
        <OptionGrid
          label="Status"
          options={[
            { label: "Open", value: "open" as const },
            { label: "In progress", value: "in_progress" as const },
            { label: "Completed", value: "done" as const },
            { label: "Cancelled", value: "cancelled" as const },
          ]}
          value={f.status()}
          onChange={f.status.set}
          testPrefix="task-status"
        />
      </If>
      <View class="grid grid-cols-2 gap-2">
        <DateField
          label="Due date"
          value={f.dueAt}
          onChange={f.dueAt.set}
          minDate={props.minimumDate}
          testID="task-due-date"
        />
        <TimePickerField
          label="Due time"
          value={f.dueAt}
          onChange={f.dueAt.set}
          testID="task-due-time"
        />
        <View class="gap-1">
          <FormLabel>Assigned to</FormLabel>
          <OwnerPicker
            value={teamMembers.find((member) => member.id === f.ownerId())?.name ?? "Unassigned"}
            onChange={(name) => {
              const member = teamMembers.find((row) => row.name === name);
              if (member) f.ownerId.set(member.id);
            }}
          />
        </View>
        <OptionGrid
          label="Priority"
          options={[
            { label: "High", value: "high" as const },
            { label: "Normal", value: "normal" as const },
          ]}
          value={f.priority()}
          onChange={f.priority.set}
          testPrefix="task-priority"
        />
      </View>
      <View class="flex-row items-center justify-between gap-2 border-t border-border pt-2">
        <View class="min-w-0 gap-0.5">
          <Text class="text-[11px] font-medium text-foreground">Visibility</Text>
          <Text class="text-[11px] text-muted-foreground">
            {f.visibility() === "org" ? "Visible to your team" : "Only visible to you"}
          </Text>
        </View>
        <OptionGrid
          options={[
            { label: "Team", value: "org" as const },
            { label: "Only me", value: "private" as const },
          ]}
          value={f.visibility()}
          onChange={f.visibility.set}
          testPrefix="task-visibility"
        />
      </View>
      <If when={!props.editing}>
        <View class="gap-2 border-t border-border pt-2">
          <View class="flex-row items-center justify-between gap-2">
            <View class="min-w-0 gap-0.5">
              <Text class="text-[11px] font-medium text-foreground">Reminder</Text>
              <Text class="text-[11px] text-muted-foreground">
                Notify the owner before the deadline
              </Text>
            </View>
            <View
              role="button"
              accessibilityLabel={
                f.reminderOn() ? "Turn task reminder off" : "Turn task reminder on"
              }
              testID="task-reminder-toggle"
              onPress={() => f.reminderOn.set(!f.reminderOn())}
              class="h-5 w-9 flex-row items-center rounded-full px-0.5"
              style={{
                backgroundColor: f.reminderOn() ? token("success") : token("muted"),
                justifyContent: f.reminderOn() ? "flex-end" : "flex-start",
              }}
            >
              <View class="h-4 w-4 rounded-full bg-background" />
            </View>
          </View>
          <If when={f.reminderOn()}>
            <ActionMenu
              testID="task-reminder-lead"
              width={180}
              trigger={
                <View
                  role="button"
                  accessibilityLabel={`Reminder: ${leadLabel(f.reminderLead())}`}
                  class="h-7 flex-row items-center justify-between gap-1 rounded-md border border-border bg-card px-2"
                >
                  <Text class="text-[11px] font-medium text-foreground">
                    {leadLabel(f.reminderLead())}
                  </Text>
                  <Icon name="chevronDown" size={8} tone="muted-foreground" />
                </View>
              }
              groups={[
                reminderLeads.map((row) => ({
                  id: `reminder-lead-${row.value}`,
                  label: row.label,
                  icon: "calendarClock" as const,
                  onSelect: () => f.reminderLead.set(row.value),
                })),
              ]}
            />
          </If>
          <If when={f.reminderOn() && f.reminderLead() === "custom"}>
            <DateTimeField
              label="Custom reminder"
              value={f.customReminderAt}
              onChange={f.customReminderAt.set}
              testID="task-reminder-custom"
            />
          </If>
        </View>
      </If>
    </View>
  );
}
