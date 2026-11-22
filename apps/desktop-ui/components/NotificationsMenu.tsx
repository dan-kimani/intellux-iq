import { Scroll, signal, Text, token, View } from "nsh";
import { Popover } from "nsh/base";
import { Icon, withAlpha } from "./ui";
import { activeNav, notificationsRead, showToast, type NavItem } from "../state";

const notifications = [
  {
    title: "New deal won: 50 units",
    detail: "$1.2M booked against Maya Lin",
    time: "2m ago",
    tone: "chart-3" as const,
    target: "Deals" as NavItem,
  },
  {
    title: "Quotation viewed by Atlas Enterprises",
    detail: "QT-2025-0045 viewed 2× today",
    time: "5m ago",
    tone: "chart-2" as const,
    target: "Quotes" as NavItem,
  },
  {
    title: "Follow-up reminder: TechWorld Ltd",
    detail: "Assigned to Aiko Tanaka",
    time: "8m ago",
    tone: "chart-4" as const,
    target: "Inbox" as NavItem,
  },
  {
    title: "Opportunity inactivity signal",
    detail: "Verdant Foods has had no activity for 7 days",
    time: "1h ago",
    tone: "chart-5" as const,
    target: "Deals" as NavItem,
  },
];

export function NotificationsMenu() {
  const open = signal(false);
  return (
    <Popover
      open={open()}
      onOpenChange={({ open: next }) => open.set(next)}
      placement="bottom"
      align="end"
      offset={6}
      popupClass="rounded-lg border border-border bg-popover shadow-2xl transition duration-150 ease-out motion-reduce:transition-none"
      popupStyle={{ width: 380 }}
      popupStartingClass="opacity-0 -translate-y-1"
      popupEndingClass="opacity-0"
      trigger={
        <View
          role="button"
          accessibilityLabel="Notifications"
          testID="notifications-button"
          class="relative h-8 w-8 items-center justify-center rounded-md"
          hoverStyle={{ backgroundColor: token("accent") }}
          focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: -2 }}
        >
          <Icon name="bell" size={16} tone="avatar-5" />
          <If when={!notificationsRead()}>
            <View
              class="absolute items-center justify-center rounded-full border-2 border-panel-strong bg-avatar-1"
              style={{ width: 16, height: 16, right: -1, top: -1 }}
            >
              <Text
                style={{
                  fontSize: 9,
                  lineHeight: 9,
                  fontWeight: "700",
                  color: token("avatar-1-foreground"),
                }}
              >
                3
              </Text>
            </View>
          </If>
        </View>
      }
    >
      <View class="gap-2 p-2" testID="notifications-popover">
        <View class="flex-row items-center justify-between px-2 py-1">
          <View class="gap-0.5">
            <Text class="text-[13px] font-semibold text-foreground">Notifications</Text>
            <Text class="text-[12px] text-muted-foreground">
              {notificationsRead()
                ? "You're caught up."
                : "3 unread updates across your workspace."}
            </Text>
          </View>
          <View
            role="button"
            accessibilityLabel="Mark all notifications read"
            onPress={() => {
              notificationsRead.set(true);
              showToast("All notifications marked read.");
            }}
            class="rounded px-1.5 py-0.5"
            hoverStyle={{ backgroundColor: token("accent") }}
          >
            <Text class="text-[12px] text-muted-foreground">Mark all read</Text>
          </View>
        </View>
        <View class="h-px bg-border" />
        <Scroll style={{ maxHeight: 360 }} scrollbar={false}>
          <Each of={notifications}>
            {(item: () => (typeof notifications)[number], index: () => number) => (
              <View
                role="button"
                accessibilityLabel={`Open notification: ${item().title}`}
                onPress={() => {
                  notificationsRead.set(true);
                  open.set(false);
                  activeNav.set(item().target);
                }}
                class="flex-row items-start gap-2.5 rounded-md px-2 py-2.5"
                hoverStyle={{ backgroundColor: token("accent") }}
              >
                <View
                  class="h-7 w-7 items-center justify-center rounded-md"
                  style={{ backgroundColor: withAlpha(token(item().tone), "20") }}
                >
                  <Icon
                    name={
                      index() === 1
                        ? "fileText"
                        : index() === 2
                          ? "calendarClock"
                          : index() === 3
                            ? "zap"
                            : "briefcase"
                    }
                    size={13}
                    tone={item().tone}
                  />
                </View>
                <View class="min-w-0 flex-1 gap-0.5">
                  <View class="flex-row items-center gap-1.5">
                    <Text class="text-[12px] font-medium text-foreground">{item().title}</Text>
                    <If when={!notificationsRead() && index() < 3}>
                      <View class="h-1.5 w-1.5 rounded-full bg-primary" />
                    </If>
                  </View>
                  <Text class="text-[12px] text-muted-foreground">{item().detail}</Text>
                </View>
                <Text class="text-[11px] text-muted-foreground">{item().time}</Text>
              </View>
            )}
          </Each>
        </Scroll>
        <View class="flex-row items-center justify-between border-t border-border px-2 pt-2">
          <Text class="text-[11px] text-muted-foreground">Deterministic events only</Text>
          <View
            role="button"
            accessibilityLabel="Close notifications"
            testID="notifications-close"
            onPress={() => open.set(false)}
            class="rounded px-1.5 py-0.5"
            hoverStyle={{ backgroundColor: token("accent") }}
          >
            <Text class="text-[12px] font-medium text-foreground">Close</Text>
          </View>
        </View>
      </View>
    </Popover>
  );
}
