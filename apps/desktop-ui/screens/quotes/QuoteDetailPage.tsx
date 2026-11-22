import { Scroll, signal, Text, token, View } from "nsh";
import { Badge, Button, Icon } from "../../components/ui";
import { ActionMenu } from "../../components/ActionMenu";
import { workMenuActions } from "../work/actions";
import { quoteLink } from "../work/links";
import { WorkSection } from "../work/WorkSection";
import { logSystemActivity } from "../work/state";
import { ScreenFade } from "../../components/motion";
import { showToast } from "../../state";
import type { QuoteRow } from "./data";
import { markQuoteSent, quoteAcceptance, quotePdf, quoteRows } from "./state";
import { QuoteRecord } from "./QuoteRecord";
import { QuoteAcceptanceDialog } from "./QuoteAcceptanceDialog";

function approveQuote(quote: QuoteRow) {
  quoteRows.set(
    quoteRows().map((row) => (row.id === quote.id ? { ...row, approvalStatus: "approved" } : row)),
  );
  showToast(`${quote.id} approved by manager.`);
}

function sendQuote(quote: QuoteRow) {
  markQuoteSent(quote.id);
  logSystemActivity({
    kind: "email",
    title: `Quote ${quote.id} sent`,
    notes: `Sent to ${quote.customer}.`,
    links: [quoteLink(quote)],
  });
}

export function QuoteDetailPage(props: { quote: QuoteRow }) {
  const quote = props.quote;
  const current = () => quoteRows().find((row) => row.id === quote.id) ?? quote;
  const acceptanceOpen = signal(false);
  const acceptance = () => quoteAcceptance()[quote.id];
  return (
    <View class="min-w-0 flex-1 flex-col bg-background">
      <View class="shrink-0 flex-row items-center gap-4 border-b border-border px-6 py-4">
        <View class="min-w-0 flex-1 gap-0.5">
          <View class="flex-row items-center gap-2.5">
            <Text class="text-[24px] font-semibold text-foreground">{quote.customer}</Text>
            <Badge
              variant={
                current().status === "accepted"
                  ? "success"
                  : current().status === "expired"
                    ? "warning"
                    : current().status === "sent"
                      ? "primary"
                      : "outline"
              }
            >
              <Text
                class="text-[12px] font-medium capitalize"
                style={{
                  color: token(
                    current().status === "accepted"
                      ? "success"
                      : current().status === "expired"
                        ? "warning"
                        : current().status === "sent"
                          ? "accent-foreground"
                          : "muted-foreground",
                  ),
                }}
              >
                {current().status}
              </Text>
            </Badge>
          </View>
          <Text class="text-[14px] text-muted-foreground">
            Prepared by {quote.owner} · {quote.items.length} line{" "}
            {quote.items.length === 1 ? "item" : "items"}
          </Text>
        </View>
        <View class="flex-row items-center gap-2">
          {current().approvalStatus === "pending" ? (
            <Button
              variant="outline"
              size="md"
              testID="approve-quote"
              onPress={() => approveQuote(current())}
            >
              <Icon name="shieldCheck" size={13} tone="warning" />
              <Text class="text-[13px] font-medium">Approve</Text>
            </Button>
          ) : null}
          {current().status === "accepted" ? (
            <Text class="text-[13px] font-medium text-success">Acceptance recorded</Text>
          ) : (
            <Button
              variant="outline"
              size="md"
              testID="quote-accept"
              onPress={() => acceptanceOpen.set(true)}
            >
              <Icon name="checkCheck" size={13} tone="success" />
              <Text class="text-[13px] font-medium">Record acceptance</Text>
            </Button>
          )}
          <Button
            variant="outline"
            size="md"
            testID="quote-preview-pdf"
            onPress={() => quotePdf.set(quote)}
          >
            <Icon name="fileText" size={13} tone="muted-foreground" />
            <Text class="text-[13px] font-medium">PDF preview</Text>
          </Button>
          <Button
            variant="primary"
            size="md"
            testID="quote-send"
            onPress={() => sendQuote(current())}
          >
            <Icon name="send" size={13} tone="primary-foreground" />
            <Text class="text-[13px] font-semibold text-primary-foreground">Send quote</Text>
          </Button>
          <ActionMenu
            testID="quote-work-menu"
            width={210}
            trigger={
              <View
                role="button"
                accessibilityLabel="Quote work actions"
                testID="quote-work-actions"
                class="h-9 w-9 items-center justify-center rounded-md"
                hoverStyle={{ backgroundColor: token("accent") }}
              >
                <Icon name="ellipsis" size={14} tone="muted-foreground" />
              </View>
            }
            groups={[workMenuActions(quoteLink(current()))]}
          />
        </View>
      </View>
      <Scroll class="min-h-0 flex-1" scrollbar={false}>
        <ScreenFade>
          <View class="mx-auto w-full max-w-220 px-6 pt-5">
            <WorkSection link={quoteLink(current())} title="Quote work" limit={3} />
          </View>
          <View class="items-center px-6 py-7">
            <QuoteRecord quote={current()} acceptance={acceptance()} />
          </View>
        </ScreenFade>
      </Scroll>
      <If when={acceptanceOpen()}>
        <QuoteAcceptanceDialog quote={current()} onClose={() => acceptanceOpen.set(false)} />
      </If>
    </View>
  );
}
