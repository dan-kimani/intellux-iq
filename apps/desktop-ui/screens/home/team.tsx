import { Text, token, View } from "nsh";
import { Card } from "../../components/ui";
import { currentMember } from "../../state";
import { ownerPerformance, type OwnerPerformance } from "./dashboard";
import { money } from "./data";
import { navTo } from "./nav";
import { CardHead, LinkAction } from "./parts";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

function OwnerRow(props: { row: OwnerPerformance; max: number }) {
  const width = () =>
    props.max ? Math.max(8, Math.round((props.row.total / props.max) * 100)) : 0;
  const openShare = () =>
    props.row.total ? Math.round((props.row.open / props.row.total) * 100) : 0;
  return (
    <View class="flex-row items-center gap-2">
      <View class="h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
        <Text class="text-[11px] font-semibold text-muted-foreground">
          {initials(props.row.owner)}
        </Text>
      </View>

      <View class="min-w-0 flex-1 gap-1">
        <View class="flex-row items-center gap-2">
          <Text
            class="min-w-0 flex-1 text-[11px] font-medium text-foreground"
            style={{ numberOfLines: 1 }}
          >
            {props.row.owner}
          </Text>
          <Text class="text-[11px] font-semibold tabular-nums text-foreground">
            {money(props.row.total)}
          </Text>
        </View>
        <View class="h-1.5 rounded-full bg-muted">
          <View
            class="h-full flex-row overflow-hidden rounded-full"
            style={{ width: `${width()}%` }}
          >
            <View
              style={{ width: `${openShare()}%`, backgroundColor: token("primary") as string }}
            />
            <View class="flex-1" style={{ backgroundColor: token("success") as string }} />
          </View>
        </View>
        <View class="flex-row items-center justify-between">
          <Text class="text-[11px] tabular-nums text-muted-foreground">
            {props.row.deals} {props.row.deals === 1 ? "deal" : "deals"} · {props.row.wonShare}% won
          </Text>
          <Text
            class="text-[11px] font-medium tabular-nums"
            style={{ color: token("success") as string }}
          >
            {money(props.row.won)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function TeamPerformance() {
  const manager = currentMember.role === "manager";
  const rows = () => ownerPerformance(4, manager ? undefined : currentMember.name);
  const max = () => Math.max(1, ...rows().map((row) => row.total));

  return (
    <Card class="gap-2 p-4" testID="home-team">
      <CardHead
        title={manager ? "Team performance" : "My performance"}
        subtitle="Open and won by owner"
        action={<LinkAction label="Analytics" onPress={() => navTo("Analytics", "analytics")} />}
      />

      <View class="flex-1 justify-center gap-2.5">
        <If
          when={rows().length > 0}
          else={
            <View class="items-center py-5">
              <Text class="text-[11px] text-muted-foreground">No owner pipeline yet.</Text>
            </View>
          }
        >
          <Each of={rows()}>
            {(row: () => OwnerPerformance) => <OwnerRow row={row()} max={max()} />}
          </Each>
        </If>
      </View>

      <View class="flex-row items-center gap-3 border-t border-border pt-2">
        <View class="flex-row items-center gap-1">
          <View
            class="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: token("primary") as string }}
          />
          <Text class="text-[11px] text-muted-foreground">Open</Text>
        </View>
        <View class="flex-row items-center gap-1">
          <View
            class="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: token("success") as string }}
          />
          <Text class="text-[11px] text-muted-foreground">Won</Text>
        </View>
      </View>
    </Card>
  );
}
