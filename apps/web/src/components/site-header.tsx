import { messages } from "@intelluxiq/i18n";
import { Bell, CircleHelp, Search } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const copy = messages.en.dashboard;

export function SiteHeader({ tab = "overview" }: { tab?: string }) {
  const activeTab = copy.tabs[tab as keyof typeof copy.tabs] ?? copy.tabs.overview;

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border/80 bg-background/90 px-4 backdrop-blur-sm md:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />

      <Breadcrumb className="hidden sm:block">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">{copy.workspace}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{activeTab}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="relative mx-2 hidden min-w-0 flex-1 sm:block">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label={copy.searchPlaceholder}
          placeholder={copy.searchPlaceholder}
          className="h-9 w-full max-w-2xl rounded-full border-border/80 bg-muted/50 pl-9 text-sm shadow-none"
        />
        <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded border border-border/80 bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground lg:inline">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <Badge
          variant="outline"
          className="hidden gap-1.5 border-border/80 bg-card/50 text-muted-foreground sm:inline-flex"
        >
          <span className="size-1.5 rounded-full bg-emerald-500" />
          {copy.environment}
        </Badge>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={copy.help}>
              <CircleHelp />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{copy.help}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={copy.notifications}>
              <span className="relative">
                <Bell />
                <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-amber-500" />
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{copy.notifications}</TooltipContent>
        </Tooltip>

        <div className="hidden items-center gap-2 pl-1 lg:flex">
          <Avatar className="size-7">
            <AvatarFallback className="bg-orange-100 text-[10px] font-medium text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
              YN
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">Yasir Noori</span>
        </div>
      </div>
    </header>
  );
}
