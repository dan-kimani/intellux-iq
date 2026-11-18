import type { Tokens } from "nsh";
import { Image, token } from "nsh";
import logo from "../assets/logo.svg";
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
  download,
  ellipsis,
  expand,
  eye,
  fileText,
  folder,
  funnel,
  gauge,
  image,
  inbox,
  mail,
  messageCircle,
  mic,
  moon,
  more,
  packageIcon,
  panelRight,
  paperclip,
  phone,
  presentation,
  plus,
  printer,
  search,
  send,
  settings,
  shieldCheck,
  sliders,
  sparkles,
  sun,
  table,
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
  download,
  ellipsis,
  expand,
  eye,
  fileText,
  folder,
  funnel,
  gauge,
  image,
  inbox,
  mail,
  messageCircle,
  mic,
  moon,
  more,
  package: packageIcon,
  paperclip,
  panelRight,
  phone,
  presentation,
  plus,
  printer,
  search,
  send,
  settings,
  shieldCheck,
  sliders,
  sparkles,
  sun,
  table,
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

export function Logo(props: { size?: number }) {
  const size = props.size ?? 36;
  return <Image src={logo} style={{ width: size, height: size }} fadeDuration={0} />;
}
