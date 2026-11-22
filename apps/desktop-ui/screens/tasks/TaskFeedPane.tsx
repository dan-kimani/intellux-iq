import { Scroll, View } from "nsh";
import { Reveal } from "../../components/motion";
import { ActivityFeed, ReminderFeed } from "./WorkFeeds";

export function TaskFeedPane(props: { tab: "activity" | "reminders" }) {
  return (
    <Scroll class="min-h-0 flex-1" scrollbar={false}>
      <Reveal>
        <View class="p-6">
          <If when={props.tab === "activity"} else={<ReminderFeed />}>
            <ActivityFeed />
          </If>
        </View>
      </Reveal>
    </Scroll>
  );
}
