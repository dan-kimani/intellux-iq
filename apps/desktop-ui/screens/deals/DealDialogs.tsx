import { signal, Text, View } from "nsh";
import { AppDialog, DialogActions, FormGrid, ModalNotice } from "../../components/overlay";
import { SelectField, TextField } from "../../components/forms";
import { Button, Icon } from "../../components/ui";
import { showToast } from "../../state";
import { dealStages, type Deal, type DealStage } from "./data";
import { dealRows, newDealOpen } from "./state";

const closeNew = () => newDealOpen.set(false);

const stageLabels = dealStages.map((stage) => stage.label);
const ownerOptions = [
  "All owners",
  "David Mwangi",
  "Yasir Noori",
  "Amina Kimani",
  "Moses Otieno",
  "James Njoroge",
];

function labelForStage(stage: DealStage): string {
  return dealStages.find((item) => item.id === stage)?.label ?? "Qualified";
}

function NewDealForm() {
  const name = signal("");
  const company = signal("");
  const value = signal("");
  const product = signal("");
  const owner = signal("David Mwangi");
  const stage = signal<DealStage>("qualified");
  const close = closeNew;
  const save = () => {
    if (!name().trim() || !company().trim()) {
      showToast("Opportunity name and company are required.");
      return;
    }
    const row: Deal = {
      id: `OPP-2025-${Math.floor(1000 + Math.random() * 8999)}`,
      name: name().trim(),
      company: company().trim(),
      value: value().trim() || "KES 0",
      owner: owner(),
      age: "Just now",
      stage: stage(),
      product: product().trim() || "Catalog selection",
      contact: "New contact",
      email: "not-set@example.com",
      phone: "—",
      probability: stage() === "won" ? 100 : stage() === "negotiation" ? 55 : 40,
      expectedClose: "This month",
      quoteId: "—",
      lastActivity: "Just now",
      nextStep: "Qualify the opportunity",
      notes: "Created from the desktop pipeline.",
    };
    dealRows.set([row, ...dealRows()]);
    close();
    showToast(`${row.id} created.`);
  };
  return (
    <AppDialog
      open={() => true}
      onClose={close}
      title="New opportunity"
      description="Create a commercial opportunity linked to a contact and product."
      width={560}
      testID="new-deal-dialog"
      footer={
        <DialogActions>
          <Button variant="ghost" size="sm" onPress={close}>
            <Text class="text-[10px] font-medium">Cancel</Text>
          </Button>
          <Button variant="primary" size="sm" onPress={save} testID="create-deal">
            <Icon name="plus" size={11} tone="primary-foreground" />
            <Text class="text-[10px] font-semibold text-primary-foreground">
              Create opportunity
            </Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-4">
        <FormGrid>
          <TextField
            label="Opportunity"
            value={name}
            onChange={name.set}
            placeholder="Acme — Q4 packaging"
            hint="Required"
          />
          <TextField
            label="Company"
            value={company}
            onChange={company.set}
            placeholder="Acme Kenya"
            hint="Required"
          />
          <TextField label="Value" value={value} onChange={value.set} placeholder="KES 248,500" />
          <TextField
            label="Product / quantity"
            value={product}
            onChange={product.set}
            placeholder="50 units · ProMax"
          />
        </FormGrid>
        <FormGrid>
          <SelectField
            label="Owner"
            value={owner}
            options={ownerOptions.filter((item) => item !== "All owners")}
            onChange={owner.set}
          />
          <SelectField
            label="Starting stage"
            value={() => labelForStage(stage())}
            options={stageLabels}
            onChange={(label) =>
              stage.set(dealStages.find((item) => item.label === label)?.id ?? "qualified")
            }
          />
        </FormGrid>
        <ModalNotice
          title="Value is a commitment, not activity"
          detail="Keep stage and value on the opportunity. The contact timeline and conversations update from the same event stream."
        />
      </View>
    </AppDialog>
  );
}

export function DealDialogs() {
  return (
    <>
      <If when={newDealOpen()}>
        <NewDealForm />
      </If>
    </>
  );
}
