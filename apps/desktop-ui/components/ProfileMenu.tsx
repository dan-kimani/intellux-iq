import { signal, Text, View } from "nsh";
import { Popover } from "nsh/base";
import { accountOpen } from "../state";
import { AccountActionRow, commonAccountActions, type AccountAction } from "./AccountActions";
import { Avatar, IconButton } from "./ui";

const accountOverview: AccountAction = {
  id: "account-overview",
  icon: "users",
  label: "Account overview",
  detail: "Profile, plan, and linked devices",
  onSelect: () => accountOpen.set(true),
};

export function ProfileMenu() {
  const open = signal(false);
  const run = (action: AccountAction) => {
    if (!action.keepOpen) open.set(false);
    action.onSelect();
  };
  return (
    <Popover
      open={open()}
      onOpenChange={({ open: next }) => open.set(next)}
      placement="top"
      align="start"
      offset={8}
      popupClass="rounded-xl border border-border bg-popover p-1.5 shadow-2xl transition duration-150 ease-out motion-reduce:transition-none"
      popupStyle={{ width: 264 }}
      popupStartingClass="opacity-0 translate-y-1"
      popupEndingClass="opacity-0"
      trigger={
        <IconButton
          icon="chevronDown"
          label="Open profile menu"
          size={28}
          testID="profile-menu-trigger"
        />
      }
    >
      <View testID="profile-menu" class="gap-1">
        <View class="flex-row items-center gap-2.5 rounded-lg px-2 py-2">
          <Avatar name="Alex Morgan" size={34} online />
          <View class="min-w-0 flex-1 gap-0.5">
            <Text class="text-[12px] font-semibold leading-none text-foreground">Alex Morgan</Text>
            <Text class="text-[11px] leading-none text-muted-foreground">
              david@acmetrading.com
            </Text>
          </View>
          <View class="flex-row items-center gap-1">
            <View class="rounded-full bg-success" style={{ width: 5, height: 5 }} />
            <Text class="text-[11px] text-muted-foreground">Active</Text>
          </View>
        </View>
        <View class="h-px bg-border" />
        <View class="gap-0.5">
          <AccountActionRow
            action={accountOverview}
            testID="profile-action-account-overview"
            onPress={() => run(accountOverview)}
          />
          <Each of={commonAccountActions()}>
            {(action: () => AccountAction) => (
              <AccountActionRow
                action={action()}
                testID={`profile-action-${action().id}`}
                onPress={() => run(action())}
              />
            )}
          </Each>
        </View>
      </View>
    </Popover>
  );
}
