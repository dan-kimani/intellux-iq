import { token, View } from "nsh";
import { dealAnchor, JOIN_CUT } from "./state";

export function DealDetailSeam() {
  const anchor = dealAnchor();
  if (!anchor) return null;
  return (
    <View
      class="absolute"
      style={{
        left: anchor.side === "right" ? -1 : undefined,
        right: anchor.side === "left" ? -1 : undefined,
        top: anchor.cardTop - anchor.top - JOIN_CUT,
        height: anchor.cardHeight + JOIN_CUT * 2,
        width: 3,
        backgroundColor: token("popover"),
        zIndex: 2,
      }}
    />
  );
}
