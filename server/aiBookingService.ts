import { ENV } from "./_core/env";
import { DOCTORS, bookAppointment, type Doctor } from "./portalStore";
import type { User } from "../drizzle/schema";

export interface ParsedAppointmentDraft {
  rawInstruction: string;
  sourceModality: "text" | "voice" | "csv" | "screenshot";
  languageDetected?: "hindi" | "english" | "hinglish";
  confidence: number;
  doctorName?: string;
  resolvedDoctor?: {
    id: string;
    name: string;
    specialization: string;
    hospital: string;
    availability: string;
  } | null;
  date?: string; // YYYY-MM-DD
  time?: string; // e.g. "11:00 AM"
  isoDateTime?: string; // ISO string
  reason?: string;
  patientReference?: string;
  isAmbiguous: boolean;
  ambiguityReason?: string;
  validationErrors: string[];
  suggestedClarification?: string;
  slotAvailable: boolean;
  slotConflictReason?: string;
  trusted: boolean;
}

export interface CsvRowValidation {
  rowNumber: number;
  rawData: Record<string, string>;
  doctorName: string;
  resolvedDoctor: { id: string; name: string; specialization: string; hospital: string } | null;
  date: string;
  time: string;
  isoDateTime: string | null;
  patientName: string;
  reason: string;
  status: "valid" | "warning" | "invalid" | "duplicate";
  issues: string[];
}

export interface CsvBatchResult {
  totalRows: number;
  validRows: number;
  warningRows: number;
  invalidRows: number;
  duplicateRows: number;
  rows: CsvRowValidation[];
}

// In-memory idempotency cache for duplicate booking protection
const idempotencyStore = new Map<string, {
  timestamp: number;
  token: string;
  appointmentId: string | number;
  details: any;
}>();

// Clean up stale idempotency records after 24 hours
function cleanStaleIdempotency() {
  const cutoff = Date.now() - 86400000;
  for (const [key, value] of idempotencyStore.entries()) {
    if (value.timestamp < cutoff) idempotencyStore.delete(key);
  }
}

/**
 * Normalizes strings for tolerant matching
 */
function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export const AUTHORITATIVE_DOCTORS: Doctor[] = [
  ...DOCTORS,
  { id: "d101", name: "Dr. Om Mishra", specialization: "Cardiologist", experience: 14, rating: 4.9, hospital: "MEDNEXUS General Hospital", availability: "Mon–Fri, 09:00 - 14:00", avatar: "OM", image: "" },
  { id: "d102", name: "Dr. Rajesh Gupta", specialization: "Pediatrician", experience: 9, rating: 4.7, hospital: "MEDNEXUS General Hospital", availability: "Mon–Fri, 09:00 - 13:00", avatar: "RG", image: "" },
  { id: "d103", name: "Dr. Vikram Sethi", specialization: "Orthopedic", experience: 16, rating: 4.9, hospital: "MEDNEXUS General Hospital", availability: "Mon–Sat, 10:00 - 14:00", avatar: "VS", image: "" },
  { id: "d104", name: "Dr. Kavita Joshi", specialization: "Gynecologist", experience: 13, rating: 4.8, hospital: "MEDNEXUS General Hospital", availability: "Mon–Fri, 11:00 - 15:30", avatar: "KJ", image: "" },
  { id: "d105", name: "Dr. Sunita Sen", specialization: "Endocrinologist", experience: 12, rating: 4.9, hospital: "MEDNEXUS General Hospital", availability: "Mon–Sat, 13:00 - 17:00", avatar: "SS", image: "" },
];

/**
 * Resolves doctor name against authoritative doctor directory
 */
export function resolveDoctor(nameQuery?: string): {
  doctor: Doctor | null;
  isAmbiguous: boolean;
  candidates: Doctor[];
  reason?: string;
} {
  if (!nameQuery || !nameQuery.trim()) {
    return { doctor: null, isAmbiguous: true, candidates: [], reason: "Doctor name was not specified." };
  }

  const cleanQuery = nameQuery.trim().replace(/^dr\.?\s+/i, "").toLowerCase();
  const normQuery = normalize(cleanQuery);

  // 1. Exact match by full name or id
  const exact = AUTHORITATIVE_DOCTORS.find(
    d => d.name.toLowerCase() === nameQuery.toLowerCase() ||
         d.name.toLowerCase().replace(/^dr\.?\s+/i, "") === cleanQuery ||
         d.id.toLowerCase() === cleanQuery
  );
  if (exact) return { doctor: exact, isAmbiguous: false, candidates: [exact] };

  // 2. Partial match (last name, first name)
  const matches = AUTHORITATIVE_DOCTORS.filter(d => {
    const dClean = d.name.toLowerCase().replace(/^dr\.?\s+/i, "");
    const parts = dClean.split(/\s+/);
    const qParts = cleanQuery.split(/\s+/);

    // match full normalized
    if (normalize(dClean).includes(normQuery) || normQuery.includes(normalize(dClean))) return true;

    // match any name component (e.g. "sharma", "nair", "mehta")
    return parts.some(p => qParts.some(q => p === q || (q.length >= 3 && p.startsWith(q))));
  });

  if (matches.length === 1) {
    return { doctor: matches[0], isAmbiguous: false, candidates: matches };
  }

  if (matches.length > 1) {
    return {
      doctor: null,
      isAmbiguous: true,
      candidates: matches,
      reason: `Multiple doctors match '${nameQuery}' (${matches.map(m => m.name).join(", ")}). Please specify the full name or specialty.`
    };
  }

  // 3. Match by specialization (e.g., "cardiologist", "gynecologist", "dermatologist")
  const specialtyMatches = DOCTORS.filter(d =>
    d.specialization.toLowerCase().includes(cleanQuery) || cleanQuery.includes(d.specialization.toLowerCase())
  );
  if (specialtyMatches.length === 1) {
    return { doctor: specialtyMatches[0], isAmbiguous: false, candidates: specialtyMatches };
  }
  if (specialtyMatches.length > 1) {
    return {
      doctor: null,
      isAmbiguous: true,
      candidates: specialtyMatches,
      reason: `Found ${specialtyMatches.length} doctors under specialty '${nameQuery}'. Please pick a specific doctor: ${specialtyMatches.map(m => m.name).join(", ")}.`
    };
  }

  return {
    doctor: null,
    isAmbiguous: true,
    candidates: [],
    reason: `Doctor '${nameQuery}' could not be found in the authorized MEDNEXUS directory.`
  };
}

/**
 * Validates date and time slot
 */
export function validateDateTime(dateStr?: string, timeStr?: string): {
  isValid: boolean;
  isoDateTime: string | null;
  error?: string;
  isPast: boolean;
} {
  if (!dateStr) {
    return { isValid: false, isoDateTime: null, error: "Appointment date is required.", isPast: false };
  }

  // Parse time
  let hours = 10;
  let minutes = 0;
  if (timeStr) {
    const timeMatch = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch) {
      let h = parseInt(timeMatch[1], 10);
      const m = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const meridiem = timeMatch[3]?.toLowerCase();

      if (meridiem === "pm" && h < 12) h += 12;
      if (meridiem === "am" && h === 12) h = 0;

      hours = h;
      minutes = m;
    }
  }

  // Parse date
  let targetDate: Date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-").map(Number);
    targetDate = new Date(y, m - 1, d, hours, minutes, 0);
  } else {
    targetDate = new Date(`${dateStr} ${hours}:${minutes}:00`);
  }

  if (isNaN(targetDate.getTime())) {
    return { isValid: false, isoDateTime: null, error: `Invalid date format: '${dateStr}'. Please use YYYY-MM-DD or standard date format.`, isPast: false };
  }

  const now = new Date();
  if (targetDate.getTime() < now.getTime()) {
    return {
      isValid: false,
      isoDateTime: targetDate.toISOString(),
      error: `Appointment time cannot be in the past (${targetDate.toLocaleString()}). Please choose a future date.`,
      isPast: true
    };
  }

  // Check clinic hours: 08:00 to 19:00
  if (hours < 8 || hours >= 19) {
    return {
      isValid: false,
      isoDateTime: targetDate.toISOString(),
      error: `Requested time ${timeStr || `${hours}:${minutes}`} is outside outpatient clinical hours (08:00 AM - 07:00 PM).`,
      isPast: false
    };
  }

  return { isValid: true, isoDateTime: targetDate.toISOString(), isPast: false };
}

/**
 * Intelligent Hindi & English rule-based NLP parser
 */
export function parseLocalInstruction(text: string): {
  doctorName?: string;
  date?: string;
  time?: string;
  reason?: string;
  patientReference?: string;
  languageDetected: "hindi" | "english" | "hinglish";
} {
  const lower = text.toLowerCase();

  // Detect language
  const hindiWords = /\b(ke\s*saath|ko|subah|shaam|dopahar|baje|karo|kariye|tareekh|aaj|kal|parso|chahiye|kripya|se|ke\s*liye)\b/i;
  const englishGrammar = /\b(with|on|at|please|for|schedule|routine|checkup|tomorrow|today)\b/i;

  const hasHindi = hindiWords.test(lower);
  const hasEnglish = englishGrammar.test(lower);
  const languageDetected = hasHindi && hasEnglish ? "hinglish" : hasHindi ? "hindi" : "english";

  let doctorName: string | undefined;
  let date: string | undefined;
  let time: string | undefined;
  let reason: string | undefined;
  let patientReference: string | undefined;

  // Extract doctor name
  // Hindi pattern: "Dr [Name] ke saath" or "Doctor [Name] ke saath"
  const hindiDocMatch = text.match(/(?:dr\.?|doctor)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)?)(?:\s+ke\s+saath|\s+se|\s+ko)/i);
  // English pattern: "with (?:dr\.?|doctor)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)?)" or "dr\.?\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)?)"
  const engDocMatch = text.match(/(?:with\s+)?(?:dr\.?|doctor)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/i);

  if (hindiDocMatch) {
    doctorName = `Dr. ${hindiDocMatch[1].trim()}`;
  } else if (engDocMatch) {
    doctorName = `Dr. ${engDocMatch[1].trim()}`;
  } else {
    // Check known doctors list
    for (const d of AUTHORITATIVE_DOCTORS) {
      const surname = d.name.split(" ").slice(-1)[0];
      if (lower.includes(surname.toLowerCase())) {
        doctorName = d.name;
        break;
      }
    }
  }

  // Extract time
  // Hindi time patterns: "subah 11 baje", "dopahar 2 baje", "shaam 5 baje", "11 baje"
  const hindiTimeMatch = text.match(/(?:(subah|shaam|dopahar|raat)\s+)?(\d{1,2})(?::(\d{2}))?\s*baje/i);
  // English time patterns: "11 am", "11:00 am", "at 11", "2 pm"
  const engTimeMatch = text.match(/(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);

  if (hindiTimeMatch) {
    const period = hindiTimeMatch[1]?.toLowerCase();
    const h = parseInt(hindiTimeMatch[2], 10);
    const m = hindiTimeMatch[3] ? `:${hindiTimeMatch[3]}` : ":00";
    let meridiem = "AM";
    if (period === "shaam" || period === "dopahar" || period === "raat" || (h >= 1 && h <= 6 && !period)) {
      meridiem = "PM";
    }
    time = `${h < 10 ? `0${h}` : h}${m} ${meridiem}`;
  } else if (engTimeMatch) {
    const h = parseInt(engTimeMatch[1], 10);
    const m = engTimeMatch[2] ? `:${engTimeMatch[2]}` : ":00";
    const meridiem = engTimeMatch[3].toUpperCase();
    time = `${h < 10 ? `0${h}` : h}${m} ${meridiem}`;
  }

  // Extract date
  const now = new Date();
  const currentYear = now.getFullYear();

  // Relative dates in Hindi / English
  if (/\b(kal|tomorrow)\b/i.test(lower)) {
    const d = new Date(now.getTime() + 86400000);
    date = d.toISOString().split("T")[0];
  } else if (/\b(parso|day\s+after\s+tomorrow)\b/i.test(lower)) {
    const d = new Date(now.getTime() + 86400000 * 2);
    date = d.toISOString().split("T")[0];
  } else if (/\b(aaj|today)\b/i.test(lower)) {
    date = now.toISOString().split("T")[0];
  } else {
    // Explicit date: "28 October", "28th October", "October 28", "Oct 28th", "2026-10-28"
    const dateMatch = text.match(/(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)(?:\s+(\d{4}))?/i);
    const monthFirstMatch = text.match(/(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s+(\d{4}))?/i);
    const isoDateMatch = text.match(/(\d{4})-(\d{2})-(\d{2})/);

    const months: Record<string, string> = {
      january: "01", jan: "01", february: "02", feb: "02", march: "03", mar: "03",
      april: "04", apr: "04", may: "05", june: "06", jun: "06", july: "07", jul: "07",
      august: "08", aug: "08", september: "09", sep: "09", october: "10", oct: "10",
      november: "11", nov: "11", december: "12", dec: "12"
    };

    if (isoDateMatch) {
      date = `${isoDateMatch[1]}-${isoDateMatch[2]}-${isoDateMatch[3]}`;
    } else if (dateMatch) {
      const day = parseInt(dateMatch[1], 10);
      const monthName = dateMatch[2].toLowerCase();
      const year = dateMatch[3] ? parseInt(dateMatch[3], 10) : currentYear;
      const month = months[monthName] || "10";
      date = `${year}-${month}-${day < 10 ? `0${day}` : day}`;
    } else if (monthFirstMatch) {
      const monthName = monthFirstMatch[1].toLowerCase();
      const day = parseInt(monthFirstMatch[2], 10);
      const year = monthFirstMatch[3] ? parseInt(monthFirstMatch[3], 10) : currentYear;
      const month = months[monthName] || "10";
      date = `${year}-${month}-${day < 10 ? `0${day}` : day}`;
    }
  }

  // Extract reason
  const reasonMatch = text.match(/(?:for|reason|due to|cause|chahiye)\s+([a-zA-Z\s]{4,40})/i);
  if (reasonMatch) {
    reason = reasonMatch[1].trim();
  } else {
    reason = "General Medical Consultation & Evaluation";
  }

  // Extract patient reference
  const patientMatch = text.match(/(?:patient|mariz|mri)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/i);
  if (patientMatch) {
    patientReference = patientMatch[1].trim();
  }

  return { doctorName, date, time, reason, patientReference, languageDetected };
}

/**
 * Server-side audio transcriber using Groq Whisper, OpenAI Whisper, or Gemini
 */
export async function transcribeAudioBuffer(
  audioBuffer: Buffer,
  mimeType: string = "audio/webm"
): Promise<{ transcript: string; language?: string } | null> {
  // 1. Try Groq Whisper (free, sub-second, state-of-the-art Hindi / Indian English)
  if (ENV.groqApiKey) {
    try {
      const formData = new FormData();
      const blob = new Blob([new Uint8Array(audioBuffer)], { type: mimeType });
      formData.append("file", blob, "recording.webm");
      formData.append("model", "whisper-large-v3");
      formData.append("prompt", "Medical appointment booking in Hindi or English (Dr Sharma, Dr Nair, Dr Mehta, Dr Mishra, tarikh, baje)");

      const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${ENV.groqApiKey}` },
        body: formData,
        signal: AbortSignal.timeout(12000),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.text) return { transcript: data.text.trim(), language: data.language };
      }
    } catch (e) {
      console.error("Groq Whisper error:", e);
    }
  }

  // 2. Try OpenAI Whisper
  if (ENV.openaiApiKey) {
    try {
      const formData = new FormData();
      const blob = new Blob([new Uint8Array(audioBuffer)], { type: mimeType });
      formData.append("file", blob, "recording.webm");
      formData.append("model", "whisper-1");
      formData.append("prompt", "Medical appointment booking in Hindi or English (Dr Sharma, Dr Nair, Dr Mehta, Dr Mishra)");

      const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${ENV.openaiApiKey}` },
        body: formData,
        signal: AbortSignal.timeout(12000),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.text) return { transcript: data.text.trim(), language: data.language };
      }
    } catch (e) {
      console.error("OpenAI Whisper error:", e);
    }
  }

  // 3. Try Gemini multimodal audio
  if (ENV.geminiApiKey) {
    try {
      const base64 = audioBuffer.toString("base64");
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${ENV.geminiApiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inlineData: { mimeType, data: base64 } },
              { text: "Listen carefully to this audio in Hindi, English, or mixed Hinglish. Transcribe the exact words spoken. Return ONLY the transcribed text." }
            ]
          }]
        }),
        signal: AbortSignal.timeout(15000)
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) return { transcript: text };
      }
    } catch (e) {
      console.error("Gemini audio error:", e);
    }
  }

  return null;
}

/**
 * Calls Google Gemini API if GEMINI_API_KEY is available and has quota.
 * Falls back to local NLP parser on rate limits, errors, or offline.
 */
export async function interpretWithGeminiOrLocal(
  rawInput: string,
  modality: "text" | "voice" | "screenshot" = "text",
  imageBase64?: string,
  audioBase64?: string
): Promise<ParsedAppointmentDraft> {
  // If voice audio base64 is provided, transcribe audio first
  if (modality === "voice" && audioBase64) {
    try {
      const cleanBase64 = audioBase64.replace(/^data:audio\/[a-zA-Z0-9]+;base64,/, "");
      const buffer = Buffer.from(cleanBase64, "base64");
      const transcription = await transcribeAudioBuffer(buffer, "audio/webm");
      if (transcription?.transcript) {
        rawInput = transcription.transcript;
      }
    } catch (err) {
      console.error("Error processing voice audio:", err);
    }
  }

  let draftData: {
    doctorName?: string;
    date?: string;
    time?: string;
    reason?: string;
    patientReference?: string;
    languageDetected?: "hindi" | "english" | "hinglish";
  } = {};

  const apiKey = ENV.geminiApiKey;
  let usedGemini = false;

  if (apiKey && apiKey.trim()) {
    try {
      const parts: any[] = [];

      if (modality === "screenshot" && imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, "");
        parts.push({
          inlineData: {
            mimeType: "image/png",
            data: cleanBase64
          }
        });
        parts.push({
          text: `You are an AI Healthcare Appointment Assistant. Inspect this appointment screenshot. Extract the doctor's name, clinic/hospital, appointment date (YYYY-MM-DD), appointment time (e.g. 11:00 AM), patient name, and reason for visit.
Return ONLY valid raw JSON with keys:
{
  "doctorName": string | null,
  "date": "YYYY-MM-DD" | null,
  "time": "HH:MM AM/PM" | null,
  "reason": string | null,
  "patientReference": string | null
}`
        });
      } else {
        parts.push({
          text: `You are an AI Healthcare Appointment Assistant for MEDNEXUS General Hospital.
Input text: "${rawInput}"
This instruction may be in conversational Hindi, English, or mixed Hinglish.
Extract the intended doctor name, appointment date (formatted as YYYY-MM-DD, considering today is in year 2026), appointment time (e.g. 10:00 AM or 11:00 AM), patient name/reference if mentioned, and medical reason/symptoms.
Language detected should be "hindi", "english", or "hinglish".
Return ONLY a valid raw JSON object without markdown or code fences:
{
  "doctorName": string | null,
  "date": "YYYY-MM-DD" | null,
  "time": "HH:MM AM/PM" | null,
  "reason": string | null,
  "patientReference": string | null,
  "languageDetected": "hindi" | "english" | "hinglish"
}`
        });
      }

      // Try fast models with snappy 2.5s timeout, falling back smoothly to local parser
      const modelNames = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-flash-latest"];
      for (const model of modelNames) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts }] }),
            signal: AbortSignal.timeout(2500)
          });

          if (res.ok) {
            const data = await res.json();
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) {
              const cleanJson = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
              draftData = JSON.parse(cleanJson);
              usedGemini = true;
              break;
            }
          }
        } catch {
          // Continue to next model or local fallback
        }
      }
    } catch {
      // Graceful fallback to deterministic local parser
    }
  }

  // If Gemini was not used or failed (quota 429 / offline), use local NLP engine
  if (!usedGemini) {
    const local = parseLocalInstruction(rawInput);
    draftData = {
      doctorName: draftData.doctorName || local.doctorName,
      date: draftData.date || local.date,
      time: draftData.time || local.time,
      reason: draftData.reason || local.reason,
      patientReference: draftData.patientReference || local.patientReference,
      languageDetected: draftData.languageDetected || local.languageDetected,
    };
  }

  // Resolve Doctor against Directory
  const docResolution = resolveDoctor(draftData.doctorName);
  const resolvedDoctor = docResolution.doctor ? {
    id: docResolution.doctor.id,
    name: docResolution.doctor.name,
    specialization: docResolution.doctor.specialization,
    hospital: docResolution.doctor.hospital,
    availability: docResolution.doctor.availability
  } : null;

  // Validate Date & Time
  const dtValidation = validateDateTime(draftData.date, draftData.time);

  const validationErrors: string[] = [];
  let isAmbiguous = false;
  let ambiguityReason: string | undefined;
  let suggestedClarification: string | undefined;

  if (docResolution.isAmbiguous) {
    isAmbiguous = true;
    ambiguityReason = docResolution.reason;
    validationErrors.push(docResolution.reason || "Doctor could not be confirmed.");
    suggestedClarification = docResolution.candidates.length > 0
      ? `Did you mean: ${docResolution.candidates.map(c => `${c.name} (${c.specialization})`).join(" or ")}?`
      : "Please state the doctor's full name (e.g., Dr. Priya Nair, Dr. Om Mishra, Dr. Ananya Sharma).";
  }

  if (!dtValidation.isValid) {
    validationErrors.push(dtValidation.error || "Invalid appointment date/time.");
  }

  return {
    rawInstruction: rawInput,
    sourceModality: modality,
    languageDetected: draftData.languageDetected || "english",
    confidence: usedGemini ? 0.95 : 0.88,
    doctorName: draftData.doctorName || resolvedDoctor?.name,
    resolvedDoctor,
    date: draftData.date,
    time: draftData.time,
    isoDateTime: dtValidation.isoDateTime || undefined,
    reason: draftData.reason || "Outpatient Clinical Consultation",
    patientReference: draftData.patientReference,
    isAmbiguous,
    ambiguityReason,
    validationErrors,
    suggestedClarification,
    slotAvailable: dtValidation.isValid && !docResolution.isAmbiguous,
    trusted: modality !== "screenshot", // Screenshot extraction must always be explicitly validated
  };
}

/**
 * Validates a batch of CSV rows for appointment booking
 */
export function validateCsvContent(csvText: string): CsvBatchResult {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    return {
      totalRows: 0,
      validRows: 0,
      warningRows: 0,
      invalidRows: 0,
      duplicateRows: 0,
      rows: []
    };
  }

  const headerLine = lines[0];
  const headers = headerLine.split(",").map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ""));

  // Detect column indexes
  const docIdx = headers.findIndex(h => /doctor|physician|clinician|provider/i.test(h));
  const dateIdx = headers.findIndex(h => /date|day|appointment_date/i.test(h));
  const timeIdx = headers.findIndex(h => /time|slot|hour/i.test(h));
  const patientIdx = headers.findIndex(h => /patient|name|client/i.test(h));
  const reasonIdx = headers.findIndex(h => /reason|symptoms|dept|notes/i.test(h));

  const rows: CsvRowValidation[] = [];
  const seenSignatures = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    const cols = rawLine.split(",").map(c => c.trim().replace(/^["']|["']$/g, ""));
    const rawData: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rawData[h] = cols[idx] || "";
    });

    const docName = (docIdx !== -1 ? cols[docIdx] : cols[0]) || "";
    const dateStr = (dateIdx !== -1 ? cols[dateIdx] : cols[1]) || "";
    const timeStr = (timeIdx !== -1 ? cols[timeIdx] : cols[2]) || "10:00 AM";
    const patientName = (patientIdx !== -1 ? cols[patientIdx] : "Self") || "Self";
    const reason = (reasonIdx !== -1 ? cols[reasonIdx] : cols[3]) || "Routine check-up";

    const issues: string[] = [];
    let status: "valid" | "warning" | "invalid" | "duplicate" = "valid";

    // 1. Doctor resolution
    const docRes = resolveDoctor(docName);
    if (!docRes.doctor) {
      status = "invalid";
      issues.push(docRes.reason || `Unknown doctor: ${docName}`);
    }

    // 2. Date validation
    const dtVal = validateDateTime(dateStr, timeStr);
    if (!dtVal.isValid) {
      status = "invalid";
      issues.push(dtVal.error || "Invalid date or time");
    }

    // 3. Duplicate row check
    const signature = `${normalize(docName)}_${dateStr}_${normalize(timeStr)}_${normalize(patientName)}`;
    if (seenSignatures.has(signature)) {
      status = "duplicate";
      issues.push("Duplicate appointment row detected in this CSV file.");
    } else {
      seenSignatures.add(signature);
    }

    // If valid but minor note
    if (status === "valid" && !reason) {
      status = "warning";
      issues.push("No consultation reason supplied (default will be used).");
    }

    rows.push({
      rowNumber: i,
      rawData,
      doctorName: docName,
      resolvedDoctor: docRes.doctor ? {
        id: docRes.doctor.id,
        name: docRes.doctor.name,
        specialization: docRes.doctor.specialization,
        hospital: docRes.doctor.hospital
      } : null,
      date: dateStr,
      time: timeStr,
      isoDateTime: dtVal.isoDateTime,
      patientName,
      reason,
      status,
      issues
    });
  }

  const validRows = rows.filter(r => r.status === "valid").length;
  const warningRows = rows.filter(r => r.status === "warning").length;
  const invalidRows = rows.filter(r => r.status === "invalid").length;
  const duplicateRows = rows.filter(r => r.status === "duplicate").length;

  return {
    totalRows: rows.length,
    validRows,
    warningRows,
    invalidRows,
    duplicateRows,
    rows
  };
}

/**
 * Commits an authorized booking through the existing booking system with duplicate protection
 */
export async function executeAiBooking(
  user: User,
  bookingData: {
    doctorId?: string;
    doctorName?: string;
    hospitalName?: string;
    date: string;
    time?: string;
    appointmentAt?: string;
    reason: string;
    patientName?: string;
    idempotencyKey?: string;
  }
) {
  cleanStaleIdempotency();

  // 1. Idempotency check to prevent duplicate submission
  if (bookingData.idempotencyKey && idempotencyStore.has(bookingData.idempotencyKey)) {
    const existing = idempotencyStore.get(bookingData.idempotencyKey)!;
    return {
      success: true,
      isDuplicateReplay: true,
      token: existing.token,
      appointment: existing.details,
      message: "Idempotent response: Appointment was already confirmed."
    };
  }

  // 2. Resolve Doctor
  const resolved = bookingData.doctorId
    ? DOCTORS.find(d => d.id === bookingData.doctorId)
    : resolveDoctor(bookingData.doctorName).doctor;

  if (!resolved && !bookingData.doctorName) {
    throw new Error("Cannot book without an authoritative doctor reference.");
  }

  // 3. Prepare ISO date
  const isoDate = bookingData.appointmentAt || validateDateTime(bookingData.date, bookingData.time).isoDateTime;
  if (!isoDate) {
    throw new Error("Invalid appointment schedule.");
  }

  // 4. Reuse existing authorized appointment persistence
  const result = await bookAppointment(user, {
    doctorId: resolved?.id,
    clinician: resolved?.name || bookingData.doctorName,
    hospitalName: resolved?.hospital || bookingData.hospitalName || "Saint Elara Medical Centre",
    appointmentAt: isoDate,
    reason: bookingData.reason,
    patientName: bookingData.patientName || user.name || "Patient"
  });

  // 5. Record in Idempotency store
  if (bookingData.idempotencyKey) {
    idempotencyStore.set(bookingData.idempotencyKey, {
      timestamp: Date.now(),
      token: result.token,
      appointmentId: (result.appointment as any).id,
      details: result.appointment
    });
  }

  return {
    success: true,
    isDuplicateReplay: false,
    token: result.token,
    appointment: result.appointment,
    message: `Appointment verified and confirmed with ${resolved?.name || bookingData.doctorName}.`
  };
}
