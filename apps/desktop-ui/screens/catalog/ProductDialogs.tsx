import { currencySymbol } from "../../lib/money";
import { signal, Text, View } from "nsh";
import { AppDialog, DialogActions, FormGrid, ModalNotice } from "../../components/overlay";
import { ChoiceCards, SelectField, TextField } from "../../components/forms";
import { Button, Icon, SectionTitle } from "../../components/ui";
import { showToast } from "../../state";
import type { Product } from "./data";
import { catalogImportOpen, newProductOpen, productRows } from "./state";

const closeNew = () => newProductOpen.set(false);
const closeImport = () => catalogImportOpen.set(false);

function NewProductForm() {
  const name = signal("");
  const sku = signal("");
  const category = signal("Audio");
  const price = signal("");
  const stock = signal("0");
  const visibility = signal("Draft");
  const save = () => {
    if (!name().trim() || !sku().trim()) {
      showToast("Product name and SKU are required.");
      return;
    }
    const row: Product = {
      id: `p${Date.now()}`,
      sku: sku().trim(),
      name: name().trim(),
      category: category(),
      price: price().trim() || `${currencySymbol()}0`,
      stock: Number.parseInt(stock(), 10) || 0,
      status:
        visibility() === "Draft" ? "draft" : Number.parseInt(stock(), 10) > 0 ? "active" : "draft",
      tone: "chart-2",
      description: "Created from the desktop catalog.",
      cost: `${currencySymbol()}0`,
      margin: "—",
      reorderAt: 10,
      variants: ["Standard"],
      media: 0,
      barcode: "Pending",
      supplier: "Unassigned",
      updated: "Just now",
    };
    productRows.set([row, ...productRows()]);
    closeNew();
    showToast(`${row.name} added to the catalog.`);
  };
  return (
    <AppDialog
      open={() => true}
      onClose={closeNew}
      title="New product"
      description="Add a catalog item for quoting and dispatch."
      width={560}
      testID="new-product-dialog"
      footer={
        <DialogActions>
          <Button variant="ghost" size="sm" onPress={closeNew}>
            <Text class="text-[12px] font-medium">Cancel</Text>
          </Button>
          <Button variant="primary" size="sm" onPress={save} testID="create-product">
            <Icon name="plus" size={11} tone="primary-foreground" />
            <Text class="text-[12px] font-semibold text-primary-foreground">Create product</Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-4">
        <FormGrid>
          <TextField
            label="Product name"
            value={name}
            onChange={name.set}
            placeholder="ProMax headset"
            testID="product-name"
          />
          <TextField
            label="SKU"
            value={sku}
            onChange={sku.set}
            placeholder="IQ-PRO-50"
            testID="product-sku"
          />
          <SelectField
            label="Category"
            value={category}
            options={["Audio", "Displays", "Accessories"]}
            onChange={category.set}
          />
          <TextField
            label="Price"
            value={price}
            onChange={price.set}
            placeholder={`${currencySymbol()}12,500`}
            testID="product-price"
          />
          <TextField label="Opening stock" value={stock} onChange={stock.set} placeholder="0" />
          <ChoiceCards
            value={() => "Draft"}
            options={[
              {
                value: "Draft",
                title: "Publish as draft",
                detail: "Review variants and media before syncing to every desktop.",
              },
            ]}
            onChange={() => undefined}
          />
        </FormGrid>
        <ModalNotice
          title="Catalog changes are cloud-published"
          detail="A manager publishes catalog changes; every linked desktop caches the metadata and thumbnails."
        />
      </View>
    </AppDialog>
  );
}

function ImportForm() {
  const source = signal("CSV file");
  return (
    <AppDialog
      open={() => true}
      onClose={closeImport}
      title="Import catalog"
      description="Add products from a supplier sheet or export."
      width={560}
      testID="catalog-import-dialog"
      footer={
        <DialogActions>
          <Button variant="ghost" size="sm" onPress={closeImport}>
            <Text class="text-[12px] font-medium">Cancel</Text>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onPress={() => {
              closeImport();
              showToast("Catalog import queued.");
            }}
            testID="confirm-catalog-import"
          >
            <Icon name="download" size={11} tone="primary-foreground" />
            <Text class="text-[12px] font-semibold text-primary-foreground">Import catalog</Text>
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
              detail: "Upload a supplier price list with SKU, name, category, and price columns.",
            },
            {
              value: "Supplier API",
              title: "Supplier API",
              detail: "Sync a connected supplier catalog through the cloud.",
            },
          ]}
          onChange={source.set}
        />
        <View class="gap-2 rounded-xl border border-border bg-card shadow-md p-3">
          <SectionTitle>Preview</SectionTitle>
          <View class="flex-row items-center gap-2">
            <Icon name="package" size={12} tone="muted-foreground" />
            <Text class="text-[12px] font-medium text-foreground">12 products · 3 categories</Text>
            <Text class="text-[11px] text-muted-foreground">from supplier-nov.csv</Text>
          </View>
          <Text class="text-[11px] text-muted-foreground">
            Duplicate SKUs update existing records; new SKUs are added as drafts.
          </Text>
        </View>
        <ModalNotice
          icon="shieldCheck"
          title="Server-side validation"
          detail="The cloud validates tenant scope and publishes the catalog snapshot to every device in the org."
        />
      </View>
    </AppDialog>
  );
}

export function ProductDialogs() {
  return (
    <>
      <If when={newProductOpen()}>
        <NewProductForm />
      </If>
      <If when={catalogImportOpen()}>
        <ImportForm />
      </If>
    </>
  );
}
