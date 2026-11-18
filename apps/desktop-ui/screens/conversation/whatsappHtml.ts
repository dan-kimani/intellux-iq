function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function inlineHtml(value: string): string {
  const codes: string[] = [];
  let html = escapeHtml(value);
  html = html.replace(/```([\s\S]+?)```/g, (_, code: string) => {
    codes.push(code);
    return `\uE000${codes.length - 1}\uE001`;
  });
  html = html.replace(/`([^`\n]+)`/g, (_, code: string) => {
    codes.push(code);
    return `\uE000${codes.length - 1}\uE001`;
  });
  html = html
    .replace(/\*([^*\n]+)\*/g, "<strong>$1</strong>")
    .replace(/_([^_\n]+)_/g, "<em>$1</em>")
    .replace(/~([^~\n]+)~/g, "<del>$1</del>");
  return html.replace(/\uE000(\d+)\uE001/g, (_, index: string) => {
    const code = codes[Number(index)] ?? "";
    return `<code>${code}</code>`;
  });
}

export function whatsappToHtml(text: string): string {
  const lines = text.replaceAll("\r\n", "\n").split("\n");
  const blocks: string[] = [];
  let list: "ul" | "ol" | null = null;
  let quote: string[] = [];

  const closeList = () => {
    if (list) {
      blocks.push(`</${list}>`);
      list = null;
    }
  };
  const closeQuote = () => {
    if (quote.length > 0) {
      blocks.push(`<blockquote>${quote.map((line) => `<p>${line}</p>`).join("")}</blockquote>`);
      quote = [];
    }
  };

  for (const line of lines) {
    const bullet = /^[-*]\s+(.*)$/.exec(line);
    const numbered = /^\d+\.\s+(.*)$/.exec(line);
    const quoted = /^>\s?(.*)$/.exec(line);

    if (bullet) {
      closeQuote();
      if (list !== "ul") {
        closeList();
        list = "ul";
        blocks.push("<ul>");
      }
      blocks.push(`<li>${inlineHtml(bullet[1] ?? "")}</li>`);
      continue;
    }
    if (numbered) {
      closeQuote();
      if (list !== "ol") {
        closeList();
        list = "ol";
        blocks.push("<ol>");
      }
      blocks.push(`<li>${inlineHtml(numbered[1] ?? "")}</li>`);
      continue;
    }
    closeList();
    if (quoted) {
      quote.push(inlineHtml(quoted[1] ?? ""));
      continue;
    }
    closeQuote();
    if (line.trim()) blocks.push(`<p>${inlineHtml(line)}</p>`);
  }
  closeList();
  closeQuote();
  return blocks.join("") || "<p></p>";
}
