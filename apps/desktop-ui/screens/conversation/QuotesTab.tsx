import { View } from "nsh";
import type { Conversation } from "../../data";
import { QuoteSummary } from "../opportunities/QuoteSummary";
import { ConversationEmpty } from "./ConversationEmpty";
import { quotesForConversation } from "./threadViews";

export function QuotesTab(props: { conversation: Conversation }) {
  const quotes = quotesForConversation(props.conversation);
  return (
    <View class="gap-2 p-5">
      <If
        when={quotes.length > 0}
        else={
          <ConversationEmpty
            icon="fileText"
            title="No quotations yet"
            detail="Quotes issued against the opportunities in this conversation appear here."
          />
        }
      >
        <View class="gap-2">
          <Each of={quotes}>
            {(quote: () => (typeof quotes)[number]) => <QuoteSummary quote={quote()} />}
          </Each>
        </View>
      </If>
    </View>
  );
}
