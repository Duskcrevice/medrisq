import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type TestUser = NonNullable<TrpcContext["user"]>;
const user = (openId: string, role: "user" | "admin" = "user"): TestUser => ({ id: Math.floor(Math.random() * 100000), openId, email: `${openId}@example.test`, name: openId, loginMethod: "test", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() });
const caller = (actor: TestUser) => appRouter.createCaller({ user: actor, req: { headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] });
const anonymousCaller = () => appRouter.createCaller({ user: null, req: { headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] });

describe("secure hospital portals", () => {
  it("rejects direct unauthenticated portal API access", async () => {
    await expect(anonymousCaller().portal.snapshot()).rejects.toThrow("Please login");
  });

  it("keeps staff pending until an administrator reviews the application", async () => {
    const staff = user(`pending-staff-${Date.now()}`);
    const staffCaller = caller(staff);
    await staffCaller.portal.applyForStaff({ hospitalName: "Northbridge General Hospital", employeeId: "DEMO-PENDING", requestedRole: "hospital_staff" });
    const pending = await staffCaller.portal.snapshot();
    expect(pending.role).toBe("pending_staff");
    await expect(staffCaller.portal.updateStaffWorkflow({ type: "appointment", id: "missing", status: "confirmed" })).rejects.toThrow("pending administrator approval");

    const adminCaller = caller(user(`admin-${Date.now()}`, "admin"));
    const approved = await adminCaller.portal.reviewStaffApplication({ openId: staff.openId, status: "approved", reviewNote: "Synthetic test approval" });
    expect(approved.role).toBe("admin");
    const afterApproval = await staffCaller.portal.snapshot();
    expect(afterApproval.role).toBe("staff");
  });

  it("scopes patient records and prevents IDOR cancellation", async () => {
    const patient = user(`test-patient-${Date.now()}`);
    const otherPatient = user(`test-other-patient-${Date.now()}`);
    const patientCaller = caller(patient);
    await patientCaller.portal.registerPatient({ displayName: "Synthetic Patient", phone: "000-000", preferredHospital: "Saint Elara Medical Centre" });
    const appointment = await patientCaller.portal.bookAppointment({ hospitalName: "Saint Elara Medical Centre", clinician: "Dr. Demo", appointmentAt: new Date(Date.now() + 86400000).toISOString(), reason: "Synthetic follow-up" });
    const otherCaller = caller(otherPatient);
    await otherCaller.portal.registerPatient({ displayName: "Other Synthetic Patient" });
    await expect(otherCaller.portal.cancelAppointment({ appointmentId: String(appointment.id) })).rejects.toThrow("Appointment not found");
    const snapshot = await patientCaller.portal.snapshot();
    expect(snapshot.role).toBe("patient");
    expect(snapshot.appointments).toHaveLength(1);
    await expect(patientCaller.portal.applyForStaff({ hospitalName: "Northbridge General Hospital", employeeId: "OVERLAP", requestedRole: "hospital_staff" })).rejects.toThrow("separate verified account");
  });

  it("lets approved staff update only their organization workflow", async () => {
    const patient = user(`workflow-patient-${Date.now()}`);
    const patientCaller = caller(patient);
    await patientCaller.portal.registerPatient({ displayName: "Workflow Patient" });
    const request = await patientCaller.portal.createServiceRequest({ hospitalName: "Northbridge General Hospital", category: "General support", description: "Synthetic support request" });
    const staff = user(`approved-staff-${Date.now()}`);
    const staffCaller = caller(staff);
    await staffCaller.portal.applyForStaff({ hospitalName: "Northbridge General Hospital", employeeId: "DEMO-APPROVED", requestedRole: "hospital_staff" });
    await caller(user(`admin-workflow-${Date.now()}`, "admin")).portal.reviewStaffApplication({ openId: staff.openId, status: "approved" });
    await staffCaller.portal.updateStaffWorkflow({ type: "service_request", id: String(request.id), status: "in_review", note: "Synthetic staff review" });
    const staffSnapshot = await staffCaller.portal.snapshot();
    expect(staffSnapshot.role).toBe("staff");
    expect(staffSnapshot.staffRequests[0]).toMatchObject({ status: "in_review" });
  });

  it("does not allow an administrator role to be created through public staff registration", async () => {
    const adminLikeUser = user(`admin-like-${Date.now()}`, "admin");
    await expect(caller(adminLikeUser).portal.applyForStaff({ hospitalName: "Northbridge General Hospital", employeeId: "TRY-ADMIN", requestedRole: "coordinator" })).rejects.toThrow("Administrators");
  });
});
