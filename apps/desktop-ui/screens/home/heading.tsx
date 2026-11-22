import { Text, token, View } from "nsh";
import { Icon, withAlpha } from "../../components/ui";
import { currentMember } from "../../state";
import { Sparkline } from "../analytics/Sparkline";
import { dateBits, winRate } from "./dashboard";
import { greeting } from "./data";
import { navTo } from "./nav";

export function HomeHeader() {
  const bits = dateBits;
  const rate = winRate;
  const first = currentMember.name.split(" ")[0];

  return (
    <View class="flex-row items-start justify-between gap-3" testID="home-header">
      <View class="min-w-0 flex-1 gap-1">
        <View class="flex-row items-center gap-2">
          <Text
            class="text-[28px] font-semibold leading-8 text-foreground"
            style={{ numberOfLines: 1 }}
          >
            {greeting()}, {first}
          </Text>
          <View
            class="h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: withAlpha(token("warning") as string, "24") }}
          >
            <Icon name="sparkles" size={12} tone="warning" />
          </View>
        </View>
        <Text class="text-[13px] text-muted-foreground">
          Here’s what’s happening with your business today.
        </Text>
      </View>

      <View class="flex-row flex-wrap items-center justify-end gap-2">
        <View class="h-16 w-40 flex-row items-center gap-2 rounded-xl border border-border bg-panel px-2.5">
          <View
            class="h-7 w-7 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: withAlpha(token("series-1") as string, "1f") }}
          >
            <Icon name="calendarClock" size={13} tone="series-1" />
          </View>
          <View class="min-w-0 gap-0.5">
            <Text class="text-[11px] font-medium uppercase tracking-wider tabular-nums text-muted-foreground">
              {bits().date}
            </Text>
            <Text class="text-[18px] font-semibold leading-4 text-foreground tabular-nums">
              {bits().time}
            </Text>
          </View>
        </View>

        <View
          class="h-16 w-44 flex-row items-center gap-2 rounded-xl border border-border px-2.5"
          style={{
            backgroundColor: token("panel") as string,
            backgroundImage: `linear-gradient(135deg, ${withAlpha(token("series-3") as string, "14")}, transparent 70%)`,
          }}
        >
          <View class="min-w-0 flex-1 gap-0.5">
            <Text class="text-[11px] font-medium uppercase tracking-wider tabular-nums text-muted-foreground">
              Win rate
            </Text>
            <Text class="text-[18px] font-semibold leading-4 text-foreground tabular-nums">
              {rate().rate}%
            </Text>
            <Text class="text-[11px] text-muted-foreground">
              {rate().won} won · {rate().total} total
            </Text>
          </View>
          <View class="w-12 shrink-0">
            <Sparkline
              data={rate().spark}
              tone="series-3"
              label="Win rate trend"
              height={28}
              testID="home-win-spark"
            />
          </View>
        </View>

        <View
          role="button"
          accessibilityLabel="Open the full analytics report"
          testID="home-full-report"
          onPress={() => navTo("Analytics", "analytics")}
          class="h-12 w-30 flex-row items-center justify-center gap-1.5 rounded-xl border border-border px-3"
          hoverStyle={{ backgroundColor: token("accent"), borderColor: token("ring") }}
          focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 2 }}
        >
          <Text class="text-[12px] font-medium text-foreground">Full report</Text>
          <Icon name="arrowUpRight" size={10} tone="muted-foreground" />
        </View>
      </View>
    </View>
  );
}
