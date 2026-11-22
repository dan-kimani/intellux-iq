import { moneyText } from "../../lib/money";
import { signal, Text, token, View } from "nsh";
import { AppDialog, DialogActions, FormRow, ModalNotice } from "../../components/overlay";
import { TextField } from "../../components/forms";
import { Avatar, Button, Icon } from "../../components/ui";
import {
  activeNav,
  allConversations,
  selectConversation,
  sentMessage,
  showToast,
} from "../../state";
import type { Conversation } from "../../data";

import type { Product } from "./data";
import { productDispatch, productRows } from "./state";

const closeDispatch = () => productDispatch.set(null);

function DispatchForm(props: { product: Product }) {
  const selected = signal(allConversations()[0]?.id ?? "");
  const caption = signal(
    `Sharing ${props.product.name} (${props.product.sku}) — ${moneyText(props.product.price)}.`,
  );
  return (
    <AppDialog
      open={() => true}
      onClose={closeDispatch}
      title={`Send ${props.product.name}`}
      description="Dispatch catalog media into a customer conversation."
      width={560}
      testID="dispatch-product-dialog"
      footer={
        <DialogActions>
          <Button variant="ghost" size="sm" onPress={closeDispatch}>
            <Text class="text-[12px] font-medium">Cancel</Text>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onPress={() => {
              selectConversation(selected());
              sentMessage.set(`${caption()}\n\n[${props.product.name} media attached]`);
              productDispatch.set(null);
              activeNav.set("Inbox");
              showToast("Catalog media queued through cloud egress.");
            }}
            testID="confirm-dispatch"
          >
            <Icon name="send" size={11} tone="primary-foreground" />
            <Text class="text-[12px] font-semibold text-primary-foreground">Send media</Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-4">
        <View class="flex-row items-center gap-2.5 rounded-lg border border-border bg-panel p-2.5">
          <View class="h-8 w-8 items-center justify-center rounded-md bg-accent">
            <Icon name="package" size={14} tone="highlight" />
          </View>
          <View class="min-w-0 flex-1 gap-0.5">
            <Text class="text-[12px] font-medium text-foreground">{props.product.name}</Text>
            <Text class="text-[11px] text-muted-foreground">
              {props.product.sku} · {moneyText(props.product.price)} · {props.product.media} cached
              images
            </Text>
          </View>
          <Icon name="check" size={11} tone="success" />
        </View>
        <View class="gap-1.5">
          <Text class="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Conversation
          </Text>
          <View class="gap-1">
            <Each of={allConversations().slice(0, 6)}>
              {(conversation: () => Conversation) => (
                <View
                  role="button"
                  accessibilityLabel={`Send to ${conversation().name}`}
                  onPress={() => selected.set(conversation().id)}
                  class="flex-row items-center gap-2 rounded-lg border p-2"
                  style={{
                    backgroundColor:
                      selected() === conversation().id ? token("accent") : "transparent",
                    borderColor: selected() === conversation().id ? token("ring") : token("border"),
                  }}
                  hoverStyle={{ backgroundColor: token("accent") }}
                >
                  <Avatar
                    name={conversation().name}
                    size={24}
                    online={conversation().presence !== "offline"}
                  />
                  <View class="min-w-0 flex-1 gap-0.5">
                    <Text class="text-[11px] font-medium text-foreground">
                      {conversation().name}
                    </Text>
                    <Text class="text-[11px] text-muted-foreground">
                      {conversation().company} ·{" "}
                      {conversation().channel === "whatsapp" ? "WhatsApp" : "Email"}
                    </Text>
                  </View>
                  <View
                    class="h-4 w-4 items-center justify-center rounded-full border"
                    style={{
                      borderColor:
                        selected() === conversation().id ? token("primary") : token("border"),
                    }}
                  >
                    <If when={selected() === conversation().id}>
                      <View class="h-2 w-2 rounded-full bg-primary" />
                    </If>
                  </View>
                </View>
              )}
            </Each>
          </View>
        </View>
        <TextField label="Caption" value={caption} onChange={caption.set} />
        <FormRow>
          <Text class="text-[11px] leading-3 text-muted-foreground">
            The cached preview is sent as catalog media. WhatsApp limits and variants are
            revalidated in the cloud.
          </Text>
        </FormRow>
        <ModalNotice
          title="Catalog media dispatch"
          detail="The desktop sends catalog metadata and a media reference; the cloud resolves the cached WhatsApp media ID and reuses it when possible."
        />
      </View>
    </AppDialog>
  );
}

export function DispatchDialog() {
  return (
    <Each of={productRows()}>
      {(product: () => Product) => (
        <If when={productDispatch()?.id === product().id}>
          <DispatchForm product={product()} />
        </If>
      )}
    </Each>
  );
}
