import { signal, Text, token, View } from "nsh";
import { Popover } from "nsh/base";
import { Icon } from "./ui";
import { mailSort, type MailSort } from "../screens/inbox/mailState";

const sorts: MailSort[] = ["Recent", "Oldest", "Sender"];

export function MailSortMenu() {
  const open = signal(false);
  return (
    <Popover
      open={open()}
      onOpenChange={({ open: next }) => open.set(next)}
      placement="bottom"
      align="end"
      offset={6}
      popupClass="rounded-lg border border-border bg-popover p-1 shadow-2xl"
      popupStyle={{ width: 150 }}
      trigger={
        <View
          role="button"
          accessibilityLabel="Sort mail"
          testID="mail-sort-trigger"
          class="h-7 flex-row items-center gap-1 rounded-md px-1.5"
          hoverStyle={{ backgroundColor: token("accent") }}
        >
          <Text class="text-[12px] text-muted-foreground">{mailSort()}</Text>
          <Icon name="chevronDown" size={10} tone="muted-foreground" />
        </View>
      }
    >
      <View class="gap-0.5" testID="mail-sort-popover">
        <Each of={sorts}>
          {(sort: () => MailSort) => (
            <View
              role="button"
              accessibilityLabel={`Sort by ${sort()}`}
              onPress={() => {
                mailSort.set(sort());
                open.set(false);
              }}
              class="h-8 flex-row items-center gap-2 rounded-md px-2"
              hoverStyle={{ backgroundColor: token("accent") }}
            >
              <If when={mailSort() === sort()}>
                <Icon name="check" size={11} tone="primary" />
              </If>
              <If when={mailSort() !== sort()}>
                <View style={{ width: 11, height: 11 }} />
              </If>
              <Text class="text-[12px] text-foreground">{sort()}</Text>
            </View>
          )}
        </Each>
      </View>
    </Popover>
  );
}
