import { expect, test } from "nsh/test";
import { initialsOf, toneForName } from "./lib/avatar";

test("derives avatar labels from the person's name", () => {
  expect(initialsOf("Maya Lin")).toBe("ML");
  expect(initialsOf("Alex Morgan")).toBe("AM");
  expect(initialsOf("Priya Shah")).toBe("PS");
  expect(initialsOf("Cher")).toBe("CH");
  expect(initialsOf("Global Retail Co.")).toBe("GR");
  expect(initialsOf("TechWorld Ltd")).toBe("TE");
});

test("derives a stable colored tone from the person's name", () => {
  const tones = ["Maya Lin", "Alex Morgan", "Jonah Reyes"].map(toneForName);
  expect(tones.every((tone) => tone !== "slate")).toBe(true);
  expect(toneForName("Maya Lin")).toBe(toneForName("Maya Lin"));
});
