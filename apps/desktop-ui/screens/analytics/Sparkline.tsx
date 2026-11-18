import { computed, token } from "nsh";
import { Area, Line, Plot } from "nsh/base/plot";
import { withAlpha } from "../../components/ui";

export function Sparkline(props: {
  data: number[];
  tone: string;
  label: string;
  testID?: string;
  height?: number;
  onHover?: (value: number | null) => void;
}) {
  const rows = computed(() => props.data.map((value, index) => ({ index, value })));
  const color = token(props.tone as never);
  const latest = () => props.data[props.data.length - 1] ?? 0;
  const low = Math.min(...props.data);
  const high = Math.max(...props.data);
  const padding = Math.max(1, (high - low) * 0.12);
  const baseline = low - padding;

  return (
    <Plot
      testID={props.testID}
      data={rows()}
      xScale={{ type: "point" }}
      yScale={{ type: "linear", domain: [baseline, high + padding] }}
      interactive
      onHoverChange={({ index }) =>
        props.onHover?.(index === null ? null : (props.data[index] ?? null))
      }
      crossLineClass="w-px bg-border"
      dotClass="h-2 w-2 rounded-full border-2 border-background"
      accessibilityLabel={`${props.label} trend, latest ${latest()}`}
      accessibilityValue={{ text: `${props.label}: ${latest()}` }}
      focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: -2 }}
      class="w-full"
      style={{ height: props.height ?? 34 }}
    >
      <Area
        y1="value"
        y0={baseline}
        backgroundStyle={{
          backgroundImage: `linear-gradient(to bottom, ${withAlpha(color, "35")}, ${withAlpha(color, "00")})`,
        }}
        hoverDotClass="hidden"
      />
      <Line
        y="value"
        style={{ stroke: color, strokeWidth: 1.6 }}
        hoverDotStyle={{ backgroundColor: color }}
      />
    </Plot>
  );
}
