import { effect, Scroll, Text, token, View } from "nsh";
import type { ScrollRef } from "nsh";
import { Avatar, Badge, Button, Icon, IconButton } from "../../components/ui";
import { ActionMenu } from "../../components/ActionMenu";
import { workMenuActions } from "../work/actions";
import { emailThreadLink } from "../work/links";
import { WorkSection } from "../work/WorkSection";
import { MailReplyComposer } from "./MailReplyComposer";
import { currentMember, mailCompose, mailDetail, showToast } from "../../state";
import { mailRows, type MailItem } from "./mail";
import { mailThreadMessages } from "./mailState";
import { mailPartyName, mailThreadKey } from "./mailIdentity";
import { isWatched, toggleWatch } from "../../watch/state";
import { mailStatusStyle } from "./mailStatus";
import { MailThreadMessages } from "../../components/MailThreadMessages";

function threadRecipients(item: MailItem): string[] {
  return mailThreadMessages(item).flatMap((row) => [
    row.from,
    row.to,
    ...(row.cc ? row.cc.split(",") : []),
  ]);
}

function archiveThread(item: MailItem) {
  const messages = mailThreadMessages(item);
  const target = messages.every((row) => row.folder === "Archive") ? "Inbox" : "Archive";
  const ids = messages.map((row) => row.id);
  mailRows.set(mailRows().map((row) => (ids.includes(row.id) ? { ...row, folder: target } : row)));
  mailDetail.set(null);
  mailCompose.set(null);
  showToast(target === "Archive" ? "Thread archived." : "Thread moved to Inbox.");
}

function markThreadUnread(item: MailItem) {
  const ids = mailThreadMessages(item).map((row) => row.id);
  mailRows.set(mailRows().map((row) => (ids.includes(row.id) ? { ...row, read: false } : row)));
  mailDetail.set(null);
  mailCompose.set(null);
  showToast("Thread marked unread.");
}

export function MailDetailPage(props: { item: MailItem }) {
  const item = () => mailRows().find((row) => row.id === props.item.id) ?? props.item;
  const thread = () => mailThreadMessages(item());
  const participantNames = () => {
    const names = threadRecipients(item()).map((address) => mailPartyName(address.trim()));
    return [...new Set(names)];
  };
  const participants = () =>
    participantNames().map((name) => (name === currentMember.name ? "You" : name));
  const status = () => mailStatusStyle[item().status ?? "sent"];
  const threadKey = () => item().threadId ?? mailThreadKey(item().subject);
  const inlineMode = () => {
    const compose = mailCompose();
    if (!compose || compose.item?.id !== item().id) return null;
    return compose.mode === "reply" || compose.mode === "replyAll" ? compose.mode : null;
  };
  const toggleThreadStar = () => {
    const messages = thread();
    const starred = messages.some((row) => row.starred);
    const ids = messages.map((row) => row.id);
    mailRows.set(
      mailRows().map((row) => (ids.includes(row.id) ? { ...row, starred: !starred } : row)),
    );
    showToast(starred ? "Thread removed from Priority." : "Thread added to Priority.");
  };
  let scroller: ScrollRef | null = null;
  effect(() => {
    if (!inlineMode()) return;
    const timer = setTimeout(() => scroller?.scrollTo({ y: 10000, animated: true }), 80);
    return () => clearTimeout(timer);
  });
  return (
    <View class="min-w-0 flex-1 flex-col bg-background" testID="mail-page">
      <View class="shrink-0 border-b border-border px-6 pb-4 pt-5">
        <View class="gap-3">
          <View class="gap-3">
            <View class="min-w-0 gap-1">
              <View class="flex-row items-center gap-2">
                <Text class="min-w-0 flex-1 text-[20px] font-semibold text-foreground">
                  {item().subject}
                </Text>
                <Badge
                  variant={
                    item().status === "failed" || item().status === "bounced"
                      ? "warning"
                      : item().status === "delivered"
                        ? "success"
                        : "outline"
                  }
                >
                  <Text class="text-[11px] font-medium" style={{ color: token(status().tone) }}>
                    {status().label}
                  </Text>
                </Badge>
              </View>
              <View class="flex-row items-center gap-2">
                <View class="flex-row items-center">
                  <Each of={participantNames().slice(0, 3)}>
                    {(name: () => string, index: () => number) => (
                      <View style={{ marginLeft: index() === 0 ? 0 : -5 }}>
                        <Avatar name={name()} size={20} />
                      </View>
                    )}
                  </Each>
                </View>
                <Text
                  class="min-w-0 flex-1 text-[11px] font-medium text-foreground"
                  style={{ numberOfLines: 2 }}
                >
                  {thread().length} {thread().length === 1 ? "message" : "messages"} ·{" "}
                  {participants().join(", ")}
                </Text>
              </View>
              <Text class="text-[11px] text-muted-foreground">
                {item().date} · {item().account === "sales" ? "sales@" : "support@"} ·{" "}
                {item().folder}
              </Text>
            </View>
            <View class="flex-row flex-wrap items-center justify-start gap-1">
              <IconButton
                icon="eye"
                label={
                  isWatched("email", threadKey())
                    ? "Stop watching this thread"
                    : "Watch this thread"
                }
                size={32}
                testID="mail-detail-watch"
                active={isWatched("email", threadKey())}
                onPress={() => toggleWatch("email", threadKey(), item().account)}
              />
              <IconButton
                icon="star"
                label={
                  thread().some((row) => row.starred)
                    ? "Remove thread from Priority"
                    : "Add thread to Priority"
                }
                size={32}
                testID="mail-detail-star"
                onPress={toggleThreadStar}
              />
              <IconButton
                icon={thread().every((row) => row.folder === "Archive") ? "mail" : "archive"}
                label={
                  thread().every((row) => row.folder === "Archive")
                    ? "Move thread to Inbox"
                    : "Archive thread"
                }
                size={32}
                testID="mail-detail-archive"
                onPress={() => archiveThread(item())}
              />
              <IconButton
                icon="mail"
                label="Mark thread unread"
                size={32}
                onPress={() => markThreadUnread(item())}
              />
              <Button
                variant="outline"
                size="sm"
                testID="mail-reply"
                onPress={() => mailCompose.set({ mode: "reply", item: item() })}
              >
                <Icon name="messageCircle" size={11} tone="muted-foreground" />
                <Text class="text-[12px] font-medium">Reply</Text>
              </Button>
              <Button
                variant="outline"
                size="sm"
                testID="mail-reply-all"
                onPress={() => mailCompose.set({ mode: "replyAll", item: item() })}
              >
                <Text class="text-[12px] font-medium">Reply all</Text>
              </Button>
              <Button
                variant="outline"
                size="sm"
                testID="mail-forward"
                onPress={() => mailCompose.set({ mode: "forward", item: item() })}
              >
                <Text class="text-[12px] font-medium">Forward</Text>
              </Button>
              <ActionMenu
                testID="mail-work-menu"
                width={210}
                trigger={
                  <View
                    role="button"
                    accessibilityLabel="Email work actions"
                    testID="mail-work-actions"
                    class="h-8 w-8 items-center justify-center rounded-md"
                    hoverStyle={{ backgroundColor: token("accent") }}
                  >
                    <Icon name="ellipsis" size={14} tone="muted-foreground" />
                  </View>
                }
                groups={[workMenuActions(emailThreadLink(item()))]}
              />
            </View>
          </View>
        </View>
      </View>
      <Scroll
        class="min-h-0 flex-1"
        scrollbar={false}
        ref={(node) => {
          scroller = node;
        }}
      >
        <View class="gap-4 p-6">
          <View class="max-w-170 gap-3">
            <MailThreadMessages messages={thread()} latestId={item().id} />
            <WorkSection link={emailThreadLink(item())} title="Email work" />
            <View class="flex-row items-center gap-2 rounded-lg border border-border bg-panel p-3">
              <Icon name="shieldCheck" size={12} tone="success" />
              <Text class="min-w-0 flex-1 text-[11px] leading-4 text-muted-foreground">
                HTML is sanitized; remote images are blocked by default; SMTP/IMAP and MIME run only
                in cloud workers.
              </Text>
            </View>
            <If when={inlineMode() === "reply"}>
              <MailReplyComposer item={item()} mode="reply" />
            </If>
            <If when={inlineMode() === "replyAll"}>
              <MailReplyComposer item={item()} mode="replyAll" />
            </If>
          </View>
        </View>
      </Scroll>
    </View>
  );
}
