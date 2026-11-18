import { Text, token, View } from "nsh";
import { AppDialog, DialogActions, ModalNotice } from "./overlay";
import { Badge, Button, Icon } from "./ui";
import { mailAccountOpen } from "../state";
import { mailAccounts } from "../screens/inbox/mail";

const closeAccount = () => mailAccountOpen.set(false);

function MailAccountDialog() {
  return (
    <AppDialog
      open={() => true}
      onClose={closeAccount}
      title="Email accounts"
      description="Cloud-managed mailboxes. The desktop never stores provider credentials."
      width={560}
      testID="mail-account-dialog"
      footer={
        <DialogActions>
          <Button variant="outline" size="sm" onPress={closeAccount}>
            <Text class="text-[10px] font-medium">Close</Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-3">
        <Each of={mailAccounts}>
          {(account: () => (typeof mailAccounts)[number]) => (
            <View class="gap-2 rounded-3xl border border-border bg-card shadow-md p-3">
              <View class="flex-row items-center gap-2.5">
                <View
                  class="h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: token("accent") }}
                >
                  <Icon name="mail" size={14} tone={account().tone} />
                </View>
                <View class="min-w-0 flex-1 gap-0.5">
                  <Text class="text-[10.5px] font-medium text-foreground">{account().email}</Text>
                  <Text class="text-[9px] text-muted-foreground">
                    {account().label} · {account().sent} sent this month
                  </Text>
                </View>
                <Badge variant="success">
                  <Text class="text-[8px] font-medium text-success">{account().status}</Text>
                </Badge>
              </View>
              <View class="flex-row items-center gap-3">
                <Text class="text-[8.5px] text-muted-foreground">SMTP egress</Text>
                <Text class="text-[8.5px] font-medium text-success">Healthy</Text>
                <Text class="text-[8.5px] text-muted-foreground">Inbound</Text>
                <Text class="text-[8.5px] font-medium text-success">Streaming</Text>
                <View class="flex-1" />
                <Text class="text-[8.5px] text-muted-foreground">{account().quota}</Text>
              </View>
            </View>
          )}
        </Each>
        <View class="grid grid-cols-2 gap-2">
          <Stat label="Folders" value="Inbox · Sent · Drafts" />
          <Stat label="Last sync" value="2s ago" />
          <Stat label="Queue" value="0 pending" />
          <Stat label="Policy" value="Cloud egress only" />
        </View>
        <ModalNotice
          icon="shieldCheck"
          title="No provider protocols on the desktop"
          detail="The desktop composes drafts and receives synced history; all SMTP/IMAP, OAuth refresh, MIME, and Sent-folder APPEND stay in cloud workers."
        />
      </View>
    </AppDialog>
  );
}

function Stat(props: { label: string; value: string }) {
  return (
    <View class="gap-0.5 rounded-lg border border-border bg-panel p-2.5">
      <Text class="text-[8px] uppercase tracking-wide text-muted-foreground">{props.label}</Text>
      <Text class="text-[9.5px] font-medium text-foreground">{props.value}</Text>
    </View>
  );
}

export function MailDialog() {
  return (
    <If when={mailAccountOpen()}>
      <MailAccountDialog />
    </If>
  );
}
