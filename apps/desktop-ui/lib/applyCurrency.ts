import { moneyText } from "./money";
import { dealDetail, dealRows } from "../screens/deals/state";
import { quoteDetail, quotePdf, quotePreview, quoteRows } from "../screens/quotes/state";
import { productDetail, productDispatch, productRows } from "../screens/catalog/state";
import { recoveryDetail, recoveryRows } from "../screens/recovery/state";
import { contactDetail, contactRows } from "../screens/contacts/state";

function relabelQuote<
  T extends {
    value: string;
    subtotal: string;
    tax: string;
    total: string;
    items: { price: string; total: string }[];
  },
>(quote: T): T {
  return {
    ...quote,
    value: moneyText(quote.value),
    subtotal: moneyText(quote.subtotal),
    tax: moneyText(quote.tax),
    total: moneyText(quote.total),
    items: quote.items.map((item) => ({
      ...item,
      price: moneyText(item.price),
      total: moneyText(item.total),
    })),
  };
}

export function applyCurrency(): void {
  dealRows.set(dealRows().map((deal) => ({ ...deal, value: moneyText(deal.value) })));
  if (dealDetail()) dealDetail.set({ ...dealDetail()!, value: moneyText(dealDetail()!.value) });

  quoteRows.set(quoteRows().map(relabelQuote));
  if (quoteDetail()) quoteDetail.set(relabelQuote(quoteDetail()!));
  if (quotePdf()) quotePdf.set(relabelQuote(quotePdf()!));
  if (quotePreview()) quotePreview.set(relabelQuote(quotePreview()!));

  productRows.set(
    productRows().map((product) => ({
      ...product,
      price: moneyText(product.price),
      cost: moneyText(product.cost),
    })),
  );
  if (productDetail()) {
    productDetail.set({
      ...productDetail()!,
      price: moneyText(productDetail()!.price),
      cost: moneyText(productDetail()!.cost),
    });
  }
  if (productDispatch()) {
    productDispatch.set({
      ...productDispatch()!,
      price: moneyText(productDispatch()!.price),
      cost: moneyText(productDispatch()!.cost),
    });
  }

  recoveryRows.set(recoveryRows().map((row) => ({ ...row, value: moneyText(row.value) })));
  if (recoveryDetail()) {
    recoveryDetail.set({ ...recoveryDetail()!, value: moneyText(recoveryDetail()!.value) });
  }

  contactRows.set(contactRows().map((row) => ({ ...row, value: moneyText(row.value) })));
  if (contactDetail()) {
    contactDetail.set({ ...contactDetail()!, value: moneyText(contactDetail()!.value) });
  }
}
