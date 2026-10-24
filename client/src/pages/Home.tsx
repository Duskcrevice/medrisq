import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import {
  HeartPulse,
  Activity,
  CheckCircle2,
  Stethoscope,
  ShieldCheck,
  UserRound,
  Hospital,
  ArrowRight,
  PhoneCall,
  Sparkles,
  Lock,
  Mail,
  X,
  Pill,
  FileText,
  WifiOff,
} from "lucide-react";
import { ensureDemoStore, loginDemo, type DemoRole } from "@/lib/demoStore";
import { useAuthUser } from "@/contexts/AuthContext";
import "./dashboard-suite.css";

export default function Home() {
  const [, setLocation] = useLocation();
  const { loginAs } = useAuthUser();

  const [activeTab, setActiveTab] = useState<"signin" | "create">("signin");
  const [email, setEmail] = useState("vittikabairathi35@gmail.com");
  const [password, setPassword] = useState("PatientDemo!2026");
  const [loading, setLoading] = useState(false);
  const [showEvaluatorModal, setShowEvaluatorModal] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await ensureDemoStore();
      loginAs({
        name: "Vittika Bairathi",
        email: email || "vittikabairathi35@gmail.com",
        role: "patient",
        userType: "patient",
        hospitalName: "MEDNEXUS General Hospital",
      });
      toast.success("Welcome back, Vittika Bairathi!");
      setLocation("/app");
    } catch {
      loginAs({
        name: "Vittika Bairathi",
        email: "vittikabairathi35@gmail.com",
        role: "patient",
        userType: "patient",
        hospitalName: "MEDNEXUS General Hospital",
      });
      setLocation("/app");
    } finally {
      setLoading(false);
    }
  };

  const loginPersona = (
    name: string,
    emailAddress: string,
    role: "patient" | "doctor" | "hospital" | "admin",
    userType: "patient" | "doctor" | "staff",
    roleLabel: string
  ) => {
    loginAs({
      name,
      email: emailAddress,
      role,
      userType,
      hospitalName: "MEDNEXUS General Hospital",
    });
    toast.success(`Signed in as ${name} (${roleLabel})`);
    setShowEvaluatorModal(false);
    setLocation("/app");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* 1. Top Black / Dark Emerald Announcement Bar */}
      <div className="mn-top-announcement">
        <div className="mn-announcement-left">
          <span>MEDNEXUS General Hospital — Live Hospital Operations &amp; Telehealth Network</span>
        </div>
        <div className="mn-announcement-right">
          <button
            type="button"
            className="mn-announcement-link"
            onClick={() => toast.info("ZAPIA Voice Assistant: Multilingual triage hotline active")}
          >
            <PhoneCall size={12} /> ZAPIA Calling AI
          </button>
          <button
            type="button"
            className="mn-announcement-link"
            onClick={() => setShowEvaluatorModal(true)}
          >
            <Sparkles size={12} /> Explore Demo Accounts
          </button>
        </div>
      </div>

      {/* 2. Top Centered Brand Bar */}
      <header className="mn-center-brand-header">
        <h2 className="mn-center-brand-title">
          MEDNEXUS <span>AI</span>
        </h2>
      </header>

      {/* 3. Main 2-Column Hero Area */}
      <main className="mn-landing-container">
        {/* Left Column */}
        <section className="mn-hero-left">
          {/* Badge */}
          <div className="mn-secure-badge">
            <span className="mn-pulse-dot" />
            <span>SECURE HEALTHCARE NETWORK</span>
          </div>

          {/* Heading */}
          <h1 className="mn-hero-h1">
            One Network. Smarter
            <span className="mn-teal-word">Healthcare.</span>
          </h1>

          {/* Subtitle */}
          <p className="mn-hero-desc">
            Connecting patients, doctors, and hospitals through one intelligent healthcare platform. Unified
            appointments, digital prescriptions, verified medicines, and real-time emergency coordination for MEDNEXUS
            General Hospital.
          </p>

          {/* 4 Stat Boxes in a row */}
          <div className="mn-stat-grid-4">
            <div className="mn-stat-box">
              <span className="mn-stat-val">42</span>
              <span className="mn-stat-lbl">Specialist Doctors</span>
              <span className="mn-stat-sub">20 Clinical Depts</span>
            </div>
            <div className="mn-stat-box">
              <span className="mn-stat-val">66</span>
              <span className="mn-stat-lbl">Hospital Beds</span>
              <span className="mn-stat-sub">ICU &amp; Emergency</span>
            </div>
            <div className="mn-stat-box">
              <span className="mn-stat-val">14.2k L</span>
              <span className="mn-stat-lbl">Liquid Oxygen</span>
              <span className="mn-stat-sub">Optimal Reserves</span>
            </div>
            <div className="mn-stat-box">
              <span className="mn-stat-val">24/7</span>
              <span className="mn-stat-lbl">ZAPIA Voice AI</span>
              <span className="mn-stat-sub">Multilingual Triage</span>
            </div>
          </div>

          {/* 3 Checklist Items */}
          <div className="mn-checklist">
            <div className="mn-checklist-item">
              <CheckCircle2 size={16} />
              <div>
                <strong>Persistent Single Hospital Database:</strong> Actions in one account immediately update doctor,
                patient, and staff dashboards.
              </div>
            </div>
            <div className="mn-checklist-item">
              <CheckCircle2 size={16} />
              <div>
                <strong>Atomic Booking Engine:</strong> Real-time schedule generation with strict double-booking and
                doctor-leave prevention.
              </div>
            </div>
            <div className="mn-checklist-item">
              <CheckCircle2 size={16} />
              <div>
                <strong>Multimodal Gemini Clinical AI:</strong> Medicine vision verification, report simplifier (English
                &amp; Hindi), and clinician follow-up briefing.
              </div>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="mn-hero-actions-row">
            <button
              type="button"
              className="mn-btn-pill-dark"
              onClick={() => setShowEvaluatorModal(true)}
            >
              <Sparkles size={15} /> Explore Demo Accounts
            </button>
            <button
              type="button"
              className="mn-btn-pill-outline"
              onClick={() => toast.info("ZAPIA Voice Assistant hotline online. Direct clinical triage ready.")}
            >
              <PhoneCall size={15} /> Test ZAPIA Voice Assistant
            </button>
          </div>
        </section>

        {/* Right Column: Floating Auth Card */}
        <section className="mn-auth-card-wrap">
          <div className="mn-auth-card">
            {/* Header */}
            <div className="mn-auth-header">
              <h2 className="mn-auth-title">Welcome to MEDNEXUS AI</h2>
              <div className="mn-auth-icon-badge">
                <Activity size={18} />
              </div>
            </div>
            <p className="mn-auth-subtitle">Single secure portal for Administrators, Doctors, Staff, and Patients</p>

            {/* Google Button */}
            <button
              type="button"
              className="mn-btn-google"
              onClick={() => loginPersona("Vittika Bairathi", "vittikabairathi35@gmail.com", "patient", "patient", "Patient")}
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
              Continue with Google
            </button>

            {/* Divider */}
            <div className="mn-auth-divider">OR MANUAL HOSPITAL ACCESS</div>

            {/* Segmented Sign In / Create Account Tabs */}
            <div className="mn-segmented-tabs">
              <button
                type="button"
                className={`mn-segmented-btn ${activeTab === "signin" ? "active" : ""}`}
                onClick={() => setActiveTab("signin")}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`mn-segmented-btn ${activeTab === "create" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("create");
                  toast.info("Registration ready: Select a demo persona to test live accounts immediately.");
                }}
              >
                Create Account
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSignIn}>
              <div className="mn-form-group">
                <div className="mn-form-label-row">
                  <label className="mn-form-label">Email Address</label>
                </div>
                <div className="mn-input-wrap">
                  <Mail size={16} className="mn-input-icon" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@mednexus.example"
                    className="mn-input-control"
                  />
                </div>
              </div>

              <div className="mn-form-group">
                <div className="mn-form-label-row">
                  <label className="mn-form-label">Password</label>
                  <a
                    href="#reset"
                    className="mn-forgot-link"
                    onClick={e => {
                      e.preventDefault();
                      toast.info("Demo reset: Password is auto-authenticated for demo accounts.");
                    }}
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="mn-input-wrap">
                  <Lock size={16} className="mn-input-icon" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mn-input-control"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="mn-btn-submit-green">
                Sign in to Network <ArrowRight size={16} />
              </button>
            </form>

            {/* Evaluator Footer */}
            <div className="mn-card-evaluator-foot">
              <span>Hackathon Evaluator?</span>
              <button
                type="button"
                className="mn-btn-1click-trigger"
                onClick={() => setShowEvaluatorModal(true)}
              >
                <Sparkles size={13} /> Use 1-Click Demo Logins
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* 4. Bottom Footer */}
      <footer className="mn-landing-footer">
        <div>MEDNEXUS AI — One Intelligent Network. Connected Healthcare. Demo Hospital: MEDNEXUS General Hospital.</div>
        <div>Clinical Grade Security · CDSCO Formulary Standards · Google AI Studio Powered</div>
      </footer>

      {/* 5. 1-Click Evaluator Persona Modal */}
      {showEvaluatorModal && (
        <div
          className="mn-evaluator-modal-backdrop"
          onClick={e => {
            if (e.target === e.currentTarget) setShowEvaluatorModal(false);
          }}
        >
          <div className="mn-evaluator-modal-content">
            <div className="mn-evaluator-modal-header">
              <h3>Select 1-Click Evaluator Account</h3>
              <button
                type="button"
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
                onClick={() => setShowEvaluatorModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ margin: "0 0 16px 0", fontSize: 13, color: "#64748b" }}>
              Instant one-click access into dedicated role workspaces matching the hackathon scenarios:
            </p>

            <div className="mn-persona-card-grid">
              {/* Persona 1: Patient Vittika Bairathi */}
              <div
                className="mn-persona-card"
                onClick={() => loginPersona("Vittika Bairathi", "vittikabairathi35@gmail.com", "patient", "patient", "Patient")}
              >
                <div className="mn-persona-card-top">
                  <div className="mn-persona-avatar">VB</div>
                  <div>
                    <div className="mn-persona-name">Vittika Bairathi</div>
                    <div className="mn-persona-role">PAT-011 · Cardiology Follow-up</div>
                  </div>
                  <span className="mn-persona-badge mn-badge-patient">Patient</span>
                </div>
                <div className="mn-persona-note">Opens patient dashboard with 12 sections &amp; booking</div>
              </div>

              {/* Persona 2: Doctor Dr. Arjun Mehta */}
              <div
                className="mn-persona-card"
                onClick={() => loginPersona("Dr. Arjun Mehta", "arjun.mehta@mednexus.demo", "doctor", "doctor", "Doctor")}
              >
                <div className="mn-persona-card-top">
                  <div className="mn-persona-avatar" style={{ background: "#059669" }}>AM</div>
                  <div>
                    <div className="mn-persona-name">Dr. Arjun Mehta</div>
                    <div className="mn-persona-role">Cardiologist · NMC-2016-4421</div>
                  </div>
                  <span className="mn-persona-badge mn-badge-doctor">Doctor</span>
                </div>
                <div className="mn-persona-note">Opens doctor consultation &amp; HT-01 Rx Safety</div>
              </div>

              {/* Persona 3: Staff Sister Anjali */}
              <div
                className="mn-persona-card"
                onClick={() => loginPersona("Sister Anjali", "staff@mednexus.demo", "hospital", "staff", "Staff")}
              >
                <div className="mn-persona-card-top">
                  <div className="mn-persona-avatar" style={{ background: "#d97706" }}>SA</div>
                  <div>
                    <div className="mn-persona-name">Sister Anjali</div>
                    <div className="mn-persona-role">Field Health Worker · Kalsi PHC</div>
                  </div>
                  <span className="mn-persona-badge mn-badge-staff">Staff</span>
                </div>
                <div className="mn-persona-note">Opens HT-03 Offline Sync &amp; Bed Management</div>
              </div>

              {/* Persona 4: Administrator */}
              <div
                className="mn-persona-card"
                onClick={() => loginPersona("Hospital Administrator", "admin@mednexus.demo", "admin", "staff", "Administrator")}
              >
                <div className="mn-persona-card-top">
                  <div className="mn-persona-avatar" style={{ background: "#7c3aed" }}>AD</div>
                  <div>
                    <div className="mn-persona-name">Chief Administrator</div>
                    <div className="mn-persona-role">Hospital Operations &amp; Doctor Roster</div>
                  </div>
                  <span className="mn-persona-badge mn-badge-admin">Admin</span>
                </div>
                <div className="mn-persona-note">Manage 40+ doctors, beds &amp; hospital resources</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
