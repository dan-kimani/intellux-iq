import type { MailStatus } from "./mail";

export const mailStatusStyle: Record<
  MailStatus,
  { label: string; tone: "muted-foreground" | "success" | "warning" | "alert" | "info" }
> = {
  queued: { label: "Queued", tone: "muted-foreground" },
  sending: { label: "Sending", tone: "info" },
  sent: { label: "Sent", tone: "muted-foreground" },
  delivered: { label: "Delivered", tone: "success" },
  failed: { label: "Failed", tone: "alert" },
  bounced: { label: "Bounced", tone: "warning" },
  draft: { label: "Draft", tone: "muted-foreground" },
};
