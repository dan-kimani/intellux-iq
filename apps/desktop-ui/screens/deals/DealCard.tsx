import type { JSX } from "nsh";
import { createAnimatedValue, signal, Text, token, View, type ViewRef } from "nsh";
import { ActionMenu } from "../../components/ActionMenu";
import { Avatar, Icon } from "../../components/ui";
import type { Deal } from "./data";
import { dealActionGroups } from "./DealContextMenu";
import { dealAnchor, dealDetail, dealDrag } from "./state";

export function DealCardBody(props: { deal: Deal; actions?: JSX.Element }) {
  const deal = props.deal;
  return (
    <>
      <View class="flex-row items-center justify-between gap-2">
        <View class="min-w-0 flex-row items-center gap-1.5">
          <View class="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          <Text class="min-w-0 truncate text-[11px] font-medium text-muted-foreground">
            {deal.company}
          </Text>
        </View>
        <View class="shrink-0 flex-row items-center gap-1">
          <Text class="text-[11px] tabular-nums text-muted-foreground">{deal.id}</Text>
          {props.actions}
        </View>
      </View>

      <Text
        class="text-[13px] font-semibold leading-4.5 text-foreground"
        style={{ numberOfLines: 2 }}
      >
        {deal.name}
      </Text>
      <Text class="text-[11px] leading-4 text-muted-foreground" style={{ numberOfLines: 2 }}>
        {deal.nextStep}
      </Text>

      <View class="gap-1 pt-0.5">
        <View class="flex-row items-center justify-between gap-2">
          <Text class="text-[12px] font-semibold tabular-nums text-foreground">{deal.value}</Text>
          <Text class="text-[11px] tabular-nums text-muted-foreground">{deal.probability}%</Text>
        </View>
        <View class="h-1 overflow-hidden rounded-full bg-muted">
          <View
            class="h-full rounded-full bg-primary"
            style={{ width: `${Math.max(4, Math.min(100, deal.probability))}%` }}
          />
        </View>
      </View>

      <View class="flex-row items-center justify-between gap-2 border-t border-border pt-2">
        <View class="min-w-0 flex-row items-center gap-1.5">
          <Avatar name={deal.owner} size={24} testID={`deal-owner-${deal.id}`} />
          <Text class="min-w-0 truncate text-[11px] text-muted-foreground">{deal.owner}</Text>
        </View>
        <View class="flex-row items-center gap-2 text-muted-foreground">
          <If when={deal.quoteId !== "—"}>
            <View class="flex-row items-center gap-0.5">
              <Icon name="fileText" size={9} tone="muted-foreground" />
              <Text class="text-[11px] tabular-nums text-muted-foreground">Quote</Text>
            </View>
          </If>
          <View class="flex-row items-center gap-0.5">
            <Icon name="calendarClock" size={9} tone="muted-foreground" />
            <Text class="text-[11px] tabular-nums text-muted-foreground">{deal.expectedClose}</Text>
          </View>
        </View>
      </View>
    </>
  );
}

export function DealCard(props: {
  deal: Deal;
  onOpen: (deal: Deal, node: ViewRef | undefined) => void;
  onMove: (deal: Deal, steps: number) => void;
  onDragStart: (deal: Deal) => void;
  onDragEnd: () => void;
  onDragTarget: (deal: Deal, steps: number) => void;
}) {
  const deal = props.deal;
  const dragX = createAnimatedValue(0);
  const dragY = createAnimatedValue(0);
  const dragging = signal(false);
  let timer: ReturnType<typeof setInterval> | undefined;
  let node: ViewRef | undefined;
  const selected = () => dealDetail()?.id === deal.id;
  const dimmed = () => dealDetail() !== null && !selected();
  return (
    <View class="relative">
      <If when={selected() && dealAnchor()}>
        <View
          class="absolute rounded-xl bg-popover"
          style={{
            left: dealAnchor()?.side === "right" ? -8 : -12,
            right: dealAnchor()?.side === "right" ? -12 : -8,
            top: -8,
            bottom: -8,
          }}
        />
      </If>
      <View
        role="button"
        ref={(value) => {
          node = value;
        }}
        testID={`deal-${deal.id}`}
        accessibilityLabel={`Open ${deal.name}`}
        onPress={() => props.onOpen(deal, node)}
        pan={{ x: dragX, y: dragY }}
        onPanStart={() => {
          dragging.set(true);
          props.onDragStart(deal);
          void node?.measure().then((box) => {
            if (!box) return undefined;
            dealDrag.set({
              deal,
              left: box.pagePosition.x,
              top: box.pagePosition.y,
              width: box.bounds.size.width,
              x: dragX,
              y: dragY,
            });
            return undefined;
          });
          timer = setInterval(async () => {
            const x = await dragX.getValue();
            props.onDragTarget(deal, Math.round(x / 230));
          }, 50);
        }}
        onPanEnd={(event) => {
          if (timer) clearInterval(timer);
          const steps = Math.round(event.translation.x / 230);
          if (Math.abs(event.translation.x) > 18) {
            props.onMove(deal, steps);
          }
          dragging.set(false);
          dealDrag.set(null);
          props.onDragEnd();
          dragX.set(0);
          dragY.set(0);
        }}
        class="gap-2.5 rounded-xl border border-border bg-card p-3 shadow-md transition-colors"
        style={{
          borderColor: dragging() ? "transparent" : selected() ? token("primary") : token("border"),
          borderWidth: selected() && dealAnchor() ? 0 : undefined,
          backgroundColor: dragging()
            ? "transparent"
            : selected()
              ? token("popover")
              : token("card"),
          opacity: dealDetail()?.id === deal.id && dealAnchor() ? 0 : dimmed() ? 0.42 : 1,
          filter: dimmed() ? "blur(1.5px)" : "none",
          visibility: dragging() ? "hidden" : "visible",
          cursor: dragging() ? "grabbing" : "grab",
        }}
        hoverStyle={{
          borderColor: token("ring"),
          backgroundColor: selected() ? token("popover") : token("accent"),
        }}
        focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 2 }}
      >
        <If when={!dragging()}>
          <DealCardBody
            deal={deal}
            actions={
              <ActionMenu
                testID={`deal-menu-${deal.id}`}
                width={210}
                trigger={
                  <View
                    role="button"
                    accessibilityLabel={`Actions for ${deal.name}`}
                    testID={`deal-menu-trigger-${deal.id}`}
                    class="h-4 w-4 items-center justify-center rounded"
                    hoverStyle={{ backgroundColor: token("accent") }}
                  >
                    <Icon name="ellipsis" size={11} tone="muted-foreground" />
                  </View>
                }
                groups={dealActionGroups(deal, () => props.onOpen(deal, node))}
              />
            }
          />
        </If>
      </View>
    </View>
  );
}
