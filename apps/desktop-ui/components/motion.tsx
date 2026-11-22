import type { Component } from "nsh";
import { effect, type JSX, reduceMotion, signal, untracked, View } from "nsh";

export function useAfter(delay = 240): () => boolean {
  const ready = signal(false);
  effect(() => {
    const timer = setTimeout(() => ready.set(true), delay);
    return () => clearTimeout(timer);
  });
  return ready;
}

export function ScreenFade(props: { children?: JSX.Element; class?: string }) {
  const entered = useAfter(24);
  return (
    <View
      class={props.class ?? "flex-1 min-h-0"}
      style={{
        opacity: entered() ? 1 : 0,
        transform: entered() ? "translateY(0px)" : "translateY(6px)",
        transitionProperty: "opacity, transform",
        transitionDuration: reduceMotion() ? 0 : 180,
        transitionTimingFunction: "ease-out",
      }}
    >
      {props.children}
    </View>
  );
}

/** Fades and lifts a newly mounted element into place. */
export function Reveal(props: {
  children?: JSX.Element;
  delay?: number;
  from?: "bottom" | "top" | "scale";
  class?: string;
  testID?: string;
}) {
  const entered = useAfter(props.delay ?? 16);
  const hidden =
    props.from === "top"
      ? "translateY(-4px) scale(0.98)"
      : props.from === "scale"
        ? "scale(0.92)"
        : "translateY(4px) scale(0.98)";
  return (
    <View
      class={props.class}
      testID={props.testID}
      style={{
        opacity: entered() ? 1 : 0,
        transform: entered() ? "translateY(0px) scale(1)" : hidden,
        transitionProperty: "opacity, transform",
        transitionDuration: reduceMotion() ? 0 : 170,
        transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      }}
    >
      {props.children}
    </View>
  );
}

interface SwapEntry {
  key: string;
  id: number;
  phase: "entering" | "idle" | "exiting";
}

let swapSequence = 0;

/**
 * Cross-fades content when `swapKey` changes, keeping the outgoing pane until
 * its exit transition finishes. Render by the key so each pane keeps its own
 * data while both are visible.
 */
export function AnimatedSwap(props: {
  swapKey: string;
  children: (key: string) => JSX.Element;
  class?: string;
  duration?: number;
  layout?: "overlay" | "stack";
}) {
  const entries = signal<SwapEntry[]>([
    { key: props.swapKey, id: swapSequence++, phase: "entering" },
  ]);
  effect(() => {
    const key = props.swapKey;
    const duration = props.duration ?? 190;
    const current = untracked(entries);
    const last = current[current.length - 1];
    if (last?.key === key) {
      if (last.phase !== "entering" || reduceMotion()) return;
      const settle = setTimeout(() => {
        entries.set(
          untracked(entries).map((entry) =>
            entry.phase === "entering" ? { ...entry, phase: "idle" } : entry,
          ),
        );
      }, 20);
      return () => clearTimeout(settle);
    }
    if (reduceMotion()) {
      entries.set([{ key, id: swapSequence++, phase: "idle" }]);
      return;
    }
    entries.set([
      ...current.map((entry) => ({ ...entry, phase: "exiting" as const })),
      { key, id: swapSequence++, phase: "entering" },
    ]);
    const settle = setTimeout(() => {
      entries.set(
        untracked(entries).map((entry) =>
          entry.phase === "entering" ? { ...entry, phase: "idle" } : entry,
        ),
      );
    }, 20);
    const remove = setTimeout(() => {
      entries.set(untracked(entries).filter((entry) => entry.phase !== "exiting"));
    }, duration);
    return () => {
      clearTimeout(settle);
      clearTimeout(remove);
    };
  });
  const stack = props.layout === "stack";
  return (
    <View
      class={props.class ?? "relative min-h-0 flex-1"}
      style={
        stack
          ? { display: "grid", overflow: "hidden" }
          : { position: "relative", overflow: "hidden" }
      }
    >
      <Each of={entries()}>
        {(entry: () => SwapEntry) => (
          <View
            class={stack ? "min-h-0" : "absolute inset-0 min-h-0"}
            style={{
              ...(stack ? { gridRow: "1", gridColumn: "1" } : {}),
              opacity: entry().phase === "idle" ? 1 : 0,
              transform:
                entry().phase === "entering"
                  ? "translateY(5px)"
                  : entry().phase === "exiting"
                    ? "translateY(-4px)"
                    : "translateY(0px)",
              transitionProperty: "opacity, transform",
              transitionDuration: reduceMotion() ? 0 : (props.duration ?? 190),
              transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)",
              pointerEvents: entry().phase === "exiting" ? "none" : "auto",
            }}
          >
            {props.children(entry().key)}
          </View>
        )}
      </Each>
    </View>
  );
}

/** Wraps a component with the shared entry motion. Use inside an
 * `AnimatedSwap`/`Sheet` when the same content also needs an exit. */
export function withMotion<P extends object>(
  Wrapped: Component<P>,
  options?: { class?: string; from?: "bottom" | "top" | "scale"; delay?: number },
): Component<P> {
  return function MotionWrapped(props: P) {
    return (
      <Reveal
        class={options?.class ?? "min-h-0 flex-1"}
        {...(options?.from ? { from: options.from } : {})}
        {...(options?.delay === undefined ? {} : { delay: options.delay })}
      >
        {Wrapped(props)}
      </Reveal>
    );
  };
}
