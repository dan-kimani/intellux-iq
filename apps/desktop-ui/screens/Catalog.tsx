import { signal, Text, token, View } from "nsh";
import { Input as NativeInput } from "nsh/base";
import { Button, Card, Icon, SectionTitle } from "../components/ui";
import { AnimatedSwap, useAfter } from "../components/motion";
import { Skeleton, SkeletonMetric } from "../components/skeletons";
import { ProductDialog } from "./catalog/ProductDetail";
import { ProductCard } from "./catalog/ProductCard";
import { ProductDialogs } from "./catalog/ProductDialogs";
import {
  catalogImportOpen,
  catalogLowStock,
  catalogTabItems,
  newProductOpen,
  productRows,
} from "./catalog/state";
import { SectionTabs } from "../components/SectionTabs";
import { PageActions, PageShell } from "./PageShell";
import { categories, catalogMetrics, products } from "./catalog/data";
import { moneyText } from "../lib/money";

function CatalogMetrics() {
  const ready = useAfter(150);
  return (
    <If
      when={ready()}
      else={
        <View class="grid grid-cols-3 gap-3">
          <SkeletonMetric />
          <SkeletonMetric />
          <SkeletonMetric />
        </View>
      }
    >
      <View class="grid grid-cols-3 gap-3">
        <Each of={catalogMetrics}>
          {(item: () => (typeof catalogMetrics)[number]) => (
            <Card class="gap-2 p-3.5">
              <View class="flex-row items-center justify-between">
                <Text class="text-[12px] text-muted-foreground">{item().label}</Text>
                <View
                  class="h-2 w-2 rounded-full"
                  style={{ backgroundColor: token(item().tone) }}
                />
              </View>
              <Text class="text-[22px] font-semibold tabular-nums text-foreground">
                {moneyText(item().value)}
              </Text>
              <Text class="text-[12px] text-muted-foreground">{item().note}</Text>
            </Card>
          )}
        </Each>
      </View>
    </If>
  );
}

function CatalogGrid() {
  const ready = useAfter(300);
  const category = signal<(typeof categories)[number]>("All");
  const query = signal("");
  const filtered = () =>
    productRows().filter((product) => {
      const inCategory = category() === "All" || product.category === category();
      const needle = query().trim().toLowerCase();
      const matches =
        !needle ||
        `${product.name} ${product.sku} ${product.category}`.toLowerCase().includes(needle);
      const inLowStock = !catalogLowStock() || product.status === "low" || product.stock === 0;
      return inCategory && matches && inLowStock;
    });
  return (
    <View class="min-w-0 flex-1 gap-3">
      <View class="flex-row items-center gap-1.5">
        <Each of={categories}>
          {(item: () => (typeof categories)[number]) => (
            <View
              role="button"
              accessibilityLabel={`Filter ${item()}`}
              onPress={() => category.set(item())}
              class="h-7 items-center justify-center rounded-md border px-2.5"
              style={{
                backgroundColor: category() === item() ? token("accent") : "transparent",
                borderColor: category() === item() ? token("ring") : token("border"),
              }}
            >
              <Text
                class="text-[12px] font-medium"
                style={{
                  color:
                    category() === item() ? token("accent-foreground") : token("muted-foreground"),
                }}
              >
                {item()}
              </Text>
            </View>
          )}
        </Each>
        <View class="h-7 w-44 flex-row items-center gap-1.5 rounded-md border border-border bg-card px-2">
          <Icon name="search" size={11} tone="muted-foreground" />
          <NativeInput
            value={query()}
            onChange={({ value }) => query.set(value)}
            placeholder="Search SKU or name…"
            testID="catalog-search"
            style={{
              flex: 1,
              height: 24,
              paddingLeft: 0,
              paddingRight: 0,
              fontSize: 12,
              color: token("foreground"),
              placeholderColor: token("muted-foreground"),
              backgroundColor: "transparent",
              borderWidth: 0,
            }}
          />
        </View>
        <Text class="text-[12px] text-muted-foreground">{filtered().length} products</Text>
      </View>
      <If
        when={ready()}
        else={
          <View class="grid grid-cols-3 gap-3">
            <Skeleton class="h-48 rounded-xl" />
            <Skeleton class="h-48 rounded-xl" />
            <Skeleton class="h-48 rounded-xl" />
            <Skeleton class="h-48 rounded-xl" />
            <Skeleton class="h-48 rounded-xl" />
            <Skeleton class="h-48 rounded-xl" />
          </View>
        }
      >
        <View class="grid grid-cols-3 gap-3">
          <Each of={filtered()}>
            {(product: () => (typeof products)[number]) => (
              <View class="flex">
                <ProductCard product={product()} />
              </View>
            )}
          </Each>
        </View>
      </If>
    </View>
  );
}

function CatalogSide() {
  const ready = useAfter(380);
  return (
    <View class="w-64 shrink-0 gap-3">
      <If
        when={ready()}
        else={
          <>
            <Skeleton class="h-32 rounded-xl" />
            <Skeleton class="h-40 rounded-xl" />
          </>
        }
      >
        <Card class="gap-3 p-4">
          <SectionTitle>Low stock</SectionTitle>
          <Each of={productRows().filter((p) => p.status === "low" || p.stock === 0)}>
            {(product: () => (typeof products)[number]) => (
              <View class="flex-row items-center gap-2.5">
                <View class="h-7 w-7 items-center justify-center rounded-md bg-muted">
                  <Icon name="package" size={12} tone="muted-foreground" />
                </View>
                <View class="min-w-0 flex-1 gap-0.5">
                  <Text class="text-[12px] font-medium text-foreground">{product().name}</Text>
                  <Text class="text-[11px] text-muted-foreground">
                    {product().stock} units left
                  </Text>
                </View>
                <Text class="text-[11px] font-medium text-warning">Restock</Text>
              </View>
            )}
          </Each>
        </Card>
        <Card class="gap-2.5 p-4">
          <SectionTitle>Media sync</SectionTitle>
          <Text class="text-[13px] font-medium text-foreground">All product media is cached</Text>
          <Text class="text-[11px] leading-3.5 text-muted-foreground">
            Images are downloaded on demand; thumbnails are local.
          </Text>
          <View class="h-1.5 overflow-hidden rounded-full bg-muted">
            <View class="h-full rounded-full bg-success" style={{ width: "96%" }} />
          </View>
          <Text class="text-[11px] text-muted-foreground">96% of 86 products ready</Text>
        </Card>
      </If>
    </View>
  );
}

export function CatalogScreen() {
  return (
    <>
      <PageShell
        title="Catalogue"
        description="Products, variants, pricing, and media synced from the cloud."
        testID="screen-catalog"
        tabs={
          <SectionTabs
            items={catalogTabItems()}
            value={catalogLowStock() ? "low" : "all"}
            onChange={(id) => catalogLowStock.set(id === "low")}
            accessibilityLabel="Catalogue views"
            testPrefix="tab-catalog"
          />
        }
        actions={
          <PageActions>
            <Button variant="outline" size="sm" onPress={() => catalogImportOpen.set(true)}>
              <Icon name="download" size={12} tone="muted-foreground" />
              <Text class="text-[12px] font-medium">Import</Text>
            </Button>
            <Button variant="primary" size="sm" onPress={() => newProductOpen.set(true)}>
              <Icon name="plus" size={12} tone="primary-foreground" />
              <Text class="text-[12px] font-semibold text-primary-foreground">New product</Text>
            </Button>
          </PageActions>
        }
      >
        <AnimatedSwap swapKey={catalogLowStock() ? "low" : "all"} layout="stack">
          {() => (
            <View class="gap-5">
              <CatalogMetrics />
              <View class="flex-row gap-3">
                <CatalogGrid />
                <CatalogSide />
              </View>
            </View>
          )}
        </AnimatedSwap>
      </PageShell>
      <ProductDialog />
      <ProductDialogs />
    </>
  );
}
