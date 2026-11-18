import { View } from "nsh";
import { Card } from "./ui";

export function Skeleton(props: { class?: string; style?: object }) {
  return (
    <View class={`animate-pulse rounded-md bg-muted ${props.class ?? ""}`} style={props.style} />
  );
}

export function SkeletonLines(props: { lines?: number; class?: string }) {
  const lines = props.lines ?? 3;
  return (
    <View class={`gap-2 ${props.class ?? ""}`}>
      <Each of={Array.from({ length: lines }, (_, index) => index)}>
        {(index: () => number) => (
          <Skeleton class="h-2.5" style={{ width: index() === lines - 1 ? "58%" : "100%" }} />
        )}
      </Each>
    </View>
  );
}

export function SkeletonMetric() {
  return (
    <Card class="gap-3 p-4">
      <View class="flex-row items-center justify-between">
        <Skeleton class="h-8 w-8 rounded-lg" />
        <Skeleton class="h-2.5 w-12" />
      </View>
      <Skeleton class="h-6 w-24" />
      <Skeleton class="h-2.5 w-32" />
    </Card>
  );
}

export function SkeletonPanel(props: { rows?: number }) {
  const rows = props.rows ?? 4;
  return (
    <Card class="gap-3 p-4">
      <View class="flex-row items-center justify-between">
        <Skeleton class="h-3 w-32" />
        <Skeleton class="h-3 w-16" />
      </View>
      <Each of={Array.from({ length: rows }, (_, index) => index)}>
        {(index: () => number) => (
          <View class="flex-row items-center gap-3 border-t border-border pt-3">
            <Skeleton class="h-8 w-8 rounded-full" />
            <View class="flex-1 gap-2">
              <Skeleton class="h-2.5" style={{ width: index() % 2 === 0 ? "64%" : "78%" }} />
              <Skeleton class="h-2 w-28" />
            </View>
            <Skeleton class="h-3 w-12" />
          </View>
        )}
      </Each>
    </Card>
  );
}

export function SkeletonTable(props: { rows?: number; columns?: number }) {
  const rows = props.rows ?? 5;
  const columns = props.columns ?? 5;
  return (
    <Card class="overflow-hidden">
      <View class="flex-row items-center gap-4 border-b border-border bg-panel-strong px-4 py-3">
        <Each of={Array.from({ length: columns }, (_, index) => index)}>
          {(index: () => number) => (
            <Skeleton class="h-2.5 flex-1" style={{ maxWidth: index() === 0 ? 160 : 100 }} />
          )}
        </Each>
      </View>
      <Each of={Array.from({ length: rows }, (_, index) => index)}>
        {() => (
          <View class="flex-row items-center gap-4 border-b border-border px-4 py-3 last:border-b-0">
            <View class="min-w-0 flex-1 flex-row items-center gap-2.5">
              <Skeleton class="h-7 w-7 rounded-full" />
              <View class="flex-1 gap-1.5">
                <Skeleton class="h-2.5 w-32" />
                <Skeleton class="h-2 w-20" />
              </View>
            </View>
            <Each of={Array.from({ length: Math.max(0, columns - 1) }, (_, index) => index)}>
              {() => <Skeleton class="h-2.5 flex-1" />}
            </Each>
          </View>
        )}
      </Each>
    </Card>
  );
}
