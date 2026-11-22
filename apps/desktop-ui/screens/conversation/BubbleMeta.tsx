import type { JSX } from "nsh";
import { Text, token, View } from "nsh";
import { Icon, withAlpha } from "../../components/ui";
import type { DeliveryStatus } from "../../data";

function statusLabel(status: DeliveryStatus): string {
  if (status === "queued") return "Queued";
  if (status === "sending") return "Sending…";
  if (status === "failed") return "Failed";
  if (status === "sent") return "Sent";
  if (status === "delivered") return "Delivered";
  if (status === "read") return "Read";
  return "";
}

function statusIcon(status: DeliveryStatus): "send" | "check" | "checkCheck" | "close" {
  if (status === "queued" || status === "sending") return "send";
  if (status === "sent") return "check";
  if (status === "failed") return "close";
  return "checkCheck";
}

export function BubbleMeta(props: {
  time: string;
  outgoing?: boolean;
  status?: DeliveryStatus;
  actions?: JSX.Element;
}) {
  const status = props.status ?? "sent";
  return (
    <View class="flex-row items-center justify-end gap-1">
      <Text
        class="text-[11px] tabular-nums"
        style={{
          color: props.outgoing
            ? withAlpha(token("bubble-out-foreground"), "b3")
            : token("muted-foreground"),
        }}
      >
        {props.time}
      </Text>
      <If when={props.outgoing}>
        <Text
          class="text-[11px]"
          style={{
            color:
              status === "failed"
                ? token("warning")
                : withAlpha(token("bubble-out-foreground"), "a8"),
          }}
        >
          {statusLabel(status)}
        </Text>
        <Icon
          name={statusIcon(status)}
          size={11}
          tone={status === "failed" ? "warning" : "bubble-out-foreground"}
        />
      </If>
      <If when={props.actions}>
        <View class="-my-1 -mr-1">{props.actions}</View>
      </If>
    </View>
  );
}
