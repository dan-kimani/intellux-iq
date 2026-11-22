import { Text, View } from "nsh";
import { Button, Icon } from "../components/ui";
import { analyticsExportOpen } from "./analytics/state";
import { AnalyticsDialogs } from "./analytics/AnalyticsDialogs";
import { PageActions, PageShell } from "./PageShell";
import { KpiRow } from "./analytics/KpiRow";
import { LeadSources } from "./analytics/LeadSources";
import { PeriodTabs } from "./analytics/PeriodTabs";
import { PipelineOverview } from "./analytics/PipelineOverview";
import { SalesTrend } from "./analytics/SalesTrend";
import { InsightsCard, RecentActivity, TopProducts } from "./analytics/SidePanels";
import { TeamPerformance } from "./analytics/TeamPerformance";

export function AnalyticsScreen() {
  return (
    <>
      <PageShell
        title="Analytics"
        description="Track performance, find opportunities, and grow revenue."
        testID="screen-analytics"
        actions={
          <PageActions>
            <PeriodTabs />
            <Button variant="outline" size="sm" onPress={() => analyticsExportOpen.set(true)}>
              <Icon name="download" size={12} tone="muted-foreground" />
              <Text class="text-[12px] font-medium">Export</Text>
            </Button>
          </PageActions>
        }
      >
        <KpiRow />
        <View class="flex-row items-stretch gap-3">
          <View class="h-full min-w-0 flex-1">
            <SalesTrend />
          </View>
          <LeadSources />
        </View>
        <View class="flex-row items-stretch gap-3">
          <PipelineOverview />
          <TeamPerformance />
        </View>
        <View class="flex-row items-stretch gap-3">
          <RecentActivity />
          <TopProducts />
          <InsightsCard />
        </View>
      </PageShell>
      <AnalyticsDialogs />
    </>
  );
}
