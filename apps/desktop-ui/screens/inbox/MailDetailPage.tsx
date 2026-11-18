import { effect, Image, Scroll, signal, Text, token, View } from "nsh";
import type { ScrollRef } from "nsh";
import { TextView } from "nsh/base";
import { Badge, Button, Icon, IconButton } from "../../components/ui";
import { AttachmentList } from "../../files/AttachmentRow";
import { openFilePreview } from "../../files/state";
import { imageAttachment } from "../../files/types";
import { MailReplyComposer } from "./MailReplyComposer";
import { emailFolder, mailCompose, mailDetail, showToast } from "../../state";
import { mailRows, type MailItem, type MailStatus } from "./mail";

const statusStyle: Record<
  MailStatus,
  { label: string; tone: "muted-foreground" | "success" | "warning" | "alert" | "info" }
> = {
  queued: { label: "Queued", tone: "muted-foreground" },
  sending: { label: "Sending", tone: "info" },
  sent: { label: "Sent", tone: "muted-foreground" },
  delivered: { label: "Delivered", tone: "success" },
  failed: { label: "Failed", tone: "alert" },
  bounced: { label: "Bounced", tone: "warning" },
  draft: { label: "Draft", tone: "muted-foreground" },
};

function archive(item: MailItem) {
  mailRows.set(
    mailRows().map((row) => (row.id === item.id ? { ...row, folder: "Archive" as const } : row)),
  );
  mailDetail.set(null);
  mailCompose.set(null);
  showToast("Email archived.");
}

function markUnread(item: MailItem) {
  mailRows.set(mailRows().map((row) => (row.id === item.id ? { ...row, read: false } : row)));
  mailDetail.set(null);
  mailCompose.set(null);
  showToast("Email marked unread.");
}

export function MailDetailPage(props: { item: MailItem }) {
  const item = () => mailRows().find((row) => row.id === props.item.id) ?? props.item;
  const quotedOpen = signal(false);
  const status = () => statusStyle[item().status ?? "sent"];
  const inlineMode = () => {
    const compose = mailCompose();
    if (!compose || compose.item?.id !== item().id) return null;
    return compose.mode === "reply" || compose.mode === "replyAll" ? compose.mode : null;
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
        <View class="flex-row items-start gap-4">
          <View class="min-w-0 flex-1 gap-1">
            <View class="flex-row items-center gap-2">
              <Text class="text-[20px] font-semibold tracking-tight text-foreground">
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
                <Text class="text-[8.5px] font-medium" style={{ color: token(status().tone) }}>
                  {status().label}
                </Text>
              </Badge>
            </View>
            <Text class="text-[11px] text-muted-foreground">
              {item().from} → {item().to}
              {item().cc ? ` · CC ${item().cc}` : ""}
            </Text>
            <Text class="text-[9.5px] text-muted-foreground">
              {item().date} · {item().account === "sales" ? "sales@" : "support@"} · {emailFolder()}
              {item().folder === "Sent"
                ? item().status === "queued" || item().status === "sending"
                  ? " · Sent folder sync pending"
                  : " · Sent folder synced"
                : ""}
            </Text>
          </View>
          <View class="flex-row items-center gap-1">
            <IconButton
              icon="inbox"
              label="Archive email"
              size={32}
              onPress={() => archive(item())}
            />
            <IconButton
              icon="mail"
              label="Mark email unread"
              size={32}
              onPress={() => markUnread(item())}
            />
            <Button
              variant="outline"
              size="sm"
              testID="mail-reply"
              onPress={() => mailCompose.set({ mode: "reply", item: item() })}
            >
              <Icon name="messageCircle" size={11} tone="muted-foreground" />
              <Text class="text-[10px] font-medium">Reply</Text>
            </Button>
            <Button
              variant="outline"
              size="sm"
              testID="mail-reply-all"
              onPress={() => mailCompose.set({ mode: "replyAll", item: item() })}
            >
              <Text class="text-[10px] font-medium">Reply all</Text>
            </Button>
            <Button
              variant="outline"
              size="sm"
              testID="mail-forward"
              onPress={() => mailCompose.set({ mode: "forward", item: item() })}
            >
              <Text class="text-[10px] font-medium">Forward</Text>
            </Button>
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
            <If
              when={item().bodyHtml}
              else={
                <Each of={item().body}>
                  {(line: () => string) => (
                    <Text class="text-[12px] leading-5.5 text-foreground">{line()}</Text>
                  )}
                </Each>
              }
            >
              <TextView
                html={item().bodyHtml!}
                selectable
                class="text-[12px] leading-5.5 text-foreground"
              />
            </If>
            <If when={item().inlineImage}>
              <View class="gap-1 overflow-hidden rounded-3xl border border-border bg-card shadow-md">
                <View
                  role="button"
                  accessibilityLabel="Preview inline image"
                  onPress={() =>
                    openFilePreview(
                      item().attachments.find((file) => file.kind === "image") ??
                        imageAttachment("inline-image.jpg", "1.8 MB", item().inlineImage!.src),
                    )
                  }
                >
                  <Image
                    src={item().inlineImage!.src}
                    style={{ width: "100%", height: 210, objectFit: "cover" }}
                  />
                </View>
                <View class="flex-row items-center gap-2 px-3 py-2">
                  <Text class="min-w-0 flex-1 text-[9px] text-muted-foreground">
                    {item().inlineImage!.caption} · inline image sanitized by the cloud
                  </Text>
                  <Icon name="expand" size={10} tone="muted-foreground" />
                </View>
              </View>
            </If>
            <If when={item().quoted}>
              <View class="gap-1 rounded-lg border border-border bg-panel p-3">
                <View
                  role="button"
                  accessibilityLabel="Toggle quoted message"
                  onPress={() => quotedOpen.set(!quotedOpen())}
                  class="flex-row items-center gap-1"
                >
                  <Icon
                    name={quotedOpen() ? "chevronDown" : "chevronRight"}
                    size={10}
                    tone="muted-foreground"
                  />
                  <Text class="text-[9px] font-medium text-muted-foreground">
                    {quotedOpen() ? "Hide quoted message" : "Show quoted message"}
                  </Text>
                </View>
                <If when={quotedOpen()}>
                  <Each of={item().quoted ?? []}>
                    {(line: () => string) => (
                      <Text class="text-[9.5px] leading-4 text-muted-foreground">{line()}</Text>
                    )}
                  </Each>
                </If>
              </View>
            </If>
            <If when={item().attachments.length > 0}>
              <AttachmentList files={item().attachments} />
            </If>
            <If when={item().diagnostic}>
              <View class="flex-row items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3">
                <Icon name="zap" size={12} tone="warning" />
                <View class="gap-0.5">
                  <Text class="text-[9.5px] font-medium text-foreground">Provider diagnostic</Text>
                  <Text class="text-[9px] leading-3.5 text-muted-foreground">
                    {item().diagnostic}
                  </Text>
                </View>
              </View>
            </If>
            <View class="flex-row items-center gap-2 rounded-lg border border-border bg-panel p-3">
              <Icon name="shieldCheck" size={12} tone="success" />
              <Text class="text-[9px] text-muted-foreground">
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
