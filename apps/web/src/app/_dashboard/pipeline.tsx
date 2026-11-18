import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import { copy, opportunities, pipelineStages, stageStyles } from "./data";

export function PipelineTab() {
  return (
    <TabsContent value="pipeline" className="mt-0 space-y-4">
      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {pipelineStages.map((stage) => (
          <Card key={stage.key} size="sm" className="gap-0">
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] font-medium tracking-[0.14em] uppercase">
                {copy.pipeline.stages[stage.key]}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tracking-tight tabular-nums">
                {stage.count}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{stage.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{copy.pipeline.open}</CardTitle>
            <CardDescription>{copy.pipeline.description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">{copy.pipeline.opportunity}</TableHead>
                <TableHead>{copy.pipeline.customer}</TableHead>
                <TableHead>{copy.pipeline.value}</TableHead>
                <TableHead>{copy.pipeline.stageLabel}</TableHead>
                <TableHead>{copy.pipeline.owner}</TableHead>
                <TableHead className="pr-4">{copy.pipeline.lastActivity}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.map((opportunity) => (
                <TableRow key={opportunity.name}>
                  <TableCell className="pl-4 font-medium">{opportunity.name}</TableCell>
                  <TableCell className="text-muted-foreground">{opportunity.customer}</TableCell>
                  <TableCell className="tabular-nums">{opportunity.value}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={stageStyles[opportunity.stage]}>
                      {copy.pipeline.stages[opportunity.stage]}
                    </Badge>
                  </TableCell>
                  <TableCell>{opportunity.owner}</TableCell>
                  <TableCell className="pr-4 text-xs text-muted-foreground">
                    {opportunity.activity}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
