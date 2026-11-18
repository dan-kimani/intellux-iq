import type { JSX } from "nsh";
import { ContextActions, type ContextAction } from "../../components/ContextActions";
import type { QuoteRow } from "./data";
import { duplicateQuote, markQuoteSent, openQuote, previewQuotePdf } from "./state";

function quoteGroups(quote: QuoteRow): ContextAction[][] {
  const draft = quote.status === "draft";
  return [
    [
      {
        id: "open",
        label: "Open quote",
        icon: "arrowUpRight",
        description: "Show the quotation document in the detail pane",
        onSelect: () => openQuote(quote),
      },
      {
        id: "preview",
        label: "Preview PDF",
        icon: "printer",
        description: "Render the customer-facing PDF in this pane",
        onSelect: () => previewQuotePdf(quote),
      },
    ],
    [
      {
        id: "sent",
        label: "Mark as sent",
        icon: "send",
        disabled: !draft,
        description: "Queue the draft for cloud egress",
        onSelect: () => markQuoteSent(quote.id),
      },
      {
        id: "duplicate",
        label: "Duplicate quote",
        icon: "fileText",
        description: "Start a new draft from this quotation",
        onSelect: () => duplicateQuote(quote.id),
      },
    ],
  ];
}

export function QuoteContextMenu(props: { quote: QuoteRow; trigger: JSX.Element }) {
  return (
    <ContextActions
      testID={`quote-context-${props.quote.id}`}
      width={244}
      trigger={props.trigger}
      groups={quoteGroups(props.quote)}
    />
  );
}
