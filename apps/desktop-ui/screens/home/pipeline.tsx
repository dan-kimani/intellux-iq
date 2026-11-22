import { signal, Text, token, View } from "nsh";
import { Pie, Plot } from "nsh/base/plot";
import { Badge, Card, withAlpha } from "../../components/ui";
import { CardHead } from "./parts";
import { pipelineFunnel, pipelineMix, type PipelineSlice } from "./pipeline-data";

function PipelineTooltip(props: { slice: PipelineSlice | null }) {
  return (
    <If when={props.slice}>
      <View
        class="w-38 gap-1 rounded-xl px-3 py-2.5 shadow-2xl"
        style={{ backgroundColor: token("foreground") }}
      >
        <View class="flex-row items-center gap-1.5">
          <View
            class="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: token(props.slice?.tone ?? "muted-foreground") as string }}
          />
          <Text
            class="text-[11px] font-medium"
            style={{ color: withAlpha(token("background"), "cc") }}
          >
            {props.slice?.label ?? ""}
          </Text>
        </View>
        <Text
          class="text-[16px] font-semibold leading-none tabular-nums"
          style={{ color: token("background") }}
        >
          {props.slice?.count ?? ""} {props.slice?.count === 1 ? "deal" : "deals"}
        </Text>
        <Text class="text-[11px]" style={{ color: withAlpha(token("background"), "a8") }}>
          {props.slice ? `${props.slice.share}% of pipeline` : ""}
        </Text>
      </View>
    </If>
  );
}

export function PipelineSnapshot() {
  const funnel = pipelineFunnel;
  const mix = pipelineMix;
  const hovered = signal<number | null>(null);
  const active = (): PipelineSlice | null => {
    const index = hovered();
    return index === null ? null : (mix().rows[index] ?? null);
  };
  const centerCount = () => active()?.count ?? mix().total;
  const centerLabel = () => active()?.label ?? "deals";
  const centerShare = () => active()?.share;

  return (
    <Card class="gap-2 p-4" testID="home-pipeline">
      <CardHead
        title="Pipeline snapshot"
        subtitle="Deal mix by stage"
        action={
          <Badge variant="outline">
            <Text class="text-[11px] font-medium text-muted-foreground">This quarter</Text>
          </Badge>
        }
      />

      <View class="flex-1 flex-row items-center justify-center gap-2 py-1">
        <View class="relative size-40 shrink-0 min-[1440px]:size-31">
          <Plot
            testID="pipeline-mix-plot"
            data={mix().rows}
            appearGeneration="pipeline-mix"
            motion={{
              appear: { duration: 600, easing: "easeOut" },
              enter: { duration: 120 },
              exit: { duration: 100 },
              update: { duration: 240 },
              pointer: { stiffness: 300, damping: 30 },
            }}
            onHoverChange={({ index }) => hovered.set(index)}
            colorScale={{
              type: "ordinal",
              domain: mix().rows.map((row) => row.label),
              range: mix().rows.map((row) => token(row.tone) as string),
            }}
            tooltipContent={<PipelineTooltip slice={active()} />}
            tooltipPlacement="pointer"
            tooltipOffset={6}
            accessibilityLabel={`Pipeline mix: ${mix()
              .rows.map((row) => `${row.count} ${row.label}`)
              .join(", ")}.`}
            accessibilityValue={{ text: active()?.label }}
            focusVisibleStyle={{
              outlineWidth: 2,
              outlineColor: token("ring"),
              outlineOffset: 2,
              borderRadius: 999,
            }}
            style={{ width: "100%", height: "100%" }}
          >
            <Pie
              value="count"
              innerRadius="62%"
              outerRadius="94%"
              padAngle={0.03}
              cornerRadius={4}
              hoverLift={3}
              hoverDim={0.5}
              color="label"
              sliceStyle={{ stroke: token("card"), strokeWidth: 2 }}
            />
          </Plot>
          <View
            class="absolute inset-0 items-center justify-center gap-0.5"
            testID="pipeline-mix-center"
            accessibilityLabel={
              active()
                ? `${active()!.count} ${active()!.label}, ${active()!.share}% of pipeline`
                : `${mix().total} deals across the pipeline`
            }
            style={{ pointerEvents: "none" }}
          >
            <Text class="text-[22px] font-semibold leading-none tabular-nums text-foreground">
              {centerCount()}
            </Text>
            <Text class="text-[11px] font-medium text-muted-foreground">{centerLabel()}</Text>
            <If when={centerShare() !== undefined}>
              <Text class="text-[11px] tabular-nums text-muted-foreground">{centerShare()}%</Text>
            </If>
          </View>
        </View>

        <View class="w-32 shrink-0 min-[1440px]:w-28">
          <Each of={mix().rows}>
            {(row: () => PipelineSlice) => (
              <View
                class="h-7 flex-row items-center gap-2 px-1.5"
                testID={`pipeline-stage-${row().id}`}
              >
                <View
                  class="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: token(row().tone) as string }}
                />
                <View class="min-w-0 flex-1">
                  <Text class="text-[11px] leading-3.5 font-medium text-foreground">
                    {row().label}
                  </Text>
                  <View class="flex-row items-baseline gap-1">
                    <Text class="text-[12px] leading-3.5 font-semibold tabular-nums text-foreground">
                      {row().count}
                    </Text>
                    <Text class="text-[11px] leading-3.5 text-muted-foreground">·</Text>
                    <Text class="text-[11px] leading-3.5 tabular-nums text-muted-foreground">
                      {row().share}%
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </Each>
        </View>
      </View>

      <View class="gap-2 border-t border-border pt-2.5">
        <View class="flex-row items-center justify-between gap-2">
          <Text class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Lead conversion
          </Text>
          <Text class="text-[11px] tabular-nums text-muted-foreground">
            {funnel().won} of {funnel().leads} leads
          </Text>
        </View>
        <View class="flex-row items-center gap-3">
          <Text class="text-[24px] font-semibold leading-none tabular-nums text-foreground">
            {funnel().conversion}%
          </Text>
          <View
            class="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
            accessibilityLabel={`Lead conversion ${funnel().conversion} percent`}
          >
            <View
              class="h-full rounded-full"
              style={{
                width: `${funnel().conversion}%`,
                backgroundColor: token("success") as string,
              }}
            />
          </View>
        </View>
      </View>
    </Card>
  );
}
