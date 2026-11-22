import type { QuoteRow } from "./data";

export interface CustomerMeta {
  email: string;
  phone: string;
  address: string;
  contact: string;
}

const customers: Record<string, CustomerMeta> = {
  "Atlas Enterprises": {
    email: "maya@abc.com",
    phone: "+1 415 555 0132",
    address: "Atlas Enterprises, Brooklyn, New York",
    contact: "Maya Lin",
  },
  "Harbor & Co.": {
    email: "jonah@harborco.com",
    phone: "+44 20 7946 0184",
    address: "Harbor & Co., London",
    contact: "Jonah Reyes",
  },
  "TechWorld Ltd": {
    email: "grace@techworld.com",
    phone: "+1 212 555 0199",
    address: "TechWorld Ltd, Brooklyn Navy Yard, New York",
    contact: "Grace Chen",
  },
  "Global Retail Co.": {
    email: "accounts@globalretail.com",
    phone: "+1 312 555 0110",
    address: "Global Retail Co., Chicago",
    contact: "James Carter",
  },
  "Northwind Retail": {
    email: "james@northwindretail.com",
    phone: "+1 617 555 0907",
    address: "Northwind Retail, Boston",
    contact: "James Carter",
  },
  "Lumen Interiors": {
    email: "nora@lumeninteriors.com",
    phone: "+1 646 555 0224",
    address: "Lumen Interiors, New York",
    contact: "Nora Vance",
  },
};

export function customerFor(quote: QuoteRow): CustomerMeta {
  return (
    customers[quote.customer] ?? {
      email: "accounts@customer.com",
      phone: "+1 212 555 0000",
      address: `${quote.customer}, New York`,
      contact: quote.customer,
    }
  );
}

export interface QuoteStep {
  label: string;
  at: string;
  done: boolean;
  active: boolean;
}

export function quoteSteps(quote: QuoteRow): QuoteStep[] {
  const sent = quote.status === "sent" || quote.status === "accepted" || quote.status === "expired";
  const viewed = quote.viewed !== "—";
  const accepted = quote.status === "accepted";
  return [
    { label: "Quote created", at: quote.issued, done: true, active: false },
    {
      label: quote.approvalStatus === "pending" ? "Approval requested" : "Approved",
      at: quote.approvalStatus === "pending" ? "Pending manager review" : "Policy checked",
      done: quote.approvalStatus !== "pending",
      active: quote.approvalStatus === "pending",
    },
    {
      label: "Sent to customer",
      at: sent ? "Sent from sales@acmetrading.com" : "Not sent yet",
      done: sent,
      active: sent && !viewed,
    },
    {
      label: "Viewed by customer",
      at: viewed ? quote.viewed : "Waiting for the first view",
      done: viewed,
      active: viewed && !accepted,
    },
    {
      label: accepted ? "Accepted" : "Awaiting acceptance",
      at: quote.acceptedAt !== "—" ? quote.acceptedAt : quote.validUntil,
      done: accepted,
      active: accepted,
    },
  ];
}

export const quoteTemplate = "Classic";
export const quoteCurrency = "USD";

export interface QuoteAcceptance {
  reference: string;
  note: string;
  by: string;
  at: string;
}
