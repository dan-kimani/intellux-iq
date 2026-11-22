import { expect, test } from "nsh/test";
import { channelOrder, moveChannel, orderedChannelProviders } from "./components/channelOrder";

test("moves a channel within the rail order", () => {
  const initial = [...channelOrder()];
  const gmail = initial.indexOf("gmail");
  moveChannel(gmail, 1);
  expect(channelOrder()[1]).toBe("gmail");
  expect(orderedChannelProviders()[1].id).toBe("gmail");
});
