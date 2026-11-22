import { Scroll, Text, token, View } from "nsh";
import { MailList } from "./MailList";
import { mailCountLabel, mailFolderCount } from "../screens/inbox/mailMetrics";
import { type Conversation } from "../data";
import {
  channelFilter,
  allConversations,
  emailFolder,
  mailAccount,
  mailCompose,
  mailDetail,
  inboxScope,
  inboxSort,
  isUnread,
  matchesFilter,
  newMessageOpen,
  searchQuery,
  selectConversation,
  selectedId,
  visibleConversations,
  visibleCount,
} from "../state";
import { mailReadingOpen, toggleMailReading } from "../screens/inbox/mailState";
import { Avatar, Icon, IconButton, Verified } from "./ui";
import { Reveal } from "./motion";
import { MailSearchBar } from "./MailSearchBar";
import { InboxFilterMenu } from "./InboxFilterMenu";
import { ConversationContextMenu } from "./ConversationContextMenu";

function channelConversationCount(): number {
  const filter = channelFilter();
  return allConversations().filter(
    (conversation) => filter === "all" || conversation.channel === filter,
  ).length;
}

function headerCount(): number {
  return channelFilter() === "email"
    ? mailFolderCount(emailFolder(), mailAccount())
    : channelConversationCount();
}

function ConversationRow(props: { conversation: Conversation }) {
  const selected = () => selectedId() === props.conversation.id;
  const hidden = () => !matchesFilter(props.conversation);
  return (
    <ConversationContextMenu
      conversation={props.conversation}
      trigger={
        <View
          role="button"
          accessibilityLabel={`${isUnread(props.conversation) ? "Unread, " : ""}${props.conversation.name}, ${props.conversation.company}${props.conversation.typing ? ", typing" : ""}`}
          testID={`conversation-${props.conversation.id}`}
          onPress={() => selectConversation(props.conversation.id)}
          class="relative flex-row gap-3.5 border-b border-border px-4 py-3.5"
          style={{
            display: hidden() ? "none" : "flex",
            backgroundColor: selected() ? token("accent") : "transparent",
          }}
          hoverStyle={{ backgroundColor: token("accent") }}
          activeStyle={{ opacity: 0.82 }}
          focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: -2 }}
        >
          <If when={selected()}>
            <View class="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-primary" />
          </If>

          <Avatar
            name={props.conversation.name}
            size={44}
            online={props.conversation.presence !== "offline"}
          />

          <View class="min-w-0 flex-1 gap-1.5">
            <View class="flex-row items-center gap-1.5">
              <Text
                class="min-w-0 flex-1 text-[14px] font-semibold text-foreground"
                style={{ numberOfLines: 1 }}
              >
                {props.conversation.name}
              </Text>
              <If when={props.conversation.verified}>
                <Verified size={12} />
              </If>
              <Text class="text-[12px] font-medium tabular-nums text-muted-foreground">
                {props.conversation.time}
              </Text>
            </View>

            <View class="flex-row items-center gap-1.5">
              <Text
                class="min-w-0 flex-1 text-[14px] leading-5"
                style={{
                  numberOfLines: 2,
                  color: props.conversation.typing ? token("highlight") : token("muted-foreground"),
                }}
              >
                {props.conversation.typing ? "typing…" : props.conversation.preview}
              </Text>
              <If when={isUnread(props.conversation)}>
                <If
                  when={props.conversation.unread > 0}
                  else={
                    <View
                      class="h-2 w-2 rounded-full"
                      style={{ backgroundColor: token("unread") }}
                    />
                  }
                >
                  <View
                    class="h-4.25 min-w-4.25 items-center justify-center rounded-full px-1"
                    style={{ backgroundColor: token("unread") }}
                  >
                    <Text
                      class="text-[12px] font-semibold tabular-nums"
                      style={{ color: token("unread-foreground") }}
                    >
                      {props.conversation.unread}
                    </Text>
                  </View>
                </If>
              </If>
            </View>
          </View>
        </View>
      }
    />
  );
}

export function InboxList() {
  return (
    <View
      class={`${
        channelFilter() === "email" ? (mailReadingOpen() ? "w-92" : "flex-1") : "w-90.5"
      } shrink-0 flex-col border-r border-border bg-background`}
    >
      <View class="gap-3 px-4 pb-3 pt-4">
        <View class="flex-row items-center gap-2">
          <Text class="text-[22px] font-semibold text-foreground">
            {channelFilter() === "email" ? emailFolder() : "Inbox"}
          </Text>
          <View class="h-5 min-w-5 items-center justify-center rounded-md bg-muted px-1.5">
            <Text class="text-[12px] font-semibold tabular-nums text-muted-foreground">
              {headerCount()}
            </Text>
          </View>
          <If when={inboxScope() === "mine"}>
            <Text class="text-[11px] font-medium text-highlight">Mine</Text>
          </If>
          <View class="flex-1" />
          <If when={channelFilter() === "email"}>
            <IconButton
              icon="panelRight"
              label={mailReadingOpen() ? "Hide reading pane" : "Show reading pane"}
              size={28}
              testID="mail-reading-toggle"
              active={mailReadingOpen()}
              onPress={toggleMailReading}
            />
          </If>
          <If when={channelFilter() !== "email"}>
            <InboxFilterMenu />
          </If>
          <View
            role="button"
            accessibilityLabel={channelFilter() === "email" ? "Compose email" : "New message"}
            testID={channelFilter() === "email" ? "mail-compose" : undefined}
            onPress={() => {
              if (channelFilter() === "email") {
                mailDetail.set(null);
                mailCompose.set({ mode: "new" });
                mailReadingOpen.set(true);
              } else {
                newMessageOpen.set(true);
              }
            }}
            class="h-7 flex-row items-center gap-1 rounded-md bg-primary px-2.5"
            hoverStyle={{ opacity: 0.9 }}
            activeStyle={{ opacity: 0.75 }}
            focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 2 }}
          >
            <Icon name="plus" size={12} tone="primary-foreground" />
            <Text class="text-[12px] font-semibold text-primary-foreground">
              {channelFilter() === "email" ? "Compose" : "New"}
            </Text>
          </View>
        </View>

        <If when={channelFilter() === "email"}>
          <MailSearchBar />
        </If>

        <View class="flex-row items-center justify-between">
          <View class="flex-row items-center gap-1.5">
            <Text class="text-[12px] font-medium text-muted-foreground">
              {channelFilter() === "email"
                ? `${mailCountLabel(mailFolderCount(emailFolder(), mailAccount()))} · ${emailFolder().toLowerCase()}`
                : `${visibleCount()} conversations`}
            </Text>
            <If when={searchQuery().trim().length > 0}>
              <Text class="text-[12px] text-muted-foreground">for “{searchQuery()}”</Text>
            </If>
          </View>
          <If when={channelFilter() !== "email"}>
            <View class="flex-row items-center gap-1">
              <Text class="text-[12px] text-muted-foreground">{inboxSort()}</Text>
              <Icon name="chevronDown" size={10} tone="muted-foreground" />
            </View>
          </If>
        </View>
      </View>

      <Scroll class="flex-1 min-h-0" scrollbar={false}>
        <If when={channelFilter() === "email"}>
          <Reveal from="bottom">
            <MailList />
          </Reveal>
        </If>
        <If when={channelFilter() !== "email"}>
          <Reveal from="bottom">
            <Each of={visibleConversations()}>
              {(conversation: () => Conversation) => (
                <ConversationRow conversation={conversation()} />
              )}
            </Each>
            <View class="items-center gap-2 px-8 py-10">
              <Text class="text-[14px] font-medium text-foreground">
                {visibleCount() === 0 ? "No conversations match" : "End of recent conversations"}
              </Text>
              <Text class="text-center text-[12px] leading-4.25 text-muted-foreground">
                {visibleCount() === 0
                  ? "Try a different name, company, or channel."
                  : "Older conversations are in the archive."}
              </Text>
              <If when={searchQuery().trim().length > 0}>
                <View
                  role="button"
                  accessibilityLabel="Clear inbox search"
                  testID="clear-filters"
                  onPress={() => {
                    searchQuery.set("");
                  }}
                  class="mt-1 h-7 items-center justify-center rounded-md border border-border px-2.5"
                  hoverStyle={{ backgroundColor: token("accent") }}
                  activeStyle={{ opacity: 0.7 }}
                  focusVisibleStyle={{
                    outlineWidth: 2,
                    outlineColor: token("ring"),
                    outlineOffset: 1,
                  }}
                >
                  <Text class="text-[12px] font-medium text-foreground">Clear search</Text>
                </View>
              </If>
            </View>
          </Reveal>
        </If>
      </Scroll>

      <View class="flex-row items-center justify-between border-t border-border px-4 py-2.5">
        <Text class="text-[12px] tabular-nums text-muted-foreground">
          {channelFilter() === "email"
            ? `${emailFolder().toLowerCase()} folder · ${mailCountLabel(mailFolderCount(emailFolder(), mailAccount()))}`
            : channelFilter() === "all" && searchQuery().trim().length === 0
              ? `1–${visibleCount()} of ${channelConversationCount()}`
              : `${visibleCount()} of ${channelConversationCount()}`}
        </Text>
        <Text class="text-[11px] text-muted-foreground">Org-wide · read access</Text>
      </View>
    </View>
  );
}
