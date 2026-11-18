import { signal, Text, View } from "nsh";
import { AppDialog, DialogActions, ModalNotice } from "./overlay";
import { SelectField, TextField } from "./forms";
import { Button, Icon } from "./ui";
import {
  activeNav,
  activeNavChild,
  createConversation,
  newMessageOpen,
  selectConversation,
  showToast,
} from "../state";
import { contacts } from "../screens/contacts/data";

const closeNewMessage = () => newMessageOpen.set(false);

function NewMessageForm() {
  const recipient = signal("Sarah Wanjiku");
  const channel = signal("WhatsApp");
  const message = signal("");
  return (
    <AppDialog
      open={() => true}
      onClose={closeNewMessage}
      title="New message"
      description="Start a conversation with a contact."
      width={520}
      testID="new-message-dialog"
      footer={
        <DialogActions>
          <Button variant="ghost" size="sm" onPress={closeNewMessage}>
            <Text class="text-[10px] font-medium">Cancel</Text>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onPress={() => {
              const contact = contacts.find((row) => row.name === recipient());
              if (!contact) {
                showToast("Choose a contact to start the conversation.");
                return;
              }
              const conversation = createConversation({
                contactId: contact.id,
                name: contact.name,
                company: contact.company,
                initials: contact.initials,
                tone: contact.tone,
                channel: channel() === "WhatsApp" ? "whatsapp" : "email",
                phone: contact.phone,
                email: contact.email,
                location: contact.location,
                text: message().trim() || "Starting a new conversation.",
              });
              selectConversation(conversation.id);
              activeNavChild.set("inbox");
              activeNav.set("Inbox");
              closeNewMessage();
              showToast(`Conversation opened with ${contact.name}.`);
            }}
            testID="send-new-message"
          >
            <Icon name="send" size={11} tone="primary-foreground" />
            <Text class="text-[10px] font-semibold text-primary-foreground">
              Start conversation
            </Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-4">
        <SelectField
          label="Recipient"
          value={recipient}
          options={contacts.map((contact) => contact.name)}
          onChange={recipient.set}
        />
        <SelectField
          label="Channel"
          value={channel}
          options={["WhatsApp", "Email"]}
          onChange={channel.set}
        />
        <TextField
          label="First message"
          value={message}
          onChange={message.set}
          placeholder="Hi Sarah — following up on the quote."
          testID="new-message-body"
        />
        <ModalNotice
          icon="shieldCheck"
          title="Cloud egress owns delivery"
          detail="The desktop composes the message; the cloud checks assignment and provider policy before sending."
        />
      </View>
    </AppDialog>
  );
}

export function InboxDialogs() {
  return (
    <>
      <If when={newMessageOpen()}>
        <NewMessageForm />
      </If>
    </>
  );
}
