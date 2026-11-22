import {
  computed,
  effect,
  type InputRef,
  keymap,
  Scroll,
  type ScrollRef,
  signal,
  Text,
  token,
  View,
} from "nsh";
import { Dialog, Input as NativeInput } from "nsh/base";
import { commandOpen, activeNav, activeNavChild } from "../state";
import { Icon, Kbd, withAlpha } from "./ui";
import { resultsFor, type PaletteResult } from "./command-palette/search";
import { Hint, ResultRow } from "./command-palette/PaletteParts";

function closePalette() {
  commandOpen.set(false);
}

interface PaletteGroup {
  group: string;
  items: { item: PaletteResult; index: number }[];
}

export function CommandPalette() {
  const query = signal("");
  const activeIndex = signal(0);
  let resultsScroll: ScrollRef | undefined;
  let searchInput: InputRef | undefined;

  const rows = computed(() => resultsFor(query()));
  const grouped = computed<PaletteGroup[]>(() => {
    const groups: PaletteGroup[] = [];
    rows().forEach((item, index) => {
      const last = groups[groups.length - 1];
      if (last && last.group === item.group) last.items.push({ item, index });
      else groups.push({ group: item.group, items: [{ item, index }] });
    });
    return groups;
  });

  const activeResult = (): PaletteResult | undefined => rows()[activeIndex()];

  const panelHeight = () => {
    if (rows().length === 0) return 220;
    return Math.min(545, 112 + rows().length * 50 + grouped().length * 24);
  };

  const reveal = (index: number) => {
    let offset = 0;
    let group = "";
    const list = rows();
    for (let i = 0; i <= index && i < list.length; i++) {
      if (list[i].group !== group) {
        group = list[i].group;
        offset += 24;
      }
      offset += 50;
    }
    resultsScroll?.scrollTo({ y: Math.max(0, offset - 96), animated: true });
  };

  const move = (delta: number) => {
    const count = rows().length;
    if (count === 0) return;
    const next = (activeIndex() + delta + count) % count;
    activeIndex.set(next);
    reveal(next);
  };

  const run = (item: PaletteResult) => {
    closePalette();
    if (item.nav) {
      activeNavChild.set(null);
      activeNav.set(item.nav);
    }
    item.action?.();
  };

  const runActive = () => {
    const item = activeResult();
    if (item) run(item);
  };

  const resetScroll = () => resultsScroll?.scrollTo({ y: 0, animated: false });

  effect(() => {
    if (!commandOpen()) return;
    query.set("");
    activeIndex.set(0);
    resetScroll();
    const timer = setTimeout(() => searchInput?.focus(), 0);
    return () => clearTimeout(timer);
  });

  effect(() => {
    if (!commandOpen()) return;
    const options = { when: "always" as const };
    const disposers = [
      keymap.bind("escape", closePalette, options),
      keymap.bind("down", () => move(1), options),
      keymap.bind("up", () => move(-1), options),
      keymap.bind(
        "home",
        () => {
          activeIndex.set(0);
          reveal(0);
        },
        options,
      ),
      keymap.bind(
        "end",
        () => {
          const last = Math.max(0, rows().length - 1);
          activeIndex.set(last);
          reveal(last);
        },
        options,
      ),
    ];
    return () => {
      for (const dispose of disposers) dispose();
    };
  });

  return (
    <Dialog
      open={commandOpen()}
      animation="fade"
      accessibilityLabel="Search IntelluxIQ"
      accessibilityDescription="Search screens, contacts, opportunities, quotes, products, and commands."
      testID="command-palette"
      backdropStyle={{
        backgroundColor: withAlpha(token("background"), "e6"),
        backdropFilter: "blur(18px)",
      }}
      style={{
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 88,
      }}
      onOpenChange={({ open }) => {
        if (!open) closePalette();
      }}
      onCancel={closePalette}
    >
      <View class="h-full w-full items-center" onPress={closePalette}>
        <View
          class="min-h-0 w-full flex-col overflow-hidden rounded-xl border border-border bg-panel-strong shadow-2xl"
          style={{ width: 700, maxWidth: "92%", height: panelHeight(), maxHeight: "78%" }}
          onPress={() => undefined}
        >
          <View class="flex-row items-center gap-3 border-b border-border px-4 py-3">
            <Icon name="search" size={17} tone="muted-foreground" />
            <NativeInput
              ref={(node) => {
                searchInput = node;
              }}
              value={query()}
              onChange={({ value }) => {
                query.set(value);
                activeIndex.set(0);
                resetScroll();
              }}
              onSubmit={runActive}
              submitBehavior="submit"
              placeholder="Search IntelluxIQ or jump to…"
              testID="command-search"
              style={{
                flex: 1,
                height: 32,
                paddingLeft: 0,
                paddingRight: 0,
                fontSize: 14,
                color: token("foreground"),
                placeholderColor: token("muted-foreground"),
                backgroundColor: "transparent",
                borderWidth: 0,
              }}
            />
            <If when={query().length > 0}>
              <View
                role="button"
                accessibilityLabel="Clear search"
                testID="command-clear"
                onPress={() => {
                  query.set("");
                  activeIndex.set(0);
                  resetScroll();
                }}
                class="h-6 w-6 items-center justify-center rounded-md"
                hoverStyle={{ backgroundColor: token("accent") }}
                focusVisibleStyle={{
                  outlineWidth: 2,
                  outlineColor: token("ring"),
                  outlineOffset: 1,
                }}
              >
                <Icon name="close" size={12} tone="muted-foreground" />
              </View>
            </If>
            <Kbd>ESC</Kbd>
          </View>

          <View class="relative min-h-0 flex-1">
            <Scroll
              ref={(node) => {
                resultsScroll = node;
              }}
              class="h-full"
              scrollbar={false}
            >
              <View class="px-2 pb-2">
                <If when={rows().length === 0}>
                  <View class="items-center gap-2 px-4 py-10">
                    <View class="h-9 w-9 items-center justify-center rounded-lg bg-muted">
                      <Icon name="search" size={15} tone="muted-foreground" />
                    </View>
                    <Text class="text-[12px] font-medium text-foreground">
                      No results for “{query().trim()}”
                    </Text>
                    <Text class="text-[11px] text-muted-foreground">
                      Try a contact, quote number, SKU, or command.
                    </Text>
                  </View>
                </If>
                <Each of={grouped()}>
                  {(group: () => PaletteGroup) => (
                    <>
                      <Text class="px-2.5 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {group().group}
                      </Text>
                      <Each of={group().items}>
                        {(entry: () => { item: PaletteResult; index: number }) => (
                          <ResultRow
                            item={entry().item}
                            active={activeIndex() === entry().index}
                            onHover={() => activeIndex.set(entry().index)}
                            onPress={() => run(entry().item)}
                          />
                        )}
                      </Each>
                    </>
                  )}
                </Each>
              </View>
            </Scroll>
            <View
              class="absolute bottom-0 left-0 right-0 h-6"
              style={{
                backgroundImage: `linear-gradient(to top, ${token("panel-strong")}, ${withAlpha(token("panel-strong"), "00")})`,
                pointerEvents: "none",
              }}
            />
          </View>

          <View class="flex-row items-center justify-between border-t border-border px-4 py-2">
            <View class="flex-row items-center gap-3">
              <Hint keys="↑↓" label="Navigate" />
              <Hint keys="↵" label="Open" />
              <Hint keys="ESC" label="Close" />
            </View>
            <Text class="text-[11px] text-muted-foreground">Search IntelluxIQ</Text>
          </View>
        </View>
      </View>
    </Dialog>
  );
}
