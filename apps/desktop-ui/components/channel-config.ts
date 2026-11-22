import type { ImageAsset } from "nsh";
import gmailLogo from "../assets/channels/gmail.svg";
import instagramLogo from "../assets/channels/instagram.svg";
import messengerLogo from "../assets/channels/messenger.svg";
import outlookLogo from "../assets/channels/outlook.svg";
import tiktokLogo from "../assets/channels/tiktok.svg";
import whatsappLogo from "../assets/channels/whatsapp.svg";
import yahooLogo from "../assets/channels/yahoo.svg";
import type { Channel } from "../data";

export interface ChannelProvider {
  id: "whatsapp" | "messenger" | "instagram" | "tiktok" | "gmail" | "outlook" | "yahoo";
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
    account: "+1 212 555 0200",
    icon: whatsappLogo,
    channel: "whatsapp",
    connected: true,
    isDefault: true,
    detail: "WhatsApp Business · Cloud API",
  },
  {
    id: "messenger",
    label: "Facebook Messenger",
    account: "Not connected",
    icon: messengerLogo,
    connected: false,
    detail: "Facebook Messenger · Meta",
  },
  {
    id: "instagram",
    label: "Instagram",
    account: "Not connected",
    icon: instagramLogo,
    connected: false,
    detail: "Instagram · Meta",
  },
  {
    id: "tiktok",
    label: "TikTok",
    account: "Not connected",
    icon: tiktokLogo,
    connected: false,
    detail: "TikTok · Business Messaging",
  },
  {
    id: "gmail",
    label: "Gmail",
    account: "sales@acmetrading.com",
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
