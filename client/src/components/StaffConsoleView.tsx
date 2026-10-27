import React, { useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  CheckSquare,
  Calendar,
  UserCheck,
  Bed,
  Layers,
  AlertTriangle,
  RefreshCw,
  Search,
  CheckCircle2,
  Phone,
  Clock,
  ShieldAlert,
} from "lucide-react";
import "../pages/dashboard-suite.css";

// Operational Duty Checklist (Exact Image 8.55.37)
const INITIAL_DUTY_TASKS = [
  {
    id: 1,
    title: "Morning ICU telemetry & vitals synchronization",
    time: "Scheduled: 08:00 AM",
    priority: "High",
    completed: true,
  },
  {
    id: 2,
    title: "Discharge sanitation & bed turn-around for Bed BED-004",
    time: "Scheduled: 09:30 AM",
    priority: "Urgent",
    completed: true,
  },
  {
    id: 3,
    title: "Emergency ward crash cart medication replenishment",
    time: "Scheduled: 11:00 AM",
    priority: "High",
    completed: false,
  },
  {
    id: 4,
    title: "Wheelchair escort for incoming elderly cardiology patient",
    time: "Scheduled: 01:30 PM",
    priority: "Routine",
    completed: false,
  },
  {
    id: 5,
    title: "Cryogenic bulk oxygen vessel daily pressure gauge audit",
    time: "Scheduled: 04:00 PM",
    priority: "Routine",
    completed: false,
  },
  {
    id: 6,
    title: "Evening handover briefing with Night Shift Charge Nurse",
    time: "Scheduled: 07:30 PM",
    priority: "High",
    completed: false,
  },
];

// 42 beds for Bed Management (Image 8.55.57)
const STAFF_BEDS = Array.from({ length: 42 }, (_, i) => {
  const num = 101 + i;
  let ward = "General Male Ward";
  let type = "GENERAL";
  if (num <= 108) {
    ward = "Medical ICU";
    type = "ICU";
  } else if (num <= 114) {
    ward = "Surgical ICU";
    type = "ICU";
  } else if (num <= 120) {
    ward = "Emergency Trauma Bay";
    type = "EMERGENCY BAY";
  } else if (num <= 130) {
    ward = "General Male Ward";
    type = "GENERAL";
  } else {
    ward = "General Female Ward";
    type = "GENERAL";
  }

  let status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE" = "AVAILABLE";
  let ptName = "";
  if ([104, 108, 116, 120, 126, 128, 132, 136, 140].includes(num)) {
    status = "OCCUPIED";
    ptName = "Patient: Amit Verma";
  } else if ([105, 119, 133].includes(num)) {
    status = "OCCUPIED";
    ptName = "Patient: Vikram Joshi";
  } else if (num === 109) {
    status = "MAINTENANCE";
  }

  return {
    id: `BED-${num}`,
    ward,
    type,
    status,
    patient: ptName,
  };
});

export default function StaffConsoleView({
  onOpenBedMatrix,
}: {
  onOpenBedMatrix?: () => void;
}) {
  const [activeStaffTab, setActiveStaffTab] = useState<string>("overview");
  const [tasks, setTasks] = useState(INITIAL_DUTY_TASKS);
  const [beds, setBeds] = useState(STAFF_BEDS);
  const [searchQuery, setSearchQuery] = useState("");

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const freeBedsCount = beds.filter((b) => b.status === "AVAILABLE").length;

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
    toast.success("Duty checklist updated!");
  };

  const toggleBed = (id: string) => {
    setBeds((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          if (b.status === "AVAILABLE") {
            toast.success(`Allocated ${id} to admitting patient.`);
            return { ...b, status: "OCCUPIED", patient: "Patient: Admitted" };
          } else {
            toast.info(`Discharged patient from ${id}. Housekeeping dispatched for UV sanitize.`);
            return { ...b, status: "AVAILABLE", patient: "" };
          }
        }
        return b;
      })
    );
  };

  return (
    <div className="mn-workspace-body">
      {/* Dark Navy Staff Sidebar (Exact Image 8.55.30) */}
      <aside className="mn-dark-sidebar">
        <div className="mn-dark-sidebar-header-card">
          <div className="mn-dark-sidebar-shield">
            <span className="font-bold text-xs">STF</span>
          </div>
          <div className="mn-dark-sidebar-header-text">
            <span className="mn-dark-sidebar-title">Sister Sarita Thomas</span>
            <span className="mn-dark-sidebar-sub">Hospital Operations Team</span>
            <span className="text-[9.5px] text-slate-400">STF-001</span>
          </div>
        </div>

        {/* 7 Staff Navigation Items */}
        <button
          type="button"
          className={`mn-dark-nav-item ${activeStaffTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveStaffTab("overview")}
        >
          <Activity size={16} />
          <span>Overview</span>
        </button>

        <button
          type="button"
          className={`mn-dark-nav-item ${activeStaffTab === "tasks" ? "active" : ""}`}
          onClick={() => setActiveStaffTab("tasks")}
        >
          <CheckSquare size={16} />
          <span>Assigned Tasks ({pendingCount})</span>
        </button>

        <button
          type="button"
          className={`mn-dark-nav-item ${activeStaffTab === "appointments" ? "active" : ""}`}
          onClick={() => setActiveStaffTab("appointments")}
        >
          <Calendar size={16} />
          <span>Appointments (0)</span>
        </button>

        <button
          type="button"
          className={`mn-dark-nav-item ${activeStaffTab === "checkin" ? "active" : ""}`}
          onClick={() => setActiveStaffTab("checkin")}
        >
          <UserCheck size={16} />
          <span>Patient Check-In (0)</span>
        </button>

        <button
          type="button"
          className={`mn-dark-nav-item ${activeStaffTab === "beds" ? "active" : ""}`}
          onClick={() => setActiveStaffTab("beds")}
        >
          <Bed size={16} />
          <span>Bed Management ({freeBedsCount} Free)</span>
        </button>

        <button
          type="button"
          className={`mn-dark-nav-item ${activeStaffTab === "inventory" ? "active" : ""}`}
          onClick={() => setActiveStaffTab("inventory")}
        >
          <Layers size={16} />
          <span>Inventory</span>
        </button>

        <button
          type="button"
          className={`mn-dark-nav-item ${activeStaffTab === "emergency" ? "active" : ""}`}
          onClick={() => setActiveStaffTab("emergency")}
        >
          <AlertTriangle size={16} />
          <span>Emergency Requests (0)</span>
        </button>
      </aside>

      {/* Main Staff Workspace Stage */}
      <main className="mn-workspace-stage">
        {/* ============================================================
            1. OVERVIEW TAB (Exact Image 8.55.30)
            ============================================================ */}
        {activeStaffTab === "overview" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="mn-section-heading">Hospital Operational Staff Console</h1>
                <p className="mn-section-sub">MEDNEXUS General Hospital • Shift Status: On-Duty</p>
              </div>
              <button
                type="button"
                className="mn-btn-action-white text-xs"
                onClick={() => toast.success("Refreshed operational feed.")}
              >
                <RefreshCw size={13} /> Refresh Feed
              </button>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 block mb-1">TODAY'S OPD CHECK-INS</span>
                <span className="text-2xl font-extrabold text-slate-900 block">0</span>
                <span className="text-xs text-[#0d9488] font-semibold mt-1 block">Active Clinic Queue</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 block mb-1">AVAILABLE BEDS</span>
                <span className="text-2xl font-extrabold text-emerald-600 block">{freeBedsCount} / 66</span>
                <span className="text-xs text-slate-500 mt-1 block">23 Occupied</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 block mb-1">PENDING EMERGENCIES</span>
                <span className="text-2xl font-extrabold text-red-600 block">0</span>
                <span className="text-xs text-slate-500 mt-1 block">Ambulance &amp; Trauma Desk</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 block mb-1">ASSIGNED TASKS</span>
                <span className="text-2xl font-extrabold text-purple-600 block">{pendingCount} pending</span>
                <span className="text-xs text-slate-500 mt-1 block">{completedCount} Completed</span>
              </div>
            </div>

            {/* Protocol Notice & Emergency Hotline Row (Exact Image 8.55.30) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Shift Protocol Notice */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-900 text-sm">Shift Protocol Notice</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      ACTIVE DUTY
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    Hospital census is nominal. Ensure bed sanitation protocol is completed immediately upon patient discharge.
                    Monitor central cryogenic vessel pressure during the 4:00 PM telemetry log.
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    className="mn-btn-action-teal"
                    onClick={() => setActiveStaffTab("checkin")}
                  >
                    Go to Patient Check-In
                  </button>
                  <button
                    type="button"
                    className="mn-btn-action-white"
                    onClick={() => setActiveStaffTab("beds")}
                  >
                    View Bed Allocation Matrix
                  </button>
                  <button
                    type="button"
                    className="text-xs font-bold text-purple-700 px-3 py-2 rounded-lg bg-purple-50 hover:bg-purple-100"
                    onClick={() => setActiveStaffTab("tasks")}
                  >
                    Open Daily Checklist
                  </button>
                </div>
              </div>

              {/* Emergency Desk Hotline Dark Box (Image 8.55.30) */}
              <div className="mn-hotline-card-box">
                <div className="mn-hotline-title-teal">Emergency Desk Hotline</div>
                <div className="text-[11px] text-slate-300">Direct priority line to triage command:</div>
                <div className="mn-hotline-phone-num">011-4099-0000 / Ext 108</div>
                <div className="mn-hotline-sub-cmo">Duty Supervisor: Dr. Vikram Malhotra (Chief Medical Officer)</div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            2. ASSIGNED TASKS TAB (Exact Image 8.55.37)
            ============================================================ */}
        {activeStaffTab === "tasks" && (
          <div>
            <div className="mb-5">
              <h1 className="mn-section-heading">Operational Duty Checklist</h1>
              <p className="mn-section-sub">
                Track and check off daily nursing, ward maintenance, and triage assignments
              </p>
            </div>

            <div className="mn-duty-checklist-wrap">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`mn-duty-check-item ${task.completed ? "done" : ""}`}
                  onClick={() => toggleTask(task.id)}
                >
                  <div className="mn-duty-item-left">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="mn-duty-checkbox"
                    />
                    <div>
                      <div className="mn-duty-text-title">{task.title}</div>
                      <div className="mn-duty-text-time">{task.time}</div>
                    </div>
                  </div>
                  <span
                    className={`mn-priority-badge ${
                      task.priority === "Urgent"
                        ? "mn-prio-urgent"
                        : task.priority === "High"
                        ? "mn-prio-high"
                        : "mn-prio-routine"
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================
            3. APPOINTMENTS TAB (Image 8.55.45)
            ============================================================ */}
        {activeStaffTab === "appointments" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="mn-section-heading">Hospital Appointment Schedule</h1>
                <p className="mn-section-sub">All registered appointments across hospital departments</p>
              </div>
              <input
                type="text"
                placeholder="Search patient, doctor, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 px-4 rounded-xl border border-slate-300 text-xs w-64 focus:outline-none"
              />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">APPT #</th>
                    <th className="p-3">DATE &amp; TIME</th>
                    <th className="p-3">PATIENT</th>
                    <th className="p-3">DOCTOR &amp; SPECIALTY</th>
                    <th className="p-3">TYPE</th>
                    <th className="p-3">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-bold text-[#0d9488]">APT-101</td>
                    <td className="p-3">2026-10-26 10:00 AM</td>
                    <td className="p-3 font-bold">Vittika Bairathi</td>
                    <td className="p-3">Dr. Om Mishra (Cardiology)</td>
                    <td className="p-3">In-Person</td>
                    <td className="p-3 font-bold text-emerald-700">Confirmed</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================
            4. PATIENT CHECK-IN TAB (Image 8.55.55)
            ============================================================ */}
        {activeStaffTab === "checkin" && (
          <div>
            <div className="mb-5">
              <h1 className="mn-section-heading">Today's Patient Arrivals &amp; OPD Check-In</h1>
              <p className="mn-section-sub">Manage clinic queue arrivals, wristband scans, and initial triage</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No appointments scheduled for check-in right now</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Patients will appear here upon arriving at the hospital triage desk or verifying via mobile OTP.
              </p>
            </div>
          </div>
        )}

        {/* ============================================================
            5. BED MANAGEMENT TAB (Exact Image 8.55.57)
            ============================================================ */}
        {activeStaffTab === "beds" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="mn-section-heading">Bed Allocation Matrix</h1>
                <p className="mn-section-sub">
                  Prevent double-allocation; manage admission census and sanitation
                </p>
              </div>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
                Ward: All
              </span>
            </div>

            <div className="mn-bed-matrix-grid">
              {beds.map((b) => (
                <div
                  key={b.id}
                  className={`mn-bed-card ${b.status.toLowerCase()}`}
                  onClick={() => toggleBed(b.id)}
                >
                  <div className="mn-bed-card-top">
                    <span className="mn-bed-id">{b.id}</span>
                    <span className="mn-bed-type-badge">{b.type}</span>
                  </div>
                  <div className="mn-bed-ward-name">{b.ward}</div>
                  <div className="mn-bed-status-line">Status: {b.status}</div>
                  {b.patient && <div className="mn-bed-pt-name">{b.patient}</div>}
                  <button
                    type="button"
                    className="mn-bed-card-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBed(b.id);
                    }}
                  >
                    {b.status === "AVAILABLE" ? "Allocate Bed" : "Discharge & Sanitize"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================
            6. INVENTORY TAB
            ============================================================ */}
        {activeStaffTab === "inventory" && (
          <div>
            <div className="mb-5">
              <h1 className="mn-section-heading">Central Inventory Status</h1>
              <p className="mn-section-sub">Ward supply counts and oxygen telemetry</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 font-bold">CRYOGENIC OXYGEN</div>
                  <div className="text-xl font-extrabold text-slate-900 mt-1">14,200 L</div>
                  <div className="text-xs text-emerald-700 mt-1 font-semibold">● Tank Level 84% Nominal</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 font-bold">O2 CYLINDER MANIFOLD</div>
                  <div className="text-xl font-extrabold text-slate-900 mt-1">38 Cylinders</div>
                  <div className="text-xs text-emerald-700 mt-1 font-semibold">● Pressure 140 bar</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 font-bold">CRASH CART KITS</div>
                  <div className="text-xl font-extrabold text-slate-900 mt-1">6 Sealed Kits</div>
                  <div className="text-xs text-emerald-700 mt-1 font-semibold">● Next inspection tomorrow</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            7. EMERGENCY REQUESTS TAB (Image 8.55.59)
            ============================================================ */}
        {activeStaffTab === "emergency" && (
          <div>
            <div className="mb-5">
              <h1 className="mn-section-heading">Emergency Dispatch Command</h1>
              <p className="mn-section-sub">Direct triage command for cardiac &amp; trauma dispatches</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No pending emergency requests</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Incoming emergency ambulance requests will sound an audible alarm and populate here immediately.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
