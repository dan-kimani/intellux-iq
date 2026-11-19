import { signal, Text, token, View } from "nsh";
import { ActionMenu } from "../../components/ActionMenu";
import { StageMenu, StageStep } from "./OpportunityParts";
import { Badge, Button, Icon } from "../../components/ui";
import { stageIndex, stageLabel, stageLabels } from "../../domain/stages";
import type { Conversation, OpportunityLink } from "../../data";
import {
  editOpportunityOpen,
  editingOpportunityId,
  linkOpportunityOpen,
  opportunitiesFor,
  reminderDialogOpen,
  showToast,
} from "../../state";
import { currentMember } from "../../state/inbox";
import {
  createQuoteFromOpportunity,
  makePrimary,
  openPipelineForOpportunity,
  openQuoteForOpportunity,
  quoteForOpportunity,
  opportunityMeta,
  opportunityOwnerOptions,
  setOpportunityOwner,
  setOpportunityStage,
  unlinkConversationOpportunity,
} from "../opportunities/actions";

export function PipelineStrip(props: { conversation: Conversation }) {
  const opportunities = () => opportunitiesFor(props.conversation);
  const selectedId = signal(opportunities()[0]?.id ?? "");
  const selected = () =>
    opportunities().find((item) => item.id === selectedId()) ?? opportunities()[0];

  if (opportunities().length === 0) {
    return (
      <View class="shrink-0 flex-row items-center gap-2 border-b border-border bg-background px-5 py-3">
        <Icon name="briefcase" size={13} tone="muted-foreground" />
        <View class="min-w-0 flex-1 gap-0.5">
          <Text class="text-[10.5px] font-medium text-foreground">No opportunity linked</Text>
          <Text class="text-[9px] text-muted-foreground">
            Conversations can carry zero, one, or several opportunities.
          </Text>
        </View>
        <Button
          variant="outline"
          size="sm"
          testID="link-opportunity-empty"
          onPress={() => linkOpportunityOpen.set(true)}
        >
          <Icon name="plus" size={10} tone="muted-foreground" />
          <Text class="text-[9.5px] font-medium">Link opportunity</Text>
        </Button>
      </View>
    );
  }

  const changeStage = (stage: OpportunityLink["stage"]) => {
    const opportunity = selected();
    if (!opportunity) return;
    const moved = setOpportunityStage(opportunity.id, stage);
    if (moved) showToast(`Opportunity moved to ${stageLabel(moved.stage)}.`);
  };

  return (
    <View class="shrink-0 gap-2 border-b border-border bg-background px-5 py-2.5">
      <View class="flex-row items-center gap-2">
        <View class="flex-row items-center gap-1.5">
          <Text class="text-[8.5px] font-semibold uppercase tracking-wide text-muted-foreground">
            Opportunities
          </Text>
          <Badge variant="outline">
            <Text class="text-[8px] text-muted-foreground">{opportunities().length}</Text>
          </Badge>
        </View>
        <ActionMenu
          testID="opportunity-switcher"
          width={300}
          trigger={
            <View
              role="button"
              accessibilityLabel={`Selected opportunity ${selected()?.name}`}
              testID="opportunity-switcher"
              class="h-6 max-w-60 flex-row items-center gap-1 rounded border border-border px-2"
              hoverStyle={{ backgroundColor: token("accent") }}
            >
              <Text
                class="min-w-0 flex-1 truncate text-[8.5px] font-medium text-foreground"
                style={{ numberOfLines: 1 }}
              >
                {selected()?.name}
              </Text>
              <Icon name="chevronDown" size={9} tone="muted-foreground" />
            </View>
          }
          groups={[
            opportunities().map((opportunity) => ({
              id: `switch-${opportunity.id}`,
              label: opportunity.name,
              icon: "briefcase" as const,
              disabled: opportunity.id === selectedId(),
              onSelect: () => selectedId.set(opportunity.id),
            })),
          ]}
        />
        <If when={selectedId() === opportunities()[0]?.id}>
          <Text class="shrink-0 text-[8px] font-medium uppercase tracking-wide text-muted-foreground">
            Primary
          </Text>
        </If>
        <View class="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          class="shrink-0"
          testID="link-opportunity"
          onPress={() => linkOpportunityOpen.set(true)}
        >
          <Icon name="plus" size={10} tone="muted-foreground" />
          <Text class="text-[9.5px] font-medium">Link</Text>
        </Button>
      </View>

      <View class="flex-row items-start gap-4">
        <View class="min-w-0 flex-1 overflow-hidden">
          <View class="flex-row items-center gap-2">
            <Text class="text-[12px] font-semibold text-foreground" style={{ numberOfLines: 1 }}>
              {selected()?.name}
            </Text>
            <Badge
              variant={
                selected()?.stage === "won"
                  ? "success"
                  : selected()?.stage === "lost"
                    ? "warning"
                    : "primary"
              }
            >
              <Text class="text-[8px] font-medium capitalize text-accent-foreground">
                {selected()?.stage}
              </Text>
            </Badge>
          </View>
          <View class="mt-0.5 flex-row items-center gap-2">
            <Text class="text-[11px] font-semibold text-foreground">{selected()?.value}</Text>
            <Text class="text-[9px] text-muted-foreground">
              {selected()?.probability}% · {selected()?.owner}
            </Text>
            <If when={opportunityMeta(selected()?.id ?? "")}>
              <Text class="text-[9px] text-muted-foreground">
                · {opportunityMeta(selected()?.id ?? "")}
              </Text>
            </If>
          </View>
        </View>

        <View class="shrink-0 flex-row items-center gap-1.5 pt-0.5">
          <Button
            variant="primary"
            size="sm"
            testID="opportunity-create-quote"
            onPress={() => {
              if (selected()) createQuoteFromOpportunity(props.conversation, selected()!);
            }}
          >
            <Icon name="fileText" size={10} tone="primary-foreground" />
            <Text class="text-[9.5px] font-semibold text-primary-foreground">Create quote</Text>
          </Button>
          <StageMenu opportunity={selected()!} onChange={changeStage} />
          <ActionMenu
            testID="opportunity-actions"
            width={240}
            trigger={
              <View
                role="button"
                accessibilityLabel="More opportunity actions"
                testID="opportunity-more"
                class="h-7 w-7 items-center justify-center rounded-md border border-border"
                hoverStyle={{ backgroundColor: token("accent") }}
              >
                <Icon name="ellipsis" size={13} tone="muted-foreground" />
              </View>
            }
            groups={[
              [
                {
                  id: "pipeline",
                  label: "Open in Pipeline",
                  icon: "arrowUpRight",
                  onSelect: () => openPipelineForOpportunity(selected()!.id),
                },
                {
                  id: "quote",
                  label: "Open linked quote",
                  icon: "fileText",
                  disabled: !quoteForOpportunity(selected()?.id ?? ""),
                  onSelect: () => openQuoteForOpportunity(selected()!.id),
                },
                {
                  id: "edit",
                  label: "Edit value & probability",
                  icon: "settings",
                  onSelect: () => {
                    editingOpportunityId.set(selected()!.id);
                    editOpportunityOpen.set(true);
                  },
                },
                {
                  id: "follow-up",
                  label: "Create follow-up",
                  icon: "calendarClock",
                  onSelect: () => reminderDialogOpen.set(true),
                },
                {
                  id: "primary",
                  label: "Set as primary",
                  icon: "check",
                  disabled: selectedId() === opportunities()[0]?.id,
                  onSelect: () => {
                    makePrimary(props.conversation, selected()!.id);
                    selectedId.set(selected()!.id);
                    showToast("Primary opportunity updated.");
                  },
                },
              ],
              opportunityOwnerOptions().map((owner) => ({
                id: `owner-${owner}`,
                label: `${owner}${owner === currentMember.name ? " · you" : ""}`,
                icon: "users" as const,
                disabled: selected()?.owner === owner,
                onSelect: () => {
                  setOpportunityOwner(selected()!.id, owner);
                  showToast(`Opportunity owner changed to ${owner}.`);
                },
              })),
              [
                {
                  id: "unlink",
                  label: "Unlink from conversation",
                  icon: "close",
                  danger: true,
                  onSelect: () => {
                    const remaining = opportunities().filter(
                      (opportunity) => opportunity.id !== selected()!.id,
                    );
                    unlinkConversationOpportunity(props.conversation, selected()!.id);
                    if (remaining[0]) selectedId.set(remaining[0].id);
                    showToast("Opportunity unlinked.");
                  },
                },
              ],
            ]}
          />
        </View>
      </View>
      <View class="relative flex-row items-start">
        <View class="absolute left-6 right-6 top-2.5 h-px bg-border" />
        <Each of={stageLabels}>
          {(stage: () => (typeof stageLabels)[number], index: () => number) => (
            <StageStep
              label={stage().label}
              index={index()}
              current={stageIndex(selected()?.stage ?? "enquiry")}
            />
          )}
        </Each>
      </View>
    </View>
  );
}
