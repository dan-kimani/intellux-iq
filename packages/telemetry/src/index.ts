export type LogFields = Record<string, unknown>;

export function log(event: string, fields: LogFields = {}): void {
  console.log(JSON.stringify({ event, ...fields, at: new Date().toISOString() }));
}
