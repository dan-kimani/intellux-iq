import type { JSX } from "nsh";
import { Text, token } from "nsh";
import { ContextMenu, MenuItem, MenuSeparator } from "nsh/base";
import { Icon, type IconName } from "./ui";

export interface ContextAction {
  id: string;
  label: string;
  icon: IconName;
  description?: string;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

/**
 * Native desktop context menu (NSH 0.6). The trigger keeps its own press,
 * hover and focus behaviour; the secondary button, Shift+F10 or the Menu key
 * opens the same actions for keyboard and screen-reader users.
 */
export function ContextActions(props: {
  trigger: JSX.Element;
  groups: ContextAction[][];
  testID?: string;
  width?: number;
}) {
  return (
    <ContextMenu
      testID={props.testID}
      trigger={props.trigger}
      popupClass="overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-2xl transition duration-150 ease-out motion-reduce:transition-none"
      popupStyle={{ width: props.width ?? 232 }}
      popupStartingClass="opacity-0 -translate-y-1"
      popupEndingClass="opacity-0"
    >
      <Each of={props.groups}>
        {(group: () => ContextAction[], index: () => number) => (
          <>
            <If when={index() > 0}>
              <MenuSeparator class="my-1 h-px w-full bg-border" />
            </If>
            <Each of={group()}>
              {(item: () => ContextAction) => (
                <MenuItem
                  testID={`context-${item().id}`}
                  disabled={item().disabled}
                  accessibilityDescription={item().description}
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
                  <If when={item().shortcut}>
                    <Text class="text-[10px] text-muted-foreground">{item().shortcut}</Text>
                  </If>
                </MenuItem>
              )}
            </Each>
          </>
        )}
      </Each>
    </ContextMenu>
  );
}
