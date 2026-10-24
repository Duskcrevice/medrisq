import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import {
  ShieldCheck,
  UserRound,
  Hospital,
  Stethoscope,
  ScanLine,
  LifeBuoy,
  ClipboardCheck,
  ArrowRight,
  LogIn,
  CheckCircle2,
  Mail,
  ChevronRight,
  Lock,
  ArrowLeft,
  Calendar,
  Sparkles,
  HeartPulse,
  WifiOff,
  Pill,
  BadgeAlert,
} from "lucide-react";
import { useAuthUser, type AuthRole, type AuthUserType } from "@/contexts/AuthContext";

interface PortalLoginGateProps {
  onSuccess?: () => void;
  redirectTo?: string;
  defaultType?: AuthUserType;
}

export default function PortalLoginGate({ onSuccess, redirectTo = "/app", defaultType = "doctor" }: PortalLoginGateProps) {
  const [, setLocation] = useLocation();
  const { loginAs } = useAuthUser();

  const [activeTab, setActiveTab] = useState<AuthUserType>(defaultType);

  // Doctor form state
  const [doctorName, setDoctorName] = useState("");
  const [doctorSpecialization, setDoctorSpecialization] = useState("General Physician");
  const [doctorRegNo, setDoctorRegNo] = useState("");
  const [doctorHospital, setDoctorHospital] = useState("Saint Elara Medical Centre");

  // Patient form state
  const [patientName, setPatientName] = useState("");
  const [patientAbha, setPatientAbha] = useState("");
  const [patientAllergies, setPatientAllergies] = useState("penicillin");
  const [patientHospital, setPatientHospital] = useState("Saint Elara Medical Centre");

  // Staff form state
  const [staffRole, setStaffRole] = useState<AuthRole>("hospital");
  const [staffName, setStaffName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [staffHospital, setStaffHospital] = useState("Saint Elara Medical Centre");

  const handleDoctorLogin = (name: string, spec = doctorSpecialization, reg = doctorRegNo, hospital = doctorHospital) => {
    const finalName = name.trim() || "Dr. Arjun Mehta";
    const finalReg = reg.trim() || "NMC-2016-4421";
    loginAs({
      name: finalName,
      role: "doctor",
      userType: "doctor",
      hospitalName: hospital,
      specialization: spec,
      registrationNumber: finalReg,
      openId: `doc-${finalName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
    });
    toast.success(`Welcome, ${finalName}! Authenticated as Clinician (${spec}).`);
    if (onSuccess) onSuccess();
    else setLocation("/app/rx-safety");
  };

  const handlePatientLogin = (name: string, allergies = patientAllergies, hospital = patientHospital) => {
    const finalName = name.trim() || "Rahul Kumar";
    const allergyList = allergies.split(",").map(s => s.trim()).filter(Boolean);
    loginAs({
      name: finalName,
      role: "patient",
      userType: "patient",
      hospitalName: hospital,
      patientAllergies: allergyList,
      openId: `patient-${finalName.toLowerCase().replace(/\s+/g, "-")}`,
    });
    toast.success(`Welcome back, ${finalName}! Signed in to Patient Care Portal.`);
    if (onSuccess) onSuccess();
    else setLocation("/app/report-simplifier");
  };

  const handleStaffLogin = (role: AuthRole, name?: string, hospital = staffHospital, empId?: string) => {
    const roleLabels: Record<AuthRole, string> = {
      hospital: "Sister Anjali (Field Nurse)",
      pharmacist: "Marcus Vance (Pharmacist)",
      coordinator: "Elena Rostova (Emergency Coordinator)",
      admin: "Network Administrator",
      patient: "Patient",
      doctor: "Clinician",
    };

    const finalName = name?.trim() || roleLabels[role] || "Staff Member";
    const finalEmpId = empId?.trim() || (role === "admin" ? "ADM-001" : "EMP-2024-0456");

    loginAs({
      name: finalName,
      role,
      userType: "staff",
      hospitalName: hospital,
      employeeId: finalEmpId,
      openId: `staff-${role}-${finalName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
    });

    toast.success(`Welcome, ${finalName}! Authenticated for ${hospital}.`);
    if (onSuccess) onSuccess();
    else if (role === "hospital") setLocation("/app/offline-sync");
    else setLocation(redirectTo);
  };

  return (
    <div className="portal-gate-wrapper">
      <div className="portal-gate-container">
        {/* Top brand & security kicker */}
        <div className="portal-gate-header">
          <Link href="/" className="brand-lockup">
            <span className="brand-mark"><span /></span>
            <span><strong>MedRisq</strong> <em>AI</em></span>
          </Link>
          <div className="portal-gate-security-badge">
            <Lock size={13} />
            <span>Healthcare Network · Role-Based Authentication Gateway</span>
          </div>
          <h1>Unified Clinical &amp; Operations Portal</h1>
          <p>
            Choose your designated access role below to enter specialized clinical workspaces, patient diagnostic portals, or emergency supply coordination desks.
          </p>
        </div>

        {/* 3-Way Role Switcher Tabs */}
        <div className="portal-gate-tabs" role="tablist" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          {/* Doctor Tab */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "doctor"}
            className={`portal-gate-tab ${activeTab === "doctor" ? "active" : ""}`}
            onClick={() => setActiveTab("doctor")}
          >
            <div className="tab-icon-wrap" style={{ background: "rgba(12, 139, 131, 0.15)", color: "var(--teal)" }}>
              <Stethoscope size={18} />
            </div>
            <div className="tab-text-wrap">
              <strong>Doctor / Clinician</strong>
              <small>Rx Safety (HT-01) &amp; Lab Review</small>
            </div>
          </button>

          {/* Patient Tab */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "patient"}
            className={`portal-gate-tab ${activeTab === "patient" ? "active" : ""}`}
            onClick={() => setActiveTab("patient")}
          >
            <div className="tab-icon-wrap patient-icon">
              <UserRound size={18} />
            </div>
            <div className="tab-text-wrap">
              <strong>Patient Portal</strong>
              <small>Report Simplifier (HT-02) &amp; Care</small>
            </div>
          </button>

          {/* Staff Tab */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "staff"}
            className={`portal-gate-tab ${activeTab === "staff" ? "active" : ""}`}
            onClick={() => setActiveTab("staff")}
          >
            <div className="tab-icon-wrap staff-icon">
              <Hospital size={18} />
            </div>
            <div className="tab-text-wrap">
              <strong>Staff &amp; Field Ops</strong>
              <small>Offline Sync (HT-03) &amp; Exchange</small>
            </div>
          </button>
        </div>

        {/* ==================================================================== */}
        {/* TAB 1: DOCTOR / CLINICIAN PORTAL */}
        {/* ==================================================================== */}
        {activeTab === "doctor" && (
          <div className="portal-gate-card">
            <div className="card-kicker-row">
              <span className="account-tag" style={{ background: "rgba(12, 139, 131, 0.15)", color: "var(--teal-dark)" }}>
                <Stethoscope size={13} /> Licensed Medical Practitioner
              </span>
              <span className="hipaa-note">Clinical Decision Support Enabled</span>
            </div>

            <div className="account-benefits">
              <div><CheckCircle2 size={15} /> <strong>HT-01:</strong> Prescribe with automated drug-drug interaction &amp; allergy checks</div>
              <div><CheckCircle2 size={15} /> <strong>HT-02:</strong> View patient lab findings with side-by-side reference ranges</div>
              <div><CheckCircle2 size={15} /> Real-time dosage ceiling safeguards for pediatric &amp; geriatric care</div>
            </div>

            {/* Quick 1-click Doctor profiles */}
            <div className="quick-profile-section">
              <span className="section-subtitle">Select a demo clinician persona (1-click instant login):</span>
              <div className="quick-profile-grid">
                <button
                  type="button"
                  className="quick-profile-btn"
                  onClick={() => handleDoctorLogin("Dr. Priya Nair", "Cardiologist", "NMC-2012-9843", "Saint Elara Medical Centre")}
                >
                  <div className="profile-avatar" style={{ background: "#0c8b83", color: "white" }}>PN</div>
                  <div className="profile-info">
                    <strong>Dr. Priya Nair</strong>
                    <span>Cardiologist · Saint Elara Medical Centre (NMC-2012-9843)</span>
                  </div>
                  <ArrowRight size={15} />
                </button>

                <button
                  type="button"
                  className="quick-profile-btn"
                  onClick={() => handleDoctorLogin("Dr. Arjun Mehta", "General Physician", "NMC-2016-4421", "Northbridge General Hospital")}
                >
                  <div className="profile-avatar" style={{ background: "#16384a", color: "white" }}>AM</div>
                  <div className="profile-info">
                    <strong>Dr. Arjun Mehta</strong>
                    <span>General Physician · Northbridge General (NMC-2016-4421)</span>
                  </div>
                  <ArrowRight size={15} />
                </button>

                <button
                  type="button"
                  className="quick-profile-btn"
                  onClick={() => handleDoctorLogin("Dr. Sneha Rao", "Neurologist", "NMC-2009-1123", "Saint Elara Medical Centre")}
                >
                  <div className="profile-avatar" style={{ background: "#784384", color: "white" }}>SR</div>
                  <div className="profile-info">
                    <strong>Dr. Sneha Rao</strong>
                    <span>Neurologist · Saint Elara Medical Centre (NMC-2009-1123)</span>
                  </div>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>

            <div className="or-divider"><span>or enter custom doctor credentials</span></div>

            {/* Custom Doctor Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleDoctorLogin(doctorName || "Dr. Arjun Mehta");
              }}
              className="gate-custom-form"
            >
              <div className="form-group">
                <label htmlFor="doctor-name">Clinician Full Name</label>
                <input
                  id="doctor-name"
                  type="text"
                  placeholder="e.g. Dr. Rohan Sengupta"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                />
              </div>

              <div className="form-row-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label htmlFor="doctor-spec">Clinical Specialty</label>
                  <select
                    id="doctor-spec"
                    value={doctorSpecialization}
                    onChange={(e) => setDoctorSpecialization(e.target.value)}
                  >
                    <option value="General Physician">General Physician</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="Orthopedic">Orthopedic Surgeon</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="doctor-reg">Medical Council Reg. No.</label>
                  <input
                    id="doctor-reg"
                    type="text"
                    placeholder="e.g. NMC-2024-8891"
                    value={doctorRegNo}
                    onChange={(e) => setDoctorRegNo(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="doctor-hospital">Hospital Affiliation</label>
                <select
                  id="doctor-hospital"
                  value={doctorHospital}
                  onChange={(e) => setDoctorHospital(e.target.value)}
                >
                  <option value="Saint Elara Medical Centre">Saint Elara Medical Centre</option>
                  <option value="Northbridge General Hospital">Northbridge General Hospital</option>
                  <option value="Meridian South Hospital">Meridian South Hospital</option>
                </select>
              </div>

              <button type="submit" className="button button-primary full-width gate-submit-btn">
                <LogIn size={16} /> Sign In as Doctor &amp; Launch Rx Safety Desk (HT-01)
              </button>
            </form>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: PATIENT PORTAL */}
        {/* ==================================================================== */}
        {activeTab === "patient" && (
          <div className="portal-gate-card">
            <div className="card-kicker-row">
              <span className="account-tag patient-tag">
                <UserRound size={13} /> Patient &amp; Community Member
              </span>
              <span className="hipaa-note">Private &amp; synthetic data mode</span>
            </div>

            <div className="account-benefits">
              <div><CheckCircle2 size={15} /> <strong>HT-02:</strong> Translate complex lab reports into plain language with side-by-side view</div>
              <div><CheckCircle2 size={15} /> Generate clinically sound questions for your next doctor consult</div>
              <div><CheckCircle2 size={15} /> Manage personal allergy profiles &amp; emergency medication passports</div>
            </div>

            {/* Quick 1-click profiles */}
            <div className="quick-profile-section">
              <span className="section-subtitle">Select a demo patient profile (with documented allergies):</span>
              <div className="quick-profile-grid">
                <button
                  type="button"
                  className="quick-profile-btn"
                  onClick={() => handlePatientLogin("Sneha Patel", "penicillin, beta-lactams", "Saint Elara Medical Centre")}
                >
                  <div className="profile-avatar">SP</div>
                  <div className="profile-info">
                    <strong>Sneha Patel (34y)</strong>
                    <span>Allergies: Penicillin · Saint Elara Medical Centre</span>
                  </div>
                  <ArrowRight size={15} />
                </button>

                <button
                  type="button"
                  className="quick-profile-btn"
                  onClick={() => handlePatientLogin("Aarav Roy (Child, 7y)", "none", "Northbridge General Hospital")}
                >
                  <div className="profile-avatar">AR</div>
                  <div className="profile-info">
                    <strong>Aarav Roy (Child, 20kg)</strong>
                    <span>Pediatric Profile · Northbridge General Hospital</span>
                  </div>
                  <ArrowRight size={15} />
                </button>

                <button
                  type="button"
                  className="quick-profile-btn"
                  onClick={() => handlePatientLogin("Meera Sen", "aspirin, nsaids", "Meridian South Hospital")}
                >
                  <div className="profile-avatar">MS</div>
                  <div className="profile-info">
                    <strong>Meera Sen (48y)</strong>
                    <span>Allergies: NSAIDs · Conditions: Osteoarthritis &amp; CKD</span>
                  </div>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>

            <div className="or-divider"><span>or enter custom patient profile</span></div>

            {/* Custom patient form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePatientLogin(patientName || "Rahul Kumar");
              }}
              className="gate-custom-form"
            >
              <div className="form-group">
                <label htmlFor="patient-name">Patient Full Name</label>
                <input
                  id="patient-name"
                  type="text"
                  placeholder="e.g. Rahul Kumar"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="patient-allergies" className="flex items-center gap-1">
                  <BadgeAlert size={13} className="text-rose-500" /> Documented Allergies (e.g. penicillin, sulfa)
                </label>
                <input
                  id="patient-allergies"
                  type="text"
                  placeholder="e.g. penicillin, aspirin, sulfa"
                  value={patientAllergies}
                  onChange={(e) => setPatientAllergies(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="patient-hospital">Preferred Health Facility</label>
                <select
                  id="patient-hospital"
                  value={patientHospital}
                  onChange={(e) => setPatientHospital(e.target.value)}
                >
                  <option value="Saint Elara Medical Centre">Saint Elara Medical Centre</option>
                  <option value="Northbridge General Hospital">Northbridge General Hospital</option>
                  <option value="Meridian South Hospital">Meridian South Hospital</option>
                </select>
              </div>

              <button type="submit" className="button button-primary full-width gate-submit-btn">
                <LogIn size={16} /> Sign In &amp; Launch Report Simplifier (HT-02)
              </button>
            </form>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: STAFF & FIELD OPERATIONS */}
        {/* ==================================================================== */}
        {activeTab === "staff" && (
          <div className="portal-gate-card">
            <div className="card-kicker-row">
              <span className="account-tag staff-tag">
                <ShieldCheck size={13} /> Authorized Healthcare Operations Staff
              </span>
              <span className="hipaa-note">Role-based operational access</span>
            </div>

            {/* Department role selector */}
            <div className="staff-role-selector">
              <span className="section-subtitle">Select your clinical/operational department:</span>
              <div className="role-pills-row">
                <button
                  type="button"
                  className={`role-pill ${staffRole === "hospital" ? "selected" : ""}`}
                  onClick={() => setStaffRole("hospital")}
                >
                  <WifiOff size={14} /> Field Health Worker (Offline Kit)
                </button>
                <button
                  type="button"
                  className={`role-pill ${staffRole === "pharmacist" ? "selected" : ""}`}
                  onClick={() => setStaffRole("pharmacist")}
                >
                  <ScanLine size={14} /> Pharmacist
                </button>
                <button
                  type="button"
                  className={`role-pill ${staffRole === "coordinator" ? "selected" : ""}`}
                  onClick={() => setStaffRole("coordinator")}
                >
                  <LifeBuoy size={14} /> Emergency Coordinator
                </button>
                <button
                  type="button"
                  className={`role-pill ${staffRole === "admin" ? "selected" : ""}`}
                  onClick={() => setStaffRole("admin")}
                >
                  <ClipboardCheck size={14} /> Administrator
                </button>
              </div>
            </div>

            {/* Quick 1-click profiles */}
            <div className="quick-profile-section">
              <span className="section-subtitle">Verified operational profiles (1-click sign-in):</span>
              <div className="quick-profile-grid">
                <button
                  type="button"
                  className="quick-profile-btn"
                  onClick={() => handleStaffLogin("hospital", "Sister Anjali (Field Nurse)", "PHC Remote Sub-centre Kalsi", "FIELD-NURSE-09")}
                >
                  <div className="profile-avatar staff-av" style={{ background: "#bf7b29" }}>SA</div>
                  <div className="profile-info">
                    <strong>Sister Anjali (Field Nurse)</strong>
                    <span>Offline Triage Kiosk · Healthcare Without Internet (HT-03)</span>
                  </div>
                  <ArrowRight size={15} />
                </button>

                <button
                  type="button"
                  className="quick-profile-btn"
                  onClick={() => handleStaffLogin("pharmacist", "Marcus Vance", "Metro Care Central", "PHARM-9912")}
                >
                  <div className="profile-avatar staff-av">MV</div>
                  <div className="profile-info">
                    <strong>Marcus Vance</strong>
                    <span>Chief Pharmacist · Medicine Safety &amp; Batch Verification</span>
                  </div>
                  <ArrowRight size={15} />
                </button>

                <button
                  type="button"
                  className="quick-profile-btn"
                  onClick={() => handleStaffLogin("coordinator", "Elena Rostova", "Regional Emergency Network", "COORD-8821")}
                >
                  <div className="profile-avatar staff-av">ER</div>
                  <div className="profile-info">
                    <strong>Elena Rostova</strong>
                    <span>Emergency Coordinator · Transfers &amp; Supply Coordination</span>
                  </div>
                  <ArrowRight size={15} />
                </button>

                <button
                  type="button"
                  className="quick-profile-btn"
                  onClick={() => handleStaffLogin("admin", "Admin System Desk", "Metro Care Governance", "ADM-001")}
                >
                  <div className="profile-avatar staff-av">AD</div>
                  <div className="profile-info">
                    <strong>Network Administrator</strong>
                    <span>Security Audit &amp; Approvals Lead</span>
                  </div>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>

            <div className="or-divider"><span>or enter custom staff credentials</span></div>

            {/* Custom staff form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleStaffLogin(staffRole, staffName || "Staff Member", staffHospital, employeeId);
              }}
              className="gate-custom-form"
            >
              <div className="form-group">
                <label htmlFor="staff-name">Staff Member Full Name</label>
                <input
                  id="staff-name"
                  type="text"
                  placeholder="e.g. Sister Anjali or Marcus Vance"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                />
              </div>

              <div className="form-row-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label htmlFor="staff-emp-id">Employee / Field ID</label>
                  <input
                    id="staff-emp-id"
                    type="text"
                    placeholder="EMP-2024-0456"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="staff-facility">Assigned Facility</label>
                  <select
                    id="staff-facility"
                    value={staffHospital}
                    onChange={(e) => setStaffHospital(e.target.value)}
                  >
                    <option value="Saint Elara Medical Centre">Saint Elara Medical Centre</option>
                    <option value="PHC Remote Sub-centre Kalsi">PHC Remote Sub-centre Kalsi (Offline Field)</option>
                    <option value="Northbridge General Hospital">Northbridge General Hospital</option>
                    <option value="Meridian South Hospital">Meridian South Hospital</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="button button-primary full-width gate-submit-btn">
                <LogIn size={16} /> Sign In as Operations Staff &amp; Open Workspace
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
