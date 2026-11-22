import type { AvatarTone } from "../data";

const tones: AvatarTone[] = ["violet", "blue", "green", "amber", "rose"];

const legalSuffix = /^(ltd|inc|llc|co|corp|company)\.?$/i;

export function initialsOf(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => part && !legalSuffix.test(part));
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function toneForName(name: string): AvatarTone {
  let hash = 0;
  for (const char of name.trim().toLowerCase()) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return tones[hash % tones.length];
}
