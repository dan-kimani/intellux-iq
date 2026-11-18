import { Text, token, View } from "nsh";
import { Icon } from "../../components/ui";
import { emailFolder, mailAccount, mailCompose, mailDetail } from "../../state";
import { mailAccounts, mailCountLabel, mailFolderCount } from "./mail";
import { MailComposer } from "./MailComposer";
import { MailDetailPage } from "./MailDetailPage";

function FolderSummary() {
  const account = mailAccounts.find((row) => row.id === mailAccount());
  return (
    <View class="min-w-0 flex-1 items-center justify-center gap-4 border-r border-border bg-background p-8">
      <View
        class="h-14 w-14 items-center justify-center rounded-2xl"
        style={{ backgroundColor: token("accent") }}
      >
        <Icon name="mail" size={24} tone="chart-2" />
      </View>
      <View class="items-center gap-1">
        <Text class="text-[18px] font-semibold tracking-tight text-foreground">
          {emailFolder()} mail
        </Text>
        <Text class="text-[10px] text-muted-foreground">
          {mailCountLabel(mailFolderCount(emailFolder(), mailAccount()))} · {account?.email}
        </Text>
      </View>
      <View class="w-80 gap-2 rounded-3xl border border-border bg-card shadow-md p-3">
        <View class="flex-row items-center justify-between">
          <Text class="text-[9.5px] text-muted-foreground">Account</Text>
          <Text class="text-[9.5px] font-medium text-foreground">{account?.email}</Text>
        </View>
        <View class="flex-row items-center justify-between">
          <Text class="text-[9.5px] text-muted-foreground">Sync</Text>
          <View class="flex-row items-center gap-1">
            <View class="h-1.5 w-1.5 rounded-full bg-success" />
            <Text class="text-[9px] font-medium text-success">{account?.status}</Text>
          </View>
        </View>
        <View class="flex-row items-center justify-between">
          <Text class="text-[9.5px] text-muted-foreground">Policy</Text>
          <Text class="text-[9px] text-muted-foreground">Cloud SMTP/IMAP only</Text>
        </View>
      </View>
      <Text class="max-w-80 text-center text-[9px] leading-3.5 text-muted-foreground">
        Choose a message from the folder list to open it here. Sent, draft, archive, and junk state
        is synced from the cloud; no provider protocol runs on this desktop.
      </Text>
    </View>
  );
}

function pageCompose() {
  const compose = mailCompose();
  return compose && (compose.mode === "new" || compose.mode === "forward") ? compose : null;
}

export function MailWorkspace() {
  return (
    <>
      <If when={pageCompose()}>
        <MailComposer mode={pageCompose()?.mode ?? "new"} item={pageCompose()?.item} />
      </If>
      <If when={!pageCompose() && mailDetail()}>
        <MailDetailPage item={mailDetail()!} />
      </If>
      <If when={!pageCompose() && !mailDetail()}>
        <FolderSummary />
      </If>
    </>
  );
}
