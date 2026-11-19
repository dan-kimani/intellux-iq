import { effect, mount, reduceMotion, setColorScheme, signal, Text, View } from "nsh";
import { AssignmentDialog } from "./components/AssignmentDialog";
import { ChannelConnectDialog } from "./components/ChannelConnectDialog";
import { ChannelRail } from "./components/ChannelRail";
import { CommandPalette } from "./components/CommandPalette";
import { AttachmentViewer } from "./files/AttachmentViewer";
import { SaveAttachmentDialog } from "./files/SaveAttachmentDialog";
import { GlobalDialogs } from "./components/GlobalDialogs";
import { InboxDialogs } from "./components/InboxDialogs";
import { LinkOpportunityDialog } from "./components/LinkOpportunityDialog";
import { OpportunityEditDialog } from "./components/OpportunityEditDialog";
import { LockScreen } from "./components/LockScreen";
import { MailDialog } from "./components/MailDialogs";
import { ReminderDialog } from "./components/ReminderDialog";
import { SyncDialog } from "./components/SyncDialog";
import { TagDialog } from "./components/TagDialog";
import { InboxList } from "./components/InboxList";
import { Sidebar } from "./components/Sidebar";
import { ShortcutHost } from "./components/ShortcutHost";
import { WindowChrome, WindowResizeHandles } from "./components/WindowChrome";

import type { Conversation } from "./data";
import { AnalyticsScreen } from "./screens/Analytics";
import { AutomationsScreen } from "./screens/Automations";
import { CatalogScreen } from "./screens/Catalog";
import { ContactsScreen } from "./screens/Contacts";
import { ConversationPane } from "./screens/ConversationPane";
import { DealsScreen } from "./screens/Deals";
import { DetailsPane } from "./screens/DetailsPane";
import { MailWorkspace } from "./screens/inbox/MailWorkspace";
import { QuotesScreen } from "./screens/Quotes";
import { RecoveryScreen } from "./screens/Recovery";
import { SegmentsScreen } from "./screens/Segments";
import { SettingsScreen } from "./screens/Settings";
import {
  activeNav,
  allConversations,
  assignmentDialogOpen,
  channelConnectOpen,
  channelFilter,
  detailsPanelOpen,
  editOpportunityOpen,
  linkOpportunityOpen,
  online,
  reminderDialogOpen,
  selectedId,
  tagDialogOpen,
  toastMessage,
} from "./state";

function InboxWorkspace() {
  return (
    <View class="min-h-0 flex-1 flex-row overflow-hidden">
      <ChannelRail />
      <InboxList />
      <If when={channelFilter() === "email"}>
        <MailWorkspace />
      </If>
      <If when={channelFilter() !== "email"}>
        <Each of={allConversations()}>
          {(conversation: () => Conversation) => (
            <If when={selectedId() === conversation().id}>
              <ConversationPane conversation={conversation()} />
            </If>
          )}
        </Each>
        <Each of={allConversations()}>
          {(conversation: () => Conversation) => (
            <If when={selectedId() === conversation().id}>
              <If when={detailsPanelOpen()}>
                <DetailsPane conversation={conversation()} />
              </If>
            </If>
          )}
        </Each>
      </If>
    </View>
  );
}

function Toast() {
  const entered = signal(false);
  effect(() => {
    if (!toastMessage()) {
      entered.set(false);
      return;
    }
    entered.set(false);
    const timer = setTimeout(() => entered.set(true), 16);
    return () => clearTimeout(timer);
  });
  return (
    <If when={toastMessage()}>
      <View
        class="absolute bottom-6 flex-row items-center gap-2 rounded-lg border border-border bg-popover px-3.5 py-2.5 shadow-lg"
        style={{
          left: "50%",
          opacity: entered() ? 1 : 0,
          transform: entered()
            ? "translateX(-50%) translateY(0px)"
            : "translateX(-50%) translateY(6px)",
          pointerEvents: "none",
          transitionProperty: "opacity, transform",
          transitionDuration: reduceMotion() ? 0 : 160,
          transitionTimingFunction: "ease-out",
        }}
        android={{ accessibilityLiveRegion: "polite" }}
      >
        <View class="rounded-full bg-success" style={{ width: 6, height: 6 }} />
        <Text class="text-[10.5px] font-medium text-popover-foreground">{toastMessage()}</Text>
      </View>
    </If>
  );
}

function Workspace() {
  return (
    <View class="min-h-0 flex-1">
      {() => {
        switch (activeNav()) {
          case "Inbox":
            return <InboxWorkspace />;
          case "Recovery":
            return <RecoveryScreen />;
          case "Contacts":
            return <ContactsScreen />;
          case "Deals":
            return <DealsScreen />;
          case "Quotes":
            return <QuotesScreen />;
          case "Catalog":
            return <CatalogScreen />;
          case "Analytics":
            return <AnalyticsScreen />;
          case "Automations":
            return <AutomationsScreen />;
          case "Segments":
            return <SegmentsScreen />;
          case "Settings":
            return <SettingsScreen />;
        }
      }}
    </View>
  );
}

function App() {
  return (
    <View
      class="relative h-full w-full flex-col overflow-hidden bg-background"
      style={{ width: "100%", height: "100%" }}
    >
      <WindowChrome />
      <ShortcutHost />
      <View class="min-h-0 flex-1 flex-row overflow-hidden">
        <Sidebar />
        <View class="min-w-0 flex-1 flex-col">
          <If when={!online()}>
            <View class="h-7 shrink-0 flex-row items-center justify-center gap-2 border-b border-warning/30 bg-warning/10">
              <View class="h-1.5 w-1.5 rounded-full bg-warning" />
              <Text class="text-[9.5px] font-medium text-warning">
                Offline mode — reads, drafts, quotes, and the outbox stay local.
              </Text>
            </View>
          </If>
          <Workspace />
        </View>
      </View>
      <GlobalDialogs />
      <InboxDialogs />
      <If when={assignmentDialogOpen()}>
        <AssignmentDialog />
      </If>
      <If when={tagDialogOpen()}>
        <TagDialog />
      </If>
      <If when={linkOpportunityOpen()}>
        <LinkOpportunityDialog />
      </If>
      <If when={editOpportunityOpen()}>
        <OpportunityEditDialog />
      </If>
      <If when={channelConnectOpen()}>
        <ChannelConnectDialog />
      </If>
      <If when={reminderDialogOpen()}>
        <ReminderDialog />
      </If>
      <MailDialog />
      <AttachmentViewer />
      <SaveAttachmentDialog />
      <CommandPalette />
      <SyncDialog />
      <LockScreen />
      <Toast />
      <WindowResizeHandles />
    </View>
  );
}

setColorScheme("dark");
mount(App);
