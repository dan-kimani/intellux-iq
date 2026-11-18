import { computed, effect, signal, Text, token, View } from "nsh";
import { Area, Grid, Line, Plot, PlotAxis } from "nsh/base/plot";
import { Card, withAlpha } from "../../components/ui";
import { useAfter } from "../../components/motion";
import { Skeleton } from "../../components/skeletons";
import { analyticsPeriod, trendPoints, type TrendPoint } from "./data";

type SeriesKey = "conversations" | "deals" | "revenue";

interface SeriesConfig {
  key: SeriesKey;
  label: string;
  color: "series-1" | "series-2" | "series-3";
  format: (value: number) => string;
}

const series: SeriesConfig[] = [
  {
    key: "conversations",
    label: "Conversations",
    color: "series-1",
    format: (value) => value.toLocaleString("en-US"),
  },
  { key: "deals", label: "Deals won", color: "series-2", format: (value) => `${value}` },
  {
    key: "revenue",
    label: "Revenue",
    color: "series-3",
    format: (value) => `KES ${(value / 1000).toFixed(1)}M`,
  },
];

const visibleSeries = signal<Record<SeriesKey, boolean>>({
  conversations: true,
  deals: true,
  revenue: true,
});

function toggleSeries(key: SeriesKey) {
  const next = { ...visibleSeries(), [key]: !visibleSeries()[key] };
  if (Object.values(next).some(Boolean)) visibleSeries.set(next);
}

function dotClass(active: boolean): string {
  return active ? "h-2.5 w-2.5 rounded-full border-2 border-background" : "hidden";
}

function Legend(props: { item: SeriesConfig; active: boolean; onPress: () => void }) {
  return (
    <View
      role="switch"
      accessibilityLabel={`${props.item.label} series`}
      accessibilityState={{ checked: props.active }}
      testID={`trend-series-${props.item.key}`}
      onPress={props.onPress}
      class="flex-row items-center gap-1 rounded px-1 py-0.5"
      hoverStyle={{ backgroundColor: token("accent") }}
      focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
      style={{ opacity: props.active ? 1 : 0.4 }}
    >
      <View class="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: token(props.item.color) }} />
      <Text class="text-[9.5px] font-medium text-muted-foreground">{props.item.label}</Text>
    </View>
  );
}

function TrendTooltip(props: { row: TrendPoint | null; visible: Record<SeriesKey, boolean> }) {
  return (
    <If when={props.row}>
      <View
        testID="trend-tooltip"
        class="min-w-42 gap-1 rounded-xl px-3 py-2 shadow-2xl"
        style={{ backgroundColor: token("foreground") }}
      >
        <Text
          class="text-[10px] font-medium"
          style={{ color: withAlpha(token("background"), "b8") }}
        >
          {props.row?.label}
        </Text>
        <Each of={series}>
          {(item: () => SeriesConfig) => (
            <If when={props.visible[item().key]}>
              <View testID={`trend-tooltip-${item().key}`} class="flex-row items-center gap-1.5">
                <View
                  class="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: token(item().color) }}
                />
                <Text
                  class="flex-1 text-[10px]"
                  style={{ color: withAlpha(token("background"), "b8") }}
                >
                  {item().label}
                </Text>
                <Text class="text-[10px] font-semibold" style={{ color: token("background") }}>
                  {item().format(props.row?.[item().key] ?? 0)}
                </Text>
              </View>
            </If>
          )}
        </Each>
      </View>
    </If>
  );
}

export function SalesTrend() {
  const ready = useAfter(260);
  const hovered = signal<number | null>(null);

  effect(() => {
    analyticsPeriod();
    hovered.set(null);
  });

  const rows = computed(() => trendPoints(analyticsPeriod()));
  const tooltipRow = (): TrendPoint | null => {
    const index = hovered();
    return index === null ? null : (rows()[index] ?? null);
  };
  const xTicks = computed(() => (rows().length > 7 ? [0, 3, 6, 9, 12] : [0, 2, 4, 6]));
  const valueText = () => {
    const row = tooltipRow();
    if (!row) return undefined;
    const values = series
      .filter((item) => visibleSeries()[item.key])
      .map((item) => `${item.label} ${item.format(row[item.key])}`);
    return `${row.label}: ${values.join(", ")}`;
  };

  return (
    <If when={ready()} else={<Skeleton class="h-80 rounded-xl" />}>
      <Card class="h-full gap-3 overflow-hidden p-4">
        <View class="flex-row items-start justify-between">
          <View class="gap-1">
            <Text class="text-[13.5px] font-semibold text-foreground">Sales performance trend</Text>
            <Text class="text-[10.5px] text-muted-foreground">
              Conversations, deals won, and revenue over the selected period
            </Text>
          </View>
          <View class="flex-row items-center gap-1">
            <Each of={series}>
              {(item: () => SeriesConfig) => (
                <Legend
                  item={item()}
                  active={visibleSeries()[item().key]}
                  onPress={() => toggleSeries(item().key)}
                />
              )}
            </Each>
          </View>
        </View>

        <View class="min-h-0 w-full flex-1 pl-6 pb-4">
          <Plot
            testID="sales-trend-plot"
            data={rows()}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", domain: [0, 4000] }}
            interactive
            appearGeneration={analyticsPeriod()}
            motion={{
              appear: { duration: 500, easing: "easeOut" },
              enter: { duration: 120 },
              exit: { duration: 100 },
              update: { duration: 260 },
              pointer: { stiffness: 320, damping: 32 },
            }}
            onHoverChange={({ index }) => hovered.set(index)}
            tooltipContent={<TrendTooltip row={tooltipRow()} visible={visibleSeries()} />}
            tooltipPlacement="pointer"
            tooltipOffset={10}
            crossLineClass="w-px bg-border"
            accessibilityLabel="Sales performance trend, conversations, deals won, and revenue"
            accessibilityValue={{ text: valueText() }}
            focusVisibleStyle={{
              outlineWidth: 2,
              outlineColor: token("ring"),
              outlineOffset: 2,
              borderRadius: 8,
            }}
            class="w-full min-w-0"
            style={{ height: "100%", minHeight: 220 }}
          >
            <Grid y={[1000, 2000, 3000]} style={{ stroke: token("border"), strokeWidth: 1 }} />
            <Grid y={[0]} style={{ stroke: token("border"), strokeWidth: 1 }} />
            <Area
              y1="revenue"
              y0={0}
              backgroundStyle={{
                backgroundImage: `linear-gradient(to bottom, ${withAlpha(token("series-3"), "30")}, ${withAlpha(token("series-3"), "00")})`,
              }}
              style={{ opacity: visibleSeries().revenue ? 1 : 0 }}
              hoverDotClass="hidden"
            />
            <Line
              y="conversations"
              curve="natural"
              style={{
                stroke: token("series-1"),
                strokeWidth: 2,
                opacity: visibleSeries().conversations ? 1 : 0,
              }}
              hoverDotClass={dotClass(visibleSeries().conversations)}
              hoverDotStyle={{ backgroundColor: token("series-1") }}
            />
            <Line
              y="deals"
              curve="natural"
              style={{
                stroke: token("series-2"),
                strokeWidth: 2,
                opacity: visibleSeries().deals ? 1 : 0,
              }}
              hoverDotClass={dotClass(visibleSeries().deals)}
              hoverDotStyle={{ backgroundColor: token("series-2") }}
            />
            <Line
              y="revenue"
              curve="natural"
              style={{
                stroke: token("series-3"),
                strokeWidth: 2,
                opacity: visibleSeries().revenue ? 1 : 0,
              }}
              hoverDotClass={dotClass(visibleSeries().revenue)}
              hoverDotStyle={{ backgroundColor: token("series-3") }}
            />
            <PlotAxis
              placement="left"
              tickValues={[0, 1000, 2000, 3000, 4000]}
              format={(value) => (value === 0 ? "0" : `${value / 1000}K`)}
              labelClass="text-[8.5px] text-muted-foreground"
            />
            <PlotAxis
              placement="bottom"
              tickValues={xTicks()}
              format={(value) => rows()[value]?.label ?? ""}
              labelClass="text-[8.5px] text-muted-foreground"
            />
          </Plot>
        </View>
      </Card>
    </If>
  );
}
