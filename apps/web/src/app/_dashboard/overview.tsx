import { ArrowUpRight, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { ConversationChart } from "@/components/conversation-chart";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { TabsContent } from "@/components/ui/tabs";
import { activity, channels, copy, metrics, noteTone } from "./data";
import { QuoteTable } from "./tables";

export function MetricsGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <Card key={metric.label} size="sm" className="gap-0">
            <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
              <div className="flex items-center gap-3">
                <span
                  className={`flex size-9 items-center justify-center rounded-lg ${metric.tile}`}
                >
                  <Icon className="size-4" />
                </span>
                <CardDescription className="text-[10px] font-medium tracking-[0.14em] uppercase">
                  {metric.label}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon-xs" aria-label={metric.label}>
                <MoreHorizontal />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tracking-tight tabular-nums">
                {metric.value}
              </div>
              <p className={`mt-1 text-xs ${noteTone[metric.tone]}`}>{metric.note}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function OverviewTab() {
  return (
    <TabsContent value="overview" className="mt-0 space-y-4">
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>{copy.chart.title}</CardTitle>
              <CardDescription>{copy.chart.description}</CardDescription>
            </div>
            <CardAction>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-(--chart-1)" />
                  {copy.chart.whatsapp}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-(--chart-2)" />
                  {copy.chart.email}
                </span>
              </div>
            </CardAction>
          </CardHeader>
          <CardContent className="flex-1">
            <ConversationChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>{copy.channels.title}</CardTitle>
              <CardDescription>{copy.channels.description}</CardDescription>
            </div>
            <CardAction>
              <Button variant="ghost" size="icon-sm" aria-label={copy.channels.manage}>
                <ArrowUpRight />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-5">
            {channels.map((channel) => {
              const Icon = channel.icon;
              const healthy = channel.tone === "healthy";

              return (
                <div key={channel.name} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <Icon className="size-3.5" />
                      </span>
                      <span className="text-sm font-medium">{channel.name}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        healthy
                          ? "border-emerald-600/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          : "border-amber-600/20 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                      }
                    >
                      {channel.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="truncate">{channel.detail}</span>
                    <span className="shrink-0 tabular-nums">{channel.metric}</span>
                  </div>
                  <Progress
                    value={channel.value}
                    className={
                      healthy
                        ? "h-1.5 **:data-[slot=progress-indicator]:bg-emerald-500"
                        : "h-1.5 **:data-[slot=progress-indicator]:bg-amber-500"
                    }
                  />
                </div>
              );
            })}
            <Separator />
            <p className="text-xs leading-relaxed text-muted-foreground">
              WhatsApp and email are delivering normally. Two devices have not synced in the last
              hour.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              {copy.channels.manage}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>{copy.quotes.title}</CardTitle>
              <CardDescription>{copy.quotes.description}</CardDescription>
            </div>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link href="#quotations">
                  {copy.quotes.viewAll}
                  <ArrowUpRight />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="px-0">
            <QuoteTable />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>{copy.activity.title}</CardTitle>
              <CardDescription>{copy.activity.description}</CardDescription>
            </div>
            <CardAction>
              <Button variant="ghost" size="icon-sm" aria-label={copy.activity.viewAll}>
                <ArrowUpRight />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4">
            {activity.map((item) => (
              <div key={`${item.name}-${item.time}`} className="flex gap-3">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-muted text-[10px] font-medium text-muted-foreground">
                    {item.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm leading-snug">
                    <span className="font-medium">{item.name}</span>{" "}
                    <span className="text-muted-foreground">{item.action}</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
}
