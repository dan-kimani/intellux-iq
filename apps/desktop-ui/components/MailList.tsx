import { Text, token, View } from "nsh";
import { Icon } from "./ui";
import { emailFolder, mailAccount, mailCompose, mailDetail, searchQuery } from "../state";
import { mailRows, type MailItem, type MailStatus } from "../screens/inbox/mail";

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

function visibleMail(): MailItem[] {
  const query = searchQuery().trim().toLowerCase();
  return mailRows().filter((item) => {
    if (item.folder !== emailFolder()) return false;
    if (item.account !== mailAccount()) return false;
    if (!query) return true;
    return `${item.subject} ${item.from} ${item.to} ${item.preview} ${item.body.join(" ")}`
      .toLowerCase()
      .includes(query);
  });
}

export function MailList() {
  return (
    <View class="flex-1">
      <View class="flex-row items-center gap-3 border-b border-border px-4 py-2 text-[8.5px] font-medium uppercase tracking-wide text-muted-foreground">
        <Text class="flex-1">{emailFolder()}</Text>
        <If when={emailFolder() !== "Inbox"}>
          <Text class="w-24 text-right">Status</Text>
        </If>
        <Text class="w-16 text-right">Date</Text>
      </View>
      <Each of={visibleMail()}>
        {(item: () => MailItem) => (
          <View
            role="button"
            accessibilityLabel={`Open email ${item().subject}`}
            testID={`mail-${item().id}`}
            onPress={() => {
              mailRows.set(
                mailRows().map((row) => (row.id === item().id ? { ...row, read: true } : row)),
              );
              mailDetail.set({ ...item(), read: true });
              mailCompose.set(null);
            }}
            class="flex-row items-start gap-3 border-b border-border px-4 py-3 transition-colors"
            hoverStyle={{ backgroundColor: token("accent") }}
          >
            <View class="mt-0.5 h-7 w-7 items-center justify-center rounded-md bg-muted">
              <Icon
                name={item().attachments.length > 0 ? "paperclip" : "mail"}
                size={12}
                tone="muted-foreground"
              />
            </View>
            <View class="min-w-0 flex-1 gap-0.5">
              <View class="flex-row items-center gap-2">
                <If when={!item().read}>
                  <View
                    class="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: token("unread") }}
                  />
                </If>
                <Text
                  class="min-w-0 flex-1 text-[10.5px] font-medium text-foreground"
                  style={{ numberOfLines: 1 }}
                >
                  {item().subject}
                </Text>
                <Text class="text-[8px] text-muted-foreground">{item().date}</Text>
              </View>
              <Text class="text-[8.5px] text-muted-foreground" style={{ numberOfLines: 1 }}>
                {item().folder === "Sent" || item().folder === "Drafts"
                  ? `To: ${item().to}`
                  : `From: ${item().from}`}
              </Text>
              <Text
                class="text-[9px] leading-3.5 text-muted-foreground"
                style={{ numberOfLines: 1 }}
              >
                {item().preview}
              </Text>
            </View>
            <If when={item().status && emailFolder() !== "Inbox"}>
              <View class="w-24 items-end">
                <Text
                  class="text-[8px] font-medium"
                  style={{ color: token(statusStyle[item().status!].tone) }}
                >
                  {statusStyle[item().status!].label}
                </Text>
              </View>
            </If>
          </View>
        )}
      </Each>
      <If when={visibleMail().length === 0}>
        <View class="items-center gap-1 py-12">
          <Text class="text-[11px] font-medium text-foreground">
            No {emailFolder().toLowerCase()} mail for this account
          </Text>
          <Text class="text-[9px] text-muted-foreground">
            The cloud syncs this folder when the device reconnects.
          </Text>
        </View>
      </If>
    </View>
  );
}
