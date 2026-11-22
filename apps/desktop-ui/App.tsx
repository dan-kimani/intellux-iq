import {
  effect,
  mount,
  reduceMotion,
  setColorScheme,
  signal,
  Storage,
  Text,
  untracked,
  View,
} from "nsh";
import { AnimatedSwap } from "./components/motion";
import { isAvailable } from "nsh/desktop";
import "./fonts";
import { AssignmentDialog } from "./components/AssignmentDialog";
import { ChannelConnectDialog } from "./components/ChannelConnectDialog";
import { CommandPalette } from "./components/CommandPalette";
import { AttachmentViewer } from "./files/AttachmentViewer";
import { SaveAttachmentDialog } from "./files/SaveAttachmentDialog";
import { GlobalDialogs } from "./components/GlobalDialogs";
import { InboxDialogs } from "./components/InboxDialogs";
import { LinkOpportunityDialog } from "./components/LinkOpportunityDialog";
import { LostOpportunityDialog } from "./components/LostOpportunityDialog";
import { DealDialog } from "./screens/deals/DealDetail";
import { ConfirmDialogHost } from "./components/ConfirmationDialog";
import { DealDragLayer } from "./screens/deals/DragLayer";
import { appViewport } from "./components/viewport";
import { applyCurrency } from "./lib/applyCurrency";
import { currencyOptions } from "./lib/money";
import { workspace } from "./screens/settings/state";
import { dealDetail } from "./screens/deals/state";
import { WorkDialog } from "./screens/work/WorkDialog";
import { TaskOutcomeDialog } from "./screens/tasks/TaskOutcomeDialog";
import { OpportunityCreateDialog } from "./components/OpportunityCreateDialog";
import { OpportunityEditDialog } from "./components/OpportunityEditDialog";
import { LockScreen } from "./components/LockScreen";
import { MailDialog } from "./components/MailDialogs";
import { ReminderDialog } from "./components/ReminderDialog";
import { SyncDialog } from "./components/SyncDialog";
import { TagDialog } from "./components/TagDialog";
import { Sidebar } from "./components/Sidebar";
import { ShortcutHost } from "./components/ShortcutHost";
import { WatchDock } from "./components/WatchDock";
import { WindowChrome, windowMode } from "./components/WindowChrome";
import { WindowResizeHandles } from "./components/WindowResizeHandles";

import { AnalyticsScreen } from "./screens/Analytics";
import { HomeScreen } from "./screens/Home";
import { TasksScreen } from "./screens/Tasks";
import { AutomationsScreen } from "./screens/Automations";
import { CatalogScreen } from "./screens/Catalog";
import { ContactsScreen } from "./screens/Contacts";
import { DealsScreen } from "./screens/Deals";
import { QuotesScreen } from "./screens/Quotes";
import { QuoteDialogs } from "./screens/quotes/QuoteDialogs";
import { QuotePdfDialog } from "./screens/quotes/QuotePdfDialog";
import { quotePreview } from "./screens/quotes/state";
import { taskOutcomeId, workDialog } from "./screens/work/state";
import { WorkNotifications } from "./screens/work/WorkNotifications";
import { RecoveryScreen } from "./screens/Recovery";
import { SegmentsScreen } from "./screens/Segments";
import { SettingsScreen } from "./screens/Settings";
import {
  activeNav,
  assignmentDialogOpen,
  channelConnectOpen,
  editOpportunityOpen,
  linkOpportunityOpen,
  online,
  reminderDialogOpen,
  tagDialogOpen,
  toastMessage,
} from "./state";
import { lostOpportunityId, newOpportunityOpen } from "./screens/opportunities/state";
import { InboxWorkspace } from "./screens/InboxWorkspace";

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
        <Text class="text-[12px] font-medium text-popover-foreground">{toastMessage()}</Text>
      </View>
    </If>
  );
}

function workspaceScreen(page: string) {
  switch (page) {
    case "Home":
      return <HomeScreen />;
    case "Tasks":
      return <TasksScreen />;
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
    default:
      return <HomeScreen />;
  }
}

function Workspace() {
  return (
    <AnimatedSwap swapKey={activeNav()} class="relative min-h-0 flex-1">
      {(key) => workspaceScreen(key)}
    </AnimatedSwap>
  );
}

function App() {
  effect(() => {
    if (!workspace().currency) return;
    untracked(applyCurrency);
  });
  return (
    <View
      testID="app-frame"
      onLayout={(event) => appViewport.set(event.bounds.size)}
      class={`relative h-full w-full flex-col overflow-hidden bg-background ${
        isAvailable && windowMode() === "normal" ? "rounded-lg border border-border" : ""
      }`}
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
              <Text class="text-[11px] font-medium text-warning">
                Offline mode — reads, drafts, quotes, and the outbox stay local.
              </Text>
            </View>
          </If>
          <Workspace />
        </View>
      </View>
      <DealDragLayer />
      <GlobalDialogs />
      <ConfirmDialogHost />
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
      <If when={newOpportunityOpen()}>
        <OpportunityCreateDialog />
      </If>
      <If when={lostOpportunityId()}>
        <LostOpportunityDialog />
      </If>
      <QuoteDialogs />
      <If when={quotePreview()}>
        <QuotePdfDialog />
      </If>
      <If when={dealDetail()}>
        <DealDialog />
      </If>
      <If when={workDialog()}>
        <WorkDialog />
      </If>
      <If when={taskOutcomeId()}>
        <TaskOutcomeDialog taskId={taskOutcomeId()!} onClose={() => taskOutcomeId.set(null)} />
      </If>
      <WorkNotifications />
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
      <WatchDock />
      <LockScreen />
      <Toast />
      <WindowResizeHandles />
    </View>
  );
}

void Storage.getItem("intellux.currency").then((value) => {
  if (value && (currencyOptions as readonly string[]).includes(value)) {
    workspace.set({ ...workspace(), currency: value as (typeof currencyOptions)[number] });
  }
  return undefined;
});

setColorScheme("dark");
mount(App);
