import org from "../fixtures/org.json";

export const fixtures = { org };
export const mockWhatsApp = { sendText: async () => ({ messageId: "wamid.test" }) };
