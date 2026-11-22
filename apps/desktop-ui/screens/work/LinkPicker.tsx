import { signal, Text, token, View } from "nsh";
import { Input as NativeInput, Popover } from "nsh/base";
import { Icon } from "../../components/ui";
import { allConversations } from "../../state";
import { contacts } from "../contacts/data";
import { dealRows } from "../deals/state";
import { mailRows } from "../inbox/mail";
import { products } from "../catalog/data";
import { quoteRows } from "../quotes/state";
import {
  companyLink,
  contactLink,
  conversationLink,
  emailThreadLink,
  linkKey,
  messageLink,
  opportunityLink,
  productLink,
  quoteLink,
  workLinkIcon,
  workLinkLabel,
} from "./links";
import type { WorkLink } from "./types";

interface Candidate {
  link: WorkLink;
  typeLabel: string;
}

function candidates(): Candidate[] {
  const rows: Candidate[] = [];
  for (const conversation of allConversations()) {
    rows.push({ link: conversationLink(conversation), typeLabel: "Conversation" });
    for (const message of conversation.messages) {
      if (message.kind === "system" || message.kind === "whisper") continue;
      rows.push({ link: messageLink(conversation, message), typeLabel: "Message" });
    }
  }
  for (const mail of mailRows()) {
    rows.push({ link: emailThreadLink(mail), typeLabel: "Email thread" });
  }
  for (const contact of contacts) {
    rows.push({ link: contactLink(contact), typeLabel: "Contact" });
  }
  const companies = new Set([
    ...contacts.map((contact) => contact.company),
    ...dealRows().map((deal) => deal.company),
  ]);
  for (const company of companies) {
    if (company) rows.push({ link: companyLink(company), typeLabel: "Company" });
  }
  for (const deal of dealRows()) {
    rows.push({ link: opportunityLink(deal), typeLabel: "Opportunity" });
  }
  for (const quote of quoteRows()) {
    rows.push({ link: quoteLink(quote), typeLabel: "Quote" });
  }
  for (const product of products) {
    rows.push({ link: productLink(product), typeLabel: "Product" });
  }
  return rows;
}

export function LinkPicker(props: {
  selected: WorkLink[];
  onSelect: (link: WorkLink) => void;
  triggerTestID?: string;
}) {
  const open = signal(false);
  const query = signal("");
  const available = () => {
    const chosen = new Set(props.selected.map(linkKey));
    const needle = query().trim().toLowerCase();
    return candidates()
      .filter((row) => !chosen.has(linkKey(row.link)))
      .filter((row) => {
        if (!needle) return true;
        return `${row.typeLabel} ${row.link.label} ${row.link.detail}`
          .toLowerCase()
          .includes(needle);
      })
      .slice(0, needle ? 8 : 6);
  };

  return (
    <Popover
      open={open()}
      onOpenChange={({ open: next }) => open.set(next)}
      placement="bottom"
      align="start"
      offset={6}
      popupClass="overflow-hidden rounded-xl border border-border bg-popover p-2 shadow-2xl"
      popupStyle={{ width: 380 }}
      trigger={
        <View
          role="button"
          accessibilityLabel="Add link"
          testID={props.triggerTestID ?? "add-work-link"}
          class="h-7 flex-row items-center gap-1 rounded-md border border-dashed border-border px-2"
          hoverStyle={{ backgroundColor: token("accent"), borderColor: token("ring") }}
          focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
        >
          <Icon name="plus" size={9} tone="muted-foreground" />
          <Text class="text-[11px] font-medium text-muted-foreground">Add link</Text>
        </View>
      }
    >
      <View class="gap-2">
        <NativeInput
          value={query()}
          onChange={({ value }) => query.set(value)}
          placeholder="Search messages, quotes, contacts…"
          testID="work-link-search"
          style={{
            height: 32,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: token("border"),
            backgroundColor: token("card"),
            paddingLeft: 8,
            paddingRight: 8,
            fontSize: 13,
            color: token("foreground"),
            placeholderColor: token("muted-foreground"),
          }}
        />
        <View class="gap-1">
          <Each of={available()}>
            {(row: () => Candidate) => (
              <View
                role="button"
                testID={`work-link-${row().link.type}-${row().link.id}`}
                accessibilityLabel={`Link ${row().link.label}`}
                onPress={() => {
                  props.onSelect(row().link);
                  query.set("");
                  open.set(false);
                }}
                class="flex-row items-center gap-2 rounded-md px-2 py-1.5"
                hoverStyle={{ backgroundColor: token("accent") }}
              >
                <Icon name={workLinkIcon(row().link.type)} size={11} tone="muted-foreground" />
                <View class="min-w-0 flex-1 gap-0.5">
                  <Text
                    class="text-[12px] font-medium text-foreground"
                    style={{ numberOfLines: 1 }}
                  >
                    {row().link.label}
                  </Text>
                  <Text class="text-[11px] text-muted-foreground" style={{ numberOfLines: 1 }}>
                    {workLinkLabel(row().link.type)} · {row().link.detail}
                  </Text>
                </View>
              </View>
            )}
          </Each>
          <If when={available().length === 0}>
            <Text class="px-2 py-3 text-[11px] text-muted-foreground">
              No matching records. Try a name, subject, or quote number.
            </Text>
          </If>
        </View>
      </View>
    </Popover>
  );
}
