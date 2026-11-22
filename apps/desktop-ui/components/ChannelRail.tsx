import type { JSX } from "nsh";
import { createAnimatedValue, signal, Text, token, View } from "nsh";
import type { Channel } from "../data";
import {
  allConversations,
  channelConnectOpen,
  channelFilter,
  emailFolder,
  isUnread,
  mailCompose,
  mailDetail,
  selectConversation,
  selectedId,
} from "../state";
import { mailUnreadCount } from "../screens/inbox/mailMetrics";
import type { ChannelProvider } from "./channel-config";
import { ChannelLogo } from "./ChannelLogo";
import { Icon, Tooltip } from "./ui";
import { moveChannel, orderedChannelProviders } from "./channelOrder";

function unreadFor(filter: "all" | Channel): number {
  return allConversations()
    .filter((conversation) => filter === "all" || conversation.channel === filter)
    .reduce(
      (total, conversation) =>
        total + (isUnread(conversation) ? Math.max(1, conversation.unread) : 0),
      0,
    );
}

function UnreadBadge(props: { count: number; testID: string }) {
  return (
    <View
      testID={props.testID}
      accessibilityElementsHidden
      class="absolute -right-1 -top-1 h-4 min-w-4 items-center justify-center rounded-full px-1"
      style={{
        borderWidth: 2,
        borderColor: token("sidebar"),
        backgroundColor: token("unread"),
        pointerEvents: "none",
      }}
    >
      <Text
        class="text-[11px] font-semibold leading-none"
        style={{ color: token("unread-foreground") }}
      >
        {props.count}
      </Text>
    </View>
  );
}

function RailButton(props: {
  label: string;
  selected: boolean;
  count: number;
  testID: string;
  badgeTestID: string;
  tooltip: JSX.Element;
  onPress?: () => void;
  disabled?: boolean;
  children?: JSX.Element;
}) {
  return (
    <View class="relative h-10 w-10 shrink-0">
      <View
        role="button"
        accessibilityLabel={`${props.label}${props.count > 0 ? `, ${props.count} unread` : ""}${props.disabled ? ", not connected" : ""}${props.selected ? ", selected" : ""}`}
        testID={props.testID}
        disabled={props.disabled}
        tooltip={<Tooltip>{props.tooltip}</Tooltip>}
        onPress={props.onPress}
        class={`relative h-10 w-10 items-center justify-center rounded-2xl border ${props.selected ? "shadow-sm" : ""}`}
        style={{
          backgroundColor: props.selected ? token("card") : "transparent",
          borderColor: props.selected ? token("border") : "transparent",
        }}
        hoverStyle={props.disabled ? undefined : { backgroundColor: token("accent") }}
        activeStyle={props.disabled ? undefined : { opacity: 0.72 }}
        focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 2 }}
        disabledStyle={{ opacity: 0.82 }}
      >
        <If when={props.selected}>
          <View class="absolute -left-3 h-5 w-0.5 rounded-full bg-primary" />
        </If>
        {props.children}
      </View>
      <If when={props.count > 0}>
        <UnreadBadge count={props.count} testID={props.badgeTestID} />
      </If>
    </View>
  );
}

function tooltipFor(provider: ChannelProvider) {
  return (
    <View class="gap-0.5">
      <Text class="text-[12px] font-medium text-foreground">
        {provider.label}
        {provider.isDefault ? " · Default" : ""}
      </Text>
      <Text class="text-[11px] text-muted-foreground">
        {provider.connected ? provider.account : `${provider.detail} · Not connected`}
      </Text>
      <Text class="text-[10px] text-muted-foreground">Drag to reorder</Text>
    </View>
  );
}

function providers(): ChannelProvider[] {
  return orderedChannelProviders();
}

function clampChannel(index: number): number {
  return Math.max(0, Math.min(index, providers().length - 1));
}

function selectProvider(provider: ChannelProvider) {
  if (!provider.connected || !provider.channel) return;
  channelFilter.set(provider.channel);
  if (provider.channel === "email") {
    emailFolder.set("Inbox");
    mailDetail.set(null);
    mailCompose.set(null);
    return;
  }
  const current = allConversations().find((conversation) => conversation.id === selectedId());
  if (current?.channel !== provider.channel) {
    const next = allConversations().find(
      (conversation) => conversation.channel === provider.channel,
    );
    if (next) selectConversation(next.id);
  }
}

export function ChannelRail() {
  const dragY = createAnimatedValue(0);
  const dragX = createAnimatedValue(0);
  const drag = signal<{ id: string; from: number; to: number } | null>(null);
  let targetTimer: ReturnType<typeof setInterval> | undefined;

  const startDrag = (id: string, from: number) => {
    dragY.set(0);
    drag.set({ id, from, to: from });
    if (targetTimer) clearInterval(targetTimer);
    targetTimer = setInterval(async () => {
      const value = await dragY.getValue();
      const current = drag();
      if (!current) return;
      const to = clampChannel(current.from + Math.round(value / 46));
      if (to !== current.to) drag.set({ ...current, to });
    }, 50);
  };

  const endDrag = (event: { translation: { y: number } }) => {
    if (targetTimer) clearInterval(targetTimer);
    targetTimer = undefined;
    const current = drag();
    if (current) {
      const to = clampChannel(current.from + Math.round(event.translation.y / 46));
      moveChannel(current.from, to);
    }
    drag.set(null);
    dragY.set(0);
  };

  return (
    <View
      testID="channel-rail"
      class="w-16 shrink-0 flex-col items-center border-r border-border bg-sidebar py-3"
    >
      <View class="min-h-0 flex-1 flex-col items-center gap-1.5">
        <RailButton
          label="All channels"
          selected={channelFilter() === "all"}
          count={unreadFor("all")}
          testID="filter-all"
          badgeTestID="unread-all"
          tooltip={
            <View class="gap-0.5">
              <Text class="text-[12px] font-medium text-foreground">All channels</Text>
              <Text class="text-[11px] text-muted-foreground">
                One inbox for messaging, social, and email
              </Text>
            </View>
          }
          onPress={() => channelFilter.set("all")}
        >
          <Icon
            name="inbox"
            size={17}
            tone={channelFilter() === "all" ? "foreground" : "muted-foreground"}
          />
        </RailButton>

        <View class="my-0.5 h-px w-7 bg-border" />

        <View
          testID="channel-provider-list"
          accessibilityLabel={`Channel order: ${providers()
            .map((provider) => provider.label)
            .join(", ")}`}
          class="relative flex-col gap-1.5"
        >
          <Each of={providers()}>
            {(provider: () => ChannelProvider, index: () => number) => (
              <View
                class="relative h-10 w-10 cursor-grab"
                pan={{ x: dragX, y: dragY }}
                onPanStart={() => startDrag(provider().id, index())}
                onPanEnd={endDrag}
                style={{ opacity: drag()?.id === provider().id ? 0 : 1 }}
              >
                <RailButton
                  label={provider().label}
                  selected={provider().connected && channelFilter() === provider().channel}
                  count={
                    provider().connected
                      ? provider().id === "gmail"
                        ? mailUnreadCount()
                        : unreadFor(provider().channel ?? "all")
                      : 0
                  }
                  testID={
                    provider().id === "whatsapp"
                      ? "filter-whatsapp"
                      : provider().connected
                        ? "filter-email"
                        : `channel-${provider().id}`
                  }
                  badgeTestID={`unread-${provider().id}`}
                  tooltip={tooltipFor(provider())}
                  onPress={() => selectProvider(provider())}
                  disabled={!provider().connected}
                >
                  <ChannelLogo provider={provider()} muted={!provider().connected} />
                </RailButton>
              </View>
            )}
          </Each>

          <If when={drag()}>
            <View
              testID="channel-drop-indicator"
              class="pointer-events-none absolute -left-1 -right-1 z-20 h-0.5 rounded-full bg-primary"
              style={{ top: (drag()?.to ?? 0) * 46 }}
            />
            <View
              testID="channel-drag-preview"
              class="pointer-events-none absolute left-0 top-0 z-30 h-10 w-10 items-center justify-center rounded-2xl border border-ring bg-card shadow-2xl"
              style={{
                top: (drag()?.from ?? 0) * 46,
                transform: [{ translateY: dragY }],
              }}
            >
              <ChannelLogo
                provider={
                  providers().find((provider) => provider.id === drag()?.id) ?? providers()[0]
                }
              />
            </View>
          </If>
        </View>
      </View>

      <View class="items-center gap-1.5 border-t border-border pt-3">
        <View
          role="button"
          accessibilityLabel="Connect a channel"
          testID="channel-connect"
          tooltip={<Tooltip label="Connect a channel" placement="top" />}
          onPress={() => channelConnectOpen.set(true)}
          class="h-10 w-10 items-center justify-center rounded-xl border border-dashed border-border"
          hoverStyle={{ backgroundColor: token("accent"), borderColor: token("ring") }}
          activeStyle={{ opacity: 0.7 }}
          focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 2 }}
        >
          <Icon name="plus" size={16} tone="muted-foreground" />
        </View>
      </View>
    </View>
  );
}
