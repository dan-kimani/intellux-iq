import { Text, View } from "nsh";
import { AppDialog, DialogActions } from "../../components/overlay";
import { Button, Icon } from "../../components/ui";
import { activeNav, activeNavChild, showToast } from "../../state";
import { openQuote, quotePdf, quotePreview } from "./state";
import { QuoteRecord } from "./QuoteRecord";

export function QuotePdfDialog() {
  const quote = quotePreview();
  if (!quote) return null;
  return (
    <AppDialog
      open={() => true}
      onClose={() => quotePreview.set(null)}
      title={`${quote.id} · PDF`}
      description={`${quote.customer} · ${quote.status} · ${quote.total}`}
      width={840}
      testID="quote-pdf-dialog"
      footer={
        <DialogActions>
          <Button
            variant="ghost"
            size="sm"
            onPress={() => {
              quotePreview.set(null);
              quotePdf.set(null);
              openQuote(quote);
              activeNavChild.set("quotes");
              activeNav.set("Quotes");
              showToast("Quote opened in the Quotes workspace.");
            }}
          >
            <Icon name="arrowUpRight" size={11} tone="muted-foreground" />
            <Text class="text-[12px] font-medium">Open in Quotes</Text>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onPress={() => showToast("Quote queued to the customer by email.")}
          >
            <Icon name="send" size={11} tone="muted-foreground" />
            <Text class="text-[12px] font-medium">Send</Text>
          </Button>
          <Button
            variant="primary"
            size="sm"
            testID="download-quote-pdf-dialog"
            onPress={() => showToast("PDF compiled locally with Typst.")}
          >
            <Icon name="download" size={11} tone="primary-foreground" />
            <Text class="text-[12px] font-semibold text-primary-foreground">Download PDF</Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="items-center">
        <QuoteRecord quote={quote} />
      </View>
    </AppDialog>
  );
}
