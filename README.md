# MedRisq AI

**One Connected Network. Safer Medicines. Smarter Emergency Response.**

MedRisq AI is a healthcare technology hackathon application for medicine risk detection, healthcare resource discovery, and emergency medical supply coordination. This upgrade adds five connected innovation modules to the existing operations console. The project is intentionally populated with synthetic district-level data and clearly marks the controlled demo mode.

## Five connected innovations

1. **AI emergency resource digital twin:** five-hospital capacity view, bed/ICU/ventilator/oxygen/staffing status, utilization bars, shortage forecasts at 6/12/24 hours, confidence, freshness, and scenario controls. Forecasts are explicitly simulated when verified training data is unavailable.
2. **Medicine trust passport:** digital passport pages for 15 synthetic medicine records, registry posture, manufacturer/batch/expiry evidence, supply-chain events, scan history, duplicate/batch anomaly flags, and a direct link to the full verifier. No QR or demo registry match is presented as definitive authenticity proof.
3. **Predictive emergency matching:** referral intake without patient identifiers, transparent capability/freshness/travel/availability weighting, candidate hospitals, simulated map posture, explicit acceptance/decline/completion flow, and warnings that reported availability is not live confirmation.
4. **Inter-hospital medicine rescue network:** surplus, batch, expiry, quantity, distance, storage requirement, verification posture, pharmacist/coordinator approval, cold-chain/restricted-stock checks, and handoff to the existing transfer board.
5. **Disaster swarm intelligence:** simulated flood, earthquake, mass-casualty, and hospital-outage scenarios with severity slider, regional map visualization, demand/oxygen/bed projections, affected facilities, timeline, and redistribution suggestions.

The five modules share the same synthetic hospital, medicine, referral, rescue, alert, and scenario state. A digital-twin signal links into rescue or referral actions; the trust passport is shown before rescue approval; and the disaster command center acts on the same participating facilities.

## Existing workflows preserved

- **Medicine verification:** manual identifier and batch entry, camera-scan affordance, deterministic registry comparison, expiry and conflicting-batch warnings, serial-history warning, evidence table, limitations, and audit event.
- **Resource discovery:** hospital and pharmacy search by district/type, freshness indicators, reported-vs-confirmed state, list view fallback, facility detail panel, data provenance, and confirmation request action.
- **Emergency exchange:** request → match → offer → approval → dispatch → receipt, with deterministic match reasons, role-aware transitions, duplicate-safe state checks, timeline, alerts, and append-only demo audit history.
- **Operations console:** overview metrics, inventory thresholds, shortage alerts, alert acknowledgement, audit trail, controlled demo personas, and reset-to-baseline function.

## Start locally

```bash
pnpm install
pnpm dev
```

The app listens on port `3000` by default. `pnpm check` runs TypeScript diagnostics, `pnpm build` creates the production frontend/server bundle, and `pnpm test` runs the automated suite.

## Environment variables

The managed starter can provide `DATABASE_URL`, Manus OAuth values, and platform service values at runtime. The current hackathon preview does not require external healthcare, mapping, or AI credentials. No secrets are embedded in the client bundle.

## Demo personas

Use the role picker in the operations console to walk through the workflows as **Hospital staff**, **Pharmacist**, **Emergency coordinator**, **Administrator**, or **Public user**. The role banner is intentionally visible so demo behavior is not mistaken for production authentication.

## Validation completed

- `pnpm check` passed after the innovation upgrade.
- `pnpm build` passed; Vite emitted only the expected platform-config module warning and a bundle-size advisory.
- `pnpm test` passed with the original 6 tests plus 3 innovation workflow tests.
- `/api/health`, `/app/innovations`, and `/manus-routes.json` returned successfully.
- Desktop and mobile innovation-lab previews were inspected.
- Direct end-to-end workflow checks passed for disaster projection recalculation, referral acceptance/completion gating, and verified rescue-stock approval.

## Known limitations

This is a hackathon-grade controlled demo. The visible workflows use deterministic in-process state so the preview works without external healthcare credentials; the initialized Drizzle/MySQL starter remains available for the next persistence step. Availability is not live, the map is a simulation adapter, the digital-twin forecasts are not trained on verified operational data, and registry matching is not definitive proof of authenticity. Production deployment would also need real authentication, organization membership enforcement, durable migrations/seed versioning, operational monitoring, verified manufacturer/regulator integrations, and a provider-specific security/privacy review.


## Cinematic media-launch landing

The public landing route now uses a dark, high-contrast launch narrative with a CSS-driven floating network core, responsive signal cards, sticky scroll chapters, and a human-approval proof flow. Scroll choreography uses CSS `animation-timeline: view()` where supported, with content remaining visible as the fallback and a `prefers-reduced-motion` path that disables reveals and floating motion. No scroll event listeners, external images, or runtime animation libraries were added.


## Reference-inspired landing adaptation

The public hero now follows the supplied reference’s visual structure without copying its content: restrained navigation, full-bleed human healthcare imagery, deep forest-green overlay, oversized left-aligned message, a pale signal band, and strong single-purpose CTAs. The image is an original MedRisq AI campaign asset; its human scene is used to express coordination and trust, while the floating labels communicate hospital pressure, passport evidence, and network coverage.



## Security-first hospital portals

The protected `/portal` route is the secure account-scoped path for the hospital platform. It uses the existing Manus OAuth session and the managed MySQL database. A signed-in user can create a synthetic patient profile or submit a staff application. Staff applications remain `pending` until a server-authorized administrator reviews them; choosing a staff function never grants access. Approved staff see only appointment and service-request workflows for the approved hospital. Patients see only their own profile, appointments, requests, and notifications. Administrator review is available only when the server-managed user role is `admin` and every approval, suspension, denied-access, and workflow transition is written to `security_audit_logs`.

The existing `/app` operations console remains a controlled synthetic network demonstration for the MedRisq AI resource, medicine, emergency exchange, and innovation workflows. Its visible demo persona picker is not an authentication boundary. Use `/portal` for the secure patient/staff/admin workflows.

## Portal database tables

`drizzle/schema.ts` defines additive tables for `staff_applications`, `patient_profiles`, `appointments`, `service_requests`, `portal_notifications`, and `security_audit_logs`. The committed migration is `drizzle/0001_marvelous_legion.sql`. With `DATABASE_URL` configured, use `pnpm exec drizzle-kit migrate` to apply committed migrations; never run destructive schema changes against the shared managed database without an explicit review. In tests, portal persistence is isolated to an in-memory store so authorization tests do not mutate shared development data.

## Security validation

`pnpm test` covers patient ownership and IDOR prevention, pending-staff blocking, admin-only approval, approved-staff organization scope, and the privilege boundary that prevents public registration from creating administrator access. The portal client has separate patient, staff, and admin experiences with explicit loading, empty, denied, approval-pending, success, and error states.
