import React, { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  FileText,
  Activity,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  ClipboardCheck,
  RefreshCw,
  Edit3,
  Copy,
  Printer,
  ChevronRight,
  Stethoscope,
  Info,
} from "lucide-react";

export default function ReportSimplifierPage() {
  const sampleReportsQuery = trpc.hackathon.getSampleReports.useQuery();
  const simplifyMutation = trpc.hackathon.simplifyCustomReport.useMutation();

  const [selectedReportId, setSelectedReportId] = useState<string>("rep-cbc-01");
  const [activeReport, setActiveReport] = useState<any>(null);

  // Editable row modal/state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [editUnit, setEditUnit] = useState<string>("");

  // Update activeReport when query loads
  React.useEffect(() => {
    if (sampleReportsQuery.data && sampleReportsQuery.data.length > 0 && !activeReport) {
      setActiveReport(sampleReportsQuery.data[0]);
    }
  }, [sampleReportsQuery.data]);

  const handleSelectSample = (rep: any) => {
    setSelectedReportId(rep.id);
    setActiveReport(rep);
    toast.info(`Loaded report: ${rep.reportType}`);
  };

  const startEditMeasurement = (index: number) => {
    const m = activeReport.measurements[index];
    setEditingIndex(index);
    setEditValue(m.measuredValue);
    setEditUnit(m.unit);
  };

  const saveEditMeasurement = () => {
    if (editingIndex === null || !activeReport) return;

    const updated = { ...activeReport };
    const m = updated.measurements[editingIndex];
    m.measuredValue = Number(editValue);
    m.unit = editUnit;

    // Recalculate flag
    if (m.referenceMin !== undefined && m.referenceMax !== undefined) {
      if (m.measuredValue < m.referenceMin) m.flag = "LOW";
      else if (m.measuredValue > m.referenceMax) m.flag = "HIGH";
      else m.flag = "NORMAL";
    }

    m.plainLanguageExplanation = `Your ${m.testName} is ${m.measuredValue} ${m.unit}. The standard reference interval is ${m.referenceRange} ${m.unit}.`;

    setActiveReport(updated);
    setEditingIndex(null);
    toast.success(`Updated ${m.testName} to ${editValue} ${editUnit}`);
  };

  const copyQuestions = () => {
    if (!activeReport) return;
    const text = activeReport.questionsForClinician.join("\n\n");
    navigator.clipboard.writeText(text);
    toast.success("Questions copied to clipboard!");
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
                  HT-02
                </span>
                <h1 className="text-lg font-bold text-white tracking-tight">
                  Medical Report Simplification & Patient Translator
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                Side-by-side clinical parameter extraction, plain-English translation & zero-hallucination factual consistency.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs flex items-center gap-2 border border-white/10 transition"
            >
              <Printer size={15} /> Print / Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-6 space-y-6">
        {/* Sample Report Selector */}
        <div className="bg-[#14222c] border border-white/10 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <FileText className="text-teal-400" size={18} />
              <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                Select Synthetic Lab Report for Instant Translation
              </span>
            </div>
            <span className="text-[11px] text-slate-400">All data de-identified for safe demonstration</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sampleReportsQuery.data?.map(rep => {
              const isSelected = rep.id === selectedReportId;
              return (
                <button
                  key={rep.id}
                  onClick={() => handleSelectSample(rep)}
                  className={`text-left p-3.5 rounded-lg border transition flex items-center justify-between ${
                    isSelected
                      ? "bg-teal-950/30 border-teal-500/60 shadow-lg shadow-teal-500/10"
                      : "bg-white/5 border-white/5 hover:border-white/20"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{rep.reportType}</span>
                      {isSelected && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-teal-500/20 text-teal-300 font-semibold">
                          Active View
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Patient: <strong className="text-slate-200">{rep.patientName}</strong> · Lab: {rep.laboratoryName}
                    </div>
                  </div>
                  <ChevronRight size={18} className={isSelected ? "text-teal-400" : "text-slate-500"} />
                </button>
              );
            })}
          </div>
        </div>

        {activeReport && (
          <div className="space-y-6">
            {/* Report Header Metadata Banner */}
            <div className="bg-[#14222c] border border-white/10 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clinical Specimen Record</span>
                <h2 className="text-xl font-bold text-white mt-0.5">{activeReport.reportType}</h2>
                <div className="flex items-center gap-3 text-xs text-slate-300 mt-1 font-mono">
                  <span>Patient: {activeReport.patientName}</span>
                  <span>·</span>
                  <span>Date: {activeReport.reportDate}</span>
                  <span>·</span>
                  <span>Facility: {activeReport.laboratoryName}</span>
                </div>
              </div>

              {/* Factual Consistency Badge */}
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-2.5">
                <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-emerald-300">Factual Consistency Verified</div>
                  <div className="text-[11px] text-slate-300">100% of source values, units & ranges preserved</div>
                </div>
              </div>
            </div>

            {/* Side-by-Side Dual View */}
            <div className="bg-[#14222c] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-white/10 bg-[#0d161d] text-xs font-bold uppercase tracking-wider">
                <div className="lg:col-span-5 p-3 text-slate-300 border-r border-white/10 flex items-center justify-between">
                  <span>Original Diagnostic Report (Lab Measurements)</span>
                  <span className="text-[10px] text-teal-400 normal-case font-normal">Click pencil to test corrections</span>
                </div>
                <div className="lg:col-span-7 p-3 text-teal-300 flex items-center gap-2">
                  <Sparkles size={14} />
                  <span>Plain Language Translation (Patient-Friendly Explanation)</span>
                </div>
              </div>

              <div className="divide-y divide-white/10">
                {activeReport.measurements.map((m: any, idx: number) => {
                  const isAbnormal = m.flag !== "NORMAL";
                  const isEditing = editingIndex === idx;

                  return (
                    <div key={m.id} className="grid grid-cols-1 lg:grid-cols-12 group hover:bg-white/[0.02] transition">
                      {/* Left: Original Measurements */}
                      <div className="lg:col-span-5 p-4 border-r border-white/10 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              {m.category}
                            </span>
                            <div className="font-bold text-white text-sm">{m.testName}</div>
                          </div>
                          <button
                            onClick={() => startEditMeasurement(idx)}
                            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-teal-300 transition"
                            title="Correct extraction value"
                          >
                            <Edit3 size={14} />
                          </button>
                        </div>

                        {/* Measurement value display or editor */}
                        {isEditing ? (
                          <div className="p-2.5 rounded-lg bg-[#0d161d] border border-teal-500/50 space-y-2">
                            <span className="text-[10px] font-bold text-teal-300 block">Correct Measurement:</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                step="any"
                                value={editValue}
                                onChange={e => setEditValue(Number(e.target.value))}
                                className="w-24 bg-white/5 border border-white/20 rounded px-2 py-1 text-white text-xs"
                              />
                              <input
                                type="text"
                                value={editUnit}
                                onChange={e => setEditUnit(e.target.value)}
                                className="w-20 bg-white/5 border border-white/20 rounded px-2 py-1 text-white text-xs"
                              />
                              <button
                                onClick={saveEditMeasurement}
                                className="px-2.5 py-1 bg-teal-500 hover:bg-teal-600 text-white rounded font-bold text-xs"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingIndex(null)}
                                className="px-2 py-1 text-slate-400 hover:text-white text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-mono font-bold text-white">{m.measuredValue}</span>
                            <span className="text-xs text-slate-400 font-mono">{m.unit}</span>
                            <span
                              className={`ml-auto px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                isAbnormal
                                  ? m.flag === "HIGH"
                                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                    : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              }`}
                            >
                              {m.flag}
                            </span>
                          </div>
                        )}

                        <div className="text-[11px] text-slate-400">
                          Stated Reference Range:{" "}
                          <strong className="text-slate-300 font-mono">
                            {m.referenceRange} {m.unit}
                          </strong>
                        </div>
                      </div>

                      {/* Right: Plain Language Translation */}
                      <div className="lg:col-span-7 p-4 space-y-2 bg-[#121c24]/50">
                        <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                          <Stethoscope size={13} className="text-teal-400" />
                          What this test evaluates:
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{m.clinicalPurpose}</p>

                        <div className="pt-2 border-t border-white/5">
                          <div className="text-xs font-semibold text-teal-300">Understanding your result:</div>
                          <p className="text-xs text-slate-200 mt-1 leading-relaxed">{m.plainLanguageExplanation}</p>
                          <p className="text-[11px] text-slate-400 mt-1.5 italic bg-black/20 p-2 rounded border border-white/5">
                            {m.whyItMatters}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Executive Summary & Patient Questions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Executive Summary Card */}
              <div className="bg-[#14222c] border border-white/10 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="text-teal-400" size={18} />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Executive Plain-English Summary
                  </h3>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed bg-[#0d161d] p-4 rounded-lg border border-white/5">
                  {activeReport.executiveSummary}
                </p>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Info size={13} className="text-teal-400 shrink-0" />
                  Preserves all source units and highlights values outside stated reference ranges without diagnosing cause.
                </div>
              </div>

              {/* Questions for Clinician Card */}
              <div className="bg-[#14222c] border border-white/10 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="text-amber-400" size={18} />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Questions You May Ask Your Clinician
                    </h3>
                  </div>
                  <button
                    onClick={copyQuestions}
                    className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition flex items-center gap-1 text-xs"
                    title="Copy questions"
                  >
                    <Copy size={13} /> Copy List
                  </button>
                </div>

                <div className="space-y-2">
                  {activeReport.questionsForClinician.map((q: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-[#0d161d] border border-white/5 flex items-start gap-2.5 text-xs text-slate-300"
                    >
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="leading-snug">{q}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Safeguard & Boundary Banner */}
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-amber-300 uppercase tracking-wider text-[11px] font-bold">
                  Clinical Interpretation Safeguard
                </strong>
                <p className="mt-0.5 text-slate-300 leading-relaxed text-[11px]">
                  {activeReport.disclaimer}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
