# Desktop UI prototype (Native Shell + TSX)

Status: **prototype / decision pending**. This app is not the production desktop
shell yet. It exists to answer one question: can the desktop use TSX UI
compositions and shadcn-like design tokens without giving up the Rust core?

The reference is [`.mocks/desktop-ui-mock.png`](../../.mocks/desktop-ui-mock.png).
The implementation keeps its three-pane information architecture, then applies a
shadcn-native treatment: warm light surfaces, graphite dark surfaces, neutral
primary, compact geometry, tokenized colors, and app-owned primitives instead of
a visual skin.

## Screenshots

![Desktop inbox in dark theme](../../docs/screenshots/desktop-dark.png)

| Analytics (light)                                                                       | Quotes (dark)                                                              |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| ![Desktop analytics in light theme](../../docs/screenshots/desktop-light-analytics.png) | ![Desktop quote workspace](../../docs/screenshots/desktop-quote-split.png) |

## Run it

Install [Native Shell](https://nsh.dev) 0.6.0 once:

```sh
curl -fsSL https://nsh.dev/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
```

Then, from the repository root:

```sh
bun run desktop:ui        # native Linux/macOS/Windows window
bun run desktop:ui:web    # browser preview of the same TSX
bun run desktop:ui:check  # nsh type check
bun run desktop:ui:test   # headless NSH interaction tests
bun run desktop:ui:build  # bundle into apps/desktop-ui/.nsh/out
```

`bun scripts/desktop-ui.ts` resolves `NSH_BIN`, then `nsh` on `PATH`, then a
local `.tools/nsh` development install. There is no npm dependency on NSH.

After a clone, or after removing `apps/desktop-ui/.nsh`, run
`bun run desktop:ui:check` once. It generates `.nsh/tsconfig.json` and
`.nsh/types`; the editor needs them for JSX and `nsh` module resolution. Keep
those generated files locally; `.nsh/out` and `.nsh/dist` are disposable build
output.

## Package it

Package for the machine you are on:

```sh
bun run desktop:ui:package
```

On Linux that produces a Debian package; macOS and Windows produce their
native packages. Named targets are also available:

```sh
bun run desktop:ui:package:deb        # Linux .deb
bun run desktop:ui:package:linux      # same as package:deb
bun run desktop:ui:package:linux:tar  # raw Linux folder and .tar.gz
bun run desktop:ui:package:windows
bun run desktop:ui:package:macos
bun run desktop:ui:package:web
```

Artifacts land in `apps/desktop-ui/.nsh/dist/<target>`. The Linux `.deb`
installs the app under `/opt/intelluxiq`, adds `/usr/bin/intelluxiq`, and
installs the desktop entry and icon. Its shared-library dependencies are
computed at build time with `dpkg-shlibdeps` when available (`dpkg-dev`), with
a fallback to the owning packages; override the maintainer with
`DEB_MAINTAINER="Name <email>"`.

Run each desktop target on its own OS: NSH packages with that platform's
runtime, so Linux packaging runs on Linux, Windows on Windows, and macOS on
macOS. These are development packages: macOS is ad hoc signed, Windows is
unsigned, and none are notarized for public distribution.
