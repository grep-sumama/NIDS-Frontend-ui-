# Sentinel SOC: frontend code and UI explanation

**Project:** Security Operations Center portal for an AI-driven Network Intrusion Detection System  
**Delivery:** UI-only semester prototype, 22 October 2026  
**Visual direction:** Neumorphism, with soft green accents, light graphite surfaces, and a dark-theme toggle.

## 1. What this implementation does

The frontend implements the proposal's 18 interfaces and preserves its three modules of six interfaces each. It is a static single-page application built with HTML, CSS and JavaScript. Reusable rendering functions provide a component-like structure without a framework or build step. The proposal's React/Tailwind stack is not used in this UI-only delivery; this is an explicit implementation choice, not an assertion that those frameworks were implemented.

Navigation, filtering, form validation, temporary user/IP CRUD, alert status changes, CSV generation and theme switching are browser-side interactions. Telemetry, confidence scores, model metrics, health values and IP reputation profiles are prepared examples. No API, database, WebSocket, AI model, authentication system, sensor, firewall or messaging provider is connected.

Changes exist only in JavaScript memory and reset on reload. The optional Google Fonts stylesheet is the only external presentation dependency. System sans-serif fonts remain available if it fails.

## 2. Run and demonstrate

Extract the source package and open `dist/index.html`. No installation is needed. Alternatively, from the extracted project folder run:

```sh
python -m http.server 8000 --directory dist
```

Then open `http://localhost:8000`. This is a static file server, not a project backend. Node.js is needed only to run `node tests/smoke.cjs`.

Suggested five-minute presentation:

1. Start on Dashboard; explain the raised cards, recessed controls and sample data label.
2. Change 24 hours to 7 days; show the chart updating from another prepared series.
3. Open Alerts, filter by severity, and inspect ALT-2048.
4. Mark the alert investigating; return to Dashboard and Activity logs to show shared session state.
5. Open User management; add, edit and delete a demo user. Try an invalid or duplicate email.
6. Add an IP policy; explain that this does not change a real firewall.
7. Open Reports; filter dates, download CSV, and open Print / Save PDF.
8. Switch to Analyst through the profile/Login screen; show a restricted configuration screen.
9. Toggle the theme, narrow the browser window, and reload to demonstrate the session reset.

## 3. File responsibilities

| File | Responsibility | Start reading here |
| --- | --- | --- |
| `dist/index.html` | HTML document and shared containers | `#app`, `#toast`, `#modal`, script order |
| `dist/styles.css` | Design system and page layout | `:root`, `.panel`, `.app-shell`, media queries |
| `dist/data.js` | Fixture records and route metadata | `SOC.routes`, `SOC.alerts`, `SOC.traffic` |
| `dist/app.js` | Rendering, state and interactions | `state`, `pages`, `render()`, document event listeners |
| `tests/smoke.cjs` | Logic and render smoke checks | VM context, route loop, form assertions |

`data.js` is loaded before `app.js` because the latter reads `SOC` immediately. Classic scripts keep the project usable through a local file URL as well as a static server.

## 4. Screen-to-code and team mapping

The names below follow the proposal's module assignments. The proposal repeats SP25-BSE-103 for two team members; that identifier has not been silently corrected or reproduced as a verified identity.

| Module / member | Screen | Hash route | Main rendering function | UI behavior |
| --- | --- | --- | --- | --- |
| A / Shahroz | Login | `#login` | `loginPage()` | Choose Admin/Analyst; no password or real authentication |
| A / Shahroz | Dashboard | `#dashboard` | `dashboard()` | Metrics, chart periods, distribution, recent alert links |
| A / Shahroz | Alerts | `#alerts` | `alertsPage()` | Search, severity/type/status filters, CSV export |
| A / Shahroz | Threat details | `#threat-details/ALT-2048` | `detailPage()` | Flow fields, summary dialog, status update, demo IP block |
| A / Shahroz | Network map | `#network-map` | `networkPage()` | SVG topology; source nodes link to sample alerts |
| A / Shahroz | System health | `#system-health` | `healthPage()` | Four service cards; refresh provides demo feedback |
| B / Asad | User management | `#users` | `usersPage()` | Add/edit/delete sample users through dialogs |
| B / Asad | Network settings | `#network-settings` | `settingsPage()` | Validate and save sensor/interface/CIDR preferences |
| B / Asad | AI settings | `#ai-settings` | `settingsPage()` | Model profile, mode and threshold slider |
| B / Asad | IP manager | `#ip-manager` | `ipPage()` | Add/remove policies and switch allow/block labels |
| B / Asad | Reports | `#reports` | `reportsPage()` | Date/severity/type filters, CSV and browser print |
| B / Asad | Log archive | `#log-archive` | `archivePage()` | Search sample logs, view associated alert, export CSV |
| C / Sumama | Traffic history | `#traffic-history` | `trafficPage()` | Three chart windows, calculated totals, CSV |
| C / Sumama | Attack types | `#attack-types` | `attackPage()` | Donut, horizontal bars, category guide, CSV |
| C / Sumama | Threat intelligence | `#threat-intelligence` | `intelPage()` | Local IP fixture lookup, match/no-match states |
| C / Sumama | Alert settings | `#alert-settings` | `settingsPage()` | Save channel preferences and preview a notification |
| C / Sumama | Activity logs | `#activity-logs` | `activityPage()` | Search and export initial plus session-generated activity |
| C / Sumama | Help & metrics | `#help` | `helpPage()` | Expandable guide, module coverage, illustrative metrics |

## 5. Application architecture

The runtime flow is: URL hash -> `render()` -> selected page function -> shared shell -> HTML inserted into `#app`. A user event then changes `state` or opens a dialog, and the relevant view is rendered again.

### Routing

`SOC.routes` defines each screen's identifier, title, icon, navigation group and project module. `render()` reads `location.hash`, resolves optional alert IDs, and chooses a function from the `pages` map. An unknown route falls back to Dashboard. The `hashchange` listener closes dialogs, renders the next page, scrolls to the top and focuses the main region. Hash-based navigation uses the browser's `hashchange` event [3].

Login is a standalone composition. Every other page is passed into `shell()`, which supplies the sidebar, topbar, profile and footer. The profile links to Login so users can switch roles.

### State and data

`state` owns the selected role, chart period, editable users/IPs/alerts, activity records, saved settings and filter selections. Initial records are copied from `SOC`; modifying an alert does not edit the fixture source file. `state.selected` stores the active alert. `state.settings` stores configurations by route name.

The dashboard combines distinct sample datasets. Its active-threat count is derived from the eight detailed alerts. The attack-distribution chart is a separate historical fixture of 100 alerts. The headline packet count and confidence average are authored display values; they are not calculated from the traffic chart. Traffic history totals are calculated from the selected chart series. These distinctions avoid treating prototype metrics as measurements.

### Shared UI functions

- `icon(name)`: returns an inline SVG icon from the local path registry; decorative SVGs are hidden from assistive technology.
- `pageHead()`, `panelHead()`, `stat()`: consistent headings, panel titles and metric cards.
- `field()`, `select()`, `toggle()`: labeled form markup and reusable controls.
- `badge()`: text plus visual state, so severity is not conveyed by color alone.
- `alertTable()`: reusable incident table for Dashboard, Alerts and Reports.
- `lineChart()`, `donut()`: local chart markup with prepared data.
- `openModal()`: native dialog for editing, deletion confirmation, search and previews.
- `toast()`: short status message in a polite live region.

### Events

One delegated click listener handles buttons identified by `data-action`, chart periods and record IDs. It continues to work after page HTML is replaced. Separate input/change listeners update searches, filters and the threshold output. The submit listener handles the login, user, policy, settings and intelligence forms.

The distinction matters: rendering describes the view; event handlers perform the state change. For example, `setAlertStatus()` updates one alert, appends an activity record, rerenders and displays feedback.

## 6. Neumorphic design system

The light theme uses a shared surface (`#e8edf2`) so cards appear sculpted from the page. A dark offset shadow creates depth while a pale opposite shadow suggests light. Recessed controls use `inset` shadows. CSS `box-shadow` supports multiple shadows and the inset keyword [2].

```css
:root {
  --bg: #e8edf2;
  --text: #253347;
  --accent: #236a57;
  --shadow: 8px 8px 20px #cbd3dc,
            -8px -8px 20px #ffffff;
  --inset: inset 3px 3px 7px #cbd3dc,
           inset -3px -3px 7px #ffffff;
}
```

`.panel` uses the raised shadow; inputs, selected navigation and segmented control tracks use the inset shadow. Buttons have smaller shadows to distinguish their size and emphasis. Thin borders supplement shadows. Severity badges use textual Critical/High/Medium/Low labels with red, amber and blue treatments. Manrope is used for headings and DM Sans for interface text, with system fallbacks.

`body.dark` replaces theme variables and several surface-specific colors. The theme is a session preference and is not persisted. SVG paths, icons and charts are coded locally; no image assets are required.

## 7. Responsive and accessibility choices

The desktop shell has a fixed-width sidebar and flexible content area. Four metric columns become two below 980px. The traffic and distribution layout stacks, and settings/forms collapse to one column on narrow screens. At 700px, the sidebar moves off-screen and a menu button toggles it. Tables scroll horizontally inside their own wrappers rather than forcing the entire viewport wider.

Implemented affordances include semantic navigation/main/header regions, associated wrapping form labels, a skip link, focus-visible outlines, button names for icon-only controls, `aria-current` on navigation, `aria-pressed` on chart period controls, status announcements, reduced-motion handling and textual chart descriptions. Dialogs use the native `<dialog>` element and `showModal()` [4]. These are implementation choices, not a claim of audited WCAG conformance.

CSS print rules remove navigation and interactive controls, reduce ornamental shadows and preserve report tables. Browser Save as PDF is an option in the user's print dialog, not a server-generated report endpoint.

## 8. Validation and output handling

User forms require a name and an email-shaped value, and reject duplicate sample email addresses case-insensitively. IPv4 validation checks four numeric octets from 0 to 255 and rejects leading-zero forms. Sensor settings additionally check the CIDR prefix range 0–32. Report dates cannot be empty or reversed. Policy reason fields reject whitespace-only input. Native required, number range and email validation complement these JavaScript checks.

`esc()` encodes values before they enter generated HTML. The CSV helper quotes cells, doubles quotation marks and prefixes leading `=`, `+`, `@` or `-` so those common spreadsheet formula prefixes are not exported directly. CSV downloads use a Blob and a temporary object URL, which is revoked after the link is activated. These measures support this demo; they do not constitute a complete production security review.

Exported reports use current filter results. Traffic CSV records interval indices and the selected window, while distribution CSV uses the 100-alert historical fixture. Activity times created during the demo use the browser's local clock; fixture records retain their illustrative dates and times.

## 9. Demo role behavior

`adminRoutes` restricts the presentation of User management, Network settings, AI settings, IP manager and Alert settings when Analyst is selected. Analyst can still inspect alerts, change their sample investigation status, explore analytics and export reports. The block-IP button is shown only for Admin.

This is a UI guard only. Browser code and in-memory state can be inspected or changed by the visitor. There is no secure login, server-side authorization or JWT implementation. Never describe this prototype as a functioning security monitor.

## 10. Verification record and remaining checks

Completed: `node --check` for both JavaScript files, followed by `node tests/smoke.cjs`. The smoke harness uses Node's VM and lightweight DOM stubs. It checks all 18 route renderers, six routes per module, Analyst route guard, severity/search/date filtering, invalid IPv4 rejection, HTML escaping, alert status updates, user duplicate rejection, policy creation, settings save, lookup state and chart period generation.

The browser preview service timed out. Therefore real browser visual layout, focus behavior, downloads, native form validation and print output remain unverified. No browser screenshot is presented as evidence. The VM checks establish logic/render coverage, not end-to-end browser correctness.

Manual acceptance checklist:

- Check Dashboard at 1440px, 1024px and 390px viewport widths, in both themes.
- Open every route and verify text, charts and controls remain readable.
- Use Tab, Shift+Tab and Escape with dialogs; verify focus returns sensibly.
- Use mobile menu, native selects and sliders on a touch device.
- Test add/edit/delete users and policies, including empty and invalid fields.
- Check empty search results and valid/invalid report date ranges.
- Download filtered CSVs and inspect their content in a text editor or spreadsheet.
- Open Reports print preview and save a PDF; verify pagination and long rows.
- Reload and verify every temporary edit resets as documented.

## 11. Safe customization points

Change colors and shadows in `:root` and `body.dark`. Add or revise fixture alerts in `SOC.alerts`. Update chart series in `SOC.traffic`, keeping normal/malicious arrays the same length. Keep the 100-alert distribution data and donut segment stops synchronized if changing `SOC.attackMix`.

To add a new screen, add metadata to `SOC.routes`, create its rendering function, and register it in `pages`. To change role visibility, update `adminRoutes`. To change behavior, modify the related action or submit handler, then update the smoke checks and documentation.

For any future backend phase, define API contracts and real authentication separately, replace fixtures with validated server responses, and add error/loading/reconnect states. Such work is outside this delivery.

## 12. References

[1] User-supplied *SOC_NIDS_Web_Project_Proposal.pdf*, pp. 1–2. Project requirements source; not a published technical standard.

[2] MDN Web Docs, “box-shadow.” https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/box-shadow (accessed 22 October 2026).

[3] MDN Web Docs, “Window: hashchange event.” https://developer.mozilla.org/en-US/docs/Web/API/Window/hashchange_event (accessed 22 October 2026).

[4] MDN Web Docs, “The Dialog element.” https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog (accessed 22 October 2026).
