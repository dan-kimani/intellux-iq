export function withAlpha(color: string, alpha: string): string {
  if (color.startsWith("#") && color.length === 9) return `${color.slice(0, 7)}${alpha}`;
  if (color.startsWith("#") && color.length === 7) return `${color}${alpha}`;
  return color;
}
