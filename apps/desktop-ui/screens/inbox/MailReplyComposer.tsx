import { effect, signal, Text, View } from "nsh";
import { Button, Icon } from "../../components/ui";
import { TextField } from "../../components/forms";
import { FormLabel } from "../../components/overlay";
import { mailAccount, mailCompose, mailDraft, showToast } from "../../state";
import { MailRichEditor } from "./MailRichEditor";
import type { MailItem } from "./mail";
import { mailAccountEmail, mailRows } from "./mail";

function splitBody(body: string): string[] {
  return body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function MailReplyComposer(props: { item: MailItem; mode: "reply" | "replyAll" }) {
  const key = `${props.mode}:${props.item.id}`;
  const saved = mailDraft()?.key === key ? mailDraft() : null;
  const replyTo = () => {
    const ourAddress = mailAccountEmail(mailAccount());
    return props.item.from === ourAddress ? props.item.to : props.item.from;
  };
  const to = signal(saved?.to ?? replyTo());
  const cc = signal(saved?.cc ?? (props.mode === "replyAll" ? (props.item.cc ?? "") : ""));
  const bcc = signal(saved?.bcc ?? "");
  const subject = signal(
    saved?.subject ??
      (props.item.subject.startsWith("Re:") ? props.item.subject : `Re: ${props.item.subject}`),
  );
  const body = signal(saved?.body ?? "");
  const bodyHtml = signal(saved?.bodyHtml ?? "");
  effect(() => {
    mailDraft.set({
      key,
      to: to(),
      cc: cc(),
      bcc: bcc(),
      subject: subject(),
      body: body(),
      bodyHtml: bodyHtml(),
    });
  });
  const send = () => {
    if (!to().trim() || !subject().trim() || !body().trim()) {
      showToast("To, subject, and reply are required.");
      return;
    }
    const row: MailItem = {
      id: `mail-reply-${props.item.id}-${Date.now()}`,
      folder: "Sent",
      account: mailAccount(),
      subject: subject().trim(),
      from: mailAccountEmail(mailAccount()),
      to: to().trim(),
      cc: cc().trim() || undefined,
      bcc: bcc().trim() || undefined,
      date: "Just now",
      preview: body().trim().slice(0, 90),
      body: splitBody(body()),
      bodyHtml: bodyHtml() || undefined,
      attachments: [],
      status: "queued",
      read: true,
    };
    mailRows.set([row, ...mailRows()]);
    mailDraft.set(null);
    mailCompose.set(null);
    showToast("Reply sent through cloud egress.");
  };
  return (
    <View
      testID="mail-composer"
      class="gap-3 rounded-2xl border border-border bg-card p-4 shadow-md"
    >
      <View class="flex-row items-center gap-2.5">
        <View class="h-7 w-7 items-center justify-center rounded-lg bg-muted">
          <Icon name="messageCircle" size={12} tone="foreground" />
        </View>
        <View class="min-w-0 flex-1 gap-0.5">
          <Text class="text-[11.5px] font-semibold text-foreground">
            {props.mode === "replyAll" ? "Reply all" : "Reply"}
          </Text>
          <Text class="text-[9px] text-muted-foreground" style={{ numberOfLines: 1 }}>
            Replying in thread · {props.item.date}
          </Text>
        </View>
        <Button
          variant="ghost"
          size="sm"
          testID="mail-reply-close"
          onPress={() => mailCompose.set(null)}
        >
          <Text class="text-[9.5px] font-medium">Close</Text>
        </Button>
      </View>
      <View class="grid grid-cols-2 gap-2.5">
        <TextField label="To" value={to} onChange={to.set} testID="mail-to" />
        <TextField label="CC" value={cc} onChange={cc.set} testID="mail-cc" />
        <TextField label="BCC" value={bcc} onChange={bcc.set} testID="mail-bcc" />
        <TextField label="Subject" value={subject} onChange={subject.set} testID="mail-subject" />
      </View>
      <View class="gap-1.5">
        <FormLabel>Message</FormLabel>
        <MailRichEditor
          compact
          initialHtml={saved?.bodyHtml ?? ""}
          onChange={({ text, html }) => {
            body.set(text);
            bodyHtml.set(html);
          }}
        />
      </View>
      <View class="flex-row items-center gap-2">
        <Text class="min-w-0 flex-1 text-[8.5px] leading-3.5 text-muted-foreground">
          The original thread stays above this reply. The cloud threads it by Message-ID and appends
          the signature.
        </Text>
        <Button variant="primary" size="sm" testID="mail-reply-send" onPress={send}>
          <Icon name="send" size={10} tone="primary-foreground" />
          <Text class="text-[10px] font-semibold text-primary-foreground">Send reply</Text>
        </Button>
      </View>
    </View>
  );
}
