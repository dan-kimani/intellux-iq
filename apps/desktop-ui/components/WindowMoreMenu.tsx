import { activeNav, commandOpen, syncOpen } from "../state";
import { newContactOpen, importContactsOpen } from "../screens/contacts/state";
import { newProductOpen } from "../screens/catalog/state";
import { newRuleOpen } from "../screens/automations/state";
import { shortcutLabel } from "../screens/settings/shortcuts";
import { ActionMenu, MenuTrigger } from "./ActionMenu";

export function WindowMoreMenu() {
  return (
    <ActionMenu
      testID="chrome-more-menu"
      trigger={<MenuTrigger label="More" icon="command" testID="chrome-more" tone="avatar-1" />}
      groups={[
        [
          {
            id: "command",
            label: "Command search",
            icon: "search",
            shortcut: () => shortcutLabel("search"),
            onSelect: () => commandOpen.set(true),
          },
          {
            id: "new-contact",
            label: "New contact",
            icon: "users",
            onSelect: () => {
              activeNav.set("Contacts");
              newContactOpen.set(true);
            },
          },
          {
            id: "new-product",
            label: "New product",
            icon: "package",
            onSelect: () => {
              activeNav.set("Catalog");
              newProductOpen.set(true);
            },
          },
          {
            id: "new-automation",
            label: "New automation",
            icon: "workflow",
            onSelect: () => {
              activeNav.set("Automations");
              newRuleOpen.set(true);
            },
          },
        ],
        [
          {
            id: "import-contacts",
            label: "Import contacts",
            icon: "download",
            onSelect: () => {
              activeNav.set("Contacts");
              importContactsOpen.set(true);
            },
          },
          {
            id: "sync-outbox",
            label: "Sync & outbox",
            icon: "checkCheck",
            onSelect: () => syncOpen.set(true),
          },
        ],
        [
          {
            id: "settings",
            label: "Workspace settings",
            icon: "settings",
            onSelect: () => activeNav.set("Settings"),
          },
        ],
      ]}
    />
  );
}
