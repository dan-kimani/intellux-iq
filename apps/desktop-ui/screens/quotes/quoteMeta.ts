import type { QuoteRow } from "./data";

export interface CustomerMeta {
  email: string;
  phone: string;
  address: string;
  contact: string;
}

const customers: Record<string, CustomerMeta> = {
  "ABC Enterprises": {
    email: "sarah@abc.co.ke",
    phone: "+254 712 345 678",
    address: "ABC Enterprises, Westlands, Nairobi",
    contact: "Sarah Wanjiku",
  },
  "Ochieng & Sons": {
    email: "david@ochiengsons.co.ke",
    phone: "+254 733 201 884",
    address: "Ochieng & Sons, Kisumu",
    contact: "David Ochieng",
  },
  "TechWorld Ltd": {
    email: "grace@techworld.co.ke",
    phone: "+254 701 552 019",
    address: "TechWorld Ltd, Industrial Area, Nairobi",
    contact: "Grace Wanjiku",
  },
  "Global Retail KE": {
    email: "accounts@globalretail.co.ke",
    phone: "+254 722 848 110",
    address: "Global Retail KE, Nakuru",
    contact: "James Kamau",
  },
  "Kamau Retail": {
    email: "james@kamauretail.co.ke",
    phone: "+254 710 442 907",
    address: "Kamau Retail, Thika",
    contact: "James Kamau",
  },
  "Atieno Interiors": {
    email: "mary@atienointeriors.co.ke",
    phone: "+254 799 310 224",
    address: "Atieno Interiors, Nairobi",
    contact: "Mary Atieno",
  },
};

export function customerFor(quote: QuoteRow): CustomerMeta {
  return (
    customers[quote.customer] ?? {
      email: "accounts@customer.co.ke",
      phone: "+254 700 000 000",
      address: `${quote.customer}, Nairobi`,
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
      at: sent ? "Sent from sales@acmetrading.co.ke" : "Not sent yet",
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
export const quoteCurrency = "KES";

export interface QuoteAcceptance {
  reference: string;
  note: string;
  by: string;
  at: string;
}
