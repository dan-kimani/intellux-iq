import { Text, token, View } from "nsh";
import { periods, analyticsPeriod, type Period } from "./data";

export function PeriodTabs() {
  return (
    <View class="flex-row items-center gap-1 rounded-3xl border border-border bg-card shadow-md p-1">
      <Each of={periods}>
        {(item: () => Period) => (
          <View
            role="button"
            accessibilityLabel={`${item()} period`}
            testID={`analytics-period-${item().toLowerCase()}`}
            onPress={() => analyticsPeriod.set(item())}
            class="h-7 items-center justify-center rounded-md px-2.5"
            style={{
              backgroundColor: analyticsPeriod() === item() ? token("accent") : "transparent",
            }}
            hoverStyle={{ backgroundColor: token("accent") }}
          >
            <Text
              class="text-[9.5px] font-medium"
              style={{
                color:
                  analyticsPeriod() === item()
                    ? token("accent-foreground")
                    : token("muted-foreground"),
              }}
            >
              {item()}
            </Text>
          </View>
        )}
      </Each>
    </View>
  );
}
