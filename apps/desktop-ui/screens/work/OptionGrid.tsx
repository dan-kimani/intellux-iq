import { Text, token, View } from "nsh";

export function OptionGrid<T extends string>(props: {
  label?: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  testPrefix: string;
}) {
  return (
    <View class="gap-1.5">
      <If when={props.label}>
        <Text class="text-[11px] uppercase tracking-wider text-muted-foreground">
          {props.label}
        </Text>
      </If>
      <View class="flex-row flex-wrap gap-1">
        <Each of={props.options}>
          {(option: () => { label: string; value: T }) => (
            <View
              role="button"
              accessibilityLabel={option().label}
              testID={`${props.testPrefix}-${option().value}`}
              onPress={() => props.onChange(option().value)}
              class="h-7 items-center justify-center rounded-md border px-2.5"
              style={{
                backgroundColor: props.value === option().value ? token("primary") : token("panel"),
                borderColor: props.value === option().value ? token("primary") : token("border"),
              }}
              hoverStyle={{ borderColor: token("ring") }}
            >
              <Text
                class="text-[11px] font-medium"
                style={{
                  color:
                    props.value === option().value
                      ? token("primary-foreground")
                      : token("foreground"),
                }}
              >
                {option().label}
              </Text>
            </View>
          )}
        </Each>
      </View>
    </View>
  );
}
