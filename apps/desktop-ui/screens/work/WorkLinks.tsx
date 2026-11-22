import { Text, token, View } from "nsh";
import { Icon } from "../../components/ui";
import { linkKey, workLinkIcon, workLinkLabel } from "./links";
import { LinkPicker } from "./LinkPicker";
import type { WorkLink } from "./types";

export function WorkLinkChips(props: {
  links: WorkLink[];
  onAdd?: (link: WorkLink) => void;
  onRemove?: (link: WorkLink) => void;
  onOpen?: (link: WorkLink) => void;
  onSetSource?: (link: WorkLink) => void;
  lockSource?: boolean;
  sourceKey?: string;
  showPicker?: boolean;
  pickerTestID?: string;
}) {
  return (
    <View class="gap-2">
      <If
        when={props.links.length > 0}
        else={<Text class="text-[11px] text-muted-foreground">No linked records yet.</Text>}
      >
        <View class="flex-row flex-wrap gap-1.5">
          <Each of={props.links}>
            {(link: () => WorkLink) => (
              <View
                class="max-w-full flex-row items-center gap-1.5 rounded-md border border-border bg-panel py-1 pl-2 pr-1"
                testID={`work-link-chip-${link().type}-${link().id}`}
              >
                <Icon name={workLinkIcon(link().type)} size={10} tone="muted-foreground" />
                <View class="min-w-0 gap-0.5">
                  <Text
                    class="text-[11px] font-medium text-foreground"
                    style={{ numberOfLines: 1 }}
                  >
                    {link().label}
                  </Text>
                  <Text class="text-[11px] text-muted-foreground" style={{ numberOfLines: 1 }}>
                    {workLinkLabel(link().type)} · {link().detail}
                  </Text>
                </View>
                <If when={props.onSetSource && linkKey(link()) !== props.sourceKey}>
                  <View
                    role="button"
                    accessibilityLabel={`Make ${link().label} the source`}
                    testID={`make-source-${link().type}-${link().id}`}
                    onPress={() => props.onSetSource?.(link())}
                    class="h-5 w-5 items-center justify-center rounded"
                    hoverStyle={{ backgroundColor: token("accent") }}
                  >
                    <Icon name="star" size={8} tone="muted-foreground" />
                  </View>
                </If>
                <If when={props.onOpen}>
                  <View
                    role="button"
                    accessibilityLabel={`Open link ${link().label}`}
                    onPress={() => props.onOpen?.(link())}
                    class="h-5 w-5 items-center justify-center rounded"
                    hoverStyle={{ backgroundColor: token("accent") }}
                  >
                    <Icon name="arrowUpRight" size={8} tone="muted-foreground" />
                  </View>
                </If>
                <If
                  when={
                    props.onRemove && (!props.lockSource || linkKey(link()) !== props.sourceKey)
                  }
                >
                  <View
                    role="button"
                    accessibilityLabel={`Remove link ${link().label}`}
                    onPress={() => props.onRemove?.(link())}
                    class="h-5 w-5 items-center justify-center rounded"
                    hoverStyle={{ backgroundColor: token("accent") }}
                  >
                    <Icon name="close" size={8} tone="muted-foreground" />
                  </View>
                </If>
              </View>
            )}
          </Each>
        </View>
      </If>
      <If when={props.onAdd && props.showPicker !== false}>
        <View class="flex-row items-center gap-2">
          <LinkPicker
            selected={props.links}
            onSelect={(link) => props.onAdd?.(link)}
            triggerTestID={props.pickerTestID}
          />
          <Text class="text-[11px] text-muted-foreground">
            Link a message, thread, quote, or other record.
          </Text>
        </View>
      </If>
    </View>
  );
}
