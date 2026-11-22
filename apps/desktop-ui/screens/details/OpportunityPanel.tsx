import { Text, token, View } from "nsh";
import { ActionMenu } from "../../components/ActionMenu";
import { Badge, Button, Icon } from "../../components/ui";
import { stageIndex, stageLabel, stageLabels } from "../../domain/stages";
import {
  allConversations,
  canEditOpportunity,
  currentMember,
  editOpportunityOpen,
  editingOpportunityId,
  showToast,
} from "../../state";
import { openPipelineForOpportunity, setOpportunityStage } from "../opportunities/actions";
import { createQuoteFromOpportunity, quoteForOpportunity } from "../opportunities/quotes";
import { previewQuote } from "../quotes/state";
import { opportunityDetailFor, type OpportunityDetail } from "../opportunities/detail";
import {
  StageMenu,
  StageStep,
  stageBadgeColor,
  stageBadgeVariant,
} from "../opportunities/OpportunityParts";
import { requestLostReason } from "../opportunities/state";
import { workMenuActions } from "../work/actions";
import { WorkSection } from "../work/WorkSection";
import type { WorkLink } from "../work/types";
import { FilesSection, LinkedConversationsSection, SourceMessageSection } from "./OpportunityLinks";
import {
  Fact,
  HistorySection,
  ProductsSection,
  QuotesSection,
  weightedValue,
} from "./OpportunitySections";

export function OpportunityPanel(props: { opportunityId: string }) {
  const detail = () => opportunityDetailFor(props.opportunityId);
  const workLink = (): WorkLink => ({
    type: "opportunity",
    id: props.opportunityId,
    label: detail()?.name ?? props.opportunityId,
    detail: detail() ? `${detail()!.company} · ${detail()!.value}` : "Opportunity",
  });
  const quote = () => quoteForOpportunity(props.opportunityId);
  const link = () => {
    const row = detail()!;
    return {
      id: row.id,
      name: row.name,
      stage: row.stage,
      value: row.value,
      probability: row.probability,
      owner: row.owner,
    };
  };
  const conversation = () =>
    detail()?.linkedConversations[0] ??
    allConversations().find((row) => row.id === detail()?.source?.conversationId);

  const edit = () => {
    editingOpportunityId.set(props.opportunityId);
    editOpportunityOpen.set(true);
  };

  const move = (stage: OpportunityDetail["stage"]) => {
    if (stage === "lost") {
      requestLostReason(props.opportunityId);
      return;
    }
    const moved = setOpportunityStage(props.opportunityId, stage);
    if (moved) showToast(`Opportunity moved to ${stageLabel(moved.stage)}.`);
  };

  const createQuote = () => {
    const row = conversation();
    const current = detail();
    if (!row || !current) {
      showToast("Link a conversation before creating a quote.");
      return;
    }
    createQuoteFromOpportunity(row, link());
  };

  return (
    <If
      when={detail()}
      else={
        <View class="items-center gap-1 py-8">
          <Text class="text-[12px] font-medium text-foreground">Opportunity not found</Text>
          <Text class="text-[11px] text-muted-foreground">It may have been unlinked.</Text>
        </View>
      }
    >
      <View class="gap-3" testID="opportunity-detail">
        <View class="gap-2">
          <View class="flex-row items-start gap-2">
            <View class="min-w-0 flex-1 gap-0.5">
              <Text class="text-[16px] font-semibold text-foreground" style={{ numberOfLines: 2 }}>
                {detail()!.name}
              </Text>
              <Text class="text-[11px] text-muted-foreground">
                {detail()!.company} · {detail()!.id}
              </Text>
            </View>
            <If when={canEditOpportunity(link(), currentMember)}>
              <StageMenu opportunity={link()} onChange={move} />
            </If>
          </View>
          <View class="flex-row flex-wrap items-center gap-1.5">
            <Badge variant={stageBadgeVariant(detail()!.stage)}>
              <Text
                class="text-[11px] font-medium"
                style={{ color: stageBadgeColor(detail()!.stage) }}
              >
                {stageLabel(detail()!.stage)}
              </Text>
            </Badge>
            <Badge variant="outline">
              <Icon name="users" size={8} tone="muted-foreground" />
              <Text
                class="text-[11px] font-medium text-muted-foreground"
                style={{ numberOfLines: 2 }}
              >
                {detail()!.owner}
              </Text>
            </Badge>
            <If when={!detail()!.linked}>
              <Badge variant="warning">
                <Text class="text-[11px] font-medium text-warning">Not linked</Text>
              </Badge>
            </If>
            <If when={!canEditOpportunity(link(), currentMember)}>
              <Badge variant="outline">
                <Text class="text-[11px] font-medium text-muted-foreground">View only</Text>
              </Badge>
            </If>
          </View>
        </View>

        <View class="flex-row flex-wrap items-center gap-1.5">
          <Button
            variant="primary"
            size="sm"
            testID="opportunity-create-quote"
            onPress={createQuote}
          >
            <Icon name="fileText" size={9} tone="primary-foreground" />
            <Text class="text-[11px] font-semibold text-primary-foreground">Create quote</Text>
          </Button>
          <If when={canEditOpportunity(link(), currentMember)}>
            <Button variant="outline" size="sm" testID="opportunity-edit" onPress={edit}>
              <Icon name="pencil" size={9} tone="muted-foreground" />
              <Text class="text-[11px] font-medium">Edit</Text>
            </Button>
          </If>
          <ActionMenu
            testID="opportunity-actions"
            width={220}
            trigger={
              <View
                role="button"
                accessibilityLabel="More opportunity actions"
                testID="opportunity-more"
                class="h-7 w-7 items-center justify-center rounded-md border border-border"
                hoverStyle={{ backgroundColor: token("accent") }}
              >
                <Icon name="ellipsis" size={12} tone="muted-foreground" />
              </View>
            }
            groups={[
              [
                {
                  id: "pipeline",
                  label: "Open in pipeline",
                  icon: "arrowUpRight",
                  onSelect: () => openPipelineForOpportunity(props.opportunityId),
                },
                {
                  id: "quote",
                  label: "Open linked quote",
                  icon: "fileText",
                  disabled: !quote(),
                  onSelect: () => {
                    const linked = quoteForOpportunity(props.opportunityId);
                    if (linked) previewQuote(linked);
                  },
                },
              ],
              workMenuActions(workLink()),
              detail()!.stage === "won" || detail()!.stage === "lost"
                ? [
                    {
                      id: "reopen",
                      label: "Reopen opportunity",
                      icon: "workflow" as const,
                      onSelect: () => {
                        const moved = setOpportunityStage(props.opportunityId, "qualified");
                        if (moved) showToast("Opportunity reopened at Qualified.");
                      },
                    },
                  ]
                : [],
            ]}
          />
        </View>

        <View class="grid grid-cols-2 gap-1.5">
          <Fact label="Estimated value" value={detail()!.value} />
          <Fact label="Weighted" value={weightedValue(detail()!)} />
          <Fact label="Probability" value={`${detail()!.probability}%`} />
          <Fact label="Expected close" value={detail()!.expectedClose} />
          <Fact label="Owner" value={detail()!.owner} />
          <Fact label="Last activity" value={detail()!.lastActivity} />
        </View>

        <View class="gap-1 rounded-lg border border-border bg-panel p-2.5">
          <Text class="text-[11px] uppercase tracking-wider text-muted-foreground">Next step</Text>
          <Text class="text-[12px] font-medium text-foreground">{detail()!.nextStep}</Text>
        </View>

        <View class="gap-2 rounded-xl border border-border bg-card p-3">
          <Text class="text-[12px] font-semibold text-foreground">Pipeline stage</Text>
          <View class="relative flex-row items-start">
            <View class="absolute left-3 right-3 top-2.5 h-px bg-border" />
            <Each of={stageLabels}>
              {(stage: () => (typeof stageLabels)[number], index: () => number) => (
                <StageStep
                  label={stage().label}
                  index={index()}
                  current={stageIndex(detail()!.stage)}
                />
              )}
            </Each>
          </View>
        </View>

        <HistorySection history={detail()!.history} />
        <ProductsSection detail={detail()!} onEdit={edit} />
        <QuotesSection detail={detail()!} quote={quote()} onCreate={createQuote} />
        <LinkedConversationsSection detail={detail()!} />
        <SourceMessageSection detail={detail()!} />
        <FilesSection detail={detail()!} />
        <WorkSection link={workLink()} title="Opportunity work" limit={4} />
      </View>
    </If>
  );
}
