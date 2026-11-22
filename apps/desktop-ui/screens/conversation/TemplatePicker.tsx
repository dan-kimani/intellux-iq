import { signal, Text, token, View } from "nsh";
import { Input as NativeInput } from "nsh/base";
import { AppDialog, DialogActions, ModalNotice } from "../../components/overlay";
import { Badge, Button, Icon, SectionTitle } from "../../components/ui";
import { templateOpen, type AppliedTemplate } from "../../state";
import { moneyText } from "../../lib/money";

const closeTemplates = () => templateOpen.set(false);

interface Template {
  id: string;
  name: string;
  category: "UTILITY" | "MARKETING" | "AUTHENTICATION";
  language: string;
  status: "APPROVED" | "PENDING" | "REJECTED" | "PAUSED" | "DISABLED";
  body: string;
  variables: string[];
  rejectionReason?: string;
}

const templates: Template[] = [
  {
    id: "order_update",
    name: "order_update",
    category: "UTILITY",
    language: "en",
    status: "APPROVED",
    body: "Hi {{1}}, your order {{2}} is confirmed. Expected delivery: {{3}}. Reply if you need to change anything.",
    variables: ["Maya", "QT-2025-0045", "22 Nov"],
  },
  {
    id: "quote_follow_up",
    name: "quote_follow_up",
    category: "UTILITY",
    language: "en",
    status: "APPROVED",
    body: "Hello {{1}}, just following up on quotation {{2}} for {{3}}. Would you like us to hold the pricing?",
    variables: ["Maya", "QT-2025-0045", "$248,500"],
  },
  {
    id: "delivery_window",
    name: "delivery_window",
    category: "UTILITY",
    language: "en",
    status: "APPROVED",
    body: "Hi {{1}}, your delivery for {{2}} is scheduled for {{3}}. Thanks for staying with us.",
    variables: ["Maya", "50 units", "Monday"],
  },
  {
    id: "promo_q4",
    name: "promo_q4",
    category: "MARKETING",
    language: "en",
    status: "PENDING",
    body: "Hi {{1}}, our Q4 bundle is available. Reply YES for the price list.",
    variables: ["Maya"],
  },
  {
    id: "winback",
    name: "winback",
    category: "MARKETING",
    language: "en",
    status: "PAUSED",
    body: "Hi {{1}}, we saved the pricing we discussed. Want us to hold it for another week?",
    variables: ["Maya"],
    rejectionReason: "Paused by Meta for quality review.",
  },
];

function render(body: string, values: string[]): string {
  return body.replace(
    /\{\{(\d+)\}\}/g,
    (_, index: string) => values[Number(index) - 1] ?? `{{${index}}}`,
  );
}

export function TemplatePicker(props: {
  windowClosed: boolean;
  channel: "whatsapp" | "email";
  onUse: (text: string, template: AppliedTemplate) => void;
}) {
  const query = signal("");
  const selected = signal(templates.find((item) => item.status === "APPROVED")?.id ?? "");
  const values = signal<string[]>(
    templates.find((item) => item.status === "APPROVED")?.variables ?? [],
  );
  const filtered = () =>
    templates.filter((item) => {
      const text = `${item.name} ${item.category} ${item.language}`.toLowerCase();
      return text.includes(query().trim().toLowerCase());
    });
  const template = () => templates.find((item) => item.id === selected()) ?? templates[0];
  const canUse = () => template()?.status === "APPROVED" && props.channel === "whatsapp";
  return (
    <AppDialog
      open={() => true}
      onClose={closeTemplates}
      title="Message templates"
      description="Approved WhatsApp templates for proactive outreach and closed windows."
      width={650}
      testID="template-picker"
      footer={
        <DialogActions>
          <Button variant="ghost" size="sm" onPress={closeTemplates}>
            <Text class="text-[12px] font-medium">Cancel</Text>
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!canUse()}
            onPress={() => {
              if (!template()) return;
              props.onUse(render(template().body, values()), {
                id: template().id,
                name: template().name,
                language: template().language,
                variables: [...values()],
              });
              closeTemplates();
            }}
            testID="use-template-in-composer"
          >
            <Icon name="fileText" size={11} tone="primary-foreground" />
            <Text class="text-[12px] font-semibold text-primary-foreground">Use template</Text>
          </Button>
        </DialogActions>
      }
    >
      <View class="gap-3">
        <View class="flex-row items-center gap-2 rounded-lg border border-border bg-panel px-3 py-2">
          <Icon name="search" size={12} tone="muted-foreground" />
          <NativeInput
            value={query()}
            onChange={({ value }) => query.set(value)}
            placeholder="Search by name, category, or language…"
            testID="template-search"
            style={{
              flex: 1,
              height: 26,
              fontSize: 12,
              color: token("foreground"),
              backgroundColor: "transparent",
              borderWidth: 0,
              placeholderColor: token("muted-foreground"),
            }}
          />
          <Badge variant={props.windowClosed ? "warning" : "success"}>
            <Text
              class="text-[11px] font-medium"
              style={{ color: token(props.windowClosed ? "warning" : "success") }}
            >
              {props.windowClosed ? "Window closed" : "Window open"}
            </Text>
          </Badge>
        </View>

        <View class="grid grid-cols-2 gap-3">
          <View class="gap-1.5">
            <Text class="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {filtered().length} templates
            </Text>
            <Each of={filtered()}>
              {(item: () => Template) => (
                <View
                  role="button"
                  accessibilityLabel={`Select template ${item().name}`}
                  onPress={() => {
                    selected.set(item().id);
                    values.set(item().variables.map(moneyText));
                  }}
                  class="gap-1 rounded-lg border p-2.5"
                  style={{
                    backgroundColor: selected() === item().id ? token("accent") : "transparent",
                    borderColor: selected() === item().id ? token("ring") : token("border"),
                  }}
                  hoverStyle={{ backgroundColor: token("accent") }}
                >
                  <View class="flex-row items-center gap-1.5">
                    <Text class="flex-1 text-[11px] font-semibold text-foreground">
                      {item().name}
                    </Text>
                    <Badge
                      variant={
                        item().status === "APPROVED"
                          ? "success"
                          : item().status === "PENDING"
                            ? "warning"
                            : "outline"
                      }
                    >
                      <Text
                        class="text-[11px] font-medium"
                        style={{
                          color: token(
                            item().status === "APPROVED"
                              ? "success"
                              : item().status === "PENDING"
                                ? "warning"
                                : "muted-foreground",
                          ),
                        }}
                      >
                        {item().status}
                      </Text>
                    </Badge>
                  </View>
                  <Text class="text-[11px] text-muted-foreground">
                    {item().category} · {item().language.toUpperCase()}
                  </Text>
                  <If when={item().rejectionReason}>
                    <Text class="text-[11px] text-warning">{item().rejectionReason}</Text>
                  </If>
                </View>
              )}
            </Each>
            <If when={filtered().length === 0}>
              <Text class="py-4 text-[11px] text-muted-foreground">
                No templates match that search.
              </Text>
            </If>
          </View>

          <View class="gap-2 rounded-xl border border-border bg-card shadow-md p-3">
            <SectionTitle>Preview</SectionTitle>
            <View class="gap-1 rounded-lg border border-border bg-panel p-2.5">
              <Text class="text-[11px] uppercase tracking-wider text-muted-foreground">
                WhatsApp · {template()?.language.toUpperCase()} · v3
              </Text>
              <Text class="text-[11px] leading-4 text-foreground">
                {render(template()?.body ?? "", values())}
              </Text>
            </View>
            <Text class="text-[11px] uppercase tracking-wider text-muted-foreground">
              Variables
            </Text>
            <Each of={values()}>
              {(value: () => string, index: () => number) => (
                <View class="flex-row items-center gap-2">
                  <Text class="w-4 text-[11px] font-semibold text-muted-foreground">
                    {index() + 1}
                  </Text>
                  <View class="h-6 flex-1 justify-center rounded-md border border-border bg-panel px-1.5">
                    <NativeInput
                      value={value()}
                      onChange={({ value: next }) =>
                        values.set(
                          values().map((row, rowIndex) => (rowIndex === index() ? next : row)),
                        )
                      }
                      testID={`template-variable-${index() + 1}`}
                      style={{
                        height: 22,
                        fontSize: 11,
                        color: token("foreground"),
                        backgroundColor: "transparent",
                        borderWidth: 0,
                        placeholderColor: token("muted-foreground"),
                      }}
                    />
                  </View>
                </View>
              )}
            </Each>
            <Text class="text-[11px] leading-3.5 text-muted-foreground">
              Variables validate against Meta rules before send. Positional parameters map from CRM
              fields or manual values.
            </Text>
          </View>
        </View>
        <View class="flex-row items-center gap-2 rounded-lg border border-border bg-panel px-3 py-2">
          <View class="h-1.5 w-1.5 rounded-full bg-success" />
          <Text class="text-[11px] text-muted-foreground">
            Number quality green · marketing requires opt-in · variables revalidate before egress
          </Text>
        </View>
        <ModalNotice
          title="Cloud policy owns template delivery"
          detail="The desktop previews and inserts the template; the cloud revalidates version, language, opt-in, quality, and the 24-hour policy before egress."
        />
      </View>
    </AppDialog>
  );
}
