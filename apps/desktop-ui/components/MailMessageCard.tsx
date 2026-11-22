import { Image, signal, Text, token, View } from "nsh";
import { TextView } from "nsh/base";
import { AttachmentPreviews } from "../files/AttachmentPreviews";
import { openFilePreview } from "../files/state";
import { imageAttachment } from "../files/types";
import { Avatar, Badge, Icon } from "./ui";
import { mailPartyName } from "../screens/inbox/mailIdentity";
import { mailStatusStyle } from "../screens/inbox/mailStatus";
import { mailAccountEmail } from "../screens/inbox/mailMetrics";
import type { MailItem } from "../screens/inbox/mail";

export function MailMessageCard(props: {
  item: MailItem;
  latest: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const item = props.item;
  const quotedOpen = signal(false);
  const sender = mailPartyName(item.from);
  const ownAddress = mailAccountEmail(item.account).toLowerCase();
  const senderLabel = item.from.toLowerCase() === ownAddress ? "You" : sender;
  const recipientLabel = item.to
    .split(",")
    .map((address) => {
      const trimmed = address.trim();
      return trimmed.toLowerCase() === ownAddress ? "You" : mailPartyName(trimmed);
    })
    .join(", ");
  const status = item.status ? mailStatusStyle[item.status] : null;
  const open = () => props.latest || props.expanded;
  return (
    <View class="overflow-hidden rounded-xl border border-border bg-card">
      <View
        role="button"
        accessibilityLabel={`${open() ? "Collapse" : "Expand"} message from ${sender}`}
        testID={`mail-thread-message-${item.id}`}
        onPress={() => {
          if (!props.latest) props.onToggle();
        }}
        class={`flex-row items-center gap-2.5 px-3.5 py-3 ${props.latest ? "" : "cursor-pointer"}`}
        hoverStyle={props.latest ? undefined : { backgroundColor: token("accent") }}
      >
        <Avatar name={sender} size={30} />
        <View class="min-w-0 flex-1 gap-0.5">
          <View class="flex-row items-center gap-2">
            <If when={!item.read}>
              <View
                class="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: token("unread") }}
              />
            </If>
            <Text class="text-[13px] font-semibold text-foreground">{senderLabel}</Text>
            <If when={props.latest}>
              <Badge variant="outline">
                <Text class="text-[10px] text-muted-foreground">Latest</Text>
              </Badge>
            </If>
          </View>
          <Text class="truncate text-[11px] text-muted-foreground">To: {recipientLabel}</Text>
        </View>
        <View class="items-end gap-0.5">
          <Text class="text-[10px] tabular-nums text-muted-foreground">{item.date}</Text>
          <If when={status}>
            <Text class="text-[10px] font-medium" style={{ color: token(status!.tone) }}>
              {status!.label}
            </Text>
          </If>
        </View>
        <If when={!props.latest}>
          <Icon name={open() ? "chevronDown" : "chevronRight"} size={11} tone="muted-foreground" />
        </If>
      </View>

      <If when={!open()}>
        <Text
          class="px-4 pb-3 text-[12px] leading-4.5 text-muted-foreground"
          style={{ numberOfLines: 2 }}
        >
          {item.preview}
        </Text>
      </If>

      <If when={open()}>
        <View class="gap-3 border-t border-border px-4 py-3">
          <Text class="text-[11px] leading-4 text-muted-foreground">
            {item.from} → {item.to}
            {item.cc ? ` · CC ${item.cc}` : ""}
          </Text>
          <If
            when={item.bodyHtml}
            else={
              <Each of={item.body}>
                {(line: () => string) => (
                  <Text class="text-[13px] leading-5 text-foreground">{line()}</Text>
                )}
              </Each>
            }
          >
            <TextView
              html={item.bodyHtml!}
              selectable
              class="text-[13px] leading-5 text-foreground"
            />
          </If>
          <If when={item.inlineImage}>
            <View class="gap-1 overflow-hidden rounded-lg border border-border bg-panel">
              <View
                role="button"
                accessibilityLabel="Preview inline image"
                onPress={() =>
                  openFilePreview(
                    item.attachments.find((file) => file.kind === "image") ??
                      imageAttachment("inline-image.jpg", "1.8 MB", item.inlineImage!.src),
                  )
                }
              >
                <Image
                  src={item.inlineImage!.src}
                  style={{ width: "100%", height: 180, objectFit: "cover" }}
                />
              </View>
              <Text class="px-3 py-1.5 text-[10px] text-muted-foreground">
                {item.inlineImage!.caption}
              </Text>
            </View>
          </If>
          <If when={item.quoted}>
            <View class="gap-1 rounded-lg border border-border bg-panel p-2.5">
              <View
                role="button"
                accessibilityLabel="Toggle quoted message"
                onPress={() => quotedOpen.set(!quotedOpen())}
                class="flex-row items-center gap-1"
              >
                <Icon
                  name={quotedOpen() ? "chevronDown" : "chevronRight"}
                  size={9}
                  tone="muted-foreground"
                />
                <Text class="text-[10px] font-medium text-muted-foreground">
                  {quotedOpen() ? "Hide quoted message" : "Show quoted message"}
                </Text>
              </View>
              <If when={quotedOpen()}>
                <Each of={item.quoted ?? []}>
                  {(line: () => string) => (
                    <Text class="text-[11px] leading-4 text-muted-foreground">{line()}</Text>
                  )}
                </Each>
              </If>
            </View>
          </If>
          <If when={item.attachments.length > 0}>
            <AttachmentPreviews files={item.attachments} />
          </If>
          <If when={item.diagnostic}>
            <View class="flex-row items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-2.5">
              <Icon name="zap" size={11} tone="warning" />
              <Text class="text-[11px] leading-4 text-muted-foreground">{item.diagnostic}</Text>
            </View>
          </If>
        </View>
      </If>
    </View>
  );
}
