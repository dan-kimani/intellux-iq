import { signal as createSignal, Text, token, View } from "nsh";
import { Badge, Button, Icon, SectionTitle, withAlpha } from "../../components/ui";
import { TextField } from "../../components/forms";
import type { Conversation } from "../../data";
import { stageLabel } from "../../domain/stages";
import {
  advanceOpportunity,
  assignmentDialogOpen,
  composerPrefill,
  dismissedSignals,
  dismissSignal,
  opportunitiesFor,
  reminderDialogOpen,
  showToast,
} from "../../state";
import { buildSignals, severityStyles, type InboxSignal } from "./signals";
import { activeReminderForConversation } from "../work/state";

function Metric(props: { label: string; value: string; warning?: boolean }) {
  return (
    <View class="gap-0.5 rounded-lg bg-muted p-2.5">
      <Text class="text-[11px] text-muted-foreground">{props.label}</Text>
      <Text
        class="text-[16px] font-semibold tabular-nums"
        style={{ color: props.warning ? token("warning") : token("foreground") }}
      >
        {props.value}
      </Text>
    </View>
  );
}

function SignalRow(props: {
  signal: InboxSignal;
  conversation: Conversation;
  onDismiss: () => void;
}) {
  const signal = props.signal;
  const style = severityStyles[signal.severity];
  return (
    <View class="gap-2 rounded-lg border border-border bg-panel p-2.5">
      <View class="flex-row items-start gap-2">
        <View
          class="mt-0.5 h-6 w-6 items-center justify-center rounded-md"
          style={{ backgroundColor: withAlpha(token(style.tone), "1f") }}
        >
          <Icon name="zap" size={12} tone={style.tone} />
        </View>
        <View class="min-w-0 flex-1 gap-0.5">
          <View class="flex-row items-center gap-1.5">
            <Text class="flex-1 text-[12px] font-medium text-foreground">{signal.title}</Text>
            <Badge variant={signal.severity === "urgent" ? "warning" : "outline"}>
              <Text class="text-[11px] font-medium" style={{ color: token(style.tone) }}>
                {style.label}
              </Text>
            </Badge>
          </View>
          <Text class="text-[11px] leading-3.75 text-muted-foreground">{signal.evidence}</Text>
          <Text class="text-[11px] text-muted-foreground">
            {signal.owner} · {signal.age} · {signal.rule}
          </Text>
        </View>
      </View>
      <View class="flex-row flex-wrap gap-1.5">
        <View
          role="button"
          accessibilityLabel="Draft a reply"
          onPress={() => {
            composerPrefill.set(
              `Hi ${props.conversation.name.split(" ")[0]}, following up on this now.`,
            );
            showToast("Draft reply ready in the composer.");
          }}
          class="h-6 items-center justify-center rounded border border-border px-2"
          hoverStyle={{ backgroundColor: token("accent") }}
        >
          <Text class="text-[11px] font-medium text-foreground">Reply</Text>
        </View>
        <View
          role="button"
          accessibilityLabel="Reassign conversation"
          onPress={() => assignmentDialogOpen.set(true)}
          class="h-6 items-center justify-center rounded border border-border px-2"
          hoverStyle={{ backgroundColor: token("accent") }}
        >
          <Text class="text-[11px] font-medium text-foreground">Reassign</Text>
        </View>
        <View
          role="button"
          accessibilityLabel="Create follow-up"
          onPress={() => reminderDialogOpen.set(true)}
          class="h-6 items-center justify-center rounded border border-border px-2"
          hoverStyle={{ backgroundColor: token("accent") }}
        >
          <Text class="text-[11px] font-medium text-foreground">Follow up</Text>
        </View>
        <If when={signal.rule === "opportunity_inactive"}>
          <View
            role="button"
            accessibilityLabel="Advance opportunity"
            onPress={() => {
              const opportunity = opportunitiesFor(props.conversation)[0];
              if (!opportunity) return;
              const moved = advanceOpportunity(opportunity.id);
              if (moved) showToast(`${opportunity.id} advanced to ${stageLabel(moved.stage)}.`);
            }}
            class="h-6 items-center justify-center rounded border border-border px-2"
            hoverStyle={{ backgroundColor: token("accent") }}
          >
            <Text class="text-[11px] font-medium text-foreground">Advance</Text>
          </View>
        </If>
        <View
          role="button"
          accessibilityLabel="Dismiss signal"
          onPress={props.onDismiss}
          class="h-6 items-center justify-center rounded border border-border px-2"
          hoverStyle={{ backgroundColor: token("accent") }}
        >
          <Text class="text-[11px] font-medium text-muted-foreground">Dismiss</Text>
        </View>
      </View>
    </View>
  );
}

export function InsightsPanel(props: { conversation: Conversation }) {
  const c = props.conversation;
  const primary = () => opportunitiesFor(c)[0];
  const signals = () => buildSignals(c).filter((signal) => !dismissedSignals().includes(signal.id));
  const dismissing = createSignal<string | null>(null);
  const reason = createSignal("");
  const reminder = () => activeReminderForConversation(c.id)?.triggerAt;
  return (
    <View class="gap-3">
      <View class="gap-3 rounded-xl border border-border bg-card shadow-md p-4">
        <View class="flex-row items-center gap-2">
          <View
            class="h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: withAlpha(token("primary"), "26") }}
          >
            <Icon name="gauge" size={16} tone="highlight" />
          </View>
          <View class="flex-1 gap-0.5">
            <Text class="text-[14px] font-semibold text-foreground">Conversation metrics</Text>
            <Text class="text-[11px] text-muted-foreground">
              First response, unanswered, follow-ups, age
            </Text>
          </View>
          <Badge variant={c.slaMinutes < 0 ? "warning" : "success"}>
            <Text
              class="text-[11px] font-semibold"
              style={{ color: token(c.slaMinutes < 0 ? "warning" : "success") }}
            >
              {c.slaMinutes < 0 ? "SLA breached" : "Within SLA"}
            </Text>
          </Badge>
        </View>
        <View class="grid grid-cols-2 gap-2">
          <Metric label="First response" value={`${c.metrics.firstResponseMinutes}m`} />
          <Metric
            label="Unanswered inbound"
            value={`${c.metrics.unansweredInboundCount}`}
            warning={c.metrics.unansweredInboundCount > 0}
          />
          <Metric
            label="Follow-ups"
            value={`${c.metrics.followUpsCompleted}/${c.metrics.followUpsDue}`}
            warning={c.metrics.followUpOverdue}
          />
          <Metric label="Conversation age" value={`${c.metrics.ageDays}d`} />
        </View>
        <View class="flex-row items-center justify-between border-t border-border pt-2">
          <Text class="text-[11px] text-muted-foreground">
            Last inbound {c.metrics.lastInboundAt} · outbound {c.metrics.lastOutboundAt}
          </Text>
          <Text class="text-[11px] text-muted-foreground">{c.metrics.responseGapCount} gaps</Text>
        </View>
        <View class="flex-row items-center justify-between">
          <Text class="text-[11px] text-muted-foreground">
            {primary() ? `${primary()?.name} · ${primary()?.stage}` : "No opportunity linked"}
          </Text>
          <Text class="text-[11px] font-medium text-foreground">{primary()?.value ?? "—"}</Text>
        </View>
        <If when={reminder()}>
          <View class="flex-row items-center gap-1.5">
            <Icon name="calendarClock" size={10} tone="warning" />
            <Text class="text-[11px] text-muted-foreground">Reminder: {reminder()}</Text>
          </View>
        </If>
      </View>

      <View class="gap-2 rounded-xl border border-border bg-card shadow-md p-3">
        <View class="flex-row items-center justify-between">
          <SectionTitle>Open signals</SectionTitle>
          <Badge variant={signals().length > 0 ? "warning" : "success"}>
            <Text
              class="text-[11px] font-medium"
              style={{ color: token(signals().length > 0 ? "warning" : "success") }}
            >
              {signals().length} open
            </Text>
          </Badge>
        </View>
        <If when={signals().length === 0}>
          <View class="items-center gap-1 py-5">
            <Icon name="checkCheck" size={16} tone="success" />
            <Text class="text-[12px] font-medium text-foreground">No open signals</Text>
            <Text class="text-center text-[11px] text-muted-foreground">
              Responses, follow-ups, and opportunity activity are on track.
            </Text>
          </View>
        </If>
        <Each of={signals()}>
          {(signal: () => InboxSignal) => (
            <SignalRow
              signal={signal()}
              conversation={c}
              onDismiss={() => {
                dismissing.set(signal().id);
                reason.set("");
              }}
            />
          )}
        </Each>
        <If when={dismissing()}>
          <View class="gap-2 rounded-lg border border-warning/30 bg-warning/5 p-2.5">
            <Text class="text-[11px] font-medium text-foreground">
              Dismiss with a reason (managers only)
            </Text>
            <TextField
              label="Reason"
              value={reason}
              onChange={reason.set}
              placeholder="Reviewed with the customer"
              testID="dismiss-reason"
            />
            <View class="flex-row justify-end gap-1.5">
              <Button variant="ghost" size="sm" onPress={() => dismissing.set(null)}>
                <Text class="text-[11px] font-medium">Cancel</Text>
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!reason().trim()}
                testID="confirm-dismiss"
                onPress={() => {
                  if (!dismissing() || !reason().trim()) return;
                  dismissSignal(dismissing()!);
                  showToast("Signal dismissed with reason.");
                  dismissing.set(null);
                  reason.set("");
                }}
              >
                <Text class="text-[11px] font-semibold text-primary-foreground">Dismiss</Text>
              </Button>
            </View>
          </View>
        </If>
        <Text class="text-[11px] leading-3.5 text-muted-foreground">
          Deterministic rules run on conversation events. No AI dependency.
        </Text>
      </View>
    </View>
  );
}
