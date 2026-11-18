import { signal } from "nsh";
import { contacts, type ContactRow } from "./data";

export const contactRows = signal<ContactRow[]>(contacts);
export const contactDetail = signal<ContactRow | null>(null);
export const newContactOpen = signal(false);
export const importContactsOpen = signal(false);
