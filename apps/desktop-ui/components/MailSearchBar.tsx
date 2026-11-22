import { token, View } from "nsh";
import { Input as NativeInput } from "nsh/base";
import { Icon } from "./ui";
import { MailFilterMenu } from "./MailFilterMenu";
import { MailSortMenu } from "./MailSortMenu";
import { mailSearch } from "../screens/inbox/mailState";

export function MailSearchBar() {
  return (
    <View class="flex-row items-center gap-0.5">
      <View class="h-7 min-w-0 flex-1 flex-row items-center gap-1.5 rounded-md border border-border bg-card px-2">
        <Icon name="search" size={11} tone="muted-foreground" />
        <NativeInput
          value={mailSearch()}
          onChange={({ value }) => mailSearch.set(value)}
          placeholder="Search mail"
          testID="mail-search"
          style={{
            flex: 1,
            height: 24,
            paddingLeft: 0,
            paddingRight: 0,
            fontSize: 12,
            color: token("foreground"),
            placeholderColor: token("muted-foreground"),
            backgroundColor: "transparent",
            borderWidth: 0,
          }}
        />
        <If when={mailSearch().length > 0}>
          <View
            role="button"
            accessibilityLabel="Clear mail search"
            testID="mail-search-clear"
            onPress={() => mailSearch.set("")}
            class="h-4 w-4 items-center justify-center rounded"
            hoverStyle={{ backgroundColor: token("accent") }}
          >
            <Icon name="close" size={9} tone="muted-foreground" />
          </View>
        </If>
      </View>
      <MailFilterMenu />
      <MailSortMenu />
    </View>
  );
}
