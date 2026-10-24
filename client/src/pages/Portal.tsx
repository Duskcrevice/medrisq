import { FormEvent, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  ArrowLeft, CalendarDays, Check, CheckCircle2, Clock3, FileText, Hospital, LogIn,
  LogOut, MessageSquare, ShieldCheck, Star, UserRound, Users, XCircle,
  Stethoscope, Heart, Brain, Bone, Baby, Eye, Ear, Activity, Bell,
  LayoutDashboard,
} from "lucide-react";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { useAuthUser } from "@/contexts/AuthContext";
import PortalLoginGate from "@/components/PortalLoginGate";
import { trpc } from "@/lib/trpc";

// ─── helpers ────────────────────────────────────────────────────────────────

function dateLabel(value?: string | Date | null) {
  if (!value) return "Not scheduled";
  return new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function minDateTime() {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 30);
  return d.toISOString().slice(0, 16);
}

// ─── Synthetic doctor data ───────────────────────────────────────────────────

const SPECIALIZATION_ICONS: Record<string, typeof Stethoscope> = {
  Cardiologist: Heart,
  "General Physician": Stethoscope,
  Neurologist: Brain,
  Orthopedic: Bone,
  Pediatrician: Baby,
  Gynecologist: Activity,
  ENT: Ear,
  Ophthalmologist: Eye,
};

const DOCTORS = [
  { id: "d1",  name: "Dr. Priya Nair",      specialization: "Cardiologist",      experience: 14, rating: 4.8, hospital: "Saint Elara Medical Centre",    availability: "Mon–Fri, 9 AM–5 PM",  avatar: "PN", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&h=256&q=80" },
  { id: "d2",  name: "Dr. Arjun Mehta",     specialization: "General Physician", experience: 9,  rating: 4.5, hospital: "Northbridge General Hospital",   availability: "Mon–Sat, 8 AM–4 PM",  avatar: "AM", image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&h=256&q=80" },
  { id: "d3",  name: "Dr. Sneha Rao",       specialization: "Neurologist",       experience: 17, rating: 4.9, hospital: "Saint Elara Medical Centre",    availability: "Tue–Sat, 10 AM–6 PM", avatar: "SR", image: "https://images.unsplash.com/photo-1594824813588-e8cb9b87612f?auto=format&fit=crop&w=256&h=256&q=80" },
  { id: "d4",  name: "Dr. Karan Bose",      specialization: "Orthopedic",        experience: 11, rating: 4.3, hospital: "Meridian South Hospital",        availability: "Mon–Fri, 9 AM–3 PM",  avatar: "KB", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=256&h=256&q=80" },
  { id: "d5",  name: "Dr. Lakshmi Iyer",    specialization: "Pediatrician",      experience: 8,  rating: 4.7, hospital: "Northbridge General Hospital",   availability: "Mon–Sat, 9 AM–5 PM",  avatar: "LI", image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=256&h=256&q=80" },
  { id: "d6",  name: "Dr. Rohan Gupta",     specialization: "Cardiologist",      experience: 20, rating: 4.6, hospital: "Meridian South Hospital",        availability: "Wed–Sun, 10 AM–6 PM", avatar: "RG", image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&h=256&q=80" },
  { id: "d7",  name: "Dr. Ananya Sharma",   specialization: "Gynecologist",      experience: 13, rating: 4.9, hospital: "Saint Elara Medical Centre",    availability: "Mon–Fri, 8 AM–4 PM",  avatar: "AS", image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=256&h=256&q=80" },
  { id: "d8",  name: "Dr. Vijay Kumar",     specialization: "ENT",               experience: 7,  rating: 4.2, hospital: "Northbridge General Hospital",   availability: "Tue–Sat, 9 AM–5 PM",  avatar: "VK", image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=256&h=256&q=80" },
  { id: "d9",  name: "Dr. Meera Pillai",    specialization: "General Physician", experience: 12, rating: 4.6, hospital: "Meridian South Hospital",        availability: "Mon–Sat, 10 AM–6 PM", avatar: "MP", image: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?auto=format&fit=crop&w=256&h=256&q=80" },
  { id: "d10", name: "Dr. Rahul Joshi",     specialization: "Neurologist",       experience: 16, rating: 4.8, hospital: "Saint Elara Medical Centre",    availability: "Mon–Fri, 9 AM–5 PM",  avatar: "RJ", image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=256&h=256&q=80" },
  { id: "d11", name: "Dr. Divya Krishnan",  specialization: "Ophthalmologist",   experience: 10, rating: 4.5, hospital: "Northbridge General Hospital",   availability: "Mon–Sat, 8 AM–3 PM",  avatar: "DK", image: "https://images.unsplash.com/photo-1643297654416-05795d62e39c?auto=format&fit=crop&w=256&h=256&q=80" },
  { id: "d12", name: "Dr. Sanjay Patel",    specialization: "Orthopedic",        experience: 18, rating: 4.7, hospital: "Meridian South Hospital",        availability: "Tue–Sun, 10 AM–6 PM", avatar: "SP", image: "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&w=256&h=256&q=80" },
];

const ALL_SPECIALIZATIONS = ["All", ...Array.from(new Set(DOCTORS.map(d => d.specialization)))];

// ─── Doctor sub-components ───────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="doctor-stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={12} className={s <= Math.round(rating) ? "star-filled" : "star-empty"} />
      ))}
      <span className="doctor-rating-value">{rating.toFixed(1)}</span>
    </span>
  );
}

function DoctorCard({ doctor, onBook }: { doctor: typeof DOCTORS[0]; onBook: (d: typeof DOCTORS[0]) => void }) {
  const Icon = SPECIALIZATION_ICONS[doctor.specialization] || Stethoscope;
  return (
    <div className="doctor-card">
      <div className="doctor-avatar-wrap">
        <div className="doctor-avatar" aria-hidden="true">
          {doctor.image && (
            <img
              src={doctor.image}
              alt={doctor.name}
              className="doctor-avatar-img"
              loading="lazy"
              onError={e => {
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
          )}
          <span className="doctor-avatar-initials">{doctor.avatar}</span>
          <span className="doctor-avatar-icon"><Icon size={14} /></span>
        </div>
      </div>
      <div className="doctor-info">
        <strong className="doctor-name">{doctor.name}</strong>
        <span className="doctor-spec">{doctor.specialization}</span>
        <StarRating rating={doctor.rating} />
        <span className="doctor-exp">{doctor.experience} yrs experience</span>
        <span className="doctor-hospital"><Hospital size={11} /> {doctor.hospital}</span>
        <span className="doctor-avail"><Clock3 size={11} /> {doctor.availability}</span>
      </div>
      <button
        className="button button-primary small doctor-book-btn"
        onClick={() => onBook(doctor)}
        aria-label={`Book appointment with ${doctor.name}`}
      >
        Book appointment
      </button>
    </div>
  );
}

function DoctorDirectory({ onSelect }: { onSelect: (doctor: typeof DOCTORS[0]) => void }) {
  const [specialization, setSpecialization] = useState("All");
  const [hospital, setHospital] = useState("All");
  const [minRating, setMinRating] = useState<number>(0);

  const doctorsQuery = trpc.portal.getDoctors.useQuery({
    specialization: specialization === "All" ? undefined : specialization,
    hospital: hospital === "All" ? undefined : hospital,
    minRating: minRating > 0 ? minRating : undefined,
  });

  const doctorsList = doctorsQuery.data || DOCTORS.filter(d => {
    if (specialization !== "All" && d.specialization !== specialization) return false;
    if (hospital !== "All" && d.hospital !== hospital) return false;
    if (minRating > 0 && d.rating < minRating) return false;
    return true;
  });

  const hospitals = ["All", "Saint Elara Medical Centre", "Northbridge General Hospital", "Meridian South Hospital"];
  const ratings = [
    { label: "All ratings", val: 0 },
    { label: "⭐ 4.5+", val: 4.5 },
    { label: "⭐ 4.8+", val: 4.8 },
  ];

  return (
    <section className="portal-panel doctor-directory-panel">
      <div className="portal-panel-heading">
        <div>
          <div className="eyebrow">Find your specialist</div>
          <h2>Choose a doctor</h2>
          <p>Filter by specialization, hospital, or rating to choose an attending specialist.</p>
        </div>
        <Stethoscope size={20} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", margin: "1rem 0" }}>
        <div className="doctor-filter-bar">
          {ALL_SPECIALIZATIONS.map(spec => (
            <button
              key={spec}
              className={`doctor-filter-chip ${specialization === spec ? "active" : ""}`}
              onClick={() => setSpecialization(spec)}
            >
              {spec}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>Hospital:</span>
          {hospitals.map(h => (
            <button
              key={h}
              className={`doctor-filter-chip ${hospital === h ? "active" : ""}`}
              onClick={() => setHospital(h)}
              style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
            >
              {h}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>Rating:</span>
          {ratings.map(r => (
            <button
              key={r.label}
              className={`doctor-filter-chip ${minRating === r.val ? "active" : ""}`}
              onClick={() => setMinRating(r.val)}
              style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="doctor-grid">
        {doctorsList.map(doc => (
          <DoctorCard key={doc.id} doctor={doc} onBook={onSelect} />
        ))}
        {doctorsList.length === 0 && (
          <div className="portal-empty" style={{ gridColumn: "1 / -1", padding: "2rem" }}>
            <Stethoscope size={20} />
            <span>No specialists found matching your selected filters.</span>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Shared header ────────────────────────────────────────────────────────────

function PortalHeader({ title, subtitle, logout, unreadCount = 0 }: {
  title: string; subtitle: string; logout: () => void; unreadCount?: number;
}) {
  return (
    <header className="portal-header">
      <Link href="/" className="brand-lockup">
        <span className="brand-mark"><span /></span>
        <span><strong>MedRisq</strong> <em>AI</em></span>
      </Link>
      <div className="portal-header-copy">
        <span className="eyebrow">Protected workspace</span>
        <strong>{title}</strong>
        <small>{subtitle}</small>
      </div>
      <div className="portal-header-actions">
        {unreadCount > 0 && (
          <span className="portal-notif-badge" aria-label={`${unreadCount} unread notifications`}>
            <Bell size={15} /><b>{unreadCount}</b>
          </span>
        )}
        <Link href="/app" className="button button-secondary small" title="Switch to Operations Dashboard">
          <LayoutDashboard size={14} /> Operations Dashboard
        </Link>
        <span className="portal-secure"><ShieldCheck size={14} /> Server-authorized</span>
        <button className="button button-secondary small" onClick={logout} title="Sign out / Switch account">
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </header>
  );
}

// ─── Login gate ───────────────────────────────────────────────────────────────

function LoginGate() {
  return <PortalLoginGate redirectTo="/portal" defaultType="patient" />;
}

// ─── Profile form ─────────────────────────────────────────────────────────────

function ProfileForm({ profile, onSaved }: { profile: any; onSaved: () => void }) {
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [preferredHospital, setPreferredHospital] = useState(profile?.preferredHospital || "");
  const mutation = trpc.portal.registerPatient.useMutation({
    onSuccess: () => { toast.success("Patient profile saved"); onSaved(); },
    onError: error => toast.error(error.message),
  });
  return (
    <section className="portal-panel">
      <div className="portal-panel-heading">
        <div>
          <div className="eyebrow">Patient identity</div>
          <h2>Your profile</h2>
          <p>Use synthetic demo information only. This profile is visible only to you and authorized hospital staff.</p>
        </div>
        <UserRound size={20} />
      </div>
      <form
        className="portal-form"
        onSubmit={event => {
          event.preventDefault();
          if (!displayName.trim()) { toast.error("Display name is required"); return; }
          mutation.mutate({ displayName, phone: phone || undefined, preferredHospital: preferredHospital || undefined });
        }}
      >
        <label>
          Display name
          <input value={displayName} onChange={event => setDisplayName(event.target.value)} required maxLength={180} placeholder="e.g. Rahul Kumar" />
        </label>
        <label>
          Phone (optional)
          <input value={phone} onChange={event => setPhone(event.target.value)} maxLength={40} placeholder="+91 98765 43210" />
          <small className="field-hint">Format: +91 XXXXX XXXXX</small>
        </label>
        <label>
          Preferred hospital
          <select value={preferredHospital} onChange={event => setPreferredHospital(event.target.value)}>
            <option value="">Choose a hospital</option>
            <option>Northbridge General Hospital</option>
            <option>Saint Elara Medical Centre</option>
            <option>Meridian South Hospital</option>
          </select>
        </label>
        <button className="button button-primary" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving…" : "Save profile"}
        </button>
      </form>
    </section>
  );
}

// ─── Patient portal ───────────────────────────────────────────────────────────

function PatientPortal({ snapshot, refresh, logout }: { snapshot: any; refresh: () => void; logout: () => void }) {
  const [clinician, setClinician] = useState("");
  const [hospital, setHospital] = useState("");
  const [appointmentAt, setAppointmentAt] = useState("");
  const [reason, setReason] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | undefined>(undefined);
  const [bookingToken, setBookingToken] = useState<string | null>(null);
  const [bookedDetails, setBookedDetails] = useState<{
    doctorName: string;
    hospital: string;
    date: string;
    token: string;
  } | null>(null);

  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [reqHospital, setReqHospital] = useState("");
  const [showBook, setShowBook] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [showDoctor, setShowDoctor] = useState(true);

  const bookMutation = trpc.portal.bookAppointment.useMutation({
    onSuccess: (data: any) => {
      const token = data?.token || `MRQ-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      setBookingToken(token);
      setBookedDetails({
        doctorName: clinician,
        hospital,
        date: appointmentAt,
        token,
      });
      toast.success(`Appointment confirmed! Your reservation token is ${token}`);
      setClinician("");
      setHospital("");
      setAppointmentAt("");
      setReason("");
      setSelectedDoctorId(undefined);
      setShowBook(false);
      refresh();
    },
    onError: error => toast.error(error.message),
  });

  const cancelMutation = trpc.portal.cancelAppointment.useMutation({
    onSuccess: () => { toast.success("Appointment cancelled"); refresh(); },
    onError: error => toast.error(error.message),
  });

  const requestMutation = trpc.portal.createServiceRequest.useMutation({
    onSuccess: () => {
      toast.success("Service request submitted");
      setCategory(""); setDescription(""); setReqHospital(""); setShowRequest(false);
      refresh();
    },
    onError: error => toast.error(error.message),
  });

  const markReadMutation = trpc.portal.markNotificationRead.useMutation({ onSuccess: () => refresh() });

  const unreadCount = snapshot.notifications?.filter((n: any) => !n.readAt).length || 0;

  function handleDoctorSelect(doc: typeof DOCTORS[0]) {
    setSelectedDoctorId(doc.id);
    setClinician(doc.name);
    setHospital(doc.hospital);
    setShowDoctor(false);
    setShowBook(true);
    toast.success(`${doc.name} selected — specify date and reason`);
  }

  function handleCancelAppointment(id: string, status: string) {
    if (status === "completed") { toast.error("Completed appointments cannot be cancelled."); return; }
    if (!window.confirm("Are you sure you want to cancel this appointment? This cannot be undone.")) return;
    cancelMutation.mutate({ appointmentId: id });
  }

  return (
    <main className="portal-shell">
      <PortalHeader title="Patient portal" subtitle="Your healthcare workspace" logout={logout} unreadCount={unreadCount} />
      <div className="portal-body">
        <div className="portal-role-banner patient">
          <UserRound size={18} />
          <div>
            <strong>Patient access</strong>
            <span>Your health information is protected and private.</span>
          </div>
          <span className="portal-badge">Patient</span>
        </div>

        {/* Booking confirmation token card */}
        {bookingToken && (
          <section className="portal-panel token-confirmation-card" style={{ border: "1px solid rgba(13, 148, 136, 0.4)", background: "rgba(13, 148, 136, 0.06)", position: "relative" }}>
            <div className="portal-panel-heading">
              <div>
                <div className="eyebrow" style={{ color: "#0d9488" }}>Booking confirmed · Reservation token</div>
                <h2>Appointment Token Generated</h2>
                <p>Present this synthetic digital verification token at reception or OPD intake.</p>
              </div>
              <CheckCircle2 size={24} style={{ color: "#0d9488" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", padding: "1rem 0" }}>
              <div>
                <div style={{ fontSize: "1.85rem", fontWeight: 800, letterSpacing: "0.08em", color: "#0d9488", fontFamily: "monospace" }}>
                  {bookingToken}
                </div>
                {bookedDetails && (
                  <small style={{ color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                    {bookedDetails.doctorName} · {bookedDetails.hospital} · {new Date(bookedDetails.date).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                  </small>
                )}
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  className="button button-secondary small"
                  onClick={() => {
                    navigator.clipboard?.writeText(bookingToken);
                    toast.success("Reservation token copied to clipboard!");
                  }}
                >
                  Copy token
                </button>
                <button
                  className="button button-ghost small"
                  onClick={() => setBookingToken(null)}
                  style={{ padding: "0.4rem 0.6rem" }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Unread notifications */}
        {snapshot.notifications?.some((n: any) => !n.readAt) && (
          <section className="portal-panel portal-notif-panel">
            <div className="portal-panel-heading">
              <div><div className="eyebrow">Updates for you</div><h2>Notifications</h2></div>
              <Bell size={20} />
            </div>
            <div className="portal-list">
              {snapshot.notifications.filter((n: any) => !n.readAt).map((n: any) => (
                <div className="portal-list-item" key={n.id}>
                  <div className="portal-list-icon"><Bell size={16} /></div>
                  <div>
                    <strong>{n.title}</strong>
                    <span>{n.body}</span>
                  </div>
                  <div className="portal-list-actions">
                    <button className="button button-secondary tiny" onClick={() => markReadMutation.mutate({ notificationId: n.id })}>
                      <Check size={12} /> Mark read
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <ProfileForm profile={snapshot.patient} onSaved={refresh} />

        {/* Action buttons row */}
        <div className="portal-action-row">
          <button className="button button-primary" onClick={() => { setShowDoctor(v => !v); setShowBook(false); }}>
            <Stethoscope size={16} /> {showDoctor ? "Hide doctors" : "Browse doctors & specialists"}
          </button>
          <button className="button button-secondary" onClick={() => { setShowBook(v => !v); setShowDoctor(false); }}>
            <CalendarDays size={16} /> {showBook ? "Close form" : "Book appointment manually"}
          </button>
        </div>

        {/* Doctor directory */}
        {showDoctor && <DoctorDirectory onSelect={handleDoctorSelect} />}

        {/* Appointment booking form */}
        {showBook && (
          <section className="portal-panel">
            <div className="portal-panel-heading">
              <div><div className="eyebrow">New appointment</div><h2>Book appointment</h2></div>
              <CalendarDays size={20} />
            </div>
            <form
              className="portal-form"
              onSubmit={event => {
                event.preventDefault();
                if (!clinician.trim()) { toast.error("Clinician name is required"); return; }
                if (!hospital) { toast.error("Hospital is required"); return; }
                if (!appointmentAt) { toast.error("Please select a date and time"); return; }
                if (new Date(appointmentAt) <= new Date()) { toast.error("Appointment must be in the future (at least 30 minutes from now)"); return; }
                if (reason.trim().length < 5) { toast.error("Please describe the reason (minimum 5 characters)"); return; }
                bookMutation.mutate({
                  clinician,
                  hospitalName: hospital,
                  appointmentAt: new Date(appointmentAt).toISOString(),
                  reason,
                  doctorId: selectedDoctorId,
                });
              }}
            >
              <label>
                Clinician
                <input value={clinician} onChange={event => setClinician(event.target.value)} required placeholder="Doctor name (select from directory above or type)" maxLength={180} />
              </label>
              <label>
                Hospital
                <select value={hospital} onChange={event => setHospital(event.target.value)} required>
                  <option value="">Select a hospital</option>
                  <option>Northbridge General Hospital</option>
                  <option>Saint Elara Medical Centre</option>
                  <option>Meridian South Hospital</option>
                </select>
              </label>
              <label>
                Date &amp; time
                <input type="datetime-local" value={appointmentAt} onChange={event => setAppointmentAt(event.target.value)} min={minDateTime()} required />
                <small className="field-hint">Must be at least 30 minutes from now</small>
              </label>
              <label>
                Reason for visit
                <textarea value={reason} onChange={event => setReason(event.target.value)} required minLength={5} maxLength={500} placeholder="Briefly describe your symptoms or concern…" />
                <small className="field-hint char-counter">{reason.length}/500</small>
              </label>
              <button className="button button-primary" type="submit" disabled={bookMutation.isPending}>
                {bookMutation.isPending ? "Booking…" : "Request appointment"}
              </button>
            </form>
          </section>
        )}

        <div className="portal-grid">
          {/* Appointments list */}
          <section className="portal-panel">
            <div className="portal-panel-heading">
              <div><div className="eyebrow">Your care schedule</div><h2>Appointments</h2></div>
              <CalendarDays size={20} />
            </div>
            <div className="portal-list">
              {snapshot.appointments?.map((item: any) => (
                <div className="portal-list-item" key={item.id}>
                  <div className="portal-list-icon"><CalendarDays size={16} /></div>
                  <div>
                    <strong>{item.hospitalName} — {item.clinician}</strong>
                    <span>{dateLabel(item.appointmentAt)}</span>
                    <small>{item.reason}</small>
                    {item.staffNote && <small className="staff-note">Staff note: {item.staffNote}</small>}
                  </div>
                  <div className="portal-list-actions">
                    <span className={`portal-status ${item.status}`}>{item.status}</span>
                    {(item.status === "requested" || item.status === "confirmed") && (
                      <button
                        className="button button-secondary tiny"
                        onClick={() => handleCancelAppointment(String(item.id), item.status)}
                        disabled={cancelMutation.isPending}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {!snapshot.appointments?.length && (
                <div className="portal-empty">
                  <CalendarDays size={18} />
                  <span>No appointments yet. Browse doctors above to book one.</span>
                </div>
              )}
            </div>
          </section>

          {/* Service requests */}
          <section className="portal-panel">
            <div className="portal-panel-heading">
              <div><div className="eyebrow">Hospital support</div><h2>Service requests</h2></div>
              <MessageSquare size={20} />
            </div>
            <div style={{ padding: "0 0 1rem" }}>
              <button className="button button-secondary small" onClick={() => setShowRequest(v => !v)}>
                <MessageSquare size={14} /> {showRequest ? "Close form" : "New service request"}
              </button>
            </div>

            {showRequest && (
              <form
                className="portal-form"
                onSubmit={event => {
                  event.preventDefault();
                  if (!reqHospital) { toast.error("Hospital is required"); return; }
                  if (!category) { toast.error("Category is required"); return; }
                  if (description.trim().length < 5) { toast.error("Description must be at least 5 characters"); return; }
                  requestMutation.mutate({ hospitalName: reqHospital, category, description });
                }}
              >
                <label>
                  Hospital
                  <select value={reqHospital} onChange={event => setReqHospital(event.target.value)} required>
                    <option value="">Select a hospital</option>
                    <option>Northbridge General Hospital</option>
                    <option>Saint Elara Medical Centre</option>
                    <option>Meridian South Hospital</option>
                  </select>
                </label>
                <label>
                  Category
                  <select value={category} onChange={event => setCategory(event.target.value)} required>
                    <option value="">Select category</option>
                    <option value="Billing">Billing enquiry</option>
                    <option value="Records">Medical records request</option>
                    <option value="Prescription">Prescription refill</option>
                    <option value="Feedback">Feedback / complaint</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
                <label>
                  Description
                  <textarea value={description} onChange={event => setDescription(event.target.value)} required minLength={5} maxLength={2000} placeholder="Describe your request in detail…" />
                  <small className="field-hint char-counter">{description.length}/2000 characters</small>
                </label>
                <button className="button button-primary" type="submit" disabled={requestMutation.isPending}>
                  {requestMutation.isPending ? "Submitting…" : "Submit request"}
                </button>
              </form>
            )}

            <div className="portal-list">
              {snapshot.serviceRequests?.map((item: any) => (
                <div className="portal-list-item" key={item.id}>
                  <div className="portal-list-icon"><FileText size={16} /></div>
                  <div>
                    <strong>{item.category}</strong>
                    <span>{item.hospitalName}</span>
                    <small>{item.description}</small>
                    {item.staffReply && <small className="staff-note">Reply: {item.staffReply}</small>}
                  </div>
                  <div className="portal-list-actions">
                    <span className={`portal-status ${item.status}`}>{item.status.replace("_", " ")}</span>
                  </div>
                </div>
              ))}
              {!snapshot.serviceRequests?.length && (
                <div className="portal-empty"><MessageSquare size={18} /><span>No service requests yet.</span></div>
              )}
            </div>
          </section>
        </div>

        <p className="portal-disclaimer">
          Synthetic demo only. No real patient data is stored or transmitted. Production deployments require verified identity checks, organization membership, monitoring, and a full security and privacy review.
        </p>
      </div>
    </main>
  );
}

// ─── Staff portal ─────────────────────────────────────────────────────────────

function StaffPortal({ snapshot, refresh, logout }: { snapshot: any; refresh: () => void; logout: () => void }) {
  const mutation = trpc.portal.updateStaffWorkflow.useMutation({
    onSuccess: () => { toast.success("Workflow updated"); refresh(); },
    onError: error => toast.error(error.message),
  });
  const unreadCount = snapshot.notifications?.filter((n: any) => !n.readAt).length || 0;
  return (
    <main className="portal-shell">
      <PortalHeader title="Hospital staff portal" subtitle="Approved organization workspace" logout={logout} unreadCount={unreadCount} />
      <div className="portal-body">
        <div className="portal-role-banner staff">
          <Hospital size={18} />
          <div>
            <strong>Approved staff access</strong>
            <span>Records are restricted to your approved organization and permission set.</span>
          </div>
          <span className="portal-badge">Staff</span>
        </div>
        <div className="portal-grid">
          <section className="portal-panel">
            <div className="portal-panel-heading">
              <div><div className="eyebrow">Assigned care workflow</div><h2>Appointments</h2><p>Only appointments at your approved hospital are visible.</p></div>
              <CalendarDays size={20} />
            </div>
            <div className="portal-list">
              {snapshot.staffAppointments?.map((item: any) => (
                <div className="portal-list-item" key={item.id}>
                  <div className="portal-list-icon"><CalendarDays size={16} /></div>
                  <div>
                    <strong>{item.hospitalName} — {item.clinician}</strong>
                    <span>{dateLabel(item.appointmentAt)} — patient reference protected</span>
                    <small>{item.reason}</small>
                  </div>
                  <div className="portal-list-actions">
                    <span className={`portal-status ${item.status}`}>{item.status}</span>
                    {item.status === "requested" && (
                      <button className="button button-secondary tiny" onClick={() => mutation.mutate({ type: "appointment", id: String(item.id), status: "confirmed", note: "Confirmed by approved hospital staff." })}>Confirm</button>
                    )}
                    {item.status === "confirmed" && (
                      <button className="button button-secondary tiny" onClick={() => mutation.mutate({ type: "appointment", id: String(item.id), status: "completed", note: "Visit completed." })}>Complete</button>
                    )}
                  </div>
                </div>
              ))}
              {!snapshot.staffAppointments?.length && <div className="portal-empty"><CalendarDays size={18} /><span>No appointments in your organization.</span></div>}
            </div>
          </section>
          <section className="portal-panel">
            <div className="portal-panel-heading">
              <div><div className="eyebrow">Patient support queue</div><h2>Service requests</h2><p>Patient identity is minimized; access is limited to workflow handling.</p></div>
              <MessageSquare size={20} />
            </div>
            <div className="portal-list">
              {snapshot.staffRequests?.map((item: any) => (
                <div className="portal-list-item" key={item.id}>
                  <div className="portal-list-icon"><FileText size={16} /></div>
                  <div>
                    <strong>{item.category}</strong>
                    <span>{item.hospitalName} — patient reference protected</span>
                    <small>{item.description}</small>
                  </div>
                  <div className="portal-list-actions">
                    <span className={`portal-status ${item.status}`}>{item.status.replace("_", " ")}</span>
                    {item.status === "submitted" && (
                      <button className="button button-secondary tiny" onClick={() => mutation.mutate({ type: "service_request", id: String(item.id), status: "in_review", note: "Request is in review by hospital staff." })}>Review</button>
                    )}
                    {item.status === "in_review" && (
                      <button className="button button-secondary tiny" onClick={() => mutation.mutate({ type: "service_request", id: String(item.id), status: "resolved", note: "Hospital support response recorded." })}>Resolve</button>
                    )}
                  </div>
                </div>
              ))}
              {!snapshot.staffRequests?.length && <div className="portal-empty"><MessageSquare size={18} /><span>No service requests in your organization.</span></div>}
            </div>
          </section>
        </div>
        <p className="portal-disclaimer">Approved staff cannot approve themselves, change roles, or access other organizations. Synthetic hackathon records only.</p>
      </div>
    </main>
  );
}

// ─── Admin portal ─────────────────────────────────────────────────────────────

function AdminPortal({ snapshot, refresh, logout }: { snapshot: any; refresh: () => void; logout: () => void }) {
  const review = trpc.portal.reviewStaffApplication.useMutation({
    onSuccess: () => { toast.success("Application status updated"); refresh(); },
    onError: error => toast.error(error.message),
  });
  return (
    <main className="portal-shell">
      <PortalHeader title="Administrator portal" subtitle="Restricted approval and oversight" logout={logout} />
      <div className="portal-body">
        <div className="portal-role-banner admin">
          <Users size={18} />
          <div>
            <strong>Administrator controls</strong>
            <span>Approval actions are server-authorized and audit logged.</span>
          </div>
          <span className="portal-badge">Admin</span>
        </div>
        <section className="portal-panel">
          <div className="portal-panel-heading">
            <div><div className="eyebrow">Access governance</div><h2>Staff applications</h2><p>Review employment details before staff privileges become available.</p></div>
            <ShieldCheck size={20} />
          </div>
          <div className="admin-table">
            {snapshot.pendingApplications?.length ? snapshot.pendingApplications.map((item: any) => (
              <div className="admin-row" key={item.id}>
                <div>
                  <strong>{item.applicantName}</strong>
                  <span>{item.email || "No email"} — {item.employeeId}</span>
                </div>
                <div>
                  <strong>{item.hospitalName}</strong>
                  <span>{item.requestedRole.replace("_", " ")} — {item.status}</span>
                </div>
                <div className="admin-actions">
                  {item.status === "pending" ? (
                    <>
                      <button className="button button-primary tiny" onClick={() => review.mutate({ openId: item.openId, status: "approved", reviewNote: "Employment details reviewed in synthetic demo." })}>
                        <Check size={13} /> Approve
                      </button>
                      <button className="button button-secondary tiny" onClick={() => review.mutate({ openId: item.openId, status: "rejected", reviewNote: "Unable to verify employment details in this demo." })}>
                        <XCircle size={13} /> Reject
                      </button>
                    </>
                  ) : (
                    <button className="button button-secondary tiny" onClick={() => review.mutate({ openId: item.openId, status: item.status === "suspended" ? "approved" : "suspended", reviewNote: item.status === "suspended" ? "Access reinstated by administrator." : "Access suspended by administrator." })}>
                      {item.status === "suspended" ? "Reinstate" : "Suspend"}
                    </button>
                  )}
                </div>
              </div>
            )) : <div className="portal-empty"><Check size={18} /><span>No staff applications to review.</span></div>}
          </div>
        </section>
        <section className="portal-panel admin-boundary">
          <ShieldCheck size={18} />
          <div>
            <strong>Admin boundary</strong>
            <p>Administrator privileges come from the server-managed user role and cannot be created through this portal. Every approval transition is written to the security audit log.</p>
          </div>
        </section>
      </div>
    </main>
  );
}

// ─── Staff application flow ───────────────────────────────────────────────────

function StaffApplication({ snapshot, refresh, logout }: { snapshot: any; refresh: () => void; logout: () => void }) {
  const [hospitalName, setHospitalName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [requestedRole, setRequestedRole] = useState<"hospital_staff" | "pharmacist" | "coordinator">("hospital_staff");
  const apply = trpc.portal.applyForStaff.useMutation({
    onSuccess: () => { toast.success("Application submitted — awaiting admin approval"); refresh(); },
    onError: error => toast.error(error.message),
  });
  const isSuspended = snapshot.role === "suspended_staff";
  const isPending = snapshot.role === "pending_staff";
  const isRejected = snapshot.role === "rejected_staff";
  return (
    <main className="portal-shell">
      <PortalHeader title="Staff access portal" subtitle="Employment verification required" logout={logout} />
      <div className="portal-body">
        {isPending && (
          <div className="portal-role-banner pending">
            <Clock3 size={18} />
            <div><strong>Application under review</strong><span>An administrator will approve or reject your application soon.</span></div>
            <span className="portal-badge">Pending</span>
          </div>
        )}
        {isRejected && (
          <div className="portal-role-banner rejected">
            <XCircle size={18} />
            <div><strong>Application not approved</strong><span>Contact your hospital administrator for more information.</span></div>
            <span className="portal-badge">Rejected</span>
          </div>
        )}
        {isSuspended && (
          <div className="portal-role-banner suspended">
            <XCircle size={18} />
            <div><strong>Access suspended</strong><span>Your access has been suspended. Contact your hospital administrator.</span></div>
            <span className="portal-badge">Suspended</span>
          </div>
        )}
        {!isPending && !isSuspended && (
          <section className="portal-panel">
            <div className="portal-panel-heading">
              <div>
                <div className="eyebrow">Hospital employment</div>
                <h2>Apply for staff access</h2>
                <p>An administrator will review your employment details before staff access is granted.</p>
              </div>
              <Hospital size={20} />
            </div>
            <form
              className="portal-form"
              onSubmit={event => {
                event.preventDefault();
                if (!hospitalName.trim()) { toast.error("Hospital name is required"); return; }
                if (!employeeId.trim()) { toast.error("Employee ID is required"); return; }
                apply.mutate({ hospitalName, employeeId, requestedRole });
              }}
            >
              <label>
                Hospital name
                <input value={hospitalName} onChange={e => setHospitalName(e.target.value)} required minLength={3} maxLength={180} placeholder="e.g. Saint Elara Medical Centre" />
              </label>
              <label>
                Employee ID
                <input value={employeeId} onChange={e => setEmployeeId(e.target.value)} required minLength={3} maxLength={120} placeholder="e.g. EMP-2024-0456" />
              </label>
              <label>
                Role requested
                <select value={requestedRole} onChange={e => setRequestedRole(e.target.value as typeof requestedRole)}>
                  <option value="hospital_staff">Hospital staff</option>
                  <option value="pharmacist">Pharmacist</option>
                  <option value="coordinator">Emergency coordinator</option>
                </select>
              </label>
              <button className="button button-primary" type="submit" disabled={apply.isPending}>
                {apply.isPending ? "Submitting…" : "Submit for approval"}
              </button>
            </form>
          </section>
        )}
        <p className="portal-disclaimer">Synthetic demo only. Production deployments require verified employment checks, organization membership, monitoring, and a security/privacy review.</p>
      </div>
    </main>
  );
}

// ─── Root portal ──────────────────────────────────────────────────────────────

export default function Portal() {
  const authUser = useAuthUser();
  const auth = useAuth();
  const isAuthenticated = authUser.isAuthenticated || auth.isAuthenticated;
  const snapshotQuery = trpc.portal.snapshot.useQuery(undefined, { enabled: isAuthenticated, retry: false });

  const handleLogout = async () => {
    authUser.logout();
    await auth.logout();
    toast.info("Signed out successfully");
  };

  if (!isAuthenticated || snapshotQuery.error?.message?.includes("login")) {
    return <PortalLoginGate redirectTo="/portal" defaultType={authUser.currentUser?.userType || "patient"} />;
  }

  if (auth.loading || (isAuthenticated && snapshotQuery.isLoading && !authUser.currentUser)) {
    return (
      <main className="portal-shell">
        <div className="portal-loading"><Clock3 className="spin" size={20} /> Checking your protected workspace…</div>
      </main>
    );
  }

  // Graceful fallback from currentUser if server snapshot is still loading or offline
  const fallbackSnapshot = authUser.currentUser ? {
    role: authUser.currentUser.userType === "patient" ? "patient" : (authUser.currentUser.role === "admin" ? "admin" : "staff"),
    profile: { displayName: authUser.currentUser.name, phone: "+91 98765 43210", preferredHospital: authUser.currentUser.hospitalName || "Saint Elara Medical Centre" },
    staffApplication: { applicantName: authUser.currentUser.name, hospitalName: authUser.currentUser.hospitalName || "Saint Elara Medical Centre", employeeId: authUser.currentUser.employeeId || "EMP-2024-0456", requestedRole: "hospital_staff", status: "approved" },
    appointments: [
      {
        id: "apt-demo-1",
        hospitalName: authUser.currentUser.hospitalName || "Saint Elara Medical Centre",
        clinician: "Dr. Priya Nair",
        appointmentAt: new Date(Date.now() + 86400000).toISOString(),
        reason: "Cardiovascular health evaluation & ECG",
        status: "confirmed",
        staffNote: "Please arrive 15 minutes early with previous records.",
        createdAt: new Date().toISOString(),
      }
    ],
    serviceRequests: [],
    notifications: [],
    staffAppointments: [],
    staffRequests: [],
    pendingApplications: [],
    actor: { id: 101, name: authUser.currentUser.name, email: authUser.currentUser.email || "user@saintelara.org" }
  } : null;

  const snapshot = snapshotQuery.data;
  const finalSnapshot = snapshot || fallbackSnapshot;

  if (!finalSnapshot) {
    return <PortalLoginGate redirectTo="/portal" defaultType="patient" />;
  }

  if (finalSnapshot.role === "patient") return <PatientPortal snapshot={finalSnapshot} refresh={() => snapshotQuery.refetch()} logout={handleLogout} />;
  if (finalSnapshot.role === "admin")   return <AdminPortal   snapshot={finalSnapshot} refresh={() => snapshotQuery.refetch()} logout={handleLogout} />;
  if (finalSnapshot.role === "staff")   return <StaffPortal   snapshot={finalSnapshot} refresh={() => snapshotQuery.refetch()} logout={handleLogout} />;
  return <StaffApplication snapshot={finalSnapshot} refresh={() => snapshotQuery.refetch()} logout={handleLogout} />;
}
