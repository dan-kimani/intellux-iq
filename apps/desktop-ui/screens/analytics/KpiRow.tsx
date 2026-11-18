import { signal, Text, token, View } from "nsh";
import { Card, Icon, withAlpha } from "../../components/ui";
import { useAfter } from "../../components/motion";
import { SkeletonMetric } from "../../components/skeletons";
import { Sparkline } from "./Sparkline";
import { kpis } from "./data";

type Kpi = (typeof kpis)[number];

function KpiCard(props: { item: Kpi }) {
  const hovered = signal<number | null>(null);
  const item = props.item;
  return (
    <Card class="gap-2 overflow-hidden p-3">
      <View class="flex-row items-start justify-between gap-2">
        <View class="flex-row items-center gap-2">
          <View
            class="h-7 w-7 items-center justify-center rounded-lg"
            style={{ backgroundColor: withAlpha(token(item.tone), "1f") }}
          >
            <Icon name={item.icon} size={13} tone={item.tone} />
          </View>
          <Text class="text-[10px] font-medium text-muted-foreground">{item.label}</Text>
        </View>
        <Text
          classList={{
            "text-success": hovered() === null,
            "text-foreground": hovered() !== null,
          }}
          class="text-[9.5px] font-semibold"
        >
          {hovered() === null ? item.delta : `${hovered()}`}
        </Text>
      </View>
      <View class="flex-row items-end justify-between gap-2">
        <View class="gap-0.5">
          <Text class="text-[23px] font-semibold leading-none tracking-tight text-foreground">
            {item.value}
          </Text>
          <Text class="text-[9.5px] text-muted-foreground">
            {hovered() === null ? item.note : "At this point"}
          </Text>
        </View>
      </View>
      <View class="-mx-3.5 -mb-3.5 pt-1">
        <Sparkline
          data={item.spark}
          tone={item.tone}
          label={item.label}
          testID={`sparkline-${item.label.toLowerCase().replaceAll(" ", "-")}`}
          height={34}
          onHover={(value) => hovered.set(value)}
        />
      </View>
    </Card>
  );
}

export function KpiRow() {
  const ready = useAfter(180);
  return (
    <If
      when={ready()}
      else={
        <View class="grid grid-cols-5 gap-3">
          <SkeletonMetric />
          <SkeletonMetric />
          <SkeletonMetric />
          <SkeletonMetric />
          <SkeletonMetric />
        </View>
      }
    >
      <View class="grid grid-cols-5 gap-3">
        <Each of={kpis}>{(item: () => Kpi) => <KpiCard item={item()} />}</Each>
      </View>
    </If>
  );
}
