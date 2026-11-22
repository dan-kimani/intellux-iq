import { signal, Text, token, View } from "nsh";
import { Pie, Plot } from "nsh/base/plot";
import { Card, withAlpha } from "../../components/ui";
import { useAfter } from "../../components/motion";
import { Skeleton } from "../../components/skeletons";
import { leadSources, type LeadSource } from "./data";

function LeadTooltip(props: { source: LeadSource | null }) {
  return (
    <If when={props.source}>
      <View
        testID="lead-sources-tooltip"
        class="w-44 gap-1 rounded-xl px-3 py-2.5 shadow-2xl"
        style={{ backgroundColor: token("foreground") }}
      >
        <View class="flex-row items-center gap-1.5">
          <View
            class="h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: token(props.source?.tone ?? "muted-foreground"),
            }}
          />
          <Text
            class="text-[12px] font-medium"
            style={{ color: withAlpha(token("background"), "cc") }}
          >
            {props.source?.label ?? ""}
          </Text>
        </View>
        <Text
          class="text-[18px] font-semibold leading-none tabular-nums"
          style={{ color: token("background") }}
        >
          {props.source?.count ?? ""}
        </Text>
        <Text class="text-[12px]" style={{ color: withAlpha(token("background"), "a8") }}>
          {props.source ? `${props.source.value} of conversations` : ""}
        </Text>
      </View>
    </If>
  );
}

export function LeadSources() {
  const ready = useAfter(320);
  const hovered = signal<number | null>(null);
  const pinned = signal<number | null>(null);
  const activeIndex = () => hovered() ?? pinned();
  const activeSource = () => {
    const index = activeIndex();
    return index === null ? null : (leadSources[index] ?? null);
  };
  const centerLabel = () => {
    const source = activeSource();
    return source
      ? `${source.label}: ${source.count} conversations, ${source.value}`
      : "Total: 3,248 conversations";
  };

  return (
    <If when={ready()} else={<Skeleton class="h-80 rounded-xl" />}>
      <Card class="h-full w-72 shrink-0 gap-3 p-4">
        <View class="gap-1">
          <Text class="text-[14px] font-semibold text-foreground">Lead sources</Text>
          <Text class="text-[12px] text-muted-foreground">
            Where the 3,248 conversations came from
          </Text>
        </View>
        <View class="items-center gap-3 py-1">
          <View class="relative h-42 w-42 items-center justify-center">
            <Plot
              testID="lead-sources-plot"
              data={leadSources}
              appearGeneration="lead-sources"
              motion={{
                appear: { duration: 650, easing: "easeOut" },
                enter: { duration: 120 },
                exit: { duration: 100 },
                update: { duration: 240 },
                pointer: { stiffness: 300, damping: 30 },
              }}
              onHoverChange={({ index }) => hovered.set(index)}
              colorScale={{
                type: "ordinal",
                domain: leadSources.map((source) => source.label),
                range: leadSources.map((source) => token(source.tone)),
              }}
              tooltipContent={<LeadTooltip source={activeSource()} />}
              tooltipPlacement="pointer"
              tooltipOffset={6}
              accessibilityLabel="Lead sources: WhatsApp 52 percent, Email 28 percent, Website 12 percent, Others 8 percent"
              accessibilityValue={{ text: centerLabel() }}
              focusVisibleStyle={{
                outlineWidth: 2,
                outlineColor: token("ring"),
                outlineOffset: 2,
                borderRadius: 999,
              }}
              style={{ width: 168, height: 168 }}
            >
              <Pie
                value="countValue"
                innerRadius="66%"
                outerRadius="96%"
                padAngle={0.02}
                hoverLift={4}
                hoverDim={0.5}
                color="label"
                sliceStyle={{ stroke: token("card"), strokeWidth: 2 }}
              />
            </Plot>
            <View
              class="absolute items-center gap-0.5"
              testID="lead-sources-center"
              accessibilityLabel={centerLabel()}
              style={{ pointerEvents: "none" }}
            >
              <Text class="text-[22px] font-semibold leading-none tabular-nums text-foreground">
                {activeSource()?.count ?? "3,248"}
              </Text>
              <Text class="text-[12px] font-medium text-muted-foreground">
                {activeSource()?.label ?? "Total"}
              </Text>
              <Text class="text-[11px] text-muted-foreground">
                {activeSource() ? `${activeSource()?.value} of conversations` : "conversations"}
              </Text>
            </View>
          </View>
        </View>
        <View class="gap-1 border-t border-border pt-2">
          <Each of={leadSources}>
            {(source: () => LeadSource, index: () => number) => (
              <View
                role="button"
                accessibilityLabel={`${source().label} source`}
                accessibilityState={{ selected: activeIndex() === index() }}
                testID={`lead-source-${source().label.toLowerCase()}`}
                onPress={() => pinned.set(pinned() === index() ? null : index())}
                class="flex-row items-center gap-2 rounded-md px-1.5 py-1"
                style={{
                  backgroundColor: activeIndex() === index() ? token("accent") : "transparent",
                }}
                hoverStyle={{ backgroundColor: token("accent") }}
                focusVisibleStyle={{
                  outlineWidth: 2,
                  outlineColor: token("ring"),
                  outlineOffset: 1,
                }}
              >
                <View
                  class="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: token(source().tone) }}
                />
                <Text class="flex-1 text-[11px] text-muted-foreground">{source().label}</Text>
                <Text class="text-[12px] font-semibold tabular-nums text-foreground">
                  {source().value}
                </Text>
                <Text class="w-10 text-right text-[12px] tabular-nums text-muted-foreground">
                  {source().count}
                </Text>
              </View>
            )}
          </Each>
        </View>
      </Card>
    </If>
  );
}
