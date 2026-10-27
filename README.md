# 🏥 MedNexus AI (MedRisq)
### Next-Generation Hospital Operating System & Patient Clinical Safety Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![tRPC](https://img.shields.io/badge/tRPC-11.6-2596BE?logo=trpc)](https://trpc.io/)
[![Vercel Ready](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://vercel.com/)
[![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen?logo=vitest)](https://vitest.dev/)

> **One Connected Network. Safer Medicines. Smarter Emergency Response.**  
> MedNexus AI (MedRisq) is a multi-persona hospital operating system that bridges clinical operations, diagnostic intelligence, and patient safety. Built to eliminate medication errors, streamline patient access, and coordinate emergency healthcare logistics across regional hospital clusters.

---

## 📌 Table of Contents
- [Executive Overview](#-executive-overview)
- [System Architecture](#-system-architecture)
- [Core Innovation Modules](#-core-innovation-modules)
  - [HT-01: Medication Safety & Prescription Audit Engine](#ht-01-medication-safety--prescription-audit-engine)
  - [HT-02: Diagnostic Lab Report Simplifier](#ht-02-diagnostic-lab-report-simplifier)
  - [HT-03: Edge Offline-First Sync Engine (SHA-256)](#ht-03-edge-offline-first-sync-engine-sha-256)
  - [Multilingual AI Appointment Booking Agent](#multilingual-ai-appointment-booking-agent)
- [Multi-Persona Hospital Consoles](#-multi-persona-hospital-consoles)
- [Regional Network & Disaster Intelligence](#-regional-network--disaster-intelligence)
- [Repository Structure](#-repository-structure)
- [Setup & Installation Instructions](#-setup--installation-instructions)
- [Environment Configuration](#-environment-configuration)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Deployment Guide (Vercel & Docker)](#-deployment-guide)
- [API Reference](#-api-reference)
- [Security, Privacy & Regulatory Compliance](#-security-privacy--regulatory-compliance)
- [Hackathon Supporting Materials](#-hackathon-supporting-materials)
- [License](#-license)

---

## 🌟 Executive Overview

Every year, millions of preventable adverse drug events occur due to fragmented healthcare systems. In developing healthcare ecosystems like India, patients frequently receive prescriptions under different brand names containing identical active compounds, or experience dangerous drug-drug interactions when consulting multiple specialists.

**MedNexus AI solves this systemic crisis through five integrated pillars:**
1. **Clinical Safety Safeguard:** Immediate detection of duplicate active ingredients (e.g. *Combiflam* [Paracetamol + Ibuprofen] + *Dolo 650* [Paracetamol] causing toxic 975mg liver injury) and dangerous drug-drug contraindications.
2. **Diagnostic Literacy:** Automated translation of complex biochemical laboratory panels (CBC, HbA1c, Lipid Profiles) into plain-language explanations with actionable doctor discussion points.
3. **Universal Access:** Voice-enabled (Hindi/English/Hinglish), vision OCR, and CSV batch AI booking agent allowing rural and elderly patients to schedule verified clinical appointments.
4. **Unified Operations:** Coordinated multi-persona consoles for Hospital Administrators, Ward Nurses, Attending Physicians, and Registered Patients.
5. **Resilient Regional Coordination:** Inter-hospital medicine rescue networks, medicine trust passports, and disaster swarm intelligence with live capacity twins.

---

## 🏗️ System Architecture

MedNexus AI uses a modern, modular, end-to-end TypeScript architecture:

```mermaid
graph TB
    subgraph ClientLayer ["Client Layer (React 19 + Vite + Tailwind CSS)"]
        UI_Admin["Admin Command Center"]
        UI_Doc["Attending Doctor Console"]
        UI_Nurse["Ward Nurse / Staff Console"]
        UI_Patient["Patient Portal & AI Booking"]
        UI_Safety["HT-01/02/03 Clinical Safety Suite"]
    end

    subgraph APILayer ["API & Business Logic (Express + tRPC v11)"]
        TRPC["tRPC Router Gateway (/api/trpc)"]
        AuthCtx["Role-Based Context & Auth Guard"]
        AIAgent["Multilingual AI Booking Service"]
        ClinicalSafety["HT Safety & Verification Engine"]
        PortalStore["Portal & Clinical Store (In-Memory / MySQL)"]
    end

    subgraph IntelligenceLayer ["Intelligence & LLM Services"]
        Gemini["Google Gemini 2.5 Flash / Groq / OpenAI"]
        VisionOCR["Document & Handwritten Rx Vision OCR"]
        AudioProc["Web Speech & Multilingual NLU"]
    end

    subgraph DataLayer ["Data & Edge Persistence"]
        Drizzle["Drizzle ORM (MySQL / TiDB / PlanetScale)"]
        OfflineSync["Edge Offline Store (IndexedDB + SHA-256 Checksums)"]
    end

    ClientLayer -->|Type-Safe RPC| TRPC
    TRPC --> AuthCtx
    AuthCtx --> AIAgent
    AuthCtx --> ClinicalSafety
    AuthCtx --> PortalStore
    AIAgent --> Gemini
    AIAgent --> VisionOCR
    AIAgent --> AudioProc
    PortalStore --> Drizzle
    ClientLayer -.->|Offline Sync| OfflineSync
```

---

## 💡 Core Innovation Modules

### HT-01: Medication Safety & Prescription Audit Engine
- **Duplicate Active Compound Detection:** Analyzes multi-brand prescriptions to prevent accidental overdoses (e.g., detecting hidden Acetaminophen/Paracetamol across combination analgesics).
- **Drug-Drug Interaction (DDI) Matrix:** Evaluates cross-medication contraindications (e.g., Warfarin + Aspirin hemorrhage risks, Metformin + contrast dye nephrotoxicity).
- **Allergy Cross-Reactivity:** Flags penicillin/beta-lactam contraindications against Augmentin/Amoxicillin.
- **Dosage Safety Bounds:** Compares recommended pediatric and adult daily thresholds against total aggregated intake.

### HT-02: Diagnostic Lab Report Simplifier
- **Biochemical Panel Parsing:** Ingests Complete Blood Counts (CBC), HbA1c diabetic markers, Lipid panels, and Kidney Function Tests (KFT).
- **Plain-Language Explanations:** Converts esoteric medical terminology into high-clarity patient summaries.
- **Doctor Consultation Talking Points:** Equips patients with specific questions for their next follow-up.

### HT-03: Edge Offline-First Sync Engine (SHA-256)
- **Zero-Connectivity Clinical Continuity:** Enables rural clinics, mobile ambulances, and field nurses to register patients and record vitals offline.
- **Cryptographic Tamper-Evident Ledger:** Every offline transaction generates a SHA-256 hash chaining prior records.
- **Three-Way Conflict Resolution:** Resolves timestamp collisions automatically when reconnecting to the central hospital network.

### Multilingual AI Appointment Booking Agent
- **Natural Language Voice Input:** Speak naturally in Hindi, Hinglish, or English (e.g., *"Dr. Om Mishra ke saath kal subah 10 baje appointment book kardo"*).
- **Vision OCR Prescription Scanning:** Upload mobile snapshots of paper prescriptions to automatically extract doctor, department, and suggested appointment timings.
- **Batch CSV Import:** Health camps and corporate checkups can upload bulk CSVs of up to 500 patient records in a single click.
- **Intelligent Gating:** Atomic slot lock prevention to avoid double bookings, automated confirmation tokens, and simulated patient email/SMS notifications.

---

## 👥 Multi-Persona Hospital Consoles

| Persona | Key User | Operational Responsibilities |
| :--- | :--- | :--- |
| **Hospital Administrator** | Dr. Arvind Swaminathan | Real-time monitoring of 8 core hospital KPIs, departmental bed occupancy matrix, ambulance fleet GPS telemetry, central pharmaceutical inventory, staff duty rosters, and financial audit logs. |
| **Ward Nurse / Clinical Staff** | Sister Sarita Thomas | Rapid OPD token generation, shift handover checklists, patient triage vitals entry, immediate ICU/General bed allocation, and discharge coordination. |
| **Attending Doctor** | Dr. Om Mishra | Live patient queue management, one-click clinical briefings, digital Rx pad with live interaction checking, and secure WebRTC tele-consultation. |
| **Registered Patient** | Vittika Bairathi (PAT-011) | 40-specialist doctor directory, AI voice/text booking, longitudinal health timeline, digital prescriptions, pill tracker, and tax invoices. |

---

## 🌐 Regional Network & Disaster Intelligence

- **Emergency Resource Digital Twin:** Real-time visibility into 5 regional partner hospitals (Bed, ICU, Ventilator, Oxygen, and Staff status) with 6h/12h/24h shortage predictive simulations.
- **Medicine Trust Passport:** Digital passport ledger for 15+ synthetic medicine batches, tracking supply chain custody, cold-chain breaches, and anti-counterfeiting verification.
- **Inter-Hospital Medicine Rescue Network:** Automated reallocation of expiring or surplus critical stock between hospitals.
- **Disaster Swarm Intelligence:** Emergency command center simulation for floods, earthquakes, mass-casualty incidents, and grid outages with dynamic demand forecasting.

---

## 📂 Repository Structure

```
medrisq/
├── client/                     # Frontend Application (React 19, Vite, Tailwind CSS)
│   ├── public/                 # Static assets, platform config, icons
│   ├── src/
│   │   ├── components/         # Modular UI views & widgets
│   │   │   ├── AdminConsoleView.tsx       # Hospital Administrator command center
│   │   │   ├── DoctorConsoleView.tsx      # Attending physician clinical queue & Rx
│   │   │   ├── StaffConsoleView.tsx       # Ward nurse triage & bed matrix
│   │   │   ├── RegionalOperationsView.tsx # Regional twin & disaster swarm
│   │   │   ├── AiAppointmentBooking.tsx   # Multilingual voice/text/vision booking
│   │   │   ├── SimplifiedHtSuite.tsx      # HT-01, HT-02, HT-03 patient suite
│   │   │   └── ui/                        # Reusable Radix UI & design system primitives
│   │   ├── pages/              # Primary route views (DashboardSuite, LoginPage)
│   │   ├── hooks/              # Custom React hooks (useMobile, useToast)
│   │   └── lib/                # tRPC client, query client, utility helpers
│   └── index.html              # HTML5 entry template
├── server/                     # Backend API & Business Logic (Express + tRPC)
│   ├── _core/                  # Core infrastructure (env, context, cookies, OAuth)
│   ├── aiBookingService.ts     # Multilingual AI scheduling & intent extraction
│   ├── clinicalAiService.ts    # HT-01 safety audit & HT-02 report summarization
│   ├── portalStore.ts          # Multi-persona database queries with in-memory fallback
│   ├── demoStore.ts            # Regional emergency exchange & medicine verifier store
│   ├── innovationStore.ts      # Digital twin, trust passport & disaster simulator
│   ├── routers.ts              # Central tRPC API router definition
│   ├── app.ts                  # Express application factory & middleware
│   └── portal.test.ts          # Vitest test suite for security & role boundaries
├── drizzle/                    # Database ORM & Migrations
│   ├── schema.ts               # Schema definitions (Users, Appointments, Staff, Audits)
│   └── 0001_marvelous_legion.sql # Committed relational database migrations
├── api/                        # Serverless deployment entrypoints
│   └── index.js                # Vercel Serverless Function entry (bundled Express app)
├── vercel.json                 # Vercel deployment routing & build configuration
├── .vercelignore               # Deployment asset exclusion filter
├── package.json                # Project dependencies and script definitions
├── tsconfig.json               # TypeScript compiler configuration
└── vite.config.ts              # Vite bundling, aliases, and development plugins
```

---

## 🚀 Setup & Installation Instructions

### Prerequisites
- **Node.js**: `v18.0.0` or higher (Node 20+ recommended)
- **Package Manager**: `npm` (v9+) or `pnpm` (v9+)
- **Git** installed on your system

### 1. Clone the Repository
```bash
git clone https://github.com/Duskcrevice/medrisq.git
cd medrisq
```

### 2. Install Dependencies
Using **npm**:
```bash
npm install
```
*Or using **pnpm**:*
```bash
pnpm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root:
```env
# Google Gemini API key for AI appointment booking & report analysis
GEMINI_API_KEY=your_gemini_api_key_here

# (Optional) MySQL connection string. If omitted, the system runs with full in-memory fallback
DATABASE_URL=mysql://user:password@localhost:3306/mednexus

# Environment mode
NODE_ENV=development
```

### 4. Run the Development Server
```bash
npm run dev
```
Open your browser at **`http://localhost:3000`**.

### 5. Build for Production
To test the production build locally:
```bash
npm run build
npm start
```

---

## 🧪 Testing & Quality Assurance

The codebase includes an automated Vitest test suite covering authorization boundaries, IDOR prevention, and clinical safety algorithms:

```bash
# Run the test suite
npm test

# Run TypeScript type verification
npm run check
```

**Test Coverage Highlights:**
- ✅ **Patient Ownership & IDOR Protection:** Ensures patients cannot read or alter records belonging to other patients.
- ✅ **Privilege Boundary Enforcement:** Unapproved staff applications are locked out of clinical tools until approved by an administrator.
- ✅ **Hospital Organizational Scope:** Approved staff access is strictly scoped to their assigned facility.
- ✅ **HT-01 Safety Rules:** Deterministic test cases validating duplicate brand paracetamol alerts and drug interaction warnings.

---

## ☁️ Deployment Guide

### Deploying to Vercel (Recommended)

MedNexus AI is pre-configured for zero-friction Vercel deployment via `vercel.json` and a serverless Express adapter:

1. **Option 1: Push to GitHub & Import**
   - Push this repository to your GitHub account:
     ```bash
     git add .
     git commit -m "Initial commit for MedNexus AI"
     git branch -M main
     git remote add origin https://github.com/<your-username>/medrisq.git
     git push -u origin main
     ```
   - Visit [vercel.com/new](https://vercel.com/new) and import your repository.
   - Under **Environment Variables**, add `GEMINI_API_KEY`.
   - Click **Deploy**. Vercel will build both the frontend and the `/api` serverless backend automatically.

2. **Option 2: Deploy via Vercel CLI**
   ```bash
   npx vercel login
   npx vercel --prod
   ```

### Docker Deployment
A production-ready `Dockerfile` is provided in the repository:
```bash
docker build -t mednexus-ai .
docker run -p 3000:3000 -e GEMINI_API_KEY="your_api_key" mednexus-ai
```

---

## 📡 API Reference

### Health & Static Endpoints
- `GET /api/health` — Returns `{ status: "ok" }` for infrastructure uptime checks.
- `GET /api/platform/config.js` — Serves dynamic platform parameters to the client.

### Primary tRPC Procedures (`/api/trpc/*`)
| Procedure | Type | Description |
| :--- | :--- | :--- |
| `portal.getRole` | Query | Returns active authenticated role (admin, staff, patient). |
| `portal.getSnapshot` | Query | Retrieves hospital-scoped metrics, appointments, and requests. |
| `portal.bookAppointment` | Mutation | Books a patient appointment with atomic slot validation. |
| `portal.registerPatient` | Mutation | Registers a new patient with contact & hospital binding. |
| `portal.applyStaff` | Mutation | Submits healthcare staff credential application for review. |
| `portal.reviewStaff` | Mutation | Admin approval or rejection of staff applications. |
| `aiBooking.processBooking`| Mutation | Multilingual NLU intent parsing (voice, text, vision OCR, CSV). |
| `clinical.checkSafety` | Mutation | HT-01 prescription audit for DDIs and duplicate ingredients. |
| `clinical.simplifyReport` | Mutation | HT-02 diagnostic lab panel translation. |
| `innovations.getSnapshot`| Query | Regional digital twin, medicine passport, and disaster simulation data. |

---

## 🔒 Security, Privacy & Regulatory Compliance

- **Indian DPDP Act (2023) & DISHA Alignment:** Data minimization applied across all public APIs; no unencrypted patient identifiers exposed in demo mode.
- **IDOR & Role-Based Access Control (RBAC):** Strict middleware guards on every clinical procedure. Public registration can never grant administrative privileges.
- **Edge Data Protection:** Local emergency stores use client-side AES encryption and SHA-256 hashes to guarantee data integrity across network interruptions.
- **Secure Sessions:** HTTP-only, `SameSite=Lax` cookies with cryptographically signed tokens.

---

## 🏆 Hackathon Supporting Materials

For judges and evaluators reviewing this prototype:
- **[Judge Evaluation & Architecture Report](hackathon_judge_evaluation_and_architecture.md):** Deep-dive analysis covering the 3-minute pitch strategy, hybrid three-tier security topology, and regulatory comparison.
- **Interactive Persona Demonstrations:** Click the persona selector at the top of the `/app` dashboard to immediately preview Hospital Administrator, Doctor, Staff Nurse, or Patient perspectives.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

Developed with ❤️ for resilient, patient-centric healthcare.
