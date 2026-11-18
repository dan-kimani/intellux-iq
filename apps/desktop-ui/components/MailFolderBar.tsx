import { signal, Text, token, View } from "nsh";
import { Popover } from "nsh/base";
import { Icon } from "./ui";
import { emailFolder, mailAccount, mailAccountOpen, mailCompose, mailDetail } from "../state";
import { mailAccounts, mailFolderCount, type MailFolder } from "../screens/inbox/mail";

const folders: MailFolder[] = ["Inbox", "Sent", "Drafts", "Archive", "Junk"];

export function MailFolderBar() {
  const accountOpen = signal(false);
  return (
    <View class="gap-2">
      <View class="flex-row flex-wrap items-center gap-1">
        <Each of={folders}>
          {(folder: () => MailFolder) => (
            <View
              role="button"
              accessibilityLabel={`Mail folder ${folder()}`}
              onPress={() => {
                emailFolder.set(folder());
                mailDetail.set(null);
                mailCompose.set(null);
              }}
              class="h-6 items-center justify-center rounded px-2"
              style={{
                backgroundColor: emailFolder() === folder() ? token("accent") : "transparent",
              }}
              hoverStyle={{ backgroundColor: token("accent") }}
              focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
            >
              <Text
                class="text-[9px] font-medium"
                style={{
                  color:
                    emailFolder() === folder()
                      ? token("accent-foreground")
                      : token("muted-foreground"),
                }}
              >
                {folder()}{" "}
                <Text class="text-[8px] text-muted-foreground">
                  {mailFolderCount(folder(), mailAccount())}
                </Text>
              </Text>
            </View>
          )}
        </Each>
      </View>
      <View class="flex-row items-center justify-end">
        <Popover
          open={accountOpen()}
          onOpenChange={({ open }) => accountOpen.set(open)}
          placement="bottom"
          align="end"
          offset={6}
          popupClass="rounded-lg border border-border bg-popover p-2 shadow-2xl"
          popupStyle={{ width: 270 }}
          trigger={
            <View
              role="button"
              accessibilityLabel="Email account"
              testID="mail-account-trigger"
              class="h-6 flex-row items-center gap-1 rounded-md border border-border bg-card px-2"
              hoverStyle={{ backgroundColor: token("accent") }}
            >
              <View class="h-1.5 w-1.5 rounded-full bg-success" />
              <Text class="text-[8px] font-medium text-muted-foreground">
                {mailAccounts.find((account) => account.id === mailAccount())?.label}
              </Text>
              <Icon name="chevronDown" size={9} tone="muted-foreground" />
            </View>
          }
        >
          <View class="gap-1" testID="mail-account-menu">
            <Text class="px-2 pb-1 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
              Accounts
            </Text>
            <Each of={mailAccounts}>
              {(account: () => (typeof mailAccounts)[number]) => (
                <View
                  role="button"
                  accessibilityLabel={`Use ${account().email}`}
                  testID={`mail-account-${account().id}`}
                  onPress={() => {
                    mailAccount.set(account().id);
                    accountOpen.set(false);
                    mailDetail.set(null);
                    mailCompose.set(null);
                  }}
                  class="flex-row items-center gap-2 rounded-md px-2 py-1.5"
                  hoverStyle={{ backgroundColor: token("accent") }}
                >
                  <Icon name="mail" size={11} tone={account().tone} />
                  <View class="min-w-0 flex-1 gap-0.5">
                    <Text class="text-[10px] font-medium text-foreground">{account().email}</Text>
                    <Text class="text-[8.5px] text-muted-foreground">
                      {account().label} · {account().status}
                    </Text>
                  </View>
                  <If when={mailAccount() === account().id}>
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
              <Text class="flex-1 text-[10px] font-medium text-foreground">Account health</Text>
              <Icon name="chevronRight" size={10} tone="muted-foreground" />
            </View>
          </View>
        </Popover>
      </View>
    </View>
  );
}
