import { Text, token, View } from "nsh";
import { Avatar, Badge, Button, Card, Icon, Logo, SectionTitle, withAlpha } from "../components/ui";
import { useAfter } from "../components/motion";
import { Skeleton, SkeletonMetric, SkeletonPanel, SkeletonTable } from "../components/skeletons";
import { PageActions, PageShell } from "./PageShell";
import { segments, type ContactRow } from "./contacts/data";
import { ContactManageDialogs } from "./contacts/ManageDialogs";
import { ContactPage } from "./contacts/ContactPage";
import { activeNav, activeNavChild } from "../state";
import { contactDetail, contactRows, importContactsOpen, newContactOpen } from "./contacts/state";

function ContactMetrics() {
  const ready = useAfter(160);
  const metrics = [
    {
      label: "Total contacts",
      value: "248",
      note: "+12 this week",
      icon: "users" as const,
      tone: "chart-1" as const,
    },
    {
      label: "Active conversations",
      value: "42",
      note: "9 need a reply",
      icon: "messageCircle" as const,
      tone: "chart-3" as const,
    },
    {
      label: "Companies",
      value: "96",
      note: "Across 4 segments",
      icon: "briefcase" as const,
      tone: "chart-2" as const,
    },
    {
      label: "Needs recovery",
      value: "7",
      note: "Silent for 3+ days",
      icon: "zap" as const,
      tone: "chart-4" as const,
    },
  ];
  return (
    <If
      when={ready()}
      else={
        <View class="grid grid-cols-4 gap-3">
          <SkeletonMetric />
          <SkeletonMetric />
          <SkeletonMetric />
          <SkeletonMetric />
        </View>
      }
    >
      <View class="grid grid-cols-4 gap-3">
        <Each of={metrics}>
          {(metric: () => (typeof metrics)[number]) => (
            <Card class="gap-2.5 p-3.5">
              <View class="flex-row items-center justify-between">
                <View
                  class="h-7 w-7 items-center justify-center rounded-lg"
                  style={{ backgroundColor: withAlpha(token(metric().tone), "22") }}
                >
                  <Icon name={metric().icon} size={13} tone={metric().tone} />
                </View>
                <Text class="text-[11px] text-muted-foreground">{metric().note}</Text>
              </View>
              <Text class="text-[22px] font-semibold tabular-nums text-foreground">
                {metric().value}
              </Text>
              <Text class="text-[12px] text-muted-foreground">{metric().label}</Text>
            </Card>
          )}
        </Each>
      </View>
    </If>
  );
}

function ContactTable() {
  const ready = useAfter(300);
  return (
    <If when={ready()} else={<SkeletonTable rows={6} columns={5} />}>
      <Card class="overflow-hidden">
        <View class="flex-row items-center gap-3 border-b border-border px-4 py-3">
          <Text class="flex-1 text-[13px] font-semibold text-foreground">Directory</Text>
          <Text class="text-[12px] text-muted-foreground">{contactRows().length} of 248</Text>
          <Icon name="funnel" size={12} tone="muted-foreground" />
        </View>
        <View class="flex-row items-center gap-3 border-b border-border bg-panel-strong px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <Text class="flex-1">Contact</Text>
          <Text class="w-28">Owner</Text>
          <Text class="w-20">Channel</Text>
          <Text class="w-20">Last touch</Text>
          <Text class="w-14">Status</Text>
        </View>
        <Each of={contactRows()}>
          {(contact: () => ContactRow) => (
            <View
              role="button"
              accessibilityLabel={`Open ${contact().name}`}
              onPress={() => contactDetail.set(contact())}
              class="flex-row items-center gap-3 border-b border-border px-4 py-2.5 transition-colors last:border-b-0"
              hoverStyle={{ backgroundColor: token("accent") }}
              focusVisibleStyle={{
                outlineWidth: 2,
                outlineColor: token("ring"),
                outlineOffset: -2,
              }}
            >
              <View class="min-w-0 flex-1 flex-row items-center gap-2.5">
                <Avatar name={contact().name} size={30} online={contact().status === "active"} />
                <View class="min-w-0 gap-0.5">
                  <Text class="text-[12px] font-medium text-foreground">{contact().name}</Text>
                  <Text class="text-[11px] text-muted-foreground">{contact().company}</Text>
                </View>
              </View>
              <Text class="w-28 text-[12px] text-muted-foreground">{contact().owner}</Text>
              <View class="w-20 flex-row items-center gap-1">
                <Icon
                  name={contact().channel === "WhatsApp" ? "messageCircle" : "mail"}
                  size={10}
                  tone="muted-foreground"
                />
                <Text class="text-[11px] text-muted-foreground">{contact().channel}</Text>
              </View>
              <Text class="w-20 text-[11px] tabular-nums text-muted-foreground">
                {contact().lastTouch}
              </Text>
              <View class="w-14 items-start">
                <Badge
                  variant={
                    contact().status === "active"
                      ? "success"
                      : contact().status === "new"
                        ? "primary"
                        : "warning"
                  }
                >
                  <Text
                    class="text-[11px] font-medium capitalize"
                    style={{
                      color: token(
                        contact().status === "active"
                          ? "success"
                          : contact().status === "new"
                            ? "info"
                            : "warning",
                      ),
                    }}
                  >
                    {contact().status}
                  </Text>
                </Badge>
              </View>
            </View>
          )}
        </Each>
      </Card>
    </If>
  );
}

function ContactSide() {
  const ready = useAfter(380);
  return (
    <View class="w-72 shrink-0 gap-3">
      <If
        when={ready()}
        else={
          <>
            <SkeletonPanel rows={4} />
            <Skeleton class="h-28 rounded-xl" />
          </>
        }
      >
        <Card class="gap-3 p-4">
          <SectionTitle>Segments</SectionTitle>
          <Each of={segments}>
            {(segment: () => (typeof segments)[number]) => (
              <View class="gap-1.5">
                <View class="flex-row items-center justify-between">
                  <Text class="text-[12px] text-foreground">{segment().label}</Text>
                  <Text class="text-[12px] font-semibold text-foreground">{segment().value}</Text>
                </View>
                <View class="h-1 overflow-hidden rounded-full bg-muted">
                  <View
                    class="h-full rounded-full"
                    style={{
                      width: `${segment().value * 2}%`,
                      backgroundColor: token(segment().tone),
                    }}
                  />
                </View>
              </View>
            )}
          </Each>
          <Button
            variant="outline"
            size="sm"
            onPress={() => {
              activeNavChild.set("segments");
              activeNav.set("Segments");
            }}
          >
            <Text class="text-[12px] font-medium">Manage segments</Text>
            <Icon name="chevronRight" size={11} tone="muted-foreground" />
          </Button>
        </Card>
        <Card class="gap-3 p-4">
          <SectionTitle>Recently added</SectionTitle>
          <View class="flex-row items-center gap-2.5">
            <Logo size={30} />
            <View class="min-w-0 flex-1 gap-0.5">
              <Text class="text-[12px] font-medium text-foreground">Acme Inc.</Text>
              <Text class="text-[11px] text-muted-foreground">via imported CSV · 14m ago</Text>
            </View>
            <Icon name="arrowUpRight" size={11} tone="muted-foreground" />
          </View>
          <View class="flex-row items-center gap-2.5">
            <Avatar name="Grace Chen" size={30} />
            <View class="min-w-0 flex-1 gap-0.5">
              <Text class="text-[12px] font-medium text-foreground">Grace Chen</Text>
              <Text class="text-[11px] text-muted-foreground">New lead · 42m ago</Text>
            </View>
            <Icon name="arrowUpRight" size={11} tone="muted-foreground" />
          </View>
        </Card>
      </If>
    </View>
  );
}

function Directory() {
  return (
    <PageShell
      title="Contacts"
      description="Every contact, company, and conversation in one org-wide directory."
      testID="screen-contacts"
      actions={
        <PageActions>
          <Button variant="outline" size="sm" onPress={() => importContactsOpen.set(true)}>
            <Icon name="download" size={12} tone="muted-foreground" />
            <Text class="text-[12px] font-medium">Import</Text>
          </Button>
          <Button variant="primary" size="sm" onPress={() => newContactOpen.set(true)}>
            <Icon name="plus" size={12} tone="primary-foreground" />
            <Text class="text-[12px] font-semibold text-primary-foreground">New contact</Text>
          </Button>
        </PageActions>
      }
    >
      <ContactMetrics />
      <View class="flex-row gap-3">
        <View class="min-w-0 flex-1">
          <ContactTable />
        </View>
        <ContactSide />
      </View>
    </PageShell>
  );
}

export function ContactsScreen() {
  return (
    <>
      <If when={contactDetail()} else={<Directory />}>
        <ContactPage contact={contactDetail()!} />
      </If>
      <ContactManageDialogs />
    </>
  );
}
