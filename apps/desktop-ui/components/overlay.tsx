import type { JSX } from "nsh";
import { Scroll, Text, token, View } from "nsh";
import { Dialog } from "nsh/base";
import { Icon, IconButton } from "./ui";

export function AppDialog(props: {
  open: () => boolean;
  onClose: () => void;
  title: string;
  description?: string;
  testID?: string;
  width?: number;
  children?: JSX.Element;
  footer?: JSX.Element;
}) {
  return (
    <Dialog
      open={props.open()}
      animation="fade"
      accessibilityLabel={props.title}
      accessibilityDescription={props.description}
      testID={props.testID}
      backdropClass="bg-background/80"
      style={{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}
      onOpenChange={({ open }) => {
        if (!open) props.onClose();
      }}
      onCancel={props.onClose}
    >
      <View class="h-full w-full items-center justify-center" onPress={props.onClose}>
        <View
          class="min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl"
          style={{ width: props.width ?? 480, maxWidth: "92%", maxHeight: "86%" }}
          onPress={() => undefined}
        >
          <View class="flex-row items-start gap-3 border-b border-border px-5 py-4">
            <View class="min-w-0 flex-1 gap-0.5">
              <Text class="text-[16px] font-semibold tracking-tight text-foreground">
                {props.title}
              </Text>
              <If when={props.description}>
                <Text class="text-[11px] leading-4 text-muted-foreground">{props.description}</Text>
              </If>
            </View>
            <IconButton
              icon="close"
              label="Close dialog"
              size={28}
              testID="dialog-close"
              onPress={props.onClose}
            />
          </View>
          <Scroll class="min-h-0" style={{ maxHeight: 560 }} scrollbar={false}>
            <View class="p-5">{props.children}</View>
          </Scroll>
          <If when={props.footer}>
            <View class="flex-row items-center justify-end gap-2 border-t border-border bg-panel px-5 py-3">
              {props.footer}
            </View>
          </If>
        </View>
      </View>
    </Dialog>
  );
}

export function FormLabel(props: { children?: JSX.Element; hint?: string }) {
  return (
    <View class="flex-row items-center justify-between">
      <Text class="text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
        {props.children}
      </Text>
      <If when={props.hint}>
        <Text class="text-[9.5px] text-muted-foreground">{props.hint}</Text>
      </If>
    </View>
  );
}

export function FormRow(props: { children?: JSX.Element; class?: string }) {
  return <View class={`gap-1.5 ${props.class ?? ""}`}>{props.children}</View>;
}

export function FormGrid(props: { children?: JSX.Element }) {
  return <View class="grid grid-cols-2 gap-3">{props.children}</View>;
}

export function FieldHint(props: { children?: JSX.Element }) {
  return <Text class="text-[9.5px] leading-3.5 text-muted-foreground">{props.children}</Text>;
}

export function DialogActions(props: { children?: JSX.Element }) {
  return <View class="flex-row items-center justify-end gap-2">{props.children}</View>;
}

export function ModalNotice(props: {
  icon?: "sparkles" | "shieldCheck" | "check" | "zap";
  title: string;
  detail: string;
}) {
  return (
    <View class="flex-row items-start gap-2.5 rounded-lg border border-border bg-panel p-3">
      <View
        class="h-6 w-6 items-center justify-center rounded-md"
        style={{ backgroundColor: token("accent") }}
      >
        <Icon name={props.icon ?? "sparkles"} size={12} tone="highlight" />
      </View>
      <View class="min-w-0 flex-1 gap-0.5">
        <Text class="text-[11px] font-medium text-foreground">{props.title}</Text>
        <Text class="text-[10px] leading-4 text-muted-foreground">{props.detail}</Text>
      </View>
    </View>
  );
}
