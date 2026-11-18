import { expect, test } from "nsh/test";
import { whatsappToHtml } from "./screens/conversation/whatsappHtml";
import { applyWhatsAppFormat } from "./screens/conversation/whatsappFormat";

test("wraps selected WhatsApp text", () => {
  const result = applyWhatsAppFormat("Thank you", { start: 0, end: 5 }, "bold");
  expect(result.text).toBe("*Thank* you");
  expect([result.start, result.end]).toEqual([1, 6]);
});

test("prefixes selected WhatsApp lines", () => {
  const numbered = applyWhatsAppFormat("First\nSecond", { start: 0, end: 12 }, "numbered");
  expect(numbered.text).toBe("1. First\n2. Second");
  const quoted = applyWhatsAppFormat("One line", { start: 0, end: 8 }, "quote");
  expect(quoted.text).toBe("> One line");
});

test("converts WhatsApp markup to transcript HTML", () => {
  const html = whatsappToHtml("Hello *Sarah*\n- one\n- _two_\n> quoted");
  expect(html).toContain("<strong>Sarah</strong>");
  expect(html).toContain("<ul><li>one</li><li><em>two</em></li></ul>");
  expect(html).toContain("<blockquote><p>quoted</p></blockquote>");
});
