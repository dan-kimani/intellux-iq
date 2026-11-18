# Desktop UI prototype (Native Shell + TSX)

Status: **prototype / decision pending**. This app is not the production desktop
shell yet. It exists to answer one question: can the desktop use TSX UI
compositions and shadcn-like design tokens without giving up the Rust core?

The reference is [`.mocks/desktop-ui-mock.png`](../../.mocks/desktop-ui-mock.png).
The implementation keeps its three-pane information architecture, then applies a
shadcn-native treatment: warm light surfaces, graphite dark surfaces, neutral
primary, compact geometry, tokenized colors, and app-owned primitives instead of
a visual skin.

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
those generated files locally; only `.nsh/out` is disposable build output.

## Prototype scope

- Three-pane inbox: navigation, org-wide conversation list, thread, and
  contact/intelligence inspector. Conversation and contact records are separate;
  contacts resolve by `contact_id`, and conversations link zero, one, or several
  opportunities.
- Conversation records carry assignment, SLA, WhatsApp window, tags, presence,
  and deterministic metrics. The owner is visible and reassignable by a manager;
  unassigned or other-owner threads show the correct read-only/manager-override
  state.
- Channel and owner scope filters, message-body search, unread/sort controls,
  empty states, theme toggle, and details tabs are interactive.
- A channel rail sits between navigation and the conversation list: All
  channels, WhatsApp, Gmail, Outlook, Yahoo, and a `+` connect action. Connected
  channels carry unread-message counters; Outlook and Yahoo are visibly
  disconnected until they are connected in the cloud. WhatsApp is the first and
  default connected channel. The `+` opens cloud onboarding with provider
  status, OAuth/IMAP notes, and no provider credentials on the desktop.
- WhatsApp policy is explicit: the 24-hour countdown is visible, free-form
  replies close outside the window, and only approved templates can re-engage.
  The template picker supports search, editable variables, statuses, rejection
  reasons, and window-aware selection.
- The WhatsApp composer follows the WhatsApp Web pattern: smiley and paperclip
  controls sit inside an expandable message field, with a compact `Aa`
  formatting menu, template action, send button, and removable attachment chip.
  It supports bold, italic, strikethrough, monospace, inline code, bulleted and
  numbered lists, block quotes, and a full emoji picker at the caret.
  Formatting is sent as WhatsApp markup, so rendering stays native to the
  provider; the transcript renders the same syntax locally.
- Message status is visible (queued/sending/sent/delivered/read/failed); quoted
  replies, internal notes, audio, attachments, and per-conversation drafts are
  rendered in the timeline.
- Gmail opens a real email workspace: Inbox/Sent/Drafts/Archive/Junk folders,
  account switcher, unread/status indicators, and a reader with sender,
  recipients, body, quoted text, and attachments. The Inbox folder now contains
  email messages rather than chat threads.
- Attachments are typed end to end: PDF, image, Word, Excel, PowerPoint, text,
  archive, audio, and video each get a distinct icon and extension badge. Images
  show their thumbnail; PDFs show a page count. Images and PDFs open in one
  shared viewer: images fit to the dialog, PDFs render a sanitized page with
  previous/next page controls. The same viewer opens WhatsApp images and PDFs.
  Other file types go straight to the Save attachment sheet, which offers the
  Downloads, Documents, and Desktop destinations. That sheet is a prototype
  affordance; the desktop shell owns the actual write and no provider
  credentials cross the boundary.
- Compose, reply, reply-all, forward, and new-email views share one familiar
  rich-text editor: bold, italic, underline, strikethrough, bulleted and
  numbered lists, block quotes, and links. Reply and reply-all open inline below
  the thread, like an email client; forwarding and new mail take the full
  workspace. Drafts keep rich HTML alongside plain text for preview; sent mail
  renders sanitized HTML in the reader. The cloud still owns MIME and SMTP.
- The inspector derives deterministic signals from conversation evidence with
  owner/severity/age, one-click reply, reassign, follow-up, advance, and
  dismiss-with-reason actions. No AI calls are involved.
- The linked **opportunity** owns stage and value; the conversation carries only
  messaging and channel identity. Chat opportunities are actionable: switch
  between them, create a quote, change stage, reassign owner, edit value and
  probability, set primary, link/unlink matching opportunities, open the linked
  quote, create a follow-up, or open the deal in Pipeline. Stage, owner, and
  value writes sync to the Pipeline record where they share an ID.
- Workspace screens for Contacts, Deals, Quotes, Catalog, Analytics,
  Automations, and Settings. Analytics follows the analytics mock: five KPI
  cards with sparklines, a multi-series sales trend, lead-source donut, funnel
  overview, team conversion table, activity, top products, and insights.
- Analytics charts are native NSH `Plot`s. KPI sparklines, trend lines, the
  lead-source donut, pipeline stages, conversion bars, and product bars use a
  six-color series palette (blue, violet, green, amber, rose, cyan) with
  consistent series meanings across both themes; grids, axes, and labels stay
  neutral. The KPI sparklines show a crosshair and point value on hover; the
  sales trend has a pointer and keyboard crosshair, active dots, a per-row
  tooltip, and a clickable series legend; the lead-source donut lifts and dims
  slices on hover, shows a per-source tooltip, and its legend selects a source
  and updates the center detail. Period tabs rebuild the rows and replay the
  native appear animation.
- Each section has its own fake-load skeleton (never a full-screen block),
  reveals with a short stagger, and the route fades in.
- The native title bar is removed (`frame: none`); the app draws a single
  DBX-style window chrome with app mark, quick-create actions, global search,
  utility icons, and minimize / maximize / close controls wired to the native
  window. The chrome is draggable. The sidebar begins below it.
- Navigation starts with first-level Inbox and Follow-ups, then the Customers,
  Sales, Intelligence, and Business sections. Sections collapse; modules
  (Contacts, Segments, Pipeline, Quotes & Proposals, Analytics, Catalogue,
  Automations, Audit & Activity Logs) are the only sidebar leaves. Commands not
  yet backed by a real screen are deliberately absent rather than dead links.
- Collapsed, the first-level items are icons of their own; each section icon
  opens a hover flyout with its modules, counts, and active state.
- Third-level views are horizontal tabs under the module header: quote
  status, pipeline scope, catalogue stock, and settings sections. They use the
  native tab list (arrow/Home/End navigation, spring indicator), not another
  sidebar level.
- The command palette (`mod+k`) follows Raycast's desktop search:
  a floating near-top window over a blurred backdrop, one large search field,
  grouped Suggestions / Go to / entity results, an inverted icon tile on the
  selected row, live shortcut hints, and a keyboard-hint footer. Up/Down,
  Home/End and Return drive it without leaving the input; Escape or a backdrop
  press closes it. The panel height follows the result count.
- Secondary actions use anchored dropdown menus instead of opening modals.
  The window-chrome More menu, notifications, conversation ellipsis, inbox
  filter, deal filter, and quote-template picker all use anchored surfaces.
  `ActionMenu` covers action lists; `Popover` covers live panels. Creation
  forms, confirmations, audit flows, and large detail surfaces remain dialogs.
- Global shortcuts are configurable in Settings → Shortcuts. `nsh/keymap`
  binds them and renders platform labels (`⌘B` or `Ctrl+B`); the recorder
  suspends every binding while it captures a chord, rejects duplicates and
  system-reserved chords, and persists overrides on the device with `nsh`
  Storage.
- **Recovery** is a first-class deterministic workspace: evidence-backed
  signals, severity filters, owners, value at risk, recommended actions,
  resolution outcomes, and a recovery playbook.
- Message policy surfaces include approved WhatsApp templates with variable
  preview, a 24-hour-window notice, and cloud-owned validation.
- Offline work is visible: connection state, queued outbox, retry, and a
  banner that keeps reads/drafts local. Conversation assignment is enforced:
  unassigned conversations are read-only until assigned.
- Email has a folder model — Inbox, Sent, Drafts, Archive, Junk — a cloud-mail
  account health surface, message preview, and a reply composer with scheduling.
- Quotes open directly into a persistent master-detail workspace: a 20% quote
  rail on the left and the selected quote document on the right. There is no
  separate full-table view. New quote and Templates live in the rail header,
  and the PDF preview replaces only the 80% detail pane.
- The quote document is a single coherent paper surface with a real typographic
  hierarchy: customer, opportunity, metadata, status, line items, totals,
  terms, and signature. The card grid was removed.
- Acceptance is a deliberate audited action: the rep records a customer PO /
  acceptance reference and explicitly confirms the customer acceptance. The
  actor, reference, timestamp, and optional note are retained.
- The interface keeps shadcn's neutral token system but warms the light theme:
  a warm-gray canvas, warm white cards with large radii and soft shadows,
  near-black type, and an amber unread accent. Dark mode lifts the canvas from
  near-black to graphite instead of pure black, reducing contrast fatigue while
  preserving the dark interface. Navigation stays neutral; analytics uses a
  dedicated six-color series palette. Success, warning, and alert states retain
  semantic green, amber, and red.
- Quotes support approval thresholds, manager approval, locked accepted totals,
  and a PDF viewer with a Classic template, page/zoom controls,
  Send/Print/Download actions, branded A4 document, tax identity, line-item
  table, tax summary, amount in words, terms, and signature block.
- Contacts and opportunities accept internal notes and follow-up tasks with a
  shared activity timeline.
- Contact records open as dedicated pages: identity, contact details, current
  opportunity, quotation history with status actions, products sent, photos
  and documents, and activity. Segments is a dedicated page with saved
  audiences, rules, and a live member preview.
- Catalog search filters by SKU/name, product media is previewable, and cached
  product media can be dispatched into a conversation.
- Onboarding, security policy, auto-lock, offline lease, failed-attempt wipe,
  device posture, and minimum-window behavior are visible surfaces.
- Every primary action opens a real desktop surface: contact, opportunity,
  quote, and product records; quote builder with editable lines, discounts,
  VAT, and an approval threshold; contact/catalog import; segment rules; pipeline
  filters; device linking; access and threshold editing;
  inbox filters, conversation overflow menu, assignment/tags/reminders,
  attachment preflight, template and email composers; analytics team/activity/
  insight detail and report export; command
  palette, notifications, account menu, and lock screen.
- Light and dark themes are driven by shadcn CSS variables; route fades respect
  reduced-motion.

Everything is static demo data. There is no API, auth, SQLCipher, sync, media,
or provider call in this prototype. Sending a message only appends a local
"queued through cloud egress" bubble.

## Native Shell 0.6.0

The prototype targets NSH 0.6.0. It does not declare `capabilities`, so the
0.6 capability gate does not require `application` / `homeDir`; if a
declaration is added later, both must be listed.

Adopted from 0.6.0:

- Row context menus on conversation rows, deal cards, and quote-rail rows use
  the native `ContextMenu`. The secondary button, the Menu key, and Shift+F10
  open the same actions for pointer, keyboard, and screen-reader users; each
  item carries an `accessibilityDescription`.
- Settings and automation switches use `nsh/base`'s `Switch`, so the control
  owns the switch role, checked value, and Space/Return activation instead of a
  styled `View` with a button role.
- Anchored menus and filter panels use the 0.6 overlay placement rules and
  entrance/exit transitions, so they stay inside the window near the edges and
  no longer snap open and closed.
- The sidebar collapse uses a physical `spring(...)` timing function instead of
  a fixed ease.
- The headless test host no longer takes window focus, so the suite can run
  alongside the native app.
- `Each` row updates and the virtualized list improvements are inherited (the
  inbox, deal board, and quote rail update without re-creating every row).

Not adopted yet, with reasons:

- `SplitView`: the quote workspace is a fixed master-detail pane, not a stack of
  navigation columns; the 20/80 rail is intentional.
- Launch at login and quit interception: both need the packaged app and an
  onboarding/auth decision; `nsh run` cannot register login items.
- Mobile controls, sheets/detents, Handoff, updater channels, and optional
  native features: desktop-only prototype.
- A capabilities declaration: no embedded-app sandbox is in use, and declaring
  one now would only add `application` / `homeDir` grants without a benefit.

Breaking changes checked: no `capabilities` declaration, no `maxLength` inputs,
no WebView downloads, no iOS clipboard, no Rust `ContextMenu` listeners, no
`DataTable` modifier selection, and the dev server is reached by its printed
`127.0.0.1` address.

## Structure

```text
App.tsx                 app shell, routing, toast, theme default
theme.json              shadcn cssVars (light/dark) + brand/data tokens
data.ts                 deterministic demo conversations and opportunities
state.ts                signals: selection, filters, search, toast
components/ui.tsx       app-owned primitives: Avatar, Badge, Button, Icon, ...
components/overlay.tsx  shared dialog shell, form labels, notices
components/forms.tsx    text fields, selectors, choice cards
components/CommandPalette.tsx  cross-entity search and navigation
components/GlobalDialogs.tsx   account menu and onboarding host
components/InboxDialogs.tsx    inbox filters, new message, actions, assignment
components/LockScreen.tsx      offline unlock surface
components/motion.tsx   route fade and delayed component readiness
components/skeletons.tsx per-section skeleton primitives
components/icon.tsx     bundled Lucide SVGs and the Icon primitive
components/SyncDialog.tsx connection, cursor, and outbox state
screens/Recovery.tsx    deterministic intervention queue
screens/conversation/TemplatePicker.tsx approved message templates
screens/quotes/QuoteBuilderDialog.tsx editable quote builder
screens/quotes/QuoteDetailPage.tsx     quote document workspace
screens/quotes/QuoteRecord.tsx         coherent quote paper surface
screens/quotes/QuoteRecordItems.tsx    readable line items and totals
screens/quotes/QuoteAcceptanceDialog.tsx audited acceptance workflow
screens/quotes/QuotePdfPage.tsx        PDF pane
screens/quotes/QuoteMiniList.tsx       20% quote navigation rail
screens/quotes/QuoteContextMenu.tsx    quote rail row actions
screens/quotes/QuoteDocument.tsx       A4 branded quotation document
screens/deals/DealContextMenu.tsx      opportunity row actions
components/ActivityDialog.tsx          shared note/task composer
components/OnboardingDialog.tsx        product tour
screens/settings/SecurityPanel.tsx     policy and local-data state
screens/settings/ShortcutsPanel.tsx    shortcut recorder and reset UI
screens/settings/shortcuts.ts          shortcut registry, capture, persistence
components/Sidebar.tsx
components/nav-config.ts  section/module model and navigation state
components/SidebarNav.tsx  expanded sections and collapsed flyout host
components/SidebarGroup.tsx  collapsible section with modules
components/SidebarFlyout.tsx  collapsed hover menus
components/SectionTabs.tsx  horizontal module tabs
components/ActionMenu.tsx    anchored overflow action menus
components/ContextActions.tsx  native context menu for rows and cards
components/ConversationContextMenu.tsx  conversation row actions
components/Toggle.tsx  app-styled native switch
components/InboxFilterMenu.tsx  anchored inbox filter panel
components/NotificationsMenu.tsx anchored notification feed
components/WindowChrome.tsx
components/ShortcutHost.tsx  configurable global keymap bindings
components/InboxList.tsx
screens/PageShell.tsx   shared screen header, scroll, and route transition
screens/Contacts.tsx
screens/Deals.tsx
screens/Quotes.tsx
screens/Catalog.tsx
screens/Analytics.tsx
screens/Automations.tsx
screens/Settings.tsx
screens/ConversationPane.tsx
screens/DetailsPane.tsx
```

## Why this UI layer exists

NSH is not React and has no DOM. It provides native primitives and
`nsh/base` behavior, but no shadcn component package. The shadcn contribution
here is the _system_: semantic CSS variables, one radius scale, one spacing
scale, explicit interaction states, and a small set of reusable components.

`components/ui.tsx` is the app's styled layer. Screens compose it. There is no
custom design-system package and no copied shadcn React component.

## Keyboard shortcuts

Defaults, all configurable in Settings → Shortcuts (`mod` is Command on Apple
platforms and Control elsewhere):

| Action         | Default     |
| -------------- | ----------- |
| Toggle sidebar | `mod+b`     |
| Command search | `mod+k`     |
| New message    | `mod+n`     |
| New quote      | `mod+alt+q` |
| Open settings  | `mod+alt+s` |

Bindings live in [shortcuts.ts](screens/settings/shortcuts.ts) and are attached
by [ShortcutHost.tsx](components/ShortcutHost.tsx) through `nsh/keymap`. The
Settings recorder captures hardware key events directly, with all global
bindings suspended so a recording never triggers the action it is recording.
Conflicts and platform-reserved chords are rejected; Backspace resets the row,
Escape cancels, and overrides persist through `nsh` Storage. Menu and header
hints read `keymap.label`, so they show the chord the current platform uses.

## Verification

```sh
bun run desktop:ui:check
bun run desktop:ui:test
bun run desktop:ui:build
```

The 76 headless tests cover conversation selection, channel rail filtering and
unread counters, channel connection onboarding, WhatsApp formatting and emoji,
WhatsApp image and PDF previews, typed email attachments, the PDF page viewer,
the save sheet, inline email replies, rich email composition, search,
details tabs, the composer send path, navigation across every workspace screen
(including Recovery), an automation toggle, sidebar collapse/expand, contact
creation, opportunity detail/filtering, quote creation, product detail, run log
and device linking, command search, notifications, inbox scope/search/message-
body filtering, attachments, desktop lock/unlock, report export, recovery
resolution, offline/outbox state, window-aware templates, reassignment and
manager override, tags and internal notes, derived signals with dismissal and
reminders, failed delivery/presence states, mail folders, mail search and
account switching, new conversation creation, linked-opportunity actions, email replies/reply-all/compose,
auto-saved drafts, persistent quote
split navigation, the quote document, audited acceptance, quote approval and PDF
preview, contact/deal activity logging, catalog search and media dispatch,
collapsible navigation
sections, collapsed hover flyouts, horizontal pipeline/quote/catalogue/settings
tabs, context-menu row actions for conversations, deals, and quotes, configurable keyboard shortcuts (default, conflict, recording, and
reset), the Raycast-style command palette (grouped results, keyboard selection,
and Return to open), interactive analytics charts (hover tooltips, series
toggles, period changes, and source selection), the product tour, security
policy, and the minimum supported window.
The native Linux and browser targets both render from the same TSX.

## Screenshots

| Dark inbox                                               | Light inbox                                                |
| -------------------------------------------------------- | ---------------------------------------------------------- |
| ![Desktop dark](../../docs/screenshots/desktop-dark.png) | ![Desktop light](../../docs/screenshots/desktop-light.png) |

| Light analytics                                                                | Light contacts                                                               |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| ![Desktop light analytics](../../docs/screenshots/desktop-light-analytics.png) | ![Desktop light contacts](../../docs/screenshots/desktop-light-contacts.png) |

| Intelligence tab                                                         | Empty search                                                      |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| ![Desktop intelligence](../../docs/screenshots/desktop-intelligence.png) | ![Desktop empty search](../../docs/screenshots/desktop-empty.png) |

| Contacts                                                         | Deals                                                      |
| ---------------------------------------------------------------- | ---------------------------------------------------------- |
| ![Desktop contacts](../../docs/screenshots/desktop-contacts.png) | ![Desktop deals](../../docs/screenshots/desktop-deals.png) |

| Quotes (split workspace)                                     | Catalog                                                        |
| ------------------------------------------------------------ | -------------------------------------------------------------- |
| ![Desktop quotes](../../docs/screenshots/desktop-quotes.png) | ![Desktop catalog](../../docs/screenshots/desktop-catalog.png) |

| Analytics                                                          | Automations                                                            |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| ![Desktop analytics](../../docs/screenshots/desktop-analytics.png) | ![Desktop automations](../../docs/screenshots/desktop-automations.png) |

| Analytics hover tooltip                                                        | Lead source selected                                                        |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| ![Desktop analytics hover](../../docs/screenshots/desktop-analytics-hover.png) | ![Desktop lead source](../../docs/screenshots/desktop-analytics-source.png) |

| Channel rail                                                             | Connect a channel                                                              |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| ![Desktop channel rail](../../docs/screenshots/desktop-channel-rail.png) | ![Desktop connect channel](../../docs/screenshots/desktop-channel-connect.png) |

| Inbox (spec pass)                                               | Collapsed flyout                                                                   |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| ![Desktop inbox](../../docs/screenshots/desktop-inbox-spec.png) | ![Desktop navigation flyout](../../docs/screenshots/desktop-navigation-flyout.png) |

| Inbox signals                                                              | WhatsApp window closed                                                                 |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| ![Desktop inbox signals](../../docs/screenshots/desktop-inbox-signals.png) | ![Desktop inbox window closed](../../docs/screenshots/desktop-inbox-window-closed.png) |

| Email inbox                                                   | Email reader                                                  |
| ------------------------------------------------------------- | ------------------------------------------------------------- |
| ![Email inbox](../../docs/screenshots/desktop-mail-inbox.png) | ![Email reader](../../docs/screenshots/desktop-mail-view.png) |

| PDF attachment viewer                                                        | Save attachment sheet                                            |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| ![PDF attachment viewer](../../docs/screenshots/desktop-mail-pdf-viewer.png) | ![Save attachment](../../docs/screenshots/desktop-mail-save.png) |

| Email image viewer                                                          | WhatsApp image viewer                                                              |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| ![Email image viewer](../../docs/screenshots/desktop-mail-image-viewer.png) | ![WhatsApp image viewer](../../docs/screenshots/desktop-whatsapp-image-viewer.png) |

| Conversation assignment                                                    |
| -------------------------------------------------------------------------- |
| ![Desktop assignment](../../docs/screenshots/desktop-inbox-assignment.png) |

| WhatsApp formatting                                                            | WhatsApp emoji picker                                                       |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| ![WhatsApp formatting](../../docs/screenshots/desktop-whatsapp-formatting.png) | ![WhatsApp emoji picker](../../docs/screenshots/desktop-whatsapp-emoji.png) |

| WhatsApp composer                                                        | WhatsApp attachment                                                            |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| ![WhatsApp composer](../../docs/screenshots/desktop-whatsapp-editor.png) | ![WhatsApp attachment](../../docs/screenshots/desktop-whatsapp-attachment.png) |

| Formatted WhatsApp transcript                                                |
| ---------------------------------------------------------------------------- |
| ![Formatted WhatsApp](../../docs/screenshots/desktop-whatsapp-formatted.png) |

| Rich email composer                                                     | Rich email detail                                                         |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| ![Rich email composer](../../docs/screenshots/desktop-mail-wysiwyg.png) | ![Rich email detail](../../docs/screenshots/desktop-mail-rich-detail.png) |

| Actionable linked opportunity                                                      |
| ---------------------------------------------------------------------------------- |
| ![Desktop opportunity strip](../../docs/screenshots/desktop-opportunity-strip.png) |

| Sales pipeline tabs                                                        | Quote status tabs                                                    |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| ![Desktop pipeline tabs](../../docs/screenshots/desktop-pipeline-tabs.png) | ![Desktop quote tabs](../../docs/screenshots/desktop-quote-tabs.png) |

| Catalogue tabs                                                             | Settings tabs                                                              |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| ![Desktop catalogue tabs](../../docs/screenshots/desktop-catalog-tabs.png) | ![Desktop settings tabs](../../docs/screenshots/desktop-settings-tabs.png) |

| Contact record                                                           | Segments                                                                   |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| ![Desktop contact page](../../docs/screenshots/desktop-contact-page.png) | ![Desktop segments page](../../docs/screenshots/desktop-segments-page.png) |

| Opportunity detail                                                            |
| ----------------------------------------------------------------------------- |
| ![Desktop opportunity detail](../../docs/screenshots/desktop-deal-dialog.png) |

| Quote builder                                                              | Product detail                                                               |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| ![Desktop quote builder](../../docs/screenshots/desktop-quote-builder.png) | ![Desktop product detail](../../docs/screenshots/desktop-product-dialog.png) |

| Command palette                                                                | Device linking                                                            |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| ![Desktop command palette](../../docs/screenshots/desktop-command-palette.png) | ![Desktop device linking](../../docs/screenshots/desktop-device-link.png) |

| Recovery                                                         | Recovery evidence                                                                |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| ![Desktop recovery](../../docs/screenshots/desktop-recovery.png) | ![Desktop recovery evidence](../../docs/screenshots/desktop-recovery-dialog.png) |

| Message templates                                                                | Sync & outbox                                                              |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| ![Desktop message templates](../../docs/screenshots/desktop-template-picker.png) | ![Desktop sync and outbox](../../docs/screenshots/desktop-sync-outbox.png) |

| Email folder                                                          | Email reply                                                           |
| --------------------------------------------------------------------- | --------------------------------------------------------------------- |
| ![Desktop email folder](../../docs/screenshots/desktop-mail-sent.png) | ![Desktop email reply](../../docs/screenshots/desktop-mail-reply.png) |

| Quote split view                                                            | Quote PDF in split pane                                                                |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| ![Desktop quote split view](../../docs/screenshots/desktop-quote-split.png) | ![Desktop quote PDF in split pane](../../docs/screenshots/desktop-quote-split-pdf.png) |

| Shortcut settings                                                          | Quote row actions                                                                   |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| ![Desktop shortcut settings](../../docs/screenshots/desktop-shortcuts.png) | ![Desktop quote row actions](../../docs/screenshots/desktop-quote-context-menu.png) |

| Window More menu                                                   | Conversation actions menu                                                          |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| ![Desktop More menu](../../docs/screenshots/desktop-more-menu.png) | ![Desktop conversation menu](../../docs/screenshots/desktop-conversation-menu.png) |

| Product tour                                                           | Security policy                                                                |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| ![Desktop product tour](../../docs/screenshots/desktop-onboarding.png) | ![Desktop security policy](../../docs/screenshots/desktop-security-policy.png) |

| Activity composer                                                                  | Catalog dispatch                                                                 |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| ![Desktop activity composer](../../docs/screenshots/desktop-activity-composer.png) | ![Desktop catalog dispatch](../../docs/screenshots/desktop-catalog-dispatch.png) |

| Notifications                                                              | Lock screen                                                            |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| ![Desktop notifications](../../docs/screenshots/desktop-notifications.png) | ![Desktop lock screen](../../docs/screenshots/desktop-lock-screen.png) |

The sidebar has two levels only: collapsible sections and their modules.
Third-level views live in the horizontal tabs. Collapsed section icons open
their module flyouts on hover, and the bottom bar stays pinned.

![Desktop collapsed sidebar](../../docs/screenshots/desktop-sidebar-collapsed.png)

Minimum supported prototype window (1180×760): the inspector collapses so the
thread keeps its reading width.

![Desktop narrow](../../docs/screenshots/desktop-narrow.png)

## Prototype assets

- Icons: [Lucide](https://lucide.dev), ISC license.
- Portraits: randomuser.me placeholders; replace before any public build.
- Product photo: Unsplash photo `1505740420928-5e560c06d30e`; prototype only.
- Brand mark: local SVG in `assets/logo.svg`.

## Open questions before promotion

See [ADR 0006](../../docs/adr/0006-nsh-tsx-desktop-ui.md). The main ones are
QuickJS performance on very large lists, packaging/update ownership, the Rust
native-module boundary for SQLCipher/keychain/Typst/sync, and whether NSH's
native backends meet the same accessibility gate as the gpui shell.
