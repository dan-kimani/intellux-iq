export type WhatsAppFormat =
  | "bold"
  | "italic"
  | "strike"
  | "monospace"
  | "code"
  | "bullet"
  | "numbered"
  | "quote";

export interface TextSelection {
  start: number;
  end: number;
}

export interface FormatResult {
  text: string;
  start: number;
  end: number;
}

const INLINE_MARKERS: Record<
  Extract<WhatsAppFormat, "bold" | "italic" | "strike" | "monospace" | "code">,
  [string, string]
> = {
  bold: ["*", "*"],
  italic: ["_", "_"],
  strike: ["~", "~"],
  monospace: ["```", "```"],
  code: ["`", "`"],
};

function prefixFor(format: "bullet" | "numbered" | "quote", index: number): string {
  if (format === "bullet") return "- ";
  if (format === "quote") return "> ";
  return `${index + 1}. `;
}

export function applyWhatsAppFormat(
  text: string,
  selection: TextSelection,
  format: WhatsAppFormat,
): FormatResult {
  const from = Math.max(0, Math.min(selection.start, text.length));
  const to = Math.max(from, Math.min(selection.end, text.length));

  if (format === "bullet" || format === "numbered" || format === "quote") {
    const lineStart = text.lastIndexOf("\n", Math.max(0, from - 1)) + 1;
    const nextBreak = text.indexOf("\n", to);
    const lineEnd = nextBreak === -1 ? text.length : nextBreak;
    const block = text.slice(lineStart, lineEnd);
    const lines = block.split("\n");
    const formatted = lines.map((line, index) => `${prefixFor(format, index)}${line}`).join("\n");
    return {
      text: `${text.slice(0, lineStart)}${formatted}${text.slice(lineEnd)}`,
      start: lineStart,
      end: lineStart + formatted.length,
    };
  }

  const [open, close] = INLINE_MARKERS[format];
  const selected = text.slice(from, to);
  return {
    text: `${text.slice(0, from)}${open}${selected}${close}${text.slice(to)}`,
    start: from + open.length,
    end: to + open.length,
  };
}
