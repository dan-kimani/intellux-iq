import { effect, Text, token, View } from "nsh";
import { ActionMenu } from "../components/ActionMenu";
import { AnimatedSwap, ScreenFade } from "../components/motion";
import { SectionTabs, type SectionTabItem } from "../components/SectionTabs";
import { Button, Icon } from "../components/ui";
import type { QuoteRow } from "./quotes/data";
import {
  quoteBuilderOpen,
  quoteCustomerPrefill,
  quoteDetail,
  quotePdf,
  quoteTab,
  quoteTabCounts,
  visibleQuoteRows,
  type QuoteTab,
} from "./quotes/state";
import { QuoteDetailPage } from "./quotes/QuoteDetailPage";
import { QuotePdfPage } from "./quotes/QuotePdfPage";
import { QuoteMiniList } from "./quotes/QuoteMiniList";
import { PageActions, PageHeader } from "./PageShell";

const tabs: { id: QuoteTab; label: string }[] = [
  { id: "all", label: "All Quotes" },
  { id: "drafts", label: "Drafts" },
  { id: "pending", label: "Pending Approval" },
  { id: "sent", label: "Sent" },
  { id: "accepted", label: "Accepted" },
];

function quoteTabs(): SectionTabItem[] {
  const counts = quoteTabCounts();
  return tabs.map((tab) => ({ ...tab, count: counts[tab.id] }));
}

function QuoteHeaderActions() {
  return (
    <PageActions>
      <ActionMenu
        testID="quote-templates-menu"
        width={210}
        trigger={
          <View
            role="button"
            accessibilityLabel="Quote templates"
            testID="quote-templates"
            class="h-8 flex-row items-center gap-1.5 rounded-lg border border-border px-2.5"
            hoverStyle={{ backgroundColor: token("accent") }}
            focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
          >
            <Icon name="fileText" size={11} tone="muted-foreground" />
            <Text class="text-[12px] font-medium text-foreground">Templates</Text>
            <Icon name="chevronDown" size={9} tone="muted-foreground" />
          </View>
        }
        groups={[
          [
            {
              id: "classic",
              label: "Classic",
              icon: "fileText",
              shortcut: "18 uses",
              onSelect: () => {
                quoteCustomerPrefill.set(null);
                quoteBuilderOpen.set(true);
              },
            },
            {
              id: "compact",
              label: "Compact",
              icon: "fileText",
              shortcut: "9 uses",
              onSelect: () => {
                quoteCustomerPrefill.set(null);
                quoteBuilderOpen.set(true);
              },
            },
            {
              id: "enterprise",
              label: "Enterprise",
              icon: "fileText",
              shortcut: "4 uses",
              onSelect: () => {
                quoteCustomerPrefill.set(null);
                quoteBuilderOpen.set(true);
              },
            },
          ],
        ]}
      />
      <Button
        variant="primary"
        size="sm"
        testID="quote-new"
        onPress={() => {
          quoteCustomerPrefill.set(null);
          quoteBuilderOpen.set(true);
        }}
      >
        <Icon name="plus" size={11} tone="primary-foreground" />
        <Text class="text-[12px] font-semibold text-primary-foreground">New quote</Text>
      </Button>
    </PageActions>
  );
}

export function QuotesScreen() {
  effect(() => {
    const rows = visibleQuoteRows();
    if (!rows.some((quote) => quote.id === quoteDetail()?.id)) {
      quoteDetail.set(rows[0] ?? null);
    }
  });

  return (
    <View class="min-h-0 flex-1 flex-col bg-background">
      <ScreenFade class="min-h-0 flex-1 flex-col">
        <PageHeader
          title="Quotes & Proposals"
          description="Draft, approve, send, and track customer quotations."
          actions={<QuoteHeaderActions />}
        />
        <View class="shrink-0 border-b border-border px-6 py-2.5">
          <SectionTabs
            items={quoteTabs()}
            value={quoteTab()}
            onChange={(id) => {
              quotePdf.set(null);
              quoteTab.set(id as QuoteTab);
            }}
            accessibilityLabel="Quote views"
            testPrefix="tab-quotes"
          />
        </View>
        <AnimatedSwap swapKey={quoteTab()} class="relative min-h-0 flex-1 flex-row">
          {() => (
            <View class="h-full w-full min-h-0 flex-row overflow-hidden">
              <QuoteMiniList />
              <View class="min-w-0 flex-1">
                <If when={quotePdf()}>
                  <Each of={visibleQuoteRows()}>
                    {(quote: () => QuoteRow) => (
                      <If when={quotePdf()?.id === quote().id}>
                        <QuotePdfPage quote={quote()} />
                      </If>
                    )}
                  </Each>
                </If>
                <If when={!quotePdf()}>
                  <Each of={visibleQuoteRows()}>
                    {(quote: () => QuoteRow) => (
                      <If when={quoteDetail()?.id === quote().id}>
                        <QuoteDetailPage quote={quote()} />
                      </If>
                    )}
                  </Each>
                </If>
              </View>
            </View>
          )}
        </AnimatedSwap>
      </ScreenFade>
    </View>
  );
}
