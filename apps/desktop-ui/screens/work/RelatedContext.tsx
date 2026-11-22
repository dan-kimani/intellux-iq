import { Text, View } from "nsh";
import { Icon } from "../../components/ui";
import { workLinkLabel } from "./links";
import { LinkPicker } from "./LinkPicker";
import type { WorkLink } from "./types";
import { WorkLinkChips } from "./WorkLinks";

export function RelatedContext(props: {
  links: WorkLink[];
  autoLinked: boolean;
  primaryType?: string;
  onAdd: (link: WorkLink) => void;
  onRemove: (link: WorkLink) => void;
}) {
  return (
    <View
      class="gap-1.5 rounded-xl border border-border bg-panel p-2"
      testID="work-related-context"
    >
      <View class="flex-row items-center justify-between gap-2">
        <View class="flex-row items-center gap-1.5">
          <Icon name="users" size={11} tone="muted-foreground" />
          <Text class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Related to
          </Text>
        </View>
        <If when={props.autoLinked && props.links.length > 0}>
          <Text class="text-[11px] font-medium text-highlight">
            Auto-linked from{" "}
            {props.primaryType ? workLinkLabel(props.primaryType as WorkLink["type"]) : "context"}
          </Text>
        </If>
      </View>
      <If
        when={props.links.length > 0}
        else={
          <View class="flex-row items-center gap-2">
            <Text class="flex-1 text-[11px] text-muted-foreground">
              No customer context linked yet.
            </Text>
            <LinkPicker
              selected={props.links}
              onSelect={props.onAdd}
              triggerTestID="work-dialog-add-link"
            />
          </View>
        }
      >
        <WorkLinkChips
          links={props.links}
          onAdd={props.onAdd}
          onRemove={props.onRemove}
          pickerTestID="work-dialog-add-link"
        />
      </If>
    </View>
  );
}
