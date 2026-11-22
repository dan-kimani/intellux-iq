import { Text, token, View } from "nsh";
import { ActionMenu } from "../../components/ActionMenu";
import { Icon } from "../../components/ui";
import { currentMember, teamMembers } from "../../state";

export function taskOwnerOptions(): { id: string; label: string }[] {
  return teamMembers.map((member) => ({
    id: member.id,
    label: `${member.name}${member.id === currentMember.id ? " (me)" : ""}`,
  }));
}

export function OwnerPicker(props: { value: string; onChange: (name: string) => void }) {
  return (
    <ActionMenu
      testID="owner-picker-menu"
      width={200}
      trigger={
        <View
          role="button"
          accessibilityLabel={`Owner: ${props.value}`}
          class="h-7 flex-row items-center gap-1 rounded-md border border-border bg-card px-2"
          hoverStyle={{ backgroundColor: token("accent") }}
        >
          <Text class="max-w-36 truncate text-[12px] font-medium text-foreground">
            {props.value}
          </Text>
          <Icon name="chevronDown" size={8} tone="muted-foreground" />
        </View>
      }
      groups={[
        teamMembers.map((member) => ({
          id: `pick-owner-${member.id}`,
          label: member.name,
          icon: "users" as const,
          onSelect: () => props.onChange(member.name),
        })),
      ]}
    />
  );
}
