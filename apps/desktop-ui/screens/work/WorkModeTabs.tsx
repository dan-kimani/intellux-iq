import { Text, token, View } from "nsh";
import { modes } from "./dialog-data";
import type { WorkMode } from "./types";

export function WorkModeTabs(props: { value: WorkMode; onChange: (mode: WorkMode) => void }) {
  return (
    <View class="flex-row gap-1.5">
      <Each of={modes}>
        {(item: () => { id: WorkMode; label: string }) => (
          <View
            role="button"
            accessibilityLabel={item().label}
            testID={`work-mode-${item().id}`}
            onPress={() => props.onChange(item().id)}
            class="h-8 flex-1 items-center justify-center rounded-md border"
            style={{
              backgroundColor: props.value === item().id ? token("primary") : token("panel"),
              borderColor: props.value === item().id ? token("primary") : token("border"),
            }}
            hoverStyle={{ borderColor: token("ring") }}
          >
            <Text
              class="text-[12px] font-medium"
              style={{
                color:
                  props.value === item().id ? token("primary-foreground") : token("foreground"),
              }}
            >
              {item().label}
            </Text>
          </View>
        )}
      </Each>
    </View>
  );
}
