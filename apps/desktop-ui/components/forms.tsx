import type { JSX } from "nsh";
import { Text, token, View } from "nsh";
import { Input as NativeInput } from "nsh/base";
import { FormLabel, FieldHint } from "./overlay";

export function TextField(props: {
  label: string;
  value: () => string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  testID?: string;
  type?: "text" | "email" | "tel" | "number";
  multiline?: boolean;
}) {
  return (
    <View class="gap-1.5">
      <FormLabel hint={props.hint}>{props.label}</FormLabel>
      <NativeInput
        value={props.value()}
        onChange={({ value }) => props.onChange(value)}
        placeholder={props.placeholder}
        testID={props.testID}
        multiline={props.multiline}
        style={{
          height: props.multiline ? 68 : 38,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: token("border"),
          backgroundColor: token("card"),
          paddingLeft: 10,
          paddingRight: 10,
          fontSize: 14,
          paddingTop: props.multiline ? 8 : 0,
          color: token("foreground"),
          placeholderColor: token("muted-foreground"),
        }}
      />
    </View>
  );
}

export function SelectField(props: {
  label: string;
  value: () => string;
  options: string[];
  onChange: (value: string) => void;
  testID?: string;
}) {
  return (
    <View class="gap-1.5">
      <FormLabel>{props.label}</FormLabel>
      <View class="flex-row flex-wrap gap-1.5">
        <Each of={props.options}>
          {(option: () => string) => (
            <View
              role="button"
              accessibilityLabel={`${props.label}: ${option()}`}
              testID={
                props.testID
                  ? `${props.testID}-${option().toLowerCase().replaceAll(" ", "-")}`
                  : undefined
              }
              onPress={() => props.onChange(option())}
              class="h-8 items-center justify-center rounded-md border px-3"
              style={{
                backgroundColor: props.value() === option() ? token("accent") : "transparent",
                borderColor: props.value() === option() ? token("ring") : token("border"),
              }}
              hoverStyle={{ backgroundColor: token("accent") }}
              focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
            >
              <Text
                class="text-[12px] font-medium"
                style={{
                  color:
                    props.value() === option()
                      ? token("accent-foreground")
                      : token("muted-foreground"),
                }}
              >
                {option()}
              </Text>
            </View>
          )}
        </Each>
      </View>
    </View>
  );
}

export function ChoiceCards(props: {
  value: () => string;
  options: { value: string; title: string; detail: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <View class="gap-1.5">
      <Each of={props.options}>
        {(option: () => (typeof props.options)[number]) => (
          <View
            role="button"
            accessibilityLabel={`${option().title}: ${option().detail}`}
            onPress={() => props.onChange(option().value)}
            class="flex-row items-start gap-2.5 rounded-lg border p-3"
            style={{
              backgroundColor: props.value() === option().value ? token("accent") : "transparent",
              borderColor: props.value() === option().value ? token("ring") : token("border"),
            }}
            hoverStyle={{ backgroundColor: token("accent") }}
            focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
          >
            <View
              class="mt-0.5 h-4 w-4 items-center justify-center rounded-full border"
              style={{
                borderColor: props.value() === option().value ? token("primary") : token("border"),
              }}
            >
              <If when={props.value() === option().value}>
                <View class="h-2 w-2 rounded-full bg-primary" />
              </If>
            </View>
            <View class="min-w-0 flex-1 gap-0.5">
              <Text class="text-[12px] font-medium text-foreground">{option().title}</Text>
              <Text class="text-[12px] leading-4 text-muted-foreground">{option().detail}</Text>
            </View>
          </View>
        )}
      </Each>
    </View>
  );
}

export function FormFooterNote(props: { children?: JSX.Element }) {
  return <FieldHint>{props.children}</FieldHint>;
}
