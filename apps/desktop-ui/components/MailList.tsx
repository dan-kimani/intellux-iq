import { Text, token, View } from "nsh";
import { Icon } from "./ui";
import { MailBulkBar } from "./MailBulkBar";
import { MailRow } from "./MailRow";
import { emailFolder, mailAccount } from "../state";
import { mailSelectedIds, mailThreadGroups, selectAllMail } from "../screens/inbox/mailState";

function selectedAll(ids: string[]): boolean {
  const selected = mailSelectedIds();
  return ids.length > 0 && ids.every((id) => selected.includes(id));
}

function threads() {
  return mailThreadGroups(emailFolder(), mailAccount());
}

function visibleMailIds(): string[] {
  return threads().flatMap((thread) => thread.messages.map((item) => item.id));
}

export function MailList() {
  return (
    <View class="flex-1">
      <If when={mailSelectedIds().length > 0}>
        <MailBulkBar />
      </If>
      <View class="flex-row items-center gap-2 border-b border-border px-3 py-1.5">
        <View
          role="button"
          accessibilityLabel={
            selectedAll(visibleMailIds()) ? "Deselect all mail" : "Select all mail"
          }
          testID="mail-select-all"
          onPress={() => selectAllMail(visibleMailIds())}
          class="h-4 w-4 items-center justify-center rounded border"
          style={{
            borderColor: selectedAll(visibleMailIds()) ? token("primary") : token("border"),
            backgroundColor: selectedAll(visibleMailIds()) ? token("primary") : "transparent",
          }}
        >
          <If when={selectedAll(visibleMailIds())}>
            <Icon name="check" size={10} tone="primary-foreground" />
          </If>
        </View>
        <Text class="flex-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Select all
        </Text>
        <Text class="text-[10px] tabular-nums text-muted-foreground">
          {threads().length} threads
        </Text>
      </View>
      <Each of={threads()}>
        {(thread: () => ReturnType<typeof threads>[number]) => (
          <MailRow
            item={thread().latest}
            count={thread().messages.length}
            unread={thread().unread}
            threadIds={thread().messages.map((item) => item.id)}
          />
        )}
      </Each>
      <If when={threads().length === 0}>
        <View class="items-center gap-1 px-6 py-12">
          <Text class="text-[12px] font-medium tabular-nums text-foreground">
            {emailFolder() === "Sent"
              ? "No sent mail for this account"
              : `No ${emailFolder().toLowerCase()} mail for this account`}
          </Text>
          <Text class="text-center text-[11px] leading-4 text-muted-foreground">
            Try another folder, clear the filters, or refresh the cloud mailbox.
          </Text>
        </View>
      </If>
    </View>
  );
}
