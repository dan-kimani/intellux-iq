import type { ImageAsset } from "nsh";
import gmailLogo from "../assets/channels/gmail.svg";
import outlookLogo from "../assets/channels/outlook.svg";
import whatsappLogo from "../assets/channels/whatsapp.svg";
import yahooLogo from "../assets/channels/yahoo.svg";
import type { Channel } from "../data";

export interface ChannelProvider {
  id: "whatsapp" | "gmail" | "outlook" | "yahoo";
  label: string;
  account: string;
  icon: ImageAsset;
  channel?: Channel;
  connected: boolean;
  isDefault?: boolean;
  detail: string;
}

export const channelProviders: ChannelProvider[] = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    account: "+254 700 100 200",
    icon: whatsappLogo,
    channel: "whatsapp",
    connected: true,
    isDefault: true,
    detail: "WhatsApp Business · Cloud API",
  },
  {
    id: "gmail",
    label: "Gmail",
    account: "sales@acmetrading.co.ke",
    icon: gmailLogo,
    channel: "email",
    connected: true,
    detail: "Google Workspace · OAuth",
  },
  {
    id: "outlook",
    label: "Outlook",
    account: "Not connected",
    icon: outlookLogo,
    connected: false,
    detail: "Microsoft 365 · OAuth",
  },
  {
    id: "yahoo",
    label: "Yahoo",
    account: "Not connected",
    icon: yahooLogo,
    connected: false,
    detail: "Yahoo Mail · OAuth",
  },
];
