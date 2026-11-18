const ones = [
  "",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];
const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function underHundred(value: number): string {
  if (value < 20) return ones[value] ?? "";
  const remainder = value % 10;
  return `${tens[Math.floor(value / 10)]}${remainder ? `-${ones[remainder]}` : ""}`;
}

function underThousand(value: number): string {
  const hundreds = Math.floor(value / 100);
  const remainder = value % 100;
  const parts: string[] = [];
  if (hundreds) parts.push(`${ones[hundreds]} hundred`);
  if (remainder) parts.push(underHundred(remainder));
  return parts.join(" ");
}

function group(value: number): string {
  const scales: [number, string][] = [
    [1_000_000_000, "billion"],
    [1_000_000, "million"],
    [1_000, "thousand"],
  ];
  let remaining = value;
  const parts: string[] = [];
  for (const [scale, label] of scales) {
    if (remaining >= scale) {
      const count = Math.floor(remaining / scale);
      parts.push(`${underThousand(count)} ${label}`);
      remaining %= scale;
    }
  }
  if (remaining) parts.push(underThousand(remaining));
  return parts.join(" ");
}

export function amountInWords(amount: string): string {
  const value = Number.parseInt(amount.replace(/[^\d]/g, ""), 10);
  if (!Number.isFinite(value) || value <= 0) return "Zero shillings only";
  return `${group(value).replace(/^./, (char) => char.toUpperCase())} shillings only`;
}
