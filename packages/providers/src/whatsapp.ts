export interface WhatsAppProvider {
  sendText(input: {
    to: string;
    body: string;
    idempotencyKey: string;
  }): Promise<{ messageId: string }>;
  sendTemplate(input: {
    to: string;
    templateName: string;
    language: string;
    parameters: string[];
    idempotencyKey: string;
  }): Promise<{ messageId: string }>;
}
