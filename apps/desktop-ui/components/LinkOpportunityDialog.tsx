import { Text, token, View } from "nsh";
import { AppDialog, DialogActions } from "./overlay";
import { Badge, Button, Icon } from "./ui";
import { linkOpportunityOpen, selectedConversation, showToast } from "../state";
import { openNewOpportunity } from "../screens/opportunities/state";
import { linkDeal, unlinkedDeals } from "../screens/opportunities/actions";

export function LinkOpportunityDialog() {
  const conversation = selectedConversation();
  const available = unlinkedDeals(conversation);
  return (
    <AppDialog
      open={() => true}
      onClose={() => linkOpportunityOpen.set(false)}
      title="Link an opportunity"
      description="A conversation can carry zero, one, or several opportunities."
      width={500}
      testID="link-opportunity-dialog"
      footer={
        <DialogActions>
          <Button
            variant="outline"
            size="sm"
            testID="link-opportunity-new"
            onPress={() => {
              linkOpportunityOpen.set(false);
              openNewOpportunity(conversation.id);
            }}
          >
            <Icon name="plus" size={10} tone="muted-foreground" />
            <Text class="text-[12px] font-medium">New opportunity</Text>
          </Button>
          <Button variant="primary" size="sm" onPress={() => linkOpportunityOpen.set(false)}>
            <Text class="text-[12px] font-medium">Done</Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-2">
        <If when={available.length === 0}>
          <View class="items-center gap-1 py-6">
            <Text class="text-[12px] font-medium text-foreground">All opportunities linked</Text>
            <Text class="text-[11px] text-muted-foreground">
              Create a new opportunity from the side panel to add another.
            </Text>
          </View>
        </If>
        <Each of={available}>
          {(deal: () => (typeof available)[number]) => (
            <View
              role="button"
              accessibilityLabel={`Link ${deal().name}`}
              testID={`link-opportunity-${deal().id}`}
              onPress={() => {
                linkDeal(conversation, deal());
                linkOpportunityOpen.set(false);
                showToast(`${deal().name} linked to this conversation.`);
              }}
              class="flex-row items-center gap-2.5 rounded-lg border border-border px-3 py-2.5"
              hoverStyle={{ backgroundColor: token("accent") }}
            >
              <Icon name="briefcase" size={13} tone="muted-foreground" />
              <View class="min-w-0 flex-1 gap-0.5">
                <Text class="text-[12px] font-medium text-foreground">{deal().name}</Text>
                <Text class="text-[11px] text-muted-foreground">
                  {deal().company} · {deal().owner} · {deal().expectedClose}
                </Text>
              </View>
              <Badge variant="outline">
                <Text class="text-[11px] capitalize text-muted-foreground">{deal().stage}</Text>
              </Badge>
              <Text class="text-[12px] font-semibold text-foreground">{deal().value}</Text>
            </View>
          )}
        </Each>
      </View>
    </AppDialog>
  );
}
