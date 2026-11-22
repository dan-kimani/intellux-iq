import type { JSX } from "nsh";
import { Text, View } from "nsh";
import { Tabs, Tab } from "nsh/base";

export interface SectionTabItem {
  id: string;
  label: string;
  count?: number;
}

export function SectionTabs(props: {
  items: SectionTabItem[];
  value: string;
  onChange: (id: string) => void;
  accessibilityLabel: string;
  testPrefix: string;
  trailing?: JSX.Element;
}) {
  return (
    <View class="flex-row items-center gap-3">
      <Tabs
        accessibilityLabel={props.accessibilityLabel}
        indicatorClass="inset-y-0 rounded-md bg-accent"
        class="flex-row items-center gap-1"
      >
        <Each of={props.items}>
          {(item: () => SectionTabItem) => (
            <Tab
              selected={props.value === item().id}
              onPress={() => props.onChange(item().id)}
              accessibilityLabel={`${item().label}${
                item().count === undefined ? "" : `, ${item().count}`
              }`}
              testID={`${props.testPrefix}-${item().id}`}
              class="h-9 flex-row items-center gap-1.5 rounded-md px-3"
            >
              <Text
                classList={{
                  "text-foreground": props.value === item().id,
                  "text-muted-foreground": props.value !== item().id,
                }}
                class="text-[12px] font-medium"
              >
                {item().label}
              </Text>
              <If when={item().count !== undefined}>
                <Text class="text-[11px] font-medium text-muted-foreground">{item().count}</Text>
              </If>
            </Tab>
          )}
        </Each>
      </Tabs>
      <View class="flex-1" />
      {props.trailing}
    </View>
  );
}
