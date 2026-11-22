import { Text, token, View } from "nsh";

function Command(props: { label: string; testID: string; onPress: () => void }) {
  return (
    <View
      role="button"
      accessibilityLabel={props.label}
      testID={props.testID}
      onPress={props.onPress}
      class="h-6 flex-row items-center gap-1 rounded px-2"
      hoverStyle={{ backgroundColor: token("accent") }}
    >
      <Text class="text-[11px] font-medium text-foreground">{props.label}</Text>
    </View>
  );
}

export function SlashCommandMenu(props: {
  onTemplate: () => void;
  onNote: () => void;
  onTag: () => void;
  onRemind: () => void;
}) {
  return (
    <View
      class="mb-2 flex-row gap-1.5 rounded-lg border border-border bg-popover p-1.5"
      testID="slash-menu"
    >
      <Command label="/template" testID="slash-template" onPress={props.onTemplate} />
      <Command label="/note" testID="slash-note" onPress={props.onNote} />
      <Command label="/tag" testID="slash-tag" onPress={props.onTag} />
      <Command label="/remind" testID="slash-remind" onPress={props.onRemind} />
    </View>
  );
}
