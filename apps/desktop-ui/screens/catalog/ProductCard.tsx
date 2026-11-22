import { moneyText } from "../../lib/money";
import { Text, token, View } from "nsh";
import { ContextActions } from "../../components/ContextActions";
import { Badge, Icon, withAlpha } from "../../components/ui";
import { productDetail } from "./state";
import { productLink } from "../work/links";
import { workMenuActions } from "../work/actions";
import type { Product } from "./data";

export function ProductCard(props: { product: Product }) {
  return (
    <ContextActions
      testID={`product-context-${props.product.id}`}
      trigger={
        <View
          role="button"
          accessibilityLabel={`Open ${props.product.name}`}
          onPress={() => productDetail.set(props.product)}
          class="flex-1 gap-2.5 rounded-xl border border-border bg-card shadow-md p-3.5 transition-colors"
          hoverStyle={{ backgroundColor: token("accent"), borderColor: token("ring") }}
          focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 2 }}
        >
          <View
            class="h-16 items-center justify-center rounded-lg"
            style={{ backgroundColor: withAlpha(token(props.product.tone), "20") }}
          >
            <Icon name="package" size={22} tone={props.product.tone} />
          </View>
          <View class="flex-row items-center justify-between gap-2">
            <Text class="text-[13px] font-medium text-foreground">{props.product.name}</Text>
            <Badge
              variant={
                props.product.status === "active"
                  ? "success"
                  : props.product.status === "low"
                    ? "warning"
                    : "outline"
              }
            >
              <Text
                class="text-[11px] font-medium capitalize"
                style={{
                  color: token(
                    props.product.status === "active"
                      ? "success"
                      : props.product.status === "low"
                        ? "warning"
                        : "muted-foreground",
                  ),
                }}
              >
                {props.product.status}
              </Text>
            </Badge>
          </View>
          <Text class="font-mono text-[11px] text-muted-foreground">{props.product.sku}</Text>
          <View class="flex-row items-center justify-between border-t border-border pt-2">
            <Text class="text-[13px] font-semibold tabular-nums text-foreground">
              {moneyText(props.product.price)}
            </Text>
            <Text class="text-[12px] tabular-nums text-muted-foreground">
              {props.product.stock} in stock
            </Text>
          </View>
        </View>
      }
      groups={[
        workMenuActions(productLink(props.product)).map((action) => ({
          id: action.id,
          label: action.label,
          icon: action.icon,
          onSelect: action.onSelect,
        })),
      ]}
    />
  );
}
