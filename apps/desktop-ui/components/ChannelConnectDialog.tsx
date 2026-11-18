import { openUrl, signal, Text, token, View } from "nsh";
import type { ChannelProvider } from "./channel-config";
import { channelProviders } from "./channel-config";
import { ChannelLogo } from "./ChannelLogo";
import { AppDialog, DialogActions } from "./overlay";
import { Badge, Button, Icon } from "./ui";
import { channelConnectOpen, showToast } from "../state";

type ConnectTarget = ChannelProvider["id"] | "custom";

const connectionDetails: Record<ConnectTarget, { title: string; body: string; steps: string[] }> = {
  whatsapp: {
    title: "WhatsApp Business",
    body: "This number is already connected through the WhatsApp Cloud API.",
    steps: ["Number verified", "Templates approved", "Cloud egress healthy"],
  },
  gmail: {
    title: "Google Workspace",
    body: "Gmail is connected through OAuth. Mail history is synced by the cloud.",
    steps: ["OAuth token healthy", "Inbound streaming", "SMTP egress healthy"],
  },
  outlook: {
    title: "Microsoft 365",
    body: "Outlook connects through Microsoft OAuth. The cloud stores the refresh token and streams mail to every linked device.",
    steps: ["Authorize Microsoft 365", "Cloud validates the mailbox", "Mail begins syncing"],
  },
  yahoo: {
    title: "Yahoo Mail",
    body: "Yahoo connects through OAuth. The desktop never receives the password or the refresh token.",
    steps: ["Authorize Yahoo Mail", "Cloud validates the mailbox", "Mail begins syncing"],
  },
  custom: {
    title: "Other IMAP/SMTP",
    body: "Custom mailbox credentials are entered only in the cloud console. The desktop receives synced mail and delivery status.",
    steps: ["Add IMAP and SMTP details", "Cloud verifies the connection", "Mail begins syncing"],
  },
};

function ProviderRow(props: {
  provider?: ChannelProvider;
  selected: boolean;
  onPress: () => void;
}) {
  const provider = props.provider;
  const label = provider?.label ?? "Other IMAP/SMTP";
  const detail = provider?.detail ?? "Custom mailbox · IMAP and SMTP";
  return (
    <View
      role="button"
      accessibilityLabel={`${label}${provider?.connected ? ", connected" : ", not connected"}`}
      testID={provider ? `connect-provider-${provider.id}` : "connect-provider-custom"}
      onPress={props.onPress}
      class="flex-row items-center gap-3 rounded-lg border px-3 py-2.5"
      style={{
        borderColor: props.selected ? token("ring") : token("border"),
        backgroundColor: props.selected ? token("accent") : "transparent",
      }}
      hoverStyle={{ backgroundColor: token("accent") }}
      focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
    >
      <View
        class="h-8 w-8 items-center justify-center rounded-3xl border border-border bg-card shadow-md"
        style={{ opacity: provider?.connected === false ? 0.9 : 1 }}
      >
        <If
          when={provider}
          else={
            <Icon name="mail" size={15} tone={props.selected ? "foreground" : "muted-foreground"} />
          }
        >
          <ChannelLogo provider={provider!} muted={!provider?.connected} size={17} />
        </If>
      </View>
      <View class="min-w-0 flex-1 gap-0.5">
        <Text class="text-[11px] font-medium text-foreground">{label}</Text>
        <Text class="text-[9px] text-muted-foreground">{detail}</Text>
      </View>
      <If
        when={provider?.connected}
        else={
          <Text class="text-[8.5px] font-medium text-muted-foreground">
            {props.selected ? "Configure" : "Not connected"}
          </Text>
        }
      >
        <Badge variant="success">
          <Text class="text-[8px] font-medium text-success">Connected</Text>
        </Badge>
      </If>
    </View>
  );
}

function ConnectionDetail(props: { target: () => ConnectTarget | null }) {
  const detail = () => connectionDetails[props.target() ?? "custom"];
  return (
    <View class="gap-2 rounded-lg border border-border bg-panel p-3">
      <Text class="text-[10.5px] font-medium text-foreground">{detail().title}</Text>
      <Text class="text-[9.5px] leading-4 text-muted-foreground">{detail().body}</Text>
      <View class="flex-row flex-wrap items-center gap-1.5">
        <Each of={detail().steps}>
          {(step: () => string) => (
            <View class="flex-row items-center gap-1 rounded-md bg-muted px-1.5 py-1">
              <Icon name="check" size={8} tone="muted-foreground" />
              <Text class="text-[8px] text-muted-foreground">{step()}</Text>
            </View>
          )}
        </Each>
      </View>
    </View>
  );
}

function closeChannelConnect() {
  channelConnectOpen.set(false);
}

async function openCloudConsole() {
  try {
    const { opened } = await openUrl("https://app.intelluxiq.com/channels");
    if (!opened) {
      showToast("No browser is available. Open app.intelluxiq.com/channels.");
      return;
    }
    channelConnectOpen.set(false);
    showToast("Channel connections opened in the cloud console.");
  } catch {
    showToast("No browser is available. Open app.intelluxiq.com/channels.");
  }
}

export function ChannelConnectDialog() {
  const target = signal<ConnectTarget | null>("custom");

  return (
    <AppDialog
      open={() => true}
      onClose={closeChannelConnect}
      title="Connect a channel"
      description="Add a mailbox or WhatsApp number. Authorization and credentials stay in the cloud."
      width={540}
      testID="channel-connect-dialog"
      footer={
        <DialogActions>
          <Button variant="ghost" size="sm" onPress={closeChannelConnect}>
            <Text class="text-[10px] font-medium">Cancel</Text>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onPress={openCloudConsole}
            testID="open-cloud-console"
          >
            <Icon name="arrowUpRight" size={11} tone="primary-foreground" />
            <Text class="text-[10px] font-semibold text-primary-foreground">Cloud console</Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-3.5">
        <View class="gap-1.5">
          <Text class="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Connected
          </Text>
          <Each of={channelProviders.filter((provider) => provider.connected)}>
            {(provider: () => ChannelProvider) => (
              <ProviderRow
                provider={provider()}
                selected={target() === provider().id}
                onPress={() => target.set(provider().id)}
              />
            )}
          </Each>
        </View>

        <View class="gap-1.5">
          <Text class="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Available
          </Text>
          <Each of={channelProviders.filter((provider) => !provider.connected)}>
            {(provider: () => ChannelProvider) => (
              <ProviderRow
                provider={provider()}
                selected={target() === provider().id}
                onPress={() => target.set(provider().id)}
              />
            )}
          </Each>
          <ProviderRow selected={target() === "custom"} onPress={() => target.set("custom")} />
        </View>

        <ConnectionDetail target={target} />

        <View class="flex-row items-center gap-2 px-1">
          <Icon name="shieldCheck" size={12} tone="muted-foreground" />
          <Text class="flex-1 text-[8.5px] leading-3 text-muted-foreground">
            OAuth consent, IMAP/SMTP passwords, and token refresh stay in the cloud. This desktop
            only receives synced mail and status.
          </Text>
        </View>
      </View>
    </AppDialog>
  );
}
