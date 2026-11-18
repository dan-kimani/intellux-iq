import { Text, token, View } from "nsh";
import { Button, Card, Icon, SectionTitle, withAlpha } from "../../components/ui";
import { useAfter } from "../../components/motion";
import { SkeletonPanel } from "../../components/skeletons";
import { analyticsActivityOpen, analyticsInsightOpen } from "./state";
import { topProducts, recentActivity } from "./data";

export function RecentActivity() {
  const ready = useAfter(440);
  return (
    <If when={ready()} else={<SkeletonPanel rows={4} />}>
      <Card class="h-full min-w-0 flex-1 gap-3 p-4">
        <View class="flex-row items-center justify-between">
          <SectionTitle>Recent activity</SectionTitle>
          <View
            role="button"
            accessibilityLabel="View all activity"
            onPress={() => analyticsActivityOpen.set(true)}
            class="flex-row items-center gap-1"
          >
            <Text class="text-[10px] font-medium text-highlight">View all</Text>
            <Icon name="chevronRight" size={10} tone="highlight" />
          </View>
        </View>
        <Each of={recentActivity}>
          {(item: () => (typeof recentActivity)[number]) => (
            <View class="flex-row items-start gap-2.5 border-t border-border pt-2.5 first:border-t-0 first:pt-0">
              <View
                class="mt-0.5 h-6 w-6 items-center justify-center rounded-md"
                style={{ backgroundColor: withAlpha(token(item().tone), "20") }}
              >
                <Icon name={item().icon} size={11} tone={item().tone} />
              </View>
              <View class="min-w-0 flex-1 gap-0.5">
                <Text class="text-[11px] font-medium leading-4 text-foreground">
                  {item().title}
                </Text>
                <Text class="text-[9.5px] text-muted-foreground">{item().meta}</Text>
              </View>
            </View>
          )}
        </Each>
      </Card>
    </If>
  );
}

export function TopProducts() {
  const ready = useAfter(480);
  return (
    <If when={ready()} else={<SkeletonPanel rows={3} />}>
      <Card class="h-full min-w-0 flex-1 gap-3 p-4">
        <SectionTitle>Top products</SectionTitle>
        <Each of={topProducts}>
          {(product: () => (typeof topProducts)[number]) => (
            <View class="gap-1.5">
              <View class="flex-row items-center justify-between">
                <Text class="text-[10.5px] font-medium text-foreground">{product().name}</Text>
                <Text class="text-[9.5px] text-muted-foreground">{product().units}</Text>
              </View>
              <View class="h-1.5 overflow-hidden rounded-full bg-muted">
                <View
                  class="h-full rounded-full"
                  style={{ width: `${product().share}%`, backgroundColor: token(product().tone) }}
                />
              </View>
            </View>
          )}
        </Each>
      </Card>
    </If>
  );
}

export function InsightsCard() {
  const ready = useAfter(520);
  const bars = [8, 12, 10, 18, 22, 28];
  return (
    <If when={ready()} else={<SkeletonPanel rows={2} />}>
      <Card
        class="h-full w-64 shrink-0 gap-3 overflow-hidden p-4"
        style={{
          backgroundImage: `linear-gradient(145deg, ${withAlpha(token("warning"), "16")}, transparent 80%)`,
        }}
      >
        <View class="flex-row items-center gap-2">
          <View
            class="h-6 w-6 items-center justify-center rounded-md"
            style={{ backgroundColor: withAlpha(token("warning"), "20") }}
          >
            <Icon name="sparkles" size={13} tone="warning" />
          </View>
          <Text class="text-[11px] font-semibold text-foreground">Insights</Text>
        </View>
        <Text class="text-[10px] leading-4 text-muted-foreground">
          Your conversion rate increased by 1.1% compared to last month. Keep up the great work!
        </Text>
        <View class="flex-row items-end gap-1 self-end pt-1">
          <Each of={bars}>
            {(height: () => number, index: () => number) => (
              <View
                class="w-1.5 rounded-t-sm"
                style={{
                  height: height(),
                  backgroundColor:
                    index() === bars.length - 1
                      ? token("warning")
                      : withAlpha(token("warning"), "45"),
                }}
              />
            )}
          </Each>
        </View>
        <Button
          variant="outline"
          size="sm"
          class="w-full"
          onPress={() => analyticsInsightOpen.set(true)}
        >
          <Text class="text-[10px] font-medium">View details</Text>
          <Icon name="arrowUpRight" size={10} tone="muted-foreground" />
        </Button>
      </Card>
    </If>
  );
}
