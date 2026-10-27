import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/** Core OAuth-backed user table. The server role is authoritative for admin access. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  hospital_id: varchar("hospital_id", { length: 180 }).default("HOSP-DEFAULT").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const staffApplications = mysqlTable("staff_applications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  applicantName: varchar("applicantName", { length: 180 }).notNull(),
  email: varchar("email", { length: 320 }),
  hospitalName: varchar("hospitalName", { length: 180 }).notNull(),
  hospital_id: varchar("hospital_id", { length: 180 }).default("HOSP-DEFAULT").notNull(),
  employeeId: varchar("employeeId", { length: 120 }).notNull(),
  requestedRole: mysqlEnum("requestedRole", ["hospital_staff", "pharmacist", "coordinator"]).notNull().default("hospital_staff"),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "suspended"]).notNull().default("pending"),
  reviewNote: text("reviewNote"),
  appliedAt: timestamp("appliedAt").defaultNow().notNull(),
  reviewedAt: timestamp("reviewedAt"),
  reviewedBy: int("reviewedBy"),
});

export const patientProfiles = mysqlTable("patient_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  displayName: varchar("displayName", { length: 180 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  preferredHospital: varchar("preferredHospital", { length: 180 }),
  hospital_id: varchar("hospital_id", { length: 180 }).default("HOSP-DEFAULT").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  patientUserId: int("patientUserId").notNull(),
  patientOpenId: varchar("patientOpenId", { length: 64 }).notNull(),
  hospitalName: varchar("hospitalName", { length: 180 }).notNull(),
  hospital_id: varchar("hospital_id", { length: 180 }).default("HOSP-DEFAULT").notNull(),
  clinician: varchar("clinician", { length: 180 }).notNull(),
  appointmentAt: timestamp("appointmentAt").notNull(),
  reason: varchar("reason", { length: 500 }).notNull(),
  status: mysqlEnum("status", ["requested", "confirmed", "cancelled", "completed"]).notNull().default("requested"),
  staffNote: text("staffNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const serviceRequests = mysqlTable("service_requests", {
  id: int("id").autoincrement().primaryKey(),
  patientUserId: int("patientUserId").notNull(),
  patientOpenId: varchar("patientOpenId", { length: 64 }).notNull(),
  hospitalName: varchar("hospitalName", { length: 180 }).notNull(),
  hospital_id: varchar("hospital_id", { length: 180 }).default("HOSP-DEFAULT").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description").notNull(),
  status: mysqlEnum("status", ["submitted", "in_review", "resolved", "closed"]).notNull().default("submitted"),
  staffReply: text("staffReply"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const portalNotifications = mysqlTable("portal_notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  openId: varchar("openId", { length: 64 }).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  body: text("body").notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const securityAuditLogs = mysqlTable("security_audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  actorUserId: int("actorUserId"),
  actorOpenId: varchar("actorOpenId", { length: 64 }),
  action: varchar("action", { length: 120 }).notNull(),
  targetType: varchar("targetType", { length: 80 }),
  targetId: varchar("targetId", { length: 120 }),
  detail: text("detail"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type StaffApplication = typeof staffApplications.$inferSelect;
export type PatientProfile = typeof patientProfiles.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type PortalNotification = typeof portalNotifications.$inferSelect;
export type SecurityAuditLog = typeof securityAuditLogs.$inferSelect;
