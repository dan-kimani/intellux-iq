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
