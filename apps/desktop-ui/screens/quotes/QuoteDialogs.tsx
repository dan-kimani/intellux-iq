import { quoteBuilderOpen } from "./state";
import { QuoteBuilderDialog } from "./QuoteBuilderDialog";

export function QuoteDialogs() {
  return (
    <>
      <If when={quoteBuilderOpen()}>
        <QuoteBuilderDialog />
      </If>
    </>
  );
}
