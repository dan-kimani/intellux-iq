import { Text, token, View } from "nsh";
import { Card, Icon, withAlpha } from "../../components/ui";
import { useAfter } from "../../components/motion";
import { Skeleton } from "../../components/skeletons";
import { funnelStages, pipelineMetrics } from "./data";

export function PipelineOverview() {
  const ready = useAfter(360);
  return (
    <If when={ready()} else={<Skeleton class="h-52 rounded-xl" />}>
      <Card class="h-full min-w-0 flex-1 gap-3 p-3">
        <View class="flex-row items-center justify-between">
          <View class="gap-1">
            <Text class="text-[13.5px] font-semibold text-foreground">Pipeline overview</Text>
            <Text class="text-[10.5px] text-muted-foreground">
              Opportunity flow for the selected period
            </Text>
          </View>
          <Icon name="briefcase" size={14} tone="muted-foreground" />
        </View>

        <View class="flex-row gap-1">
          <Each of={funnelStages}>
            {(stage: () => (typeof funnelStages)[number], index: () => number) => (
              <View
                class="flex-1 items-center gap-0.5 rounded-md border px-1 py-2"
                style={{
                  backgroundColor: withAlpha(token(stage().tone), "1a"),
                  borderColor: withAlpha(token(stage().tone), "55"),
                  transform:
                    index() === 0 ? "skewX(-6deg)" : index() === 4 ? "skewX(6deg)" : "none",
                }}
              >
                <View
                  style={{
                    transform:
                      index() === 0 ? "skewX(6deg)" : index() === 4 ? "skewX(-6deg)" : "none",
                  }}
                >
                  <Text class="text-[10.5px] font-medium text-muted-foreground">
                    {stage().label}
                  </Text>
                  <Text class="text-[16px] font-semibold text-foreground">{stage().value}</Text>
                  <Text class="text-[9.5px] text-muted-foreground">{stage().share}</Text>
                </View>
              </View>
            )}
          </Each>
        </View>

        <View class="flex-row gap-3 border-t border-border pt-2.5">
          <Each of={pipelineMetrics}>
            {(metric: () => (typeof pipelineMetrics)[number]) => (
              <View class="flex-1 gap-0.5 border-l border-border pl-2.5 first:border-l-0 first:pl-0">
                <View class="flex-row items-center gap-1">
                  <Icon name={metric().icon} size={10} tone="muted-foreground" />
                  <Text class="text-[9.5px] text-muted-foreground">{metric().label}</Text>
                </View>
                <View class="flex-row items-baseline gap-1.5">
                  <Text class="text-[15px] font-semibold text-foreground">{metric().value}</Text>
                  <Text class="text-[9.5px] font-medium text-success">{metric().delta}</Text>
                </View>
              </View>
            )}
          </Each>
        </View>
      </Card>
    </If>
  );
}
