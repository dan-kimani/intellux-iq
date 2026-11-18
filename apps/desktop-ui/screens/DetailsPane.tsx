import { Scroll, signal, Text, token, View } from "nsh";
import { IconButton } from "../components/ui";
import type { Conversation } from "../data";
import { detailsPanelOpen } from "../state";
import { ActivityPanel } from "./details/ActivityPanel";
import { ContactPanel } from "./details/ContactPanel";
import { InsightsPanel } from "./details/InsightsPanel";

type DetailTab = "Contact" | "Insights" | "Activity";

const tabs: DetailTab[] = ["Contact", "Insights", "Activity"];

export function DetailsPane(props: { conversation: Conversation }) {
  const tab = signal<DetailTab>("Contact");
  return (
    <View class="w-83 shrink-0 flex-col border-l border-border bg-panel max-[1359px]:hidden">
      <View class="shrink-0 flex-row items-center border-b border-border px-3">
        <Each of={tabs}>
          {(item: () => DetailTab) => (
            <View
              role="button"
              accessibilityLabel={`${item()} tab`}
              testID={`details-${item().toLowerCase()}`}
              onPress={() => tab.set(item())}
              class="relative h-11 flex-1 items-center justify-center"
              hoverStyle={{ opacity: 0.8 }}
              focusVisibleStyle={{
                outlineWidth: 2,
                outlineColor: token("ring"),
                outlineOffset: -2,
              }}
            >
              <Text
                class="text-[12.5px] font-medium"
                style={{
                  color: tab() === item() ? token("foreground") : token("muted-foreground"),
                }}
              >
                {item()}
              </Text>
              <If when={tab() === item()}>
                <View class="absolute bottom-0 h-0.5 w-10 rounded-full bg-primary" />
              </If>
            </View>
          )}
        </Each>
        <IconButton
          icon="panelRight"
          label="Close contact panel"
          size={28}
          onPress={() => detailsPanelOpen.set(false)}
        />
      </View>
      <Scroll class="flex-1 min-h-0">
        <View class="p-2.5">
          <If when={tab() === "Contact"}>
            <ContactPanel conversation={props.conversation} />
          </If>
          <If when={tab() === "Insights"}>
            <InsightsPanel conversation={props.conversation} />
          </If>
          <If when={tab() === "Activity"}>
            <ActivityPanel conversation={props.conversation} />
          </If>
        </View>
      </Scroll>
    </View>
  );
}
