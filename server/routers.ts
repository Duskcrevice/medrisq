import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  acknowledgeAlert,
  createEmergencyRequest,
  getDemoSnapshot,
  getRoleDashboard,
  resetDemo,
  searchResources,
  transitionRequest,
  verifyMedicine,
} from "./demoStore";
import {
  approveRescue,
  createReferral,
  getInnovationSnapshot,
  resetInnovation,
  simulateDisaster,
  transitionReferral,
} from "./innovationStore";
import {
  applyForStaff,
  bookAppointment,
  cancelAppointment,
  createServiceRequest,
  getAppointments,
  getDoctors,
  getPortalSnapshot,
  markNotificationRead,
  registerPatient,
  reviewStaffApplication,
  updateStaffWorkflow,
} from "./portalStore";
import {
  checkPrescriptionSafety,
  HT01_TEST_CASES,
  SAMPLE_REPORTS,
  simplifyCustomReport,
  getCentralSyncVisits,
  syncClientBatch,
  resolveConflict,
} from "./hackathonStore";
import {
  executeAiBooking,
  interpretWithGeminiOrLocal,
  validateCsvContent,
} from "./aiBookingService";
import type { User } from "../drizzle/schema";

const demoRole = z.enum(["public", "hospital", "pharmacist", "coordinator", "admin"]);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  demo: router({
    snapshot: publicProcedure.query(() => getDemoSnapshot()),
    resources: publicProcedure.input(z.object({ query: z.string().optional(), district: z.string().optional(), kind: z.string().optional() }).optional()).query(({ input }) => searchResources(input || {})),
    verifyMedicine: publicProcedure.input(z.object({ identifier: z.string().min(1), batch: z.string().optional() })).mutation(({ input }) => verifyMedicine(input)),
    createRequest: publicProcedure.input(z.object({ requester: z.string().min(1), resource: z.string().min(1), quantity: z.number().positive(), unit: z.string().min(1), urgency: z.enum(["Critical", "High", "Routine"]), note: z.string().optional() })).mutation(({ input }) => createEmergencyRequest(input)),
    transitionRequest: publicProcedure.input(z.object({ requestId: z.string(), action: z.enum(["approve", "reject", "dispatch", "receive", "cancel"]), role: demoRole })).mutation(({ input }) => transitionRequest(input)),
    acknowledgeAlert: publicProcedure.input(z.object({ id: z.string() })).mutation(({ input }) => acknowledgeAlert(input.id)),
    reset: publicProcedure.mutation(() => resetDemo()),
    getRoleDashboard: publicProcedure.input(z.object({ role: demoRole })).query(({ input }) => getRoleDashboard(input.role)),
    innovations: publicProcedure.query(() => getInnovationSnapshot()),
    simulateDisaster: publicProcedure.input(z.object({ scenario: z.string(), severity: z.number().min(0).max(100) })).mutation(({ input }) => simulateDisaster(input)),
    createReferral: publicProcedure.input(z.object({ origin: z.string().min(1), need: z.string().min(1), capability: z.string().min(1), urgency: z.enum(["Critical", "High", "Routine"]) })).mutation(({ input }) => createReferral(input)),
    transitionReferral: publicProcedure.input(z.object({ id: z.string(), status: z.enum(["Accepted", "Declined", "Completed"]) })).mutation(({ input }) => transitionReferral(input)),
    approveRescue: publicProcedure.input(z.object({ id: z.string() })).mutation(({ input }) => approveRescue(input)),
    resetInnovations: publicProcedure.mutation(() => resetInnovation()),
  }),
  portal: router({
    snapshot: protectedProcedure.query(({ ctx }) => getPortalSnapshot(ctx.user)),
    getDoctors: publicProcedure.input(z.object({ specialization: z.string().optional(), hospital: z.string().optional(), minRating: z.number().optional() }).optional()).query(({ input }) => getDoctors(input)),
    getAppointments: protectedProcedure.query(({ ctx }) => getAppointments(ctx.user)),
    registerPatient: protectedProcedure.input(z.object({ displayName: z.string().min(2).max(180), phone: z.string().max(40).optional(), preferredHospital: z.string().max(180).optional() })).mutation(({ ctx, input }) => registerPatient(ctx.user, input)),
    applyForStaff: protectedProcedure.input(z.object({ hospitalName: z.string().min(3).max(180), employeeId: z.string().min(3).max(120), requestedRole: z.enum(["hospital_staff", "pharmacist", "coordinator"]) })).mutation(({ ctx, input }) => applyForStaff(ctx.user, input)),
    reviewStaffApplication: protectedProcedure.input(z.object({ openId: z.string().min(1), status: z.enum(["approved", "rejected", "suspended"]), reviewNote: z.string().max(1000).optional() })).mutation(({ ctx, input }) => reviewStaffApplication(ctx.user, input)),
    bookAppointment: protectedProcedure.input(z.object({
      hospitalName: z.string().max(180).optional(),
      clinician: z.string().max(180).optional(),
      appointmentAt: z.string().optional(),
      date: z.string().optional(),
      doctorId: z.string().optional(),
      patientName: z.string().optional(),
      reason: z.string().min(5).max(500),
    })).mutation(({ ctx, input }) => bookAppointment(ctx.user, input)),
    cancelAppointment: protectedProcedure.input(z.object({ appointmentId: z.string().min(1) })).mutation(({ ctx, input }) => cancelAppointment(ctx.user, input.appointmentId)),
    createServiceRequest: protectedProcedure.input(z.object({ hospitalName: z.string().min(3).max(180), category: z.string().min(2).max(100), description: z.string().min(5).max(2000) })).mutation(({ ctx, input }) => createServiceRequest(ctx.user, input)),
    updateStaffWorkflow: protectedProcedure.input(z.object({ type: z.enum(["appointment", "service_request"]), id: z.string().min(1), status: z.string().min(1), note: z.string().max(2000).optional() })).mutation(({ ctx, input }) => updateStaffWorkflow(ctx.user, input)),
    markNotificationRead: protectedProcedure.input(z.object({ notificationId: z.string().min(1) })).mutation(({ ctx, input }) => markNotificationRead(ctx.user, input.notificationId)),
  }),
  hackathon: router({
    // HT-01: Medication Error Detection
    checkPrescription: publicProcedure.input(z.object({
      patient: z.object({
        name: z.string(),
        age: z.number(),
        weightKg: z.number().optional(),
        gender: z.enum(["male", "female", "other"]).optional(),
        allergies: z.array(z.string()),
        conditions: z.array(z.string()),
        pregnancyStatus: z.enum(["none", "first_trimester", "second_trimester", "third_trimester"]).optional(),
        kidneyFunctionEgfr: z.number().optional(),
      }),
      drugs: z.array(z.object({
        drugName: z.string(),
        activeIngredients: z.array(z.string()),
        dose: z.number(),
        unit: z.string(),
        frequency: z.string(),
        route: z.string(),
        durationDays: z.number().optional(),
      })),
    })).mutation(({ input }) => checkPrescriptionSafety(input.patient, input.drugs)),
    getTestCases: publicProcedure.query(() => HT01_TEST_CASES),

    // HT-02: Medical Report Simplification
    getSampleReports: publicProcedure.query(() => SAMPLE_REPORTS),
    simplifyCustomReport: publicProcedure.input(z.object({
      patientName: z.string(),
      reportType: z.string(),
      measurements: z.array(z.object({
        testName: z.string(),
        measuredValue: z.number(),
        unit: z.string(),
        referenceMin: z.number(),
        referenceMax: z.number(),
      })),
    })).mutation(({ input }) => simplifyCustomReport(input.patientName, input.reportType, input.measurements)),

    // HT-03: Healthcare Without Internet
    getCentralVisits: publicProcedure.query(() => getCentralSyncVisits()),
    syncBatch: publicProcedure.input(z.object({
      visits: z.array(z.any()),
    })).mutation(({ input }) => syncClientBatch(input.visits)),
    resolveConflict: publicProcedure.input(z.object({
      visitId: z.string(),
      resolution: z.enum(["KEEP_LOCAL", "KEEP_SERVER", "MERGE"]),
      mergedNotes: z.string().optional(),
    })).mutation(({ input }) => resolveConflict(input.visitId, input.resolution, input.mergedNotes)),
  }),
  aiBooking: router({
    interpret: publicProcedure.input(z.object({
      instruction: z.string().min(1),
      modality: z.enum(["text", "voice", "screenshot"]).default("text"),
      imageBase64: z.string().optional(),
    })).mutation(async ({ input }) => {
      return interpretWithGeminiOrLocal(input.instruction, input.modality, input.imageBase64);
    }),
    validateCsv: publicProcedure.input(z.object({
      csvContent: z.string().min(1),
    })).mutation(async ({ input }) => {
      return validateCsvContent(input.csvContent);
    }),
    confirmBooking: protectedProcedure.input(z.object({
      doctorId: z.string().optional(),
      doctorName: z.string().optional(),
      hospitalName: z.string().optional(),
      date: z.string(),
      time: z.string().optional(),
      appointmentAt: z.string().optional(),
      reason: z.string().min(3),
      patientName: z.string().optional(),
      idempotencyKey: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      return executeAiBooking(ctx.user, input);
    }),
    confirmDemoBooking: publicProcedure.input(z.object({
      doctorId: z.string().optional(),
      doctorName: z.string().optional(),
      hospitalName: z.string().optional(),
      date: z.string(),
      time: z.string().optional(),
      appointmentAt: z.string().optional(),
      reason: z.string().min(3),
      patientName: z.string().optional(),
      idempotencyKey: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const actorUser: User = ctx.user || {
        id: 999,
        openId: "patient-demo-guest",
        name: input.patientName || "Guest Patient",
        email: "guest@mednexus.org",
        loginMethod: "demo",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };
      return executeAiBooking(actorUser, input);
    }),
    batchConfirmBookings: protectedProcedure.input(z.object({
      bookings: z.array(z.object({
        doctorId: z.string().optional(),
        doctorName: z.string().optional(),
        hospitalName: z.string().optional(),
        date: z.string(),
        time: z.string().optional(),
        appointmentAt: z.string().optional(),
        reason: z.string().min(3),
        patientName: z.string().optional(),
        idempotencyKey: z.string().optional(),
      })),
    })).mutation(async ({ ctx, input }) => {
      const results = [];
      for (const b of input.bookings) {
        try {
          const res = await executeAiBooking(ctx.user, b);
          results.push({ ...res, success: true });
        } catch (err: any) {
          results.push({ success: false, message: err.message, date: b.date, doctor: b.doctorName });
        }
      }
      return { total: input.bookings.length, results };
    }),
  }),
});

export type AppRouter = typeof appRouter;
