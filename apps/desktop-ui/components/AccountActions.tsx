import { colorScheme, setColorScheme, Text, token, View } from "nsh";
import { onboardingOpen } from "../screens/settings/state";
import { activeNav, locked, showToast } from "../state";
import { Icon, type IconName } from "./ui";

export interface AccountAction {
  id: string;
  icon: IconName;
  label: string;
  detail: string;
  danger?: boolean;
  keepOpen?: boolean;
  onSelect: () => void;
}

/**
 * Actions shared by the account dialog and the sidebar profile popover, so the
 * two surfaces never drift on labels or behavior.
 */
export function commonAccountActions(): AccountAction[] {
  return [
    {
      id: "workspace-settings",
      icon: "settings",
      label: "Workspace settings",
      detail: "Name, currency, timezone",
      onSelect: () => activeNav.set("Settings"),
    },
    {
      id: "security-sessions",
      icon: "shieldCheck",
      label: "Security & sessions",
      detail: "Devices, auto-lock, access",
      onSelect: () => {
        activeNav.set("Settings");
        showToast("Opened device and security settings.");
      },
    },
    {
      id: "theme",
      icon: colorScheme() === "dark" ? "sun" : "moon",
      label: colorScheme() === "dark" ? "Switch to light theme" : "Switch to dark theme",
      detail: "Applies immediately",
      keepOpen: true,
      onSelect: () => setColorScheme(colorScheme() === "dark" ? "light" : "dark"),
    },
    {
      id: "product-tour",
      icon: "sparkles",
      label: "Product tour",
      detail: "A short walkthrough of the new workflows",
      onSelect: () => onboardingOpen.set(true),
    },
    {
      id: "sign-out",
      icon: "arrowUpRight",
      label: "Sign out",
      detail: "End this desktop session",
      danger: true,
      onSelect: () => locked.set(true),
    },
  ];
}

export function AccountActionRow(props: {
  action: AccountAction;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <View
      role="button"
      accessibilityLabel={props.action.label}
      testID={props.testID}
      onPress={props.onPress}
      class="flex-row items-center gap-2.5 rounded-lg px-2 py-2"
      hoverStyle={{ backgroundColor: token("accent") }}
      focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: -2 }}
    >
      <View class="h-6 w-6 items-center justify-center rounded-md bg-muted">
        <Icon
          name={props.action.icon}
          size={12}
          tone={props.action.danger ? "destructive" : "muted-foreground"}
        />
      </View>
      <View class="min-w-0 flex-1 gap-0.5">
        <Text
          class="text-[12px] font-medium"
          style={{ color: token(props.action.danger ? "destructive" : "foreground") }}
        >
          {props.action.label}
        </Text>
        <Text class="text-[11px] text-muted-foreground">{props.action.detail}</Text>
      </View>
      <Icon name="chevronRight" size={10} tone="muted-foreground" />
    </View>
  );
}
