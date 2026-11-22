import { signal, Text, token, View } from "nsh";
import { Icon, withAlpha } from "./ui";
import {
  moduleCount,
  moduleIsActive,
  sectionIsActive,
  selectModule,
  type NavModule,
  type NavSection,
} from "./nav-config";

export function ModuleRow(props: { module: NavModule; active: boolean; indent?: boolean }) {
  return (
    <View
      role="button"
      accessibilityLabel={props.module.label}
      testID={`nav-${props.module.id}`}
      onPress={() => selectModule(props.module)}
      class={`h-9 flex-row items-center gap-2 rounded-md pr-2 ${
        props.active ? "shadow-sm" : ""
      } ${props.indent === false ? "pl-2" : "pl-7"}`}
      style={{ backgroundColor: props.active ? token("nav-active") : "transparent" }}
      hoverStyle={{ backgroundColor: token("accent") }}
      activeStyle={{ opacity: 0.7 }}
      focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
    >
      <Icon
        name={props.module.icon}
        size={13}
        tone={props.active ? "nav-active-foreground" : "muted-foreground"}
      />
      <Text
        class="min-w-0 flex-1 truncate text-[12px] font-medium"
        style={{
          color: props.active ? token("nav-active-foreground") : token("sidebar-foreground"),
        }}
      >
        {props.module.label}
      </Text>
      <If when={moduleCount(props.module) !== undefined}>
        <View
          class="h-5 min-w-5 items-center justify-center rounded px-1"
          style={{
            backgroundColor: props.active ? withAlpha(token("primary"), "33") : token("secondary"),
          }}
        >
          <Text
            class="text-[11px] font-semibold tabular-nums"
            style={{
              color: props.active ? token("nav-active-foreground") : token("muted-foreground"),
            }}
          >
            {moduleCount(props.module)}
          </Text>
        </View>
      </If>
    </View>
  );
}

export function Group(props: { group: NavSection }) {
  const open = signal(true);
  return (
    <View class="gap-0.5">
      <View
        role="button"
        accessibilityLabel={`Toggle ${props.group.label} navigation`}
        testID={`nav-section-${props.group.id}`}
        onPress={() => open.set(!open())}
        class="h-7 flex-row items-center gap-1.5 rounded-md px-1.5"
        hoverStyle={{ backgroundColor: token("accent") }}
        focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
      >
        <Icon name={open() ? "chevronDown" : "chevronRight"} size={10} tone="muted-foreground" />
        <Icon
          name={props.group.icon}
          size={12}
          tone={sectionIsActive(props.group) ? "highlight" : "muted-foreground"}
        />
        <Text
          class="min-w-0 flex-1 truncate text-[11px] font-semibold uppercase tracking-wider"
          style={{
            color: sectionIsActive(props.group) ? token("highlight") : token("muted-foreground"),
          }}
        >
          {props.group.label}
        </Text>
      </View>
      <If when={open()}>
        <Each of={props.group.modules}>
          {(module: () => NavModule) => (
            <ModuleRow module={module()} active={moduleIsActive(props.group, module())} indent />
          )}
        </Each>
      </If>
    </View>
  );
}
