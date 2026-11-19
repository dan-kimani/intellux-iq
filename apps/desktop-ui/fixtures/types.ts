import type { ImageAsset } from "nsh";
import type { Stage } from "../domain/stages";

export type { Stage };

export type Channel = "whatsapp" | "email";
export type AvatarTone = "violet" | "blue" | "green" | "amber" | "rose" | "slate";
export type Presence = "online" | "idle" | "in_call" | "offline";
export type DeliveryStatus = "queued" | "sending" | "sent" | "delivered" | "read" | "failed";
export type AssignmentSource = "round_robin" | "vip" | "keyword" | "manual" | "unassigned";

export interface ReplyPreview {
  from: string;
  text: string;
}

interface MessageBase {
  id?: string;
  time: string;
  status?: DeliveryStatus;
  replyTo?: ReplyPreview;
}

export type Message =
  | (MessageBase & { kind: "text"; from: "them" | "me"; text: string; read?: boolean })
  | (MessageBase & {
      kind: "file";
      from: "them" | "me";
      fileName: string;
      size: string;
      read?: boolean;
    })
  | (MessageBase & {
      kind: "image";
      from: "them" | "me";
      image: ImageAsset;
      fileName?: string;
      size?: string;
      caption?: string;
    })
  | (MessageBase & {
      kind: "audio";
      from: "them" | "me";
      duration: string;
      read?: boolean;
    })
  | (MessageBase & { kind: "system"; text: string })
  | (MessageBase & { kind: "whisper"; from: "me"; text: string });

export interface RelatedDeal {
  id: string;
  stage: string;
  amount: string;
  tone: "violet" | "blue" | "green";
}

/** Fixture-only input. The Inbox consumes the normalized Conversation below. */
export interface ConversationSeed {
  id: string;
  name: string;
  company: string;
  photo?: ImageAsset;
  initials: string;
  tone: AvatarTone;
  channel: Channel;
  preview: string;
  time: string;
  unread: number;
  online: boolean;
  verified: boolean;
  vip: boolean;
  phone: string;
  email: string;
  location: string;
  opportunityId: string;
  opportunityStage: Stage;
  opportunityValue: string;
  responseTime: string;
  engagement: number;
  interest: "High interest" | "Warm" | "New";
  nextFollowUp: string;
  messages: Message[];
  relatedDeals: RelatedDeal[];
}

export interface OpportunityLink {
  id: string;
  name: string;
  stage: Stage;
  value: string;
  probability: number;
  owner: string;
}

export interface ConversationAssignment {
  userId: string;
  name: string;
  at: string;
  by: string;
  source: AssignmentSource;
}

export interface ConversationMetrics {
  firstResponseMinutes: number;
  responseGapCount: number;
  unansweredInboundCount: number;
  lastInboundAt: string;
  lastOutboundAt: string;
  followUpsCompleted: number;
  followUpsDue: number;
  followUpOverdue: boolean;
  ageDays: number;
  lastActivityDays: number;
  quoteAgeDays: number | null;
  lastMessageFrom: "them" | "me";
}

export interface Conversation {
  id: string;
  contactId: string | null;
  name: string;
  company: string;
  photo?: ImageAsset;
  initials: string;
  tone: AvatarTone;
  channel: Channel;
  channelAccount: string;
  subject?: string;
  preview: string;
  time: string;
  unread: number;
  verified: boolean;
  vip: boolean;
  engagement: number;
  interest: "High interest" | "Warm" | "New";
  presence: Presence;
  typing: boolean;
  phone: string;
  email: string;
  location: string;
  opportunities: OpportunityLink[];
  assignment: ConversationAssignment | null;
  tags: string[];
  slaMinutes: number;
  windowMinutes: number | null;
  metrics: ConversationMetrics;
  messages: Message[];
}
