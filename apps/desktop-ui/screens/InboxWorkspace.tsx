import { effect, signal, View } from "nsh";
import { AnimatedSwap, Reveal, ScreenFade } from "../components/motion";
import { appViewport } from "../components/viewport";
import { ChannelRail } from "../components/ChannelRail";
import { InboxList } from "../components/InboxList";
import { MailFolderRail } from "../components/MailFolderRail";
import type { Conversation } from "../data";
import { ConversationPane } from "./ConversationPane";
import { DetailsPane } from "./DetailsPane";
import { MailWorkspace } from "./inbox/MailWorkspace";
import { allConversations, channelFilter, detailsPanelOpen, selectedId } from "../state";
import { mailReadingOpen } from "./inbox/mailState";

const detailsInitialized = signal(false);

export function InboxWorkspace() {
  effect(() => {
    const width = appViewport().width;
    if (!width) return;
    if (!detailsInitialized()) {
      detailsInitialized.set(true);
      detailsPanelOpen.set(width >= 1440);
    } else if (width < 1440) {
      detailsPanelOpen.set(false);
    }
  });
  return (
    <View class="relative min-h-0 flex-1 flex-row overflow-hidden">
      <ScreenFade class="relative min-h-0 flex-1 flex-row overflow-hidden">
        <ChannelRail />
        <If when={channelFilter() === "email"}>
          <Reveal class="h-full min-h-0 flex-row" from="bottom">
            <MailFolderRail />
          </Reveal>
        </If>
        <InboxList />
        <If when={channelFilter() !== "email" || mailReadingOpen()}>
          <AnimatedSwap
            swapKey={channelFilter() === "email" ? "email" : "chat"}
            class="relative min-h-0 flex-1"
            duration={220}
          >
            {(key) =>
              key === "email" ? (
                <Reveal class="h-full min-h-0 flex-row" from="bottom">
                  <MailWorkspace />
                </Reveal>
              ) : (
                <View class="h-full min-h-0 flex-row">
                  <Each of={allConversations()}>
                    {(conversation: () => Conversation) => (
                      <If when={selectedId() === conversation().id}>
                        <Reveal class="min-h-0 flex-1 flex-row" from="bottom">
                          <ConversationPane conversation={conversation()} />
                          <If when={detailsPanelOpen()}>
                            <DetailsPane conversation={conversation()} />
                          </If>
                        </Reveal>
                      </If>
                    )}
                  </Each>
                </View>
              )
            }
          </AnimatedSwap>
        </If>
      </ScreenFade>
    </View>
  );
}
