import { effect, type JSX, reduceMotion, signal, View } from "nsh";

export function useAfter(delay = 240): () => boolean {
  const ready = signal(false);
  effect(() => {
    const timer = setTimeout(() => ready.set(true), delay);
    return () => clearTimeout(timer);
  });
  return ready;
}

export function ScreenFade(props: { children?: JSX.Element }) {
  const entered = useAfter(24);
  return (
    <View
      class="flex-1 min-h-0"
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
