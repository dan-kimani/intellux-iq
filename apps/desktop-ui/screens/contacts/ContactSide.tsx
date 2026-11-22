import { Text, View } from "nsh";
import { Badge, Button, Card, Icon, SectionTitle } from "../../components/ui";
import { activeNav, activeNavChild } from "../../state";
import { dealRows, stageLabel } from "../deals/state";
import type { ContactRow } from "./data";

function InfoRow(props: {
  icon: "mail" | "phone" | "users" | "briefcase" | "chart";
  label: string;
  value: string;
}) {
  return (
    <View class="flex-row items-center gap-2.5 border-t border-border py-2 first:border-t-0 first:pt-0">
      <View class="h-7 w-7 items-center justify-center rounded-md bg-muted">
        <Icon name={props.icon} size={12} tone="muted-foreground" />
      </View>
      <View class="min-w-0 flex-1 gap-0.5">
        <Text class="text-[11px] uppercase tracking-wider text-muted-foreground">
          {props.label}
        </Text>
        <Text class="text-[12px] font-medium text-foreground" style={{ numberOfLines: 2 }}>
          {props.value}
        </Text>
      </View>
    </View>
  );
}

export function ContactSide(props: { contact: ContactRow }) {
  const contact = props.contact;
  const deal = () =>
    dealRows().find((row) => row.contact === contact.name || row.company === contact.company);
  return (
    <View class="w-80 shrink-0 gap-4">
      <Card class="gap-2 p-4">
        <SectionTitle>Contact details</SectionTitle>
        <InfoRow icon="mail" label="Email" value={contact.email} />
        <InfoRow icon="phone" label="Phone" value={contact.phone} />
        <InfoRow icon="users" label="Location" value={contact.location} />
        <InfoRow icon="briefcase" label="Owner" value={contact.owner} />
        <InfoRow icon="chart" label="Customer since" value={contact.since} />
      </Card>

      <Card class="gap-3 p-4">
        <SectionTitle>Current opportunity</SectionTitle>
        <If
          when={deal()}
          else={
            <Text class="text-[12px] text-muted-foreground">
              No open opportunity for this company.
            </Text>
          }
        >
          <View class="gap-1">
            <Text class="text-[13px] font-medium text-foreground">{deal()?.name}</Text>
            <Text class="text-[11px] text-muted-foreground">
              {deal() ? stageLabel(deal()!.stage) : ""} · {deal()?.value}
            </Text>
          </View>
          <View class="gap-1.5">
            <View class="flex-row items-center justify-between">
              <Text class="text-[11px] text-muted-foreground">Probability</Text>
              <Text class="text-[11px] font-medium text-foreground">{deal()?.probability}%</Text>
            </View>
            <View class="h-1.5 overflow-hidden rounded-full bg-muted">
              <View
                class="h-full rounded-full bg-foreground"
                style={{ width: `${deal()?.probability ?? 0}%` }}
              />
            </View>
          </View>
          <Text class="text-[12px] leading-4 text-muted-foreground">Next: {deal()?.nextStep}</Text>
          <Button
            variant="outline"
            size="sm"
            onPress={() => {
              activeNavChild.set("deals");
              activeNav.set("Deals");
            }}
          >
            <Text class="text-[12px] font-medium">Open pipeline</Text>
            <Icon name="chevronRight" size={10} tone="muted-foreground" />
          </Button>
        </If>
      </Card>

      <Card class="gap-2 p-4">
        <SectionTitle>Segments</SectionTitle>
        <View class="flex-row flex-wrap gap-1.5">
          <Each of={contact.tags}>
            {(tag: () => string) => (
              <Badge variant="default">
                <Text class="text-[11px] text-muted-foreground">{tag()}</Text>
              </Badge>
            )}
          </Each>
        </View>
        <Text class="text-[11px] leading-4 text-muted-foreground">
          Segment membership is rule-based and refreshed by the cloud.
        </Text>
      </Card>
    </View>
  );
}
