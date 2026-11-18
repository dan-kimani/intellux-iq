import type { JSX } from "nsh";
import { Text, token, View } from "nsh";
import { Menu, MenuItem, MenuSeparator } from "nsh/base";
import { Icon, type IconName } from "./ui";

export interface MenuAction {
  id: string;
  label: string;
  icon: IconName;
  shortcut?: string | (() => string);
  danger?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

function shortcutText(item: MenuAction): string | undefined {
  return typeof item.shortcut === "function" ? item.shortcut() : item.shortcut;
}

export function ActionMenu(props: {
  trigger: JSX.Element;
  groups: MenuAction[][];
  testID?: string;
  width?: number;
}) {
  return (
    <Menu
      placement="bottom"
      align="start"
      offset={6}
      testID={props.testID}
      popupClass="overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-2xl transition duration-150 ease-out motion-reduce:transition-none"
      popupStyle={{ width: props.width ?? 232 }}
      popupStartingClass="opacity-0 -translate-y-1"
      popupEndingClass="opacity-0"
      trigger={props.trigger}
    >
      <Each of={props.groups}>
        {(group: () => MenuAction[], index: () => number) => (
          <>
            <If when={index() > 0}>
              <MenuSeparator class="my-1 h-px w-full bg-border" />
            </If>
            <Each of={group()}>
              {(item: () => MenuAction) => (
                <MenuItem
                  testID={`menu-${item().id}`}
                  disabled={item().disabled}
                  class="h-8 flex-row items-center gap-2.5 rounded-md px-2"
                  hoverStyle={{ backgroundColor: token("accent") }}
                  onSelect={item().onSelect}
                >
                  <Icon
                    name={item().icon}
                    size={13}
                    tone={item().danger ? "destructive" : "muted-foreground"}
                  />
                  <Text
                    class="flex-1 text-[12px]"
                    style={{ color: token(item().danger ? "destructive" : "foreground") }}
                  >
                    {item().label}
                  </Text>
                  <If when={item().shortcut !== undefined}>
                    <Text class="text-[10px] text-muted-foreground">{shortcutText(item())}</Text>
                  </If>
                </MenuItem>
              )}
            </Each>
          </>
        )}
      </Each>
    </Menu>
  );
}

export function MenuTrigger(props: { label: string; icon?: IconName; testID: string }) {
  return (
    <View
      role="button"
      accessibilityLabel={props.label}
      testID={props.testID}
      class="h-8 flex-row items-center gap-1.5 rounded-md px-2"
      hoverStyle={{ backgroundColor: token("accent") }}
      focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
    >
      <If when={props.icon}>
        <Icon name={props.icon ?? "ellipsis"} size={13} tone="muted-foreground" />
      </If>
      <Text class="text-[11.5px] font-medium text-foreground max-[1359px]:hidden">
        {props.label}
      </Text>
      <Icon name="chevronDown" size={10} tone="muted-foreground" />
    </View>
  );
}
