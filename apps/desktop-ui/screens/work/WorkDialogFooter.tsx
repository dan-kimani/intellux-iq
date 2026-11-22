import { Text } from "nsh";
import { DialogActions } from "../../components/overlay";
import { Button, Icon } from "../../components/ui";
import type { WorkMode } from "./types";

export function WorkDialogFooter(props: {
  mode: WorkMode;
  editing: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <DialogActions>
      <Button variant="ghost" size="sm" onPress={props.onClose}>
        <Text class="text-[12px] font-medium">Cancel</Text>
      </Button>
      <Button variant="primary" size="sm" onPress={props.onSave} testID="save-work-item">
        <Icon
          name={
            props.mode === "reminder"
              ? "calendarClock"
              : props.mode === "activity"
                ? "fileText"
                : "checkCheck"
          }
          size={11}
          tone="primary-foreground"
        />
        <Text class="text-[12px] font-semibold text-primary-foreground">
          {props.editing
            ? "Save changes"
            : props.mode === "task"
              ? "Create task"
              : props.mode === "activity"
                ? "Log activity"
                : "Set reminder"}
        </Text>
      </Button>
    </DialogActions>
  );
}
