import React, { useState } from "react";
import { toast } from "sonner";
import {
  Stethoscope,
  Users,
  FileText,
  Video,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  Pill,
  AlertTriangle,
  User,
  Plus,
  RefreshCw,
} from "lucide-react";
import "../pages/dashboard-suite.css";

export default function DoctorConsoleView({
  doctorName = "Dr. Om Mishra",
  specialty = "Cardiology",
  onLaunchTelehealth,
}: {
  doctorName?: string;
  specialty?: string;
  onLaunchTelehealth?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [rxMedicine, setRxMedicine] = useState("Telmisartan 40mg Tablet");
  const [rxDosage, setRxDosage] = useState("1 tablet once daily");
  const [rxInstructions, setRxInstructions] = useState("After breakfast. Monitor BP.");
  const [rxIssued, setRxIssued] = useState<any[]>([
    {
      id: "RX-2026-881",
      patient: "Vittika Bairathi",
      date: "2026-10-26",
      medicine: "Telmisartan 40mg Tablet",
      dose: "1 tab daily after breakfast",
      status: "Active Therapy",
    },
    {
      id: "RX-2026-880",
      patient: "Rahul Sharma",
      date: "2026-10-22",
      medicine: "Amlodipine 5mg Tablet",
      dose: "1 tab daily morning",
      status: "Completed",
    },
  ]);

  const handleIssueRx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxMedicine) return;
    const newRx = {
      id: `RX-2026-${Math.floor(100 + Math.random() * 900)}`,
      patient: "Vittika Bairathi",
      date: new Date().toISOString().split("T")[0],
      medicine: rxMedicine,
      dose: rxDosage,
      status: "Active Therapy",
    };
    setRxIssued([newRx, ...rxIssued]);
    toast.success(`Digital prescription issued for ${newRx.patient}! Added to patient timeline.`);
  };

  return (
    <div className="mn-workspace-body">
      {/* Dark Sidebar */}
      <aside className="mn-dark-sidebar">
        <div className="mn-dark-sidebar-header-card">
          <div className="mn-dark-sidebar-shield">
            <Stethoscope size={18} />
          </div>
          <div className="mn-dark-sidebar-header-text">
            <span className="mn-dark-sidebar-title">{doctorName}</span>
            <span className="mn-dark-sidebar-sub">{specialty}</span>
            <span className="text-[9.5px] text-slate-400">DOC-001 · NMC-2010-4491</span>
          </div>
        </div>

        <button
          type="button"
          className={`mn-dark-nav-item ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <Stethoscope size={16} />
          <span>Clinical Overview</span>
        </button>

        <button
          type="button"
          className={`mn-dark-nav-item ${activeTab === "queue" ? "active" : ""}`}
          onClick={() => setActiveTab("queue")}
        >
          <Users size={16} />
          <span>My OPD Queue (2)</span>
        </button>

        <button
          type="button"
          className={`mn-dark-nav-item ${activeTab === "rx" ? "active" : ""}`}
          onClick={() => setActiveTab("rx")}
        >
          <Pill size={16} />
          <span>Digital Prescription Pad</span>
        </button>

        <button
          type="button"
          className={`mn-dark-nav-item ${activeTab === "telehealth" ? "active" : ""}`}
          onClick={() => setActiveTab("telehealth")}
        >
          <Video size={16} />
          <span>Telehealth Video Room</span>
        </button>

        <button
          type="button"
          className={`mn-dark-nav-item ${activeTab === "ai" ? "active" : ""}`}
          onClick={() => setActiveTab("ai")}
        >
          <Sparkles size={16} />
          <span>Gemini Clinical AI Brief</span>
        </button>
      </aside>

      {/* Main Doctor Stage */}
      <main className="mn-workspace-stage">
        {activeTab === "overview" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="mn-section-heading">Doctor Clinical Command</h1>
                <p className="mn-section-sub">
                  Cardiology Outpatient Clinic · Cardiology Block A, Room 204
                </p>
              </div>
              <button
                type="button"
                className="mn-btn-action-teal"
                onClick={onLaunchTelehealth}
              >
                <Video size={15} /> Launch Telehealth Call
              </button>
            </div>

            {/* 3 KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 block mb-1">SCHEDULED TODAY</span>
                <span className="text-2xl font-extrabold text-slate-900 block">4 Patients</span>
                <span className="text-xs text-emerald-600 font-semibold mt-1 block">2 In-Person · 2 Video</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 block mb-1">PATIENT REVIEWS</span>
                <span className="text-2xl font-extrabold text-amber-500 block">★ 4.9</span>
                <span className="text-xs text-slate-500 mt-1 block">142 Verified Consultations</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 block mb-1">ACTIVE RX THERAPIES</span>
                <span className="text-2xl font-extrabold text-[#0d9488] block">38 Issued</span>
                <span className="text-xs text-slate-500 mt-1 block">0 Adverse Drug Interactions</span>
              </div>
            </div>

            {/* Upcoming Patient Brief */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#0d9488] font-bold flex items-center justify-center">
                    VB
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Next Patient: Vittika Bairathi (PAT-011)</h3>
                    <p className="text-xs text-slate-500">Scheduled: 10:00 AM · In-Person Clinic</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  Ready in Waiting Area
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <strong>Gemini Clinical AI Follow-Up Brief:</strong> Patient was initiated on Telmisartan 40mg 10 days ago for elevated resting BP (130/84 mmHg). Adherence is 100%. Recorded home BP this morning: 120/80 mmHg. Normal sinus rhythm on recent ECG. Recommend continuation of therapy and lipid panel in 3 months.
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  className="mn-btn-action-teal"
                  onClick={() => setActiveTab("rx")}
                >
                  <Pill size={14} /> Open Prescription Pad
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "queue" && (
          <div>
            <div className="mb-5">
              <h1 className="mn-section-heading">My Outpatient Queue</h1>
              <p className="mn-section-sub">Confirmed appointments for today</p>
            </div>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-sm">Vittika Bairathi (PAT-011)</div>
                  <div className="text-xs text-slate-500">10:00 AM · In-Person Clinic · Blood Pressure Monitoring</div>
                </div>
                <button
                  type="button"
                  className="mn-btn-action-teal text-xs"
                  onClick={() => setActiveTab("rx")}
                >
                  Start Consult
                </button>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-sm">Rahul Sharma (PAT-001)</div>
                  <div className="text-xs text-slate-500">02:30 PM · Online Telehealth Video · ECG 2D Echo Review</div>
                </div>
                <button
                  type="button"
                  className="mn-btn-action-white text-xs"
                  onClick={onLaunchTelehealth}
                >
                  Join Call
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "rx" && (
          <div>
            <div className="mb-5">
              <h1 className="mn-section-heading">Digital Prescription Pad (Rx)</h1>
              <p className="mn-section-sub">
                Issue signed electronic prescriptions with CDSCO drug interaction checks
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 max-w-2xl mb-6">
              <form onSubmit={handleIssueRx} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Select Patient</label>
                  <select className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs">
                    <option>Vittika Bairathi (PAT-011)</option>
                    <option>Rahul Sharma (PAT-001)</option>
                    <option>Amit Verma (PAT-003)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Medication Name</label>
                  <input
                    type="text"
                    value={rxMedicine}
                    onChange={(e) => setRxMedicine(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs"
                    placeholder="e.g. Telmisartan 40mg Tablet"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Dosage &amp; Frequency</label>
                  <input
                    type="text"
                    value={rxDosage}
                    onChange={(e) => setRxDosage(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs"
                    placeholder="e.g. 1 tablet once daily"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Clinical Instructions</label>
                  <input
                    type="text"
                    value={rxInstructions}
                    onChange={(e) => setRxInstructions(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs"
                    placeholder="e.g. After breakfast. Avoid high sodium."
                  />
                </div>

                <button type="submit" className="mn-btn-action-teal w-full justify-center">
                  Sign &amp; Issue Digital Prescription
                </button>
              </form>
            </div>

            {/* Issued Prescriptions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Recently Issued Prescriptions</h3>
              <div className="space-y-2">
                {rxIssued.map((rx) => (
                  <div key={rx.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100 text-xs">
                    <div>
                      <span className="font-bold text-[#0d9488]">{rx.id}</span> · <span className="font-semibold text-slate-900">{rx.patient}</span>
                      <div className="text-slate-600 mt-0.5">{rx.medicine} — {rx.dose}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      {rx.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "telehealth" && (
          <div>
            <div className="mb-5">
              <h1 className="mn-section-heading">Telehealth Consultation Room</h1>
              <p className="mn-section-sub">Encrypted WebRTC high-definition clinical tele-consultation</p>
            </div>
            <div className="bg-slate-900 text-white rounded-2xl p-8 text-center max-w-xl">
              <Video size={48} className="text-[#2dd4bf] mx-auto mb-3" />
              <h3 className="font-bold text-base mb-2">Telehealth Consult Room #4 Active</h3>
              <p className="text-xs text-slate-400 mb-5">
                Ready for high-definition video with Rahul Sharma or Vittika Bairathi.
              </p>
              <button
                type="button"
                className="mn-btn-action-teal"
                onClick={onLaunchTelehealth}
              >
                Join Video Call Now
              </button>
            </div>
          </div>
        )}

        {activeTab === "ai" && (
          <div>
            <div className="mb-5">
              <h1 className="mn-section-heading">Gemini Clinical AI Briefing Assistant</h1>
              <p className="mn-section-sub">Multimodal diagnostic summary &amp; clinical recommendation</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 max-w-2xl leading-relaxed text-xs text-slate-700 space-y-3">
              <div className="font-bold text-slate-900 text-sm">Patient: Vittika Bairathi (PAT-011)</div>
              <p>
                <strong>Vitals Trend:</strong> BP stabilized from 130/84 mmHg to 120/80 mmHg over 10 days on Telmisartan 40mg. Resting pulse 72 bpm. SpO2 99%.
              </p>
              <p>
                <strong>Laboratory Data:</strong> Fasting blood glucose 95 mg/dL. HbA1c 5.4%. Lipid profile pending November review.
              </p>
              <p>
                <strong>Safety Verification:</strong> Zero contraindications with current medications. CDSCO batch compliance verified.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
