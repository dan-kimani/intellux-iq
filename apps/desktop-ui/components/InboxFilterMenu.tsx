import { signal, Text, token, View } from "nsh";
import { Popover } from "nsh/base";
import { Button, Icon } from "./ui";
import { channelFilter, inboxScope, inboxSort, inboxUnreadOnly, showToast } from "../state";

function Option(props: { label: string; selected: boolean; onPress: () => void; testID?: string }) {
  return (
    <View
      role="button"
      accessibilityLabel={props.label}
      testID={props.testID}
      onPress={props.onPress}
      class="h-8 flex-row items-center gap-2 rounded-md px-2"
      hoverStyle={{ backgroundColor: token("accent") }}
      focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: -2 }}
    >
      <View
        class="h-3.5 w-3.5 items-center justify-center rounded-full border"
        style={{
          borderColor: props.selected ? token("primary") : token("border"),
          backgroundColor: props.selected ? token("primary") : "transparent",
        }}
      >
        <If when={props.selected}>
          <View class="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
        </If>
      </View>
      <Text class="flex-1 text-[12px] text-foreground">{props.label}</Text>
    </View>
  );
}

function Section(props: { label: string; children?: import("nsh").JSX.Element }) {
  return (
    <View class="gap-0.5">
      <Text class="px-2 pb-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {props.label}
      </Text>
      {props.children}
    </View>
  );
}

export function InboxFilterMenu() {
  const open = signal(false);
  return (
    <Popover
      open={open()}
      onOpenChange={({ open: next }) => open.set(next)}
      placement="bottom"
      align="end"
      offset={6}
      popupClass="rounded-lg border border-border bg-popover p-2 shadow-2xl transition duration-150 ease-out motion-reduce:transition-none"
      popupStartingClass="opacity-0 -translate-y-1"
      popupEndingClass="opacity-0"
      popupStyle={{ width: 248 }}
      trigger={
        <View
          role="button"
          accessibilityLabel="Filter inbox"
          testID="inbox-filter-trigger"
          class="h-8 w-8 items-center justify-center rounded-md"
          hoverStyle={{ backgroundColor: token("accent") }}
          focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: -2 }}
        >
          <Icon name="funnel" size={14} tone="muted-foreground" />
        </View>
      }
    >
      <View class="gap-2" testID="inbox-filter-popover">
        <View class="flex-row items-center justify-between px-2 py-1">
          <Text class="text-[12.5px] font-semibold text-foreground">Filter inbox</Text>
          <View
            role="button"
            accessibilityLabel="Reset inbox filters"
            onPress={() => {
              channelFilter.set("all");
              inboxScope.set("all");
              inboxUnreadOnly.set(false);
              inboxSort.set("Recent");
            }}
            class="rounded px-1.5 py-0.5"
            hoverStyle={{ backgroundColor: token("accent") }}
          >
            <Text class="text-[10px] text-muted-foreground">Reset</Text>
          </View>
        </View>
        <Section label="Scope">
          <Option
            label="All conversations"
            selected={inboxScope() === "all"}
            onPress={() => inboxScope.set("all")}
          />
          <Option
            label="My conversations"
            selected={inboxScope() === "mine"}
            onPress={() => inboxScope.set("mine")}
          />
        </Section>
        <View class="h-px bg-border" />
        <Section label="Channel">
          <Option
            label="All channels"
            selected={channelFilter() === "all"}
            onPress={() => channelFilter.set("all")}
          />
          <Option
            label="WhatsApp"
            selected={channelFilter() === "whatsapp"}
            onPress={() => channelFilter.set("whatsapp")}
          />
          <Option
            label="Email"
            selected={channelFilter() === "email"}
            onPress={() => channelFilter.set("email")}
          />
        </Section>
        <View class="h-px bg-border" />
        <Section label="Show">
          <Option
            label="Unread only"
            selected={inboxUnreadOnly()}
            onPress={() => inboxUnreadOnly.set(!inboxUnreadOnly())}
          />
        </Section>
        <View class="h-px bg-border" />
        <Section label="Sort">
          <Option
            label="Recent"
            selected={inboxSort() === "Recent"}
            onPress={() => inboxSort.set("Recent")}
          />
          <Option
            label="Oldest"
            selected={inboxSort() === "Oldest"}
            onPress={() => inboxSort.set("Oldest")}
          />
          <Option
            label="Unread first"
            selected={inboxSort() === "Unread first"}
            onPress={() => inboxSort.set("Unread first")}
          />
        </Section>
        <View class="flex-row items-center justify-between border-t border-border px-1 pt-2">
          <Text class="text-[10px] text-muted-foreground">Read visibility stays org-wide.</Text>
          <Button
            variant="primary"
            size="sm"
            testID="apply-inbox-filter"
            onPress={() => {
              open.set(false);
              showToast("Inbox view updated.");
            }}
          >
            <Text class="text-[10px] font-semibold text-primary-foreground">Done</Text>
          </Button>
        </View>
      </View>
    </Popover>
  );
}
