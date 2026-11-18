import { Text, token, View } from "nsh";
import { AppDialog, DialogActions, ModalNotice } from "../../components/overlay";
import { Badge, Button, Icon, SectionTitle, withAlpha } from "../../components/ui";
import { activeNav, showToast } from "../../state";
import { productDispatch } from "./state";
import { DispatchDialog } from "./DispatchDialog";
import type { Product } from "./data";
import { productDetail, productRows } from "./state";

const closeProduct = () => productDetail.set(null);

function changeStock(product: Product) {
  productRows.set(
    productRows().map((row) =>
      row.id === product.id ? { ...row, stock: row.stock + 25, status: "active" as const } : row,
    ),
  );
  closeProduct();
  showToast(`${product.sku} restocked by 25 units.`);
}

function Metric(props: { label: string; value: string }) {
  return (
    <View class="flex-1 gap-0.5 rounded-lg border border-border bg-panel p-2.5">
      <Text class="text-[8.5px] uppercase tracking-wide text-muted-foreground">{props.label}</Text>
      <Text class="text-[14px] font-semibold text-foreground">{props.value}</Text>
    </View>
  );
}

function ProductDetailDialog(props: { product: Product }) {
  const product = props.product;
  return (
    <AppDialog
      open={() => true}
      onClose={closeProduct}
      title={product.name}
      description={`${product.sku} · ${product.category}`}
      width={600}
      testID="product-dialog"
      footer={
        <DialogActions>
          <Button variant="ghost" size="sm" onPress={() => showToast("Product editor opened.")}>
            <Icon name="settings" size={11} tone="muted-foreground" />
            <Text class="text-[10px] font-medium">Edit product</Text>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onPress={() => {
              productDispatch.set(product);
              closeProduct();
            }}
          >
            <Icon name="send" size={11} tone="muted-foreground" />
            <Text class="text-[10px] font-medium">Send to conversation</Text>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onPress={() => {
              closeProduct();
              activeNav.set("Quotes");
            }}
          >
            <Icon name="fileText" size={11} tone="muted-foreground" />
            <Text class="text-[10px] font-medium">Add to quote</Text>
          </Button>
          <Button variant="primary" size="sm" onPress={() => changeStock(product)}>
            <Icon name="package" size={11} tone="primary-foreground" />
            <Text class="text-[10px] font-semibold text-primary-foreground">Restock +25</Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-4">
        <View class="flex-row items-center gap-3">
          <View
            class="h-16 w-16 items-center justify-center rounded-xl"
            style={{ backgroundColor: withAlpha(token(product.tone), "20") }}
          >
            <Icon name="package" size={24} tone={product.tone} />
          </View>
          <View class="min-w-0 flex-1 gap-0.5">
            <Text class="text-[10px] text-muted-foreground">{product.description}</Text>
            <Text class="text-[18px] font-semibold text-foreground">{product.price}</Text>
            <Text class="text-[9px] text-muted-foreground">
              Supplier: {product.supplier} · Updated {product.updated}
            </Text>
          </View>
          <Badge
            variant={
              product.status === "active"
                ? "success"
                : product.status === "low"
                  ? "warning"
                  : "outline"
            }
          >
            <Text
              class="text-[8.5px] font-medium capitalize"
              style={{
                color: token(
                  product.status === "active"
                    ? "success"
                    : product.status === "low"
                      ? "warning"
                      : "muted-foreground",
                ),
              }}
            >
              {product.status}
            </Text>
          </Badge>
        </View>
        <View class="flex-row gap-1.5">
          <Each of={[1, 2, 3, 4]}>
            {(index: () => number) => (
              <View
                class="h-12 flex-1 items-center justify-center rounded-lg border border-border"
                style={{
                  backgroundColor: withAlpha(token(product.tone), index() === 0 ? "22" : "0d"),
                }}
              >
                <Icon name={index() === 0 ? "image" : "package"} size={14} tone={product.tone} />
              </View>
            )}
          </Each>
          <View class="w-20 items-center justify-center rounded-lg border border-border bg-panel">
            <Text class="text-[8.5px] font-medium text-muted-foreground">
              {product.media} media
            </Text>
          </View>
        </View>
        <View class="flex-row gap-2">
          <Metric label="On hand" value={`${product.stock} units`} />
          <Metric label="Reorder at" value={`${product.reorderAt} units`} />
          <Metric label="Cost" value={product.cost} />
          <Metric label="Margin" value={product.margin} />
        </View>
        <View class="grid grid-cols-2 gap-3">
          <View class="gap-2 rounded-3xl border border-border bg-card shadow-md p-3">
            <SectionTitle>Variants</SectionTitle>
            <View class="flex-row flex-wrap gap-1.5">
              <Each of={product.variants}>
                {(variant: () => string) => (
                  <View class="h-6 items-center justify-center rounded-md bg-muted px-2">
                    <Text class="text-[8.5px] font-medium text-foreground">{variant()}</Text>
                  </View>
                )}
              </Each>
            </View>
            <Text class="text-[9px] text-muted-foreground">
              Variants generated on demand from the catalog.
            </Text>
          </View>
          <View class="gap-2 rounded-3xl border border-border bg-card shadow-md p-3">
            <SectionTitle>Media & identity</SectionTitle>
            <Text class="text-[9.5px] text-muted-foreground">
              {product.media} images cached · thumbnails local
            </Text>
            <Text class="text-[9.5px] text-muted-foreground">Barcode {product.barcode}</Text>
            <Text class="text-[9.5px] text-muted-foreground">SKU {product.sku}</Text>
          </View>
        </View>
        <View class="gap-2 rounded-3xl border border-border bg-card shadow-md p-3">
          <SectionTitle>Stock movement</SectionTitle>
          <View class="flex-row items-end gap-1" style={{ height: 42 }}>
            <Each of={[14, 18, 16, 24, 20, 28, 34, 30, 38, 42]}>
              {(height: () => number, index: () => number) => (
                <View
                  class="flex-1 rounded-t-sm"
                  style={{
                    height: height(),
                    backgroundColor:
                      index() === 9 ? token("primary") : withAlpha(token("chart-3"), "55"),
                  }}
                />
              )}
            </Each>
          </View>
          <Text class="text-[9px] text-muted-foreground">
            Fulfilment and restock events are synced from the cloud.
          </Text>
        </View>
        <ModalNotice
          title="Media is fetched on demand"
          detail="Catalog metadata and thumbnails are cached locally; full media downloads only when a rep requests or sends it."
        />
      </View>
    </AppDialog>
  );
}

export function ProductDialog() {
  return (
    <>
      <Each of={productRows()}>
        {(product: () => Product) => (
          <If when={productDetail()?.id === product().id}>
            <ProductDetailDialog product={product()} />
          </If>
        )}
      </Each>
      <DispatchDialog />
    </>
  );
}
