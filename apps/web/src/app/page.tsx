import { Download, Plus } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SidebarInset } from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { copy } from "./_dashboard/data";
import { ConversationsTab, DevicesTab, QuotationsTab } from "./_dashboard/tables";
import { IntelligenceTab } from "./_dashboard/intelligence";
import { MetricsGrid, OverviewTab } from "./_dashboard/overview";
import { PipelineTab } from "./_dashboard/pipeline";

const tabValues = new Set([
  "overview",
  "conversations",
  "quotations",
  "devices",
  "pipeline",
  "intelligence",
]);

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const params = await searchParams;
  const requested = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const initialTab = requested && tabValues.has(requested) ? requested : "overview";
  const pageTitle =
    initialTab === "pipeline"
      ? copy.pipeline.title
      : initialTab === "intelligence"
        ? copy.intelligence.title
        : copy.title;
  const pageDescription =
    initialTab === "pipeline"
      ? copy.pipeline.description
      : initialTab === "intelligence"
        ? copy.intelligence.description
        : copy.description;

  return (
    <>
      <AppSidebar />
      <SidebarInset className="min-w-0 overflow-hidden">
        <SiteHeader tab={initialTab} />
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-4 border-b border-border/70 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="gap-1.5 border-amber-600/20 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                >
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  {copy.live}
                </Badge>
                <span className="text-xs text-muted-foreground">{copy.date}</span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{pageTitle}</h1>
              <p className="max-w-2xl text-sm text-muted-foreground">{pageDescription}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download />
                {copy.actions.export}
              </Button>
              <Button size="sm">
                <Plus />
                {copy.actions.newQuote}
              </Button>
            </div>
          </div>

          <MetricsGrid />

          <Tabs defaultValue={initialTab} className="gap-4">
            <TabsList
              variant="line"
              className="w-full justify-start gap-3 overflow-x-auto border-b border-border/70 p-0 scrollbar-none sm:gap-5"
            >
              <TabsTrigger value="overview" className="flex-none px-1 pb-3 text-xs sm:text-sm">
                {copy.tabs.overview}
              </TabsTrigger>
              <TabsTrigger value="conversations" className="flex-none px-1 pb-3 text-xs sm:text-sm">
                {copy.tabs.conversations}
              </TabsTrigger>
              <TabsTrigger value="quotations" className="flex-none px-1 pb-3 text-xs sm:text-sm">
                {copy.tabs.quotations}
              </TabsTrigger>
              <TabsTrigger value="devices" className="flex-none px-1 pb-3 text-xs sm:text-sm">
                {copy.tabs.devices}
              </TabsTrigger>
              <TabsTrigger value="pipeline" className="flex-none px-1 pb-3 text-xs sm:text-sm">
                {copy.tabs.pipeline}
              </TabsTrigger>
              <TabsTrigger value="intelligence" className="flex-none px-1 pb-3 text-xs sm:text-sm">
                {copy.tabs.intelligence}
              </TabsTrigger>
            </TabsList>

            <OverviewTab />
            <ConversationsTab />
            <QuotationsTab />
            <DevicesTab />
            <PipelineTab />
            <IntelligenceTab />
          </Tabs>

          <div className="flex flex-col gap-1 border-t border-border/70 pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>{copy.footer.synced}</span>
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {copy.footer.healthy}
            </span>
          </div>
        </div>
      </SidebarInset>
    </>
  );
}
