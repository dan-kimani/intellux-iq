import { currencySymbol } from "../../lib/money";
import { signal, Text, View } from "nsh";
import { AppDialog, DialogActions, FormGrid, ModalNotice } from "../../components/overlay";
import { SelectField, TextField } from "../../components/forms";
import { Button, Icon } from "../../components/ui";
import { showToast } from "../../state";
import type { ContactRow } from "./data";
import { contactRows, newContactOpen } from "./state";

const closeNewContact = () => newContactOpen.set(false);

export function NewContactForm() {
  const name = signal("");
  const company = signal("");
  const email = signal("");
  const phone = signal("");
  const owner = signal("Alex Morgan");
  const channel = signal("WhatsApp");
  const close = closeNewContact;
  const save = () => {
    if (!name().trim() || !company().trim()) {
      showToast("Name and company are required.");
      return;
    }
    const initials = name()
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    const row: ContactRow = {
      id: `c${Date.now()}`,
      name: name().trim(),
      initials,
      tone: "blue",
      company: company().trim(),
      role: "New contact",
      email: email().trim() || "not-set@example.com",
      phone: phone().trim() || "—",
      location: "New York, US",
      value: `${currencySymbol()}0`,
      deals: 0,
      conversations: 0,
      since: "Nov 2025",
      score: 35,
      outcome: "New contact added",
      tags: ["New lead"],
      owner: owner(),
      channel: channel() as ContactRow["channel"],
      lastTouch: "Just now",
      status: "new",
    };
    contactRows.set([row, ...contactRows()]);
    close();
    showToast(`${row.name} added to contacts.`);
  };
  return (
    <AppDialog
      open={() => true}
      onClose={close}
      title="New contact"
      description="Add a person to the org-wide directory. This is local prototype data."
      width={520}
      testID="new-contact-dialog"
      footer={
        <DialogActions>
          <Button variant="ghost" size="sm" onPress={close}>
            <Text class="text-[12px] font-medium">Cancel</Text>
          </Button>
          <Button variant="primary" size="sm" onPress={save} testID="create-contact">
            <Icon name="plus" size={11} tone="primary-foreground" />
            <Text class="text-[12px] font-semibold text-primary-foreground">Create contact</Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-4">
        <FormGrid>
          <TextField
            label="Full name"
            value={name}
            onChange={name.set}
            placeholder="Maya Lin"
            testID="contact-name"
          />
          <TextField
            label="Company"
            value={company}
            onChange={company.set}
            placeholder="Atlas Enterprises"
            testID="contact-company"
          />
          <TextField
            label="Email"
            value={email}
            onChange={email.set}
            placeholder="maya@abc.com"
            testID="contact-email"
          />
          <TextField
            label="Phone"
            value={phone}
            onChange={phone.set}
            placeholder="+1 415 555 0132"
          />
        </FormGrid>
        <FormGrid>
          <SelectField
            label="Owner"
            value={owner}
            options={["Alex Morgan", "Priya Shah", "Aiko Tanaka"]}
            onChange={owner.set}
          />
          <SelectField
            label="Preferred channel"
            value={channel}
            options={["WhatsApp", "Email"]}
            onChange={channel.set}
          />
        </FormGrid>
        <ModalNotice
          title="One directory, many contexts"
          detail="A contact can have many conversations and opportunities. Stage and value belong to the opportunity, never the contact."
        />
      </View>
    </AppDialog>
  );
}
