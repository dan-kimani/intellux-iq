import type { ImageAsset } from "nsh";

/** The file types the reader and the conversation list know how to present. */
export type FileKind =
  | "pdf"
  | "image"
  | "document"
  | "spreadsheet"
  | "presentation"
  | "archive"
  | "text"
  | "audio"
  | "video"
  | "other";

/** What the PDF viewer draws on its page. */
export interface PdfPreview {
  title: string;
  subtitle: string;
  lines: string[];
  pages: number;
}

/** One attachment, shared by mail threads and conversation messages. */
export interface AttachmentFile {
  id: string;
  name: string;
  size: string;
  kind: FileKind;
  src?: ImageAsset;
  pdf?: PdfPreview;
}

const kindByExtension: Record<string, FileKind> = {
  pdf: "pdf",
  jpg: "image",
  jpeg: "image",
  png: "image",
  gif: "image",
  webp: "image",
  avif: "image",
  heic: "image",
  svg: "image",
  doc: "document",
  docx: "document",
  odt: "document",
  rtf: "document",
  pages: "document",
  xls: "spreadsheet",
  xlsx: "spreadsheet",
  csv: "spreadsheet",
  ods: "spreadsheet",
  numbers: "spreadsheet",
  ppt: "presentation",
  pptx: "presentation",
  odp: "presentation",
  key: "presentation",
  zip: "archive",
  rar: "archive",
  "7z": "archive",
  tar: "archive",
  gz: "archive",
  tgz: "archive",
  txt: "text",
  md: "text",
  json: "text",
  log: "text",
  yml: "text",
  yaml: "text",
  xml: "text",
  html: "text",
  css: "text",
  mp3: "audio",
  wav: "audio",
  m4a: "audio",
  ogg: "audio",
  flac: "audio",
  aac: "audio",
  mp4: "video",
  mov: "video",
  webm: "video",
  avi: "video",
  mkv: "video",
};

export const fileKindLabel: Record<FileKind, string> = {
  pdf: "PDF document",
  image: "Image",
  document: "Word document",
  spreadsheet: "Spreadsheet",
  presentation: "Presentation",
  archive: "Archive",
  text: "Text file",
  audio: "Audio",
  video: "Video",
  other: "File",
};

export function fileExtension(name: string): string {
  const match = /\.([a-z0-9]+)$/i.exec(name);
  return match ? match[1].toUpperCase() : "FILE";
}

export function kindForFile(name: string): FileKind {
  return kindByExtension[fileExtension(name).toLowerCase()] ?? "other";
}

function fileId(name: string): string {
  return name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function defaultPdfPreview(name: string): PdfPreview {
  return {
    title: name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "),
    subtitle: "Shared from the IntelluxIQ workspace",
    lines: [
      "Please find the attached document shared with this conversation.",
      "The file is verified in the cloud before it reaches this device.",
      "Reply to this message if you need another format or an updated copy.",
    ],
    pages: 1,
  };
}

/** A file with its type read from its name, and a PDF preview when it is one. */
export function attachmentFile(name: string, size: string): AttachmentFile {
  const kind = kindForFile(name);
  return {
    id: fileId(name),
    name,
    size,
    kind,
    ...(kind === "pdf" ? { pdf: defaultPdfPreview(name) } : {}),
  };
}

export function pdfAttachment(name: string, size: string, preview: PdfPreview): AttachmentFile {
  return { id: fileId(name), name, size, kind: "pdf", pdf: preview };
}

export function imageAttachment(name: string, size: string, src: ImageAsset): AttachmentFile {
  return { id: fileId(name), name, size, kind: "image", src };
}

export function isPreviewable(file: AttachmentFile): boolean {
  return file.kind === "pdf" || (file.kind === "image" && file.src !== undefined);
}

export function fileDescription(file: AttachmentFile): string {
  const pages = file.pdf && file.pdf.pages > 1 ? ` · ${file.pdf.pages} pages` : "";
  return `${file.size} · ${fileKindLabel[file.kind]}${pages}`;
}
