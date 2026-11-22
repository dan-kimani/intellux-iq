import { Text, View } from "nsh";
import { mailRows } from "../screens/inbox/mail";
import { IconButton } from "./ui";
import {
  clearMailSelection,
  deleteMail,
  mailSelectedIds,
  moveMail,
  setMailRead,
} from "../screens/inbox/mailState";

function ids(): string[] {
  return mailSelectedIds();
}

function allArchived(): boolean {
  const selected = mailRows().filter((row) => ids().includes(row.id));
  return selected.length > 0 && selected.every((row) => row.folder === "Archive");
}

export function MailBulkBar() {
  return (
    <View
      testID="mail-bulk-bar"
      class="flex-row items-center gap-1 border-b border-border bg-accent px-3 py-1.5"
    >
      <Text class="flex-1 text-[11px] font-semibold text-foreground">{ids().length} selected</Text>
      <IconButton
        icon="checkCheck"
        label="Mark selected read"
        size={24}
        testID="mail-bulk-read"
        onPress={() => setMailRead(ids(), true)}
      />
      <IconButton
        icon="mail"
        label="Mark selected unread"
        size={24}
        testID="mail-bulk-unread"
        onPress={() => setMailRead(ids(), false)}
      />
      <IconButton
        icon={allArchived() ? "mail" : "archive"}
        label={allArchived() ? "Move selected to Inbox" : "Archive selected"}
        size={24}
        testID="mail-bulk-archive"
        onPress={() => moveMail(ids(), allArchived() ? "Inbox" : "Archive")}
      />
      <IconButton
        icon="shieldCheck"
        label="Move selected to Junk"
        size={24}
        testID="mail-bulk-junk"
        onPress={() => moveMail(ids(), "Junk")}
      />
      <IconButton
        icon="trash"
        label="Delete selected"
        size={24}
        testID="mail-bulk-delete"
        onPress={() => deleteMail(ids())}
      />
      <IconButton
        icon="close"
        label="Clear selection"
        size={24}
        testID="mail-bulk-clear"
        onPress={clearMailSelection}
      />
    </View>
  );
}
