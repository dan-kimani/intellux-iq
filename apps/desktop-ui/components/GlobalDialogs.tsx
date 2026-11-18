import { Text, token, View } from "nsh";
import { colorScheme, setColorScheme } from "nsh";
import userPhoto from "../assets/images/user.jpg";
import { AppDialog } from "./overlay";
import { OnboardingDialog } from "./OnboardingDialog";
import { onboardingOpen } from "../screens/settings/state";
import { Avatar, Badge, Icon, SectionTitle } from "./ui";
import { activeNav, accountOpen, locked, showToast } from "../state";

function closeAccount() {
  accountOpen.set(false);
}

function AccountDialog() {
  return (
    <AppDialog
      open={() => true}
      onClose={closeAccount}
      title="Account"
      description="David Mwangi · Sales Manager"
      width={440}
      testID="account-dialog"
    >
      <View class="gap-4">
        <View class="flex-row items-center gap-3 rounded-3xl border border-border bg-card shadow-md p-3">
          <Avatar photo={userPhoto} initials="DM" size={42} online tone="green" />
          <View class="min-w-0 flex-1 gap-0.5">
            <Text class="text-[12px] font-semibold text-foreground">David Mwangi</Text>
            <Text class="text-[9.5px] text-muted-foreground">david@acmetrading.co.ke</Text>
            <Badge variant="success">
              <View class="h-1.5 w-1.5 rounded-full bg-success" />
              <Text class="text-[8px] font-medium text-success">Active session</Text>
            </Badge>
          </View>
        </View>
        <View class="grid grid-cols-2 gap-2">
          <Info label="Workspace" value="Acme Trading Ltd" />
          <Info label="Plan" value="Pro · 5 seats" />
          <Info label="Device" value="MacBook Pro · linked" />
          <Info label="Token refresh" value="in 12 minutes" />
        </View>
        <View class="gap-0.5">
          <SectionTitle>Quick actions</SectionTitle>
          <MenuRow
            icon="settings"
            label="Workspace settings"
            detail="Name, currency, timezone"
            onPress={() => {
              closeAccount();
              activeNav.set("Settings");
            }}
          />
          <MenuRow
            icon="shieldCheck"
            label="Security & sessions"
            detail="Devices, auto-lock, access"
            onPress={() => {
              closeAccount();
              activeNav.set("Settings");
              showToast("Opened device and security settings.");
            }}
          />
          <MenuRow
            icon={colorScheme() === "dark" ? "sun" : "moon"}
            label={colorScheme() === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            detail="Applies immediately"
            onPress={() => setColorScheme(colorScheme() === "dark" ? "light" : "dark")}
          />
          <MenuRow
            icon="sparkles"
            label="Product tour"
            detail="A short walkthrough of the new workflows"
            onPress={() => {
              closeAccount();
              onboardingOpen.set(true);
            }}
          />
          <MenuRow
            icon="arrowUpRight"
            label="Sign out"
            detail="End this desktop session"
            onPress={() => {
              closeAccount();
              locked.set(true);
            }}
          />
        </View>
      </View>
    </AppDialog>
  );
}

function Info(props: { label: string; value: string }) {
  return (
    <View class="gap-0.5 rounded-lg border border-border bg-panel p-2.5">
      <Text class="text-[8.5px] uppercase tracking-wide text-muted-foreground">{props.label}</Text>
      <Text class="text-[9.5px] font-medium text-foreground">{props.value}</Text>
    </View>
  );
}

function MenuRow(props: {
  icon: "settings" | "shieldCheck" | "sun" | "moon" | "arrowUpRight" | "sparkles";
  label: string;
  detail: string;
  onPress: () => void;
}) {
  return (
    <View
      role="button"
      accessibilityLabel={props.label}
      onPress={props.onPress}
      class="flex-row items-center gap-2.5 rounded-lg px-2 py-2"
      hoverStyle={{ backgroundColor: token("accent") }}
    >
      <View class="h-6 w-6 items-center justify-center rounded-md bg-muted">
        <Icon name={props.icon} size={12} tone="muted-foreground" />
      </View>
      <View class="min-w-0 flex-1 gap-0.5">
        <Text class="text-[10px] font-medium text-foreground">{props.label}</Text>
        <Text class="text-[8.5px] text-muted-foreground">{props.detail}</Text>
      </View>
      <Icon name="chevronRight" size={10} tone="muted-foreground" />
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
