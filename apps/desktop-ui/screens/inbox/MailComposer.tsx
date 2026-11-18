import { effect, signal, Text, View } from "nsh";
import { Scroll } from "nsh";
import { Button, Icon, SectionTitle } from "../../components/ui";
import type { AttachmentFile } from "../../files/types";
import { fileExtension } from "../../files/types";
import { FileThumb } from "../../files/FileThumb";
import { SelectField, TextField } from "../../components/forms";
import { FormLabel } from "../../components/overlay";
import { MailRichEditor } from "./MailRichEditor";
import { cataloguePdf, quotationPdf } from "./mail-files";
import { MailItem, mailAccountEmail, mailRows, type MailStatus } from "./mail";
import {
  emailFolder,
  mailAccount,
  mailCompose,
  mailDetail,
  mailDraft,
  showToast,
} from "../../state";

export type MailComposeMode = "reply" | "replyAll" | "forward" | "new";

function splitBody(body: string): string[] {
  return body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function MailComposer(props: { mode: MailComposeMode; item?: MailItem }) {
  const item = props.item;
  const key = `${props.mode}:${item?.id ?? "new"}`;
  const saved = mailDraft()?.key === key ? mailDraft() : null;
  const to = signal(saved?.to ?? (props.mode === "new" ? "" : (item?.from ?? "")));
  const cc = signal(saved?.cc ?? (props.mode === "replyAll" ? (item?.cc ?? "") : ""));
  const bcc = signal(saved?.bcc ?? "");
  const subject = signal(
    saved?.subject ??
      (props.mode === "new"
        ? ""
        : props.mode === "forward"
          ? `Fwd: ${item?.subject ?? ""}`
          : item?.subject.startsWith("Re:")
            ? item.subject
            : `Re: ${item?.subject ?? ""}`),
  );
  const body = signal(saved?.body ?? "");
  const bodyHtml = signal(saved?.bodyHtml ?? "");
  const schedule = signal("Send now");
  const attachments = signal<AttachmentFile[]>(
    props.mode === "forward" ? [...(item?.attachments ?? [])] : [],
  );
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
  const signature = "David Mwangi\nAcme Trading Ltd\nsales@acmetrading.co.ke";
  const draftId = `mail-draft-${key}`;
  const saveAndClose = () => {
    if (body().trim()) {
      const row: MailItem = {
        id: draftId,
        folder: "Drafts",
        account: mailAccount(),
        subject: subject().trim() || "Untitled draft",
        from: mailAccountEmail(mailAccount()),
        to: to().trim(),
        cc: cc().trim() || undefined,
        bcc: bcc().trim() || undefined,
        date: "Just now",
        preview: body().trim().slice(0, 90),
        body: splitBody(body()),
        bodyHtml: bodyHtml() || undefined,
        attachments: attachments(),
        status: "draft",
        read: true,
      };
      mailRows.set([row, ...mailRows().filter((mail) => mail.id !== draftId)]);
    }
    mailCompose.set(null);
  };

  const send = () => {
    if (!to().trim() || !subject().trim() || !body().trim()) {
      showToast("To, subject, and body are required.");
      return;
    }
    const id = `mail-${mailRows().length + 1}`;
    const status: MailStatus = "queued";
    const row: MailItem = {
      id,
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
      attachments: attachments(),
      status,
      read: true,
    };
    mailRows.set([row, ...mailRows().filter((mail) => mail.id !== draftId)]);
    mailDraft.set(null);
    mailCompose.set(null);
    emailFolder.set("Sent");
    mailDetail.set(null);
    setTimeout(() => mailDetail.set(row), 40);
    setTimeout(() => {
      mailRows.set(
        mailRows().map((mail) => (mail.id === id ? { ...mail, status: "sent" as const } : mail)),
      );
    }, 1400);
    showToast(
      schedule() === "Send now"
        ? "Email queued through cloud egress."
        : `Email scheduled for ${schedule()}.`,
    );
  };

  return (
    <View class="min-w-0 flex-1 flex-col bg-background" testID="mail-composer">
      <View class="shrink-0 flex-row items-center gap-3 border-b border-border px-6 py-4">
        <View class="h-8 w-8 items-center justify-center rounded-lg bg-muted">
          <Icon name="mail" size={14} tone="chart-2" />
        </View>
        <View class="min-w-0 flex-1 gap-0.5">
          <Text class="text-[15px] font-semibold text-foreground">
            {props.mode === "new"
              ? "New email"
              : `${props.mode === "forward" ? "Forward" : "Reply"} email`}
          </Text>
          <Text class="text-[9.5px] text-muted-foreground">
            Cloud SMTP egress · {mailAccountEmail(mailAccount())}
          </Text>
        </View>
        <Button variant="primary" size="sm" testID="send-email" onPress={send}>
          <Icon name="send" size={11} tone="primary-foreground" />
          <Text class="text-[10px] font-semibold text-primary-foreground">
            {schedule() === "Send now" ? "Send email" : "Schedule email"}
          </Text>
        </Button>
        <Button variant="ghost" size="sm" onPress={saveAndClose}>
          <Text class="text-[10px] font-medium">Close</Text>
        </Button>
      </View>
      <Scroll class="min-h-0 flex-1" scrollbar={false}>
        <View class="gap-4 p-6">
          <View class="grid grid-cols-2 gap-3">
            <TextField label="To" value={to} onChange={to.set} testID="mail-to" />
            <TextField label="CC" value={cc} onChange={cc.set} testID="mail-cc" />
            <TextField label="BCC" value={bcc} onChange={bcc.set} testID="mail-bcc" />
            <TextField
              label="Subject"
              value={subject}
              onChange={subject.set}
              testID="mail-subject"
            />
          </View>
          <View class="gap-1.5">
            <FormLabel>Message</FormLabel>
            <MailRichEditor
              initialHtml={saved?.bodyHtml ?? ""}
              onChange={({ text, html }) => {
                body.set(text);
                bodyHtml.set(html);
              }}
            />
          </View>
          <If when={props.mode !== "new" && item}>
            <View class="gap-1 rounded-lg border border-border bg-panel p-3">
              <Text class="text-[8.5px] uppercase tracking-wide text-muted-foreground">
                Quoted message
              </Text>
              <Text class="text-[9.5px] leading-4 text-muted-foreground">
                {item?.from} · {item?.date}
              </Text>
              <Each of={item?.body ?? []}>
                {(line: () => string) => (
                  <Text class="text-[9.5px] leading-4 text-foreground">{line()}</Text>
                )}
              </Each>
            </View>
          </If>
          <View class="gap-2 rounded-3xl border border-border bg-card shadow-md p-3">
            <View class="flex-row items-center justify-between">
              <SectionTitle>Attachments</SectionTitle>
              <Button
                variant="outline"
                size="sm"
                onPress={() =>
                  attachments.set([
                    ...attachments(),
                    attachments().some((file) => file.id === quotationPdf.id)
                      ? cataloguePdf
                      : quotationPdf,
                  ])
                }
              >
                <Icon name="paperclip" size={10} tone="muted-foreground" />
                <Text class="text-[9.5px] font-medium">Attach from quote</Text>
              </Button>
            </View>
            <If when={attachments().length === 0}>
              <Text class="text-[9px] text-muted-foreground">No attachments.</Text>
            </If>
            <Each of={attachments()}>
              {(file: () => AttachmentFile, index: () => number) => (
                <View class="flex-row items-center gap-2 rounded bg-muted px-2 py-1">
                  <FileThumb file={file()} height={26} />
                  <View class="min-w-0 flex-1">
                    <Text
                      class="text-[9px] font-medium text-foreground"
                      style={{ numberOfLines: 1 }}
                    >
                      {file().name}
                    </Text>
                    <Text class="text-[8px] text-muted-foreground">
                      {file().size} · {fileExtension(file().name)}
                    </Text>
                  </View>
                  <View
                    role="button"
                    accessibilityLabel={`Remove ${file().name}`}
                    onPress={() =>
                      attachments.set(attachments().filter((_, fileIndex) => fileIndex !== index()))
                    }
                  >
                    <Icon name="close" size={9} tone="muted-foreground" />
                  </View>
                </View>
              )}
            </Each>
          </View>
          <SelectField
            label="Send"
            value={schedule}
            options={["Send now", "In 1 hour", "Tomorrow 09:00"]}
            onChange={schedule.set}
          />
          <View class="gap-1 rounded-lg border border-border bg-panel p-3">
            <Text class="text-[8.5px] uppercase tracking-wide text-muted-foreground">
              Signature
            </Text>
            <Text class="text-[9.5px] leading-4 text-foreground">{signature}</Text>
          </View>
          <Text class="text-[9px] leading-3.5 text-muted-foreground">
            The desktop never builds or sends MIME. The cloud validates recipients, appends the
            signature, syncs the Sent folder, and reports bounces.
          </Text>
        </View>
      </Scroll>
    </View>
  );
}
