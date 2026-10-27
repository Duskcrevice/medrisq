import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type TestUser = NonNullable<TrpcContext["user"]>;
const user = (openId: string, role: "user" | "admin" = "user", hospital_id = "HOSP-DEFAULT"): TestUser => ({
  id: Math.floor(Math.random() * 100000),
  openId,
  email: `${openId}@example.test`,
  name: openId,
  loginMethod: "test",
  role,
  hospital_id,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
});
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
    await expect(otherCaller.portal.cancelAppointment({ appointmentId: String(appointment.appointment.id) })).rejects.toThrow("Appointment not found");
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

  describe("ITEM 5: TENANT ISOLATION (Multi-Hospital Isolation)", () => {
    it("enforces tenant isolation: hospital_id set from verified user and users cannot read Hospital B records", async () => {
      const patientA = user(`pat-hosp-a-${Date.now()}`, "user", "HOSPITAL-ALPHA");
      const patientB = user(`pat-hosp-b-${Date.now()}`, "user", "HOSPITAL-BETA");
      const callerA = caller(patientA);
      const callerB = caller(patientB);

      await callerA.portal.registerPatient({ displayName: "Alpha Patient", preferredHospital: "Hospital Alpha" });
      await callerB.portal.registerPatient({ displayName: "Beta Patient", preferredHospital: "Hospital Beta" });

      // Patient A books an appointment (hospital_id set to HOSPITAL-ALPHA from verified record)
      const aptA = await callerA.portal.bookAppointment({
        hospitalName: "Hospital Alpha",
        clinician: "Dr. Alpha",
        reason: "Alpha checkup",
        appointmentAt: new Date(Date.now() + 86400000).toISOString(),
      });
      expect((aptA.appointment as any).hospital_id).toBe("HOSPITAL-ALPHA");

      // Patient B books an appointment (hospital_id set to HOSPITAL-BETA from verified record)
      const aptB = await callerB.portal.bookAppointment({
        hospitalName: "Hospital Beta",
        clinician: "Dr. Beta",
        reason: "Beta checkup",
        appointmentAt: new Date(Date.now() + 86400000 * 2).toISOString(),
      });
      expect((aptB.appointment as any).hospital_id).toBe("HOSPITAL-BETA");

      // Patient A cannot read Patient B's records via getAppointments
      const appointmentsA = await callerA.portal.getAppointments();
      expect(appointmentsA.every((apt: any) => apt.hospital_id === "HOSPITAL-ALPHA")).toBe(true);
      expect(appointmentsA.some((apt: any) => apt.id === aptB.appointment.id)).toBe(false);

      // Patient B cannot read Patient A's records via getAppointments
      const appointmentsB = await callerB.portal.getAppointments();
      expect(appointmentsB.every((apt: any) => apt.hospital_id === "HOSPITAL-BETA")).toBe(true);
      expect(appointmentsB.some((apt: any) => apt.id === aptA.appointment.id)).toBe(false);

      // Snapshot also isolates appointments and requests
      const snapA = await callerA.portal.snapshot();
      expect(snapA.appointments.every((apt: any) => apt.hospital_id === "HOSPITAL-ALPHA")).toBe(true);
      expect(snapA.appointments.some((apt: any) => apt.id === aptB.appointment.id)).toBe(false);
    });

    it("prevents Hospital A user from modifying/cancelling Hospital B records even by passing Hospital B ID", async () => {
      const patientA = user(`pat-mod-a-${Date.now()}`, "user", "HOSPITAL-ALPHA");
      const patientB = user(`pat-mod-b-${Date.now()}`, "user", "HOSPITAL-BETA");
      const callerA = caller(patientA);
      const callerB = caller(patientB);

      await callerA.portal.registerPatient({ displayName: "Alpha Patient" });
      await callerB.portal.registerPatient({ displayName: "Beta Patient" });

      const aptB = await callerB.portal.bookAppointment({
        hospitalName: "Hospital Beta",
        reason: "Beta private appointment",
        appointmentAt: new Date(Date.now() + 86400000).toISOString(),
      });

      // Hospital A user attempts to cancel Hospital B's appointment by passing its exact ID
      await expect(callerA.portal.cancelAppointment({ appointmentId: String(aptB.appointment.id) }))
        .rejects.toThrow("Appointment not found");
    });

    it("ignores client input attempting to spoof another hospital_id upon booking or request creation", async () => {
      const patientA = user(`pat-spoof-a-${Date.now()}`, "user", "HOSPITAL-ALPHA");
      const callerA = caller(patientA);
      await callerA.portal.registerPatient({ displayName: "Alpha Spoof Tester" });

      // Patient from Hospital A attempts to pass Hospital Beta in booking
      const maliciousBooking = await callerA.portal.bookAppointment({
        hospitalName: "Hospital Beta",
        reason: "Attempting to spoof Hospital Beta",
        appointmentAt: new Date(Date.now() + 86400000).toISOString(),
      });

      // The server MUST enforce patientA's verified hospital_id ("HOSPITAL-ALPHA")
      expect((maliciousBooking.appointment as any).hospital_id).toBe("HOSPITAL-ALPHA");

      // Patient from Hospital A creates service request attempting to target Hospital Beta
      const serviceReq = await callerA.portal.createServiceRequest({
        hospitalName: "Hospital Beta",
        category: "Laboratory",
        description: "Attempting to access Beta lab services",
      });
      expect((serviceReq as any).hospital_id).toBe("HOSPITAL-ALPHA");
    });

    it("enforces staff isolation: staff from Hospital Alpha cannot update Hospital Beta workflow", async () => {
      // Create Patient in Hospital Beta and book appointment
      const patientB = user(`pat-staff-b-${Date.now()}`, "user", "HOSPITAL-BETA");
      const callerPatientB = caller(patientB);
      await callerPatientB.portal.registerPatient({ displayName: "Beta Patient" });
      const aptB = await callerPatientB.portal.bookAppointment({
        hospitalName: "Hospital Beta",
        reason: "Orthopedic consultation",
        appointmentAt: new Date(Date.now() + 86400000).toISOString(),
      });
      const reqB = await callerPatientB.portal.createServiceRequest({
        hospitalName: "Hospital Beta",
        category: "Billing",
        description: "Billing query for Hospital Beta",
      });

      // Staff member enrolled in Hospital Alpha
      const staffA = user(`applicant-alpha-${Date.now()}`, "user", "HOSPITAL-ALPHA");
      const staffCallerA = caller(staffA);
      await staffCallerA.portal.applyForStaff({
        hospitalName: "Hospital Alpha",
        employeeId: "ALPHA-STAFF-100",
        requestedRole: "hospital_staff",
      });

      const adminCaller = caller(user(`admin-tenant-${Date.now()}`, "admin"));
      await adminCaller.portal.reviewStaffApplication({ openId: staffA.openId, status: "approved" });

      // Staff from Hospital Alpha attempts to update Hospital Beta's appointment
      await expect(staffCallerA.portal.updateStaffWorkflow({
        type: "appointment",
        id: String(aptB.appointment.id),
        status: "confirmed",
        note: "Malicious cross-tenant update",
      })).rejects.toThrow("Appointment is outside your approved hospital scope.");

      // Staff from Hospital Alpha attempts to update Hospital Beta's service request
      await expect(staffCallerA.portal.updateStaffWorkflow({
        type: "service_request",
        id: String(reqB.id),
        status: "resolved",
        note: "Malicious cross-tenant resolution",
      })).rejects.toThrow("Request is outside your approved hospital scope.");

      // Staff A's snapshot only contains Hospital Alpha records, zero Hospital Beta records
      const staffSnapA = await staffCallerA.portal.snapshot();
      expect(staffSnapA.staffAppointments.some((a: any) => a.id === aptB.appointment.id)).toBe(false);
      expect(staffSnapA.staffRequests.some((r: any) => r.id === reqB.id)).toBe(false);
    });
  });
});
