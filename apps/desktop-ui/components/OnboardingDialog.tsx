import { signal, Text, token, View } from "nsh";
import { AppDialog } from "./overlay";
import { Button, Icon, Logo, withAlpha } from "./ui";
import { onboardingOpen } from "../screens/settings/state";

const closeTour = () => onboardingOpen.set(false);

const steps = [
  {
    title: "One workspace, every customer",
    detail:
      "Conversations, contacts, opportunities, quotes, and catalog live together — with org-wide read visibility and assignment-aware writes.",
    icon: "users" as const,
    tone: "chart-2" as const,
  },
  {
    title: "Deterministic recovery",
    detail:
      "Signals show the evidence, owner, age, and next action. Outcomes resolve them; dismissal alone never counts as a recovery.",
    icon: "bell" as const,
    tone: "chart-4" as const,
  },
  {
    title: "Quote and dispatch offline",
    detail:
      "Build a quote, compile the PDF locally, and dispatch catalog media. The cloud queues sends when you are offline.",
    icon: "fileText" as const,
    tone: "chart-1" as const,
  },
  {
    title: "Security stays local",
    detail:
      "SQLCipher cache, keychain-held keys, auto-lock, and a seven-day offline lease. Provider credentials never reach this desktop.",
    icon: "shieldCheck" as const,
    tone: "chart-3" as const,
  },
];

export function OnboardingDialog() {
  const step = signal(0);
  const current = () => steps[step()] ?? steps[0];
  const last = () => step() >= steps.length - 1;
  return (
    <AppDialog
      open={() => true}
      onClose={closeTour}
      title="Product tour"
      description={`${step() + 1} of ${steps.length} · IntelluxIQ desktop`}
      width={560}
      testID="onboarding-dialog"
      footer={
        <View class="w-full flex-row items-center justify-between">
          <Button variant="ghost" size="sm" onPress={closeTour}>
            <Text class="text-[10px] font-medium">Skip</Text>
          </Button>
          <View class="flex-row items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={step() === 0}
              onPress={() => step.set(Math.max(0, step() - 1))}
            >
              <Text class="text-[10px] font-medium">Back</Text>
            </Button>
            <Button
              variant="primary"
              size="sm"
              testID="onboarding-next"
              onPress={() => {
                if (last()) {
                  closeTour();
                } else {
                  step.set(step() + 1);
                }
              }}
            >
              <Text class="text-[10px] font-semibold text-primary-foreground">
                {last() ? "Get started" : "Next"}
              </Text>
              <Icon name={last() ? "check" : "chevronRight"} size={11} tone="primary-foreground" />
            </Button>
          </View>
        </View>
      }
    >
      <View class="items-center gap-4 py-4">
        <Logo size={42} />
        <View
          class="h-14 w-14 items-center justify-center rounded-2xl"
          style={{ backgroundColor: withAlpha(token(current().tone), "20") }}
        >
          <Icon name={current().icon} size={24} tone={current().tone} />
        </View>
        <View class="items-center gap-1">
          <Text class="text-center text-[17px] font-semibold tracking-tight text-foreground">
            {current().title}
          </Text>
          <Text class="max-w-96 text-center text-[10px] leading-4 text-muted-foreground">
            {current().detail}
          </Text>
        </View>
        <View class="flex-row items-center gap-1.5">
          <Each of={steps}>
            {(item: () => (typeof steps)[number], index: () => number) => (
              <View
                class="rounded-full"
                style={{
                  width: index() === step() ? 18 : 5,
                  height: 5,
                  backgroundColor: index() === step() ? token("primary") : token("muted"),
                }}
              />
            )}
          </Each>
        </View>
        <View class="grid grid-cols-3 gap-2 self-stretch">
          <Pill label="Inbox" />
          <Pill label="Recovery" />
          <Pill label="Quotes" />
          <Pill label="Catalog" />
          <Pill label="Offline" />
          <Pill label="Locked" />
        </View>
      </View>
    </AppDialog>
  );
}

function Pill(props: { label: string }) {
  return (
    <View class="h-6 items-center justify-center rounded-md border border-border bg-panel">
      <Text class="text-[8px] font-medium text-muted-foreground">{props.label}</Text>
    </View>
  );
}
