import { effect, type KeyEvent, Text, token, View, type ViewRef } from "nsh";
import { Button, Card, SectionTitle } from "../../components/ui";
import {
  assignShortcut,
  chordFromKeyEvent,
  recordingShortcut,
  resetAllShortcuts,
  resetShortcut,
  shortcutCommands,
  shortcutError,
  shortcutIsCustom,
  shortcutLabel,
  startRecording,
  stopRecording,
  type ShortcutCommand,
} from "./shortcuts";

function ShortcutRecorder(props: { command: ShortcutCommand }) {
  let node: ViewRef | undefined;

  effect(() => {
    const timer = setTimeout(() => node?.focus(), 0);
    return () => clearTimeout(timer);
  });

  const onKeyDown = (event: KeyEvent) => {
    if (event.key === "Escape") {
      stopRecording();
      return;
    }
    const plainDelete =
      (event.key === "Backspace" || event.key === "Delete") &&
      !event.modifiers.control &&
      !event.modifiers.alt &&
      !event.modifiers.shift &&
      !event.modifiers.platform;
    if (plainDelete) {
      resetShortcut(props.command.id);
      stopRecording();
      return;
    }
    const binding = chordFromKeyEvent(event);
    if (!binding) return;
    if (assignShortcut(props.command.id, binding)) stopRecording();
  };

  return (
    <View
      ref={(value) => {
        node = value;
      }}
      role="button"
      focusable
      captureKeys="all"
      accessibilityLabel={`Recording ${props.command.label}. Press the new keys, Escape to cancel, or Backspace to reset.`}
      testID={`shortcut-recorder-${props.command.id}`}
      onPress={() => node?.focus()}
      onKeyDown={onKeyDown}
      onBlur={() => stopRecording()}
      class="h-8 min-w-40 items-center justify-center rounded-md border border-ring bg-accent px-2.5"
    >
      <Text class="text-[10px] font-medium text-foreground">Press new keys…</Text>
    </View>
  );
}

function ShortcutBinding(props: { command: ShortcutCommand }) {
  return (
    <View class="flex-row items-center gap-1.5">
      <View
        role="button"
        accessibilityLabel={`Change shortcut for ${props.command.label}, currently ${shortcutLabel(props.command.id)}`}
        testID={`shortcut-binding-${props.command.id}`}
        onPress={() => startRecording(props.command.id)}
        class="h-7 min-w-24 items-center justify-center rounded-md border border-border bg-background px-2"
        hoverStyle={{ backgroundColor: token("accent") }}
        focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
      >
        <Text class="font-mono text-[10px] font-medium text-foreground">
          {shortcutLabel(props.command.id)}
        </Text>
      </View>
      <Button
        variant="ghost"
        size="sm"
        disabled={!shortcutIsCustom(props.command.id)}
        testID={`shortcut-reset-${props.command.id}`}
        onPress={() => resetShortcut(props.command.id)}
      >
        <Text class="text-[9.5px] font-medium">Reset</Text>
      </Button>
    </View>
  );
}

function customShortcutCount(): number {
  return shortcutCommands.filter((command) => shortcutIsCustom(command.id)).length;
}

export function ShortcutsPanel() {
  return (
    <Card testID="shortcuts-panel" class="gap-2 p-4">
      <SectionTitle
        action={
          <Button
            variant="ghost"
            size="sm"
            disabled={customShortcutCount() === 0}
            testID="shortcut-reset-all"
            onPress={resetAllShortcuts}
          >
            <Text class="text-[9px] font-medium">Reset all</Text>
          </Button>
        }
      >
        Keyboard shortcuts
      </SectionTitle>
      <Text class="text-[10.5px] leading-4 text-muted-foreground">
        These work anywhere in the app. Select a binding and press the new keys; Escape cancels and
        Backspace resets.
      </Text>
      <If when={shortcutError()}>
        <View class="rounded-md border border-destructive/30 bg-destructive/10 px-2.5 py-1.5">
          <Text class="text-[10px] font-medium text-destructive">{shortcutError()}</Text>
        </View>
      </If>
      <Each of={shortcutCommands}>
        {(command: () => ShortcutCommand) => (
          <View class="flex-row items-center gap-4 border-t border-border py-2.5">
            <View class="min-w-0 flex-1 gap-0.5">
              <Text class="text-[10.5px] font-medium text-foreground">{command().label}</Text>
              <Text class="text-[9px] text-muted-foreground">{command().description}</Text>
            </View>
            <If
              when={recordingShortcut() === command().id}
              else={<ShortcutBinding command={command()} />}
            >
              <ShortcutRecorder command={command()} />
            </If>
          </View>
        )}
      </Each>
      <View class="border-t border-border pt-2">
        <Text class="text-[9px] leading-3.5 text-muted-foreground">
          Bindings are saved on this device. A chord already used by another command is rejected.
        </Text>
      </View>
    </Card>
  );
}
