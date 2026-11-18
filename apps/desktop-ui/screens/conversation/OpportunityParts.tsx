import { Text, token, View } from "nsh";
import { ActionMenu } from "../../components/ActionMenu";
import { Icon } from "../../components/ui";
import { type OpportunityLink, stageLabels } from "../../data";
import { opportunityStages } from "../opportunities/actions";

export function StageStep(props: { label: string; index: number; current: number }) {
  const completed = props.index < props.current;
  const active = props.index === props.current;
  return (
    <View class="relative z-10 flex-1 items-center gap-1">
      <View
        class="items-center justify-center rounded-full border"
        style={{
          width: 22,
          height: 22,
          backgroundColor: completed
            ? token("success")
            : active
              ? token("primary")
              : token("background"),
          borderColor: completed ? token("success") : active ? token("primary") : token("border"),
        }}
      >
        <If
          when={completed}
          else={
            <View
              class="rounded-full"
              style={{
                width: active ? 6 : 4,
                height: active ? 6 : 4,
                backgroundColor: active ? token("primary-foreground") : token("muted-foreground"),
              }}
            />
          }
        >
          <Icon name="check" size={11} tone="success-foreground" />
        </If>
      </View>
      <Text
        class="text-[8px] font-medium"
        style={{
          numberOfLines: 1,
          color: active
            ? token("primary")
            : completed
              ? token("foreground")
              : token("muted-foreground"),
        }}
      >
        {props.label}
      </Text>
    </View>
  );
}

export function StageMenu(props: {
  opportunity: OpportunityLink;
  onChange: (stage: OpportunityLink["stage"]) => void;
}) {
  return (
    <ActionMenu
      testID="opportunity-stage-menu"
      width={210}
      trigger={
        <View
          role="button"
          accessibilityLabel="Change opportunity stage"
          testID="opportunity-stage-menu"
          class="h-7 flex-row items-center gap-1 rounded-md border border-border px-2"
          hoverStyle={{ backgroundColor: token("accent") }}
        >
          <Text class="text-[9.5px] font-medium text-foreground">Stage</Text>
          <Icon name="chevronDown" size={9} tone="muted-foreground" />
        </View>
      }
      groups={[
        opportunityStages.map((stage) => ({
          id: `stage-${stage}`,
          label: stageLabels.find((item) => item.id === stage)?.label ?? stage,
          icon: stage === "won" ? "checkCheck" : "arrowUpRight",
          disabled: props.opportunity.stage === stage,
          onSelect: () => props.onChange(stage),
        })),
      ]}
    />
  );
}
