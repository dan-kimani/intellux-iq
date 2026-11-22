import { Text, token, View } from "nsh";
import {
  Avatar,
  Badge,
  Button,
  Icon,
  type IconName,
  SectionTitle,
  Separator,
  StageDot,
  Verified,
  withAlpha,
} from "../../components/ui";
import type { Conversation, OpportunityLink } from "../../data";
import { activeNav, activeNavChild, opportunitiesFor, showToast } from "../../state";
import { contactDetail, contactRows } from "../contacts/state";
import { activeReminderForConversation, openWorkDialog } from "../work/state";
import type { WorkLink } from "../work/types";
import { openOpportunityPanel, openOpportunitiesTab } from "./panelState";

function InfoRow(props: {
  icon: IconName;
  label: string;
  value: string;
  tone?: Parameters<typeof Icon>[0]["tone"];
}) {
  return (
    <View class="flex-row items-center gap-2.5">
      <View class="h-7 w-7 items-center justify-center rounded-md bg-muted">
        <Icon name={props.icon} size={13} tone={props.tone ?? "muted-foreground"} />
      </View>
      <View class="min-w-0 flex-1 gap-0.5">
        <Text class="text-[11px] text-muted-foreground">{props.label}</Text>
        <Text class="text-[13px] font-medium text-foreground" style={{ numberOfLines: 2 }}>
          {props.value}
        </Text>
      </View>
    </View>
  );
}

function slaCopy(minutes: number): string {
  const abs = Math.abs(minutes);
  const time = abs >= 60 ? `${Math.floor(abs / 60)}h ${abs % 60}m` : `${abs}m`;
  return minutes < 0 ? `SLA breached ${time}` : `SLA ${time}`;
}

export function ContactPanel(props: { conversation: Conversation }) {
  const c = props.conversation;
  const workLink = (): WorkLink => ({
    type: "contact",
    id: c.contactId ?? c.id,
    label: c.name,
    detail: `${c.company} · ${c.email}`,
  });
  const opportunities = () => opportunitiesFor(c);
  const reminder = () => activeReminderForConversation(c.id)?.triggerAt;
  return (
    <View class="gap-3">
      <View class="items-center gap-1.5 rounded-xl border border-border bg-card shadow-md px-4 pb-3.5 pt-4">
        <Avatar name={c.name} size={76} online={c.presence !== "offline"} />
        <View class="mt-1 items-center gap-1">
          <View class="flex-row items-center gap-1.5">
            <Text class="text-[18px] font-semibold text-foreground">{c.name}</Text>
            <If when={c.verified}>
              <Verified size={13} />
            </If>
          </View>
          <Text class="text-[12px] text-muted-foreground">{c.company}</Text>
        </View>
        <If when={c.vip}>
          <Badge variant="primary">
            <Icon name="sparkles" size={10} tone="accent-foreground" />
            <Text class="text-[11px] font-semibold text-accent-foreground">VIP Customer</Text>
          </Badge>
        </If>
        <Button
          variant="outline"
          size="sm"
          class="mt-0.5 w-full"
          onPress={() => {
            const match = contactRows().find((row) =>
              c.contactId ? row.id === c.contactId : row.name === c.name,
            );
            if (match) {
              contactDetail.set(match);
              activeNavChild.set("contacts");
              activeNav.set("Contacts");
            } else showToast("No directory record linked.");
          }}
        >
          <Text class="text-[12px] font-medium">View full profile</Text>
          <Icon name="arrowUpRight" size={11} tone="muted-foreground" />
        </Button>

        <View class="mt-1 w-full gap-2.5">
          <Separator />
          <InfoRow icon="phone" label="Phone" value={c.phone} tone="chart-3" />
          <InfoRow icon="mail" label="Email" value={c.email} tone="chart-2" />
          <InfoRow icon="briefcase" label="Location" value={c.location} tone="chart-4" />
        </View>
      </View>

      <View class="gap-2.5 rounded-xl border border-border bg-card shadow-md p-3">
        <View class="flex-row items-center justify-between">
          <View class="flex-row items-center gap-1.5">
            <View
              class="h-6 w-6 items-center justify-center rounded-md"
              style={{ backgroundColor: withAlpha(token("primary"), "26") }}
            >
              <Icon name="sparkles" size={13} tone="highlight" />
            </View>
            <Text class="text-[13px] font-semibold text-foreground">Sales Intelligence</Text>
          </View>
          <Badge variant="success">
            <View class="rounded-full bg-success" style={{ width: 4, height: 4 }} />
            <Text class="text-[11px] font-semibold text-success">{c.interest}</Text>
          </Badge>
        </View>

        <View class="gap-2">
          <View class="flex-row items-center gap-2.5">
            <View
              class="h-6 w-6 items-center justify-center rounded-md"
              style={{ backgroundColor: withAlpha(token("warning"), "1f") }}
            >
              <Icon name="zap" size={12} tone="warning" />
            </View>
            <View class="flex-1">
              <Text class="text-[11px] text-muted-foreground">Response time</Text>
              <Text class="text-[13px] font-medium text-foreground">
                {c.metrics.firstResponseMinutes} min
              </Text>
            </View>
            <Text
              class="text-[11px] font-medium"
              style={{ color: c.slaMinutes < 0 ? token("warning") : token("success") }}
            >
              {slaCopy(c.slaMinutes)}
            </Text>
          </View>

          <View class="flex-row items-center gap-2.5">
            <View
              class="h-6 w-6 items-center justify-center rounded-md"
              style={{ backgroundColor: withAlpha(token("success"), "1f") }}
            >
              <Icon name="gauge" size={12} tone="success" />
            </View>
            <View class="flex-1 gap-1">
              <View class="flex-row items-center justify-between">
                <Text class="text-[11px] text-muted-foreground">Unanswered inbound</Text>
                <Text class="text-[12px] font-semibold text-foreground">
                  {c.metrics.unansweredInboundCount}
                </Text>
              </View>
              <View class="h-1 overflow-hidden rounded-full bg-muted">
                <View
                  class="h-full rounded-full bg-success"
                  style={{ width: `${Math.min(100, c.metrics.unansweredInboundCount * 25)}%` }}
                />
              </View>
            </View>
          </View>

          <View class="flex-row items-center gap-2.5">
            <View
              class="h-6 w-6 items-center justify-center rounded-md"
              style={{ backgroundColor: withAlpha(token("info"), "1f") }}
            >
              <Icon name="calendarClock" size={12} tone="info" />
            </View>
            <View class="flex-1">
              <Text class="text-[11px] text-muted-foreground">Next follow-up</Text>
              <Text class="text-[13px] font-medium text-foreground">
                {reminder() ?? "No reminder scheduled"}
              </Text>
            </View>
            <Icon name="chevronRight" size={11} tone="muted-foreground" />
          </View>
        </View>
        <View class="rounded-md bg-muted px-2.5 py-1.5">
          <Text class="text-[11px] leading-3.5 text-muted-foreground">
            Deterministic signal ·{" "}
            {c.metrics.followUpOverdue
              ? "follow-up overdue; act before the next quiet period"
              : "first response and follow-up cadence are on track"}
          </Text>
        </View>
      </View>

      <View class="gap-2 rounded-xl border border-border bg-card shadow-md p-3">
        <SectionTitle
          action={
            <View class="flex-row items-center gap-1" onPress={openOpportunitiesTab}>
              <Text class="text-[12px] font-medium text-highlight">View all</Text>
              <Icon name="chevronRight" size={10} tone="highlight" />
            </View>
          }
        >
          Linked opportunities
        </SectionTitle>
        <If when={opportunities().length === 0}>
          <Text class="text-[12px] text-muted-foreground">No opportunity linked.</Text>
        </If>
        <Each of={opportunities()}>
          {(deal: () => OpportunityLink) => (
            <View
              role="button"
              accessibilityLabel={`Open ${deal().name} details`}
              onPress={() => openOpportunityPanel(deal().id, c.id)}
              class="flex-row items-center gap-2 rounded-md py-1"
              hoverStyle={{ backgroundColor: token("accent") }}
            >
              <StageDot
                color={
                  deal().stage === "won" ? "green" : deal().stage === "quotation" ? "amber" : "blue"
                }
              />
              <View class="min-w-0 flex-1 gap-0.5">
                <Text class="text-[12px] font-medium text-foreground">{deal().name}</Text>
                <Text class="text-[11px] capitalize text-muted-foreground">{deal().stage}</Text>
              </View>
              <Text class="text-[13px] font-semibold text-foreground">{deal().value}</Text>
              <Icon name="chevronRight" size={10} tone="muted-foreground" />
            </View>
          )}
        </Each>
      </View>

      <View class="gap-2 rounded-xl border border-border bg-card shadow-md p-3">
        <SectionTitle>Quick actions</SectionTitle>
        <View class="grid grid-cols-2 gap-2">
          <Button variant="primary" size="sm" onPress={() => activeNav.set("Quotes")}>
            <Icon name="send" size={12} tone="primary-foreground" />
            <Text class="text-[12px] font-semibold text-primary-foreground">Send quote</Text>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onPress={() => openWorkDialog({ mode: "task", link: workLink() })}
          >
            <Icon name="checkCheck" size={12} tone="muted-foreground" />
            <Text class="text-[12px] font-medium">Add task</Text>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            class="justify-start"
            onPress={() => openWorkDialog({ mode: "activity", link: workLink() })}
          >
            <Icon name="fileText" size={12} tone="muted-foreground" />
            <Text class="text-[12px] font-medium">Log activity</Text>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            class="justify-start"
            onPress={() => openWorkDialog({ mode: "reminder", link: workLink() })}
          >
            <Icon name="calendarClock" size={12} tone="muted-foreground" />
            <Text class="text-[12px] font-medium">Set reminder</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}
