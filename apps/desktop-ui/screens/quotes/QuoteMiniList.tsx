import { Scroll, Text, token, View } from "nsh";
import { QuoteContextMenu } from "./QuoteContextMenu";
import type { QuoteRow } from "./data";
import { quoteStatusStyles } from "./data";
import { quoteDetail, quotePdf, visibleQuoteRows } from "./state";

const selectedQuote = () => quotePdf()?.id ?? quoteDetail()?.id;

export function QuoteMiniList() {
  return (
    <View
      class="h-full flex-col border-r border-border bg-panel"
      style={{ width: "20%" }}
      testID="quote-mini-list"
    >
      <View class="shrink-0 flex-row items-center justify-between border-b border-border px-3 py-2.5">
        <Text class="text-[12px] font-medium text-muted-foreground">
          {visibleQuoteRows().length} quotes
        </Text>
        <Text class="text-[12px] text-muted-foreground">Newest first</Text>
      </View>
      <Scroll class="min-h-0 flex-1 px-2 py-2" scrollbar={false}>
        <Each of={visibleQuoteRows()}>
          {(quote: () => QuoteRow) => (
            <QuoteContextMenu
              quote={quote()}
              trigger={
                <View
                  role="button"
                  accessibilityLabel={`Open ${quote().id}`}
                  testID={`quote-mini-${quote().id}`}
                  onPress={() => {
                    quotePdf.set(null);
                    quoteDetail.set(quote());
                  }}
                  class="gap-2 rounded-lg border border-transparent px-2.5 py-3"
                  style={{
                    backgroundColor:
                      selectedQuote() === quote().id ? token("accent") : "transparent",
                    borderColor: selectedQuote() === quote().id ? token("ring") : "transparent",
                  }}
                  hoverStyle={{ backgroundColor: token("accent") }}
                  focusVisibleStyle={{
                    outlineWidth: 2,
                    outlineColor: token("ring"),
                    outlineOffset: -2,
                  }}
                >
                  <View class="flex-row items-center justify-between gap-1">
                    <Text class="text-[12px] font-semibold text-foreground">
                      {quote().customer}
                    </Text>
                    <View
                      class="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor: token(
                          quoteStatusStyles[quote().status].variant === "success"
                            ? "success"
                            : quoteStatusStyles[quote().status].variant === "warning"
                              ? "warning"
                              : "chart-2",
                        ),
                      }}
                    />
                  </View>
                  <Text class="text-[11px] font-mono tabular-nums text-muted-foreground">
                    {quote().id}
                  </Text>
                  <View class="flex-row items-center justify-between gap-1">
                    <Text class="text-[12px] font-semibold tabular-nums text-foreground">
                      {quote().value}
                    </Text>
                    <Text class="text-[11px] tabular-nums text-muted-foreground">
                      {quote().validUntil}
                    </Text>
                  </View>
                </View>
              }
            />
          )}
        </Each>
      </Scroll>
      <View class="border-t border-border px-3 py-2">
        <Text class="text-[11px] text-muted-foreground">Right-click for actions</Text>
      </View>
    </View>
  );
}
