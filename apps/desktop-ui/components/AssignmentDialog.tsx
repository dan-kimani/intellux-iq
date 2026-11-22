import { Text, token, View } from "nsh";
import { AppDialog, DialogActions } from "./overlay";
import { Avatar, Button, Icon } from "./ui";
import {
  assignmentDialogOpen,
  assignmentFor,
  assignConversationTo,
  currentMember,
  selectedConversation,
  showToast,
  teamMembers,
} from "../state";

const close = () => assignmentDialogOpen.set(false);

export function AssignmentDialog() {
  const conversation = selectedConversation();
  const current = assignmentFor(conversation);
  return (
    <AppDialog
      open={() => true}
      onClose={close}
      title="Conversation owner"
      description="Messaging writes are limited to the owner. Managers can reassign or unassign."
      width={460}
      testID="assignment-dialog"
      footer={
        <DialogActions>
          <Button variant="outline" size="sm" onPress={close}>
            <Text class="text-[12px] font-medium">Done</Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-3">
        <View class="gap-1 rounded-lg border border-border bg-panel p-3">
          <Text class="text-[11px] uppercase tracking-wider text-muted-foreground">
            Current owner
          </Text>
          <Text class="text-[13px] font-medium text-foreground">
            {current ? current.name : "Unassigned"}
          </Text>
          <Text class="text-[11px] text-muted-foreground">
            {current
              ? `${current.source.replaceAll("_", " ")} · assigned ${current.at} by ${current.by}`
              : "Read-only for sales until a manager or the routing engine assigns it."}
          </Text>
        </View>
        <View class="gap-1">
          <Each of={teamMembers}>
            {(member: () => (typeof teamMembers)[number]) => (
              <View
                role="button"
                accessibilityLabel={`Assign to ${member().name}`}
                testID={`assign-user-${member().id}`}
                onPress={() => {
                  assignConversationTo(conversation.id, member().id);
                  close();
                  showToast(`Assigned to ${member().name}.`);
                }}
                class="flex-row items-center gap-2.5 rounded-lg border border-border px-3 py-2"
                hoverStyle={{ backgroundColor: token("accent") }}
              >
                <Avatar name={member().name} size={30} />
                <View class="min-w-0 flex-1 gap-0.5">
                  <Text class="text-[12px] font-medium text-foreground">
                    {member().name}
                    {member().id === currentMember.id ? " · you" : ""}
                  </Text>
                  <Text class="text-[11px] text-muted-foreground">
                    {member().title} · {member().role}
                  </Text>
                </View>
                <If when={current?.userId === member().id}>
                  <Icon name="check" size={13} tone="success" />
                </If>
              </View>
            )}
          </Each>
        </View>
        <View
          role="button"
          accessibilityLabel="Unassign conversation"
          testID="assign-unassigned"
          onPress={() => {
            assignConversationTo(conversation.id, null);
            close();
            showToast("Conversation unassigned.");
          }}
          class="h-8 items-center justify-center rounded-md border border-dashed border-border"
          hoverStyle={{ backgroundColor: token("accent") }}
        >
          <Text class="text-[12px] font-medium text-muted-foreground">Unassign</Text>
        </View>
      </View>
    </AppDialog>
  );
}
