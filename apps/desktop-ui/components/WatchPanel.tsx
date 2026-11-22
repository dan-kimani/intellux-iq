import { Scroll, Text, token, View } from "nsh";
import { Icon, IconButton } from "./ui";
import { WatchRowView } from "./WatchRow";
import {
  attentionCount,
  filteredWatchRows,
  watchDockOpen,
  watchFilter,
  watchedCount,
  type WatchRow,
} from "../watch/state";

function FilterChip(props: {
  label: string;
  active: boolean;
  testID: string;
  onPress: () => void;
}) {
  return (
    <View
      role="button"
      accessibilityLabel={props.label}
      testID={props.testID}
      onPress={props.onPress}
      class={`h-6 flex-row items-center rounded-full border px-2.5 ${
        props.active ? "border-primary bg-primary" : "border-border bg-transparent"
      }`}
      hoverStyle={{ opacity: 0.82 }}
      focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
    >
      <Text
        class="text-[10px] font-semibold"
        style={{ color: token(props.active ? "primary-foreground" : "muted-foreground") }}
      >
        {props.label}
      </Text>
    </View>
  );
}

const trackedCount = () => watchedCount();
const actionCount = () => attentionCount();

export function WatchPanel(props: { maxListHeight: number; onReset: () => void }) {
  return (
    <View class="overflow-hidden rounded-xl border border-border bg-popover shadow-2xl">
      <View class="flex-row items-center gap-2.5 border-b border-border px-3.5 py-3">
        <View class="h-8 w-8 items-center justify-center rounded-full bg-accent">
          <Icon name="eye" size={14} tone="chart-1" />
        </View>
        <View class="min-w-0 flex-1 gap-0.5">
          <Text class="text-[13px] font-semibold text-foreground">Watching</Text>
          <Text class="text-[10px] text-muted-foreground">
            {trackedCount()} tracked
            {actionCount() > 0 ? ` · ${actionCount()} need action` : " · all quiet"}
          </Text>
        </View>
        <IconButton
          icon="refresh"
          label="Reset dock position"
          size={26}
          testID="watch-position-reset"
          onPress={props.onReset}
        />
        <IconButton
          icon="close"
          label="Collapse watchlist"
          size={26}
          testID="watch-dock-close"
          onPress={() => watchDockOpen.set(false)}
        />
      </View>
      <View class="flex-row items-center gap-1 border-b border-border px-3 py-2">
        <FilterChip
          label={`All ${trackedCount()}`}
          active={watchFilter() === "all"}
          testID="watch-filter-all"
          onPress={() => watchFilter.set("all")}
        />
        <FilterChip
          label={`Needs action ${actionCount()}`}
          active={watchFilter() === "attention"}
          testID="watch-filter-attention"
          onPress={() => watchFilter.set("attention")}
        />
        <View class="flex-1" />
        <Text class="text-[10px] text-muted-foreground">Private</Text>
      </View>
      <If
        when={filteredWatchRows().length > 0}
        else={
          <View class="items-center gap-1.5 px-5 py-8">
            <View class="h-9 w-9 items-center justify-center rounded-full bg-accent">
              <Icon name="eye" size={15} tone="muted-foreground" />
            </View>
            <Text class="text-[12px] font-semibold text-foreground">
              {trackedCount() === 0 ? "Nothing watched yet" : "Nothing needs action"}
            </Text>
            <Text class="max-w-64 text-center text-[11px] leading-4 text-muted-foreground">
              {trackedCount() === 0
                ? "Use Watch on a conversation, email thread, or task to keep it here."
                : "Watched items are quiet right now. Switch to All to see them."}
            </Text>
          </View>
        }
      >
        <Scroll
          style={{ maxHeight: props.maxListHeight }}
          scrollbar={false}
          testID="watch-dock-list"
        >
          <View>
            <Each of={filteredWatchRows()}>
              {(row: () => WatchRow) => <WatchRowView row={row()} />}
            </Each>
          </View>
        </Scroll>
      </If>
      <View class="flex-row items-center gap-1.5 px-3.5 py-2">
        <Icon name="shieldCheck" size={9} tone="muted-foreground" />
        <Text class="text-[10px] text-muted-foreground">Private to you</Text>
      </View>
    </View>
  );
}
