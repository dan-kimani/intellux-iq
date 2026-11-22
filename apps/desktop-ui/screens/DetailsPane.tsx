import { Scroll, Text, token, View } from "nsh";
import { AnimatedSwap, Reveal } from "../components/motion";
import { IconButton } from "../components/ui";
import type { Conversation } from "../data";
import { detailsPanelOpen, opportunitiesFor } from "../state";
import { WorkSection } from "./work/WorkSection";
import { conversationLink } from "./work/links";
import { ContactPanel } from "./details/ContactPanel";
import { InsightsPanel } from "./details/InsightsPanel";
import { OpportunitiesPanel } from "./details/OpportunitiesPanel";
import { OpportunityPanel } from "./details/OpportunityPanel";
import {
  closeOpportunityPanel,
  detailTab,
  type DetailTab,
  opportunityOpenFor,
  panelOpportunityId,
} from "./details/panelState";

const tabs: DetailTab[] = ["contact", "opportunities", "work", "insights"];

const labels: Record<DetailTab, string> = {
  contact: "Contact",
  opportunities: "Opportunities",
  work: "Work",
  insights: "Insights",
};

export function DetailsPane(props: { conversation: Conversation }) {
  const c = props.conversation;
  const opportunityCount = () => opportunitiesFor(c).length;
  const detailOpen = () => opportunityOpenFor(c.id);
  return (
    <View
      testID="details-pane"
      class="relative z-20 w-90 shrink-0 flex-col border-l border-border bg-panel max-[1439px]:absolute max-[1439px]:inset-y-0 max-[1439px]:right-0 max-[1439px]:shadow-2xl"
    >
      <If when={detailOpen()}>
        <View class="h-11 shrink-0 flex-row items-center gap-1 border-b border-border px-2">
          <IconButton
            icon="chevronLeft"
            label="Back to opportunities"
            size={28}
            testID="opportunity-back"
            onPress={closeOpportunityPanel}
          />
          <Text class="min-w-0 flex-1 text-[12px] font-semibold text-foreground">
            Opportunity detail
          </Text>
          <IconButton
            icon="panelRight"
            label="Close contact panel"
            size={28}
            onPress={() => detailsPanelOpen.set(false)}
          />
        </View>
      </If>
      <If when={!detailOpen()}>
        <View class="shrink-0 flex-row items-center border-b border-border px-2">
          <Each of={tabs}>
            {(item: () => DetailTab) => (
              <View
                role="button"
                accessibilityLabel={`${labels[item()]} tab`}
                testID={`details-${item()}`}
                onPress={() => detailTab.set(item())}
                class="relative h-11 flex-1 items-center justify-center"
                hoverStyle={{ opacity: 0.8 }}
                focusVisibleStyle={{
                  outlineWidth: 2,
                  outlineColor: token("ring"),
                  outlineOffset: -2,
                }}
              >
                <View class="flex-row items-center gap-1">
                  <Text
                    class="text-[12px] font-medium"
                    style={{
                      color:
                        detailTab() === item() ? token("foreground") : token("muted-foreground"),
                    }}
                  >
                    {labels[item()]}
                  </Text>
                  <If when={item() === "opportunities" && opportunityCount() > 0}>
                    <Text class="text-[11px] font-semibold text-muted-foreground">
                      {opportunityCount()}
                    </Text>
                  </If>
                </View>
                <If when={detailTab() === item()}>
                  <View class="absolute bottom-0 h-0.5 w-8 rounded-full bg-primary" />
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
      </If>
      <AnimatedSwap
        swapKey={detailOpen() ? `opportunity:${panelOpportunityId()}` : `tab:${detailTab()}`}
        class="relative min-h-0 flex-1"
      >
        {(key) => (
          <Scroll class="h-full min-h-0" scrollbar={false}>
            <View class="p-2.5 pb-6">
              <Reveal>
                <If when={key.startsWith("opportunity:")}>
                  <OpportunityPanel opportunityId={key.slice("opportunity:".length)} />
                </If>
                <If when={!key.startsWith("opportunity:")}>
                  <If when={key === "tab:contact"}>
                    <ContactPanel conversation={c} />
                  </If>
                  <If when={key === "tab:opportunities"}>
                    <OpportunitiesPanel conversation={c} />
                  </If>
                  <If when={key === "tab:insights"}>
                    <InsightsPanel conversation={c} />
                  </If>
                  <If when={key === "tab:work"}>
                    <WorkSection link={conversationLink(c)} title="Linked work" limit={6} />
                  </If>
                </If>
              </Reveal>
            </View>
          </Scroll>
        )}
      </AnimatedSwap>
      <View class="h-2 shrink-0" />
    </View>
  );
}
