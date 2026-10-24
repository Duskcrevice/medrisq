CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patientUserId` int NOT NULL,
	`patientOpenId` varchar(64) NOT NULL,
	`hospitalName` varchar(180) NOT NULL,
	`clinician` varchar(180) NOT NULL,
	`appointmentAt` timestamp NOT NULL,
	`reason` varchar(500) NOT NULL,
	`status` enum('requested','confirmed','cancelled','completed') NOT NULL DEFAULT 'requested',
	`staffNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patient_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`openId` varchar(64) NOT NULL,
	`displayName` varchar(180) NOT NULL,
	`phone` varchar(40),
	`preferredHospital` varchar(180),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patient_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `patient_profiles_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `portal_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`openId` varchar(64) NOT NULL,
	`title` varchar(180) NOT NULL,
	`body` text NOT NULL,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `portal_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `security_audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actorUserId` int,
	`actorOpenId` varchar(64),
	`action` varchar(120) NOT NULL,
	`targetType` varchar(80),
	`targetId` varchar(120),
	`detail` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `security_audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `service_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patientUserId` int NOT NULL,
	`patientOpenId` varchar(64) NOT NULL,
	`hospitalName` varchar(180) NOT NULL,
	`category` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`status` enum('submitted','in_review','resolved','closed') NOT NULL DEFAULT 'submitted',
	`staffReply` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `service_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `staff_applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`openId` varchar(64) NOT NULL,
	`applicantName` varchar(180) NOT NULL,
	`email` varchar(320),
	`hospitalName` varchar(180) NOT NULL,
	`employeeId` varchar(120) NOT NULL,
	`requestedRole` enum('hospital_staff','pharmacist','coordinator') NOT NULL DEFAULT 'hospital_staff',
	`status` enum('pending','approved','rejected','suspended') NOT NULL DEFAULT 'pending',
	`reviewNote` text,
	`appliedAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	`reviewedBy` int,
	CONSTRAINT `staff_applications_id` PRIMARY KEY(`id`),
	CONSTRAINT `staff_applications_openId_unique` UNIQUE(`openId`)
);
