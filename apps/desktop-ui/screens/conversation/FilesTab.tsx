import { View } from "nsh";
import type { Conversation } from "../../data";
import { AttachmentList } from "../../files/AttachmentRow";
import { ConversationEmpty } from "./ConversationEmpty";
import { attachmentsFor } from "./threadViews";

export function FilesTab(props: { conversation: Conversation }) {
  const files = attachmentsFor(props.conversation);
  return (
    <View class="p-5">
      <If
        when={files.length > 0}
        else={
          <ConversationEmpty
            icon="folder"
            title="No files shared yet"
            detail="Photos, documents, and voice notes from this conversation appear here."
          />
        }
      >
        <AttachmentList files={files} />
      </If>
    </View>
  );
}
