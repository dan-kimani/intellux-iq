import { TextView } from "nsh/base";
import { whatsappToHtml } from "./whatsappHtml";

/**
 * The message text is not selectable: a selectable native text view swallows the
 * secondary click with its own menu, and the message actions menu (which has
 * Copy) is the one the thread exposes instead.
 */
export function WhatsAppTranscript(props: {
  text: string;
  outgoing?: boolean;
  onContextMenu?: () => void;
}) {
  return (
    <TextView
      html={whatsappToHtml(props.text)}
      onContextMenu={() => props.onContextMenu?.()}
      class={`text-[13px] leading-5 ${
        props.outgoing ? "text-bubble-out-foreground" : "text-bubble-in-foreground"
      }`}
      classes={{
        paragraph: "m-0",
        strong: "font-bold",
        emphasis: "italic",
        strikethrough: "line-through",
        code: "font-mono text-[12px]",
        list: "my-1 pl-4",
        listItem: "my-0.5",
        blockquote: "my-1 border-l-2 border-border pl-2",
      }}
    />
  );
}
