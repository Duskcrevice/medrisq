# MedRisq AI — Implementation Plan

## Scope

Build a polished, responsive healthcare operations console and public entry experience for **MedRisq AI — One Connected Network. Safer Medicines. Smarter Emergency Response.** The implementation prioritizes three complete demo workflows: medicine verification with evidence-based risk indicators, resource discovery with freshness awareness, and emergency resource exchange from request through receipt. All records are synthetic demo data and explicitly labelled.

## Implementation approach

- Keep the initialized React + TypeScript + Vite frontend, Express server, tRPC router, and Drizzle MySQL schema.
- Extend the schema with organizations, resources, medicine registry records, verification checks, emergency requests, offers/transfers, alerts, and audit events; include a migration for the new tables.
- Add server-side tRPC procedures for dashboard data, resource search, medicine verification, request creation, deterministic supplier matching, transfer state transitions, alert acknowledgement, and demo reset. Use backend validation and role checks for sensitive mutations.
- Seed a fictional district network with hospitals, pharmacies, medicine examples, inventory freshness, active alerts, and transfers in multiple stages. If the managed database is unavailable during local preview, keep the UI functional with a deterministic in-memory demo store and surface the demo-mode notice.
- Build the UI as a single operations shell with route-aware pages: overview, resources, medicine verification, emergency exchange, inventory, alerts, and audit trail. Provide a controlled role switch for demo personas and make the central workflow demonstrable without external credentials.
- Keep mapping and AI integrations simulated/optional: show list view by default and distinguish authoritative registry checks from AI observations.
- Add `public/manus-routes.json`, application metadata, and a concise README covering setup, environment variables, demo mode, integrations, known limitations, and actual validation results.

## Design system

### Design Movement

Editorial clinical operations: a calm, information-dense healthcare control room influenced by modern Swiss editorial systems and hospital wayfinding rather than generic SaaS dashboards.

### Core Principles

1. **Signal over decoration** — prioritise status, freshness, evidence, and next action.
2. **Human-readable trust** — every risk or match includes the reason and data source.
3. **Operational calm** — use a pale canvas, firm navy type, and a restrained teal signature color.
4. **Progressive disclosure** — surface the decision first, with evidence and audit trail one level deeper.

### Color Philosophy

Warm off-white and cool mist backgrounds reduce visual fatigue; deep ink/navy establishes clinical seriousness; teal marks trusted, actionable, or synchronized states; amber and coral are reserved for attention and risk. No gradients or decorative glow effects.

### Layout Paradigm

A persistent left rail anchors the product identity and active workflow. The main area uses an asymmetric editorial layout: a wide decision surface beside a narrower evidence rail, then full-width tables/timelines where operational detail benefits from breathing room.

### Signature Elements

- A small teal “signal dot” system for freshness and sync status.
- Evidence strips that pair a decision label with source, timestamp, and reason.
- An audit timeline with a strong vertical rule and compact event markers.

### Interaction Philosophy

Actions should read like safe operational handoffs: clear verb labels, explicit confirmation states, disabled invalid transitions, and concise toasts. Destructive or irreversible operations require a clear second step. Role switching is explicit and always visible.

### Animation

Use short 160–220ms opacity/translate transitions for panels, tab changes, and status updates. Avoid loops except for a subtle sync pulse while a mutation is in flight. Respect reduced-motion preferences.

### Typography System

Use a clean sans-serif stack for the application body and a slightly condensed system stack for numerals and metadata. Oversized editorial section titles are reserved for the landing page; operations pages use compact 12–30px hierarchy with tabular numerals.

### Brand Essence

A trustworthy district-level healthcare coordination layer for people who need to verify, find, and move essential resources before time runs out. **Calm, exacting, connective.**

### Brand Voice

Headlines are direct and human; CTAs name the next safe action; microcopy states limitations plainly.

- “Find the next available resource, with freshness in view.”
- “A registry match is evidence — not a guarantee.”

### Wordmark & Logo

A custom wordmark treatment pairs “MedRisq” in strong ink with a compact teal crosshair/signal mark: a four-corner bracket around a central dot, representing verification and coordination. In-app, the mark appears as a 28px rounded square with a teal center signal and two offset ink brackets.

### Signature Brand Color

**Signal teal — #0C8B83** — ownable, clinical, and legible against the warm paper background.

## Project structure

- `client/src/App.tsx`: route shell and page composition.
- `client/src/pages/Home.tsx`: public-facing overview / landing entry.
- `client/src/pages/Operations.tsx`: authenticated-style demo operations console and workflow pages.
- `client/src/index.css`: design tokens, responsive layout, tables, state indicators, and shell styles.
- `server/routers.ts`: typed API surface and state transitions.
- `server/db.ts`: database access plus demo-store fallback helpers.
- `drizzle/schema.ts` and `drizzle/migrations/`: durable entities and migration.
- `public/manus-routes.json`: route manifest for the managed preview.
- `README.md`: setup, demo credentials/personas, environment variables, validation, and limitations.

## Material constraints and limitations

No real healthcare API, map provider, or AI key is required for the demo. Availability is synthetic and not live; every resource and medicine result must show that limitation. Registry matching and transfer state transitions remain deterministic. AI-assisted observations are represented as optional explanatory text only and never certify authenticity or approve a transfer.

## Upgrade: connected innovation lab

The existing operations shell is extended with a route-aware Innovation Lab rather than replacing the current workflows. Five tabbed modules share one synthetic regional network: a five-hospital digital twin with 6/12/24-hour shortage forecasts, a 15-record medicine trust passport index, capability-based emergency referral matching, an inter-hospital medicine rescue table with storage and verification gates, and a disaster swarm simulator with severity-driven projections. New server procedures own simulation, referral, and rescue state transitions; the existing resource, verification, exchange, alert, and audit procedures remain intact. All map, forecast, registry, and hospital feeds are explicitly demo adapters.


## Landing launch direction

The public homepage is now a cinematic media-launch surface rather than a dashboard preview. Its design movement is **editorial systems cinema**: oversized compressed headlines, deep navy negative space, teal signal light, orbital network geometry, and scroll-staged chapters. The layout uses a split hero, floating CSS-only network visualization, a horizontal signal band, sticky chapter cards, and an evidence-to-approval proof panel. Motion is restrained and purposeful: CSS keyframes handle the orbit float and core pulse, CSS view timelines reveal sections when supported, and reduced-motion users receive a static equivalent. The brand essence remains “the operating layer between a healthcare warning and a safe handoff,” with a voice that is direct, evidence-led, and calm under pressure.


## Reference-inspired refinement

The landing hero borrows the reference’s composition principles rather than its copy or asset: a quiet nav, edge-to-edge human healthcare scene, dark green readability overlay, oversized editorial headline, pale proof band, and compact CTA set. MedRisq-specific signal tags sit on top of the original image to connect the emotional human scene to hospital capacity, medicine verification, and evidence-ranked handoffs. The source image is an original generated campaign asset and remains clearly separate from the synthetic-data disclaimer.



## Security-first hospital platform upgrade

The next implementation phase converts the controlled demo into a real role-separated hospital platform while preserving the existing MedRisq AI innovation console. The backend uses the existing Manus session identity plus managed MySQL records for portal membership, staff applications, patient profiles, appointments, service requests, notifications, and audit events. Public enrollment may create a patient profile or a pending staff application, but it never grants staff/admin privileges. Staff access is determined server-side from an approved, non-suspended staff application; admin actions require the existing server-side admin role and cannot be created through public registration. Patient procedures scope every query by the authenticated user; staff procedures scope by approved organization membership and permission set. Client portals are separate from the demo console and direct protected URL/API requests are rejected by protected procedures.

The implementation adds a portal workspace with separate patient, approved-staff, pending-staff, and restricted admin views, server-validated appointment and service-request workflows, approval/rejection/suspension transitions, logout and clear unauthorized states, and append-only security audit events. The current synthetic MedRisq AI console remains available for the hackathon demonstration but its persona picker is not treated as an authorization boundary; the new portals and their APIs are the secure path for account-scoped workflows. All patient data remains synthetic and the UI states that production privacy/compliance review is still required.
