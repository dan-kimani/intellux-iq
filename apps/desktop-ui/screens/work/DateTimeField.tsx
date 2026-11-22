import { View } from "nsh";
import { FormLabel } from "../../components/overlay";
import { DateField } from "./DateField";
import { TimePickerField } from "./TimePickerField";

export function DateTimeField(props: {
  label: string;
  value: () => number;
  onChange: (ms: number) => void;
  testID?: string;
}) {
  return (
    <View class="gap-1">
      <If when={props.label}>
        <FormLabel>{props.label}</FormLabel>
      </If>
      <View class="grid grid-cols-2 gap-2">
        <DateField label="" value={props.value} onChange={props.onChange} testID={props.testID} />
        <TimePickerField label="" value={props.value} onChange={props.onChange} />
      </View>
    </View>
  );
}
