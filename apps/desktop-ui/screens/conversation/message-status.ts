import type { DeliveryStatus, Message } from "../../data";

export function statusFor(message: Message): DeliveryStatus {
  if (message.kind === "system" || message.kind === "whisper") return "sent";
  if (message.status) return message.status;
  if (message.from === "me" && "read" in message && message.read) return "read";
  return message.from === "me" ? "sent" : "sending";
}
