import { Text, token, View } from "nsh";
import { AppDialog, DialogActions } from "./overlay";
import { Button, Icon } from "./ui";
import {
  addConversationTag,
  removeConversationTag,
  selectedConversation,
  showToast,
  tagDialogOpen,
  tagsFor,
} from "../state";

const presets = ["VIP", "BulkOrder", "PricePushback", "Wholesale", "Tender", "Distributor"];

export function TagDialog() {
  const conversation = selectedConversation();
  const tags = tagsFor(conversation);
  return (
    <AppDialog
      open={() => true}
      onClose={() => tagDialogOpen.set(false)}
      title="Conversation tags"
      description="Tags are team-visible and deterministic. They never change the customer conversation."
      width={430}
      testID="tag-dialog"
      footer={
        <DialogActions>
          <Button
            variant="primary"
            size="sm"
            onPress={() => {
              tagDialogOpen.set(false);
              showToast("Conversation tags updated.");
            }}
          >
            <Text class="text-[10px] font-semibold text-primary-foreground">Done</Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-3">
        <View class="gap-1">
          <Text class="text-[9px] uppercase tracking-wide text-muted-foreground">Applied</Text>
          <View class="flex-row flex-wrap gap-1.5">
            <If when={tags.length === 0}>
              <Text class="text-[10px] text-muted-foreground">No tags applied.</Text>
            </If>
            <Each of={tags}>
              {(tag: () => string) => (
                <View class="h-6 flex-row items-center gap-1 rounded-md bg-muted px-2">
                  <Text class="text-[9px] font-medium text-foreground">#{tag()}</Text>
                  <View
                    role="button"
                    accessibilityLabel={`Remove ${tag()} tag`}
                    onPress={() => removeConversationTag(conversation, tag())}
                  >
                    <Icon name="close" size={9} tone="muted-foreground" />
                  </View>
                </View>
              )}
            </Each>
          </View>
        </View>
        <View class="gap-1">
          <Text class="text-[9px] uppercase tracking-wide text-muted-foreground">Add a tag</Text>
          <View class="flex-row flex-wrap gap-1.5">
            <Each of={presets}>
              {(tag: () => string) => (
                <View
                  role="button"
                  accessibilityLabel={`Add ${tag()} tag`}
                  onPress={() => addConversationTag(conversation, tag())}
                  class="h-7 items-center justify-center rounded-md border border-border px-2.5"
                  hoverStyle={{ backgroundColor: token("accent") }}
                >
                  <Text class="text-[9.5px] font-medium text-foreground">#{tag()}</Text>
                </View>
              )}
            </Each>
          </View>
        </View>
      </View>
    </AppDialog>
  );
}
