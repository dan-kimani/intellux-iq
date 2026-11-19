import type { Tokens } from "nsh";
import { Image, token } from "nsh";
import lockupDark from "../assets/lockup-dark.png";
import lockupLight from "../assets/lockup-light.png";
import logo from "../assets/logo.png";
import {
  archive,
  arrowUpRight,
  bell,
  briefcase,
  calendarClock,
  chart,
  check,
  checkCheck,
  chevronDown,
  chevronLeft,
  chevronRight,
  close,
  command,
  copy,
  download,
  ellipsis,
  expand,
  eye,
  fileText,
  folder,
  forward,
  funnel,
  gauge,
  image,
  inbox,
  info,
  mail,
  messageCircle,
  mic,
  moon,
  more,
  packageIcon,
  panelRight,
  paperclip,
  pencil,
  phone,
  pin,
  presentation,
  plus,
  printer,
  reply,
  search,
  send,
  settings,
  star,
  shieldCheck,
  sliders,
  sparkles,
  sun,
  table,
  trash,
  users,
  video,
  workflow,
  zap,
} from "./icons";

export const icons = {
  archive,
  arrowUpRight,
  bell,
  briefcase,
  calendarClock,
  chart,
  check,
  checkCheck,
  chevronDown,
  chevronLeft,
  chevronRight,
  close,
  command,
  copy,
  download,
  ellipsis,
  expand,
  eye,
  fileText,
  folder,
  forward,
  funnel,
  gauge,
  image,
  inbox,
  info,
  mail,
  messageCircle,
  mic,
  moon,
  more,
  package: packageIcon,
  paperclip,
  pencil,
  panelRight,
  phone,
  pin,
  presentation,
  plus,
  printer,
  reply,
  search,
  send,
  settings,
  star,
  shieldCheck,
  sliders,
  sparkles,
  sun,
  table,
  trash,
  users,
  video,
  workflow,
  zap,
} as const;

export type IconName = keyof typeof icons;

export function Icon(props: {
  name: IconName;
  size?: number;
  tone?: keyof Tokens;
  style?: object;
}) {
  return (
    <Image
      src={icons[props.name]}
      fadeDuration={0}
      style={{
        width: props.size ?? 18,
        height: props.size ?? 18,
        tintColor: token(props.tone ?? "muted-foreground") as string,
        ...props.style,
      }}
    />
  );
}

/** The app-icon mark: the brand on its cream tile, for compact placements. */
export function Logo(props: { size?: number }) {
  const size = props.size ?? 36;
  return <Image src={logo} style={{ width: size, height: size }} fadeDuration={0} />;
}

/** The mark and wordmark, transparent, for the window's header. */
export function Lockup(props: { height?: number; scheme: "light" | "dark" }) {
  const height = props.height ?? 24;
  const width = Math.round(height * (1702 / 275));
  return (
    <Image
      src={props.scheme === "dark" ? lockupDark : lockupLight}
      accessibilityLabel="IntelluxIQ"
      style={{ width, height }}
      fadeDuration={0}
    />
  );
}
