import { Text, token, View } from "nsh";
import { Card, Icon, SectionTitle } from "../../components/ui";
import type { ContactRow } from "./data";
import { contactActivities, type ActivityEntry } from "../activity";
import { quoteRows } from "../quotes/state";
import type { QuoteRow } from "../quotes/data";

function relatedQuotes(contact: ContactRow): QuoteRow[] {
  return quoteRows().filter(
    (quote) => quote.customer.trim().toLowerCase() === contact.company.trim().toLowerCase(),
  );
}

export function ContactActivity(props: { contact: ContactRow }) {
  const quotes = relatedQuotes(props.contact);
  const latest = quotes[0];
  const added = () => contactActivities()[props.contact.id] ?? [];
  return (
    <Card class="gap-3 p-5">
      <SectionTitle>Activity</SectionTitle>
      <View class="gap-3">
        <Each of={added()}>
          {(entry: () => ActivityEntry) => (
            <View class="flex-row gap-3">
              <View class="h-7 w-7 items-center justify-center rounded-full bg-muted">
                <Icon
                  name={entry().kind === "task" ? "check" : "fileText"}
                  size={12}
                  tone="muted-foreground"
                />
              </View>
              <View class="min-w-0 flex-1 gap-0.5">
                <Text class="text-[12px] font-medium text-foreground">{entry().text}</Text>
                <Text class="text-[11px] text-muted-foreground">
                  {entry().meta} · {entry().at}
                </Text>
              </View>
            </View>
          )}
        </Each>
        <If when={latest}>
          <View class="flex-row gap-3">
            <View class="h-7 w-7 items-center justify-center rounded-full bg-muted">
              <Icon name="fileText" size={12} tone="muted-foreground" />
            </View>
            <View class="min-w-0 flex-1 gap-0.5">
              <Text class="text-[12px] font-medium text-foreground">
                Quotation {latest?.id} issued
              </Text>
              <Text class="text-[11px] text-muted-foreground">
                {latest?.issued} · {latest?.value}
              </Text>
            </View>
          </View>
          <View class="flex-row gap-3">
            <View class="h-7 w-7 items-center justify-center rounded-full bg-muted">
              <Icon name="checkCheck" size={12} tone="muted-foreground" />
            </View>
            <View class="min-w-0 flex-1 gap-0.5">
              <Text class="text-[12px] font-medium text-foreground">Customer engagement</Text>
              <Text class="text-[11px] text-muted-foreground">
                {latest?.viewed} · last touch {props.contact.lastTouch}
              </Text>
            </View>
          </View>
        </If>
        <View class="flex-row gap-3">
          <View class="h-7 w-7 items-center justify-center rounded-full bg-muted">
            <Icon name="users" size={12} tone="muted-foreground" />
          </View>
          <View class="min-w-0 flex-1 gap-0.5">
            <Text class="text-[12px] font-medium text-foreground">Added to the directory</Text>
            <Text class="text-[11px] text-muted-foreground">
              {props.contact.since} · {props.contact.owner}
            </Text>
          </View>
        </View>
      </View>
      <View class="flex-row items-center gap-1.5 border-t border-border pt-2">
        <View class="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: token("success") }} />
        <Text class="text-[11px] text-muted-foreground">
          Deterministic events; notes are team-visible
        </Text>
      </View>
    </Card>
  );
}
