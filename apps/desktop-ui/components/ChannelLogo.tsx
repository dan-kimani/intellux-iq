import { Image, token } from "nsh";
import type { ChannelProvider } from "./channel-config";

export function ChannelLogo(props: { provider: ChannelProvider; size?: number; muted?: boolean }) {
  const size = props.size ?? 20;
  return (
    <Image
      src={props.provider.icon}
      fadeDuration={0}
      style={{
        width: size,
        height: size,
        ...(props.muted ? { tintColor: token("muted-foreground") as string } : {}),
      }}
    />
  );
}
