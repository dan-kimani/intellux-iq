import { token } from "nsh";
import { Switch } from "nsh/base";

/**
 * App-styled setting switch. NSH owns the switch role, checked state, keyboard
 * activation (Space / Return) and the platform control on mobile; the track and
 * thumb keep the shadcn look.
 */
export function Toggle(props: {
  on: () => boolean;
  onPress: () => void;
  label: string;
  testID?: string;
}) {
  return (
    <Switch
      checked={props.on()}
      accessibilityLabel={props.label}
      testID={props.testID}
      onChange={({ checked }) => {
        if (checked !== props.on()) props.onPress();
      }}
      class="h-5 w-9"
      trackClass="h-5 w-9 rounded-full border border-border p-0.5"
      trackStyle={{ backgroundColor: props.on() ? token("primary") : token("muted") }}
      thumbClass="h-4 w-4 rounded-full bg-background shadow-sm"
      thumbStyle={{
        transform: props.on() ? "translateX(16px)" : "translateX(0px)",
        transitionProperty: "transform",
        transitionDuration: 160,
      }}
    />
  );
}
