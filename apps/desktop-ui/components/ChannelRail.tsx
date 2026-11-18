import type { JSX } from "nsh";
import { Text, token, View } from "nsh";
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
import { mailUnreadCount } from "../screens/inbox/mail";
import { channelProviders, type ChannelProvider } from "./channel-config";
import { ChannelLogo } from "./ChannelLogo";
import { Icon } from "./ui";

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
        class="text-[9px] font-semibold leading-none"
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
        tooltip={props.tooltip}
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
      <Text class="text-[10.5px] font-medium text-foreground">
        {provider.label}
        {provider.isDefault ? " · Default" : ""}
      </Text>
      <Text class="text-[9px] text-muted-foreground">
        {provider.connected ? provider.account : `${provider.detail} · Not connected`}
      </Text>
    </View>
  );
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
              <Text class="text-[10.5px] font-medium text-foreground">All channels</Text>
              <Text class="text-[9px] text-muted-foreground">WhatsApp and email in one inbox</Text>
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

        <Each of={channelProviders}>
          {(provider: () => ChannelProvider) => (
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
          )}
        </Each>
      </View>

      <View class="items-center gap-1.5 border-t border-border pt-3">
        <View
          role="button"
          accessibilityLabel="Connect a channel"
          testID="channel-connect"
          tooltip={<Text class="text-[10px] text-foreground">Connect a channel</Text>}
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
