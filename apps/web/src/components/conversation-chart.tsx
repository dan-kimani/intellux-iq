"use client";

import { messages } from "@intelluxiq/i18n";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const copy = messages.en.dashboard;

const data = [
  { day: "Mon", whatsapp: 128, email: 38 },
  { day: "Tue", whatsapp: 164, email: 44 },
  { day: "Wed", whatsapp: 148, email: 51 },
  { day: "Thu", whatsapp: 196, email: 47 },
  { day: "Fri", whatsapp: 214, email: 58 },
  { day: "Sat", whatsapp: 122, email: 31 },
  { day: "Sun", whatsapp: 138, email: 36 },
];

const chartConfig = {
  whatsapp: {
    label: copy.chart.whatsapp,
    color: "var(--chart-1)",
  },
  email: {
    label: copy.chart.email,
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function ConversationChart() {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-full min-h-65 w-full">
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tickMargin={10}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          width={30}
          tick={{ fontSize: 11 }}
          tickMargin={6}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
        <Line
          dataKey="whatsapp"
          type="monotone"
          stroke="var(--color-whatsapp)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3 }}
          isAnimationActive={false}
        />
        <Line
          dataKey="email"
          type="monotone"
          stroke="var(--color-email)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
