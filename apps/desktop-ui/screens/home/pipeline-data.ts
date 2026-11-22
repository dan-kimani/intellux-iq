import type { Tokens } from "nsh";
import { stageLabel, stageOrder, type Stage } from "../../domain/stages";
import { allConversations } from "../../state";
import { dealRows } from "../deals/state";

export interface FunnelRow {
  label: string;
  count: number;
  share: number;
  tone: "series-1" | "series-2" | "series-4" | "series-3";
}

export function pipelineFunnel(): {
  rows: FunnelRow[];
  leads: number;
  won: number;
  conversion: number;
} {
  const leads = allConversations().length;
  const opportunities = dealRows().length;
  const quoted = dealRows().filter((deal) => deal.quoteId !== "—").length;
  const won = dealRows().filter((deal) => deal.stage === "won").length;
  const share = (count: number) => (leads ? Math.round((count / leads) * 100) : 0);
  return {
    rows: [
      { label: "Leads", count: leads, share: 100, tone: "series-1" },
      {
        label: "Opportunities",
        count: opportunities,
        share: share(opportunities),
        tone: "series-2",
      },
      { label: "Quoted", count: quoted, share: share(quoted), tone: "series-4" },
      { label: "Won", count: won, share: share(won), tone: "series-3" },
    ],
    leads,
    won,
    conversion: share(won),
  };
}

export interface PipelineSlice {
  id: Stage;
  label: string;
  count: number;
  share: number;
  tone: keyof Tokens;
}

const pipelineTones: Record<Stage, keyof Tokens> = {
  enquiry: "series-1",
  qualified: "series-2",
  quotation: "series-4",
  negotiation: "series-5",
  won: "series-3",
  lost: "destructive",
};

/** Deals are split by their current stage; unlike the funnel, these counts add up. */
export function pipelineMix(): { rows: PipelineSlice[]; total: number } {
  const deals = dealRows();
  const counts = new Map<Stage, number>();
  for (const deal of deals) counts.set(deal.stage, (counts.get(deal.stage) ?? 0) + 1);
  const total = deals.length;
  return {
    total,
    rows: stageOrder.flatMap((stage) => {
      const count = counts.get(stage) ?? 0;
      if (count === 0) return [];
      return [
        {
          id: stage,
          label: stageLabel(stage),
          count,
          share: total ? Math.round((count / total) * 1000) / 10 : 0,
          tone: pipelineTones[stage],
        },
      ];
    }),
  };
}
