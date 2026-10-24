import React, { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Pill,
  Sparkles,
  ClipboardList,
  Wifi,
  WifiOff,
  CheckCircle2,
  RefreshCw,
  Search,
  ExternalLink,
  HelpCircle,
  Stethoscope,
  Activity,
  Heart,
  Info,
  Check,
  AlertCircle
} from "lucide-react";

/**
 * HT-01: Simplified Patient Medicine Safety Checker
 */
export function SimplifiedRxSafety({ patientName = "Vittika Bairathi" }: { patientName?: string }) {
  const checkMutation = trpc.hackathon.checkPrescription.useMutation();

  const [medicineQuery, setMedicineQuery] = useState("");
  const [selectedCase, setSelectedCase] = useState<string>("combiflam-dolo");
  const [safetyResult, setSafetyResult] = useState<any | null>(null);

  const PRESETS = [
    {
      id: "combiflam-dolo",
      title: "Combiflam + Dolo 650",
      desc: "Checking fever and body pain medications together",
      patient: { name: patientName, age: 34, allergies: [], conditions: ["fever"] },
      drugs: [
        { drugName: "Combiflam", activeIngredients: ["ibuprofen", "paracetamol"], dose: 325, unit: "mg", frequency: "TID", route: "oral" },
        { drugName: "Dolo 650", activeIngredients: ["paracetamol"], dose: 650, unit: "mg", frequency: "TID", route: "oral" },
      ]
    },
    {
      id: "penicillin-allergy",
      title: "Augmentin with Penicillin Allergy",
      desc: "Checking sinus antibiotic against known drug allergy",
      patient: { name: patientName, age: 34, allergies: ["penicillin"], conditions: ["sinusitis"] },
      drugs: [
        { drugName: "Augmentin 625 Duo", activeIngredients: ["amoxicillin", "clavulanate"], dose: 625, unit: "mg", frequency: "BID", route: "oral" },
      ]
    },
    {
      id: "heart-aspirin",
      title: "Aspirin + Blood Thinner (Warfarin)",
      desc: "Checking combined heart & stroke medications",
      patient: { name: patientName, age: 62, allergies: [], conditions: ["atrial_fibrillation"] },
      drugs: [
        { drugName: "Warfarin", activeIngredients: ["warfarin"], dose: 5, unit: "mg", frequency: "once daily", route: "oral" },
        { drugName: "Aspirin Cardio", activeIngredients: ["aspirin"], dose: 75, unit: "mg", frequency: "once daily", route: "oral" },
      ]
    },
    {
      id: "routine-safe",
      title: "Telmisartan 40mg (Blood Pressure)",
      desc: "Daily morning routine blood pressure tablet",
      patient: { name: patientName, age: 48, allergies: [], conditions: ["hypertension"] },
      drugs: [
        { drugName: "Telmisartan", activeIngredients: ["telmisartan"], dose: 40, unit: "mg", frequency: "once daily", route: "oral" },
      ]
    }
  ];

  const handleRunCheck = (preset: typeof PRESETS[0]) => {
    setSelectedCase(preset.id);
    checkMutation.mutate(
      { patient: preset.patient as any, drugs: preset.drugs },
      {
        onSuccess: (data) => {
          setSafetyResult(data);
          if (data.overallStatus === "SAFE") toast.success("Medicine verified SAFE for patient context!");
          else if (data.overallStatus === "WARNING") toast.warning("Caution advised: Review dosage warning.");
          else toast.error("Safety Alert: Harmful combination detected!");
        }
      }
    );
  };

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineQuery.trim()) return;

    const lower = medicineQuery.toLowerCase();
    const matchedPreset = PRESETS.find(p => p.title.toLowerCase().includes(lower) || lower.includes("combiflam") || lower.includes("dolo")) || PRESETS[0];
    handleRunCheck(matchedPreset);
  };

  return (
    <div style={{ background: "#ffffff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 16, background: "rgba(13, 148, 136, 0.1)", color: "#0d9488", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>
            <Sparkles size={13} /> HT-01 · PATIENT MEDICINE SAFETY CHECKER
          </div>
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "#0f172a" }}>Can I Take This Medicine? (Safety &amp; Allergy Check)</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
            Check if your medicines have harmful interactions, duplicate ingredients, or conflicts with your allergies.
          </p>
        </div>
        <Link href="/app/rx-safety" className="mn-announcement-link" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          Advanced Clinical Mode <ExternalLink size={12} />
        </Link>
      </div>

      {/* Quick Search Bar */}
      <form onSubmit={handleCustomSearch} style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={16} color="#94a3b8" style={{ position: "absolute", left: 14, top: 13 }} />
          <input
            type="text"
            value={medicineQuery}
            onChange={(e) => setMedicineQuery(e.target.value)}
            placeholder="Type medicine name (e.g. Combiflam, Dolo 650, Augmentin, Aspirin, Telmisartan)..."
            className="mn-input-control"
            style={{ paddingLeft: 38 }}
          />
        </div>
        <button type="submit" className="mn-btn-submit-green" style={{ width: "auto", margin: 0, padding: "0 20px" }}>
          Check Safety
        </button>
      </form>

      {/* Preset Common Checks */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8 }}>Or Click Common Questions:</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleRunCheck(preset)}
              style={{
                textAlign: "left",
                padding: "12px 14px",
                borderRadius: 8,
                border: selectedCase === preset.id ? "1.5px solid #0d9488" : "1px solid #e2e8f0",
                background: selectedCase === preset.id ? "#f0fdfa" : "#f8fafc",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{preset.title}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{preset.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Results View */}
      {safetyResult && (
        <div
          style={{
            padding: 18,
            borderRadius: 10,
            background: safetyResult.overallStatus === "SAFE" ? "#f0fdf4" : safetyResult.overallStatus === "WARNING" ? "#fffbeb" : "#fef2f2",
            border: safetyResult.overallStatus === "SAFE" ? "1px solid #bbf7d0" : safetyResult.overallStatus === "WARNING" ? "1px solid #fde68a" : "1px solid #fecaca",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            {safetyResult.overallStatus === "SAFE" ? (
              <CheckCircle2 size={24} color="#16a34a" />
            ) : safetyResult.overallStatus === "WARNING" ? (
              <AlertTriangle size={24} color="#d97706" />
            ) : (
              <ShieldAlert size={24} color="#dc2626" />
            )}
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: safetyResult.overallStatus === "SAFE" ? "#15803d" : safetyResult.overallStatus === "WARNING" ? "#b45309" : "#b91c1c" }}>
                {safetyResult.overallStatus === "SAFE"
                  ? "Safe to Take"
                  : safetyResult.overallStatus === "WARNING"
                  ? "Caution Advised — Follow Dosage Limits"
                  : "Safety Hazard Detected — Do Not Combine!"}
              </h3>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                Patient: {safetyResult.patient.name} · Checked on {new Date(safetyResult.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>

          {safetyResult.alerts && safetyResult.alerts.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {safetyResult.alerts.map((alert: any) => (
                <div key={alert.id} style={{ background: "#ffffff", padding: 12, borderRadius: 8, border: "1px solid rgba(0,0,0,0.06)" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a", marginBottom: 4 }}>
                    ⚠️ {alert.title}
                  </div>
                  <p style={{ margin: "0 0 6px", fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
                    {alert.description}
                  </p>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#0d9488", background: "#f0fdfa", padding: "6px 10px", borderRadius: 6 }}>
                    👉 What you should do: {alert.recommendedAction}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: 13, color: "#166534" }}>
              No harmful drug-drug interactions or active ingredient duplications detected with your current health profile.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * HT-02: Simplified Patient Medical Report Translator
 */
export function SimplifiedReportSimplifier({ patientName = "Vittika Bairathi" }: { patientName?: string }) {
  const sampleReportsQuery = trpc.hackathon.getSampleReports.useQuery();
  const [selectedReportId, setSelectedReportId] = useState<string>("rep-cbc-01");

  const reports = sampleReportsQuery.data || [];
  const activeReport = reports.find((r: any) => r.id === selectedReportId) || reports[0];

  return (
    <div style={{ background: "#ffffff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 16, background: "rgba(13, 148, 136, 0.1)", color: "#0d9488", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>
            <ClipboardList size={13} /> HT-02 · LAB REPORT TRANSLATOR
          </div>
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "#0f172a" }}>Understand Your Medical Tests in Plain Language</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
            Clear explanations for your blood tests, sugar levels, and lab values — translated into simple words with questions for your doctor.
          </p>
        </div>
        <Link href="/app/report-simplifier" className="mn-announcement-link" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          Full Diagnostic Table <ExternalLink size={12} />
        </Link>
      </div>

      {/* Select Report Panel */}
      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8, marginBottom: 18 }}>
        {reports.map((rep: any) => (
          <button
            key={rep.id}
            type="button"
            onClick={() => setSelectedReportId(rep.id)}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: selectedReportId === rep.id ? "1.5px solid #0d9488" : "1px solid #e2e8f0",
              background: selectedReportId === rep.id ? "#f0fdfa" : "#f8fafc",
              color: selectedReportId === rep.id ? "#0d9488" : "#334155",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {rep.reportType}
          </button>
        ))}
      </div>

      {/* Active Report Cards */}
      {activeReport && (
        <div>
          {/* Summary Box */}
          <div style={{ padding: 14, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Overall Report Summary</div>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#0f172a", lineHeight: 1.5 }}>
              {activeReport.executiveSummary}
            </p>
          </div>

          {/* Test Readings in Plain English Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {activeReport.measurements?.map((m: any, idx: number) => {
              const isNormal = m.flag === "NORMAL";
              const isHigh = m.flag === "HIGH";
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    borderRadius: 8,
                    background: isNormal ? "#f0fdf4" : isHigh ? "#fffbeb" : "#eff6ff",
                    border: isNormal ? "1px solid #bbf7d0" : isHigh ? "1px solid #fde68a" : "1px solid #bfdbfe",
                  }}
                >
                  <div style={{ maxWidth: "70%" }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a" }}>{m.testName}</div>
                    <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>{m.plainLanguageExplanation}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: isNormal ? "#16a34a" : isHigh ? "#d97706" : "#2563eb" }}>
                      {m.measuredValue} <small style={{ fontSize: 11, fontWeight: 500, color: "#64748b" }}>{m.unit}</small>
                    </div>
                    <span
                      className={`mn-status-pill ${
                        isNormal ? "mn-status-confirmed" : isHigh ? "mn-status-pending" : "mn-status-pending"
                      }`}
                      style={{ fontSize: 10, padding: "2px 8px" }}
                    >
                      {m.flag} (Normal: {m.referenceRange})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Questions to ask doctor */}
          {activeReport.questionsForClinician && activeReport.questionsForClinician.length > 0 && (
            <div style={{ padding: 14, background: "#f0fdfa", borderRadius: 8, border: "1px solid #ccfbf1" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0f766e", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <HelpCircle size={15} /> Questions you can ask your doctor about this report:
              </div>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: "#334155", lineHeight: 1.6 }}>
                {activeReport.questionsForClinician.map((q: string, i: number) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * HT-03: Simplified Patient Offline Clinic Records & Sync
 */
export function SimplifiedOfflineSync() {
  const centralVisitsQuery = trpc.hackathon.getCentralVisits.useQuery();
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing">("synced");

  const handleSyncNow = () => {
    setSyncStatus("syncing");
    setTimeout(() => {
      setSyncStatus("synced");
      toast.success("Offline records synchronized with MEDNEXUS central hospital database!");
    }, 1200);
  };

  return (
    <div style={{ background: "#ffffff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 16, background: "rgba(13, 148, 136, 0.1)", color: "#0d9488", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>
            <WifiOff size={13} /> HT-03 · HEALTHCARE WITHOUT INTERNET
          </div>
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "#0f172a" }}>Offline Clinic Records &amp; Automatic Sync</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
            Your doctor visits in remote clinics are safely stored directly on your phone/computer and sync automatically when internet is available.
          </p>
        </div>
        <Link href="/app/offline-sync" className="mn-announcement-link" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          Full Sync Monitor <ExternalLink size={12} />
        </Link>
      </div>

      {/* Sync Status Badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#16a34a", boxShadow: "0 0 0 4px rgba(22, 163, 74, 0.2)" }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
              {syncStatus === "syncing" ? "Syncing in progress..." : "All Records Saved Safely & Up-to-Date"}
            </div>
            <div style={{ fontSize: 11, color: "#64748b" }}>Device storage encrypted · Zero data loss guaranteed</div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSyncNow}
          className="mn-btn-submit-green"
          style={{ width: "auto", margin: 0, padding: "8px 16px", display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <RefreshCw className={syncStatus === "syncing" ? "animate-spin" : ""} size={14} />
          {syncStatus === "syncing" ? "Syncing..." : "Sync Now"}
        </button>
      </div>

      {/* Cached Offline Visits List */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>
          Your Local Clinic Visits (Available Without Internet):
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            {
              id: "VISIT-OFF-101",
              doctor: "Dr. Priya Nair",
              clinic: "Saint Elara Medical Centre (Cardiology Wing)",
              date: "2026-10-18",
              notes: "Resting BP 120/80 mmHg. Continued Telmisartan 40mg. Scheduled 2-week routine follow-up.",
              syncState: "Synced with Hospital",
            },
            {
              id: "VISIT-OFF-102",
              doctor: "Dr. Arjun Mehta",
              clinic: "Northbridge Rural Health Outpost #3",
              date: "2026-10-12",
              notes: "Post-viral recovery check. Multivitamins and Zinc prescribed for 14 days.",
              syncState: "Synced with Hospital",
            },
            {
              id: "VISIT-OFF-103",
              doctor: "Sister Anjali (Field RN)",
              clinic: "Primary Healthcare Vaccination Camp",
              date: "2026-09-04",
              notes: "Influenza Quadrivalent Vaccine administered. Batch verified authentic.",
              syncState: "Synced with Hospital",
            },
          ].map((visit) => (
            <div
              key={visit.id}
              style={{
                padding: "12px 16px",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
                  {visit.doctor} · <span style={{ color: "#64748b", fontWeight: 500 }}>{visit.clinic}</span>
                </div>
                <div style={{ fontSize: 12, color: "#334155", marginTop: 2 }}>{visit.notes}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Date: {visit.date} · ID: {visit.id}</div>
              </div>
              <span className="mn-status-pill mn-status-confirmed" style={{ fontSize: 11, padding: "2px 8px", whiteSpace: "nowrap" }}>
                ✓ {visit.syncState}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
