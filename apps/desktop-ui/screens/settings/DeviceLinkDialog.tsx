import { signal, Text, token, View } from "nsh";
import { AppDialog, DialogActions, ModalNotice } from "../../components/overlay";
import { Button, Icon, SectionTitle, withAlpha } from "../../components/ui";
import { showToast } from "../../state";
import { deviceLinkOpen } from "./state";

const closeLink = () => deviceLinkOpen.set(false);

export function DeviceLinkDialog() {
  const copied = signal(false);
  const cells = Array.from(
    { length: 49 },
    (_, index) => (index * 7 + 3) % 5 === 0 || index % 11 === 0,
  );
  return (
    <AppDialog
      open={() => true}
      onClose={closeLink}
      title="Link a device"
      description="Issue a short-lived one-time code for another desktop."
      width={500}
      testID="device-link-dialog"
      footer={
        <DialogActions>
          <Button
            variant="outline"
            size="sm"
            onPress={() => showToast("Opened device authorization in the browser.")}
          >
            <Icon name="arrowUpRight" size={11} tone="muted-foreground" />
            <Text class="text-[12px] font-medium">Open browser</Text>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onPress={() => {
              closeLink();
              showToast("Device linked. Policy will sync on first refresh.");
            }}
            testID="confirm-device-link"
          >
            <Icon name="check" size={11} tone="primary-foreground" />
            <Text class="text-[12px] font-semibold text-primary-foreground">
              I entered the code
            </Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-4">
        <View class="items-center gap-3 rounded-xl border border-border bg-panel p-4">
          <View class="h-36 w-36 items-center justify-center rounded-lg bg-background p-2">
            <View class="flex-row flex-wrap" style={{ width: 120, height: 120 }}>
              <Each of={cells}>
                {(filled: () => boolean) => (
                  <View style={{ width: 17.1, height: 17.1, padding: 1.5 }}>
                    <View
                      class="h-full w-full rounded-xs"
                      style={{ backgroundColor: filled() ? token("foreground") : "transparent" }}
                    />
                  </View>
                )}
              </Each>
            </View>
          </View>
          <Text class="text-[11px] text-muted-foreground">
            Scan with the IntelluxIQ desktop app
          </Text>
          <View class="flex-row items-center gap-2 rounded-xl border border-border bg-card shadow-md px-3 py-2">
            <Text class="font-mono text-[16px] font-semibold tracking-wider text-foreground">
              IQ-7K42-9M
            </Text>
            <View
              role="button"
              accessibilityLabel="Copy device code"
              onPress={() => {
                copied.set(true);
                showToast("Device code copied.");
              }}
              class="h-6 items-center justify-center rounded-md border border-border px-2"
              hoverStyle={{ backgroundColor: token("accent") }}
            >
              <Text
                class="text-[11px] font-medium"
                style={{ color: copied() ? token("success") : token("muted-foreground") }}
              >
                {copied() ? "Copied" : "Copy"}
              </Text>
            </View>
          </View>
          <Text class="text-[11px] font-medium text-warning">Expires in 9:42</Text>
        </View>
        <View class="gap-2">
          <SectionTitle>Device link steps</SectionTitle>
          <Step
            number="1"
            text="Open IntelluxIQ on the new desktop and choose “Link this device”."
          />
          <Step
            number="2"
            text="Enter the one-time code or scan the QR. The device generates its Ed25519 keypair."
          />
          <Step
            number="3"
            text="The cloud binds the device to the org, issues a refresh token, and sends the bootstrap snapshot."
          />
        </View>
        <ModalNotice
          icon="shieldCheck"
          title="Keys never leave the device"
          detail="Only the device public key and a device-bound refresh token reach the cloud. Provider credentials never touch a desktop."
        />
      </View>
    </AppDialog>
  );
}

function Step(props: { number: string; text: string }) {
  return (
    <View class="flex-row items-start gap-2.5">
      <View
        class="h-5 w-5 items-center justify-center rounded-full"
        style={{ backgroundColor: withAlpha(token("primary"), "24") }}
      >
        <Text class="text-[11px] font-semibold text-highlight">{props.number}</Text>
      </View>
      <Text class="flex-1 text-[11px] leading-3.75 text-muted-foreground">{props.text}</Text>
    </View>
  );
}
