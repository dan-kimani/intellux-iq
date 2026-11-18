import { Clipboard, Scroll, signal, Text, token, View } from "nsh";
import { ActivityDialog } from "../../components/ActivityDialog";
import { ActionMenu } from "../../components/ActionMenu";
import { ScreenFade } from "../../components/motion";
import { Avatar, Badge, Button, Icon } from "../../components/ui";
import { conversations } from "../../data";
import { activeNav, activeNavChild, selectedId, showToast } from "../../state";
import { addContactActivity } from "../activity";
import { dealRows } from "../deals/state";
import { quoteBuilderOpen, quoteCustomerPrefill, quoteTab } from "../quotes/state";
import { ContactActivity } from "./ContactActivity";
import { ContactMedia } from "./ContactMedia";
import { ContactQuotes } from "./ContactQuotes";
import { ContactSide } from "./ContactSide";
import type { ContactRow } from "./data";
import { contactDetail } from "./state";

function Stat(props: { label: string; value: string }) {
  return (
    <View class="flex-1 gap-0.5 rounded-lg border border-border bg-panel px-3 py-2.5">
      <Text class="text-[9px] uppercase tracking-wide text-muted-foreground">{props.label}</Text>
      <Text class="text-[15px] font-semibold text-foreground">{props.value}</Text>
    </View>
  );
}

function findConversation(contact: ContactRow) {
  return conversations.find(
    (conversation) => conversation.name.trim().toLowerCase() === contact.name.trim().toLowerCase(),
  );
}

export function ContactPage(props: { contact: ContactRow }) {
  const contact = props.contact;
  const noteOpen = signal(false);
  const deal = () =>
    dealRows().find((row) => row.contact === contact.name || row.company === contact.company);
  const newQuote = () => {
    quoteCustomerPrefill.set({
      customer: contact.company,
      opportunity: deal()?.name ?? `${contact.company} — new opportunity`,
    });
    quoteTab.set("all");
    activeNavChild.set("quotes");
    activeNav.set("Quotes");
    quoteBuilderOpen.set(true);
  };
  const message = () => {
    const thread = findConversation(contact);
    if (!thread) {
      showToast("No conversation linked to this contact.");
      return;
    }
    selectedId.set(thread.id);
    activeNavChild.set("inbox");
    activeNav.set("Inbox");
    contactDetail.set(null);
  };
  return (
    <View class="min-h-0 flex-1 flex-col bg-background" testID="contact-page">
      <View class="shrink-0 border-b border-border px-6 pb-5 pt-4">
        <View class="flex-row items-center gap-2">
          <View
            role="button"
            accessibilityLabel="Back to contacts"
            onPress={() => contactDetail.set(null)}
            class="h-7 flex-row items-center gap-1 rounded-md pr-2"
            hoverStyle={{ backgroundColor: token("accent") }}
            focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
          >
            <Icon name="chevronLeft" size={12} tone="muted-foreground" />
            <Text class="text-[10.5px] font-medium text-muted-foreground">All contacts</Text>
          </View>
          <View class="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            testID="contact-add-note"
            onPress={() => noteOpen.set(true)}
          >
            <Icon name="fileText" size={12} tone="muted-foreground" />
            <Text class="text-[10.5px] font-medium">Add note</Text>
          </Button>
          <Button variant="outline" size="sm" testID="contact-message" onPress={message}>
            <Icon name="messageCircle" size={12} tone="muted-foreground" />
            <Text class="text-[10.5px] font-medium">Message</Text>
          </Button>
          <Button variant="primary" size="sm" testID="contact-new-quote" onPress={newQuote}>
            <Icon name="plus" size={12} tone="primary-foreground" />
            <Text class="text-[10.5px] font-semibold text-primary-foreground">New quote</Text>
          </Button>
          <ActionMenu
            testID="contact-page-more"
            width={220}
            trigger={
              <View
                role="button"
                accessibilityLabel="More contact actions"
                class="h-8 w-8 items-center justify-center rounded-md"
                hoverStyle={{ backgroundColor: token("accent") }}
              >
                <Icon name="ellipsis" size={15} tone="muted-foreground" />
              </View>
            }
            groups={[
              [
                {
                  id: "note",
                  label: "Add note",
                  icon: "fileText",
                  onSelect: () => noteOpen.set(true),
                },
                {
                  id: "task",
                  label: "Create follow-up task",
                  icon: "calendarClock",
                  onSelect: () => noteOpen.set(true),
                },
              ],
              [
                {
                  id: "copy-email",
                  label: "Copy email",
                  icon: "mail",
                  onSelect: () => {
                    void Clipboard.write({ text: contact.email });
                    showToast("Email copied.");
                  },
                },
                {
                  id: "pipeline",
                  label: "Open pipeline",
                  icon: "briefcase",
                  onSelect: () => {
                    activeNavChild.set("deals");
                    activeNav.set("Deals");
                  },
                },
              ],
            ]}
          />
        </View>

        <View class="mt-4 flex-row items-start gap-5">
          <Avatar initials={contact.initials} tone={contact.tone} size={64} online />
          <View class="min-w-0 flex-1 gap-1.5">
            <View class="flex-row items-center gap-2">
              <Text class="text-[26px] font-semibold tracking-tight text-foreground">
                {contact.name}
              </Text>
              <Badge
                variant={
                  contact.status === "active"
                    ? "success"
                    : contact.status === "new"
                      ? "primary"
                      : "warning"
                }
              >
                <Text
                  class="text-[9px] font-medium capitalize"
                  style={{
                    color: token(
                      contact.status === "active"
                        ? "success"
                        : contact.status === "new"
                          ? "info"
                          : "warning",
                    ),
                  }}
                >
                  {contact.status}
                </Text>
              </Badge>
            </View>
            <Text class="text-[12.5px] text-muted-foreground">
              {contact.role} · {contact.company}
            </Text>
            <View class="flex-row items-center gap-1.5">
              <Each of={contact.tags}>
                {(tag: () => string) => (
                  <Badge variant="outline">
                    <Text class="text-[9px] text-muted-foreground">{tag()}</Text>
                  </Badge>
                )}
              </Each>
              <Text class="text-[9.5px] text-muted-foreground">
                Owned by {contact.owner} · {contact.channel}
              </Text>
            </View>
          </View>
          <View class="w-120 flex-row gap-2">
            <Stat label="Lifetime value" value={contact.value} />
            <Stat label="Open deals" value={`${contact.deals}`} />
            <Stat label="Conversations" value={`${contact.conversations}`} />
            <Stat label="Engagement" value={`${contact.score}%`} />
          </View>
        </View>
      </View>

      <Scroll class="min-h-0 flex-1" scrollbar={false}>
        <ScreenFade>
          <View class="flex-row items-start gap-5 p-6">
            <View class="min-w-0 flex-1 gap-5">
              <ContactQuotes contact={contact} />
              <ContactMedia contact={contact} />
              <ContactActivity contact={contact} />
            </View>
            <ContactSide contact={contact} />
          </View>
        </ScreenFade>
      </Scroll>

      <If when={noteOpen()}>
        <ActivityDialog
          title="Add to contact"
          description={`${contact.name} · ${contact.company}`}
          onClose={() => noteOpen.set(false)}
          onSave={(entry) => {
            addContactActivity(contact.id, {
              id: `activity-${Date.now()}`,
              kind: entry.kind,
              text: entry.text,
              meta: entry.meta,
              at: "Just now",
            });
            showToast(entry.kind === "task" ? "Follow-up task created." : "Note added.");
          }}
        />
      </If>
    </View>
  );
}
