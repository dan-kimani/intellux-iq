import { signal } from "nsh";
import type { AttachmentFile } from "./types";

/** The file open in the preview dialog, if any. */
export const previewFile = signal<AttachmentFile | null>(null);

/** The file the save sheet is offering, if any. */
export const pendingDownload = signal<AttachmentFile | null>(null);

export function openFilePreview(file: AttachmentFile): void {
  previewFile.set(file);
}

/** Closes the preview and opens the save sheet, where the download ends. */
export function requestFileDownload(file: AttachmentFile): void {
  previewFile.set(null);
  pendingDownload.set(file);
}
