import { signal, Text, token, View } from "nsh";
import { HoverCard } from "nsh/base";
import { Icon, Tooltip } from "./ui";
import {
  moduleCount,
  moduleIsActive,
  navSections,
  navTopItems,
  sectionIsActive,
  standaloneIsActive,
  selectModule,
  type NavModule,
  type NavSection,
} from "./nav-config";

function SectionFlyout(props: { section: NavSection }) {
  const open = signal(false);
  return (
    <HoverCard
      open={open()}
      onOpenChange={({ open: next }) => open.set(next)}
      openDelay={140}
      closeDelay={240}
      placement="right"
      align="start"
      offset={8}
      popupClass="rounded-xl border border-border bg-popover p-1.5 shadow-2xl transition duration-150 ease-out motion-reduce:transition-none"
      popupStyle={{ width: 268 }}
      popupStartingClass="opacity-0 -translate-x-1"
      popupEndingClass="opacity-0"
      trigger={
        <View
          role="button"
          accessibilityLabel={props.section.label}
          tooltip={<Tooltip label={props.section.label} />}
          testID={`collapsed-nav-${props.section.id}`}
          onPress={() => selectModule(props.section.modules[0])}
          class="h-10 w-10 items-center justify-center rounded-lg"
          style={{
            backgroundColor: sectionIsActive(props.section) ? token("nav-active") : "transparent",
          }}
          hoverStyle={{ backgroundColor: token("accent") }}
          focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
        >
          <Icon
            name={props.section.icon}
            size={16}
            tone={sectionIsActive(props.section) ? "nav-active-foreground" : "muted-foreground"}
          />
        </View>
      }
    >
      <View testID={`collapsed-flyout-${props.section.id}`} class="gap-0.5">
        <View class="flex-row items-center justify-between px-2 py-1.5">
          <Text class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {props.section.label}
          </Text>
        </View>
        <Each of={props.section.modules}>
          {(module: () => NavModule) => (
            <View
              role="button"
              accessibilityLabel={module().label}
              testID={`collapsed-item-${module().id}`}
              onPress={() => {
                open.set(false);
                selectModule(module());
              }}
              class="h-9 flex-row items-center gap-2 rounded-md px-2"
              style={{
                backgroundColor: moduleIsActive(props.section, module())
                  ? token("nav-active")
                  : "transparent",
              }}
              hoverStyle={{ backgroundColor: token("accent") }}
              focusVisibleStyle={{
                outlineWidth: 2,
                outlineColor: token("ring"),
                outlineOffset: -1,
              }}
            >
              <Icon
                name={module().icon}
                size={13}
                tone={
                  moduleIsActive(props.section, module())
                    ? "nav-active-foreground"
                    : "muted-foreground"
                }
              />
              <Text
                class="min-w-0 flex-1 truncate text-[12px] font-medium"
                style={{
                  color: moduleIsActive(props.section, module())
                    ? token("nav-active-foreground")
                    : token("foreground"),
                }}
              >
                {module().label}
              </Text>
              <If when={moduleCount(module()) !== undefined}>
                <Text class="text-[11px] tabular-nums text-muted-foreground">
                  {moduleCount(module())}
                </Text>
              </If>
            </View>
          )}
        </Each>
      </View>
    </HoverCard>
  );
}

function TopItem(props: { module: NavModule }) {
  const active = () => standaloneIsActive(props.module);
  return (
    <View
      role="button"
      accessibilityLabel={props.module.label}
      tooltip={<Tooltip label={props.module.label} />}
      testID={`nav-${props.module.id}`}
      onPress={() => selectModule(props.module)}
      class="h-10 w-10 items-center justify-center rounded-lg"
      style={{ backgroundColor: active() ? token("nav-active") : "transparent" }}
      hoverStyle={{ backgroundColor: token("accent") }}
      focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
    >
      <Icon
        name={props.module.icon}
        size={16}
        tone={active() ? "nav-active-foreground" : "muted-foreground"}
      />
    </View>
  );
}

export function CollapsedNav() {
  return (
    <View class="gap-1">
      <Each of={navTopItems}>{(module: () => NavModule) => <TopItem module={module()} />}</Each>
      <View class="my-1 h-px w-8 bg-border" />
      <Each of={navSections}>
        {(section: () => NavSection) => <SectionFlyout section={section()} />}
      </Each>
    </View>
  );
}
