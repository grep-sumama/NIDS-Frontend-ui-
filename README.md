# Sentinel SOC — UI-only semester project

An 18-interface NIDS/SOC frontend based on the supplied semester proposal, with a neumorphic light theme and optional dark theme.

## Open the project

1. Extract the ZIP while keeping the folder structure.
2. Open `dist/index.html` in a modern desktop browser. No build or dependency installation is needed.
3. For a local HTTP preview, run `python -m http.server 8000 --directory dist` from this project folder, then open `http://localhost:8000`.
4. The default screen is Dashboard. Select the profile at the bottom of the sidebar to open Login and switch between Admin and Analyst demo roles.

The local HTTP server only serves static files; it is not an application backend. Google Fonts is an optional presentation dependency; system fonts are used when unavailable.

## Project structure

- `dist/index.html`: page document, app mount, shared dialog, toast region.
- `dist/styles.css`: design tokens, neumorphic surfaces, responsive layouts, dark mode, print rules.
- `dist/data.js`: route registry and prepared fixture data.
- `dist/app.js`: page/component functions, in-memory state, routing and event handlers.
- `FRONTEND_EXPLANATION.md`: detailed code and UI explanation.
- `tests/smoke.cjs`: Node.js checks for rendering and application logic.

## Scope

No backend, API calls, authentication, AI inference, packet capture, WebSockets, real firewall actions, or notification delivery. All data is illustrative. Edits reset on reload. The browser can create CSV files, and Reports opens the print dialog for optional Save as PDF.

The proposal mentions React/Tailwind. This delivery uses plain HTML, CSS and JavaScript to keep the requested UI-only version directly runnable and easy to inspect. Components are reusable functions; it is not represented as a React implementation.

## Verification

Run `node tests/smoke.cjs` (Node.js required only for checks). JavaScript syntax and logic/render smoke checks passed. Browser visual, keyboard, download and print-dialog QA could not be completed because the browser preview service timed out. Do the manual walkthrough in the explanation guide before a graded demonstration.

## Sources

Requirements: supplied `SOC_NIDS_Web_Project_Proposal.pdf`, pp. 1–2.
Technical references: MDN CSS box-shadow, Window hashchange event, and HTML dialog documentation. Full links are in the explanation guide.
