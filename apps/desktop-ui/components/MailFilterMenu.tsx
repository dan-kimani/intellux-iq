import { signal, Text, token, View } from "nsh";
import { Popover } from "nsh/base";
import { Button, Icon } from "./ui";
import { showToast } from "../state";
import {
  mailAttachmentsOnly,
  mailSort,
  mailStarredOnly,
  mailUnreadOnly,
  type MailSort,
} from "../screens/inbox/mailState";

function Option(props: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <View
      role="button"
      accessibilityLabel={props.label}
      onPress={props.onPress}
      class="h-8 flex-row items-center gap-2 rounded-md px-2"
      hoverStyle={{ backgroundColor: token("accent") }}
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
      <Text class="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {props.label}
      </Text>
      {props.children}
    </View>
  );
}

const sorts: MailSort[] = ["Recent", "Oldest", "Sender"];

export function MailFilterMenu() {
  const open = signal(false);
  return (
    <Popover
      open={open()}
      onOpenChange={({ open: next }) => open.set(next)}
      placement="bottom"
      align="end"
      offset={6}
      popupClass="rounded-lg border border-border bg-popover p-2 shadow-2xl"
      popupStyle={{ width: 236 }}
      trigger={
        <View
          role="button"
          accessibilityLabel="Filter mail"
          testID="mail-filter-trigger"
          class="h-7 w-7 items-center justify-center rounded-md"
          hoverStyle={{ backgroundColor: token("accent") }}
        >
          <Icon name="funnel" size={13} tone="muted-foreground" />
        </View>
      }
    >
      <View class="gap-2" testID="mail-filter-popover">
        <View class="flex-row items-center justify-between px-2 py-1">
          <Text class="text-[12px] font-semibold text-foreground">Filter mail</Text>
          <View
            role="button"
            accessibilityLabel="Reset mail filters"
            onPress={() => {
              mailUnreadOnly.set(false);
              mailAttachmentsOnly.set(false);
              mailStarredOnly.set(false);
              mailSort.set("Recent");
            }}
            class="rounded px-1.5 py-0.5"
            hoverStyle={{ backgroundColor: token("accent") }}
          >
            <Text class="text-[11px] text-muted-foreground">Reset</Text>
          </View>
        </View>
        <Section label="Show">
          <Option
            label="Unread only"
            selected={mailUnreadOnly()}
            onPress={() => mailUnreadOnly.set(!mailUnreadOnly())}
          />
          <Option
            label="Has attachment"
            selected={mailAttachmentsOnly()}
            onPress={() => mailAttachmentsOnly.set(!mailAttachmentsOnly())}
          />
          <Option
            label="Starred only"
            selected={mailStarredOnly()}
            onPress={() => mailStarredOnly.set(!mailStarredOnly())}
          />
        </Section>
        <View class="h-px bg-border" />
        <Section label="Sort">
          <Each of={sorts}>
            {(sort: () => MailSort) => (
              <Option
                label={sort()}
                selected={mailSort() === sort()}
                onPress={() => mailSort.set(sort())}
              />
            )}
          </Each>
        </Section>
        <Button
          variant="primary"
          size="sm"
          testID="apply-mail-filter"
          onPress={() => {
            open.set(false);
            showToast("Mail view updated.");
          }}
        >
          <Text class="text-[12px] font-semibold text-primary-foreground">Done</Text>
        </Button>
      </View>
    </Popover>
  );
}
