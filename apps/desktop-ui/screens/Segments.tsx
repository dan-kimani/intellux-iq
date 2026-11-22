import { moneyText } from "../lib/money";
import { Text, token, View } from "nsh";
import { Badge, Button, Card, Icon, SectionTitle, withAlpha } from "../components/ui";
import { AudienceRow, RuleRow, SegmentListItem } from "./segments/SegmentParts";
import { showToast } from "../state";
import { contactRows } from "./contacts/state";
import type { ContactRow } from "./contacts/data";
import { PageActions, PageShell } from "./PageShell";
import {
  addRule,
  segmentList,
  selectedSegment,
  selectedSegmentId,
  updateSegment,
} from "./segments/state";
import type { SegmentRow } from "./segments/data";

const segment = () => selectedSegment();
const members = () => contactRows().filter((contact) => segment().memberIds.includes(contact.id));

const createSegment = () => {
  const segmentRow: SegmentRow = {
    id: `segment-${Date.now()}`,
    name: "Untitled segment",
    description: "A new rule-based audience.",
    members: 0,
    tone: "chart-2",
    updated: "Draft",
    memberIds: [],
    rules: [],
  };
  segmentList.set([segmentRow, ...segmentList()]);
  selectedSegmentId.set(segmentRow.id);
};

const duplicate = () => {
  const source = segment();
  const copy: SegmentRow = {
    ...source,
    id: `segment-${Date.now()}`,
    name: `${source.name} copy`,
    updated: "Draft",
  };
  segmentList.set([copy, ...segmentList()]);
  selectedSegmentId.set(copy.id);
  showToast("Segment duplicated.");
};

export function SegmentsScreen() {
  return (
    <PageShell
      title="Segments"
      description="Rule-based audiences for outreach, routing, and recovery."
      testID="screen-segments"
      actions={
        <PageActions>
          <Button variant="primary" size="sm" onPress={createSegment}>
            <Icon name="plus" size={12} tone="primary-foreground" />
            <Text class="text-[12px] font-semibold text-primary-foreground">New segment</Text>
          </Button>
        </PageActions>
      }
    >
      <View class="flex-row items-start gap-5">
        <View class="w-80 shrink-0 gap-2">
          <View class="flex-row items-center justify-between px-1 pb-1">
            <Text class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Saved segments
            </Text>
            <Text class="text-[11px] text-muted-foreground">{segmentList().length}</Text>
          </View>
          <Card class="gap-1 p-2">
            <Each of={segmentList()}>
              {(item: () => SegmentRow) => (
                <SegmentListItem segment={item()} active={item().id === selectedSegmentId()} />
              )}
            </Each>
          </Card>
          <View class="gap-1 rounded-xl border border-border bg-panel p-3">
            <Text class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Audience rules
            </Text>
            <Text class="text-[11px] leading-4 text-muted-foreground">
              Segments are deterministic and explainable. AI never decides who enters an audience.
            </Text>
          </View>
        </View>

        <View class="min-w-0 flex-1 gap-4">
          <Card class="gap-3 p-5">
            <View class="flex-row items-start justify-between gap-4">
              <View class="min-w-0 flex-1 gap-1">
                <View class="flex-row items-center gap-2">
                  <View
                    class="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: token(segment().tone) }}
                  />
                  <Text class="text-[20px] font-semibold tabular-nums text-foreground">
                    {segment().name}
                  </Text>
                  <Badge variant="outline">
                    <Text class="text-[11px] text-muted-foreground">
                      {segment().members} members
                    </Text>
                  </Badge>
                </View>
                <Text class="text-[12px] text-muted-foreground">{segment().description}</Text>
                <Text class="text-[11px] text-muted-foreground">{segment().updated}</Text>
              </View>
              <View class="flex-row items-center gap-2">
                <Button variant="outline" size="sm" onPress={duplicate}>
                  <Icon name="fileText" size={11} tone="muted-foreground" />
                  <Text class="text-[12px] font-medium">Duplicate</Text>
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  testID="save-segment"
                  onPress={() => {
                    updateSegment(segment().id, { updated: "Saved just now" });
                    showToast("Segment saved locally.");
                  }}
                >
                  <Icon name="check" size={11} tone="primary-foreground" />
                  <Text class="text-[12px] font-semibold text-primary-foreground">
                    Save segment
                  </Text>
                </Button>
              </View>
            </View>
            <View class="flex-row gap-2 border-t border-border pt-3">
              <View class="flex-1 gap-0.5 rounded-lg bg-muted/60 px-3 py-2">
                <Text class="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Estimated audience
                </Text>
                <Text class="text-[16px] font-semibold tabular-nums text-foreground">
                  {segment().members} contacts
                </Text>
              </View>
              <View class="flex-1 gap-0.5 rounded-lg bg-muted/60 px-3 py-2">
                <Text class="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Open pipeline
                </Text>
                <Text class="text-[16px] font-semibold tabular-nums text-foreground">
                  {moneyText("$1.24M")}
                </Text>
              </View>
              <View class="flex-1 gap-0.5 rounded-lg bg-muted/60 px-3 py-2">
                <Text class="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Outcome signal
                </Text>
                <Text class="text-[16px] font-semibold text-success">High intent</Text>
              </View>
            </View>
          </Card>

          <Card class="gap-3 p-5">
            <View class="flex-row items-center justify-between">
              <SectionTitle>Rules</SectionTitle>
              <View
                role="button"
                accessibilityLabel="Add rule"
                onPress={() =>
                  addRule(segment().id, { field: "Channel", op: "is", value: "WhatsApp" })
                }
                class="h-7 flex-row items-center gap-1 rounded-md border border-dashed border-border px-2.5"
                hoverStyle={{ backgroundColor: token("accent") }}
                testID="add-segment-rule"
              >
                <Icon name="plus" size={10} tone="muted-foreground" />
                <Text class="text-[11px] font-medium text-muted-foreground">Add rule</Text>
              </View>
            </View>
            <Each of={segment().rules}>
              {(rule: () => { field: string; op: string; value: string }, index: () => number) => (
                <RuleRow rule={rule()} index={index()} />
              )}
            </Each>
            <Text class="text-[11px] leading-3.5 text-muted-foreground">
              All conditions must match. Rules are evaluated by the cloud on the org's data.
            </Text>
          </Card>

          <Card class="gap-3 p-5">
            <View class="flex-row items-center justify-between">
              <SectionTitle>Audience preview</SectionTitle>
              <Text class="text-[11px] text-muted-foreground">
                Showing {members().length} of {segment().members}
              </Text>
            </View>
            <View class="flex-row items-center gap-3 border-b border-border pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <View class="w-7" />
              <Text class="flex-1">Contact</Text>
              <Text class="w-24">Owner</Text>
              <Text class="w-16 text-right">Status</Text>
            </View>
            <If when={members().length === 0}>
              <View class="items-center gap-1 py-6">
                <Text class="text-[12px] font-medium text-foreground">No contacts match yet</Text>
                <Text class="text-[11px] text-muted-foreground">
                  Add or change a rule to preview this audience.
                </Text>
              </View>
            </If>
            <Each of={members()}>
              {(contact: () => ContactRow) => <AudienceRow contact={contact()} />}
            </Each>
            <View class="flex-row items-center justify-between pt-1">
              <Text class="text-[11px] text-muted-foreground">
                Preview uses local prototype data.
              </Text>
              <View class="flex-row items-center gap-1">
                <View
                  class="h-6 w-6 items-center justify-center rounded-md border border-border"
                  style={{ backgroundColor: withAlpha(token("accent"), "80") }}
                >
                  <Icon name="chevronLeft" size={10} tone="muted-foreground" />
                </View>
                <View class="h-6 w-6 items-center justify-center rounded-md border border-border">
                  <Icon name="chevronRight" size={10} tone="muted-foreground" />
                </View>
              </View>
            </View>
          </Card>
        </View>
      </View>
    </PageShell>
  );
}
