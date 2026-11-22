import { signal, Text, token, View } from "nsh";
import { Area, Grid, Line, Plot, PlotAxis } from "nsh/base/plot";
import { Badge, Card, withAlpha } from "../../components/ui";
import { money } from "./data";
import { CardHead } from "./parts";

export interface PerformancePoint {
  label: string;
  current: number;
  previous: number;
}

function performanceData(): PerformancePoint[] {
  const current = [
    0, 18000, 32000, 32000, 62000, 62000, 96000, 96000, 148000, 148000, 205000, 248500, 338900,
  ];
  const previous = [
    0, 12000, 28000, 28000, 52000, 52000, 81000, 81000, 111000, 111000, 156000, 197000, 284500,
  ];
  const labels = [
    "1 Nov",
    "3 Nov",
    "5 Nov",
    "7 Nov",
    "9 Nov",
    "11 Nov",
    "12 Nov",
    "13 Nov",
    "15 Nov",
    "16 Nov",
    "17 Nov",
    "18 Nov",
    "19 Nov",
  ];
  return labels.map((label, index) => ({
    label,
    current: current[index] ?? 0,
    previous: previous[index] ?? 0,
  }));
}

function performanceRows(): PerformancePoint[] {
  return performanceData();
}

function Legend(props: { label: string; tone: "series-1" | "muted-foreground" }) {
  return (
    <View class="flex-row items-center gap-1">
      <View
        class="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: token(props.tone) as string }}
      />
      <Text class="text-[11px] font-medium text-muted-foreground">{props.label}</Text>
    </View>
  );
}

function PerformanceTooltip(props: { row: PerformancePoint | null }) {
  return (
    <If when={props.row}>
      <View
        testID="home-performance-tooltip"
        class="min-w-36 gap-1 rounded-lg px-2.5 py-2 shadow-2xl"
        style={{ backgroundColor: token("foreground") as string }}
      >
        <Text
          class="text-[11px] font-medium"
          style={{ color: withAlpha(token("background") as string, "b8") }}
        >
          {props.row?.label}
        </Text>
        <View class="flex-row items-center gap-1.5">
          <View
            class="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: token("series-1") as string }}
          />
          <Text
            class="flex-1 text-[11px]"
            style={{ color: withAlpha(token("background") as string, "b8") }}
          >
            This month
          </Text>
          <Text class="text-[11px] font-semibold" style={{ color: token("background") as string }}>
            {money(props.row?.current ?? 0)}
          </Text>
        </View>
        <View class="flex-row items-center gap-1.5">
          <View
            class="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: token("muted-foreground") as string }}
          />
          <Text
            class="flex-1 text-[11px]"
            style={{ color: withAlpha(token("background") as string, "b8") }}
          >
            Last month
          </Text>
          <Text class="text-[11px] font-semibold" style={{ color: token("background") as string }}>
            {money(props.row?.previous ?? 0)}
          </Text>
        </View>
      </View>
    </If>
  );
}

export function SalesPerformance() {
  const hovered = signal<number | null>(null);
  const tooltipRow = (): PerformancePoint | null => {
    const index = hovered();
    return index === null ? null : (performanceRows()[index] ?? null);
  };
  const valueText = () => {
    const row = tooltipRow();
    if (!row) return undefined;
    return `${row.label}: this month ${money(row.current)}, last month ${money(row.previous)}`;
  };

  return (
    <Card class="gap-2 p-4" testID="home-performance">
      <CardHead
        title="Sales performance overview"
        subtitle="Revenue booked · this month vs last month"
        action={
          <Badge variant="outline">
            <Text class="text-[11px] font-medium text-muted-foreground">This month</Text>
          </Badge>
        }
      />

      <View class="flex-row items-center gap-3 pt-0.5">
        <Legend label="This month" tone="series-1" />
        <Legend label="Last month" tone="muted-foreground" />
      </View>

      <View class="min-h-0 w-full flex-1 pb-4 pl-8">
        <Plot
          testID="home-performance-plot"
          data={performanceRows()}
          xScale={{ type: "point" }}
          yScale={{ type: "linear", domain: [0, 400000] }}
          interactive
          onHoverChange={({ index }) => hovered.set(index)}
          tooltipContent={<PerformanceTooltip row={tooltipRow()} />}
          tooltipPlacement="pointer"
          tooltipOffset={10}
          crossLineClass="w-px bg-border"
          accessibilityLabel="Sales performance overview, this month and last month"
          accessibilityValue={{ text: valueText() }}
          focusVisibleStyle={{
            outlineWidth: 2,
            outlineColor: token("ring"),
            outlineOffset: 2,
            borderRadius: 8,
          }}
          class="w-full"
          style={{ height: "100%", minHeight: 172 }}
        >
          <Grid y={[100000, 200000, 300000]} style={{ stroke: token("border"), strokeWidth: 1 }} />
          <Grid y={[0]} style={{ stroke: token("border"), strokeWidth: 1 }} />
          <Area
            y1="current"
            y0={0}
            backgroundStyle={{
              backgroundImage: `linear-gradient(to bottom, ${withAlpha(token("series-1") as string, "30")}, ${withAlpha(token("series-1") as string, "00")})`,
            }}
            hoverDotClass="hidden"
          />
          <Line
            y="previous"
            curve="natural"
            style={{
              stroke: token("muted-foreground"),
              strokeWidth: 1.5,
              opacity: 0.75,
            }}
            hoverDotClass="h-2 w-2 rounded-full border-2 border-background"
            hoverDotStyle={{ backgroundColor: token("muted-foreground") }}
          />
          <Line
            y="current"
            curve="natural"
            style={{ stroke: token("series-1"), strokeWidth: 2 }}
            hoverDotClass="h-2 w-2 rounded-full border-2 border-background"
            hoverDotStyle={{ backgroundColor: token("series-1") }}
          />
          <PlotAxis
            placement="left"
            tickValues={[0, 100000, 200000, 300000, 400000]}
            format={(value) => (value === 0 ? "0" : `${value / 1000}K`)}
            labelClass="text-[11px] tabular-nums text-muted-foreground"
          />
          <PlotAxis
            placement="bottom"
            tickValues={[0, 3, 6, 9, 12]}
            format={(value) => performanceRows()[value]?.label ?? ""}
            labelClass="text-[11px] tabular-nums text-muted-foreground"
          />
        </Plot>
      </View>
    </Card>
  );
}
