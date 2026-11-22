import { signal } from "nsh";
import { channelProviders, type ChannelProvider } from "./channel-config";

export const channelOrder = signal(channelProviders.map((provider) => provider.id));

export function orderedChannelProviders(): ChannelProvider[] {
  const byId = new Map(channelProviders.map((provider) => [provider.id, provider]));
  return channelOrder()
    .map((id) => byId.get(id))
    .filter((provider): provider is ChannelProvider => provider !== undefined);
}

export function moveChannel(from: number, to: number): void {
  const order = [...channelOrder()];
  if (from === to || from < 0 || from >= order.length) return;
  const [moved] = order.splice(from, 1);
  order.splice(Math.max(0, Math.min(to, order.length)), 0, moved);
  channelOrder.set(order);
}
