import { Text, token, View } from "nsh";
import { Avatar, Card, Icon } from "../../components/ui";
import { useAfter } from "../../components/motion";
import { SkeletonPanel } from "../../components/skeletons";
import { analyticsTeamOpen } from "./state";
import { team } from "./data";

export function TeamPerformance() {
  const ready = useAfter(400);
  return (
    <If when={ready()} else={<SkeletonPanel rows={5} />}>
      <Card class="h-full w-88 shrink-0 gap-2 p-3.5">
        <View class="flex-row items-center justify-between">
          <View class="gap-1">
            <Text class="text-[14px] font-semibold text-foreground">Team performance</Text>
            <Text class="text-[12px] text-muted-foreground">Outcomes, not activity</Text>
          </View>
          <View
            role="button"
            accessibilityLabel="Open team performance"
            onPress={() => analyticsTeamOpen.set(true)}
            class="flex-row items-center gap-1"
          >
            <Text class="text-[11px] font-medium text-highlight">View all</Text>
            <Icon name="chevronRight" size={10} tone="highlight" />
          </View>
        </View>
        <View class="flex-row items-center gap-2 border-b border-border pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <Text class="flex-1">Sales rep</Text>
          <Text class="w-16 text-right">Conv.</Text>
          <Text class="w-10 text-right">Won</Text>
          <Text class="w-24 text-right">Conversion</Text>
        </View>
        <Each of={team}>
          {(member: () => (typeof team)[number]) => (
            <View class="flex-row items-center gap-2 border-b border-border py-0.5 last:border-b-0">
              <View class="min-w-0 flex-1 flex-row items-center gap-2">
                <Avatar name={member().name} size={18} />
                <Text
                  class="min-w-0 text-[12px] font-medium text-foreground"
                  style={{ numberOfLines: 2 }}
                >
                  {member().name}
                </Text>
              </View>
              <Text class="w-16 text-right text-[11px] tabular-nums text-muted-foreground">
                {member().conversations}
              </Text>
              <Text class="w-10 text-right text-[11px] font-medium tabular-nums text-foreground">
                {member().deals}
              </Text>
              <View class="w-24 flex-row items-center justify-end gap-1">
                <View class="h-1 w-10 overflow-hidden rounded-full bg-muted">
                  <View
                    class="h-full rounded-full"
                    style={{
                      width: `${(member().conversion / 15) * 100}%`,
                      backgroundColor: token(member().bar),
                    }}
                  />
                </View>
                <Text class="w-8 text-right text-[11px] font-medium tabular-nums text-foreground">
                  {member().conversion}%
                </Text>
              </View>
            </View>
          )}
        </Each>
      </Card>
    </If>
  );
}
