import { describe, expect, it } from "vitest";
import {
  checkPrescriptionSafety,
  HT01_TEST_CASES,
  simplifyCustomReport,
  SAMPLE_REPORTS,
  syncClientBatch,
  resolveConflict,
  getCentralSyncVisits,
  type PrescribedDrug,
  type PatientContext,
  type OfflinePatientVisit,
} from "./hackathonStore";

describe("HT-01: AI System for Detecting Medication Errors", () => {
  it("clears a standard safe prescription without raising false alerts", () => {
    const patient: PatientContext = {
      name: "Aman Gupta",
      age: 26,
      weightKg: 68,
      allergies: [],
      conditions: [],
    };
    const drugs: PrescribedDrug[] = [
      { drugName: "Amoxicillin", activeIngredients: ["amoxicillin"], dose: 500, unit: "mg", frequency: "TID", route: "oral" },
    ];

    const result = checkPrescriptionSafety(patient, drugs);
    expect(result.overallStatus).toBe("SAFE");
    expect(result.alerts.length).toBe(0);
    expect(result.coverageLimitations.coveredScope.length).toBeGreaterThan(0);
    expect(result.coverageLimitations.outsideCoverage.length).toBeGreaterThan(0);
  });

  it("flags lethal Nitroglycerin + Sildenafil drug-drug interaction with CRITICAL_STOP and rule citation", () => {
    const patient: PatientContext = {
      name: "Ramesh Sharma",
      age: 58,
      weightKg: 82,
      allergies: [],
      conditions: ["angina"],
    };
    const drugs: PrescribedDrug[] = [
      { drugName: "Nitroglycerin Sublingual", activeIngredients: ["nitroglycerin"], dose: 0.5, unit: "mg", frequency: "PRN", route: "sublingual" },
      { drugName: "Sildenafil", activeIngredients: ["sildenafil"], dose: 50, unit: "mg", frequency: "once daily", route: "oral" },
    ];

    const result = checkPrescriptionSafety(patient, drugs);
    expect(result.overallStatus).toBe("UNSAFE");
    const ddiAlert = result.alerts.find(a => a.category === "DRUG_INTERACTION");
    expect(ddiAlert).toBeDefined();
    expect(ddiAlert?.severity).toBe("CRITICAL_STOP");
    expect(ddiAlert?.ruleCode).toBe("DDI-101");
    expect(ddiAlert?.citation).toContain("FDA");
  });

  it("identifies penicillin allergy cross-reactivity with beta-lactam Augmentin", () => {
    const patient: PatientContext = {
      name: "Sneha Patel",
      age: 34,
      allergies: ["penicillin"],
      conditions: ["sinusitis"],
    };
    const drugs: PrescribedDrug[] = [
      { drugName: "Augmentin 625", activeIngredients: ["amoxicillin", "clavulanate"], dose: 625, unit: "mg", frequency: "BID", route: "oral" },
    ];

    const result = checkPrescriptionSafety(patient, drugs);
    expect(result.overallStatus).toBe("UNSAFE");
    const algAlert = result.alerts.find(a => a.category === "ALLERGY_CONFLICT");
    expect(algAlert).toBeDefined();
    expect(algAlert?.ruleCode).toBe("ALG-201");
  });

  it("catches pediatric single-dose paracetamol overdose based on child weight", () => {
    const child: PatientContext = {
      name: "Aarav (Child)",
      age: 7,
      weightKg: 20, // 15 mg/kg = max 300 mg per dose
      allergies: [],
      conditions: [],
    };
    const drugs: PrescribedDrug[] = [
      { drugName: "Crocin 650", activeIngredients: ["paracetamol"], dose: 650, unit: "mg", frequency: "QID", route: "oral" },
    ];

    const result = checkPrescriptionSafety(child, drugs);
    expect(result.overallStatus).toBe("UNSAFE");
    const doseAlert = result.alerts.find(a => a.category === "DOSAGE_LIMIT");
    expect(doseAlert).toBeDefined();
    expect(doseAlert?.description).toContain("exceeds maximum recommended pediatric threshold");
  });

  it("detects polypharmacy duplicate active ingredient across different brand formulations", () => {
    const patient: PatientContext = {
      name: "Meera Sen",
      age: 48,
      allergies: [],
      conditions: ["osteoarthritis"],
    };
    const drugs: PrescribedDrug[] = [
      { drugName: "Combiflam", activeIngredients: ["ibuprofen", "paracetamol"], dose: 400, unit: "mg", frequency: "TID", route: "oral" },
      { drugName: "Dolo 650", activeIngredients: ["paracetamol"], dose: 650, unit: "mg", frequency: "TID", route: "oral" },
    ];

    const result = checkPrescriptionSafety(patient, drugs);
    const dupAlert = result.alerts.find(a => a.category === "DUPLICATE_INGREDIENT");
    expect(dupAlert).toBeDefined();
    expect(dupAlert?.title).toContain("PARACETAMOL");
  });

  it("all 5 prepared benchmark test cases evaluate to expected outcomes", () => {
    for (const tc of HT01_TEST_CASES) {
      const outcome = checkPrescriptionSafety(tc.patient, tc.drugs);
      expect(outcome.overallStatus).toBe(tc.expectedOutcome);
    }
  });
});

describe("HT-02: AI Medical Report Simplification System", () => {
  it("preserves exact values, units, and stated reference intervals without mutation", () => {
    const sample = SAMPLE_REPORTS[0];
    expect(sample.measurements.length).toBeGreaterThan(0);

    for (const m of sample.measurements) {
      expect(typeof m.measuredValue).toBe("number");
      expect(m.unit.length).toBeGreaterThan(0);
      expect(m.referenceRange.length).toBeGreaterThan(0);
      const valStr = String(m.measuredValue);
      const formatted = m.measuredValue.toLocaleString();
      expect(m.plainLanguageExplanation.includes(valStr) || m.plainLanguageExplanation.includes(formatted)).toBe(true);
      expect(m.plainLanguageExplanation).toContain(m.unit);
    }

    expect(sample.factualConsistencyAudit.valuesMatched).toBe(true);
    expect(sample.factualConsistencyAudit.unitsMatched).toBe(true);
    expect(sample.factualConsistencyAudit.noDiagnosedPathology).toBe(true);
  });

  it("flags out-of-range parameters and creates relevant questions for the clinician", () => {
    const custom = simplifyCustomReport("Test Patient", "Electrolyte Panel", [
      { testName: "Sodium", measuredValue: 128, unit: "mmol/L", referenceMin: 135, referenceMax: 145 },
      { testName: "Chloride", measuredValue: 102, unit: "mmol/L", referenceMin: 96, referenceMax: 106 },
    ]);

    expect(custom.measurements[0].flag).toBe("LOW");
    expect(custom.measurements[1].flag).toBe("NORMAL");
    expect(custom.questionsForClinician.length).toBeGreaterThan(0);
    expect(custom.questionsForClinician[0]).toContain("Sodium");
    expect(custom.disclaimer).toContain("strictly does not provide medical diagnoses");
  });
});

describe("HT-03: Healthcare Without Internet", () => {
  it("synchronizes newly captured offline visits into central storage", () => {
    const newOfflineVisit: OfflinePatientVisit = {
      id: `visit-test-${Date.now()}`,
      patientId: "p-test-01",
      patientName: "Gita Devi",
      timestamp: new Date().toISOString(),
      facilityLocation: "Remote Camp Beta",
      vitals: { bloodPressure: "120/80", heartRate: 72, temperatureF: 98.4, spO2: 99 },
      triageComplaint: "Minor abrasion",
      dispensedMedicines: ["Povidone Iodine dressing"],
      clinicianNotes: "Dressing done",
      recordedByRole: "Field Nurse",
      syncState: "LOCAL_ONLY",
      localVersion: 1,
      serverVersion: 0,
      checksum: "sha256-test",
    };

    const syncResult = syncClientBatch([newOfflineVisit]);
    expect(syncResult.syncedCount).toBe(1);
    expect(syncResult.reconciled[0].syncState).toBe("SYNCED");

    const central = getCentralSyncVisits();
    expect(central.some(v => v.id === newOfflineVisit.id)).toBe(true);
  });

  it("detects and flags concurrent edit conflict when server version is ahead", () => {
    // Harish Chandra record is at serverVersion 2 on server, but client submits v1
    const conflictingClientVisit: OfflinePatientVisit = {
      id: "visit-rural-002",
      patientId: "p-8802",
      patientName: "Harish Chandra",
      timestamp: new Date().toISOString(),
      facilityLocation: "Disaster Camp Alpha",
      vitals: { bloodPressure: "165/105", heartRate: 96, temperatureF: 99.2, spO2: 94 },
      triageComplaint: "Hypertensive crisis triage during flood evacuation.",
      dispensedMedicines: ["Amlodipine 10mg (14 tabs)"],
      clinicianNotes: "Field doctor escalated dosage to 10mg.",
      recordedByRole: "Field Doctor",
      syncState: "PENDING_SYNC",
      localVersion: 1,
      serverVersion: 1, // Behind server v2!
      checksum: "sha256-stale",
    };

    const syncResult = syncClientBatch([conflictingClientVisit]);
    expect(syncResult.conflictsCount).toBe(1);
    const conflictRecord = syncResult.reconciled.find(r => r.id === "visit-rural-002");
    expect(conflictRecord?.syncState).toBe("CONFLICT");
    expect(conflictRecord?.conflictDetails?.conflictReason).toContain("Concurrent edit detected");
  });

  it("resolves conflicts cleanly using the MERGE strategy", () => {
    const resolved = resolveConflict(
      "visit-rural-002",
      "MERGE",
      "Field doctor escalated to 10mg Amlodipine while HQ logged triage."
    );

    expect(resolved.syncState).toBe("SYNCED");
    expect(resolved.clinicianNotes).toContain("Field doctor escalated to 10mg Amlodipine");
    expect(resolved.serverVersion).toBeGreaterThanOrEqual(2);
  });
});
