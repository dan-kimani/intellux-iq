import { Text, View } from "nsh";
import { AppDialog } from "./overlay";
import { OnboardingDialog } from "./OnboardingDialog";
import { onboardingOpen } from "../screens/settings/state";
import { Avatar, Badge, SectionTitle } from "./ui";
import { accountOpen } from "../state";
import { AccountActionRow, commonAccountActions, type AccountAction } from "./AccountActions";

function closeAccount() {
  accountOpen.set(false);
}

function AccountDialog() {
  return (
    <AppDialog
      open={() => true}
      onClose={closeAccount}
      title="Account"
      description="Alex Morgan · Sales Manager"
      width={440}
      testID="account-dialog"
    >
      <View class="gap-4">
        <View class="flex-row items-center gap-3 rounded-xl border border-border bg-card shadow-md p-3">
          <Avatar name="Alex Morgan" size={42} online />
          <View class="min-w-0 flex-1 gap-0.5">
            <Text class="text-[13px] font-semibold text-foreground">Alex Morgan</Text>
            <Text class="text-[11px] text-muted-foreground">david@acmetrading.com</Text>
            <Badge variant="success">
              <View class="h-1.5 w-1.5 rounded-full bg-success" />
              <Text class="text-[11px] font-medium text-success">Active session</Text>
            </Badge>
          </View>
        </View>
        <View class="grid grid-cols-2 gap-2">
          <Info label="Workspace" value="Acme Trading Inc." />
          <Info label="Plan" value="Pro · 5 seats" />
          <Info label="Device" value="MacBook Pro · linked" />
          <Info label="Token refresh" value="in 12 minutes" />
        </View>
        <View class="gap-0.5">
          <SectionTitle>Quick actions</SectionTitle>
          <Each of={commonAccountActions()}>
            {(action: () => AccountAction) => (
              <AccountActionRow
                action={action()}
                testID={`account-action-${action().id}`}
                onPress={() => {
                  if (!action().keepOpen) closeAccount();
                  action().onSelect();
                }}
              />
            )}
          </Each>
        </View>
      </View>
    </AppDialog>
  );
}

function Info(props: { label: string; value: string }) {
  return (
    <View class="gap-0.5 rounded-lg border border-border bg-panel p-2.5">
      <Text class="text-[11px] uppercase tracking-wider text-muted-foreground">{props.label}</Text>
      <Text class="text-[11px] font-medium text-foreground">{props.value}</Text>
    </View>
  );
}

export function GlobalDialogs() {
  return (
    <>
      <If when={accountOpen()}>
        <AccountDialog />
      </If>
      <If when={onboardingOpen()}>
        <OnboardingDialog />
      </If>
    </>
  );
}
