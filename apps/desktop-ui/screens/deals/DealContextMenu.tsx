import type { JSX } from "nsh";
import { ContextActions, type ContextAction } from "../../components/ContextActions";
import { showToast } from "../../state";
import { canTransition } from "../../domain/stages";
import type { Deal } from "./data";
import { advanceDealRow, dealDetail, moveDealToStage, stageLabel } from "./state";

export function dealActionGroups(deal: Deal, open?: () => void): ContextAction[][] {
  const won = deal.stage === "won";
  return [
    [
      {
        id: "open",
        label: "Open opportunity",
        icon: "arrowUpRight",
        description: "Show the opportunity record",
        onSelect: () => {
          if (open) open();
          else dealDetail.set(deal);
        },
      },
      {
        id: "advance",
        label: "Advance stage",
        icon: "check",
        disabled: won,
        description: "Move the opportunity to the next pipeline stage",
        onSelect: () => {
          const moved = advanceDealRow(deal.id);
          if (moved) showToast(`${moved.id} moved to ${stageLabel(moved.stage)}.`);
        },
      },
      {
        id: "won",
        label: "Mark as won",
        icon: "checkCheck",
        disabled: !canTransition(deal.stage, "won"),
        description: "Record a closed-won outcome",
        onSelect: () => {
          const moved = moveDealToStage(deal.id, "won");
          if (moved) showToast(`${moved.id} marked won.`);
        },
      },
    ],
  ];
}

export function DealContextMenu(props: { deal: Deal; trigger: JSX.Element }) {
  return (
    <ContextActions
      testID={`deal-context-${props.deal.id}`}
      width={236}
      trigger={props.trigger}
      groups={dealActionGroups(props.deal)}
    />
  );
}
