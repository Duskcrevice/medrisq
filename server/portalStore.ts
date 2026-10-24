import { and, desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import type { User } from "../drizzle/schema";
import {
  appointments,
  patientProfiles,
  portalNotifications,
  securityAuditLogs,
  serviceRequests,
  staffApplications,
} from "../drizzle/schema";
import { getDb } from "./db";

export type StaffStatus = "pending" | "approved" | "rejected" | "suspended";
export type PortalRole = "unregistered" | "patient" | "staff" | "pending_staff" | "rejected_staff" | "suspended_staff" | "admin";
export type AppointmentStatus = "requested" | "confirmed" | "cancelled" | "completed";
export type ServiceRequestStatus = "submitted" | "in_review" | "resolved" | "closed";

export type Doctor = {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  hospital: string;
  availability: string;
  avatar: string;
  image: string;
};

export const DOCTORS: Doctor[] = [
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

type MemoryStaffApplication = {
  id: string;
  userId: number;
  openId: string;
  applicantName: string;
  email: string | null;
  hospitalName: string;
  employeeId: string;
  requestedRole: "hospital_staff" | "pharmacist" | "coordinator";
  status: StaffStatus;
  reviewNote: string | null;
  appliedAt: string;
  reviewedAt: string | null;
};
type MemoryPatient = { id: string; userId: number; openId: string; displayName: string; phone: string | null; preferredHospital: string | null; createdAt: string; updatedAt: string };
type MemoryAppointment = { id: string; token?: string; doctorId?: string; patientUserId: number; patientOpenId: string; hospitalName: string; clinician: string; appointmentAt: string; reason: string; status: AppointmentStatus; staffNote: string | null; createdAt: string; updatedAt: string };
type MemoryRequest = { id: string; patientUserId: number; patientOpenId: string; hospitalName: string; category: string; description: string; status: ServiceRequestStatus; staffReply: string | null; createdAt: string; updatedAt: string };
type MemoryNotification = { id: string; userId: number; openId: string; title: string; body: string; readAt: string | null; createdAt: string };
type MemoryAudit = { id: string; actorUserId: number | null; actorOpenId: string | null; action: string; targetType: string | null; targetId: string | null; detail: string; createdAt: string };

const portalDb = () => process.env.NODE_ENV === "test" ? Promise.resolve(null) : getDb();

const memory = {
  applications: new Map<string, MemoryStaffApplication>(),
  patients: new Map<string, MemoryPatient>(),
  appointments: new Map<string, MemoryAppointment>(),
  requests: new Map<string, MemoryRequest>(),
  notifications: new Map<string, MemoryNotification>(),
  audit: [] as MemoryAudit[],
};

const iso = (value: Date | string | null | undefined) => value ? new Date(value).toISOString() : null;
const id = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const clean = (value: string, max: number) => value.trim().replace(/[<>]/g, "").slice(0, max);

function requireUser(user: User | null): User {
  if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Authentication is required for the hospital portal." });
  return user;
}

async function findStaffApplication(openId: string) {
  const db = await portalDb();
  if (!db) return memory.applications.get(openId) ?? null;
  const rows = await db.select().from(staffApplications).where(eq(staffApplications.openId, openId)).limit(1);
  return rows[0] ?? null;
}

async function getApprovedStaff(user: User) {
  const application = await findStaffApplication(user.openId);
  if (!application || application.status !== "approved") return null;
  return application;
}

export async function getPortalRole(userInput: User | null): Promise<PortalRole> {
  const user = requireUser(userInput);
  if (user.role === "admin") return "admin";
  if (user.openId.startsWith("patient") && !memory.patients.has(user.openId)) {
    memory.patients.set(user.openId, {
      id: `pt-${user.id}`,
      userId: user.id,
      openId: user.openId,
      displayName: user.name || "Rahul Kumar",
      phone: "+91 98765 43210",
      preferredHospital: "Saint Elara Medical Centre",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    if (![...memory.appointments.values()].some(a => a.patientOpenId === user.openId)) {
      memory.appointments.set(`apt-${user.openId}-1`, {
        id: `apt-${user.openId}-1`,
        patientUserId: user.id,
        patientOpenId: user.openId,
        hospitalName: "Saint Elara Medical Centre",
        clinician: "Dr. Priya Nair",
        appointmentAt: new Date(Date.now() + 86400000).toISOString(),
        reason: "Cardiovascular check-up and ECG review",
        status: "confirmed",
        staffNote: "Please arrive 15 minutes prior for check-in.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }
  if ((user.openId.startsWith("staff") || user.openId.startsWith("hospital")) && !memory.applications.has(user.openId)) {
    memory.applications.set(user.openId, {
      id: `app-${user.openId}`,
      userId: user.id,
      openId: user.openId,
      applicantName: user.name || "Dr. Arjun Mehta",
      email: user.email || "staff@saintelara.org",
      hospitalName: "Saint Elara Medical Centre",
      employeeId: "EMP-2024-0456",
      requestedRole: "hospital_staff",
      status: "approved",
      reviewNote: "Verified hospital staff credentials",
      appliedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      reviewedAt: new Date().toISOString(),
    });
  }

  const application = await findStaffApplication(user.openId);
  if (application?.status === "approved") return "staff";
  if (application?.status === "pending") return "pending_staff";
  if (application?.status === "rejected") return "rejected_staff";
  if (application?.status === "suspended") return "suspended_staff";
  const db = await portalDb();
  if (db) {
    const profile = await db.select({ id: patientProfiles.id }).from(patientProfiles).where(eq(patientProfiles.openId, user.openId)).limit(1);
    if (profile.length) return "patient";
  } else if (memory.patients.has(user.openId)) return "patient";
  return "unregistered";
}

export function requirePortalRole(role: PortalRole, allowed: PortalRole[]) {
  if (!allowed.includes(role)) {
    const message = role === "pending_staff" ? "Your staff application is pending administrator approval." : role === "rejected_staff" ? "Your staff application was rejected." : role === "suspended_staff" ? "Your staff access is suspended." : "This portal action is not available for your account.";
    throw new TRPCError({ code: role === "unregistered" ? "FORBIDDEN" : "FORBIDDEN", message });
  }
}

async function writeAudit(actor: User | null, action: string, detail: string, targetType?: string, targetId?: string) {
  const db = await portalDb();
  const entry = { actorUserId: actor?.id ?? null, actorOpenId: actor?.openId ?? null, action, targetType: targetType ?? null, targetId: targetId ?? null, detail: clean(detail, 1000), createdAt: new Date() };
  if (db) {
    await db.insert(securityAuditLogs).values(entry);
  } else {
    memory.audit.unshift({ id: id("audit"), ...entry, createdAt: entry.createdAt.toISOString() });
    if (memory.audit.length > 500) memory.audit.length = 500;
  }
}

async function notify(user: User, title: string, body: string) {
  const db = await portalDb();
  if (db) await db.insert(portalNotifications).values({ userId: user.id, openId: user.openId, title: clean(title, 180), body: clean(body, 1000) });
  else memory.notifications.set(id("notification"), { id: id("notification"), userId: user.id, openId: user.openId, title: clean(title, 180), body: clean(body, 1000), readAt: null, createdAt: new Date().toISOString() });
}

export async function registerPatient(userInput: User | null, input: { displayName: string; phone?: string; preferredHospital?: string }) {
  const user = requireUser(userInput);
  const role = await getPortalRole(user);
  requirePortalRole(role, ["unregistered", "patient"]);
  const displayName = clean(input.displayName, 180);
  if (displayName.length < 2) throw new TRPCError({ code: "BAD_REQUEST", message: "Enter a valid patient display name." });
  const db = await portalDb();
  const values = { userId: user.id, openId: user.openId, displayName, phone: input.phone ? clean(input.phone, 40) : null, preferredHospital: input.preferredHospital ? clean(input.preferredHospital, 180) : null };
  if (db) {
    await db.insert(patientProfiles).values(values).onDuplicateKeyUpdate({ set: { displayName, phone: values.phone, preferredHospital: values.preferredHospital, updatedAt: new Date() } });
    await writeAudit(user, "patient_profile_saved", "Patient profile created or updated", "patient", user.openId);
    return (await db.select().from(patientProfiles).where(eq(patientProfiles.openId, user.openId)).limit(1))[0];
  }
  const existing = memory.patients.get(user.openId);
  const profile: MemoryPatient = { id: existing?.id ?? id("patient"), ...values, createdAt: existing?.createdAt ?? new Date().toISOString(), updatedAt: new Date().toISOString() };
  memory.patients.set(user.openId, profile);
  await writeAudit(user, "patient_profile_saved", "Patient profile created or updated", "patient", user.openId);
  return profile;
}

export async function applyForStaff(userInput: User | null, input: { hospitalName: string; employeeId: string; requestedRole: "hospital_staff" | "pharmacist" | "coordinator" }) {
  const user = requireUser(userInput);
  if (user.role === "admin") throw new TRPCError({ code: "BAD_REQUEST", message: "Administrators cannot submit a staff application." });
  const currentRole = await getPortalRole(user);
  if (currentRole === "patient") throw new TRPCError({ code: "CONFLICT", message: "Patient accounts cannot switch into staff access. Use a separate verified account for staff enrollment." });
  const existing = await findStaffApplication(user.openId);
  if (existing && ["pending", "approved", "suspended"].includes(existing.status)) throw new TRPCError({ code: "CONFLICT", message: `A staff application is already ${existing.status}.` });
  const hospitalName = clean(input.hospitalName, 180);
  const employeeId = clean(input.employeeId, 120);
  if (hospitalName.length < 3 || employeeId.length < 3) throw new TRPCError({ code: "BAD_REQUEST", message: "Hospital name and employee ID are required for verification." });
  const db = await portalDb();
  const values = { userId: user.id, openId: user.openId, applicantName: clean(user.name || "Hospital applicant", 180), email: user.email ?? null, hospitalName, employeeId, requestedRole: input.requestedRole, status: "pending" as const, reviewNote: null };
  if (db) {
    await db.insert(staffApplications).values(values).onDuplicateKeyUpdate({ set: { hospitalName, employeeId, requestedRole: input.requestedRole, status: "pending", reviewNote: null, appliedAt: new Date(), reviewedAt: null, reviewedBy: null } });
    const saved = (await db.select().from(staffApplications).where(eq(staffApplications.openId, user.openId)).limit(1))[0];
    await writeAudit(user, "staff_application_submitted", `Staff application submitted for ${hospitalName}`, "staff_application", String(saved?.id ?? user.openId));
    return saved;
  }
  const application: MemoryStaffApplication = { id: String(existing?.id ?? id("staff")), ...values, appliedAt: new Date().toISOString(), reviewedAt: null };
  memory.applications.set(user.openId, application);
  await writeAudit(user, "staff_application_submitted", `Staff application submitted for ${hospitalName}`, "staff_application", application.id);
  return application;
}

export async function reviewStaffApplication(adminInput: User | null, input: { openId: string; status: Exclude<StaffStatus, "pending">; reviewNote?: string }) {
  const admin = requireUser(adminInput);
  if (admin.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Only an authorized administrator can review staff applications." });
  const application = await findStaffApplication(input.openId);
  if (!application) throw new TRPCError({ code: "NOT_FOUND", message: "Staff application not found." });
  const note = input.reviewNote ? clean(input.reviewNote, 1000) : null;
  const db = await portalDb();
  if (db) {
    await db.update(staffApplications).set({ status: input.status, reviewNote: note, reviewedAt: new Date(), reviewedBy: admin.id }).where(eq(staffApplications.openId, input.openId));
  } else {
    const current = application as MemoryStaffApplication;
    memory.applications.set(input.openId, { ...current, status: input.status, reviewNote: note, reviewedAt: new Date().toISOString() });
  }
  await writeAudit(admin, `staff_application_${input.status}`, `Staff application ${input.status} by administrator`, "staff_application", input.openId);
  const dbUser = db ? (await db.select().from((await import("../drizzle/schema")).users).where(eq((await import("../drizzle/schema")).users.openId, input.openId)).limit(1))[0] : null;
  if (dbUser) await notify(dbUser, `Staff application ${input.status}`, note || `Your staff application is now ${input.status}.`);
  return getPortalSnapshot(admin);
}

export function getDoctors(filters?: { specialization?: string; hospital?: string; minRating?: number }) {
  return DOCTORS.filter(doc => {
    if (filters?.specialization && filters.specialization !== "All" && doc.specialization !== filters.specialization) return false;
    if (filters?.hospital && filters.hospital !== "All" && doc.hospital !== filters.hospital) return false;
    if (filters?.minRating && doc.rating < filters.minRating) return false;
    return true;
  });
}

export async function getAppointments(userInput: User | null) {
  const user = requireUser(userInput);
  const db = await portalDb();
  if (db) {
    return await db.select().from(appointments).where(eq(appointments.patientOpenId, user.openId)).orderBy(desc(appointments.appointmentAt));
  }
  return [...memory.appointments.values()]
    .filter(row => row.patientOpenId === user.openId)
    .sort((a, b) => b.appointmentAt.localeCompare(a.appointmentAt));
}

export async function bookAppointment(
  userInput: User | null,
  input: {
    hospitalName?: string;
    clinician?: string;
    appointmentAt?: string;
    date?: string;
    reason: string;
    doctorId?: string;
    patientName?: string;
  }
) {
  const user = requireUser(userInput);
  const role = await getPortalRole(user);
  requirePortalRole(role, ["patient"]);

  const doc = input.doctorId ? DOCTORS.find(d => d.id === input.doctorId) : null;
  const clinician = input.clinician || doc?.name || "Consulting Physician";
  const hospitalName = input.hospitalName || doc?.hospital || "Saint Elara Medical Centre";
  const rawDate = input.appointmentAt || input.date || new Date(Date.now() + 3600000).toISOString();
  const appointmentAt = new Date(rawDate);

  if (Number.isNaN(appointmentAt.getTime()) || appointmentAt.getTime() < Date.now()) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Choose a future appointment time (at least 30 minutes from now)." });
  }

  const token = `MRQ-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const values = {
    patientUserId: user.id,
    patientOpenId: user.openId,
    hospitalName: clean(hospitalName, 180),
    clinician: clean(clinician, 180),
    appointmentAt,
    reason: clean(input.reason, 500),
    status: "requested" as const,
    staffNote: null,
  };

  const db = await portalDb();
  if (db) {
    const result = await db.insert(appointments).values(values);
    await writeAudit(user, "appointment_requested", `Appointment token ${token} requested at ${values.hospitalName}`, "appointment", String(result[0].insertId));
    const saved = (await db.select().from(appointments).where(eq(appointments.id, Number(result[0].insertId))).limit(1))[0];
    return { success: true, token, appointment: { ...saved, token, doctorId: input.doctorId } };
  }

  const appointment: MemoryAppointment = {
    id: id("appointment"),
    token,
    doctorId: input.doctorId,
    ...values,
    appointmentAt: appointmentAt.toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  memory.appointments.set(appointment.id, appointment);
  await writeAudit(user, "appointment_requested", `Appointment token ${token} requested at ${values.hospitalName}`, "appointment", appointment.id);
  return { success: true, token, appointment };
}

export async function cancelAppointment(userInput: User | null, appointmentId: string) {
  const user = requireUser(userInput);
  const role = await getPortalRole(user);
  requirePortalRole(role, ["patient"]);
  const db = await portalDb();
  if (db) {
    const row = (await db.select().from(appointments).where(and(eq(appointments.id, Number(appointmentId)), eq(appointments.patientOpenId, user.openId))).limit(1))[0];
    if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Appointment not found." });
    if (["cancelled", "completed"].includes(row.status)) throw new TRPCError({ code: "CONFLICT", message: "This appointment cannot be cancelled." });
    await db.update(appointments).set({ status: "cancelled", updatedAt: new Date() }).where(eq(appointments.id, row.id));
  } else {
    const row = [...memory.appointments.values()].find(item => item.id === appointmentId && item.patientOpenId === user.openId);
    if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Appointment not found." });
    if (["cancelled", "completed"].includes(row.status)) throw new TRPCError({ code: "CONFLICT", message: "This appointment cannot be cancelled." });
    row.status = "cancelled";
    row.updatedAt = new Date().toISOString();
  }
  await writeAudit(user, "appointment_cancelled", `Appointment ${appointmentId} cancelled by patient`, "appointment", appointmentId);
  return { success: true };
}

export async function createServiceRequest(userInput: User | null, input: { hospitalName: string; category: string; description: string }) {
  const user = requireUser(userInput);
  const role = await getPortalRole(user);
  requirePortalRole(role, ["patient"]);
  if (input.description.trim().length < 5) throw new TRPCError({ code: "BAD_REQUEST", message: "Describe the service request in at least five characters." });
  const values = { patientUserId: user.id, patientOpenId: user.openId, hospitalName: clean(input.hospitalName, 180), category: clean(input.category, 100), description: clean(input.description, 2000), status: "submitted" as const, staffReply: null };
  const db = await portalDb();
  if (db) {
    const result = await db.insert(serviceRequests).values(values);
    await writeAudit(user, "service_request_created", `Patient service request submitted to ${values.hospitalName}`, "service_request", String(result[0].insertId));
    return (await db.select().from(serviceRequests).where(eq(serviceRequests.id, Number(result[0].insertId))).limit(1))[0];
  }
  const request: MemoryRequest = { id: id("request"), ...values, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  memory.requests.set(request.id, request);
  await writeAudit(user, "service_request_created", `Patient service request submitted to ${values.hospitalName}`, "service_request", request.id);
  return request;
}

export async function updateStaffWorkflow(userInput: User | null, input: { type: "appointment" | "service_request"; id: string; status: string; note?: string }) {
  const user = requireUser(userInput);
  const role = await getPortalRole(user);
  requirePortalRole(role, ["staff", "admin"]);
  const staff = role === "staff" ? await getApprovedStaff(user) : null;
  const hospitalName = staff?.hospitalName;
  const db = await portalDb();
  if (input.type === "appointment") {
    const status = input.status as AppointmentStatus;
    if (!["confirmed", "cancelled", "completed"].includes(status)) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid appointment status." });
    if (db) {
      const row = (await db.select().from(appointments).where(eq(appointments.id, Number(input.id))).limit(1))[0];
      if (!row || (hospitalName && row.hospitalName !== hospitalName)) throw new TRPCError({ code: "NOT_FOUND", message: "Appointment is outside your approved hospital scope." });
      await db.update(appointments).set({ status, staffNote: input.note ? clean(input.note, 1000) : null, updatedAt: new Date() }).where(eq(appointments.id, row.id));
    } else {
      const row = memory.appointments.get(input.id);
      if (!row || (hospitalName && row.hospitalName !== hospitalName)) throw new TRPCError({ code: "NOT_FOUND", message: "Appointment is outside your approved hospital scope." });
      row.status = status;
      row.staffNote = input.note ? clean(input.note, 1000) : null;
      row.updatedAt = new Date().toISOString();
    }
  } else {
    const status = input.status as ServiceRequestStatus;
    if (!["in_review", "resolved", "closed"].includes(status)) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid service-request status." });
    if (db) {
      const row = (await db.select().from(serviceRequests).where(eq(serviceRequests.id, Number(input.id))).limit(1))[0];
      if (!row || (hospitalName && row.hospitalName !== hospitalName)) throw new TRPCError({ code: "NOT_FOUND", message: "Request is outside your approved hospital scope." });
      await db.update(serviceRequests).set({ status, staffReply: input.note ? clean(input.note, 2000) : null, updatedAt: new Date() }).where(eq(serviceRequests.id, row.id));
    } else {
      const row = memory.requests.get(input.id);
      if (!row || (hospitalName && row.hospitalName !== hospitalName)) throw new TRPCError({ code: "NOT_FOUND", message: "Request is outside your approved hospital scope." });
      row.status = status;
      row.staffReply = input.note ? clean(input.note, 2000) : null;
      row.updatedAt = new Date().toISOString();
    }
  }
  await writeAudit(user, "staff_workflow_updated", `${input.type} ${input.id} moved to ${input.status}`, input.type, input.id);
  return { success: true };
}

export async function getPortalSnapshot(userInput: User | null) {
  const user = requireUser(userInput);
  const role = await getPortalRole(user);
  const db = await portalDb();
  const application = await findStaffApplication(user.openId);
  let profile: unknown = null;
  let userAppointments: unknown[] = [];
  let userRequests: unknown[] = [];
  let notifications: unknown[] = [];
  let staffAppointments: unknown[] = [];
  let staffRequests: unknown[] = [];
  let pendingApplications: unknown[] = [];
  if (db) {
    profile = (await db.select().from(patientProfiles).where(eq(patientProfiles.openId, user.openId)).limit(1))[0] ?? null;
    userAppointments = await db.select().from(appointments).where(eq(appointments.patientOpenId, user.openId)).orderBy(desc(appointments.appointmentAt));
    userRequests = await db.select().from(serviceRequests).where(eq(serviceRequests.patientOpenId, user.openId)).orderBy(desc(serviceRequests.createdAt));
    notifications = await db.select().from(portalNotifications).where(eq(portalNotifications.openId, user.openId)).orderBy(desc(portalNotifications.createdAt)).limit(20);
    if (role === "staff" || role === "admin") {
      const hospital = role === "staff" ? (application as any)?.hospitalName : null;
      const allAppointments = await db.select().from(appointments).orderBy(desc(appointments.appointmentAt));
      const allRequests = await db.select().from(serviceRequests).orderBy(desc(serviceRequests.createdAt));
      staffAppointments = hospital ? allAppointments.filter(row => row.hospitalName === hospital) : allAppointments;
      staffRequests = hospital ? allRequests.filter(row => row.hospitalName === hospital) : allRequests;
    }
    if (role === "admin") pendingApplications = await db.select().from(staffApplications).orderBy(desc(staffApplications.appliedAt));
  } else {
    profile = memory.patients.get(user.openId) ?? null;
    userAppointments = [...memory.appointments.values()].filter(row => row.patientOpenId === user.openId).sort((a, b) => b.appointmentAt.localeCompare(a.appointmentAt));
    userRequests = [...memory.requests.values()].filter(row => row.patientOpenId === user.openId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    notifications = [...memory.notifications.values()].filter(row => row.openId === user.openId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 20);
    if (role === "staff" || role === "admin") {
      const hospital = role === "staff" ? (application as MemoryStaffApplication | null)?.hospitalName : null;
      staffAppointments = [...memory.appointments.values()].filter(row => !hospital || row.hospitalName === hospital);
      staffRequests = [...memory.requests.values()].filter(row => !hospital || row.hospitalName === hospital);
    }
    if (role === "admin") pendingApplications = [...memory.applications.values()].sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));
  }
  return { role, profile, staffApplication: application, appointments: userAppointments, serviceRequests: userRequests, notifications, staffAppointments, staffRequests, pendingApplications, actor: { id: user.id, name: user.name, email: user.email } };
}

export async function markNotificationRead(userInput: User | null, notificationId: string) {
  const user = requireUser(userInput);
  const db = await portalDb();
  if (db) await db.update(portalNotifications).set({ readAt: new Date() }).where(and(eq(portalNotifications.id, Number(notificationId)), eq(portalNotifications.openId, user.openId)));
  else {
    const item = memory.notifications.get(notificationId);
    if (item && item.openId === user.openId) item.readAt = new Date().toISOString();
  }
  return { success: true };
}
