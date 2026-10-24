export type DemoRole = "Patient" | "Doctor" | "Hospital Staff" | "Administrator";

export type DemoAccount = {
  id: string;
  email: string;
  displayName: string;
  role: DemoRole;
  salt: string;
  passwordHash: string;
  doctorId?: number;
};

export type DemoDoctor = {
  id: number;
  name: string;
  specialty: string;
  qualifications: string;
  experience: string;
  fee: number;
  photo: string;
  active: boolean;
  hours: string;
  email: string;
  daysOff: string[];
  blockedSlots: string[];
};

export type DemoAppointment = {
  id: number;
  patient: string;
  patientEmail: string;
  doctor: string;
  doctorId: number;
  specialty: string;
  date: string;
  time: string;
  type: "Online" | "In-Person";
  reason: string;
  status: "Confirmed" | "Pending" | "Completed";
  consultationNotes?: string;
  followUpDate?: string;
};

export type DemoPrescription = {
  id: number;
  appointmentId: number;
  patient: string;
  patientEmail: string;
  doctor: string;
  doctorId: number;
  date: string;
  notes: string;
  medicines: string[];
  status: string;
  followUpDate?: string;
};

export type DemoStore = {
  version: 1;
  accounts: DemoAccount[];
  doctors: DemoDoctor[];
  appointments: DemoAppointment[];
  prescriptions: DemoPrescription[];
  tasks: boolean[];
  bedStatus: string;
};

export type DemoSession = { email: string; role: DemoRole };

const STORE_KEY = "mednexus-hackathon-demo-v1";
const SESSION_KEY = "mednexus-hackathon-session-v1";
let memoryStore: DemoStore | null = null;
let memorySession: DemoSession | null = null;
let persistentStorage = true;
let writeFailed = false;

export const DEMO_LOGIN_HINTS: Record<Exclude<DemoRole, "Doctor">, { email: string; password: string }> = {
  Patient: { email: "patient@mednexus.demo", password: "PatientDemo!2026" },
  "Hospital Staff": { email: "staff@mednexus.demo", password: "StaffDemo!2026" },
  Administrator: { email: "admin@mednexus.demo", password: "AdminDemo!2026" },
};

function safeStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    const key = `${STORE_KEY}-probe`;
    window.localStorage.setItem(key, "1");
    window.localStorage.removeItem(key);
    persistentStorage = !writeFailed;
    return window.localStorage;
  } catch {
    persistentStorage = false;
    return null;
  }
}

export function demoPersistenceMode(): "localStorage" | "memory-only" {
  safeStorage();
  return persistentStorage && !writeFailed ? "localStorage" : "memory-only";
}

function randomHex(bytes = 16): string {
  const data = new Uint8Array(bytes);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(data);
  else for (let i = 0; i < bytes; i++) data[i] = Math.floor(Math.random() * 256);
  return Array.from(data, n => n.toString(16).padStart(2, "0")).join("");
}

async function passwordHash(password: string, salt: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}:${password}`));
    return Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2, "0")).join("");
  }
  let value = 2166136261;
  for (const ch of `${salt}:${password}`) value = Math.imul(value ^ ch.charCodeAt(0), 16777619);
  return (value >>> 0).toString(16).padStart(8, "0");
}

function newId(): number {
  return Date.now() + Math.floor(Math.random() * 1000);
}

function readStored(): DemoStore | null {
  if (memoryStore) return memoryStore;
  const storage = safeStorage();
  if (!storage) return null;
  const raw = storage.getItem(STORE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DemoStore;
    if (parsed.version !== 1 || !Array.isArray(parsed.accounts) || !Array.isArray(parsed.doctors) || !Array.isArray(parsed.appointments) || !Array.isArray(parsed.prescriptions)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function persistDemoStore(store: DemoStore): DemoStore {
  memoryStore = store;
  const storage = safeStorage();
  if (storage) {
    try {
      storage.setItem(STORE_KEY, JSON.stringify(store));
      writeFailed = false;
      persistentStorage = true;
    } catch {
      writeFailed = true;
      persistentStorage = false;
    }
  }
  return store;
}

const DEFAULT_DOCTORS: Omit<DemoDoctor, "daysOff" | "blockedSlots">[] = [
  { id: 1, name: "Dr. Priya Nair", specialty: "Cardiology", qualifications: "MBBS, MD, DM (Cardiology)", experience: "14 years", fee: 1200, photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&h=256&q=80", active: true, hours: "09:00 - 15:00", email: "priya.nair@mednexus.demo" },
  { id: 2, name: "Dr. Arjun Mehta", specialty: "General Medicine", qualifications: "MBBS, MD (Medicine)", experience: "9 years", fee: 800, photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&h=256&q=80", active: true, hours: "10:00 - 16:00", email: "arjun.mehta@mednexus.demo" },
  { id: 3, name: "Dr. Sneha Rao", specialty: "Neurology", qualifications: "MBBS, MD, DM (Neurology)", experience: "17 years", fee: 1500, photo: "https://images.unsplash.com/photo-1594824813588-e8cb9b87612f?auto=format&fit=crop&w=256&h=256&q=80", active: true, hours: "11:00 - 17:00", email: "sneha.rao@mednexus.demo" },
  { id: 4, name: "Dr. Om Mishra", specialty: "Cardiology", qualifications: "MBBS, MD, FACC", experience: "21 years", fee: 1800, photo: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&h=256&q=80", active: true, hours: "09:00 - 13:00", email: "om.mishra@mednexus.demo" },
  { id: 5, name: "Dr. Karan Bose", specialty: "Orthopedics", qualifications: "MBBS, MS (Ortho)", experience: "11 years", fee: 1000, photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=256&h=256&q=80", active: true, hours: "10:00 - 16:00", email: "karan.bose@mednexus.demo" },
  { id: 6, name: "Dr. Lakshmi Iyer", specialty: "Pediatrics", qualifications: "MBBS, DCH, MD (Peds)", experience: "8 years", fee: 750, photo: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=256&h=256&q=80", active: true, hours: "09:00 - 14:00", email: "lakshmi.iyer@mednexus.demo" },
];

export async function ensureDemoStore(): Promise<DemoStore> {
  const existing = readStored();
  if (existing) return existing;
  const seeds = Object.entries(DEMO_LOGIN_HINTS) as [Exclude<DemoRole, "Doctor">, { email: string; password: string }][];
  const accounts = await Promise.all(seeds.map(async ([role, credentials]) => {
    const salt = randomHex();
    return {
      id: `seed-${role.toLowerCase().replaceAll(" ", "-")}`,
      email: credentials.email,
      displayName: role === "Patient" ? "Vittika Bairathi" : role === "Hospital Staff" ? "Sister Anjali" : "Network Admin",
      role,
      salt,
      passwordHash: await passwordHash(credentials.password, salt),
    } satisfies DemoAccount;
  }));

  const initialDoctors: DemoDoctor[] = DEFAULT_DOCTORS.map(d => ({
    ...d,
    daysOff: [],
    blockedSlots: [],
  }));

  const created: DemoStore = {
    version: 1,
    accounts,
    doctors: initialDoctors,
    appointments: [
      {
        id: 101,
        patient: "Vittika Bairathi",
        patientEmail: "vittikabairathi35@gmail.com",
        doctor: "Dr. Om Mishra",
        doctorId: 4,
        specialty: "Cardiology",
        date: "2026-10-26",
        time: "10:30",
        type: "In-Person",
        reason: "Cardiovascular health follow-up and ECG screening",
        status: "Confirmed",
        consultationNotes: "Blood pressure elevated at last visit (145/95). Recommended ECG & lipid profile.",
        followUpDate: "2026-11-02",
      }
    ],
    prescriptions: [
      {
        id: 201,
        appointmentId: 101,
        patient: "Vittika Bairathi",
        patientEmail: "vittikabairathi35@gmail.com",
        doctor: "Dr. Om Mishra",
        doctorId: 4,
        date: "2026-10-20",
        notes: "Take after meals. Monitor blood pressure twice weekly.",
        medicines: ["Telmisartan 40mg (Once daily)", "Atorvastatin 10mg (At bedtime)"],
        status: "Active",
        followUpDate: "2026-11-02",
      }
    ],
    tasks: [false, false, false, false],
    bedStatus: "36",
  };
  return persistDemoStore(created);
}

export async function loginDemo(email: string, password: string, role: DemoRole): Promise<DemoAccount | null> {
  const store = await ensureDemoStore();
  const account = store.accounts.find(a => a.email.toLowerCase() === email.trim().toLowerCase() && a.role === role);
  if (!account || (await passwordHash(password, account.salt)) !== account.passwordHash) return null;
  const session: DemoSession = { email: account.email, role: account.role };
  memorySession = session;
  try { window.localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch { persistentStorage = false; }
  return account;
}

export function getDemoSession(): DemoSession | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as DemoSession;
    if (["Patient", "Doctor", "Hospital Staff", "Administrator"].includes(session.role) && typeof session.email === "string") return session;
  } catch {}
  return memorySession;
}

export async function getSessionAccount(): Promise<DemoAccount | null> {
  const session = getDemoSession();
  if (!session) return null;
  const store = await ensureDemoStore();
  return store.accounts.find(account => account.email === session.email && account.role === session.role) || null;
}

export function logoutDemo(): void {
  memorySession = null;
  try { window.localStorage.removeItem(SESSION_KEY); } catch {}
}

export function makeDemoPassword(): string {
  return `DemoDoc-${Math.floor(1000 + Math.random() * 9000)}!`;
}

export async function addDemoDoctor(
  base: DemoStore,
  input: Omit<DemoDoctor, "id" | "active" | "daysOff" | "blockedSlots"> & { password: string }
): Promise<{ store: DemoStore; doctor: DemoDoctor }> {
  const email = input.email.trim().toLowerCase();
  if (base.accounts.some(account => account.email.toLowerCase() === email)) throw new Error("That demo account email is already assigned.");
  const doctorId = newId();
  const salt = randomHex();
  const account: DemoAccount = {
    id: `doctor-${doctorId}`,
    email,
    displayName: input.name,
    role: "Doctor",
    salt,
    passwordHash: await passwordHash(input.password, salt),
    doctorId,
  };
  const doctor: DemoDoctor = {
    id: doctorId,
    name: input.name,
    specialty: input.specialty,
    qualifications: input.qualifications,
    experience: input.experience,
    fee: input.fee,
    photo: input.photo,
    active: true,
    hours: input.hours,
    email,
    daysOff: [],
    blockedSlots: [],
  };
  return { store: { ...base, accounts: [...base.accounts, account], doctors: [...base.doctors, doctor] }, doctor };
}

export function isDemoSlotBusy(store: DemoStore, doctorId: number, date: string, time: string): boolean {
  const doctor = store.doctors.find(item => item.id === doctorId);
  return !doctor || !doctor.active || doctor.daysOff.includes(date) || doctor.blockedSlots.includes(`${date}|${time}`) ||
    store.appointments.some(item => item.doctorId === doctorId && item.date === date && item.time === time);
}

export function defaultDoctorEmail(name: string): string {
  const slug = name.toLowerCase().replace(/^(dr\.?\s*)/, "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "") || "doctor";
  return `${slug}@mednexus.demo`;
}
