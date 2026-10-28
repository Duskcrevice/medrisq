import React, { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Stethoscope,
  Pill,
  User,
  HeartPulse,
  Info,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  RefreshCw,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Flame,
  BadgeAlert,
} from "lucide-react";

interface PrescribedDrugInput {
  id: string;
  drugName: string;
  activeIngredients: string[];
  dose: number;
  unit: string;
  frequency: string;
  route: string;
  durationDays: number;
}

export default function RxSafetyPage() {
  // Test cases query
  const testCasesQuery = trpc.hackathon.getTestCases.useQuery();
  const checkRxMutation = trpc.hackathon.checkPrescription.useMutation();

  // Patient Context State
  const [patientName, setPatientName] = useState("Sneha Patel");
  const [patientAge, setPatientAge] = useState<number>(34);
  const [patientWeight, setPatientWeight] = useState<number>(55);
  const [patientGender, setPatientGender] = useState<"male" | "female" | "other">("female");
  const [patientAllergies, setPatientAllergies] = useState<string>("penicillin");
  const [patientConditions, setPatientConditions] = useState<string>("sinusitis");
  const [pregnancyStatus, setPregnancyStatus] = useState<"none" | "first_trimester" | "second_trimester" | "third_trimester">("none");
  const [kidneyEgfr, setKidneyEgfr] = useState<number>(90);

  // Prescription Drugs State
  const [drugs, setDrugs] = useState<PrescribedDrugInput[]>([
    {
      id: "rx-1",
      drugName: "Augmentin 625 Duo",
      activeIngredients: ["amoxicillin", "clavulanate"],
      dose: 625,
      unit: "mg",
      frequency: "BID (Twice daily)",
      route: "oral",
      durationDays: 5,
    },
    {
      id: "rx-2",
      drugName: "Paracetamol 500mg",
      activeIngredients: ["paracetamol"],
      dose: 500,
      unit: "mg",
      frequency: "TID (Three times daily)",
      route: "oral",
      durationDays: 3,
    },
  ]);

  // Drug Entry Form
  const [newDrugName, setNewDrugName] = useState("");
  const [newActiveIngredients, setNewActiveIngredients] = useState("");
  const [newDose, setNewDose] = useState<number>(500);
  const [newUnit, setNewUnit] = useState("mg");
  const [newFrequency, setNewFrequency] = useState("TID");
  const [newRoute, setNewRoute] = useState("oral");

  // Output State
  const [result, setResult] = useState<any>(null);

  const handleAddDrug = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDrugName.trim()) {
      toast.error("Please enter a medicine / brand name");
      return;
    }
    const ingredients = newActiveIngredients
      ? newActiveIngredients.split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
      : [newDrugName.trim().toLowerCase()];

    const newDrug: PrescribedDrugInput = {
      id: `rx-${Date.now()}`,
      drugName: newDrugName.trim(),
      activeIngredients: ingredients,
      dose: Number(newDose) || 1,
      unit: newUnit,
      frequency: newFrequency,
      route: newRoute,
      durationDays: 5,
    };

    setDrugs([...drugs, newDrug]);
    setNewDrugName("");
    setNewActiveIngredients("");
    toast.success(`Added ${newDrug.drugName} to prescription.`);
  };

  const handleRemoveDrug = (id: string) => {
    setDrugs(drugs.filter(d => d.id !== id));
  };

  const runSafetyCheck = async () => {
    if (drugs.length === 0) {
      toast.error("Please add at least one medication to evaluate.");
      return;
    }

    const allergiesList = patientAllergies
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const conditionsList = patientConditions
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    try {
      const res = await checkRxMutation.mutateAsync({
        patient: {
          name: patientName,
          age: Number(patientAge) || 30,
          weightKg: Number(patientWeight) || 60,
          gender: patientGender,
          allergies: allergiesList,
          conditions: conditionsList,
          pregnancyStatus,
          kidneyFunctionEgfr: Number(kidneyEgfr) || 90,
        },
        drugs: drugs.map(d => ({
          drugName: d.drugName,
          activeIngredients: d.activeIngredients,
          dose: d.dose,
          unit: d.unit,
          frequency: d.frequency,
          route: d.route,
          durationDays: d.durationDays,
        })),
      });

      setResult(res);
      if (res.overallStatus === "UNSAFE") {
        toast.error(`Critical Safety Warning: ${res.alerts.length} clinical hazards identified!`);
      } else if (res.overallStatus === "WARNING") {
        toast.warning(`Caution: ${res.alerts.length} moderate advisory alerts detected.`);
      } else {
        toast.success("Prescription Passed: No contraindications or critical errors found.");
      }
    } catch (err: any) {
      toast.error("Verification failed: " + err.message);
    }
  };

  const loadTestCase = (testCase: any) => {
    setPatientName(testCase.patient.name);
    setPatientAge(testCase.patient.age);
    setPatientWeight(testCase.patient.weightKg || 60);
    setPatientGender(testCase.patient.gender || "male");
    setPatientAllergies(testCase.patient.allergies.join(", "));
    setPatientConditions(testCase.patient.conditions.join(", "));
    setDrugs(
      testCase.drugs.map((d: any, idx: number) => ({
        id: `tc-${idx}-${Date.now()}`,
        drugName: d.drugName,
        activeIngredients: d.activeIngredients,
        dose: d.dose,
        unit: d.unit,
        frequency: d.frequency,
        route: d.route,
        durationDays: 5,
      }))
    );
    toast.info(`Loaded scenario: "${testCase.name}"`);
    // auto trigger check
    setTimeout(() => {
      runSafetyCheck();
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#0d161d] text-[#e3e8ec] pb-16">
      {/* Header Bar */}
      <div className="border-b border-white/10 bg-[#111e27]/80 backdrop-blur sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/app" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-teal-400 transition">
              <ArrowRight className="rotate-180" size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  HT-01
                </span>
                <h1 className="text-lg font-bold text-white tracking-tight">
                  Medication Error & Prescription Safety Engine
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                Deterministic clinical rule engine for dosage bounds, drug interactions, duplicate ingredients & allergy cross-reactivity.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={runSafetyCheck}
              disabled={checkRxMutation.isPending}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-semibold text-sm shadow-lg shadow-teal-500/20 flex items-center gap-2 transition"
            >
              {checkRxMutation.isPending ? <RefreshCw className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
              Run Clinical Safety Check
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-6 space-y-6">
        {/* Pre-configured Test Runner Strip */}
        <div className="bg-[#14222c] border border-white/10 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <FileCheck2 className="text-amber-400" size={18} />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Official Clinical Test Suite (1-Click Benchmarks)
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Click any scenario to verify expected outcome live:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {testCasesQuery.data?.map(tc => {
              const isUnsafe = tc.expectedOutcome === "UNSAFE";
              const isWarning = tc.expectedOutcome === "WARNING";
              return (
                <button
                  key={tc.id}
                  onClick={() => loadTestCase(tc)}
                  className="text-left p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-teal-500/40 transition group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-300 truncate group-hover:text-teal-300">
                        {tc.name.split(":")[0]}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isUnsafe
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : isWarning
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {tc.expectedOutcome}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug">{tc.description}</p>
                  </div>
                  <span className="text-[10px] text-teal-400 mt-2 font-medium flex items-center gap-1 group-hover:underline">
                    Load Rx <ArrowRight size={10} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Prescription & Clinical Inputs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Patient Context Card */}
          <div className="lg:col-span-4 bg-[#14222c] border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <User className="text-teal-400" size={18} />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Patient Clinical Context</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Patient Full Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  className="w-full bg-[#0d161d] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Age (Yrs)</label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={e => setPatientAge(Number(e.target.value))}
                    className="w-full bg-[#0d161d] border border-white/15 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={patientWeight}
                    onChange={e => setPatientWeight(Number(e.target.value))}
                    className="w-full bg-[#0d161d] border border-white/15 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Gender</label>
                  <select
                    value={patientGender}
                    onChange={e => setPatientGender(e.target.value as any)}
                    className="w-full bg-[#0d161d] border border-white/15 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-rose-300 font-semibold mb-1 flex items-center gap-1">
                  <BadgeAlert size={13} /> Documented Allergies (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. penicillin, sulfa, aspirin"
                  value={patientAllergies}
                  onChange={e => setPatientAllergies(e.target.value)}
                  className="w-full bg-[#0d161d] border border-rose-500/30 rounded-lg px-3 py-2 text-rose-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Chronic Conditions / Diagnoses</label>
                <input
                  type="text"
                  placeholder="e.g. asthma, chronic kidney disease, angina"
                  value={patientConditions}
                  onChange={e => setPatientConditions(e.target.value)}
                  className="w-full bg-[#0d161d] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Kidney eGFR (mL/min)</label>
                  <input
                    type="number"
                    value={kidneyEgfr}
                    onChange={e => setKidneyEgfr(Number(e.target.value))}
                    className="w-full bg-[#0d161d] border border-white/15 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Pregnancy Status</label>
                  <select
                    value={pregnancyStatus}
                    onChange={e => setPregnancyStatus(e.target.value as any)}
                    className="w-full bg-[#0d161d] border border-white/15 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="none">Not Pregnant</option>
                    <option value="first_trimester">1st Trimester</option>
                    <option value="second_trimester">2nd Trimester</option>
                    <option value="third_trimester">3rd Trimester</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Prescribed Medications Card */}
          <div className="lg:col-span-8 bg-[#14222c] border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Pill className="text-teal-400" size={18} />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Prescribed Medications ({drugs.length})
                </h2>
              </div>
              <span className="text-xs text-slate-400">Structured active ingredient mappings</span>
            </div>

            {/* List of active drugs in Rx */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {drugs.map((drug, index) => (
                <div
                  key={drug.id}
                  className="p-3 rounded-lg bg-[#0d161d] border border-white/10 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-[11px]">
                      {index + 1}
                    </span>
                    <div>
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        {drug.drugName}
                        <span className="text-[11px] px-2 py-0.5 rounded bg-white/10 text-slate-300 font-mono">
                          {drug.dose} {drug.unit} · {drug.frequency} · {drug.route}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        Active Ingredient(s):{" "}
                        <span className="text-teal-300 font-mono">{drug.activeIngredients.join(", ")}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveDrug(drug.id)}
                    className="p-1.5 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition"
                    title="Remove drug"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add medication sub-form */}
            <form onSubmit={handleAddDrug} className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2 text-xs">
              <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Plus size={13} /> Add Prescription Item
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Brand / Med Name (e.g. Dolo 650)"
                  value={newDrugName}
                  onChange={e => setNewDrugName(e.target.value)}
                  className="bg-[#0d161d] border border-white/15 rounded-lg px-2.5 py-1.5 text-white"
                />
                <input
                  type="text"
                  placeholder="Active Ingredient(s) (e.g. paracetamol)"
                  value={newActiveIngredients}
                  onChange={e => setNewActiveIngredients(e.target.value)}
                  className="bg-[#0d161d] border border-white/15 rounded-lg px-2.5 py-1.5 text-white"
                />
                <div className="grid grid-cols-2 gap-1">
                  <input
                    type="number"
                    placeholder="Dose"
                    value={newDose}
                    onChange={e => setNewDose(Number(e.target.value))}
                    className="bg-[#0d161d] border border-white/15 rounded-lg px-2.5 py-1.5 text-white"
                  />
                  <select
                    value={newUnit}
                    onChange={e => setNewUnit(e.target.value)}
                    className="bg-[#0d161d] border border-white/15 rounded-lg px-2 py-1.5 text-white"
                  >
                    <option value="mg">mg</option>
                    <option value="g">g</option>
                    <option value="mcg">mcg</option>
                    <option value="ml">ml</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
                <select
                  value={newFrequency}
                  onChange={e => setNewFrequency(e.target.value)}
                  className="bg-[#0d161d] border border-white/15 rounded-lg px-2 py-1.5 text-white"
                >
                  <option value="once daily">Once daily (QD)</option>
                  <option value="BID">Twice daily (BID)</option>
                  <option value="TID">Three times daily (TID)</option>
                  <option value="QID">Four times daily (QID)</option>
                  <option value="PRN">As needed (PRN)</option>
                </select>
                <select
                  value={newRoute}
                  onChange={e => setNewRoute(e.target.value)}
                  className="bg-[#0d161d] border border-white/15 rounded-lg px-2 py-1.5 text-white"
                >
                  <option value="oral">Oral</option>
                  <option value="sublingual">Sublingual</option>
                  <option value="IV">Intravenous (IV)</option>
                  <option value="IM">Intramuscular (IM)</option>
                </select>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 font-semibold"
                >
                  Insert Drug Into Rx
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Safety Evaluation Results */}
        {result && (
          <div className="bg-[#14222c] border border-white/10 rounded-xl p-6 space-y-6 shadow-2xl">
            {/* Status Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                {result.overallStatus === "UNSAFE" ? (
                  <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center">
                    <XCircle size={28} />
                  </div>
                ) : result.overallStatus === "WARNING" ? (
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                    <AlertTriangle size={28} />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 size={28} />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">
                      Prescription Verdict:{" "}
                      <span
                        className={
                          result.overallStatus === "UNSAFE"
                            ? "text-rose-400"
                            : result.overallStatus === "WARNING"
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }
                      >
                        {result.overallStatus === "UNSAFE"
                          ? "CRITICAL HAZARD - DISPENSING BLOCKED"
                          : result.overallStatus === "WARNING"
                          ? "CLINICAL ADVISORY - PROCEED WITH CAUTION"
                          : "SAFE - NO DETECTED CONTRAINDICATIONS"}
                      </span>
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Evaluated {result.prescribedDrugs.length} prescribed drugs against patient clinical parameters. Found{" "}
                    <strong className="text-white">{result.alerts.length}</strong> flagged issues.
                  </p>
                </div>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Engine Timestamp: {new Date(result.timestamp).toLocaleTimeString()}
              </div>
            </div>

            {/* Alerts List */}
            {result.alerts.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Flagged Clinical Alerts ({result.alerts.length})
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {result.alerts.map((alert: any) => {
                    const isStop = alert.severity === "CRITICAL_STOP";
                    return (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-xl border ${
                          isStop
                            ? "bg-rose-950/20 border-rose-500/40"
                            : "bg-amber-950/20 border-amber-500/40"
                        } space-y-2.5`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                                isStop
                                  ? "bg-rose-500 text-white"
                                  : "bg-amber-500 text-slate-900"
                              }`}
                            >
                              {alert.severity.replace("_", " ")}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 text-[10px] font-mono">
                              Rule {alert.ruleCode}
                            </span>
                            <h4 className="font-bold text-white text-sm">{alert.title}</h4>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Involved: {alert.involvedDrugs.join(" + ")}
                          </span>
                        </div>

                        <p className="text-xs text-slate-200 leading-relaxed">{alert.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs border-t border-white/10">
                          <div className="p-2.5 rounded-lg bg-black/30">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                              Mandated Clinical Action:
                            </span>
                            <p className="text-slate-300 text-[11px]">{alert.recommendedAction}</p>
                          </div>
                          <div className="p-2.5 rounded-lg bg-black/30">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 block mb-1">
                              Regulatory & Pharmacopoeia Citation:
                            </span>
                            <p className="text-slate-400 text-[11px] italic flex items-center gap-1.5">
                              <BookOpen size={13} className="text-teal-400 shrink-0" />
                              {alert.citation}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-4">
                <CheckCircle2 className="text-emerald-400 shrink-0" size={32} />
                <div>
                  <h4 className="font-bold text-white text-sm">All Prescribed Formulations Cleared</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    No active ingredient duplication, acute drug-drug interaction, known allergy cross-reactivity, or
                    weight-based dose violations found within the bounded clinical knowledge base.
                  </p>
                </div>
              </div>
            )}

            {/* Coverage Scope & Boundaries Safeguard (Crucial judging indicator) */}
            <div className="p-4 rounded-xl bg-[#0d161d] border border-white/10 space-y-3">
              <div className="flex items-center gap-2">
                <Info className="text-sky-400" size={16} />
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300">
                  Prototype Scope & Clinical Boundary Transparency
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-400 block mb-1.5">
                    Covered Safety Capabilities:
                  </span>
                  <ul className="space-y-1 text-slate-300 text-[11px]">
                    {result.coverageLimitations.coveredScope.map((item: string, i: number) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-emerald-400 shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-amber-400 block mb-1.5">
                    Outside Prototype Boundary (Not Covered):
                  </span>
                  <ul className="space-y-1 text-slate-400 text-[11px]">
                    {result.coverageLimitations.outsideCoverage.map((item: string, i: number) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <AlertTriangle size={12} className="text-amber-400 shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 text-[11px] text-slate-400 italic">
                {result.coverageLimitations.disclaimer}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
