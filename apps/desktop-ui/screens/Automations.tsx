import { Text, token, View } from "nsh";
import { Badge, Button, Card, Icon, SectionTitle, withAlpha } from "../components/ui";
import { useAfter } from "../components/motion";
import { Skeleton, SkeletonPanel } from "../components/skeletons";
import { Toggle } from "../components/Toggle";
import { AutomationDialogs } from "./automations/AutomationDialogs";
import { automationRows, newRuleOpen, runLogOpen } from "./automations/state";
import { PageActions, PageShell } from "./PageShell";
import { recentRuns, type AutomationRule } from "./automations/data";

function toggleRule(rule: AutomationRule) {
  automationRows.set(
    automationRows().map((row) => (row.id === rule.id ? { ...row, enabled: !row.enabled } : row)),
  );
}

function RuleList() {
  const ready = useAfter(260);
  return (
    <If
      when={ready()}
      else={
        <View class="gap-2">
          <Skeleton class="h-24 rounded-xl" />
          <Skeleton class="h-24 rounded-xl" />
          <Skeleton class="h-24 rounded-xl" />
          <Skeleton class="h-24 rounded-xl" />
        </View>
      }
    >
      <View class="gap-2">
        <Each of={automationRows()}>
          {(rule: () => AutomationRule, index: () => number) => (
            <Card class="gap-3 p-4">
              <View class="flex-row items-start gap-3">
                <View
                  class="mt-0.5 h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: withAlpha(token(rule().tone), "20") }}
                >
                  <Icon name="workflow" size={14} tone={rule().tone} />
                </View>
                <View class="min-w-0 flex-1 gap-1">
                  <View class="flex-row items-center gap-2">
                    <Text class="text-[13px] font-semibold text-foreground">{rule().title}</Text>
                    <Badge variant={rule().enabled ? "success" : "outline"}>
                      <Text
                        class="text-[9px] font-medium"
                        style={{
                          color: rule().enabled ? token("success") : token("muted-foreground"),
                        }}
                      >
                        {rule().enabled ? "Active" : "Paused"}
                      </Text>
                    </Badge>
                  </View>
                  <Text class="text-[11px] leading-4.25 text-muted-foreground">
                    {rule().description}
                  </Text>
                </View>
                <Toggle
                  on={() => rule().enabled}
                  onPress={() => toggleRule(rule())}
                  label={`Toggle ${rule().title}`}
                  testID={`automation-toggle-${index()}`}
                />
              </View>
              <View class="flex-row items-center gap-3 border-t border-border pt-2.5">
                <View class="flex-1 gap-0.5">
                  <Text class="text-[9.5px] uppercase tracking-wide text-muted-foreground">
                    Trigger
                  </Text>
                  <Text class="text-[10.5px] font-medium text-foreground">{rule().trigger}</Text>
                </View>
                <View class="flex-1 gap-0.5">
                  <Text class="text-[9.5px] uppercase tracking-wide text-muted-foreground">
                    Action
                  </Text>
                  <Text class="text-[10.5px] font-medium text-foreground">{rule().action}</Text>
                </View>
                <Text class="text-[10px] text-muted-foreground">{rule().runs}</Text>
              </View>
            </Card>
          )}
        </Each>
      </View>
    </If>
  );
}

function RecentRuns() {
  const ready = useAfter(360);
  return (
    <If when={ready()} else={<SkeletonPanel rows={4} />}>
      <Card class="gap-3 p-4">
        <SectionTitle>Recent runs</SectionTitle>
        <Each of={recentRuns}>
          {(run: () => (typeof recentRuns)[number]) => (
            <View class="flex-row items-start gap-2.5 border-t border-border pt-2.5 first:border-t-0 first:pt-0">
              <View
                class="mt-1 h-2 w-2 rounded-full"
                style={{ backgroundColor: token(run().tone) }}
              />
              <View class="min-w-0 flex-1 gap-0.5">
                <Text class="text-[11px] font-medium text-foreground">{run().name}</Text>
                <Text class="text-[10px] leading-3.75 text-muted-foreground">{run().detail}</Text>
              </View>
              <Text class="text-[9.5px] text-muted-foreground">{run().time}</Text>
            </View>
          )}
        </Each>
        <Button variant="outline" size="sm" onPress={() => runLogOpen.set(true)}>
          <Text class="text-[11px] font-medium">View run log</Text>
          <Icon name="chevronRight" size={11} tone="muted-foreground" />
        </Button>
      </Card>
    </If>
  );
}

export function AutomationsScreen() {
  return (
    <>
      <PageShell
        title="Automation & Workflows"
        description="Deterministic follow-ups and routing rules, without AI dependence."
        testID="screen-automations"
        actions={
          <PageActions>
            <Button variant="primary" size="sm" onPress={() => newRuleOpen.set(true)}>
              <Icon name="plus" size={12} tone="primary-foreground" />
              <Text class="text-[11px] font-semibold text-primary-foreground">New rule</Text>
            </Button>
          </PageActions>
        }
      >
        <View class="flex-row gap-3">
          <View class="min-w-0 flex-1">
            <RuleList />
          </View>
          <View class="w-72 shrink-0">
            <RecentRuns />
          </View>
        </View>
      </PageShell>
      <AutomationDialogs />
    </>
  );
}
