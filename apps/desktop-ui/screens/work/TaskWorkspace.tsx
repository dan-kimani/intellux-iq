import { View } from "nsh";
import type { Signal } from "nsh";
import { TextField } from "../../components/forms";
import type { TaskFormSignals } from "./form";
import { RelatedContext } from "./RelatedContext";
import { TaskActionRow } from "./TaskActionRow";
import { TaskScheduling } from "./TaskScheduling";
import type { WorkLink } from "./types";

export function TaskWorkspace(props: {
  title: Signal<string>;
  details: Signal<string>;
  links: WorkLink[];
  form: TaskFormSignals;
  minimumDate: number;
  editing?: boolean;
  autoLinked: boolean;
  primaryType?: string;
  onAdd: (link: WorkLink) => void;
  onRemove: (link: WorkLink) => void;
}) {
  return (
    <View class="gap-3">
      <View class="gap-3">
        <TextField
          label="Task title"
          value={props.title}
          onChange={props.title.set}
          placeholder="Follow up with Maya about the packaging artwork"
          hint="Required"
          testID="work-title"
        />
        <RelatedContext
          links={props.links}
          autoLinked={props.autoLinked}
          {...(props.primaryType ? { primaryType: props.primaryType } : {})}
          onAdd={props.onAdd}
          onRemove={props.onRemove}
        />
        <TaskActionRow value={props.form.action()} onChange={props.form.action.set} />
        <TextField
          label="Notes"
          value={props.details}
          onChange={props.details.set}
          placeholder="Add instructions, expected outcome, or useful context…"
          multiline
          testID="work-details"
        />
      </View>
      <TaskScheduling form={props.form} minimumDate={props.minimumDate} editing={props.editing} />
    </View>
  );
}
