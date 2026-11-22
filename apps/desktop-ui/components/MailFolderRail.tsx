import { signal, Text, token, View } from "nsh";
import { Popover } from "nsh/base";
import { Icon, IconButton, type IconName } from "./ui";
import {
  emailFolder,
  mailAccount,
  mailAccountOpen,
  mailCompose,
  mailDetail,
  online,
} from "../state";
import { mailAccounts, type MailFolder } from "../screens/inbox/mail";
import { mailFolderCount, mailUnreadCount } from "../screens/inbox/mailMetrics";
import {
  clearMailSelection,
  mailLastSynced,
  mailSyncing,
  openMailOutbox,
  refreshMail,
} from "../screens/inbox/mailState";

const folders: { name: MailFolder; icon: IconName }[] = [
  { name: "Priority", icon: "star" },
  { name: "Inbox", icon: "inbox" },
  { name: "Sent", icon: "send" },
  { name: "Drafts", icon: "pencil" },
  { name: "Archive", icon: "archive" },
  { name: "Junk", icon: "shieldCheck" },
];

function activeAccount() {
  return mailAccounts.find((row) => row.id === mailAccount());
}

export function MailFolderRail() {
  const accountOpen = signal(false);
  return (
    <View
      testID="mail-folder-rail"
      class="w-40 shrink-0 flex-col border-r border-border bg-sidebar"
    >
      <View class="gap-2.5 border-b border-border px-2.5 py-3">
        <Text class="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Mail
        </Text>
        <Popover
          open={accountOpen()}
          onOpenChange={({ open }) => accountOpen.set(open)}
          placement="bottom"
          align="start"
          offset={6}
          popupClass="rounded-lg border border-border bg-popover p-2 shadow-2xl"
          popupStyle={{ width: 270 }}
          trigger={
            <View
              role="button"
              accessibilityLabel="Email account"
              testID="mail-account-trigger"
              class="h-8 w-full flex-row items-center gap-1.5 rounded-md border border-border bg-card px-2"
              hoverStyle={{ backgroundColor: token("accent") }}
            >
              <View class="h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
              <Text class="min-w-0 flex-1 truncate text-[11px] font-medium text-foreground">
                {activeAccount()?.label}
              </Text>
              <If when={mailUnreadCount(mailAccount()) > 0}>
                <View class="h-4 min-w-4 items-center justify-center rounded-full bg-muted px-1">
                  <Text class="text-[10px] font-semibold tabular-nums text-muted-foreground">
                    {mailUnreadCount(mailAccount())}
                  </Text>
                </View>
              </If>
              <Icon name="chevronDown" size={9} tone="muted-foreground" />
            </View>
          }
        >
          <View class="gap-1" testID="mail-account-menu">
            <Text class="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Accounts
            </Text>
            <Each of={mailAccounts}>
              {(row: () => (typeof mailAccounts)[number]) => (
                <View
                  role="button"
                  accessibilityLabel={`Use ${row().email}`}
                  testID={`mail-account-${row().id}`}
                  onPress={() => {
                    mailAccount.set(row().id);
                    accountOpen.set(false);
                    mailDetail.set(null);
                    mailCompose.set(null);
                    clearMailSelection();
                  }}
                  class="flex-row items-center gap-2 rounded-md px-2 py-1.5"
                  hoverStyle={{ backgroundColor: token("accent") }}
                >
                  <Icon name="mail" size={11} tone={row().tone} />
                  <View class="min-w-0 flex-1 gap-0.5">
                    <Text class="text-[12px] font-medium text-foreground">{row().email}</Text>
                    <Text class="text-[11px] text-muted-foreground">
                      {row().label} · {row().status}
                    </Text>
                  </View>
                  <If when={mailAccount() === row().id}>
                    <Icon name="check" size={11} tone="success" />
                  </If>
                </View>
              )}
            </Each>
            <View class="my-1 h-px bg-border" />
            <View
              role="button"
              accessibilityLabel="Open email account health"
              onPress={() => {
                accountOpen.set(false);
                mailAccountOpen.set(true);
              }}
              class="flex-row items-center gap-2 rounded-md px-2 py-1.5"
              hoverStyle={{ backgroundColor: token("accent") }}
            >
              <Icon name="shieldCheck" size={11} tone="muted-foreground" />
              <Text class="flex-1 text-[12px] font-medium text-foreground">Account health</Text>
              <Icon name="chevronRight" size={10} tone="muted-foreground" />
            </View>
          </View>
        </Popover>
        <Text class="truncate px-1 text-[10px] text-muted-foreground">
          {activeAccount()?.email}
        </Text>
      </View>

      <View class="gap-0.5 px-2 py-2">
        <Each of={folders}>
          {(folder: () => (typeof folders)[number]) => (
            <View
              role="button"
              accessibilityLabel={`Mail folder ${folder().name}`}
              onPress={() => {
                emailFolder.set(folder().name);
                mailDetail.set(null);
                mailCompose.set(null);
                clearMailSelection();
              }}
              class="relative h-8 flex-row items-center gap-2 rounded-md px-2"
              style={{
                backgroundColor: emailFolder() === folder().name ? token("accent") : "transparent",
              }}
              hoverStyle={{ backgroundColor: token("accent") }}
              focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
            >
              <If when={emailFolder() === folder().name}>
                <View class="absolute bottom-1.5 left-0 top-1.5 w-0.5 rounded-full bg-primary" />
              </If>
              <Icon
                name={folder().icon}
                size={13}
                tone={emailFolder() === folder().name ? "foreground" : "muted-foreground"}
              />
              <Text
                class="min-w-0 flex-1 text-[12px] font-medium"
                style={{
                  color:
                    emailFolder() === folder().name
                      ? token("foreground")
                      : token("muted-foreground"),
                }}
              >
                {folder().name}
              </Text>
              <Text class="text-[11px] tabular-nums text-muted-foreground">
                {mailFolderCount(folder().name, mailAccount())}
              </Text>
            </View>
          )}
        </Each>
      </View>

      <View class="flex-1" />
      <View class="gap-2 border-t border-border px-2.5 py-2.5">
        <View class="flex-row items-center justify-between gap-1">
          <View class="min-w-0 flex-1 gap-0.5">
            <Text
              class="text-[11px] font-medium"
              style={{ color: token(online() ? "success" : "warning") }}
            >
              {mailSyncing() ? "Syncing…" : online() ? "Cloud synced" : "Offline"}
            </Text>
            <Text class="truncate text-[10px] text-muted-foreground">{mailLastSynced()}</Text>
          </View>
          <IconButton
            icon="refresh"
            label="Refresh mail"
            size={26}
            testID="mail-refresh"
            onPress={refreshMail}
          />
        </View>
        <View
          role="button"
          accessibilityLabel="Open outbox and sync"
          testID="mail-outbox"
          onPress={openMailOutbox}
          class="h-7 flex-row items-center gap-1.5 rounded-md border border-border px-2"
          hoverStyle={{ backgroundColor: token("accent") }}
        >
          <Icon name="send" size={11} tone="muted-foreground" />
          <Text class="flex-1 text-[11px] font-medium text-foreground">Outbox & sync</Text>
          <Icon name="chevronRight" size={9} tone="muted-foreground" />
        </View>
      </View>
    </View>
  );
}
