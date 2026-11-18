export interface EmailProvider {
  send(input: {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    html: string;
    text: string;
    attachments?: { filename: string; contentType: string; url: string }[];
    idempotencyKey: string;
  }): Promise<{ messageId: string }>;
}
