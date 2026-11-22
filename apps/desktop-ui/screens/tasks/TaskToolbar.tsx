import { Input as NativeInput } from "nsh/base";
import { Text, token, View } from "nsh";
import { ActionMenu } from "../../components/ActionMenu";
import { Icon } from "../../components/ui";
import { teamMembers } from "../../state";
import { taskFilters, taskOwner, taskQuery, taskScope, type TaskFilter } from "./view";

function filtersFor(active: TaskFilter, onSelect: (filter: TaskFilter) => void) {
  return (
    <View class="flex-row flex-wrap items-center gap-1">
      <Each of={taskFilters}>
        {(filter: () => (typeof taskFilters)[number]) => (
          <View
            role="button"
            accessibilityLabel={`Show ${filter().label.toLowerCase()} tasks`}
            testID={`task-filter-${filter().id}`}
            onPress={() => onSelect(filter().id)}
            class="h-7 items-center justify-center rounded-md px-2.5"
            style={{ backgroundColor: active === filter().id ? token("primary") : token("panel") }}
            hoverStyle={{ backgroundColor: token("accent") }}
          >
            <Text
              class="text-[11px] font-medium"
              style={{
                color:
                  active === filter().id ? token("primary-foreground") : token("muted-foreground"),
              }}
            >
              {filter().label}
            </Text>
          </View>
        )}
      </Each>
    </View>
  );
}

export function TaskToolbar(props: { selecting: boolean; onToggleSelecting: () => void }) {
  return (
    <View class="shrink-0 gap-2 px-4 pb-2.5 pt-3">
      <View class="flex-row items-center gap-1.5">
        <View class="h-8 min-w-0 flex-1 flex-row items-center gap-1.5 rounded-md border border-border bg-card px-2">
          <Icon name="search" size={11} tone="muted-foreground" />
          <NativeInput
            value={taskQuery()}
            onChange={({ value }) => taskQuery.set(value)}
            placeholder="Search tasks…"
            testID="task-search"
            style={{
              flex: 1,
              height: 28,
              paddingLeft: 0,
              paddingRight: 0,
              fontSize: 12,
              color: token("foreground"),
              placeholderColor: token("muted-foreground"),
              backgroundColor: "transparent",
              borderWidth: 0,
            }}
          />
        </View>
        <ActionMenu
          testID="task-owner-menu"
          width={190}
          trigger={
            <View
              role="button"
              accessibilityLabel="Filter tasks by owner"
              class="h-8 flex-row items-center gap-1 rounded-md border border-border px-2"
              hoverStyle={{ backgroundColor: token("accent") }}
            >
              <Icon name="users" size={10} tone="muted-foreground" />
              <Text class="max-w-20 truncate text-[11px] text-muted-foreground">
                {taskOwner() === "all" ? "All owners" : taskOwner().split(" ")[0]}
              </Text>
              <Icon name="chevronDown" size={8} tone="muted-foreground" />
            </View>
          }
          groups={[
            [
              {
                id: "all-owners",
                label: "All owners",
                icon: "users",
                onSelect: () => taskOwner.set("all"),
              },
              ...teamMembers.map((member) => ({
                id: `owner-${member.id}`,
                label: member.name,
                icon: "users" as const,
                onSelect: () => taskOwner.set(member.name),
              })),
            ],
          ]}
        />
      </View>
      <View class="flex-row items-center justify-between gap-2">
        {filtersFor(taskScope(), taskScope.set)}
        <View
          role="button"
          accessibilityLabel={props.selecting ? "Exit bulk selection" : "Select tasks"}
          testID="task-select-toggle"
          onPress={props.onToggleSelecting}
          class="h-7 items-center justify-center rounded-md border border-border px-2"
          hoverStyle={{ backgroundColor: token("accent") }}
        >
          <Text class="text-[11px] font-medium text-muted-foreground">
            {props.selecting ? "Done" : "Select"}
          </Text>
        </View>
      </View>
    </View>
  );
}
