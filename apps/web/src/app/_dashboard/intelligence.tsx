import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import { copy, outcomes, severityStyles, signals } from "./data";

export function IntelligenceTab() {
  return (
    <TabsContent value="intelligence" className="mt-0 space-y-4">
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>{copy.intelligence.signalsTitle}</CardTitle>
              <CardDescription>{copy.intelligence.signalsDescription}</CardDescription>
            </div>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link href="#intelligence">
                  {copy.pipeline.viewAll}
                  <ArrowUpRight />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">{copy.intelligence.columns.subject}</TableHead>
                  <TableHead>{copy.intelligence.columns.signal}</TableHead>
                  <TableHead>{copy.intelligence.columns.severity}</TableHead>
                  <TableHead>{copy.intelligence.columns.owner}</TableHead>
                  <TableHead className="pr-4">{copy.intelligence.columns.age}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signals.map((signal) => (
                  <TableRow key={`${signal.subject}-${signal.signal}`}>
                    <TableCell className="pl-4 font-medium">{signal.subject}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {copy.intelligence.signals[signal.signal]}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={severityStyles[signal.severity]}>
                        {copy.intelligence.severity[signal.severity]}
                      </Badge>
                    </TableCell>
                    <TableCell>{signal.owner}</TableCell>
                    <TableCell className="pr-4 text-xs text-muted-foreground">
                      {signal.age}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>{copy.intelligence.outcomesTitle}</CardTitle>
              <CardDescription>{copy.intelligence.outcomesDescription}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {outcomes.map((outcome) => (
              <div key={outcome.key} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">
                  {copy.intelligence.outcomes[outcome.key]}
                </span>
                <span className="font-medium tabular-nums">{outcome.value}</span>
              </div>
            ))}
            <Separator />
            <p className="text-xs leading-relaxed text-muted-foreground">
              {copy.intelligence.note}
            </p>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
}
