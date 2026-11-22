const minute = 60_000;

const pad = (value: number) => String(value).padStart(2, "0");

export function localInput(ms: number): string {
  const date = new Date(ms);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function fromLocalInput(value: string): number {
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : Date.now() + 4 * 60 * minute;
}

export function dateLabel(ms: number): string {
  return new Date(ms).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function dueLabel(ms: number, now = Date.now()): string {
  const delta = ms - now;
  if (delta < 0) {
    const late = Math.abs(delta);
    if (late < 60 * minute) return `Overdue · ${Math.max(1, Math.round(late / minute))}m`;
    if (late < 24 * 60 * minute) {
      const hours = Math.floor(late / (60 * minute));
      const minutes = Math.round((late % (60 * minute)) / minute);
      return `Overdue · ${hours}h${minutes ? ` ${minutes}m` : ""}`;
    }
    return `Overdue · ${Math.round(late / (24 * 60 * minute))}d`;
  }
  const time = new Date(ms).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const dueDay = new Date(ms);
  dueDay.setHours(0, 0, 0, 0);
  const days = Math.round((dueDay.getTime() - start.getTime()) / (24 * 60 * minute));
  if (days === 0) return `Today · ${time}`;
  if (days === 1) return `Tomorrow · ${time}`;
  return dateLabel(ms);
}

export function dueMinutes(ms: number): number {
  return Math.round((ms - Date.now()) / minute);
}

export function nextMorning(): number {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(9, 0, 0, 0);
  return date.getTime();
}

export function inHours(hours: number): number {
  return Date.now() + hours * 60 * minute;
}

export function presetTime(label: string): number {
  if (label === "In 1 hour") return inHours(1);
  if (label === "In 3 days") return inHours(72);
  return nextMorning();
}

export function localDate(ms: number): string {
  return localInput(ms).slice(0, 10);
}

export function localTime(ms: number): string {
  return localInput(ms).slice(11, 16);
}

export function withLocalDate(ms: number, date: string): number {
  return fromLocalInput(`${date}T${localTime(ms)}`);
}

export function withLocalTime(ms: number, time: string): number {
  return fromLocalInput(`${localDate(ms)}T${time}`);
}
