import { Popover } from "nsh/base";
import { signal, Text, token, View } from "nsh";
import { FormLabel } from "../../components/overlay";
import { Icon } from "../../components/ui";
import { localDate, withLocalDate } from "./time";

const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

interface DateCell {
  key: string;
  day: number | null;
}

function startOfMonth(ms: number): number {
  const date = new Date(ms);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function monthCells(month: number): DateCell[] {
  const date = new Date(month);
  const leading = date.getDay();
  const days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return [
    ...Array.from({ length: leading }, (_, index) => ({ key: `blank-${index}`, day: null })),
    ...Array.from({ length: days }, (_, index) => ({ key: `day-${index + 1}`, day: index + 1 })),
  ];
}

function monthLabel(ms: number): string {
  return new Date(ms).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function dateLabel(ms: number): string {
  return new Date(ms).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
}

function dayTimestamp(month: number, day: number): number {
  const date = new Date(month);
  return new Date(date.getFullYear(), date.getMonth(), day).getTime();
}

function isSelected(value: number, month: number, day: number): boolean {
  return localDate(value) === localDate(dayTimestamp(month, day));
}

function isPast(minDate: number | undefined, month: number, day: number): boolean {
  if (!minDate) return false;
  const start = new Date(minDate);
  start.setHours(0, 0, 0, 0);
  return dayTimestamp(month, day) < start.getTime();
}

function shiftMonth(ms: number, delta: number): number {
  const date = new Date(ms);
  date.setMonth(date.getMonth() + delta);
  return startOfMonth(date.getTime());
}

export function DateField(props: {
  label: string;
  value: () => number;
  onChange: (ms: number) => void;
  minDate?: number;
  testID?: string;
}) {
  const open = signal(false);
  const month = signal(startOfMonth(props.value()));
  const today = signal("");
  const selectDay = (day: number) => {
    const date = new Date(month());
    date.setDate(day);
    props.onChange(withLocalDate(props.value(), localDate(date.getTime())));
    open.set(false);
  };
  return (
    <View class="gap-1">
      <If when={props.label}>
        <FormLabel>{props.label}</FormLabel>
      </If>
      <Popover
        open={open()}
        onOpenChange={({ open: next }) => {
          if (next) {
            month.set(startOfMonth(props.value()));
            today.set(localDate(Date.now()));
          }
          open.set(next);
        }}
        placement="top"
        align="start"
        offset={6}
        popupClass="rounded-xl border border-border bg-popover p-3 shadow-2xl"
        popupStyle={{ width: 308 }}
        trigger={
          <View
            role="button"
            accessibilityLabel={`${props.label || "Date"}: ${dateLabel(props.value())}`}
            testID={props.testID}
            class="h-8 flex-row items-center gap-1.5 rounded-md border border-border bg-panel px-2.5"
            hoverStyle={{ borderColor: token("ring") }}
          >
            <Icon name="calendarClock" size={11} tone="muted-foreground" />
            <Text class="flex-1 text-[12px] font-medium text-foreground">
              {dateLabel(props.value())}
            </Text>
            <Icon name="chevronDown" size={9} tone="muted-foreground" />
          </View>
        }
      >
        <View class="gap-2">
          <View class="flex-row items-center justify-between">
            <View
              role="button"
              accessibilityLabel="Previous month"
              testID="date-previous-month"
              onPress={() => month.set(shiftMonth(month(), -1))}
              class="h-7 w-7 items-center justify-center rounded-md border border-border"
              hoverStyle={{ backgroundColor: token("accent") }}
            >
              <Icon name="chevronLeft" size={10} tone="muted-foreground" />
            </View>
            <Text class="text-[12px] font-semibold text-foreground">{monthLabel(month())}</Text>
            <View
              role="button"
              accessibilityLabel="Next month"
              testID="date-next-month"
              onPress={() => month.set(shiftMonth(month(), 1))}
              class="h-7 w-7 items-center justify-center rounded-md border border-border"
              hoverStyle={{ backgroundColor: token("accent") }}
            >
              <Icon name="chevronRight" size={10} tone="muted-foreground" />
            </View>
          </View>
          <View class="flex-row">
            <Each of={weekdays}>
              {(day: () => string) => (
                <Text class="w-10 text-center text-[11px] font-medium text-muted-foreground">
                  {day()}
                </Text>
              )}
            </Each>
          </View>
          <View class="flex-row flex-wrap">
            <Each of={monthCells(month())}>
              {(cell: () => DateCell) => (
                <View class="h-9 w-10 items-center justify-center">
                  <If when={cell().day !== null}>
                    <View
                      role="button"
                      accessibilityLabel={`${monthLabel(month())} ${cell().day}`}
                      testID={`date-day-${cell().day}`}
                      onPress={() => {
                        if (!isPast(props.minDate, month(), cell().day!)) selectDay(cell().day!);
                      }}
                      class="h-8 w-8 items-center justify-center rounded-md"
                      style={{
                        backgroundColor: isSelected(props.value(), month(), cell().day!)
                          ? token("primary")
                          : "transparent",
                        opacity: isPast(props.minDate, month(), cell().day!) ? 0.3 : 1,
                      }}
                      hoverStyle={{ backgroundColor: token("accent") }}
                    >
                      <Text
                        class="text-[12px] tabular-nums"
                        style={{
                          color: isSelected(props.value(), month(), cell().day!)
                            ? token("primary-foreground")
                            : localDate(dayTimestamp(month(), cell().day!)) === today()
                              ? token("highlight")
                              : token("foreground"),
                        }}
                      >
                        {cell().day}
                      </Text>
                    </View>
                  </If>
                </View>
              )}
            </Each>
          </View>
          <View class="flex-row items-center justify-end border-t border-border pt-2">
            <View
              role="button"
              accessibilityLabel="Choose today"
              testID="date-today"
              onPress={() => {
                props.onChange(withLocalDate(props.value(), today()));
                open.set(false);
              }}
              class="h-7 items-center justify-center rounded-md border border-border px-2"
              hoverStyle={{ backgroundColor: token("accent") }}
            >
              <Text class="text-[11px] font-medium text-foreground">Today</Text>
            </View>
          </View>
        </View>
      </Popover>
    </View>
  );
}
