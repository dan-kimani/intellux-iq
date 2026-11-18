import { View } from "nsh";
import { sidebarCollapsed } from "../state";
import {
  navSections,
  navTopItems,
  standaloneIsActive,
  type NavModule,
  type NavSection,
} from "./nav-config";
import { CollapsedNav } from "./SidebarFlyout";
import { Group, ModuleRow } from "./SidebarGroup";

export function SidebarNav() {
  return (
    <If
      when={sidebarCollapsed()}
      else={
        <View class="gap-2">
          <View class="gap-0.5 border-b border-border pb-2">
            <Each of={navTopItems}>
              {(module: () => NavModule) => (
                <ModuleRow module={module()} active={standaloneIsActive(module())} indent={false} />
              )}
            </Each>
          </View>
          <Each of={navSections}>{(section: () => NavSection) => <Group group={section()} />}</Each>
        </View>
      }
    >
      <CollapsedNav />
    </If>
  );
}
