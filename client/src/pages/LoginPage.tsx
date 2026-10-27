import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import {
  ShieldCheck,
  Activity,
  HeartPulse,
  Sparkles,
  Lock,
  Mail,
  User,
  Stethoscope,
  Users,
  Building2,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Layers,
  HelpCircle,
  X,
} from "lucide-react";
import { useAuthUser, type AuthRole, type AuthUserType } from "@/contexts/AuthContext";
import { ensureDemoStore } from "@/lib/demoStore";
import "./dashboard-suite.css";

interface PersonaConfig {
  role: AuthRole;
  userType: AuthUserType;
  label: string;
  name: string;
  email: string;
  desc: string;
  badgeLabel: string;
}

const ROLES: Record<string, PersonaConfig> = {
  patient: {
    role: "patient",
    userType: "patient",
    label: "Login as Patient",
    name: "Vittika Bairathi",
    email: "vittikabairathi35@gmail.com",
    desc: "Book appointments, view prescriptions, and verify medicines with Gemini AI.",
    badgeLabel: "PATIENT",
  },
  doctor: {
    role: "doctor",
    userType: "doctor",
    label: "Login as Doctor",
    name: "Dr. Om Mishra",
    email: "om.mishra@mednexus.example",
    desc: "Manage OPD schedule, consultations, and digital prescriptions.",
    badgeLabel: "DOCTOR",
  },
  staff: {
    role: "hospital",
    userType: "staff",
    label: "Login as Hospital Staff",
    name: "Sister Sarita Thomas",
    email: "nurse001@mednexus.example",
    desc: "Front desk triage, patient check-in, beds, and shift task checklists.",
    badgeLabel: "STAFF",
  },
  admin: {
    role: "admin",
    userType: "staff",
    label: "Login as Administrator",
    name: "Dr. Arvind Swaminathan",
    email: "admin@mednexus.example",
    desc: "Doctor credentialing, bed allocations, inventory, and hospital oversight.",
    badgeLabel: "ADMIN",
  },
};

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { loginAs } = useAuthUser();

  const [selectedRoleKey, setSelectedRoleKey] = useState<string>("patient");
  const [email, setEmail] = useState(ROLES.patient.email);
  const [password, setPassword] = useState("DemoSecure!2026");
  const [loading, setLoading] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);

  const selectedPersona = ROLES[selectedRoleKey] || ROLES.patient;

  const handleSelectRole = (key: string) => {
    setSelectedRoleKey(key);
    const p = ROLES[key];
    if (p) {
      setEmail(p.email);
    }
  };

  const executeLogin = async (persona: PersonaConfig, customEmail?: string) => {
    setLoading(true);
    try {
      await ensureDemoStore();
    } catch {
      // Continue anyway with local auth
    }

    loginAs({
      name: persona.name,
      email: customEmail || persona.email,
      role: persona.role,
      userType: persona.userType,
      hospitalName: "MEDNEXUS General Hospital",
    });

    toast.success(`Welcome to MEDNEXUS AI, ${persona.name}!`);
    setLoading(false);
    setLocation("/app");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(selectedPersona, email);
  };

  return (
    <div className="mn-dark-page-bg">
      {/* Top Universal Navbar */}
      <div className="mn-top-announcement">
        <div className="mn-announcement-left">
          <span>MEDNEXUS General Hospital — Live Hospital Operations &amp; Telehealth Network</span>
        </div>
        <div className="mn-announcement-right">
          <Link href="/" className="mn-announcement-link">
            ← Back to Home
          </Link>
          <button
            type="button"
            className="mn-announcement-link"
            onClick={() => setShowDemoModal(true)}
          >
            <Sparkles size={12} /> Explore Demo Accounts
          </button>
        </div>
      </div>

      <div className="mn-dark-auth-wrapper">
        {/* Left Column: Brand & Value Props (Matches WhatsApp Image 8.54.16 PM) */}
        <div className="mn-dark-hero-left">
          <div className="mn-dark-network-badge">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>UNIFIED HOSPITAL PLATFORM</span>
          </div>

          <h1 className="mn-dark-hero-h1">
            One Network.
            <span className="mn-dark-teal-gradient">Smarter Healthcare.</span>
          </h1>

          <p className="mn-dark-hero-p">
            MEDNEXUS AI unites Patients, Doctors, Hospital Staff, and Administrators in one secure, seamless operational
            network. Real-time appointments, verified clinician credentialing, AI drug verification, and connected ICU bed
            coordination.
          </p>

          {/* 3 Dark Feature Cards */}
          <div className="mn-dark-features-stack">
            <div className="mn-dark-feature-card">
              <div className="mn-dark-feature-icon">
                <ShieldCheck size={18} />
              </div>
              <div className="mn-dark-feature-text">
                <h4>Strict Role-Based Hospital Access</h4>
                <p>Doctor &amp; Staff profiles require administrator authorization before activation.</p>
              </div>
            </div>

            <div className="mn-dark-feature-card">
              <div className="mn-dark-feature-icon">
                <Activity size={18} />
              </div>
              <div className="mn-dark-feature-text">
                <h4>Atomic Booking Engine &amp; Leave Protection</h4>
                <p>Prevents schedule collisions with real-time slot synchronization.</p>
              </div>
            </div>

            <div className="mn-dark-feature-card">
              <div className="mn-dark-feature-icon">
                <Sparkles size={18} />
              </div>
              <div className="mn-dark-feature-text">
                <h4>Multimodal Gemini Clinical AI</h4>
                <p>Medicine vision verification, dual-language report simplification, and clinical briefs.</p>
              </div>
            </div>
          </div>

          {/* Hackathon Evaluator 1-Click Logins Strip */}
          <div className="mn-dark-evaluator-bar">
            <div className="mn-dark-evaluator-title">
              <Sparkles size={14} className="text-emerald-400" />
              <span>Hackathon Evaluator 1-Click Logins:</span>
            </div>
            <div className="mn-dark-evaluator-pills">
              <button
                type="button"
                className="mn-dark-pill-btn"
                onClick={() => executeLogin(ROLES.admin)}
              >
                Admin Portal
              </button>
              <button
                type="button"
                className="mn-dark-pill-btn"
                onClick={() => executeLogin(ROLES.doctor)}
              >
                Doctor Portal
              </button>
              <button
                type="button"
                className="mn-dark-pill-btn"
                onClick={() => executeLogin(ROLES.staff)}
              >
                Staff Portal
              </button>
              <button
                type="button"
                className="mn-dark-pill-btn"
                onClick={() => executeLogin(ROLES.patient)}
              >
                Patient Portal
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Clean White Role Selection Card (Matches WhatsApp Image 8.54.16 & 8.56.29) */}
        <div className="mn-dark-auth-right">
          <div className="mn-dark-auth-card">
            {/* Top Brand & EKG Icon */}
            <div className="text-center mb-5">
              <div className="mn-auth-ekg-icon-badge mx-auto mb-2">
                <Activity size={22} className="text-[#0d9488]" />
              </div>
              <h2 className="mn-auth-brand-name">MEDNEXUS AI</h2>
              <div className="mn-auth-brand-tagline">One Network. Smarter Healthcare.</div>
              <p className="mn-auth-role-instruction">
                Select your authorized role to access your dedicated hospital portal
              </p>
            </div>

            {/* 1. SELECT HOSPITAL ROLE Title */}
            <div className="mn-section-step-label">1. SELECT HOSPITAL ROLE:</div>

            {/* 4 Interactive Role Cards in 2x2 Grid */}
            <div className="mn-role-tile-grid">
              {/* Patient */}
              <div
                className={`mn-role-tile ${selectedRoleKey === "patient" ? "active" : ""}`}
                onClick={() => handleSelectRole("patient")}
              >
                <div className="mn-role-tile-header">
                  <User size={16} className="mn-role-icon" />
                  <span className={`mn-role-dot ${selectedRoleKey === "patient" ? "selected" : ""}`} />
                </div>
                <div className="mn-role-tile-title">Login as Patient</div>
                <div className="mn-role-tile-desc">Book appointments, view prescriptions, and...</div>
              </div>

              {/* Doctor */}
              <div
                className={`mn-role-tile ${selectedRoleKey === "doctor" ? "active" : ""}`}
                onClick={() => handleSelectRole("doctor")}
              >
                <div className="mn-role-tile-header">
                  <Stethoscope size={16} className="mn-role-icon" />
                  <span className={`mn-role-dot ${selectedRoleKey === "doctor" ? "selected" : ""}`} />
                </div>
                <div className="mn-role-tile-title">Login as Doctor</div>
                <div className="mn-role-tile-desc">Manage OPD schedule, consultations, and digit...</div>
              </div>

              {/* Staff */}
              <div
                className={`mn-role-tile ${selectedRoleKey === "staff" ? "active" : ""}`}
                onClick={() => handleSelectRole("staff")}
              >
                <div className="mn-role-tile-header">
                  <Users size={16} className="mn-role-icon" />
                  <span className={`mn-role-dot ${selectedRoleKey === "staff" ? "selected" : ""}`} />
                </div>
                <div className="mn-role-tile-title">Login as Hospital Staff</div>
                <div className="mn-role-tile-desc">Front desk triage, patient check-in, beds, and...</div>
              </div>

              {/* Admin */}
              <div
                className={`mn-role-tile ${selectedRoleKey === "admin" ? "active" : ""}`}
                onClick={() => handleSelectRole("admin")}
              >
                <div className="mn-role-tile-header">
                  <Building2 size={16} className="mn-role-icon" />
                  <span className={`mn-role-dot ${selectedRoleKey === "admin" ? "selected" : ""}`} />
                </div>
                <div className="mn-role-tile-title">Login as Administrator</div>
                <div className="mn-role-tile-desc">Doctor credentialing, bed allocations, inventory...</div>
              </div>
            </div>

            {/* Selected Portal Indicator */}
            <div className="mn-selected-portal-strip">
              <span className="mn-selected-portal-label">Selected Portal:</span>
              <span className="mn-selected-portal-badge">{selectedPersona.label}</span>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              className="mn-btn-google"
              onClick={() => executeLogin(selectedPersona)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google as {selectedRoleKey === "patient" ? "Patient" : selectedRoleKey === "doctor" ? "Doctor" : selectedRoleKey === "staff" ? "Staff" : "Admin"}</span>
            </button>

            {/* Divider */}
            <div className="mn-auth-divider">OR EMAIL &amp; PASSWORD</div>

            {/* Form */}
            <form onSubmit={handleFormSubmit}>
              <div className="mn-form-group">
                <label className="mn-form-label">Email Address or Phone Number</label>
                <div className="mn-input-wrap">
                  <Mail size={16} className="mn-input-icon" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={`e.g. ${selectedPersona.email}`}
                    className="mn-input-control"
                  />
                </div>
              </div>

              <div className="mn-form-group">
                <div className="mn-form-label-row">
                  <label className="mn-form-label">Password</label>
                  <span className="text-[11px] text-slate-400">Default demo passwords accepted</span>
                </div>
                <div className="mn-input-wrap">
                  <Lock size={16} className="mn-input-icon" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mn-input-control"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mn-btn-submit-green"
              >
                {loading ? "Authenticating..." : `Sign In as ${selectedRoleKey === "patient" ? "Patient" : selectedRoleKey === "doctor" ? "Doctor" : selectedRoleKey === "staff" ? "Staff" : "Administrator"} →`}
              </button>
            </form>

            {/* Footer Navigation */}
            <div className="mn-auth-footer-dual">
              <div className="text-[12px] text-slate-500">
                Need a new {selectedRoleKey} account?{" "}
                <button
                  type="button"
                  className="text-[#0d9488] font-bold hover:underline"
                  onClick={() => executeLogin(selectedPersona)}
                >
                  Register as {selectedRoleKey.charAt(0).toUpperCase() + selectedRoleKey.slice(1)}
                </button>
              </div>

              <div className="mn-testing-4portals-strip">
                <span>Testing all 4 portals?</span>
                <button
                  type="button"
                  className="mn-try-demo-btn"
                  onClick={() => setShowDemoModal(true)}
                >
                  <Sparkles size={13} /> Try Demo Accounts
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Evaluator 1-Click Demo Modal */}
      {showDemoModal && (
        <div className="mn-evaluator-modal-backdrop" onClick={() => setShowDemoModal(false)}>
          <div className="mn-evaluator-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="mn-evaluator-modal-header">
              <h3>MEDNEXUS AI — 1-Click Evaluator Accounts</h3>
              <button
                type="button"
                className="mn-modal-close-btn"
                onClick={() => setShowDemoModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Select any verified hospital role to immediately launch into that dedicated console with live operational data.
            </p>

            <div className="mn-persona-card-grid">
              {Object.entries(ROLES).map(([key, p]) => (
                <div
                  key={key}
                  className="mn-persona-card"
                  onClick={() => executeLogin(p)}
                >
                  <div className="mn-persona-card-top">
                    <div className="mn-persona-avatar">
                      {p.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                    </div>
                    <span className={`mn-persona-badge mn-badge-${key}`}>{p.badgeLabel}</span>
                  </div>
                  <div className="mn-persona-name">{p.name}</div>
                  <div className="mn-persona-role">{p.desc}</div>
                  <div className="mn-persona-note">Launch {p.label} →</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
