export interface VoiceProvider {
  startCall(input: { to: string; from: string }): Promise<{ providerCallId: string }>;
}
