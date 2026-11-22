import { Text, token, View } from "nsh";
import { DealCardBody } from "./DealCard";
import { dealDrag } from "./state";

function DragPreview() {
  const drag = dealDrag()!;
  return (
    <View
      testID="deal-drag-preview"
      class="absolute inset-0"
      style={{ zIndex: 2000, pointerEvents: "none" }}
    >
      <View
        class="absolute gap-2.5 rounded-xl border border-border bg-card p-3"
        style={{
          left: drag.left,
          top: drag.top,
          width: drag.width,
          transform: [
            { translateX: drag.x },
            { translateY: drag.y },
            { rotate: "2deg" },
            { scale: 1.03 },
          ],
          boxShadow: "0 32px 64px rgba(0,0,0,0.55)",
          borderColor: token("ring"),
        }}
      >
        <DealCardBody deal={drag.deal} />
        <View class="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 py-0.5">
          <Text class="text-[9px] font-semibold text-primary-foreground">Moving</Text>
        </View>
      </View>
    </View>
  );
}

export function DealDragLayer() {
  return (
    <If when={dealDrag()}>
      <DragPreview />
    </If>
  );
}
