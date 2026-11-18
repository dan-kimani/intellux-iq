import { Text, token, View } from "nsh";
import { Avatar, Badge, Icon } from "../../components/ui";
import type { ContactRow } from "../contacts/data";
import type { SegmentRow } from "./data";
import { removeRule, selectedSegment, selectedSegmentId } from "./state";

export function SegmentListItem(props: { segment: SegmentRow; active: boolean }) {
  return (
    <View
      role="button"
      accessibilityLabel={`Open ${props.segment.name} segment`}
      testID={`segment-${props.segment.id}`}
      onPress={() => selectedSegmentId.set(props.segment.id)}
      class="gap-1.5 rounded-lg border px-3 py-2.5"
      style={{
        backgroundColor: props.active ? token("accent") : "transparent",
        borderColor: props.active ? token("ring") : "transparent",
      }}
      hoverStyle={{ backgroundColor: token("accent") }}
      focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: -2 }}
    >
      <View class="flex-row items-center justify-between gap-2">
        <View class="flex-row items-center gap-2">
          <View
            class="h-2 w-2 rounded-full"
            style={{ backgroundColor: token(props.segment.tone) }}
          />
          <Text class="text-[11.5px] font-medium text-foreground">{props.segment.name}</Text>
        </View>
        <Text class="text-[10px] font-semibold text-foreground">{props.segment.members}</Text>
      </View>
      <Text class="text-[9.5px] leading-3.75 text-muted-foreground" style={{ numberOfLines: 2 }}>
        {props.segment.description}
      </Text>
      <Text class="text-[8.5px] text-muted-foreground">{props.segment.updated}</Text>
    </View>
  );
}

export function RuleRow(props: {
  rule: { field: string; op: string; value: string };
  index: number;
}) {
  return (
    <View class="flex-row items-center gap-2 rounded-lg border border-border bg-panel px-3 py-2">
      <Text class="flex-1 text-[10.5px] font-medium text-foreground">{props.rule.field}</Text>
      <Text class="text-[9.5px] text-muted-foreground">{props.rule.op}</Text>
      <View class="h-6 items-center justify-center rounded-md bg-muted px-2">
        <Text class="text-[9.5px] font-semibold text-foreground">{props.rule.value}</Text>
      </View>
      <View
        role="button"
        accessibilityLabel="Remove rule"
        onPress={() => removeRule(selectedSegment().id, props.index)}
        class="h-6 w-6 items-center justify-center rounded-md"
        hoverStyle={{ backgroundColor: token("accent") }}
      >
        <Icon name="close" size={10} tone="muted-foreground" />
      </View>
    </View>
  );
}

export function AudienceRow(props: { contact: ContactRow }) {
  return (
    <View class="flex-row items-center gap-3 border-b border-border py-2.5 last:border-b-0">
      <Avatar initials={props.contact.initials} tone={props.contact.tone} size={30} />
      <View class="min-w-0 flex-1 gap-0.5">
        <Text class="text-[11px] font-medium text-foreground">{props.contact.name}</Text>
        <Text class="text-[9.5px] text-muted-foreground">{props.contact.company}</Text>
      </View>
      <Text class="w-24 text-[9.5px] text-muted-foreground">{props.contact.owner}</Text>
      <Badge variant={props.contact.status === "active" ? "success" : "outline"}>
        <Text
          class="text-[8.5px] font-medium capitalize"
          style={{
            color: props.contact.status === "active" ? token("success") : token("muted-foreground"),
          }}
        >
          {props.contact.status}
        </Text>
      </Badge>
    </View>
  );
}
