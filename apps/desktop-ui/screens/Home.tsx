import { Scroll, View } from "nsh";
import { ScreenFade } from "../components/motion";
import { UpcomingActivities } from "./home/activities";
import { PipelineSnapshot } from "./home/pipeline";
import { HomeHeader } from "./home/heading";
import { KeyInsights } from "./home/insights";
import { KpiStrip } from "./home/kpis";
import { MyDay } from "./home/myday";
import { SalesPerformance } from "./home/performance";
import { TeamPerformance } from "./home/team";

export function HomeScreen() {
  return (
    <View class="min-h-0 flex-1 flex-col bg-background" testID="screen-home">
      <Scroll class="min-h-0 flex-1" scrollbar={false}>
        <ScreenFade>
          <View class="gap-3.5 p-5" testID="home-dashboard">
            <HomeHeader />
            <KpiStrip />
            <View class="grid grid-cols-2 gap-3 min-[1440px]:grid-cols-4">
              <View class="col-span-2 min-w-0">
                <SalesPerformance />
              </View>
              <MyDay />
              <PipelineSnapshot />
            </View>
            <View class="grid grid-cols-2 gap-3 min-[1440px]:grid-cols-4">
              <View class="col-span-2 min-w-0">
                <KeyInsights />
              </View>
              <UpcomingActivities />
              <TeamPerformance />
            </View>
          </View>
        </ScreenFade>
      </Scroll>
    </View>
  );
}
