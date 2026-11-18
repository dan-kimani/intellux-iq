import { signal, Text, View } from "nsh";
import { AppDialog, DialogActions, ModalNotice } from "../../components/overlay";
import { ChoiceCards, TextField } from "../../components/forms";
import { Button, Icon, SectionTitle } from "../../components/ui";
import { showToast } from "../../state";
import type { ContactRow } from "./data";

const closeImport = () => importContactsOpen.set(false);
import { contactRows, importContactsOpen, newContactOpen } from "./state";
import { NewContactForm } from "./NewContactDialog";

function ImportForm() {
  const source = signal("CSV file");
  const path = signal("");
  const close = closeImport;
  return (
    <AppDialog
      open={() => true}
      onClose={close}
      title="Import contacts"
      description="Bring an existing customer list into the directory."
      width={560}
      testID="import-contacts-dialog"
      footer={
        <DialogActions>
          <Button variant="ghost" size="sm" onPress={close}>
            <Text class="text-[10px] font-medium">Cancel</Text>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onPress={() => {
              const row: ContactRow = {
                id: `c${Date.now()}`,
                name: "Grace Kimani",
                initials: "GK",
                tone: "amber",
                company: "Imported CSV",
                role: "Customer contact",
                email: "grace@imported.co.ke",
                phone: "+254 711 000 111",
                location: "Nairobi, Kenya",
                value: "KES 0",
                deals: 0,
                conversations: 0,
                since: "Nov 2025",
                score: 48,
                outcome: "Imported from CSV",
                tags: ["Imported"],
                owner: "David Mwangi",
                channel: "Email",
                lastTouch: "Just now",
                status: "new",
              };
              contactRows.set([row, ...contactRows()]);
              close();
              showToast("1 contact imported.");
            }}
            testID="confirm-import"
          >
            <Icon name="download" size={11} tone="primary-foreground" />
            <Text class="text-[10px] font-semibold text-primary-foreground">Import 1 contact</Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-4">
        <ChoiceCards
          value={source}
          options={[
            {
              value: "CSV file",
              title: "CSV file",
              detail: "Upload or reference a UTF-8 CSV with a header row.",
            },
            {
              value: "Google Sheets",
              title: "Google Sheets",
              detail: "Connect a sheet through the cloud workspace.",
            },
            {
              value: "Manual paste",
              title: "Manual paste",
              detail: "Paste a small list for a quick one-off import.",
            },
          ]}
          onChange={source.set}
        />
        <TextField
          label="File path or URL"
          value={path}
          onChange={path.set}
          placeholder="contacts-november.csv"
          hint="Prototype only"
        />
        <View class="gap-2 rounded-3xl border border-border bg-card shadow-md p-3">
          <SectionTitle>Column mapping</SectionTitle>
          <View class="grid grid-cols-3 gap-2">
            <View class="gap-0.5">
              <Text class="text-[8.5px] uppercase tracking-wide text-muted-foreground">CSV</Text>
              <Text class="text-[10px] font-medium text-foreground">full_name</Text>
            </View>
            <View class="gap-0.5">
              <Text class="text-[8.5px] uppercase tracking-wide text-muted-foreground">
                Maps to
              </Text>
              <Text class="text-[10px] font-medium text-foreground">Name</Text>
            </View>
            <View class="gap-0.5">
              <Text class="text-[8.5px] uppercase tracking-wide text-muted-foreground">
                Example
              </Text>
              <Text class="text-[10px] font-medium text-foreground">Grace Kimani</Text>
            </View>
          </View>
          <View class="grid grid-cols-3 gap-2">
            <Text class="text-[10px] text-muted-foreground">company · email · phone</Text>
            <Text class="text-[10px] text-muted-foreground">Company · Email · Phone</Text>
            <Text class="text-[10px] text-muted-foreground">Imported CSV · grace@…</Text>
          </View>
          <Text class="text-[9px] leading-3.5 text-muted-foreground">
            Duplicates are matched by email. Rows with errors stay in the import report.
          </Text>
        </View>
        <ModalNotice
          icon="shieldCheck"
          title="Validation happens in the cloud"
          detail="The prototype accepts the file locally; production parsing, dedupe, and tenant scoping run in the cloud."
        />
      </View>
    </AppDialog>
  );
}

export function ContactManageDialogs() {
  return (
    <>
      <If when={newContactOpen()}>
        <NewContactForm />
      </If>
      <If when={importContactsOpen()}>
        <ImportForm />
      </If>
    </>
  );
}
