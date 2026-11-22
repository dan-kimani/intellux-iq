import type { JSX } from "nsh";
import { signal, Text, token, View } from "nsh";
import {
  Input as NativeInput,
  Popover,
  RichEditor,
  StarterKit,
  command,
  createRichEditor,
  setLink,
  toggleList,
  toggleMark,
  unsetLink,
} from "nsh/base";
import { Button } from "../../components/ui";

function ToolButton(props: {
  label: string;
  testID: string;
  active: boolean;
  children: JSX.Element;
  onPress?: () => void;
}) {
  return (
    <View
      role="button"
      accessibilityLabel={props.label}
      accessibilityState={{ selected: props.active }}
      testID={props.testID}
      onPress={props.onPress}
      class="h-7 min-w-7 items-center justify-center rounded-md border border-transparent px-1.5"
      style={{
        backgroundColor: props.active ? token("accent") : "transparent",
      }}
      hoverStyle={{ backgroundColor: token("accent") }}
      activeStyle={{ opacity: 0.65 }}
      focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
    >
      {props.children}
    </View>
  );
}

function ToolLabel(props: { children?: JSX.Element; active?: boolean }) {
  return (
    <Text
      class="text-[12px] font-medium"
      style={{ color: props.active ? token("foreground") : token("muted-foreground") }}
    >
      {props.children}
    </Text>
  );
}

function Divider() {
  return <View class="mx-1 h-4 w-px bg-border" />;
}

export function MailRichEditor(props: {
  initialHtml: string;
  compact?: boolean;
  onChange: (value: { text: string; html: string }) => void;
}) {
  const editor = createRichEditor({
    content: props.initialHtml || "<p></p>",
    format: "html",
    extensions: [StarterKit],
  });
  const revision = signal(0);
  const linkOpen = signal(false);
  const linkUrl = signal("");

  const active = (name: string) => {
    revision();
    return editor.isActive(name);
  };

  const run = (action: () => unknown) => {
    try {
      action();
    } finally {
      revision.set(revision() + 1);
      editor.focus();
    }
  };

  const openLink = () => {
    const attrs = editor.getAttributes("link") as { href?: string } | null;
    linkUrl.set(attrs?.href ?? "");
  };

  const applyLink = () => {
    const value = linkUrl().trim();
    if (!value) {
      editor.run(unsetLink());
    } else {
      const href = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;
      editor.run(setLink({ href }));
    }
    linkOpen.set(false);
    editor.focus();
  };

  return (
    <View class="overflow-hidden rounded-2xl border border-border bg-card shadow-md">
      <View class="flex-row flex-wrap items-center gap-0.5 border-b border-border bg-panel px-2 py-1.5">
        <ToolButton
          label="Bold"
          testID="mail-format-bold"
          active={active("bold")}
          onPress={() => run(() => editor.run(toggleMark("bold")))}
        >
          <Text class="text-[12px] font-bold text-foreground">B</Text>
        </ToolButton>
        <ToolButton
          label="Italic"
          testID="mail-format-italic"
          active={active("italic")}
          onPress={() => run(() => editor.run(toggleMark("italic")))}
        >
          <Text class="text-[12px] italic text-foreground">I</Text>
        </ToolButton>
        <ToolButton
          label="Underline"
          testID="mail-format-underline"
          active={active("underline")}
          onPress={() => run(() => editor.run(toggleMark("underline")))}
        >
          <Text class="text-[12px] underline text-foreground">U</Text>
        </ToolButton>
        <ToolButton
          label="Strikethrough"
          testID="mail-format-strike"
          active={active("strike")}
          onPress={() => run(() => editor.run(toggleMark("strike")))}
        >
          <Text class="text-[12px] line-through text-foreground">S</Text>
        </ToolButton>
        <Divider />
        <ToolButton
          label="Bulleted list"
          testID="mail-format-bullet"
          active={active("bulletList")}
          onPress={() => run(() => editor.run(toggleList("bulletList", "listItem")))}
        >
          <Text class="text-[14px] leading-none text-foreground">•</Text>
        </ToolButton>
        <ToolButton
          label="Numbered list"
          testID="mail-format-numbered"
          active={active("orderedList")}
          onPress={() => run(() => editor.run(toggleList("orderedList", "listItem")))}
        >
          <Text class="text-[11px] font-semibold text-foreground">1.</Text>
        </ToolButton>
        <ToolButton
          label="Block quote"
          testID="mail-format-quote"
          active={active("blockquote")}
          onPress={() => run(() => editor.run(command("toggleBlockquote")))}
        >
          <Text class="text-[13px] leading-none text-foreground">❝</Text>
        </ToolButton>
        <Divider />
        <Popover
          open={linkOpen()}
          onOpenChange={({ open }) => {
            linkOpen.set(open);
            if (open) openLink();
          }}
          placement="bottom"
          align="start"
          offset={6}
          popupClass="rounded-lg border border-border bg-popover p-2 shadow-2xl"
          popupStyle={{ width: 280 }}
          trigger={
            <ToolButton label="Insert link" testID="mail-format-link" active={active("link")}>
              <ToolLabel active={active("link")}>Link</ToolLabel>
            </ToolButton>
          }
        >
          <View class="gap-2">
            <Text class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Link URL
            </Text>
            <NativeInput
              value={linkUrl()}
              onChange={({ value }) => linkUrl.set(value)}
              testID="mail-link-url"
              placeholder="https://example.com"
              style={{
                height: 32,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: token("border"),
                backgroundColor: token("card"),
                paddingLeft: 8,
                paddingRight: 8,
                fontSize: 12,
                color: token("foreground"),
                placeholderColor: token("muted-foreground"),
              }}
            />
            <View class="flex-row items-center justify-end gap-1.5">
              <Button variant="ghost" size="sm" onPress={() => linkOpen.set(false)}>
                <Text class="text-[11px] font-medium">Cancel</Text>
              </Button>
              <Button variant="primary" size="sm" testID="mail-apply-link" onPress={applyLink}>
                <Text class="text-[11px] font-semibold text-primary-foreground">Apply link</Text>
              </Button>
            </View>
          </View>
        </Popover>
        <View class="flex-1" />
        <Text class="text-[11px] text-muted-foreground">Rich text</Text>
      </View>
      <RichEditor
        editor={editor}
        testID="mail-body"
        placeholder="Write the email…"
        class={props.compact ? "min-h-28 w-full" : "min-h-56 w-full"}
        accessibilityLabel="Email message"
        classes={{
          content: `${props.compact ? "min-h-24" : "min-h-52"} px-3.5 py-3 text-[13px] leading-5.5 text-foreground`,
          placeholder: "text-[13px] text-muted-foreground",
          nodes: {
            paragraph: "my-1",
            heading: "mb-1 mt-2 font-semibold text-foreground",
            blockquote: "my-2 border-l-2 border-border pl-3 text-muted-foreground",
            bulletList: "my-2 pl-5",
            orderedList: "my-2 pl-5",
            listItem: "my-0.5",
            codeBlock: "my-2 rounded-md bg-muted p-2 font-mono text-[12px]",
          },
          marks: {
            bold: "font-bold",
            italic: "italic",
            underline: "underline",
            strike: "line-through",
            code: "rounded bg-muted px-1 font-mono text-[12px]",
            link: "underline",
          },
        }}
        onSelectionChange={() => revision.set(revision() + 1)}
        onChange={() => {
          revision.set(revision() + 1);
          props.onChange({ text: editor.getText(), html: editor.getHTML() });
        }}
      />
    </View>
  );
}
