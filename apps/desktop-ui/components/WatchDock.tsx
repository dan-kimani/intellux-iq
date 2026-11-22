import { batch, createAnimatedValue, LayoutAnimation, signal, Text, token, View } from "nsh";
import { Icon, Tooltip } from "./ui";
import { Reveal } from "./motion";
import { appViewport } from "./viewport";
import { WatchPanel } from "./WatchPanel";
import {
  attentionCount,
  resetWatchPosition,
  setWatchPosition,
  watchDockOpen,
  watchDockOffset,
  watchPosition,
  watchedCount,
} from "../watch/state";

const EDGE_INSET = 20;
const TOP_INSET = 56;

const watchedCountLabel = () => watchedCount();
const actionCountLabel = () => attentionCount();

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), Math.max(min, max));

function animateDock(): void {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
}

function resetPosition(): void {
  animateDock();
  resetWatchPosition();
}

export function WatchDock() {
  const dragX = createAnimatedValue(0);
  const dragY = createAnimatedValue(0);
  const dragging = signal(false);
  const pillSize = signal({ width: 0, height: 0 });

  const bounds = () => {
    const viewport = appViewport();
    const width = viewport.width || 1440;
    const height = viewport.height || 900;
    const size = pillSize();
    const pillWidth = size.width || 220;
    const pillHeight = size.height || 44;
    return {
      minX: EDGE_INSET,
      maxX: Math.max(EDGE_INSET, width - EDGE_INSET - pillWidth),
      minY: TOP_INSET,
      maxY: Math.max(TOP_INSET, height - EDGE_INSET - pillHeight),
      width,
      height,
      pillWidth,
      pillHeight,
    };
  };

  const currentPosition = () => {
    const box = bounds();
    const stored = watchPosition();
    if (stored) {
      return {
        x: clamp(stored.x, box.minX, box.maxX),
        y: clamp(stored.y, box.minY, box.maxY),
      };
    }
    return {
      x: box.maxX,
      y: clamp(box.maxY - watchDockOffset(), box.minY, box.maxY),
    };
  };

  const panelLayout = () => {
    const box = bounds();
    const position = currentPosition();
    const aboveSpace = position.y - TOP_INSET;
    const belowSpace = box.height - (position.y + box.pillHeight) - EDGE_INSET;
    const above = aboveSpace >= belowSpace;
    const available = Math.max(0, (above ? aboveSpace : belowSpace) - 8);
    const alignLeft =
      box.width - (position.x + box.pillWidth) - EDGE_INSET >= position.x - EDGE_INSET;
    return {
      above,
      alignLeft,
      maxListHeight: Math.max(96, Math.min(560, available - 132)),
    };
  };

  const panelStyle = () => {
    const layout = panelLayout();
    const height = pillSize().height || 44;
    return {
      left: layout.alignLeft ? 0 : undefined,
      right: layout.alignLeft ? undefined : 0,
      ...(layout.above ? { bottom: height + 8 } : { top: height + 8 }),
    };
  };

  const startDrag = () => dragging.set(true);

  const endDrag = (event: { cancelled: boolean; translation: { x: number; y: number } }) => {
    if (
      event.cancelled ||
      (Math.abs(event.translation.x) < 1 && Math.abs(event.translation.y) < 1)
    ) {
      batch(() => {
        dragX.set(0);
        dragY.set(0);
        dragging.set(false);
      });
      return;
    }
    const box = bounds();
    const position = currentPosition();
    const raw = {
      x: position.x + event.translation.x,
      y: position.y + event.translation.y,
    };
    const next = {
      x: clamp(raw.x, box.minX, box.maxX),
      y: clamp(raw.y, box.minY, box.maxY),
    };
    if (next.x !== raw.x || next.y !== raw.y) animateDock();
    batch(() => {
      setWatchPosition(next);
      dragX.set(0);
      dragY.set(0);
      dragging.set(false);
    });
  };

  const chevron = () => {
    const above = panelLayout().above;
    if (watchDockOpen()) return above ? "chevronDown" : "chevronUp";
    return above ? "chevronUp" : "chevronDown";
  };

  const tooltipPlacement = () => (panelLayout().above ? "bottom" : "top");

  return (
    <View
      testID="watch-dock"
      class="absolute z-40 max-[1023px]:hidden"
      style={{
        left: currentPosition().x,
        top: currentPosition().y,
        transform: [{ translateX: dragX }, { translateY: dragY }],
      }}
    >
      <If when={watchDockOpen()}>
        <View class="absolute w-92" style={panelStyle()}>
          <Reveal from={panelLayout().above ? "bottom" : "top"} testID="watch-dock-panel">
            <WatchPanel maxListHeight={panelLayout().maxListHeight} onReset={resetPosition} />
          </Reveal>
        </View>
      </If>
      <View
        class="h-11 flex-row items-center gap-1 rounded-full border border-border bg-popover py-1 pl-1.5 pr-1.5 shadow-lg"
        onLayout={(event) => {
          const next = event.bounds.size;
          const current = pillSize();
          if (current.width !== next.width || current.height !== next.height) {
            pillSize.set(next);
          }
        }}
        style={{ opacity: dragging() ? 0.92 : 1 }}
      >
        <View
          role="button"
          accessibilityLabel={`Watching, ${watchedCountLabel()} tracked, ${actionCountLabel()} need action`}
          accessibilityHint="Press to expand"
          testID="watch-dock-toggle"
          onPress={() => watchDockOpen.set(!watchDockOpen())}
          class="min-w-0 flex-1 flex-row items-center gap-2 rounded-full pr-1"
          hoverStyle={{ backgroundColor: token("accent") }}
          focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 2 }}
        >
          <View class="h-8 w-8 items-center justify-center rounded-full bg-accent">
            <Icon name="eye" size={14} tone="chart-1" />
          </View>
          <View class="gap-0.5">
            <Text class="text-[11px] font-semibold leading-3 text-foreground">Watching</Text>
            <Text class="text-[10px] leading-3 text-muted-foreground">
              {watchedCountLabel()} tracked
              {actionCountLabel() > 0 ? ` · ${actionCountLabel()} need action` : ""}
            </Text>
          </View>
          <If when={actionCountLabel() > 0}>
            <View class="h-5 min-w-5 items-center justify-center rounded-full bg-warning px-1.5">
              <Text class="text-[10px] font-bold tabular-nums text-warning-foreground">
                {actionCountLabel()}
              </Text>
            </View>
          </If>
          <Icon name={chevron()} size={10} tone="muted-foreground" />
        </View>
        <View
          role="button"
          accessibilityLabel="Drag to reposition"
          testID="watch-dock-grip"
          focusable={false}
          tooltip={<Tooltip label="Drag to reposition" placement={tooltipPlacement()} />}
          class="h-8 w-6 items-center justify-center rounded-md"
          style={{ cursor: dragging() ? "grabbing" : "grab" }}
          hoverStyle={{ backgroundColor: token("accent") }}
          pan={{ x: dragX, y: dragY }}
          onPanStart={startDrag}
          onPanEnd={endDrag}
        >
          <Icon name="move" size={12} tone="muted-foreground" />
        </View>
      </View>
    </View>
  );
}
