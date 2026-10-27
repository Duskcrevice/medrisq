import React, { useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  Users,
  UserCheck,
  Calendar,
  Bed,
  Layers,
  Ambulance,
  Receipt,
  AlertTriangle,
  Settings,
  Plus,
  FileSpreadsheet,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  Phone,
  Flame,
  Check,
  TrendingUp,
  Cpu,
  ChevronRight,
} from "lucide-react";
import "../pages/dashboard-suite.css";

// 8 Verified Hospital Staff Members (Exact Image 8.54.50)
const HOSPITAL_STAFF_MEMBERS = [
  {
    id: "STF-001",
    name: "Sister Sarita Thomas",
    title: "Triage Head Nurse",
    department: "Emergency & Triage",
    shift: "Morning",
    duties: "Patient Check-In, Triage Assessment, Vitals Logging",
    email: "nurse001@mednexus.example",
    avatar: "ST",
  },
  {
    id: "STF-002",
    name: "Mahesh Bandopadhyaya",
    title: "Front Desk Lead",
    department: "Patient Reception",
    shift: "Morning",
    duties: "Patient Registration, Appointment Desk, Visitor Passes",
    email: "reception@mednexus.example",
    avatar: "MB",
  },
  {
    id: "STF-003",
    name: "Sister Blessy Varghese",
    title: "ICU Charge Nurse",
    department: "Intensive Care Unit",
    shift: "Rotational",
    duties: "ICU Bed Status, Ventilator Oversight, Nurse Handoff",
    email: "icu_lead@mednexus.example",
    avatar: "BV",
  },
  {
    id: "STF-004",
    name: "Deepak Chawla",
    title: "Bed Allocation Officer",
    department: "Hospital Admissions",
    shift: "Morning",
    duties: "Bed Census Management, Discharge Coordination, Transfer Allocation",
    email: "bed_allocator@mednexus.example",
    avatar: "DC",
  },
  {
    id: "STF-005",
    name: "Ramanathan G.",
    title: "Biomedical & Oxygen Engineer",
    department: "Biomedical Engineering",
    shift: "Morning",
    duties: "Liquid Oxygen Monitoring, Cylinder Manifold, Ventilator Calibration",
    email: "oxygen_tech@mednexus.example",
    avatar: "RG",
  },
  {
    id: "STF-006",
    name: "Pooja Bhatt",
    title: "Hospital Pharmacist In-Charge",
    department: "Central Pharmacy",
    shift: "Evening",
    duties: "Dispensing Verification, Surplus Auditing, Inventory Replenishment",
    email: "pharmacy@mednexus.example",
    avatar: "PB",
  },
  {
    id: "STF-007",
    name: "Vikramaditya Rathore",
    title: "Emergency Fleet Controller",
    department: "Ambulance & Disaster Ops",
    shift: "Rotational",
    duties: "Ambulance Dispatch, GPS Fleet Tracking, Inter-Hospital Coordination",
    email: "dispatcher@mednexus.example",
    avatar: "VR",
  },
  {
    id: "STF-008",
    name: "Gauri Shinde",
    title: "Hospital Billing Executive",
    department: "Finance & TPA Desk",
    shift: "Morning",
    duties: "Invoice Generation, Insurance TPA Processing, Discharge Clearances",
    email: "billing@mednexus.example",
    avatar: "GS",
  },
];

// Initial Bed Matrix (66 beds across ICU, Trauma, General wards - Exact Image 8.55.01)
const INITIAL_BEDS = Array.from({ length: 42 }, (_, i) => {
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

  // Preset some occupied beds matching Image 8.55.01
  let status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE" = "AVAILABLE";
  let ptName = "";
  if ([104, 108, 116, 120, 126, 128, 132, 136, 140].includes(num)) {
    status = "OCCUPIED";
    ptName = "Pt: Amit Verma";
  } else if ([105, 119, 133].includes(num)) {
    status = "OCCUPIED";
    ptName = "Pt: Vikram Joshi";
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

// Central Inventory (Exact Image 8.55.02)
const INITIAL_INVENTORY = [
  { name: "Telmisartan 40mg", category: "Cardiovascular", batch: "TLM-2026-08", stock: "1400 Tablets", price: "₹7.5", expiry: "2028-04-30", surplus: "Surplus: 400 Tablets" },
  { name: "Amlodipine 5mg", category: "Cardiovascular", batch: "AML-2025-11", stock: "950 Tablets", price: "₹4", expiry: "2027-11-30", surplus: "Regular Stock" },
  { name: "Paracetamol 650mg", category: "Analgesic / Antipyretic", batch: "PCM-2026-01", stock: "3200 Tablets", price: "₹2.2", expiry: "2028-08-31", surplus: "Regular Stock" },
  { name: "Amoxicillin + Clavulanic Acid 625mg (Augmentin)", category: "Antibiotic", batch: "AMX-2026-04", stock: "820 Tablets", price: "₹18.5", expiry: "2027-06-30", surplus: "Surplus: 200 Tablets" },
  { name: "Ceftriaxone 1g Injection", category: "Injectable Antibiotic", batch: "CFT-2026-09", stock: "420 Vials", price: "₹65", expiry: "2027-09-30", surplus: "Regular Stock" },
  { name: "Human Actrapid Insulin 100 IU/ml", category: "Endocrine / Diabetes", batch: "INS-2026-02", stock: "180 Vials", price: "₹180", expiry: "2027-03-31", surplus: "Regular Stock" },
  { name: "Enoxaparin Sodium 40mg / 0.4ml", category: "Anticoagulant", batch: "ENX-2026-07", stock: "220 Pre-filled Syringes", price: "₹340", expiry: "2027-07-31", surplus: "Regular Stock" },
  { name: "Pantoprazole 40mg IV", category: "Gastrointestinal", batch: "PAN-2026-03", stock: "650 Vials", price: "₹48", expiry: "2028-01-31", surplus: "Regular Stock" },
  { name: "Ondansetron 4mg/2ml", category: "Antiemetic", batch: "OND-2026-10", stock: "580 Ampoules", price: "₹12", expiry: "2027-10-31", surplus: "Regular Stock" },
  { name: "Noradrenaline Bitartrate 4mg/2ml", category: "Emergency / Vasopressor", batch: "NAD-2026-05", stock: "140 Ampoules", price: "₹75", expiry: "2027-05-31", surplus: "Regular Stock" },
  { name: "Atropine Sulphate 0.6mg/ml", category: "Emergency Resuscitation", batch: "ATR-2026-12", stock: "210 Ampoules", price: "₹8.5", expiry: "2028-06-30", surplus: "Regular Stock" },
  { name: "Budesonide 0.5mg Respules", category: "Pulmonary / Inhalation", batch: "BUD-2026-06", stock: "750 Respules", price: "₹22", expiry: "2027-12-31", surplus: "Surplus: 250 Respules" },
];

const BIOMEDICAL_EQUIPMENT = [
  { name: "Hamilton C6 Intensive Care Ventilator", category: "Mechanical Ventilation", batch: "VENT-004", stock: "8 Units", price: "₹14,50,000", expiry: "Annual Calib: Nov 2026", surplus: "Certified Active" },
  { name: "Mindray BeneView T8 Patient Monitor", category: "Hemodynamic Telemetry", batch: "MON-012", stock: "16 Units", price: "₹2,80,000", expiry: "Annual Calib: Jan 2027", surplus: "Certified Active" },
  { name: "B. Braun Infusomat Space Syringe Pump", category: "Precision Infusion", batch: "PUMP-088", stock: "24 Units", price: "₹65,000", expiry: "Annual Calib: Dec 2026", surplus: "Certified Active" },
  { name: "Philips HeartStart XL+ Biphasic Defibrillator", category: "Crash Cart Resuscitation", batch: "DEFIB-003", stock: "6 Units", price: "₹3,90,000", expiry: "Battery Tested: OK", surplus: "Emergency Ready" },
  { name: "AirSep NewLife Oxygen Concentrator 10L", category: "O2 Generation", batch: "OX-019", stock: "12 Units", price: "₹85,000", expiry: "Purity 95.2%", surplus: "High Yield" },
  { name: "Cryogenic Bulk Oxygen Tank Level Sensor", category: "Cryo Telemetry", batch: "CRY-LMO-1", stock: "14,200 L", price: "₹45/L", expiry: "Pressure: 11.2 bar", surplus: "Optimal Reserves" },
  { name: "Sonosite M-Turbo Point of Care Ultrasound", category: "Diagnostic Imaging", batch: "USG-002", stock: "2 Units", price: "₹18,00,000", expiry: "Probes Verified", surplus: "Trauma Ready" },
];

// Ambulance Fleet (Exact Image 8.55.03)
const AMBULANCE_FLEET = [
  { plate: "DL-01-HA-4021", type: "ALS Cardiac Unit", location: "MEDNEXUS Emergency Bay 1", driver: "Suresh Yadav (9899112233)", status: "Available" },
  { plate: "DL-01-HA-4022", type: "ALS Cardiac Unit", location: "MEDNEXUS Emergency Bay 2", driver: "Mohan Lal (9899112234)", status: "Available" },
  { plate: "DL-01-HA-3081", type: "BLS Transport", location: "Sub-Station South Gate", driver: "Ramesh Singh (9899112235)", status: "Available" },
  { plate: "DL-01-HA-3082", type: "BLS Transport", location: "Sub-Station East Gate", driver: "Praveen Kumar (9899112236)", status: "Available" },
  { plate: "DL-01-HA-5010", type: "Neonatal Emergency", location: "Pediatric Wing Courtyard", driver: "Jagdish Chandra (9899112237)", status: "Available" },
  { plate: "DL-01-HA-1100", type: "First Responder Van", location: "Central Ambulance Depot", driver: "Kailash Meena (9899112238)", status: "Available" },
];

// Billing Ledger (Exact Image 8.55.04)
const BILLING_LEDGER = [
  { invoice: "INV-2026-1001", date: "2026-10-12", patient: "Rahul Sharma", items: "Senior Consultant Cardiology In-Person Consultation (Dr. Om Mishra), Resting Electrocardiogram (ECG 12-lead)", amount: "₹1400", status: "Paid" },
  { invoice: "INV-2026-1002", date: "2026-10-14", patient: "Vittika Bairathi", items: "Specialist Dermatology Consultation (Dr. Ananya Sharma), Skin Allergy Patch Evaluation", amount: "₹750", status: "Paid" },
  { invoice: "INV-2026-1003", date: "2026-10-16", patient: "Amit Verma", items: "ICU Admission Day 1, Arterial Blood Gas (ABG), Continuous Bedside Hemodynamic Monitoring", amount: "₹18,500", status: "Pending" },
  { invoice: "INV-2026-1004", date: "2026-10-18", patient: "Priya Nair", items: "Comprehensive Lipid Profile, Glycated Hemoglobin HbA1c, Thyroid Stimulating Hormone (TSH)", amount: "₹1,250", status: "Paid" },
];

// Registered Patients (Image 8.54.56)
const PATIENT_DIRECTORY = [
  { id: "PAT-001", name: "Rahul Sharma", ageGender: "48 / M", bloodGroup: "B+", allergies: "Penicillin", chronic: "Hypertension, Hyperlipidemia", contact: "+91 98112 34501" },
  { id: "PAT-002", name: "Vittika Bairathi", ageGender: "32 / F", bloodGroup: "O+", allergies: "None reported", chronic: "None reported", contact: "+91 98765 43210" },
  { id: "PAT-003", name: "Amit Verma", ageGender: "56 / M", bloodGroup: "A+", allergies: "Sulfa drugs", chronic: "Type 2 Diabetes, Post-CABG", contact: "+91 98223 44556" },
  { id: "PAT-004", name: "Sunita Kapoor", ageGender: "61 / F", bloodGroup: "AB+", allergies: "Aspirin (NSAIDs)", chronic: "Osteoarthritis, Hypothyroidism", contact: "+91 98334 55667" },
  { id: "PAT-005", name: "Vikram Joshi", ageGender: "42 / M", bloodGroup: "O-", allergies: "Iodine contrast", chronic: "Bronchial Asthma", contact: "+91 98445 66778" },
  { id: "PAT-006", name: "Meera Deshmukh", ageGender: "29 / F", bloodGroup: "B-", allergies: "None reported", chronic: "Migraine", contact: "+91 98556 77889" },
  { id: "PAT-007", name: "Anil Kulkarni", ageGender: "51 / M", bloodGroup: "A-", allergies: "Ciprofloxacin", chronic: "Chronic Kidney Disease Stage 2", contact: "+91 98667 88990" },
  { id: "PAT-008", name: "Pooja Hegde", ageGender: "38 / F", bloodGroup: "O+", allergies: "Latex", chronic: "Hypothyroidism", contact: "+91 98778 99001" },
  { id: "PAT-009", name: "Deepak Patel", ageGender: "45 / M", bloodGroup: "B+", allergies: "None", chronic: "Hypertension", contact: "+91 98889 00112" },
  { id: "PAT-010", name: "Neelam Saxena", ageGender: "64 / F", bloodGroup: "AB-", allergies: "Amoxicillin", chronic: "Osteopenia, Essential Tremor", contact: "+91 98990 11223" },
];

export default function AdminConsoleView({
  onOpenInnovationLab,
  doctorsList,
}: {
  onOpenInnovationLab?: () => void;
  doctorsList: any[];
}) {
  const [activeAdminTab, setActiveAdminTab] = useState<string>("overview");
  const [beds, setBeds] = useState(INITIAL_BEDS);
  const [inventoryTab, setInventoryTab] = useState<"medicines" | "equipment">("medicines");
  const [searchDoctor, setSearchDoctor] = useState("");
  const [searchPatient, setSearchPatient] = useState("");

  const occupiedBedsCount = beds.filter((b) => b.status === "OCCUPIED").length;
  const availableBedsCount = beds.filter((b) => b.status === "AVAILABLE").length;

  const toggleBedStatus = (bedId: string) => {
    setBeds((prev) =>
      prev.map((b) => {
        if (b.id === bedId) {
          if (b.status === "AVAILABLE") {
            toast.success(`Allocated ${bedId} to emergency intake.`);
            return { ...b, status: "OCCUPIED", patient: "Pt: Admitted Patient" };
          } else {
            toast.info(`Discharged patient from ${bedId}. Commencing UV sanitization protocol.`);
            return { ...b, status: "AVAILABLE", patient: "" };
          }
        }
        return b;
      })
    );
  };

  return (
    <div className="mn-workspace-body">
      {/* Dark Navy Admin Sidebar (Image 8.54.42) */}
      <aside className="mn-dark-sidebar">
        <div className="mn-dark-sidebar-header-card">
          <div className="mn-dark-sidebar-shield">
            <ShieldCheck size={18} />
          </div>
          <div className="mn-dark-sidebar-header-text">
            <span className="mn-dark-sidebar-title">Admin Console</span>
            <span className="mn-dark-sidebar-sub">MEDNEXUS General Hospital</span>
          </div>
        </div>

        {/* Admin Navigation Items */}
        <button
          type="button"
          className={`mn-dark-nav-item ${activeAdminTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveAdminTab("overview")}
        >
          <Activity size={16} />
          <span>Overview</span>
        </button>

        <button
          type="button"
          className={`mn-dark-nav-item ${activeAdminTab === "doctors" ? "active" : ""}`}
          onClick={() => setActiveAdminTab("doctors")}
        >
          <UserCheck size={16} />
          <span>Doctors</span>
        </button>

        <button
          type="button"
          className={`mn-dark-nav-item ${activeAdminTab === "staff" ? "active" : ""}`}
          onClick={() => setActiveAdminTab("staff")}
        >
          <Users size={16} />
          <span>Staff</span>
        </button>

        <button
          type="button"
          className={`mn-dark-nav-item ${activeAdminTab === "patients" ? "active" : ""}`}
          onClick={() => setActiveAdminTab("patients")}
        >
          <Users size={16} />
          <span>Patients</span>
        </button>

        <button
          type="button"
          className={`mn-dark-nav-item ${activeAdminTab === "appointments" ? "active" : ""}`}
          onClick={() => setActiveAdminTab("appointments")}
        >
          <Calendar size={16} />
          <span>Appointments</span>
        </button>

        <button
          type="button"
          className={`mn-dark-nav-item ${activeAdminTab === "beds" ? "active" : ""}`}
          onClick={() => setActiveAdminTab("beds")}
        >
          <Bed size={16} />
          <span>Beds &amp; ICU</span>
        </button>

        <button
          type="button"
          className={`mn-dark-nav-item ${activeAdminTab === "inventory" ? "active" : ""}`}
          onClick={() => setActiveAdminTab("inventory")}
        >
          <Layers size={16} />
          <span>Inventory</span>
        </button>

        <button
          type="button"
          className={`mn-dark-nav-item ${activeAdminTab === "ambulance" ? "active" : ""}`}
          onClick={() => setActiveAdminTab("ambulance")}
        >
          <Ambulance size={16} />
          <span>Ambulance</span>
        </button>

        <button
          type="button"
          className={`mn-dark-nav-item ${activeAdminTab === "billing" ? "active" : ""}`}
          onClick={() => setActiveAdminTab("billing")}
        >
          <Receipt size={16} />
          <span>Billing</span>
        </button>

        <button
          type="button"
          className={`mn-dark-nav-item ${activeAdminTab === "emergency" ? "active" : ""}`}
          onClick={() => setActiveAdminTab("emergency")}
        >
          <AlertTriangle size={16} />
          <span>Emergency Coordination</span>
        </button>

        <button
          type="button"
          className={`mn-dark-nav-item ${activeAdminTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveAdminTab("settings")}
        >
          <Settings size={16} />
          <span>Settings</span>
        </button>

        {/* MORE TOOLS & MODULES */}
        <div className="mn-dark-sidebar-group-title">
          <span>MORE TOOLS &amp; MODULES</span>
        </div>

        <button
          type="button"
          className="mn-dark-nav-item"
          onClick={onOpenInnovationLab}
        >
          <Cpu size={16} className="text-[#2dd4bf]" />
          <span>Regional Innovation Lab</span>
        </button>
      </aside>

      {/* Main Workspace Stage */}
      <main className="mn-workspace-stage">
        {/* ============================================================
            1. OVERVIEW TAB (Exact Image 8.54.42)
            ============================================================ */}
        {activeAdminTab === "overview" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="mn-section-heading">Hospital Operations Console</h1>
                <p className="mn-section-sub">
                  Live operational snapshot of MEDNEXUS General Hospital resources and workflows
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#e6f7f3] text-[#0d9488] border border-[#bbf0e5]">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]" /> Database Synchronized
                </span>
                <button
                  type="button"
                  className="mn-btn-action-white text-xs"
                  onClick={() => toast.success("Hospital database sync refreshed!")}
                >
                  <RefreshCw size={13} /> Refresh Data
                </button>
              </div>
            </div>

            {/* 8 KPI Grid (Image 8.54.42) */}
            <div className="mn-admin-kpi-grid">
              <div className="mn-admin-kpi-card">
                <span className="mn-admin-kpi-label">Total Registered Patients</span>
                <span className="mn-admin-kpi-val">10</span>
                <span className="mn-admin-kpi-sub">Seeded Patient Records</span>
              </div>

              <div className="mn-admin-kpi-card">
                <span className="mn-admin-kpi-label">Total Doctors</span>
                <span className="mn-admin-kpi-val">{doctorsList.length}</span>
                <span className="mn-admin-kpi-sub">Across 20 Specialties</span>
              </div>

              <div className="mn-admin-kpi-card">
                <span className="mn-admin-kpi-label">Total Hospital Staff</span>
                <span className="mn-admin-kpi-val">8</span>
                <span className="mn-admin-kpi-sub">Nursing, ICU, Admissions</span>
              </div>

              <div className="mn-admin-kpi-card">
                <span className="mn-admin-kpi-label">Today's Appointments</span>
                <span className="mn-admin-kpi-val">4</span>
                <span className="mn-admin-kpi-sub">0 Pending confirmation</span>
              </div>

              <div className="mn-admin-kpi-card">
                <span className="mn-admin-kpi-label">Available Beds</span>
                <span className="mn-admin-kpi-val green">{availableBedsCount} / 66</span>
                <span className="mn-admin-kpi-sub">{occupiedBedsCount} currently occupied</span>
              </div>

              <div className="mn-admin-kpi-card">
                <span className="mn-admin-kpi-label">Available ICU Beds</span>
                <span className="mn-admin-kpi-val teal">9 Beds</span>
                <span className="mn-admin-kpi-sub">Ventilator Equipped</span>
              </div>

              <div className="mn-admin-kpi-card">
                <span className="mn-admin-kpi-label">Oxygen Inventory</span>
                <span className="mn-admin-kpi-val">14,200 L</span>
                <span className="mn-admin-kpi-sub">84% LMO Vessel + 38 Cylinders</span>
              </div>

              <div className="mn-admin-kpi-card">
                <span className="mn-admin-kpi-label">Pending Emergencies</span>
                <span className="mn-admin-kpi-val red">0</span>
                <span className="mn-admin-kpi-sub">Ambulance Triage Dispatch</span>
              </div>
            </div>

            {/* Action Shortcuts Strip */}
            <div className="mn-admin-actions-strip">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Administrator Direct Action Shortcuts</span>
                <span className="text-[11px] text-slate-500">Manage doctors, import CSV directories, coordinate emergency beds</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="mn-btn-action-teal"
                  onClick={() => setActiveAdminTab("doctors")}
                >
                  <Plus size={15} /> Add New Doctor
                </button>
                <button
                  type="button"
                  className="mn-btn-action-white"
                  onClick={() => toast.success("Imported 40 credentialed specialists from NMC repository!")}
                >
                  <FileSpreadsheet size={15} /> Bulk CSV Doctor Import
                </button>
              </div>
            </div>

            {/* Two Column Section: Recent Appointments & Bed Status By Ward */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Left: Recent Hospital Appointments */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold tracking-wider uppercase text-slate-600">RECENT HOSPITAL APPOINTMENTS</h3>
                  <button
                    type="button"
                    className="text-xs font-bold text-[#0d9488] hover:underline"
                    onClick={() => setActiveAdminTab("appointments")}
                  >
                    View All (4)
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                    <div>
                      <div className="text-sm font-bold text-slate-900">Dr. Om Mishra (Cardiology)</div>
                      <div className="text-xs text-slate-500">Patient: Rahul Sharma · 10:00 AM · Room 204</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      Confirmed
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                    <div>
                      <div className="text-sm font-bold text-slate-900">Dr. Arjun Mehta (Internal Medicine)</div>
                      <div className="text-xs text-slate-500">Patient: Vittika Bairathi · 02:30 PM · Telehealth</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                      Online Video
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Hospital Bed Status By Ward (Image 8.54.42) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold tracking-wider uppercase text-slate-600">HOSPITAL BED STATUS BY WARD</h3>
                  <button
                    type="button"
                    className="text-xs font-bold text-[#0d9488] hover:underline"
                    onClick={() => setActiveAdminTab("beds")}
                  >
                    Manage Beds
                  </button>
                </div>
                <div className="mn-ward-bar-row">
                  <div className="mn-ward-bar-item">
                    <div className="mn-ward-bar-header">
                      <span>Medical ICU</span>
                      <span>3 / 8 Beds (38%)</span>
                    </div>
                    <div className="mn-ward-bar-track">
                      <div className="mn-ward-bar-fill" style={{ width: "38%" }} />
                    </div>
                  </div>

                  <div className="mn-ward-bar-item">
                    <div className="mn-ward-bar-header">
                      <span>Surgical ICU</span>
                      <span>1 / 6 Beds (17%)</span>
                    </div>
                    <div className="mn-ward-bar-track">
                      <div className="mn-ward-bar-fill" style={{ width: "17%" }} />
                    </div>
                  </div>

                  <div className="mn-ward-bar-item">
                    <div className="mn-ward-bar-header">
                      <span>Emergency Trauma Bay</span>
                      <span>3 / 6 Beds (50%)</span>
                    </div>
                    <div className="mn-ward-bar-track">
                      <div className="mn-ward-bar-fill" style={{ width: "50%" }} />
                    </div>
                  </div>

                  <div className="mn-ward-bar-item">
                    <div className="mn-ward-bar-header">
                      <span>General Male Ward</span>
                      <span>6 / 16 Beds (38%)</span>
                    </div>
                    <div className="mn-ward-bar-track">
                      <div className="mn-ward-bar-fill" style={{ width: "38%" }} />
                    </div>
                  </div>

                  <div className="mn-ward-bar-item">
                    <div className="mn-ward-bar-header">
                      <span>General Female Ward</span>
                      <span>5 / 16 Beds (31%)</span>
                    </div>
                    <div className="mn-ward-bar-track">
                      <div className="mn-ward-bar-fill" style={{ width: "31%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            2. DOCTORS TAB (Image 8.54.46)
            ============================================================ */}
        {activeAdminTab === "doctors" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="mn-section-heading">Doctor Directory &amp; Credentialing</h1>
                <p className="mn-section-sub">
                  Manage medical staff, schedules, fees, active statuses, and portrait uploads
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="mn-btn-action-teal"
                  onClick={() => toast.success("Add doctor dialog ready.")}
                >
                  <Plus size={15} /> Add Doctor
                </button>
                <button
                  type="button"
                  className="mn-btn-action-white"
                  onClick={() => toast.success("Imported full verified credential pack (40 physicians)!")}
                >
                  <ShieldCheck size={15} /> Import Demo Doctor Pack
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-5">
              <input
                type="text"
                placeholder="Filter by Doctor Name, Specialty, or NMC ID (e.g. Om Mishra, NMC-2010)..."
                value={searchDoctor}
                onChange={(e) => setSearchDoctor(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0d9488]"
              />
            </div>

            {/* Doctors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctorsList
                .filter(
                  (d) =>
                    !searchDoctor ||
                    d.name.toLowerCase().includes(searchDoctor.toLowerCase()) ||
                    d.specialty.toLowerCase().includes(searchDoctor.toLowerCase())
                )
                .map((doc) => (
                  <div key={doc.id} className="bg-white p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#0d9488] bg-[#e6f7f3] px-2 py-0.5 rounded-full">
                        {doc.specialty}
                      </span>
                      <span className="text-xs font-bold text-slate-700">{doc.fee}</span>
                    </div>
                    <div className="font-bold text-slate-900 text-base">{doc.name}</div>
                    <div className="text-xs text-slate-500 mt-1">{doc.qualifications}</div>
                    <div className="text-xs text-slate-600 mt-2">
                      <span>Exp: {doc.experience}</span> · <span>NMC: {doc.nmc}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-emerald-700 font-bold">● Active OPD</span>
                      <span className="text-slate-500">{doc.hours}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ============================================================
            3. STAFF TAB (Image 8.54.50)
            ============================================================ */}
        {activeAdminTab === "staff" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="mn-section-heading">Hospital Staff Administration</h1>
                <p className="mn-section-sub">Duty roster, shifts, and departmental assignments</p>
              </div>
              <button
                type="button"
                className="mn-btn-action-teal"
                onClick={() => toast.success("New staff credential modal ready.")}
              >
                <Plus size={15} /> Add Staff Member
              </button>
            </div>

            <div className="mn-staff-grid-3">
              {HOSPITAL_STAFF_MEMBERS.map((staff) => (
                <div key={staff.id} className="mn-staff-member-card">
                  <div className="mn-staff-top-row">
                    <div className="mn-staff-avatar-circle">{staff.avatar}</div>
                    <div className="mn-staff-meta">
                      <h4>{staff.name}</h4>
                      <div className="mn-staff-title-teal">{staff.title}</div>
                      <div className="mn-staff-stf-id">{staff.id}</div>
                    </div>
                  </div>
                  <div className="mn-staff-detail-row">
                    <strong>Department:</strong> {staff.department}
                  </div>
                  <div className="mn-staff-detail-row">
                    <strong>Shift:</strong> {staff.shift}
                  </div>
                  <div className="mn-staff-detail-row">
                    <strong>Duties:</strong> {staff.duties}
                  </div>
                  <div className="mn-staff-detail-row text-slate-400 text-[11px] mt-2">
                    {staff.email}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================
            4. PATIENTS TAB (Image 8.54.56)
            ============================================================ */}
        {activeAdminTab === "patients" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="mn-section-heading">Registered Patient Directory</h1>
                <p className="mn-section-sub">Master patient index at MEDNEXUS General Hospital</p>
              </div>
              <input
                type="text"
                placeholder="Search by name, ID or condition..."
                value={searchPatient}
                onChange={(e) => setSearchPatient(e.target.value)}
                className="h-10 px-4 rounded-xl border border-slate-300 text-xs w-64 focus:outline-none"
              />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">PATIENT ID</th>
                    <th className="p-3">FULL NAME</th>
                    <th className="p-3">AGE / GENDER</th>
                    <th className="p-3">BLOOD GROUP</th>
                    <th className="p-3">KNOWN ALLERGIES</th>
                    <th className="p-3">CHRONIC CONDITIONS</th>
                    <th className="p-3">CONTACT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PATIENT_DIRECTORY.filter(
                    (p) =>
                      !searchPatient ||
                      p.name.toLowerCase().includes(searchPatient.toLowerCase()) ||
                      p.id.toLowerCase().includes(searchPatient.toLowerCase())
                  ).map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-[#0d9488]">{p.id}</td>
                      <td className="p-3 font-semibold text-slate-900">{p.name}</td>
                      <td className="p-3 text-slate-600">{p.ageGender}</td>
                      <td className="p-3 font-bold text-slate-800">{p.bloodGroup}</td>
                      <td className="p-3 text-red-600 font-medium">{p.allergies}</td>
                      <td className="p-3 text-slate-600">{p.chronic}</td>
                      <td className="p-3 text-slate-500">{p.contact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================
            5. APPOINTMENTS TAB (Image 8.55.00)
            ============================================================ */}
        {activeAdminTab === "appointments" && (
          <div>
            <div className="mb-5">
              <h1 className="mn-section-heading">Hospital Master Appointments</h1>
              <p className="mn-section-sub">
                Live booking ledger and scheduling status across all departments
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">APPT ID</th>
                    <th className="p-3">DATE &amp; TIME</th>
                    <th className="p-3">PATIENT</th>
                    <th className="p-3">ATTENDING DOCTOR</th>
                    <th className="p-3">TYPE</th>
                    <th className="p-3">CHIEF COMPLAINT</th>
                    <th className="p-3">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-bold text-[#0d9488]">APT-101</td>
                    <td className="p-3 text-slate-700">2026-10-26 · 10:00 AM</td>
                    <td className="p-3 font-bold text-slate-900">Vittika Bairathi</td>
                    <td className="p-3 text-slate-800">Dr. Om Mishra (Cardiology)</td>
                    <td className="p-3 text-slate-600">In-Person Clinic</td>
                    <td className="p-3 text-slate-600">Blood Pressure Monitoring &amp; Follow-Up</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Confirmed</span></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[#0d9488]">APT-102</td>
                    <td className="p-3 text-slate-700">2026-10-26 · 02:30 PM</td>
                    <td className="p-3 font-bold text-slate-900">Rahul Sharma</td>
                    <td className="p-3 text-slate-800">Dr. Arjun Mehta (Internal Medicine)</td>
                    <td className="p-3 text-slate-600">Online Telehealth Video</td>
                    <td className="p-3 text-slate-600">Post-viral recovery &amp; routine blood panel</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">Online Video</span></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[#0d9488]">APT-103</td>
                    <td className="p-3 text-slate-700">2026-10-27 · 11:30 AM</td>
                    <td className="p-3 font-bold text-slate-900">Amit Verma</td>
                    <td className="p-3 text-slate-800">Dr. Priya Nair (Cardiology)</td>
                    <td className="p-3 text-slate-600">In-Person Clinic</td>
                    <td className="p-3 text-slate-600">Echocardiogram 2D Doppler Assessment Review</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Confirmed</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================
            6. BEDS & ICU TAB (Exact Image 8.55.01)
            ============================================================ */}
        {activeAdminTab === "beds" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="mn-section-heading">Bed Allocation Matrix</h1>
                <p className="mn-section-sub">
                  Live ward census, occupancy tracking, and anti-double-booking controls
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  {availableBedsCount} Available
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-800 font-bold">
                  {occupiedBedsCount} Occupied
                </span>
              </div>
            </div>

            <div className="mn-bed-matrix-grid">
              {beds.map((b) => (
                <div
                  key={b.id}
                  className={`mn-bed-card ${b.status.toLowerCase()}`}
                  onClick={() => toggleBedStatus(b.id)}
                  title="Click to toggle bed status"
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
                      toggleBedStatus(b.id);
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
            7. INVENTORY TAB (Exact Image 8.55.02)
            ============================================================ */}
        {activeAdminTab === "inventory" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="mn-section-heading">Hospital Central Inventory</h1>
                <p className="mn-section-sub">
                  Track pharmaceutical stock, cold-chain stability, and biomedical equipment fleet
                </p>
              </div>
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    inventoryTab === "medicines"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                  onClick={() => setInventoryTab("medicines")}
                >
                  Pharmacy Medicines (12)
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    inventoryTab === "equipment"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                  onClick={() => setInventoryTab("equipment")}
                >
                  Biomedical Equipment (7)
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">NAME</th>
                    <th className="p-3">CATEGORY</th>
                    <th className="p-3">BATCH / SERIAL #</th>
                    <th className="p-3">CURRENT STOCK</th>
                    <th className="p-3">UNIT PRICE</th>
                    <th className="p-3">EXPIRY / CALIB</th>
                    <th className="p-3">RESCUE SURPLUS / STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(inventoryTab === "medicines" ? INITIAL_INVENTORY : BIOMEDICAL_EQUIPMENT).map(
                    (item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{item.name}</td>
                        <td className="p-3 text-slate-600">{item.category}</td>
                        <td className="p-3 font-mono text-slate-500">{item.batch}</td>
                        <td className="p-3 font-bold text-slate-800">{item.stock}</td>
                        <td className="p-3 text-slate-700">{item.price}</td>
                        <td className="p-3 text-slate-600">{item.expiry}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              item.surplus.includes("Surplus") || item.surplus.includes("Optimal")
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {item.surplus}
                          </span>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================
            8. AMBULANCE FLEET TAB (Exact Image 8.55.03)
            ============================================================ */}
        {activeAdminTab === "ambulance" && (
          <div>
            <div className="mb-5">
              <h1 className="mn-section-heading">Hospital Emergency Ambulance Fleet</h1>
              <p className="mn-section-sub">
                Live positioning, driver telemetry, and cardiac life support status
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {AMBULANCE_FLEET.map((amb, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-xs text-slate-800">{amb.plate}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {amb.status}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">{amb.type}</div>
                  <div className="text-xs text-slate-500 mt-1">Location: {amb.location}</div>
                  <div className="text-xs text-slate-600 mt-1">Driver: {amb.driver}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================
            9. BILLING TAB (Exact Image 8.55.04)
            ============================================================ */}
        {activeAdminTab === "billing" && (
          <div>
            <div className="mb-5">
              <h1 className="mn-section-heading">Hospital Billing &amp; Finance Ledger</h1>
              <p className="mn-section-sub">
                Invoices, consultation charges, payment records, and receipts
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">INVOICE #</th>
                    <th className="p-3">DATE</th>
                    <th className="p-3">PATIENT</th>
                    <th className="p-3">ITEMS</th>
                    <th className="p-3">AMOUNT</th>
                    <th className="p-3">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {BILLING_LEDGER.map((bill) => (
                    <tr key={bill.invoice} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-[#0d9488]">{bill.invoice}</td>
                      <td className="p-3 text-slate-600">{bill.date}</td>
                      <td className="p-3 font-semibold text-slate-900">{bill.patient}</td>
                      <td className="p-3 text-slate-700">{bill.items}</td>
                      <td className="p-3 font-bold text-slate-900">{bill.amount}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            bill.status === "Paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {bill.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================
            10. EMERGENCY COORDINATION TAB (Image 8.55.10)
            ============================================================ */}
        {activeAdminTab === "emergency" && (
          <div>
            <div className="mb-5">
              <h1 className="mn-section-heading">Incoming Emergency Dispatch Triage</h1>
              <p className="mn-section-sub">
                Live emergency requests requiring ambulance dispatch and bed coordination
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No active emergency requests pending</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Emergency trauma triage desk is operating at nominal levels. All 6 emergency bay ambulances and 9 ICU beds are synchronized.
              </p>
            </div>
          </div>
        )}

        {/* ============================================================
            11. SETTINGS TAB (Exact Image 8.55.16)
            ============================================================ */}
        {activeAdminTab === "settings" && (
          <div>
            <div className="mb-5">
              <h1 className="mn-section-heading">Hospital Configuration &amp; Architecture</h1>
              <p className="mn-section-sub">Core parameters of MEDNEXUS General Hospital</p>
            </div>

            <div className="max-w-2xl bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Hospital Name</label>
                <input
                  type="text"
                  readOnly
                  value="MEDNEXUS General Hospital"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
                />
                <span className="text-[10.5px] text-slate-400 mt-1 block">
                  Fixed invariant: The platform operates for a single hospital. All internal doctors and beds belong here.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Emergency Coordination Hotline</label>
                <input
                  type="text"
                  readOnly
                  value="011-4099-0000 / 108"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Database Engine</label>
                <input
                  type="text"
                  readOnly
                  value="Persistent JSON Store with Atomic Writes & Transactions"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
