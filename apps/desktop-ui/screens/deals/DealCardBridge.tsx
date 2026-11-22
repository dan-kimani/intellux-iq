import { token, View } from "nsh";
import { DealCardBody } from "./DealCard";
import type { Deal } from "./data";
import { dealAnchor, JOIN_CUT } from "./state";

const CUT = JOIN_CUT;

export function DealCardBridge(props: { deal: Deal }) {
  const anchor = dealAnchor();
  if (!anchor) return null;
  const right = anchor.side === "right";
  const border = token("border");
  return (
    <View
      testID="deal-card-bridge"
      class={`absolute gap-2.5 bg-popover p-3 ${right ? "rounded-l-xl" : "rounded-r-xl"}`}
      style={{
        left: anchor.cardLeft,
        top: anchor.cardTop,
        width: anchor.cardWidth,
        height: anchor.cardHeight,
        zIndex: 60,
        pointerEvents: "none",
        boxShadow: "none",
      }}
    >
      <DealCardBody deal={props.deal} />
      <View
        class="absolute inset-y-0 border"
        style={{
          left: right ? 0 : undefined,
          right: right ? undefined : 0,
          width: anchor.cardWidth - CUT,
          borderColor: border,
          borderRightWidth: right ? 0 : 1,
          borderLeftWidth: right ? 1 : 0,
          borderTopRightRadius: right ? 0 : 12,
          borderBottomRightRadius: right ? 0 : 12,
          borderTopLeftRadius: right ? 12 : 0,
          borderBottomLeftRadius: right ? 12 : 0,
        }}
      />
      <View
        testID="deal-join-top"
        class="absolute"
        style={{
          left: right ? undefined : 0,
          right: right ? 0 : undefined,
          top: -CUT,
          width: CUT,
          height: CUT,
          borderBottomWidth: 1,
          borderBottomColor: border,
          borderLeftWidth: right ? 0 : 1,
          borderLeftColor: border,
          borderRightWidth: right ? 1 : 0,
          borderRightColor: border,
          borderBottomLeftRadius: right ? undefined : CUT,
          borderBottomRightRadius: right ? CUT : undefined,
        }}
      />
      <View
        testID="deal-join-bottom"
        class="absolute"
        style={{
          left: right ? undefined : 0,
          right: right ? 0 : undefined,
          bottom: -CUT,
          width: CUT,
          height: CUT,
          borderTopWidth: 1,
          borderTopColor: border,
          borderLeftWidth: right ? 0 : 1,
          borderLeftColor: border,
          borderRightWidth: right ? 1 : 0,
          borderRightColor: border,
          borderTopLeftRadius: right ? undefined : CUT,
          borderTopRightRadius: right ? CUT : undefined,
        }}
      />
    </View>
  );
}
