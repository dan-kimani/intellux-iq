"use client";

import { messages } from "@intelluxiq/i18n";
import {
  BriefcaseBusiness,
  Building2,
  Cable,
  ChevronsUpDown,
  CircleHelp,
  FileText,
  Inbox,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  type LucideIcon,
  MonitorSmartphone,
  Orbit,
  ScrollText,
  Settings,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const nav = messages.en.nav;
const copy = messages.en.dashboard;

type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const groups: NavGroup[] = [
  {
    label: nav.workspace,
    items: [
      { title: nav.overview, href: "/", icon: LayoutDashboard },
      { title: nav.inbox, href: "#inbox", icon: Inbox, badge: "12" },
      { title: nav.contacts, href: "#contacts", icon: Users },
      { title: nav.quotations, href: "#quotations", icon: FileText },
      { title: nav.pipeline, href: "/?tab=pipeline", icon: BriefcaseBusiness },
    ],
  },
  {
    label: nav.operations,
    items: [
      { title: nav.devices, href: "#devices", icon: MonitorSmartphone, badge: "2" },
      { title: nav.channels, href: "#channels", icon: Cable },
      { title: nav.templates, href: "#templates", icon: LayoutTemplate },
      { title: nav.audit, href: "#audit", icon: ScrollText },
      { title: nav.intelligence, href: "/?tab=intelligence", icon: Sparkles },
    ],
  },
  {
    label: nav.system,
    items: [
      { title: nav.settings, href: "#settings", icon: Settings },
      { title: nav.help, href: "#help", icon: CircleHelp },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "overview";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="gap-3 border-b border-sidebar-border/70 pb-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="IntelluxIQ">
              <Link href="/" className="gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white">
                  <Orbit className="size-4" />
                </span>
                <span className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate text-sm font-semibold">IntelluxIQ</span>
                  <span className="truncate text-xs text-muted-foreground">{copy.tagline}</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="sm"
                  className="border border-sidebar-border bg-card data-[state=open]:bg-muted"
                >
                  <Building2 className="text-orange-500" />
                  <span className="truncate font-medium">{copy.workspace}</span>
                  <ChevronsUpDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Workspace</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Building2 className="text-orange-500" />
                  <span className="grid">
                    <span>{copy.workspace}</span>
                    <span className="text-xs text-muted-foreground">{copy.workspaceMeta}</span>
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>Create workspace</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0 py-2">
        {groups.map((group, index) => (
          <div key={group.label}>
            {index > 0 ? <SidebarSeparator className="my-2" /> : null}
            <SidebarGroup className="py-1">
              <SidebarGroupLabel className="text-[10px] font-medium tracking-[0.14em] uppercase">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.href === "/"
                        ? pathname === "/" && activeTab === "overview"
                        : item.href === `/?tab=${activeTab}`;

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.title}
                          className="h-8"
                        >
                          <Link href={item.href}>
                            <Icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                        {item.badge ? <SidebarMenuBadge>{item.badge}</SidebarMenuBadge> : null}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/70 pt-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-orange-100 text-xs font-medium text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
                      YN
                    </AvatarFallback>
                  </Avatar>
                  <span className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate text-sm font-medium">{copy.user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {copy.user.email}
                    </span>
                  </span>
                  <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <span className="block text-sm font-medium">{copy.user.name}</span>
                  <span className="block text-xs text-muted-foreground">{copy.user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserRound />
                  {copy.user.profile}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings />
                  {copy.user.settings}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut />
                  {copy.user.signOut}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
