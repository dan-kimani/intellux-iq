import { computed, signal, Text, token, View, type ViewRef } from "nsh";
import { Badge, Icon, StageDot } from "../../components/ui";
import { dealStages, type Deal } from "./data";
import { appViewport } from "../../components/viewport";
import { DealCard } from "./DealCard";
import { showToast } from "../../state";
import {
  dealAnchor,
  dealDetail,
  filteredDeals,
  moveDealToStage,
  newDealOpen,
  stageLabel,
} from "./state";

function stageColor(tone: string): "green" | "amber" | "violet" | "blue" {
  if (tone === "chart-3") return "green";
  if (tone === "chart-4") return "amber";
  if (tone === "chart-1") return "violet";
  return "blue";
}

function AddDeal(props: { stage: string; compact?: boolean }) {
  return (
    <View
      role="button"
      accessibilityLabel={`Add opportunity to ${props.stage}`}
      testID={`add-deal-${props.stage}`}
      onPress={() => newDealOpen.set(true)}
      class={
        props.compact
          ? "h-6 w-6 items-center justify-center rounded-md"
          : "h-9 flex-row items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground"
      }
      hoverStyle={{ backgroundColor: token("accent"), borderColor: token("ring") }}
    >
      <Icon name="plus" size={11} tone="muted-foreground" />
      <If when={!props.compact}>
        <Text class="text-[11px] font-medium">Add opportunity</Text>
      </If>
    </View>
  );
}

function DealColumn(props: {
  stage: (typeof dealStages)[number];
  onOpen: (deal: Deal, node: ViewRef | undefined) => void;
  onMove: (deal: Deal, steps: number) => void;
  dragging: boolean;
  onDragStart: (deal: Deal) => void;
  onDragEnd: () => void;
  onDragTarget: (deal: Deal, steps: number) => void;
}) {
  const columnDeals = computed(() =>
    filteredDeals().filter((deal) => deal.stage === props.stage.id),
  );
  return (
    <View
      class="min-w-0 flex-1 gap-2 rounded-2xl border border-border bg-panel p-2"
      testID={`pipeline-column-${props.stage.id}`}
      style={{
        borderColor: props.dragging ? token("ring") : token("border"),
        backgroundColor: props.dragging ? token("accent") : token("panel"),
      }}
    >
      <View class="flex-row items-center justify-between gap-2 px-1 py-0.5">
        <View class="min-w-0 flex-row items-center gap-1.5">
          <StageDot color={stageColor(props.stage.tone)} />
          <Text class="text-[12px] font-semibold text-foreground">{props.stage.label}</Text>
          <Badge variant="outline">
            <Text class="text-[11px] tabular-nums text-muted-foreground">
              {columnDeals().length}
            </Text>
          </Badge>
        </View>
        <AddDeal stage={props.stage.id} compact />
      </View>
      <View class="gap-2">
        <Each of={columnDeals()}>
          {(deal: () => Deal) => (
            <DealCard
              deal={deal()}
              onOpen={props.onOpen}
              onMove={props.onMove}
              onDragStart={props.onDragStart}
              onDragEnd={props.onDragEnd}
              onDragTarget={props.onDragTarget}
            />
          )}
        </Each>
        <If when={columnDeals().length === 0}>
          <View class="items-center rounded-xl border border-dashed border-border py-6">
            <Text class="text-[11px] text-muted-foreground">No opportunities</Text>
          </View>
        </If>
        <If when={props.dragging}>
          <View
            testID={`drop-${props.stage.id}`}
            class="h-20 items-center justify-center rounded-xl border border-dashed border-ring bg-card/40"
          >
            <Text class="text-[11px] font-medium text-muted-foreground">Drop opportunity here</Text>
          </View>
        </If>
        <AddDeal stage={props.stage.id} />
      </View>
    </View>
  );
}

const total = computed(() => filteredDeals().length);

function moveBy(deal: Deal, steps: number): void {
  if (steps === 0) return;
  const index = dealStages.findIndex((stage) => stage.id === deal.stage);
  const target = dealStages[Math.max(0, Math.min(dealStages.length - 1, index + steps))];
  if (!target || target.id === deal.stage) return;
  const moved = moveDealToStage(deal.id, target.id, true);
  if (moved) showToast(`${deal.id} moved to ${stageLabel(target.id)}.`);
}

export function PipelineBoard() {
  let boardNode: ViewRef | undefined;
  const dropStage = signal<string | null>(null);
  const openDeal = async (deal: Deal, node: ViewRef | undefined) => {
    const [card, board] = await Promise.all([node?.measure(), boardNode?.measure()]);
    if (card && board) {
      const panelWidth = 480;
      const viewport = appViewport();
      const panelHeight = Math.min(760, (viewport.height || board.bounds.size.height) - 32);
      const gap = 0;
      let left = card.pagePosition.x + card.bounds.size.width + gap;
      const rightEdge = viewport.width || board.pagePosition.x + board.bounds.size.width;
      if (left + panelWidth > rightEdge - 8) left = card.pagePosition.x - panelWidth - gap;
      if (left < board.pagePosition.x + 8) left = rightEdge - panelWidth - 8;
      const cardCenter = card.pagePosition.y + card.bounds.size.height / 2;
      const top = Math.max(
        16,
        Math.min(
          cardCenter - panelHeight * 0.4,
          (viewport.height || board.bounds.size.height) - panelHeight - 16,
        ),
      );
      const cardCenterX = card.pagePosition.x + card.bounds.size.width / 2;
      const side = left + panelWidth / 2 < cardCenterX ? "left" : "right";
      dealAnchor.set({
        left,
        top,
        width: panelWidth,
        height: panelHeight,
        side,
        cardLeft: card.pagePosition.x,
        cardTop: card.pagePosition.y,
        cardWidth: card.bounds.size.width,
        cardHeight: card.bounds.size.height,
      });
    }
    dealDetail.set(deal);
  };
  return (
    <View
      ref={(value) => {
        boardNode = value;
      }}
      class="relative gap-3"
      testID="pipeline-board"
    >
      <View
        class="flex-row items-center justify-between gap-2 px-1"
        style={{
          filter: dealDetail() ? "blur(2px)" : "none",
          opacity: dealDetail() ? 0.55 : 1,
        }}
      >
        <View class="flex-row items-center gap-2">
          <Icon name="briefcase" size={14} tone="muted-foreground" />
          <Text class="text-[13px] font-semibold text-foreground">Open pipeline</Text>
          <Text class="text-[11px] text-muted-foreground">Kanban by stage · drag to move</Text>
        </View>
        <Text class="text-[11px] tabular-nums text-muted-foreground">{total()} opportunities</Text>
      </View>
      <View class="flex-row items-start gap-3">
        <Each of={dealStages}>
          {(stage: () => (typeof dealStages)[number]) => (
            <DealColumn
              stage={stage()}
              onOpen={openDeal}
              onMove={moveBy}
              dragging={dropStage() === stage().id}
              onDragStart={(deal) => dropStage.set(deal.stage)}
              onDragEnd={() => dropStage.set(null)}
              onDragTarget={(deal, steps) => {
                const index = dealStages.findIndex((row) => row.id === deal.stage);
                dropStage.set(
                  dealStages[Math.max(0, Math.min(dealStages.length - 1, index + steps))]?.id ??
                    null,
                );
              }}
            />
          )}
        </Each>
      </View>
    </View>
  );
}
