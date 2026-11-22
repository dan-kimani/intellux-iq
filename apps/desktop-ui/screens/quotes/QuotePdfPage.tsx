import { signal, Text, token, View } from "nsh";
import { Button, Icon } from "../../components/ui";
import { showToast } from "../../state";
import { PageActions, PageShell } from "../PageShell";
import type { QuoteRow } from "./data";
import { quotePdf } from "./state";
import { QuoteDocument } from "./QuoteDocument";

export function QuotePdfPage(props: { quote: QuoteRow }) {
  const quote = props.quote;
  const zoom = signal(100);
  const width = () => (zoom() === 75 ? 640 : zoom() === 125 ? 900 : 760);
  return (
    <PageShell
      title="Quote PDF"
      description={`${quote.id} · ${quote.customer} · Classic template · A4`}
      testID="quote-pdf-page"
      actions={
        <PageActions>
          <Button
            variant="ghost"
            size="sm"
            testID="quote-pdf-back"
            onPress={() => quotePdf.set(null)}
          >
            <Icon name="chevronLeft" size={12} tone="muted-foreground" />
            <Text class="text-[12px] font-medium">Back to quote</Text>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onPress={() => showToast("Quote queued to the customer by email.")}
          >
            <Icon name="send" size={11} tone="muted-foreground" />
            <Text class="text-[12px] font-medium">Send</Text>
          </Button>
          <Button variant="outline" size="sm" onPress={() => showToast("Print dialog opened.")}>
            <Icon name="printer" size={11} tone="muted-foreground" />
            <Text class="text-[12px] font-medium">Print</Text>
          </Button>
          <Button
            variant="primary"
            size="sm"
            testID="download-quote-pdf"
            onPress={() => showToast("PDF compiled locally with Typst.")}
          >
            <Icon name="download" size={11} tone="primary-foreground" />
            <Text class="text-[12px] font-semibold text-primary-foreground">Download PDF</Text>
          </Button>
        </PageActions>
      }
    >
      <View class="gap-3">
        <View class="flex-row items-center justify-between rounded-lg border border-border bg-panel px-3 py-2">
          <View class="flex-row items-center gap-2">
            <View class="h-6 items-center justify-center rounded-md border border-border bg-card px-2">
              <Text class="text-[11px] font-medium text-foreground">Classic</Text>
            </View>
            <Text class="text-[11px] text-muted-foreground">Template</Text>
            <View class="h-4 w-px bg-border" />
            <Icon name="chevronLeft" size={11} tone="muted-foreground" />
            <Text class="text-[11px] font-medium text-foreground">Page 1 of 1</Text>
            <Icon name="chevronRight" size={11} tone="muted-foreground" />
          </View>
          <View class="flex-row items-center gap-1">
            <View
              role="button"
              accessibilityLabel="Zoom out"
              onPress={() => zoom.set(Math.max(75, zoom() - 25))}
              class="h-6 w-6 items-center justify-center rounded border border-border"
              hoverStyle={{ backgroundColor: token("accent") }}
            >
              <Text class="text-[13px] text-muted-foreground">−</Text>
            </View>
            <Text class="w-10 text-center text-[11px] font-medium text-foreground">{zoom()}%</Text>
            <View
              role="button"
              accessibilityLabel="Zoom in"
              onPress={() => zoom.set(Math.min(125, zoom() + 25))}
              class="h-6 w-6 items-center justify-center rounded border border-border"
              hoverStyle={{ backgroundColor: token("accent") }}
            >
              <Text class="text-[13px] text-muted-foreground">+</Text>
            </View>
            <View class="h-4 w-px bg-border" />
            <View
              role="button"
              accessibilityLabel="Fit page to width"
              onPress={() => zoom.set(100)}
              class="h-6 items-center justify-center rounded border border-border px-2"
              hoverStyle={{ backgroundColor: token("accent") }}
            >
              <Text class="text-[11px] text-muted-foreground">Fit width</Text>
            </View>
          </View>
        </View>

        <QuoteDocument quote={quote} width={width} />
      </View>
    </PageShell>
  );
}
