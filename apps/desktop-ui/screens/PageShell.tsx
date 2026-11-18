import type { JSX } from "nsh";
import { Scroll, Text, View } from "nsh";
import { ScreenFade } from "../components/motion";

export function PageHeader(props: { title: string; description: string; actions?: JSX.Element }) {
  return (
    <View class="shrink-0 flex-row items-end justify-between gap-4 border-b border-border px-6 py-5">
      <View class="min-w-0 gap-1">
        <Text class="text-[24px] font-semibold tracking-tight text-foreground">{props.title}</Text>
        <Text class="max-w-150 text-[12.5px] leading-5 text-muted-foreground">
          {props.description}
        </Text>
      </View>
      {props.actions}
    </View>
  );
}

export function PageShell(props: {
  title: string;
  description: string;
  actions?: JSX.Element;
  tabs?: JSX.Element;
  children?: JSX.Element;
  testID?: string;
}) {
  return (
    <View class="min-h-0 flex-1 flex-col bg-background" testID={props.testID}>
      <PageHeader title={props.title} description={props.description} actions={props.actions} />
      <If when={props.tabs}>
        <View class="shrink-0 border-b border-border px-6 py-2.5">{props.tabs}</View>
      </If>
      <Scroll class="flex-1 min-h-0" scrollbar={false}>
        <ScreenFade>
          <View class="gap-5 p-6">{props.children}</View>
        </ScreenFade>
      </Scroll>
    </View>
  );
}

export function PageActions(props: { children?: JSX.Element }) {
  return <View class="shrink-0 flex-row items-center gap-2">{props.children}</View>;
}
