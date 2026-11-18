import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { __unstable__loadDesignSystem } from "tailwindcss";

const twDir = resolve("node_modules/tailwindcss");
const loadStylesheet = async (id, base) => {
  const path = id === "tailwindcss" ? resolve(twDir, "index.css") : resolve(base, id);
  return { path, base: dirname(path), content: await readFile(path, "utf8") };
};
const ds = await __unstable__loadDesignSystem('@import "tailwindcss";', {
  base: process.cwd(),
  loadStylesheet,
});
const classes = [
  "mt-[16px]",
  "p-[16px]",
  "gap-[16px]",
  "rounded-[4px]",
  "w-[4rem]",
  "max-w-[100px]",
  "z-[1]",
  "leading-[24px]",
  "text-[16px]",
  "bg-[#fff]",
  "size-[16px]",
  "h-[16px]",
  "flex-shrink-0",
  "flex-grow",
  "overflow-ellipsis",
  "decoration-slice",
  "ring-[3px]",
  "ring-[2px]",
  "outline-[2px]",
  "border-[1px]",
  "border-[0px]",
  "m-[0px]",
  "mt-[0.25rem]",
  "mt-[1px]",
  "w-[100%]",
  "h-full w-full",
  "min-w-[96px]",
  "max-w-[calc(100%-2rem)]",
  "[&_svg]:size-4",
  "**:[[cmdk-group-heading]]:text-muted-foreground",
  "data-[state=open]:bg-accent",
  "data-open:bg-accent",
  "group-data-[side=left]:-right-4",
];
for (const c of classes)
  console.log(JSON.stringify(c), "=>", JSON.stringify(ds.canonicalizeCandidates(c.split(" "))));
