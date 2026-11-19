import { colorScheme, setColorScheme, signal, Text, token, View } from "nsh";
import { currentWindow, isAvailable, type WindowMode } from "nsh/desktop";
import { Input as NativeInput } from "nsh/base";
import userPhoto from "../assets/images/user.jpg";
import {
  activeNav,
  accountOpen,
  commandOpen,
  newMessageOpen,
  online,
  searchQuery,
  showToast,
  sidebarCollapsed,
  syncOpen,
} from "../state";
import { newDealOpen } from "../screens/deals/state";
import { quoteBuilderOpen } from "../screens/quotes/state";
import { onboardingOpen } from "../screens/settings/state";
import { shortcutLabel } from "../screens/settings/shortcuts";
import { Avatar, Icon, IconButton, Kbd, Lockup, type IconName } from "./ui";
import { WindowMoreMenu } from "./WindowMoreMenu";
import { NotificationsMenu } from "./NotificationsMenu";

function showWindowNotice(message: string) {
  // The web prototype cannot control the native window; report the shell action.
  showToast(message);
}

/** The main window's mode, shared with the app frame that rounds its corners. */
export const windowMode = signal<WindowMode>("normal");

function TrafficButton(props: {
  kind: "minimize" | "maximize" | "close";
  restore?: () => boolean;
  onPress: () => void;
}) {
  const restore = () => props.restore?.() ?? false;
  const symbol = () =>
    props.kind === "minimize" ? "−" : props.kind === "maximize" ? (restore() ? "⧉" : "□") : "×";
  const label = () =>
    props.kind === "close"
      ? "Close window"
      : props.kind === "minimize"
        ? "Minimize window"
        : restore()
          ? "Restore window"
          : "Maximize window";
  const tip = () =>
    props.kind === "close"
      ? "Close"
      : props.kind === "minimize"
        ? "Minimize"
        : restore()
          ? "Restore"
          : "Maximize";
  return (
    <View
      role="button"
      accessibilityLabel={label()}
      testID={`window-${props.kind}`}
      tooltip={<Text class="text-xs text-foreground">{tip()}</Text>}
      onPress={props.onPress}
      class="h-8 w-8 items-center justify-center rounded-md"
      hoverStyle={{ backgroundColor: token(props.kind === "close" ? "destructive" : "accent") }}
      focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: -2 }}
    >
      <Text
        class="text-[14px] leading-none"
        style={{ color: token(props.kind === "close" ? "foreground" : "muted-foreground") }}
      >
        {symbol()}
      </Text>
    </View>
  );
}

function QuickAction(props: {
  icon: IconName;
  label: string;
  testID: string;
  onPress: () => void;
}) {
  return (
    <View
      role="button"
      accessibilityLabel={props.label}
      testID={props.testID}
      tooltip={<Text class="text-xs text-foreground">{props.label}</Text>}
      onPress={props.onPress}
      class="h-8 flex-row items-center gap-1.5 rounded-md px-2"
      hoverStyle={{ backgroundColor: token("accent") }}
      focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
    >
      <Icon name={props.icon} size={13} tone="muted-foreground" />
      <Text class="text-[11.5px] font-medium text-foreground max-[1359px]:hidden">
        {props.label}
      </Text>
    </View>
  );
}

export function WindowChrome() {
  const windowRef = isAvailable ? currentWindow() : null;
  if (windowRef) {
    const current = windowRef.state()?.mode ?? "normal";
    if (windowMode() !== current) windowMode.set(current);
    windowRef.on("modeChange", ({ mode }) => windowMode.set(mode));
  }
  const act = (kind: "minimize" | "maximize" | "close") => {
    if (!windowRef) {
      showWindowNotice(
        `${kind === "close" ? "Close" : kind === "minimize" ? "Minimize" : "Maximize"} is handled by the desktop shell.`,
      );
      return;
    }
    if (kind === "close") windowRef.close();
    else if (kind === "minimize") windowRef.minimize();
    else if (windowRef.state()?.mode === "maximized") windowRef.setMode("normal");
    else windowRef.setMode("maximized");
  };
  return (
    <View
      class="h-11 shrink-0 flex-row items-center gap-2 border-b border-border bg-panel-strong px-2.5"
      desktop={{ windowDrag: true }}
    >
      <View class="flex-row items-center gap-2 pr-1">
        <Lockup height={24} scheme={colorScheme()} />
        <View class="rounded border border-border px-1 py-0.5">
          <Text class="text-[8px] font-semibold text-muted-foreground">2.0</Text>
        </View>
      </View>
      <View class="mx-0.5 h-5 w-px bg-border" />
      <QuickAction
        icon="inbox"
        label="New message"
        testID="chrome-new-message"
        onPress={() => {
          activeNav.set("Inbox");
          newMessageOpen.set(true);
        }}
      />
      <QuickAction
        icon="briefcase"
        label="New deal"
        testID="chrome-new-deal"
        onPress={() => {
          activeNav.set("Deals");
          newDealOpen.set(true);
        }}
      />
      <QuickAction
        icon="fileText"
        label="New quote"
        testID="chrome-new-quote"
        onPress={() => {
          activeNav.set("Quotes");
          quoteBuilderOpen.set(true);
        }}
      />
      <WindowMoreMenu />
      <View class="flex-1" />
      <View class="h-8 w-64 max-[1359px]:w-48 flex-row items-center gap-2 rounded-md border border-border bg-background px-2.5">
        <Icon name="search" size={13} tone="muted-foreground" />
        <NativeInput
          value={searchQuery()}
          onChange={({ value }) => searchQuery.set(value)}
          placeholder="Search IntelluxIQ…"
          testID="global-search"
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
        <View
          role="button"
          accessibilityLabel="Open command search"
          testID="open-command"
          onPress={() => commandOpen.set(true)}
          class="flex-row items-center gap-0.5 rounded p-0.5"
          hoverStyle={{ backgroundColor: token("accent") }}
        >
          <Kbd>{shortcutLabel("search")}</Kbd>
        </View>
      </View>
      <View
        role="button"
        accessibilityLabel="Open sync and outbox"
        testID="sync-status"
        onPress={() => syncOpen.set(true)}
        class="h-8 flex-row items-center gap-1.5 rounded-md border border-border bg-background px-2"
        hoverStyle={{ backgroundColor: token("accent") }}
      >
        <View
          class="rounded-full"
          style={{ width: 5, height: 5, backgroundColor: token(online() ? "success" : "warning") }}
        />
        <Text class="text-[10.5px] font-medium text-muted-foreground">
          {online() ? "Synced" : "Offline"}
        </Text>
      </View>
      <IconButton
        icon="panelRight"
        label={sidebarCollapsed() ? "Expand sidebar" : "Collapse sidebar"}
        size={32}
        testID="sidebar-toggle"
        onPress={() => sidebarCollapsed.set(!sidebarCollapsed())}
      />
      <NotificationsMenu />
      <IconButton
        icon={colorScheme() === "dark" ? "sun" : "moon"}
        label={colorScheme() === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        size={32}
        testID="theme-toggle"
        onPress={() => setColorScheme(colorScheme() === "dark" ? "light" : "dark")}
      />
      <IconButton
        icon="gauge"
        label="Help and onboarding"
        size={32}
        testID="help-button"
        onPress={() => onboardingOpen.set(true)}
      />
      <View
        role="button"
        accessibilityLabel="Open account menu"
        testID="account-menu"
        onPress={() => accountOpen.set(true)}
        class="rounded-full p-0.5"
        hoverStyle={{ backgroundColor: token("accent") }}
      >
        <Avatar photo={userPhoto} initials="DM" size={26} online tone="green" />
      </View>
      <View class="ml-1 flex-row items-center gap-0.5 border-l border-border pl-1.5">
        <TrafficButton kind="minimize" onPress={() => act("minimize")} />
        <TrafficButton
          kind="maximize"
          restore={() => windowMode() === "maximized"}
          onPress={() => act("maximize")}
        />
        <TrafficButton kind="close" onPress={() => act("close")} />
      </View>
    </View>
  );
}
