import { type KeyEvent, keymap, platform, signal, Storage } from "nsh";

export type ShortcutId = "sidebar" | "search" | "new-message" | "new-quote" | "settings";

export interface ShortcutCommand {
  id: ShortcutId;
  label: string;
  description: string;
  /** Default binding, in `nsh/keymap` notation. */
  binding: string;
}

export const shortcutCommands: ShortcutCommand[] = [
  {
    id: "sidebar",
    label: "Toggle sidebar",
    description: "Collapse or expand the navigation rail.",
    binding: "mod+b",
  },
  {
    id: "search",
    label: "Command search",
    description: "Jump to a conversation, contact, deal, or screen.",
    binding: "mod+k",
  },
  {
    id: "new-message",
    label: "New message",
    description: "Open the new message composer.",
    binding: "mod+n",
  },
  {
    id: "new-quote",
    label: "New quote",
    description: "Open the quote builder.",
    binding: "mod+alt+q",
  },
  {
    id: "settings",
    label: "Open settings",
    description: "Go to workspace settings.",
    binding: "mod+alt+s",
  },
];

const STORAGE_KEY = "intelluxiq.shortcuts.v1";

export const shortcutOverrides = signal<Partial<Record<ShortcutId, string>>>({});
export const recordingShortcut = signal<ShortcutId | null>(null);
export const shortcutError = signal<string | null>(null);

let loaded = false;

export function commandById(id: ShortcutId): ShortcutCommand | undefined {
  return shortcutCommands.find((command) => command.id === id);
}

export function shortcutBinding(id: ShortcutId): string {
  return shortcutOverrides()[id] ?? commandById(id)?.binding ?? "";
}

export function shortcutIsCustom(id: ShortcutId): boolean {
  return shortcutOverrides()[id] !== undefined;
}

export function shortcutLabel(id: ShortcutId): string {
  return bindingLabel(shortcutBinding(id));
}

export function bindingLabel(binding: string): string {
  try {
    return keymap.label(binding);
  } catch {
    return binding;
  }
}

export function isUsableBinding(binding: string): boolean {
  try {
    const dispose = keymap.bind(binding, () => {});
    dispose();
    return true;
  } catch {
    return false;
  }
}

function conflictFor(id: ShortcutId, binding: string): ShortcutCommand | null {
  return (
    shortcutCommands.find(
      (command) => command.id !== id && shortcutBinding(command.id) === binding,
    ) ?? null
  );
}

export function startRecording(id: ShortcutId): void {
  shortcutError.set(null);
  recordingShortcut.set(id);
}

export function stopRecording(): void {
  recordingShortcut.set(null);
  shortcutError.set(null);
}

export function resetShortcut(id: ShortcutId): void {
  const next = { ...shortcutOverrides() };
  delete next[id];
  shortcutOverrides.set(next);
  shortcutError.set(null);
  persist();
}

export function resetAllShortcuts(): void {
  shortcutOverrides.set({});
  shortcutError.set(null);
  persist();
}

const MODIFIER_KEYS = new Set([
  "mod",
  "cmd",
  "command",
  "meta",
  "super",
  "win",
  "ctrl",
  "control",
  "alt",
  "option",
  "opt",
]);

function hasCommandModifier(binding: string): boolean {
  return binding.split("+").some((part) => MODIFIER_KEYS.has(part));
}

export function assignShortcut(id: ShortcutId, rawBinding: string): boolean {
  const binding = rawBinding.trim().toLowerCase();
  if (!hasCommandModifier(binding)) {
    shortcutError.set("Include Ctrl/Cmd or Alt in the shortcut.");
    return false;
  }
  if (!isUsableBinding(binding)) {
    shortcutError.set("That combination is reserved by the system or is not supported.");
    return false;
  }
  const conflict = conflictFor(id, binding);
  if (conflict) {
    shortcutError.set(`${bindingLabel(binding)} is already used by ${conflict.label}.`);
    return false;
  }
  const command = commandById(id);
  const next = { ...shortcutOverrides() };
  if (command && binding === command.binding) delete next[id];
  else next[id] = binding;
  shortcutOverrides.set(next);
  shortcutError.set(null);
  persist();
  return true;
}

export function loadShortcuts(): void {
  if (loaded) return;
  loaded = true;
  void hydrateShortcuts();
}

async function hydrateShortcuts(): Promise<void> {
  try {
    const raw = await Storage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return;
    const parsedNext: Partial<Record<ShortcutId, string>> = {};
    for (const command of shortcutCommands) {
      const value = (parsed as Record<string, unknown>)[command.id];
      if (typeof value !== "string") continue;
      const binding = value.trim().toLowerCase();
      if (hasCommandModifier(binding) && isUsableBinding(binding)) parsedNext[command.id] = binding;
    }
    const next: Partial<Record<ShortcutId, string>> = {};
    const used = new Set(
      shortcutCommands
        .filter((command) => parsedNext[command.id] === undefined)
        .map((command) => command.binding),
    );
    for (const command of shortcutCommands) {
      const binding = parsedNext[command.id];
      if (!binding || used.has(binding)) continue;
      next[command.id] = binding;
      used.add(binding);
    }
    shortcutOverrides.set(next);
  } catch {
    // Storage is optional: a failed read keeps the defaults.
  }
}

function persist(): void {
  void Storage.setItem(STORAGE_KEY, JSON.stringify(shortcutOverrides())).catch(() => {
    // A failed write keeps the in-memory binding for this session.
  });
}

const CODE_KEYS: Record<string, string> = {
  Space: "space",
  Enter: "enter",
  NumpadEnter: "enter",
  Escape: "escape",
  Tab: "tab",
  Backspace: "backspace",
  Delete: "delete",
  Insert: "insert",
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  Home: "home",
  End: "end",
  PageUp: "pageup",
  PageDown: "pagedown",
  Minus: "minus",
  Equal: "plus",
  BracketLeft: "[",
  BracketRight: "]",
  Backslash: "\\",
  Semicolon: ";",
  Quote: "'",
  Comma: ",",
  Period: ".",
  Slash: "/",
  Backquote: "`",
};

const NAMED_KEYS: Record<string, string> = {
  " ": "space",
  Enter: "enter",
  Escape: "escape",
  Tab: "tab",
  Backspace: "backspace",
  Delete: "delete",
  Insert: "insert",
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  Home: "home",
  End: "end",
  PageUp: "pageup",
  PageDown: "pagedown",
};

function keyFor(event: KeyEvent): string | null {
  const code = event.code;
  if (/^Key[A-Z]$/.test(code)) return code.slice(3).toLowerCase();
  if (/^Digit[0-9]$/.test(code)) return code.slice(5);
  if (/^F([1-9]|1[0-9]|2[0-4])$/.test(code)) return code.toLowerCase();
  if (CODE_KEYS[code]) return CODE_KEYS[code];
  if (NAMED_KEYS[event.key]) return NAMED_KEYS[event.key];
  if (event.key.length === 1) return event.key.toLowerCase();
  return null;
}

/**
 * The chord a hardware event asks for, in `nsh/keymap` notation. Modifier-only
 * presses return null. On Apple platforms the platform key maps to `mod`;
 * elsewhere Control does.
 */
export function chordFromKeyEvent(event: KeyEvent): string | null {
  const key = keyFor(event);
  if (!key) return null;
  const apple = platform.os === "macos" || platform.os === "ios";
  const primary = apple ? event.modifiers.platform : event.modifiers.control;
  const secondary = apple ? event.modifiers.control : event.modifiers.platform;
  if (!primary && !secondary && !event.modifiers.alt) return null;
  const parts: string[] = [];
  if (primary) parts.push("mod");
  if (secondary) parts.push(apple ? "ctrl" : "cmd");
  if (event.modifiers.alt) parts.push("alt");
  if (event.modifiers.shift) parts.push("shift");
  parts.push(key);
  return parts.join("+");
}
