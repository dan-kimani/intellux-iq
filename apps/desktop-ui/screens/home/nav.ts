import { activeNav, activeNavChild, type NavItem } from "../../state";

export function navTo(
  page: Extract<NavItem, "Deals" | "Quotes" | "Inbox" | "Analytics" | "Recovery" | "Tasks">,
  child: string,
): void {
  activeNavChild.set(child);
  activeNav.set(page);
}
