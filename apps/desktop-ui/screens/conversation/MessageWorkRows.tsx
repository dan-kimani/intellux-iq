import { Text, token, View } from "nsh";
import { Icon, type IconName } from "../../components/ui";
import type { Conversation } from "../../data";
import { messageLink } from "../work/links";
import { openWorkDialog } from "../work/state";
import type { ActionableMessage } from "./message-actions";
import type { WorkMode } from "../work/types";

function WorkRow(props: {
  id: string;
  label: string;
  icon: IconName;
  mode: WorkMode;
  conversation: Conversation;
  message: ActionableMessage;
  onClose: () => void;
}) {
  return (
    <View
      role="button"
      accessibilityLabel={props.label}
      testID={`message-action-${props.id}`}
      onPress={() => {
        props.onClose();
        openWorkDialog({
          mode: props.mode,
          link: messageLink(props.conversation, props.message),
        });
      }}
      class="h-8 flex-row items-center gap-2.5 rounded-md px-2"
      hoverStyle={{ backgroundColor: token("accent") }}
    >
      <Icon name={props.icon} size={13} tone="muted-foreground" />
      <Text class="flex-1 text-[12px] text-foreground">{props.label}</Text>
    </View>
  );
}

export function MessageWorkRows(props: {
  conversation: Conversation;
  message: ActionableMessage;
  onClose: () => void;
}) {
  return (
    <>
      <View class="my-0.5 h-px bg-border" />
      <WorkRow
        id="work-task"
        label="Create task"
        icon="checkCheck"
        mode="task"
        conversation={props.conversation}
        message={props.message}
        onClose={props.onClose}
      />
      <WorkRow
        id="work-activity"
        label="Log activity"
        icon="fileText"
        mode="activity"
        conversation={props.conversation}
        message={props.message}
        onClose={props.onClose}
      />
      <WorkRow
        id="work-reminder"
        label="Set reminder"
        icon="calendarClock"
        mode="reminder"
        conversation={props.conversation}
        message={props.message}
        onClose={props.onClose}
      />
      <View class="my-0.5 h-px bg-border" />
    </>
  );
}
