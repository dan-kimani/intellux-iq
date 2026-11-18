import { reduceMotion, Scroll, Text, token, View } from "nsh";
import userPhoto from "../assets/images/user.jpg";
import { accountOpen, activeNav, activeNavChild, sidebarCollapsed } from "../state";
import { Avatar, Icon, IconButton, withAlpha } from "./ui";
import { SidebarNav } from "./SidebarNav";

function WorkspaceMark(props: { size?: number }) {
  const size = props.size ?? 34;
  return (
    <View
      class="items-center justify-center rounded-lg"
      style={{
        width: size,
        height: size,
        backgroundImage: `linear-gradient(145deg, ${token("chart-1")}, ${token("primary")})`,
      }}
    >
      <Text class="text-[15px] font-semibold text-primary-foreground">A</Text>
    </View>
  );
}

function ExpandedWorkspace() {
  return (
    <View
      role="button"
      accessibilityLabel="Open workspace menu"
      onPress={() => accountOpen.set(true)}
      class="flex-row items-center gap-2.5 rounded-3xl border border-border bg-card shadow-md p-2.5"
      hoverStyle={{ borderColor: token("ring") }}
    >
      <WorkspaceMark />
      <View class="min-w-0 flex-1 gap-0.5">
        <Text class="text-[12.5px] font-semibold text-foreground" style={{ numberOfLines: 1 }}>
          Acme Trading Ltd
        </Text>
        <View class="flex-row items-center gap-1.5">
          <View class="rounded-full bg-success" style={{ width: 5, height: 5 }} />
          <Text class="text-[10.5px] text-muted-foreground">Pro Plan</Text>
        </View>
      </View>
      <Icon name="chevronDown" size={11} tone="muted-foreground" />
    </View>
  );
}

function ConversionCard() {
  const compact = (
    <View
      role="button"
      accessibilityLabel="View insights"
      testID="insights-compact"
      tooltip={<Text class="text-xs text-foreground">View insights</Text>}
      onPress={() => activeNav.set("Analytics")}
      class="h-10 w-10 items-center justify-center rounded-xl border border-border"
      style={{
        backgroundColor: token("panel"),
        backgroundImage: `linear-gradient(145deg, ${withAlpha(token("chart-1"), "24")}, transparent 72%)`,
      }}
      hoverStyle={{ backgroundColor: token("accent") }}
    >
      <Icon name="chart" size={16} tone="highlight" />
    </View>
  );
  const expanded = (
    <View
      class="gap-3 overflow-hidden rounded-xl border border-border p-3.5"
      style={{
        backgroundColor: token("panel"),
        backgroundImage: `linear-gradient(145deg, ${withAlpha(token("chart-1"), "20")}, transparent 72%)`,
      }}
    >
      <View class="gap-1">
        <Text class="text-[11.5px] font-medium text-muted-foreground">Conversion rate</Text>
        <View class="flex-row items-end gap-2">
          <Text class="text-[28px] font-semibold leading-none text-success">+32%</Text>
          <Icon name="arrowUpRight" size={13} tone="success" />
        </View>
      </View>
      <View class="flex-row items-center justify-between">
        <Text class="text-[10.5px] text-muted-foreground">vs last month</Text>
        <View
          role="button"
          accessibilityLabel="View insights"
          onPress={() => activeNav.set("Analytics")}
          class="flex-row items-center gap-1"
        >
          <Text class="text-[11.5px] font-medium text-highlight">View insights</Text>
          <Icon name="chevronRight" size={11} tone="highlight" />
        </View>
      </View>
    </View>
  );
  return (
    <If when={sidebarCollapsed()} else={expanded}>
      {compact}
    </If>
  );
}

export function Sidebar() {
  const collapsed = sidebarCollapsed;
  return (
    <View
      class="shrink-0 flex-col border-r border-border bg-sidebar"
      style={{
        width: collapsed() ? 72 : 236,
        transitionProperty: "all",
        transitionDuration: reduceMotion() ? 0 : 180,
        transitionTimingFunction: reduceMotion() ? "ease-out" : "spring(320, 34)",
      }}
    >
      <Scroll class="flex-1 min-h-0" scrollbar={false}>
        <View class="px-3 pb-4 pt-3">
          <SidebarNav />
        </View>
      </Scroll>

      <View class="gap-2.5 px-3 pb-3">
        <If when={collapsed()} else={<ExpandedWorkspace />}>
          <View
            role="button"
            accessibilityLabel="Open workspace menu"
            onPress={() => accountOpen.set(true)}
            class="items-center justify-center rounded-3xl border border-border bg-card shadow-md p-2"
            hoverStyle={{ borderColor: token("ring") }}
          >
            <WorkspaceMark size={30} />
          </View>
        </If>
        <If when={collapsed()}>
          <View class="items-center">
            <ConversionCard />
          </View>
        </If>
        <If when={!collapsed()}>
          <ConversionCard />
        </If>
      </View>

      <View class="border-t border-sidebar-border px-3 py-3">
        <View
          class="flex-row items-center gap-2.5"
          style={{ justifyContent: collapsed() ? "center" : "flex-start" }}
        >
          <Avatar photo={userPhoto} initials="DM" size={34} online tone="green" />
          <If when={!collapsed()}>
            <View class="flex-1 gap-1">
              <Text class="text-[12px] font-semibold leading-none text-foreground">
                David Mwangi
              </Text>
              <Text class="text-[10px] leading-none text-muted-foreground">Sales Manager</Text>
            </View>
            <IconButton
              icon="settings"
              label="Open settings"
              size={28}
              active={activeNav() === "Settings"}
              testID="nav-settings"
              onPress={() => {
                activeNav.set("Settings");
                activeNavChild.set(null);
              }}
            />
            <Icon name="chevronDown" size={12} tone="muted-foreground" />
          </If>
          <If when={collapsed()}>
            <IconButton
              icon="settings"
              label="Open settings"
              size={28}
              active={activeNav() === "Settings"}
              testID="nav-settings"
              onPress={() => {
                activeNav.set("Settings");
                activeNavChild.set(null);
              }}
            />
          </If>
        </View>
      </View>
    </View>
  );
}
