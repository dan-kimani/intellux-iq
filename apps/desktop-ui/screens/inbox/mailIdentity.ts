const names: Record<string, string> = {
  "sales@acmetrading.com": "Alex Morgan",
  "support@acmetrading.com": "Support Team",
  "james@northwindretail.com": "James Carter",
  "info@summittraders.com": "Summit Traders",
  "maya@abc.com": "Maya Lin",
  "jonah@harborco.com": "Jonah Reyes",
  "theo@morganhardware.com": "Theo Marsh",
  "sam@verdantfoods.com": "Sam Okafor",
  "finance@abc.com": "Atlas Finance",
  "billing@unknown-supplier.example": "Unknown Supplier",
  "peter@summit.com": "Peter Novak",
};

function titleCase(value: string): string {
  return value
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

/** A display name for an email sender or recipient. */
export function mailPartyName(address: string): string {
  const known = names[address.toLowerCase()];
  if (known) return known;
  const local = address.split("@")[0] ?? address;
  return titleCase(local) || address;
}

export function mailPartyEmail(address: string): string {
  return address;
}

/** Strips reply/forward prefixes so replies group under one thread. */
export function mailThreadKey(subject: string): string {
  return subject
    .replace(/^\s*((re|fw|fwd)\s*:\s*)+/i, "")
    .trim()
    .toLowerCase();
}
