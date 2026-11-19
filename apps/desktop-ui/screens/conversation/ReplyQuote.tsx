import { Text, token, View } from "nsh";
import { withAlpha } from "../../components/ui";
import type { ReplyPreview } from "../../data";

export function ReplyQuote(props: { replyTo: ReplyPreview; outgoing?: boolean }) {
  return (
    <View
      class="gap-0.5 border-l-2 pl-2"
      style={{
        borderColor: props.outgoing ? token("bubble-out-foreground") : token("primary"),
      }}
    >
      <Text
        class="text-[8.5px] font-semibold"
        style={{
          color: props.outgoing
            ? withAlpha(token("bubble-out-foreground"), "cc")
            : token("highlight"),
        }}
      >
        {props.replyTo.from}
      </Text>
      <Text
        class="text-[9px]"
        style={{
          color: props.outgoing
            ? withAlpha(token("bubble-out-foreground"), "aa")
            : token("muted-foreground"),
          numberOfLines: 1,
        }}
      >
        {props.replyTo.text}
      </Text>
    </View>
  );
}
