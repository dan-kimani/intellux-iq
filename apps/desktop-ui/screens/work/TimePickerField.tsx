import { Popover } from "nsh/base";
import { signal, Text, token, View } from "nsh";
import { FormLabel } from "../../components/overlay";
import { Icon } from "../../components/ui";
import { localTime, withLocalTime } from "./time";

const hours = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
const baseMinutes = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, "0"));

function minuteOptions(current: string): string[] {
  return baseMinutes.includes(current)
    ? baseMinutes
    : [...baseMinutes, current].toSorted((a, b) => Number(a) - Number(b));
}

export function TimePickerField(props: {
  label: string;
  value: () => number;
  onChange: (ms: number) => void;
  testID?: string;
}) {
  const open = signal(false);
  const selected = () => localTime(props.value());
  const hour = () => selected().slice(0, 2);
  const minute = () => selected().slice(3, 5);
  const chooseHour = (next: string) => {
    props.onChange(withLocalTime(props.value(), `${next}:${minute()}`));
  };
  const chooseMinute = (next: string) => {
    props.onChange(withLocalTime(props.value(), `${hour()}:${next}`));
  };
  return (
    <View class="gap-1">
      <If when={props.label}>
        <FormLabel>{props.label}</FormLabel>
      </If>
      <Popover
        open={open()}
        onOpenChange={({ open: next }) => open.set(next)}
        placement="top"
        align="start"
        offset={6}
        popupClass="rounded-xl border border-border bg-popover p-3 shadow-2xl"
        popupStyle={{ width: 308 }}
        trigger={
          <View
            role="button"
            accessibilityLabel={`${props.label || "Time"}: ${selected()}`}
            testID={props.testID}
            class="h-8 flex-row items-center gap-1.5 rounded-md border border-border bg-panel px-2.5"
            hoverStyle={{ borderColor: token("ring") }}
          >
            <Icon name="calendarClock" size={11} tone="muted-foreground" />
            <Text class="flex-1 text-[12px] font-medium tabular-nums text-foreground">
              {selected()}
            </Text>
            <Icon name="chevronDown" size={9} tone="muted-foreground" />
          </View>
        }
      >
        <View class="gap-2">
          <View class="flex-row items-center justify-between">
            <Text class="text-[12px] font-semibold text-foreground">Time</Text>
            <Text class="text-[12px] font-medium tabular-nums text-highlight">{selected()}</Text>
          </View>
          <Text class="text-[11px] uppercase tracking-wider text-muted-foreground">Hour</Text>
          <View class="flex-row flex-wrap gap-1">
            <Each of={hours}>
              {(item: () => string) => (
                <View
                  role="button"
                  accessibilityLabel={`Hour ${item()}`}
                  testID={`time-hour-${item()}`}
                  onPress={() => chooseHour(item())}
                  class="h-8 w-10 items-center justify-center rounded-md border"
                  style={{
                    backgroundColor: hour() === item() ? token("primary") : token("panel"),
                    borderColor: hour() === item() ? token("primary") : token("border"),
                  }}
                  hoverStyle={{ borderColor: token("ring") }}
                >
                  <Text
                    class="text-[12px] tabular-nums"
                    style={{
                      color: hour() === item() ? token("primary-foreground") : token("foreground"),
                    }}
                  >
                    {item()}
                  </Text>
                </View>
              )}
            </Each>
          </View>
          <Text class="text-[11px] uppercase tracking-wider text-muted-foreground">Minute</Text>
          <View class="flex-row flex-wrap gap-1">
            <Each of={minuteOptions(minute())}>
              {(item: () => string) => (
                <View
                  role="button"
                  accessibilityLabel={`Minute ${item()}`}
                  testID={`time-minute-${item()}`}
                  onPress={() => chooseMinute(item())}
                  class="h-8 w-10 items-center justify-center rounded-md border"
                  style={{
                    backgroundColor: minute() === item() ? token("primary") : token("panel"),
                    borderColor: minute() === item() ? token("primary") : token("border"),
                  }}
                  hoverStyle={{ borderColor: token("ring") }}
                >
                  <Text
                    class="text-[12px] tabular-nums"
                    style={{
                      color:
                        minute() === item() ? token("primary-foreground") : token("foreground"),
                    }}
                  >
                    {item()}
                  </Text>
                </View>
              )}
            </Each>
          </View>
          <View class="flex-row justify-end border-t border-border pt-2">
            <View
              role="button"
              accessibilityLabel="Done choosing time"
              testID="time-done"
              onPress={() => open.set(false)}
              class="h-7 items-center justify-center rounded-md border border-border px-3"
              hoverStyle={{ backgroundColor: token("accent") }}
            >
              <Text class="text-[11px] font-medium text-foreground">Done</Text>
            </View>
          </View>
        </View>
      </Popover>
    </View>
  );
}
