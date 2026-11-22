import { Text, token, View } from "nsh";
import { Badge, Button, Icon } from "../../components/ui";
import type { Conversation } from "../../data";
import { stageLabel } from "../../domain/stages";
import { linkOpportunityOpen, opportunityIdsFor } from "../../state";
import { opportunityRowsFor, type OpportunityListRow } from "../opportunities/actions";
import { stageBadgeColor, stageBadgeVariant } from "../opportunities/OpportunityParts";
import { openNewOpportunity } from "../opportunities/state";
import { openOpportunityPanel, opportunityScope } from "./panelState";

function ScopeButton(props: {
  active: boolean;
  label: string;
  testID: string;
  onPress: () => void;
}) {
  return (
    <View
      role="button"
      accessibilityLabel={props.label}
      testID={props.testID}
      onPress={props.onPress}
      class="h-6 flex-1 items-center justify-center rounded-md"
      style={{ backgroundColor: props.active ? token("accent") : "transparent" }}
      hoverStyle={{ backgroundColor: token("accent") }}
    >
      <Text
        class="text-[11px] font-medium"
        style={{ color: props.active ? token("accent-foreground") : token("muted-foreground") }}
      >
        {props.label}
      </Text>
    </View>
  );
}

function OpportunityRow(props: { row: OpportunityListRow; primary: boolean; onOpen: () => void }) {
  return (
    <View
      role="button"
      accessibilityLabel={`Open opportunity ${props.row.name}`}
      testID={`opportunity-row-${props.row.id}`}
      onPress={props.onOpen}
      class="gap-1.5 rounded-xl border border-border bg-panel p-2.5"
      hoverStyle={{ backgroundColor: token("accent") }}
      focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
    >
      <View class="flex-row items-center gap-1.5">
        <Text
          class="min-w-0 flex-1 text-[12px] font-medium text-foreground"
          style={{ numberOfLines: 2 }}
        >
          {props.row.name}
        </Text>
        <Badge variant={stageBadgeVariant(props.row.stage)}>
          <Text class="text-[11px] font-medium" style={{ color: stageBadgeColor(props.row.stage) }}>
            {stageLabel(props.row.stage)}
          </Text>
        </Badge>
      </View>
      <View class="flex-row items-center gap-1.5">
        <Text class="text-[12px] font-semibold text-foreground">{props.row.value}</Text>
        <Text class="min-w-0 text-[11px] text-muted-foreground" style={{ numberOfLines: 2 }}>
          {props.row.owner}
        </Text>
        <View class="flex-1" />
        <If when={props.primary}>
          <Badge variant="outline">
            <Text class="text-[11px] font-medium text-muted-foreground">Primary</Text>
          </Badge>
        </If>
        <If when={!props.row.linked}>
          <Text class="text-[11px] font-medium text-muted-foreground">Other chat</Text>
        </If>
      </View>
    </View>
  );
}

export function OpportunitiesPanel(props: { conversation: Conversation }) {
  const scope = opportunityScope;
  const rows = () => opportunityRowsFor(props.conversation, scope());
  const primary = () => opportunityIdsFor(props.conversation)[0];
  return (
    <View class="gap-3" testID="opportunities-panel">
      <View class="flex-row items-center gap-2">
        <Text class="text-[14px] font-semibold text-foreground">Opportunities</Text>
        <Badge variant="outline">
          <Text class="text-[11px] font-medium text-muted-foreground">{rows().length}</Text>
        </Badge>
        <View class="flex-1" />
        <Button
          variant="primary"
          size="sm"
          testID="opportunity-new"
          onPress={() => openNewOpportunity(props.conversation.id)}
        >
          <Icon name="plus" size={10} tone="primary-foreground" />
          <Text class="text-[11px] font-semibold text-primary-foreground">New</Text>
        </Button>
      </View>

      <View class="flex-row rounded-lg border border-border p-0.5">
        <ScopeButton
          active={scope() === "conversation"}
          label="This chat"
          testID="opportunity-scope-conversation"
          onPress={() => scope.set("conversation")}
        />
        <ScopeButton
          active={scope() === "contact"}
          label="All contact"
          testID="opportunity-scope-contact"
          onPress={() => scope.set("contact")}
        />
      </View>

      <If
        when={rows().length > 0}
        else={
          <View class="items-center gap-2 rounded-2xl border border-dashed border-border px-6 py-8">
            <View class="h-9 w-9 items-center justify-center rounded-full bg-muted">
              <Icon name="briefcase" size={15} tone="muted-foreground" />
            </View>
            <Text class="text-[12px] font-medium text-foreground">No opportunities yet</Text>
            <Text class="max-w-65 text-center text-[11px] leading-4 text-muted-foreground">
              A conversation can carry several opportunities. Create one per product or service the
              customer asks about.
            </Text>
          </View>
        }
      >
        <View class="gap-2">
          <Each of={rows()}>
            {(row: () => OpportunityListRow) => (
              <OpportunityRow
                row={row()}
                primary={primary() === row().id}
                onOpen={() => openOpportunityPanel(row().id, props.conversation.id)}
              />
            )}
          </Each>
        </View>
      </If>

      <View class="flex-row items-center gap-2 border-t border-border pt-2.5">
        <Text class="min-w-0 flex-1 text-[11px] leading-3.5 text-muted-foreground">
          Opportunities hold stage, value, products, and quotes — never the conversation.
        </Text>
        <Button
          variant="outline"
          size="sm"
          testID="opportunity-link"
          onPress={() => linkOpportunityOpen.set(true)}
        >
          <Icon name="briefcase" size={9} tone="muted-foreground" />
          <Text class="text-[11px] font-medium">Link</Text>
        </Button>
      </View>
    </View>
  );
}
