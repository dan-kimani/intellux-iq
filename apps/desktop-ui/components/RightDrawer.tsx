import type { JSX } from "nsh";
import { Scroll, Text, View } from "nsh";
import { Sheet } from "nsh/base";
import { IconButton } from "./ui";

export function RightDrawer(props: {
  open: boolean;
  title: string;
  description?: string;
  testID?: string;
  width?: number;
  blurBackdrop?: boolean;
  headerActions?: JSX.Element;
  children?: JSX.Element;
  footer?: JSX.Element;
  onClose: () => void;
}) {
  const width = props.width ?? 360;
  return (
    <Sheet
      open={props.open}
      side="right"
      closeOnEscape
      closeOnBackdropPress
      accessibilityLabel={props.title}
      testID={props.testID ? `${props.testID}-sheet` : undefined}
      backdropClass="bg-background/75"
      backdropStyle={props.blurBackdrop ? { backdropFilter: "blur(6px)" } : undefined}
      popupClass="bg-transparent"
      popupStyle={{ width: width + 24, maxWidth: "96%" }}
      onOpenChange={({ open }) => {
        if (!open) props.onClose();
      }}
      onCancel={props.onClose}
    >
      <View class="h-full w-full p-3">
        <View
          class="h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl"
          testID={props.testID}
        >
          <View class="shrink-0 flex-row items-start gap-3 border-b border-border px-5 py-4">
            <View class="min-w-0 flex-1 gap-0.5">
              <Text class="text-[16px] font-semibold text-foreground">{props.title}</Text>
              <If when={props.description}>
                <Text class="text-[12px] leading-4 text-muted-foreground">{props.description}</Text>
              </If>
            </View>
            <If when={props.headerActions}>
              <View class="flex-row items-center gap-0.5">{props.headerActions}</View>
            </If>
            <IconButton
              icon="close"
              label="Close drawer"
              size={28}
              testID="dialog-close"
              onPress={props.onClose}
            />
          </View>
          <Scroll class="min-h-0 flex-1" scrollbar={false}>
            <View class="p-5">{props.children}</View>
          </Scroll>
          <If when={props.footer}>
            <View class="shrink-0 flex-row items-center justify-end gap-2 border-t border-border bg-panel px-5 py-3">
              {props.footer}
            </View>
          </If>
        </View>
      </View>
    </Sheet>
  );
}
