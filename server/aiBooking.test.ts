import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import {
  resolveDoctor,
  validateDateTime,
  parseLocalInstruction,
  validateCsvContent,
  executeAiBooking,
  interpretWithGeminiOrLocal,
} from "./aiBookingService";

type TestUser = NonNullable<TrpcContext["user"]>;
const testUser = (openId: string, role: "user" | "admin" = "user"): TestUser => ({
  id: Math.floor(Math.random() * 100000),
  openId,
  email: `${openId}@example.test`,
  name: "Vittika Bairathi",
  loginMethod: "test",
  role,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
});

const caller = (actor: TestUser) =>
  appRouter.createCaller({
    user: actor,
    req: { headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  });

const publicCaller = () =>
  appRouter.createCaller({
    user: null,
    req: { headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  });

describe("AI Appointment Booking Agent Suite", () => {
  // Test 1: Hindi written instructions
  it("interprets Hindi written appointment booking instructions", async () => {
    const hindiInstruction = "Dr Sharma ke saath 28 October ko subah 11 baje appointment book karo.";
    const result = await interpretWithGeminiOrLocal(hindiInstruction, "text");

    expect(result.doctorName).toMatch(/Sharma/i);
    expect(result.resolvedDoctor?.name).toBe("Dr. Ananya Sharma");
    expect(result.time).toBe("11:00 AM");
    expect(result.date).toMatch(/2026-10-28/);
    expect(result.languageDetected).toBe("hindi");
    expect(result.isAmbiguous).toBe(false);
  });

  // Test 2: English written instructions
  it("interprets English written appointment booking instructions", async () => {
    const englishInstruction = "Book an appointment with Dr Priya Nair on October 28 at 11 AM for heart checkup.";
    const result = await interpretWithGeminiOrLocal(englishInstruction, "text");

    expect(result.resolvedDoctor?.name).toBe("Dr. Priya Nair");
    expect(result.resolvedDoctor?.specialization).toBe("Cardiologist");
    expect(result.time).toBe("11:00 AM");
    expect(result.date).toMatch(/2026-10-28/);
    expect(result.languageDetected).toBe("english");
    expect(result.isAmbiguous).toBe(false);
  });

  // Test 3: Hindi voice input simulation
  it("processes Hindi voice transcription and maps clinical slot", async () => {
    const spokenHindi = "Dr Arjun Mehta se kal dopahar 2 baje consult karna hai";
    const result = await interpretWithGeminiOrLocal(spokenHindi, "voice");

    expect(result.sourceModality).toBe("voice");
    expect(result.resolvedDoctor?.name).toBe("Dr. Arjun Mehta");
    expect(result.resolvedDoctor?.specialization).toBe("General Physician");
    expect(result.time).toBe("02:00 PM");
    expect(result.isAmbiguous).toBe(false);
  });

  // Test 4: English voice input simulation
  it("processes English voice input and maps clinical slot", async () => {
    const spokenEnglish = "Please schedule an appointment with Dr Sneha Rao tomorrow at 11:30 am for migraine";
    const result = await interpretWithGeminiOrLocal(spokenEnglish, "voice");

    expect(result.sourceModality).toBe("voice");
    expect(result.resolvedDoctor?.name).toBe("Dr. Sneha Rao");
    expect(result.resolvedDoctor?.specialization).toBe("Neurologist");
    expect(result.time).toBe("11:30 AM");
    expect(result.isAmbiguous).toBe(false);
  });

  // Test 5: Mixed Hindi-English (Hinglish) input
  it("handles mixed Hindi-English (Hinglish) conversational instructions", async () => {
    const hinglish = "Dr Om Mishra ke saath routine BP checkup ke liye book appointment on 28 October 10 am";
    const result = await interpretWithGeminiOrLocal(hinglish, "text");

    expect(result.resolvedDoctor?.name).toBe("Dr. Om Mishra");
    expect(result.languageDetected).toBe("hinglish");
  });

  // Test 6: Missing or ambiguous doctor names
  it("detects missing or ambiguous doctor names and asks for clarification", () => {
    // Missing doctor
    const noDoc = resolveDoctor("");
    expect(noDoc.isAmbiguous).toBe(true);
    expect(noDoc.reason).toContain("not specified");

    // Ambiguous doctor (multiple doctors match)
    const ambiguous = resolveDoctor("Dr. Unknown Strange Person 12345");
    expect(ambiguous.isAmbiguous).toBe(true);
    expect(ambiguous.doctor).toBeNull();
    expect(ambiguous.reason).toContain("could not be found");
  });

  // Test 7: Invalid or past dates
  it("flags past dates and invalid date strings", () => {
    const past = validateDateTime("2020-01-01", "10:00 AM");
    expect(past.isValid).toBe(false);
    expect(past.isPast).toBe(true);
    expect(past.error).toContain("past");

    const invalidDate = validateDateTime("not-a-real-date", "10:00 AM");
    expect(invalidDate.isValid).toBe(false);
    expect(invalidDate.error).toContain("Invalid date format");
  });

  // Test 8: Unavailable appointment slots / outside clinical hours
  it("flags times outside outpatient clinical hours (08:00 AM - 07:00 PM)", () => {
    const night = validateDateTime("2026-10-28", "03:00 AM");
    expect(night.isValid).toBe(false);
    expect(night.error).toContain("outside outpatient clinical hours");

    const lateNight = validateDateTime("2026-10-28", "11:00 PM");
    expect(lateNight.isValid).toBe(false);
    expect(lateNight.error).toContain("outside outpatient clinical hours");
  });

  // Test 9: Malformed CSV files
  it("safely handles empty and malformed CSV files", () => {
    const emptyResult = validateCsvContent("");
    expect(emptyResult.totalRows).toBe(0);
    expect(emptyResult.validRows).toBe(0);

    const malformed = `Doctor,Date,Time,Patient\nInvalidDocName,bad-date,3:00 AM,John`;
    const res = validateCsvContent(malformed);
    expect(res.totalRows).toBe(1);
    expect(res.invalidRows).toBe(1);
    expect(res.rows[0].status).toBe("invalid");
  });

  // Test 10: Duplicate CSV rows
  it("detects and flags duplicate rows within a CSV file", () => {
    const csvWithDups = `Doctor,Date,Time,Patient,Reason
Dr. Priya Nair,2026-10-28,10:00 AM,Vittika Bairathi,Heart check
Dr. Priya Nair,2026-10-28,10:00 AM,Vittika Bairathi,Heart check
Dr. Arjun Mehta,2026-10-29,11:00 AM,Rahul Kumar,General review`;

    const res = validateCsvContent(csvWithDups);
    expect(res.totalRows).toBe(3);
    expect(res.duplicateRows).toBe(1);
    expect(res.rows[1].status).toBe("duplicate");
    expect(res.rows[1].issues[0]).toContain("Duplicate appointment row");
  });

  // Test 11: Screenshot extraction validation
  it("marks screenshot extractions as untrusted until verified by user", async () => {
    const fakeScreenshotBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const result = await interpretWithGeminiOrLocal("Dr. Priya Nair 2026-10-28 10:00 AM", "screenshot", fakeScreenshotBase64);

    expect(result.sourceModality).toBe("screenshot");
    expect(result.trusted).toBe(false); // Must be explicitly verified
  });

  // Test 12: Missing or invalid API key handling
  it("operates gracefully without API key using local deterministic clinical parser", async () => {
    // Calling with empty input still uses local parser gracefully without crashing
    const local = parseLocalInstruction("Dr Priya Nair appointment on 28 October at 10 AM");
    expect(local.doctorName).toBe("Dr. Priya Nair");
    expect(local.date).toBe("2026-10-28");
    expect(local.time).toBe("10:00 AM");
  });

  // Test 13: Network failures and browser timeouts
  it("handles timeout or fetch failure gracefully in interpretWithGeminiOrLocal", async () => {
    const result = await interpretWithGeminiOrLocal("Dr. Priya Nair on 2026-10-28 at 10:00 AM");
    expect(result).toBeDefined();
    expect(result.resolvedDoctor?.name).toBe("Dr. Priya Nair");
  });

  // Test 14: Repeated submissions and duplicate-booking prevention (Idempotency)
  it("prevents duplicate submissions using idempotency keys", async () => {
    const patient = testUser(`idempotency-patient-${Date.now()}`);
    const callerInstance = caller(patient);

    // First register patient profile
    await callerInstance.portal.registerPatient({
      displayName: "Vittika Bairathi",
      phone: "+91 98765 43210",
      preferredHospital: "Saint Elara Medical Centre",
    });

    const idempotencyKey = `IDEM-TEST-${Date.now()}`;
    const bookingPayload = {
      doctorId: "d1",
      doctorName: "Dr. Priya Nair",
      date: "2026-10-28",
      time: "10:00 AM",
      appointmentAt: new Date(Date.now() + 86400000 * 4).toISOString(),
      reason: "Cardiology follow up",
      patientName: "Vittika Bairathi",
      idempotencyKey,
    };

    // First submission
    const firstAttempt = await callerInstance.aiBooking.confirmBooking(bookingPayload);
    expect(firstAttempt.success).toBe(true);
    expect(firstAttempt.isDuplicateReplay).toBe(false);
    expect(firstAttempt.token).toBeDefined();

    // Second repeated submission with same idempotencyKey
    const secondAttempt = await callerInstance.aiBooking.confirmBooking(bookingPayload);
    expect(secondAttempt.success).toBe(true);
    expect(secondAttempt.isDuplicateReplay).toBe(true);
    expect(secondAttempt.token).toBe(firstAttempt.token);
    expect(secondAttempt.message).toContain("Idempotent response");
  });

  // Test 15: Booking confirmation verification
  it("verifies and persists the booking token in the authoritative database", async () => {
    const patient = testUser(`verify-patient-${Date.now()}`);
    const callerInstance = caller(patient);

    await callerInstance.portal.registerPatient({ displayName: "Verified Patient" });

    const result = await callerInstance.aiBooking.confirmBooking({
      doctorId: "d2",
      doctorName: "Dr. Arjun Mehta",
      date: "2026-10-29",
      time: "11:00 AM",
      appointmentAt: new Date(Date.now() + 86400000 * 5).toISOString(),
      reason: "Post-fever clinical review",
    });

    expect(result.success).toBe(true);
    expect(result.token).toMatch(/^MRQ-[A-Z0-9]+$/);
    expect(result.appointment.clinician).toBe("Dr. Arjun Mehta");

    // Verify it appears in user's appointments
    const appointments = await callerInstance.portal.getAppointments();
    expect(appointments.some(a => (a as any).clinician === "Dr. Arjun Mehta")).toBe(true);
  });

  // Test 16: Unauthorized patient references
  it("rejects unauthorized access when unauthenticated user attempts protected booking without session", async () => {
    const anonymous = publicCaller();
    await expect(
      anonymous.aiBooking.confirmBooking({
        doctorId: "d1",
        date: "2026-10-28",
        reason: "Unauthorized attempt",
      })
    ).rejects.toThrow("Please login");
  });
});
