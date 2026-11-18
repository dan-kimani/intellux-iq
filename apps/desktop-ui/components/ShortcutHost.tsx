import { effect, keymap } from "nsh";
import { quoteBuilderOpen } from "../screens/quotes/state";
import {
  loadShortcuts,
  recordingShortcut,
  shortcutBinding,
  shortcutCommands,
  type ShortcutId,
} from "../screens/settings/shortcuts";
import {
  activeNav,
  activeNavChild,
  commandOpen,
  locked,
  newMessageOpen,
  sidebarCollapsed,
} from "../state";

function runShortcut(id: ShortcutId): void {
  if (locked()) return;
  switch (id) {
    case "sidebar":
      sidebarCollapsed.set(!sidebarCollapsed());
      break;
    case "search":
      commandOpen.set(true);
      break;
    case "new-message":
      newMessageOpen.set(true);
      break;
    case "new-quote":
      activeNav.set("Quotes");
      activeNavChild.set(null);
      quoteBuilderOpen.set(true);
      break;
    case "settings":
      activeNav.set("Settings");
      activeNavChild.set(null);
      break;
  }
}

/**
 * Binds the configurable shortcuts with `nsh/keymap`, so the platform owns
 * conflict handling and the labels shown in menus. Recordings suspend every
 * binding, which lets the Settings recorder capture a chord without firing it.
 */
export function ShortcutHost() {
  loadShortcuts();
  effect(() => {
    if (recordingShortcut() || commandOpen()) return;
    const disposers: Array<() => void> = [];
    for (const command of shortcutCommands) {
      const run = () => runShortcut(command.id);
      try {
        disposers.push(keymap.bind(shortcutBinding(command.id), run));
      } catch {
        disposers.push(keymap.bind(command.binding, run));
      }
    }
    return () => {
      for (const dispose of disposers) dispose();
    };
  });
  return null;
}
