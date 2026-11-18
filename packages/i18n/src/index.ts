import en from "../messages/en.json";
import es from "../messages/es.json";

export const messages = { en, es } as const;
export type Locale = keyof typeof messages;
export const DEFAULT_LOCALE: Locale = "en";
export const SUPPORTED_LOCALES: Locale[] = ["en", "es"];
