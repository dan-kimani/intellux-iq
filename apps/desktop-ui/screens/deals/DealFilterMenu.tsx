import { signal, Text, token, View } from "nsh";
import { Popover } from "nsh/base";
import { Button, Icon } from "../../components/ui";
import { SelectField, TextField } from "../../components/forms";
import { dealStages, type DealStage } from "./data";
import {
  activeDealFilterCount,
  dealOwnerFilter,
  dealRows,
  dealSearch,
  dealStageFilter,
} from "./state";

const ownerOptions = [
  "All owners",
  "David Mwangi",
  "Yasir Noori",
  "Amina Kimani",
  "Moses Otieno",
  "James Njoroge",
];

export function DealFilterMenu() {
  const open = signal(false);
  const stage = signal<DealStage | "all">(dealStageFilter());
  const owner = signal(dealOwnerFilter());
  const query = signal(dealSearch());
  const apply = () => {
    dealStageFilter.set(stage());
    dealOwnerFilter.set(owner());
    dealSearch.set(query());
    open.set(false);
  };
  return (
    <Popover
      open={open()}
      onOpenChange={({ open: next }) => open.set(next)}
      placement="bottom"
      align="end"
      offset={6}
      popupClass="rounded-lg border border-border bg-popover p-3 shadow-2xl transition duration-150 ease-out motion-reduce:transition-none"
      popupStartingClass="opacity-0 -translate-y-1"
      popupEndingClass="opacity-0"
      popupStyle={{ width: 330 }}
      trigger={
        <View
          role="button"
          accessibilityLabel="Filter pipeline"
          class="h-8 flex-row items-center gap-1.5 rounded-md border border-border bg-card px-2.5"
          hoverStyle={{ backgroundColor: token("accent") }}
          focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
        >
          <Icon name="funnel" size={12} tone="muted-foreground" />
          <Text class="text-[10px] font-medium text-foreground">
            {activeDealFilterCount() > 0 ? `Filter (${activeDealFilterCount()})` : "Filter"}
          </Text>
        </View>
      }
    >
      <View class="gap-3" testID="deal-filter-popover">
        <View class="flex-row items-center justify-between">
          <Text class="text-[12.5px] font-semibold text-foreground">Filter pipeline</Text>
          <View
            role="button"
            accessibilityLabel="Reset pipeline filters"
            onPress={() => {
              stage.set("all");
              owner.set("All owners");
              query.set("");
            }}
            class="rounded px-1.5 py-0.5"
            hoverStyle={{ backgroundColor: token("accent") }}
          >
            <Text class="text-[10px] text-muted-foreground">Reset</Text>
          </View>
        </View>
        <View class="gap-1.5">
          <Text class="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Stage
          </Text>
          <View class="flex-row flex-wrap gap-1.5">
            <View
              role="button"
              accessibilityLabel="Filter all stages"
              onPress={() => stage.set("all")}
              class="h-7 items-center justify-center rounded-md border px-2"
              style={{
                backgroundColor: stage() === "all" ? token("accent") : "transparent",
                borderColor: stage() === "all" ? token("ring") : token("border"),
              }}
            >
              <Text class="text-[9.5px] font-medium text-foreground">All stages</Text>
            </View>
            <Each of={dealStages}>
              {(item: () => (typeof dealStages)[number]) => (
                <View
                  role="button"
                  accessibilityLabel={`Filter ${item().label}`}
                  onPress={() => stage.set(item().id)}
                  class="h-7 items-center justify-center rounded-md border px-2"
                  style={{
                    backgroundColor: stage() === item().id ? token("accent") : "transparent",
                    borderColor: stage() === item().id ? token("ring") : token("border"),
                  }}
                >
                  <Text class="text-[9.5px] font-medium text-foreground">{item().label}</Text>
                </View>
              )}
            </Each>
          </View>
        </View>
        <SelectField label="Owner" value={owner} options={ownerOptions} onChange={owner.set} />
        <TextField
          label="Search"
          value={query}
          onChange={query.set}
          placeholder="Company or product…"
        />
        <View class="flex-row items-center justify-between border-t border-border pt-2">
          <Text class="text-[9.5px] text-muted-foreground">{dealRows().length} visible</Text>
          <Button variant="primary" size="sm" testID="apply-deal-filter" onPress={apply}>
            <Text class="text-[10px] font-semibold text-primary-foreground">Apply</Text>
          </Button>
        </View>
      </View>
    </Popover>
  );
}
