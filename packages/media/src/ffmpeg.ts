export type MediaProfile =
  | "original"
  | "thumb_webp"
  | "wa_image"
  | "wa_video"
  | "wa_audio"
  | "email_image"
  | "quote_pdf";

export async function transcode(_inputPath: string, _profile: MediaProfile): Promise<void> {
  // TODO: Bun.spawn FFmpeg with the profile limits from spec §3.
  throw new Error("media transcode scaffold");
}
