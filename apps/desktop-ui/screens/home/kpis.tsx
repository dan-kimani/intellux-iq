import { Text, token, View } from "nsh";
import { Card } from "../../components/ui";
import { Sparkline } from "../analytics/Sparkline";
import { homeKpis, type HomeKpi } from "./dashboard";
import { IconTile } from "./parts";
import { dealStageFilter, pipelineScope } from "../deals/state";
import { navTo } from "./nav";

function KpiCard(props: { item: HomeKpi }) {
  const open = () => {
    if (props.item.id === "closed" || props.item.id === "revenue") {
      dealStageFilter.set("won");
      pipelineScope.set("all");
    }
    navTo(props.item.page, props.item.child);
  };
  return (
    <View
      role="button"
      accessibilityLabel={`Open ${props.item.label}`}
      testID={`home-kpi-${props.item.id}`}
      onPress={open}
      class="min-w-0 rounded-xl"
      hoverStyle={{ opacity: 0.92 }}
    >
      <Card class="gap-2 p-4">
        <View class="flex-row items-center gap-2">
          <IconTile icon={props.item.icon} tone={props.item.tone} size={29} iconSize={12} />
          <Text class="min-w-0 flex-1 text-[12px] font-medium text-muted-foreground">
            {props.item.label}
          </Text>
        </View>

        <Text
          class="text-[22px] font-semibold leading-6 tabular-nums text-foreground"
          style={{ numberOfLines: 1 }}
        >
          {props.item.value}
        </Text>

        <View class="flex-row items-end justify-between gap-1">
          <View class="min-w-0 flex-1 gap-0.5">
            <Text
              class="text-[11px] font-semibold tabular-nums"
              style={{ color: token(props.item.deltaTone) as string }}
            >
              {props.item.delta}
            </Text>
            <Text class="text-[11px] text-muted-foreground" style={{ numberOfLines: 2 }}>
              {props.item.detail}
            </Text>
          </View>
          <View class="w-14 shrink-0">
            <Sparkline
              data={props.item.spark}
              tone={props.item.tone}
              label={`${props.item.label} trend`}
              testID={`home-kpi-spark-${props.item.id}`}
              height={24}
            />
          </View>
        </View>
      </Card>
    </View>
  );
}

export function KpiStrip() {
  return (
    <View class="grid grid-cols-3 gap-3 xl:grid-cols-5" testID="home-metrics">
      <Each of={homeKpis()}>{(item: () => HomeKpi) => <KpiCard item={item()} />}</Each>
    </View>
  );
}
