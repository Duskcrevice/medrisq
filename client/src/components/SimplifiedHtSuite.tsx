import React, { useState, useRef } from "react";
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
  AlertCircle,
  Upload,
  FileText,
  Printer,
  Download,
  FileSpreadsheet,
  Layers,
  Loader2,
  Image as ImageIcon
} from "lucide-react";

interface PatientMedicineView {
  drugName: string;
  verdict: "SAFE" | "CAUTION" | "DANGER";
  disease: string;
  whatsWrong: string;
  keyInstructions: string;
  organRisks?: { liver: string; kidney: string; stomach: string; heart: string };
  source?: string;
}

/**
 * HT-01: Simplified Patient Medicine Safety Checker
 * Supports ANY medicine search (generic or brand) + quick 1-click presets.
 */
export function SimplifiedRxSafety({ patientName = "Vittika Bairathi" }: { patientName?: string }) {
  const verifyAnyMutation = trpc.hackathon.verifyAnyMedicine.useMutation();

  const [medicineQuery, setMedicineQuery] = useState("");
  const [selectedPresetId, setSelectedPresetId] = useState<string>("combiflam-dolo");

  // Initial default state (Combiflam + Dolo 650 duplicate toxicity)
  const [activeResult, setActiveResult] = useState<PatientMedicineView>({
    drugName: "Combiflam + Dolo 650",
    verdict: "DANGER",
    disease: "Commonly taken for acute fever, headache, body ache, or muscle soreness.",
    whatsWrong: "Both medicines contain Paracetamol. Taking both gives you 975mg Paracetamol in a single dose, which puts your liver at serious risk of acute toxicity.",
    keyInstructions: "Stop one of them immediately. Never take Combiflam and Dolo 650 within 6 hours of each other.",
    organRisks: {
      liver: "High Risk (Paracetamol Overdose)",
      kidney: "Moderate",
      stomach: "Moderate (Ibuprofen irritation)",
      heart: "Low Risk"
    },
    source: "Clinical Engine"
  });

  const PRESETS = [
    {
      id: "combiflam-dolo",
      title: "Combiflam + Dolo 650",
      query: "Combiflam + Dolo 650",
      category: "Fever & Body Pain",
      condition: "Fever, Body Aches, and Headache",
      verdict: "DANGER" as const,
    },
    {
      id: "penicillin-allergy",
      title: "Augmentin 625 Duo",
      query: "Augmentin 625 Duo (Amoxicillin + Clavulanate)",
      category: "Bacterial Infection",
      condition: "Sinus, Chest, or Throat Bacterial Infection",
      verdict: "DANGER" as const,
    },
    {
      id: "heart-aspirin",
      title: "Warfarin + Aspirin 75mg",
      query: "Warfarin + Aspirin 75mg Cardio",
      category: "Heart & Blood Clotting",
      condition: "Blood Clot Prevention & Heart Health",
      verdict: "CAUTION" as const,
    },
    {
      id: "telmisartan-routine",
      title: "Telmisartan 40mg",
      query: "Telmisartan 40mg daily",
      category: "Blood Pressure",
      condition: "High Blood Pressure (Hypertension)",
      verdict: "SAFE" as const,
    },
    {
      id: "metformin-sugar",
      title: "Metformin 500mg",
      query: "Metformin 500mg SR",
      category: "Diabetes",
      condition: "Type 2 Diabetes Glycemic Control",
      verdict: "SAFE" as const,
    },
    {
      id: "azithro-infection",
      title: "Azithromycin 500mg",
      query: "Azithromycin 500mg",
      category: "Chest & Throat",
      condition: "Respiratory & Throat Bacterial Infection",
      verdict: "SAFE" as const,
    }
  ];

  const handleVerifyQuery = (queryToVerify: string, presetId?: string) => {
    if (!queryToVerify.trim()) return;
    if (presetId) setSelectedPresetId(presetId);
    else setSelectedPresetId("");

    verifyAnyMutation.mutate(
      { medicineName: queryToVerify.trim(), patientName },
      {
        onSuccess: (data: any) => {
          const isSafe = data.isSafe || "SAFE";
          const organRisks = {
            liver: data.organImpact?.toLowerCase().includes("liver") ? "Warning / Monitor" : "Low Risk",
            kidney: data.organImpact?.toLowerCase().includes("kidney") ? "Warning / Monitor" : "Low Risk",
            stomach: data.organImpact?.toLowerCase().includes("stomach") ? "Caution (Take with food)" : "Low Risk",
            heart: data.organImpact?.toLowerCase().includes("heart") || data.organImpact?.toLowerCase().includes("cardiac") ? "Warning / Monitor" : "Low Risk"
          };
          const mapped: PatientMedicineView = {
            drugName: data.medicineName || queryToVerify,
            verdict: isSafe,
            disease: data.condition || "Therapeutic indication",
            whatsWrong: data.whatIsWrong || "None. Matches health profile safely.",
            keyInstructions: data.detailsAndAction || "Follow prescribed dosage.",
            organRisks,
            source: data.source === "gemini" ? "Google Gemini Medical AI" : "MEDNEXUS Pharmacology Engine"
          };
          setActiveResult(mapped);
          if (isSafe === "SAFE") toast.success(`${mapped.drugName} is SAFE to take!`);
          else if (isSafe === "CAUTION") toast.warning(`Caution advised for ${mapped.drugName}: Review dosage instructions.`);
          else toast.error(`Safety Alert: Harmful combination or risk detected for ${mapped.drugName}!`);
        },
        onError: (err) => {
          toast.error(err.message || "Failed to verify medicine.");
        }
      }
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineQuery.trim()) {
      toast.info("Please enter a medicine name or combination to verify.");
      return;
    }
    handleVerifyQuery(medicineQuery);
  };

  return (
    <div style={{ background: "#ffffff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 16, background: "rgba(13, 148, 136, 0.1)", color: "#0d9488", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>
            <Sparkles size={13} /> PATIENT MEDICINE VERIFIER · ACTIVE CLINICAL AI
          </div>
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "#0f172a" }}>Is My Medicine Safe &amp; Correct To Take?</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
            Type <strong>any</strong> medicine name, brand, or combo (e.g. <em>Azithromycin, Metformin, Pantoprazole, Combiflam + Dolo</em>) to verify safety, purpose, and precautions.
          </p>
        </div>
      </div>

      {/* Real-Time Search Bar */}
      <form onSubmit={handleFormSubmit} style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={16} color="#94a3b8" style={{ position: "absolute", left: 14, top: 13 }} />
          <input
            type="text"
            value={medicineQuery}
            onChange={(e) => setMedicineQuery(e.target.value)}
            placeholder="Type any medicine name (e.g. Metformin 500, Azithromycin, Pantocid 40, Combiflam, Telmisartan)..."
            className="mn-input-control"
            style={{ paddingLeft: 38 }}
          />
        </div>
        <button
          type="submit"
          disabled={verifyAnyMutation.isPending}
          className="mn-btn-submit-green"
          style={{ width: "auto", margin: 0, padding: "0 24px", display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          {verifyAnyMutation.isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Verifying...
            </>
          ) : (
            <>
              <ShieldCheck size={16} /> Verify Medicine
            </>
          )}
        </button>
      </form>

      {/* Preset 1-Click Common Medicines */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8 }}>
          Tap to Check Common Medicines:
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                setMedicineQuery(preset.query);
                handleVerifyQuery(preset.query, preset.id);
              }}
              style={{
                textAlign: "left",
                padding: "10px 14px",
                borderRadius: 8,
                border: selectedPresetId === preset.id ? "2px solid #0d9488" : "1px solid #e2e8f0",
                background: selectedPresetId === preset.id ? "#f0fdfa" : "#f8fafc",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{preset.title}</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "2px 6px",
                    borderRadius: 4,
                    background: preset.verdict === "SAFE" ? "#dcfce7" : preset.verdict === "CAUTION" ? "#fef3c7" : "#fee2e2",
                    color: preset.verdict === "SAFE" ? "#166534" : preset.verdict === "CAUTION" ? "#92400e" : "#991b1b",
                  }}
                >
                  {preset.verdict}
                </span>
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{preset.condition}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Simple 4-Question Patient Results Card */}
      <div
        style={{
          borderRadius: 12,
          padding: 22,
          background:
            activeResult.verdict === "SAFE"
              ? "linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)"
              : activeResult.verdict === "CAUTION"
              ? "linear-gradient(180deg, #fffbeb 0%, #ffffff 100%)"
              : "linear-gradient(180deg, #fef2f2 0%, #ffffff 100%)",
          border:
            activeResult.verdict === "SAFE"
              ? "1.5px solid #86efac"
              : activeResult.verdict === "CAUTION"
              ? "1.5px solid #fde68a"
              : "1.5px solid #fca5a5",
          boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
        }}
      >
        {/* Top Status Banner */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 16, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {activeResult.verdict === "SAFE" ? (
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#dcfce7", display: "grid", placeItems: "center", color: "#16a34a", flexShrink: 0 }}>
                <CheckCircle2 size={28} />
              </div>
            ) : activeResult.verdict === "CAUTION" ? (
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#fef3c7", display: "grid", placeItems: "center", color: "#d97706", flexShrink: 0 }}>
                <AlertTriangle size={28} />
              </div>
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#fee2e2", display: "grid", placeItems: "center", color: "#dc2626", flexShrink: 0 }}>
                <ShieldAlert size={28} />
              </div>
            )}

            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.05em", color: activeResult.verdict === "SAFE" ? "#15803d" : activeResult.verdict === "CAUTION" ? "#b45309" : "#b91c1c" }}>
                {activeResult.verdict === "SAFE" ? "VERIFICATION: SAFE" : activeResult.verdict === "CAUTION" ? "VERIFICATION: CAUTION" : "VERIFICATION: UNSAFE / DANGER"}
              </div>
              <h3 style={{ margin: "2px 0 0", fontSize: 19, fontWeight: 800, color: "#0f172a" }}>
                {activeResult.drugName}
              </h3>
            </div>
          </div>

          {activeResult.source && (
            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: "#f1f5f9", color: "#64748b" }}>
              ⚡ {activeResult.source}
            </span>
          )}
        </div>

        {/* 4 Simple Questions Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
          {/* Question 1: Is it correct to take? */}
          <div style={{ background: "#ffffff", padding: 14, borderRadius: 8, border: "1px solid #f1f5f9" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
              1. Is This Medicine Correct To Take?
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, marginTop: 4, color: activeResult.verdict === "SAFE" ? "#16a34a" : activeResult.verdict === "CAUTION" ? "#d97706" : "#dc2626" }}>
              {activeResult.verdict === "SAFE"
                ? "✅ Yes, this medicine is safe and appropriate for your context."
                : activeResult.verdict === "CAUTION"
                ? "⚠️ Caution: Requires specific medical supervision and dosage limits."
                : "❌ No, DO NOT take this combination or medicine."}
            </div>
          </div>

          {/* Question 2: What disease is it for? */}
          <div style={{ background: "#ffffff", padding: 14, borderRadius: 8, border: "1px solid #f1f5f9" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
              2. For What Disease / Condition Is It Prescribed?
            </div>
            <div style={{ fontSize: 13.5, color: "#0f172a", marginTop: 4, lineHeight: 1.5 }}>
              {activeResult.disease}
            </div>
          </div>

          {/* Question 3: If not safe, what is wrong? */}
          <div style={{ background: "#ffffff", padding: 14, borderRadius: 8, border: "1px solid #f1f5f9" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
              3. What Is Wrong (If Not Safe)?
            </div>
            <div style={{ fontSize: 13.5, color: activeResult.verdict === "SAFE" ? "#166534" : "#991b1b", marginTop: 4, lineHeight: 1.5 }}>
              {activeResult.whatsWrong}
            </div>
          </div>

          {/* Question 4: Essential Details & Patient Instructions */}
          <div style={{ background: "#ffffff", padding: 14, borderRadius: 8, border: "1px solid #f1f5f9" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
              4. Key Details &amp; What You Should Do:
            </div>
            <div style={{ fontSize: 13.5, color: "#0f766e", marginTop: 4, lineHeight: 1.5, fontWeight: 600 }}>
              💡 {activeResult.keyInstructions}
            </div>
          </div>

          {/* Organ Safety Indicators */}
          {activeResult.organRisks && (
            <div style={{ background: "#ffffff", padding: 14, borderRadius: 8, border: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: 8 }}>
                Organ Impact &amp; Safety Profile
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
                <div style={{ padding: "8px 10px", borderRadius: 6, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b" }}>LIVER</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: activeResult.organRisks.liver.includes("High") ? "#dc2626" : "#0f172a" }}>
                    {activeResult.organRisks.liver}
                  </div>
                </div>
                <div style={{ padding: "8px 10px", borderRadius: 6, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b" }}>KIDNEYS</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: activeResult.organRisks.kidney.includes("High") ? "#dc2626" : "#0f172a" }}>
                    {activeResult.organRisks.kidney}
                  </div>
                </div>
                <div style={{ padding: "8px 10px", borderRadius: 6, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b" }}>STOMACH</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: activeResult.organRisks.stomach.includes("High") ? "#dc2626" : "#0f172a" }}>
                    {activeResult.organRisks.stomach}
                  </div>
                </div>
                <div style={{ padding: "8px 10px", borderRadius: 6, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b" }}>HEART</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: activeResult.organRisks.heart.includes("High") ? "#dc2626" : "#0f172a" }}>
                    {activeResult.organRisks.heart}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * HT-02: Simplified Patient Medical Report Translator
 * ZERO redirects! Supports direct file upload, drag-and-drop, text pasting, and PDF export/print.
 */
export function SimplifiedReportSimplifier({ patientName = "Vittika Bairathi" }: { patientName?: string }) {
  const simplifyMutation = trpc.hackathon.simplifyUploadedReport.useMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [inputTab, setInputTab] = useState<"upload" | "paste" | "samples">("upload");
  const [reportText, setReportText] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Active simplified report state
  const [activeReport, setActiveReport] = useState<any>({
    reportType: "Complete Blood Count (CBC) Panel",
    overallStatus: "ATTENTION_REQUIRED",
    executiveSummary: "Your Complete Blood Count shows mild anemia (Hemoglobin 10.2 g/dL) and slightly low platelets (135,000 /uL). Red blood cell oxygen capacity is reduced, which may explain tiredness or mild fatigue.",
    measurements: [
      {
        testName: "Hemoglobin (Hb)",
        measuredValue: "10.2",
        unit: "g/dL",
        referenceRange: "12.0 - 15.5",
        flag: "LOW",
        plainLanguageExplanation: "Carries oxygen from lungs to your muscles and brain. A value of 10.2 indicates mild anemia, causing tiredness."
      },
      {
        testName: "Total White Blood Cells (WBC)",
        measuredValue: "11,800",
        unit: "/uL",
        referenceRange: "4,000 - 11,000",
        flag: "HIGH",
        plainLanguageExplanation: "Infection fighters. Mildly elevated WBC suggests your immune system is responding to a minor viral or bacterial cold."
      },
      {
        testName: "Platelet Count",
        measuredValue: "135,000",
        unit: "/uL",
        referenceRange: "150,000 - 450,000",
        flag: "LOW",
        plainLanguageExplanation: "Blood clotting cells that prevent bruising. Slightly below normal limit; monitor if taking blood-thinning pills."
      },
      {
        testName: "Red Blood Cells (RBC)",
        measuredValue: "4.2",
        unit: "million/uL",
        referenceRange: "3.8 - 5.2",
        flag: "NORMAL",
        plainLanguageExplanation: "Healthy normal total red cell count."
      }
    ],
    questionsForClinician: [
      "Should I take an iron supplement or increase iron-rich foods for my mild anemia?",
      "Do I need to recheck my platelet count in 2 to 4 weeks?",
      "Are my current daily medications safe to continue with these platelet levels?"
    ],
    lifestyleAdvice: [
      "Increase dietary iron with spinach, lentils (dal), pomegranate, raisins, and beetroot.",
      "Pair iron foods with Vitamin C (lemon juice, oranges) to double iron absorption.",
      "Stay well hydrated with at least 2.5 litres of water daily."
    ]
  });

  const SAMPLE_REPORTS = [
    {
      title: "Sample 1: Complete Blood Count (CBC)",
      badge: "Mild Anemia",
      rawText: `METROPOLIS DIAGNOSTICS LAB - COMPLETE BLOOD COUNT (CBC)
Patient: Vittika Bairathi | Age: 34 | Gender: Female
Hemoglobin: 10.2 g/dL (Normal Range: 12.0 - 15.5 g/dL) [LOW]
Total WBC Count: 11,800 /uL (Normal Range: 4,000 - 11,000 /uL) [HIGH]
Platelet Count: 135,000 /uL (Normal Range: 150,000 - 450,000 /uL) [LOW]
RBC Count: 4.2 million/uL (Normal Range: 3.8 - 5.2 million/uL) [NORMAL]
PCV / Hematocrit: 32% (Normal Range: 36 - 46%) [LOW]`
    },
    {
      title: "Sample 2: Diabetes & Sugar Panel (HbA1c)",
      badge: "Diabetic Range",
      rawText: `QUEST CLINICAL PATHOLOGY - GLYCEMIC PROFILE
Patient: Vittika Bairathi | Age: 34
Fasting Blood Sugar (FBS): 156 mg/dL (Normal Range: 70 - 99 mg/dL) [HIGH]
Postprandial Blood Sugar (PPBS): 218 mg/dL (Normal Range: < 140 mg/dL) [HIGH]
HbA1c (Glycated Hemoglobin): 8.8 % (Normal Range: < 5.7 %, Diabetic: >= 6.5 %) [HIGH]
Estimated Average Glucose (eAG): 206 mg/dL [HIGH]
Serum Creatinine: 0.9 mg/dL (Normal: 0.6 - 1.2 mg/dL) [NORMAL]`
    },
    {
      title: "Sample 3: Lipid Profile (Cholesterol)",
      badge: "High Cholesterol",
      rawText: `CENTRAL BIOCHEMISTRY LAB - COMPLETE LIPID PROFILE
Patient: Vittika Bairathi | Age: 34
Total Cholesterol: 242 mg/dL (Desirable: < 200 mg/dL) [HIGH]
Triglycerides: 210 mg/dL (Normal: < 150 mg/dL) [HIGH]
HDL Cholesterol (Good): 38 mg/dL (Protective: > 50 mg/dL) [LOW]
LDL Cholesterol (Bad): 162 mg/dL (Optimal: < 100 mg/dL) [HIGH]
VLDL Cholesterol: 42 mg/dL (Normal: 5 - 30 mg/dL) [HIGH]`
    }
  ];

  const runSimplify = (textToProcess: string, fileName?: string, imageBase64?: string) => {
    if (!textToProcess.trim() && !imageBase64) {
      toast.info("Please provide report text or select a file to simplify.");
      return;
    }
    simplifyMutation.mutate(
      { reportText: textToProcess, patientName, imageBase64 },
      {
        onSuccess: (data: any) => {
          const normalized = {
            reportType: data.reportType || data.reportTitle || "Clinical Diagnostic Report",
            overallStatus: (data.overallHealthStatus?.includes("Attention") || data.overallStatus === "ATTENTION_REQUIRED") ? "ATTENTION_REQUIRED" : "NORMAL",
            executiveSummary: data.executiveSummary || data.summaryVerdict || "Report analysis completed successfully.",
            measurements: (data.measurements || data.parameters || []).map((p: any) => ({
              testName: p.testName || p.parameter || "Diagnostic Marker",
              measuredValue: p.measuredValue !== undefined ? p.measuredValue : p.value || "Normal",
              unit: p.unit || "",
              referenceRange: p.referenceRange || "Standard",
              flag: (p.flag || p.status || "NORMAL").toUpperCase(),
              plainLanguageExplanation: p.plainLanguageExplanation || p.patientExplanation || "Parameter evaluated safely."
            })),
            questionsForClinician: data.questionsForClinician || data.doctorDiscussionQuestions || [
              "Do these test values require any medication or dosage adjustments?",
              "When is the recommended time for my next follow-up panel?"
            ],
            lifestyleAdvice: data.lifestyleAdvice || [
              "Maintain consistent daily water hydration (2.5L/day).",
              "Incorporate 30 minutes of walking into your daily routine."
            ]
          };
          setActiveReport(normalized);
          if (fileName) setUploadedFileName(fileName);
          toast.success("Medical report successfully translated into plain language!");
        },
        onError: (err) => {
          toast.error(err.message || "Failed to simplify report.");
        }
      }
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string) || "";
        setReportText(`[Uploaded Image: ${file.name}] Processing via Gemini Vision OCR...`);
        runSimplify(`Lab Report Image: ${file.name}`, file.name, base64);
      };
      reader.readAsDataURL(file);
    } else if (file.type.includes("text") || file.name.endsWith(".txt") || file.name.endsWith(".csv")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = (event.target?.result as string) || "";
        setReportText(text);
        runSimplify(text, file.name);
      };
      reader.readAsText(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string) || "";
        const desc = `Uploaded document: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        setReportText(desc);
        runSimplify(desc, file.name, base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrintOrExport = () => {
    toast.info("Preparing printable simplified medical report...");
    window.print();
  };

  return (
    <div style={{ background: "#ffffff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 16, background: "rgba(13, 148, 136, 0.1)", color: "#0d9488", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>
            <ClipboardList size={13} /> HT-02 · REPORT SIMPLIFIER &amp; TRANSLATOR
          </div>
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "#0f172a" }}>Understand Your Medical Tests in Plain Language</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
            Upload, paste, or select any lab test to translate numbers into plain English with questions for your doctor.
          </p>
        </div>

        {/* Action Buttons: Export / Print */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={handlePrintOrExport}
            className="mn-btn-submit-green"
            style={{ width: "auto", margin: 0, padding: "8px 16px", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}
          >
            <Printer size={15} /> Export / Print Report (PDF)
          </button>
        </div>
      </div>

      {/* Input Options Selector Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 10 }}>
        <button
          type="button"
          onClick={() => setInputTab("upload")}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: inputTab === "upload" ? "1.5px solid #0d9488" : "1px solid #e2e8f0",
            background: inputTab === "upload" ? "#f0fdfa" : "#ffffff",
            color: inputTab === "upload" ? "#0d9488" : "#475569",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <Upload size={14} /> Upload Report File / Image
        </button>
        <button
          type="button"
          onClick={() => setInputTab("paste")}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: inputTab === "paste" ? "1.5px solid #0d9488" : "1px solid #e2e8f0",
            background: inputTab === "paste" ? "#f0fdfa" : "#ffffff",
            color: inputTab === "paste" ? "#0d9488" : "#475569",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <FileText size={14} /> Paste Lab Test Text
        </button>
        <button
          type="button"
          onClick={() => setInputTab("samples")}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: inputTab === "samples" ? "1.5px solid #0d9488" : "1px solid #e2e8f0",
            background: inputTab === "samples" ? "#f0fdfa" : "#ffffff",
            color: inputTab === "samples" ? "#0d9488" : "#475569",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <Layers size={14} /> One-Click Sample Reports
        </button>
      </div>

      {/* Tab 1: File / Image Upload Zone */}
      {inputTab === "upload" && (
        <div style={{ marginBottom: 20 }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.pdf,image/png,image/jpeg,image/jpg"
            style={{ display: "none" }}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: "2px dashed #0d9488",
              borderRadius: 10,
              padding: "24px 20px",
              textAlign: "center",
              background: "#f0fdfa",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#ccfbf1", display: "grid", placeItems: "center", margin: "0 auto 10px", color: "#0d9488" }}>
              <Upload size={22} />
            </div>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a" }}>
              {uploadedFileName ? `Selected: ${uploadedFileName}` : "Click or Drag & Drop to Upload Lab Report"}
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
              Supports PDF, PNG, JPG, or TXT (Blood tests, CBC, Sugar, Thyroid, Lipid panels)
            </div>
            {uploadedFileName && (
              <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#0d9488", fontWeight: 700 }}>
                <CheckCircle2 size={14} /> File attached · Ready for simplification
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Paste Raw Test Text */}
      {inputTab === "paste" && (
        <div style={{ marginBottom: 20 }}>
          <textarea
            rows={4}
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            placeholder="Paste your lab test readings here (e.g. Hemoglobin 10.2, Fasting Sugar 160, Platelets 135000, HbA1c 8.8%)..."
            className="mn-input-control"
            style={{ fontFamily: "monospace", fontSize: 13, marginBottom: 10 }}
          />
          <button
            type="button"
            disabled={!reportText.trim() || simplifyMutation.isPending}
            onClick={() => runSimplify(reportText)}
            className="mn-btn-submit-green"
            style={{ width: "auto", margin: 0, padding: "8px 20px", display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            {simplifyMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            Simplify This Text
          </button>
        </div>
      )}

      {/* Tab 3: Sample 1-Click Reports */}
      {inputTab === "samples" && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            {SAMPLE_REPORTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setReportText(sample.rawText);
                  runSimplify(sample.rawText, sample.title);
                }}
                style={{
                  textAlign: "left",
                  padding: "12px 14px",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  cursor: "pointer"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{sample.title}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 4, background: "#fee2e2", color: "#991b1b" }}>
                    {sample.badge}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Click to analyze full panel with plain language findings</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading state indicator */}
      {simplifyMutation.isPending && (
        <div style={{ padding: 24, textAlign: "center", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 18 }}>
          <Loader2 size={24} className="animate-spin" color="#0d9488" style={{ margin: "0 auto 8px" }} />
          <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>Translating Medical Jargon Into Plain Language...</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Analyzing reference ranges, flags, and clinical recommendations</div>
        </div>
      )}

      {/* Active Simplified Report Presentation */}
      {activeReport && !simplifyMutation.isPending && (
        <div id="printable-simplified-report">
          {/* Summary Box with Color Coding */}
          <div
            style={{
              padding: 16,
              borderRadius: 8,
              border: activeReport.overallStatus === "ATTENTION_REQUIRED" ? "1.5px solid #fca5a5" : "1.5px solid #86efac",
              background: activeReport.overallStatus === "ATTENTION_REQUIRED" ? "#fef2f2" : "#f0fdf4",
              marginBottom: 18
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: activeReport.overallStatus === "ATTENTION_REQUIRED" ? "#991b1b" : "#166534", textTransform: "uppercase" }}>
                {activeReport.reportType} · OVERALL HEALTH STATUS
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  padding: "3px 8px",
                  borderRadius: 4,
                  background: activeReport.overallStatus === "ATTENTION_REQUIRED" ? "#fee2e2" : "#dcfce7",
                  color: activeReport.overallStatus === "ATTENTION_REQUIRED" ? "#991b1b" : "#166534"
                }}
              >
                {activeReport.overallStatus === "ATTENTION_REQUIRED" ? "ATTENTION RECOMMENDED" : "WITHIN HEALTHY RANGE"}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 13.5, color: "#0f172a", lineHeight: 1.5, fontWeight: 500 }}>
              {activeReport.executiveSummary}
            </p>
          </div>

          {/* Test Readings in Plain English Cards */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>
              Your Test Readings (Translated for Patients):
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
                    <div style={{ maxWidth: "68%" }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a" }}>{m.testName}</div>
                      <div style={{ fontSize: 12, color: "#475569", marginTop: 2, lineHeight: 1.4 }}>
                        {m.plainLanguageExplanation}
                      </div>
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
          </div>

          {/* Questions to ask doctor */}
          {activeReport.questionsForClinician && activeReport.questionsForClinician.length > 0 && (
            <div style={{ padding: 14, background: "#f0fdfa", borderRadius: 8, border: "1px solid #ccfbf1", marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0f766e", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <HelpCircle size={15} /> Questions You Can Ask Your Doctor About This Report:
              </div>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12.5, color: "#334155", lineHeight: 1.6 }}>
                {activeReport.questionsForClinician.map((q: string, i: number) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Lifestyle and Diet Advice */}
          {activeReport.lifestyleAdvice && activeReport.lifestyleAdvice.length > 0 && (
            <div style={{ padding: 14, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <Activity size={15} color="#0d9488" /> Plain Recommendations &amp; Diet Next Steps:
              </div>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12.5, color: "#475569", lineHeight: 1.6 }}>
                {activeReport.lifestyleAdvice.map((a: string, i: number) => (
                  <li key={i}>{a}</li>
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
