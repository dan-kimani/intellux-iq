import { signal, Text, token, View } from "nsh";
import { Input as NativeInput } from "nsh/base";
import { Button, Icon, Logo } from "./ui";
import { locked, showToast } from "../state";

export function LockScreen() {
  const password = signal("");
  return (
    <If when={locked()}>
      <View class="absolute inset-0 z-50 items-center justify-center bg-background">
        <View class="w-96 gap-4 rounded-2xl border border-border bg-card p-6 shadow-2xl">
          <View class="items-center gap-2">
            <Logo size={42} />
            <Text class="text-[20px] font-semibold text-foreground">IntelluxIQ</Text>
            <Text class="text-[11px] font-medium tracking-wider text-muted-foreground">
              SALES INTELLIGENCE
            </Text>
          </View>
          <View class="items-center gap-1 border-y border-border py-3">
            <Text class="text-[13px] font-medium text-foreground">Desktop locked</Text>
            <Text class="text-[11px] text-muted-foreground">Acme Trading Inc. · Alex Morgan</Text>
          </View>
          <View class="gap-1.5">
            <Text class="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Unlock password
            </Text>
            <NativeInput
              value={password()}
              onChange={({ value }) => password.set(value)}
              placeholder="Enter password"
              masked
              testID="unlock-password"
              style={{
                height: 38,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: token("border"),
                backgroundColor: token("panel"),
                paddingLeft: 10,
                paddingRight: 10,
                fontSize: 13,
                color: token("foreground"),
                placeholderColor: token("muted-foreground"),
              }}
            />
          </View>
          <Button
            variant="primary"
            size="md"
            class="w-full"
            onPress={() => {
              locked.set(false);
              password.set("");
              showToast("Desktop unlocked.");
            }}
            testID="unlock-desktop"
          >
            <Icon name="shieldCheck" size={13} tone="primary-foreground" />
            <Text class="text-[12px] font-semibold text-primary-foreground">Unlock desktop</Text>
          </Button>
          <Text class="text-center text-[11px] leading-3.5 text-muted-foreground">
            Local cache stays encrypted while locked. Unlock works offline inside the refresh lease.
          </Text>
        </View>
      </View>
    </If>
  );
}
