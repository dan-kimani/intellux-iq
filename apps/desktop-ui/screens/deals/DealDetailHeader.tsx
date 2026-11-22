import { Text, token, View } from "nsh";
import { Icon } from "../../components/ui";
import type { Deal } from "./data";

export function DealDetailHeader(props: { deal: Deal; onClose: () => void }) {
  const deal = props.deal;
  const closeDeal = props.onClose;
  return (
    <View class="shrink-0 flex-row items-start gap-2 border-b border-border px-4 py-4">
      <View
        role="button"
        accessibilityLabel="Back to pipeline"
        testID="deal-detail-back"
        onPress={closeDeal}
        class="mt-0.5 h-7 w-7 items-center justify-center rounded-md"
        hoverStyle={{ backgroundColor: token("accent") }}
      >
        <Icon name="chevronLeft" size={13} tone="muted-foreground" />
      </View>
      <View class="min-w-0 flex-1 gap-0.5">
        <Text class="text-[16px] font-semibold text-foreground">{deal.name}</Text>
        <Text class="text-[12px] text-muted-foreground">
          {deal.company} · {deal.id}
        </Text>
      </View>
      <View
        role="button"
        accessibilityLabel="Close opportunity"
        testID="dialog-close"
        onPress={closeDeal}
        class="h-7 w-7 items-center justify-center rounded-md"
        hoverStyle={{ backgroundColor: token("accent") }}
      >
        <Icon name="close" size={13} tone="muted-foreground" />
      </View>
    </View>
  );
}
