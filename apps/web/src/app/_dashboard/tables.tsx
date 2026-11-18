import { Plus } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import { conversations, copy, devices, quoteStatusStyles, quotes } from "./data";

export function QuoteTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="pl-4">{copy.quotes.number}</TableHead>
          <TableHead>{copy.quotes.customer}</TableHead>
          <TableHead>{copy.quotes.value}</TableHead>
          <TableHead>{copy.quotes.status}</TableHead>
          <TableHead className="pr-4 text-right">{copy.quotes.updated}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {quotes.map((quote) => (
          <TableRow key={quote.number}>
            <TableCell className="pl-4 font-mono text-xs text-muted-foreground">
              {quote.number}
            </TableCell>
            <TableCell className="font-medium">{quote.customer}</TableCell>
            <TableCell className="tabular-nums">{quote.value}</TableCell>
            <TableCell>
              <Badge variant="outline" className={quoteStatusStyles[quote.status]}>
                {copy.quotes.statuses[quote.status]}
              </Badge>
            </TableCell>
            <TableCell className="pr-4 text-right text-xs text-muted-foreground">
              {quote.updated}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function ConversationsTab() {
  return (
    <TabsContent value="conversations" className="mt-0">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{copy.conversations.title}</CardTitle>
            <CardDescription>{copy.conversations.description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">{copy.conversations.contact}</TableHead>
                <TableHead>{copy.conversations.channel}</TableHead>
                <TableHead>{copy.conversations.assignee}</TableHead>
                <TableHead>{copy.conversations.waiting}</TableHead>
                <TableHead className="pr-4">{copy.conversations.status}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversations.map((conversation) => (
                <TableRow key={conversation.contact}>
                  <TableCell className="pl-4 font-medium">{conversation.contact}</TableCell>
                  <TableCell className="text-muted-foreground">{conversation.channel}</TableCell>
                  <TableCell>{conversation.assignee}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {conversation.waiting}
                  </TableCell>
                  <TableCell className="pr-4">
                    <Badge
                      variant="outline"
                      className={
                        conversation.status === "open"
                          ? "border-emerald-600/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          : "border-amber-600/20 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                      }
                    >
                      {copy.conversations.statuses[conversation.status]}
                    </Badge>
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

export function QuotationsTab() {
  return (
    <TabsContent value="quotations" className="mt-0">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{copy.quotes.title}</CardTitle>
            <CardDescription>{copy.quotes.description}</CardDescription>
          </div>
          <CardAction>
            <Button size="sm">
              <Plus />
              {copy.actions.newQuote}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="px-0">
          <QuoteTable />
        </CardContent>
      </Card>
    </TabsContent>
  );
}

export function DevicesTab() {
  return (
    <TabsContent value="devices" className="mt-0">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{copy.devices.title}</CardTitle>
            <CardDescription>{copy.devices.description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">{copy.devices.device}</TableHead>
                <TableHead>{copy.devices.platform}</TableHead>
                <TableHead>{copy.devices.lastSeen}</TableHead>
                <TableHead className="pr-4">{copy.devices.status}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.name}>
                  <TableCell className="pl-4 font-medium">{device.name}</TableCell>
                  <TableCell className="text-muted-foreground">{device.platform}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {device.lastSeen}
                  </TableCell>
                  <TableCell className="pr-4">
                    <Badge
                      variant="outline"
                      className={
                        device.status === "online"
                          ? "border-emerald-600/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          : "border-border bg-muted text-muted-foreground"
                      }
                    >
                      {copy.devices[device.status]}
                    </Badge>
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
