import { effect, type InputRef, keymap, signal, Text, token, View } from "nsh";
import { Input as NativeInput } from "nsh/base";
import type { Channel } from "../../data";
import { Icon, IconButton } from "../../components/ui";
import { WhatsAppAttachMenu } from "./WhatsAppAttachMenu";
import { WhatsAppEmojiButton, WhatsAppFormatMenu } from "./WhatsAppComposerTools";
import { applyWhatsAppFormat, type TextSelection, type WhatsAppFormat } from "./whatsappFormat";
import { composerFocusRequest } from "./message-actions";

function insertAtSelection(text: string, selection: TextSelection, value: string) {
  const start = Math.max(0, Math.min(selection.start, text.length));
  const end = Math.max(start, Math.min(selection.end, text.length));
  return {
    text: `${text.slice(0, start)}${value}${text.slice(end)}`,
    caret: start + value.length,
  };
}

export function ComposerInputBar(props: {
  channel: Channel;
  draft: () => string;
  setDraft: (value: string) => void;
  onSend: () => void;
  onOpenTemplate: () => void;
  onAddAttachment: () => void;
  onAttach: (kind: "file" | "image" | "voice") => void;
  windowClosed: boolean;
  hasTemplate: boolean;
  noteMode: boolean;
}) {
  const selection = signal<TextSelection>({
    start: props.draft().length,
    end: props.draft().length,
  });
  const inputHeight = signal(20);
  const focused = signal(false);
  let inputRef: InputRef | undefined;

  effect(() => {
    if (!props.draft()) inputHeight.set(20);
  });

  effect(() => {
    if (!composerFocusRequest()) return;
    setTimeout(() => inputRef?.focus(), 0);
  });

  effect(() => {
    if (!focused()) return;
    const dispose = keymap.bind(
      "mod+enter",
      () => {
        if (props.channel === "whatsapp") {
          const result = insertAtSelection(props.draft(), selection(), "\n");
          props.setDraft(result.text);
          focusAt(result.caret, result.caret);
        } else {
          props.onSend();
        }
      },
      { when: "always" },
    );
    return () => dispose();
  });

  const focusAt = (start: number, end: number) => {
    setTimeout(() => {
      inputRef?.focus();
      inputRef?.setSelection(start, end);
    }, 0);
  };

  const format = (kind: WhatsAppFormat) => {
    const result = applyWhatsAppFormat(props.draft(), selection(), kind);
    props.setDraft(result.text);
    focusAt(result.start, result.end);
  };

  const emoji = (value: string) => {
    const result = insertAtSelection(props.draft(), selection(), value);
    props.setDraft(result.text);
    focusAt(result.caret, result.caret);
  };

  const showFormatting =
    props.channel === "whatsapp" && !props.noteMode && !props.hasTemplate && !props.windowClosed;
  const closed = props.windowClosed && !props.hasTemplate && !props.noteMode;

  const rowAlignment = inputHeight() > 30 ? "flex-end" : "center";

  return (
    <View class="flex-row gap-2" style={{ alignItems: rowAlignment }}>
      <If
        when={closed}
        else={
          <View
            class="min-h-11 min-w-0 flex-1 flex-row gap-1 rounded-2xl border border-border bg-card px-2 py-1.5"
            style={{ alignItems: rowAlignment }}
          >
            <If
              when={props.channel === "whatsapp"}
              else={
                <IconButton
                  icon="paperclip"
                  label="Add attachment"
                  size={30}
                  onPress={props.onAddAttachment}
                  class="rounded-full"
                />
              }
            >
              <WhatsAppAttachMenu onAttach={props.onAttach} onQuickReplies={props.onOpenTemplate} />
            </If>
            <If when={showFormatting}>
              <WhatsAppEmojiButton onEmoji={emoji} />
            </If>
            <NativeInput
              ref={(node) => {
                inputRef = node;
              }}
              value={props.draft()}
              multiline
              maxLength={4096}
              submitBehavior={props.channel === "whatsapp" ? "submit" : "newline"}
              onSubmit={() => {
                if (props.channel === "whatsapp") props.onSend();
              }}
              onChange={({ value }) => props.setDraft(value)}
              onFocus={() => focused.set(true)}
              onBlur={() => focused.set(false)}
              onSelectionChange={({ start, end }) => {
                if (focused()) selection.set({ start, end });
              }}
              onContentSizeChange={({ size }) =>
                inputHeight.set(Math.min(120, Math.max(20, size.height)))
              }
              placeholder={
                props.noteMode ? "Write an internal note — team-visible" : "Type a message…"
              }
              testID="composer-input"
              returnKeyType="send"
              style={{
                flex: 1,
                height: inputHeight(),
                paddingLeft: 0,
                paddingRight: 0,
                fontSize: 13,
                color: token("foreground"),
                placeholderColor: token("muted-foreground"),
                backgroundColor: "transparent",
                borderWidth: 0,
              }}
            />
            <If when={showFormatting}>
              <WhatsAppFormatMenu onFormat={format} />
            </If>
          </View>
        }
      >
        <View class="min-h-11 min-w-0 flex-1 items-center justify-center rounded-2xl border border-dashed border-border px-3">
          <Text class="text-center text-[10px] text-muted-foreground">
            Free-form replies reopen when the customer messages again.
          </Text>
        </View>
      </If>
      <View
        role="button"
        accessibilityLabel="Send message"
        testID="composer-send"
        onPress={props.onSend}
        disabled={props.draft().trim().length === 0}
        class="items-center justify-center rounded-full bg-primary"
        style={{ width: 40, height: 40 }}
        hoverStyle={{ opacity: 0.9 }}
        activeStyle={{ opacity: 0.7 }}
        disabledStyle={{ opacity: 0.38 }}
        focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 2 }}
      >
        <Icon name={props.noteMode ? "fileText" : "send"} size={15} tone="primary-foreground" />
      </View>
    </View>
  );
}
