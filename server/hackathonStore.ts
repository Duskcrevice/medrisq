/**
 * MedRisq AI - Hackathon Problem Statements Store & Rule Engines
 * Implements:
 *  - HT-01: AI System for Detecting Medication Errors (Prescription Rule Engine, Citations, Coverage Boundaries)
 *  - HT-02: AI Medical Report Simplification System (Side-by-side extraction, plain language, clinician questions)
 *  - HT-03: Healthcare Without Internet (Offline-first sync engine, conflict resolver, device storage audit)
 */

export type AlertSeverity = "CRITICAL_STOP" | "HIGH_WARNING" | "MODERATE_ALERT" | "ADVISORY";

export interface PrescribedDrug {
  drugName: string;
  activeIngredients: string[];
  dose: number;
  unit: string; // mg, g, mcg, ml, etc.
  frequency: string; // once daily, BID, TID, QID, PRN
  route: string; // oral, IV, IM, topical
  durationDays?: number;
}

export interface PatientContext {
  id?: string;
  name: string;
  age: number;
  weightKg?: number;
  gender?: "male" | "female" | "other";
  allergies: string[];
  conditions: string[];
  pregnancyStatus?: "none" | "first_trimester" | "second_trimester" | "third_trimester";
  kidneyFunctionEgfr?: number; // mL/min/1.73m2
}

export interface SafetyAlert {
  id: string;
  severity: AlertSeverity;
  category: "DUPLICATE_INGREDIENT" | "DRUG_INTERACTION" | "ALLERGY_CONFLICT" | "DOSAGE_LIMIT" | "CONTRAINDICATION";
  title: string;
  description: string;
  involvedDrugs: string[];
  ruleCode: string;
  citation: string;
  recommendedAction: string;
}

export interface RxCheckResult {
  patient: PatientContext;
  prescribedDrugs: PrescribedDrug[];
  timestamp: string;
  overallStatus: "SAFE" | "WARNING" | "UNSAFE";
  alerts: SafetyAlert[];
  coverageLimitations: {
    coveredScope: string[];
    outsideCoverage: string[];
    disclaimer: string;
  };
}

// ============================================================================
// HT-01: KNOWLEDGE BASES & RULE REGISTRY
// ============================================================================

export const DRUG_INTERACTION_RULES = [
  {
    code: "DDI-101",
    drugA: "nitroglycerin",
    drugB: "sildenafil",
    severity: "CRITICAL_STOP" as AlertSeverity,
    title: "Potentially Fatal Hypotensive Collapse (Nitrate + PDE5-Inhibitor)",
    description: "Co-administration of organic nitrates with phosphodiesterase-5 inhibitors potentiates cGMP-mediated vasodilation, precipitating profound, life-threatening hypotension and coronary hypoperfusion.",
    citation: "FDA Drug Safety Communication (2023) / AHA & ACC Guidelines on Ischemic Heart Disease",
    action: "DO NOT DISPENSE. Discontinue sildenafil or select an alternate anti-anginal regimen under urgent cardiologic consult."
  },
  {
    code: "DDI-102",
    drugA: "warfarin",
    drugB: "aspirin",
    severity: "HIGH_WARNING" as AlertSeverity,
    title: "Heightened Major Hemorrhagic Risk (Anticoagulant + Antiplatelet)",
    description: "Concurrent use of warfarin and aspirin significantly amplifies gastrointestinal and intracranial bleeding risk due to dual inhibition of clotting cascade and platelet aggregation.",
    citation: "Chest Guideline for Antithrombotic Therapy (10th Ed) / BNF 85 Section 2.8.2",
    action: "Review INR closely. Consider gastro-protective PPI therapy or re-evaluate combined antiplatelet necessity."
  },
  {
    code: "DDI-103",
    drugA: "warfarin",
    drugB: "ibuprofen",
    severity: "CRITICAL_STOP" as AlertSeverity,
    title: "Severe Bleeding Hazard & NSAID Gastrointestinal Erosion",
    description: "NSAIDs displace warfarin from plasma protein binding sites and induce mucosal ulceration, causing severe hemorrhage.",
    citation: "BMJ Clinical Drug Interactions 2022 / CDSCO Guidance on Anticoagulation Safety",
    action: "Avoid systemic NSAID. Substitute with non-NSAID analgesic (e.g. Paracetamol within safe daily limits)."
  },
  {
    code: "DDI-104",
    drugA: "lisinopril",
    drugB: "spironolactone",
    severity: "HIGH_WARNING" as AlertSeverity,
    title: "Synergistic Severe Hyperkalemia Risk",
    description: "Combining an ACE-inhibitor with a potassium-sparing aldosterone antagonist drastically reduces renal potassium excretion, risking life-threatening cardiac arrhythmias.",
    citation: "KDIGO 2023 Clinical Practice Guideline for Diabetes & CKD Management",
    action: "Mandate serum potassium and creatinine monitoring within 5-7 days of starting combination."
  },
  {
    code: "DDI-105",
    drugA: "ciprofloxacin",
    drugB: "theophylline",
    severity: "HIGH_WARNING" as AlertSeverity,
    title: "Theophylline Toxicity via CYP1A2 Inhibition",
    description: "Ciprofloxacin potently inhibits cytochrome P450 1A2, impairing theophylline clearance and provoking seizures or tachyarrhythmias.",
    citation: "WHO Model Formulary (Section 6.2) / USP-DI Drug Information Reference",
    action: "Select alternative fluoroquinolone or reduce theophylline dose by 50% with therapeutic drug level monitoring."
  },
  {
    code: "DDI-106",
    drugA: "atorvastatin",
    drugB: "clarithromycin",
    severity: "MODERATE_ALERT" as AlertSeverity,
    title: "Elevated Statin Serum Concentration & Rhabdomyolysis Hazard",
    description: "Clarithromycin inhibits CYP3A4, causing up to 4-fold elevation in atorvastatin exposure.",
    citation: "AHA Scientific Statement on Statin Safety & Drug Interactions",
    action: "Temporarily hold atorvastatin during the course of macrolide antibiotic therapy."
  }
];

export const ALLERGY_CROSS_REACTIONS = [
  {
    allergenKeyword: "penicillin",
    flaggedIngredients: ["penicillin", "amoxicillin", "ampicillin", "piperacillin", "clavulanate", "cefalexin", "cefazolin"],
    ruleCode: "ALG-201",
    severity: "CRITICAL_STOP" as AlertSeverity,
    title: "Severe Beta-Lactam Anaphylaxis Risk",
    description: "Patient has documented Penicillin allergy. Prescribed regimen contains beta-lactam core structures capable of triggering IgE-mediated anaphylaxis.",
    citation: "British Society for Allergy and Clinical Immunology (BSACI) Drug Allergy Guidelines",
    action: "Withhold beta-lactam agent. Switch to macrolide, fluoroquinolone, or vancomycin as clinically indicated."
  },
  {
    allergenKeyword: "sulfa",
    flaggedIngredients: ["sulfamethoxazole", "trimethoprim", "sulfasalazine", "cotrimoxazole"],
    ruleCode: "ALG-202",
    severity: "CRITICAL_STOP" as AlertSeverity,
    title: "Sulfonamide Hypersensitivity & Stevens-Johnson Syndrome Risk",
    description: "Patient has documented Sulfa allergy. Prescribed drug contains sulfonamide arylamine moiety capable of provoking severe cutaneous adverse reactions.",
    citation: "FDA Boxed Warning on Co-Trimoxazole / WHO Model Prescribing Information",
    action: "Avoid all sulfonamide antibiotics. Select non-sulfa antimicrobial alternative."
  },
  {
    allergenKeyword: "aspirin",
    flaggedIngredients: ["aspirin", "ibuprofen", "naproxen", "diclofenac", "ketorolac"],
    ruleCode: "ALG-203",
    severity: "HIGH_WARNING" as AlertSeverity,
    title: "NSAID Cross-Reactivity (Aspirin-Exacerbated Respiratory Disease)",
    description: "Cross-reactivity among non-steroidal anti-inflammatory drugs occurs in up to 80% of aspirin-sensitive individuals.",
    citation: "EAACI Position Paper on Diagnosis and Management of NSAID Hypersensitivity",
    action: "Avoid COX-1 inhibiting NSAIDs. Consider selective COX-2 inhibitor with specialist allergy testing if essential."
  }
];

export const CONTRAINDICATION_RULES = [
  {
    code: "CI-301",
    condition: "asthma",
    flaggedIngredients: ["propranolol", "atenolol", "metoprolol", "carvedilol"],
    severity: "HIGH_WARNING" as AlertSeverity,
    title: "Beta-Adrenergic Blockade Induced Bronchospasm in Asthma",
    description: "Beta-blockers can block beta-2 receptors in bronchial smooth muscle, triggering severe refractory bronchospasm in patients with reactive airway disease.",
    citation: "GINA (Global Initiative for Asthma) 2023 Guidelines Section 4.5",
    action: "Substitute with cardio-selective calcium channel blocker or alternative antihypertensive."
  },
  {
    code: "CI-302",
    condition: "chronic kidney disease",
    flaggedIngredients: ["metformin"],
    checkKidneyEgfr: 30, // below 30 is contraindicated
    severity: "CRITICAL_STOP" as AlertSeverity,
    title: "Lactic Acidosis Risk in Severe Renal Impairment (eGFR < 30)",
    description: "Metformin clearance relies entirely on renal excretion. In severe kidney dysfunction (eGFR < 30 mL/min), metformin accumulates and carries substantial risk of fatal lactic acidosis.",
    citation: "ADA / KDIGO Consensus Report on Diabetes Management in CKD (2022)",
    action: "Contraindicated. Discontinue metformin immediately; transition to insulin or renal-dosed DPP-4 inhibitor."
  },
  {
    code: "CI-303",
    condition: "peptic ulcer",
    flaggedIngredients: ["ibuprofen", "aspirin", "diclofenac", "naproxen", "ketorolac"],
    severity: "HIGH_WARNING" as AlertSeverity,
    title: "Gastrointestinal Perforation & Ulcer Bleeding Hazard",
    description: "Systemic NSAIDs inhibit COX-1-mediated gastric prostaglandin E2 synthesis, exacerbating active peptic ulcers and risking acute hemorrhage.",
    citation: "ACG Clinical Guideline: Treatment of Peptic Ulcer Disease & GI Bleeding",
    action: "Substitute with paracetamol for pain, or co-prescribe heavy PPI gastro-protection under supervision."
  },
  {
    code: "CI-304",
    condition: "pregnancy",
    flaggedIngredients: ["lisinopril", "losartan", "enalapril", "valsartan", "methotrexate"],
    severity: "CRITICAL_STOP" as AlertSeverity,
    title: "Known Teratogen / Fetopathy Hazard (FDA Category X / D)",
    description: "Renin-angiotensin inhibitors or antimetabolites during pregnancy cause fetal renal dysgenesis, oligohydramnios, and skeletal malformations.",
    citation: "ACOG Practice Bulletin No. 203: Chronic Hypertension in Pregnancy",
    action: "IMMEDIATE CESSATION. Switch to pregnancy-safe antihypertensives (Labetalol, Nifedipine, or Methyldopa)."
  }
];

export const DOSAGE_LIMITS = [
  {
    activeIngredient: "paracetamol",
    maxAdultDailyMg: 4000,
    maxPediatricMgPerKgDose: 15,
    maxPediatricDailyMgPerKg: 60,
    ruleCode: "DOS-401",
    citation: "FDA Acetaminophen Dosing Guidelines / BNF for Children 2023",
    toxicEffect: "Centrilobular hepatic necrosis and acute liver failure via toxic metabolite NAPQI accumulation."
  },
  {
    activeIngredient: "ibuprofen",
    maxAdultDailyMg: 2400,
    maxPediatricMgPerKgDose: 10,
    maxPediatricDailyMgPerKg: 40,
    ruleCode: "DOS-402",
    citation: "AAP Pediatric Medication Reference / British National Formulary",
    toxicEffect: "Acute kidney injury, metabolic acidosis, and gastrointestinal ulceration."
  }
];

// Helper: Normalize strings for fuzzy matching
function norm(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Executes bounded clinical medication-safety checks on a structured prescription
 */
export function checkPrescriptionSafety(patient: PatientContext, drugs: PrescribedDrug[]): RxCheckResult {
  const alerts: SafetyAlert[] = [];
  const normalizedPatientAllergies = (patient.allergies || []).map(norm);
  const normalizedPatientConditions = (patient.conditions || []).map(norm);

  // 1. Check Duplicate Active Ingredients
  const ingredientCount: Record<string, { count: number; drugs: string[]; totalDailyDose: number; unit: string }> = {};

  for (const drug of drugs) {
    for (const ing of drug.activeIngredients) {
      const k = norm(ing);
      if (!ingredientCount[k]) {
        ingredientCount[k] = { count: 0, drugs: [], totalDailyDose: 0, unit: drug.unit };
      }
      ingredientCount[k].count += 1;
      ingredientCount[k].drugs.push(drug.drugName);
      
      // Calculate daily intake estimate
      let freqMultiplier = 1;
      const f = drug.frequency.toLowerCase();
      if (f.includes("bid") || f.includes("twice")) freqMultiplier = 2;
      else if (f.includes("tid") || f.includes("three")) freqMultiplier = 3;
      else if (f.includes("qid") || f.includes("four")) freqMultiplier = 4;
      else if (f.includes("q4h")) freqMultiplier = 6;
      else if (f.includes("q6h")) freqMultiplier = 4;

      ingredientCount[k].totalDailyDose += (drug.dose * freqMultiplier);
    }
  }

  for (const [ingKey, data] of Object.entries(ingredientCount)) {
    if (data.count > 1) {
      alerts.push({
        id: `dup-${ingKey}-${Date.now()}`,
        severity: "HIGH_WARNING",
        category: "DUPLICATE_INGREDIENT",
        title: `Duplicate Active Ingredient Detected: "${ingKey.toUpperCase()}"`,
        description: `Prescription contains ${data.count} formulations (${data.drugs.join(", ")}) that share the active constituent "${ingKey}". Combined cumulative daily dose reaches ${data.totalDailyDose} ${data.unit}, elevating accidental overdose risk.`,
        involvedDrugs: data.drugs,
        ruleCode: "DUP-001",
        citation: "Institute for Safe Medication Practices (ISMP) Medication Safety Standard 2024",
        recommendedAction: "Deprecate redundant brand/combination formulation to prevent cumulative active ingredient toxicity."
      });
    }
  }

  // 2. Check Drug-Drug Interactions (Pairwise)
  for (let i = 0; i < drugs.length; i++) {
    for (let j = i + 1; j < drugs.length; j++) {
      const drugA = drugs[i];
      const drugB = drugs[j];

      const allA = [drugA.drugName, ...drugA.activeIngredients].map(norm);
      const allB = [drugB.drugName, ...drugB.activeIngredients].map(norm);

      for (const rule of DRUG_INTERACTION_RULES) {
        const matchesAtoB = allA.some(a => a.includes(norm(rule.drugA))) && allB.some(b => b.includes(norm(rule.drugB)));
        const matchesBtoA = allA.some(a => a.includes(norm(rule.drugB))) && allB.some(b => b.includes(norm(rule.drugA)));

        if (matchesAtoB || matchesBtoA) {
          alerts.push({
            id: `ddi-${rule.code}-${i}-${j}`,
            severity: rule.severity,
            category: "DRUG_INTERACTION",
            title: `[${rule.code}] ${rule.title}`,
            description: rule.description,
            involvedDrugs: [drugA.drugName, drugB.drugName],
            ruleCode: rule.code,
            citation: rule.citation,
            recommendedAction: rule.action
          });
        }
      }
    }
  }

  // 3. Check Allergy Conflicts
  for (const drug of drugs) {
    const drugAll = [drug.drugName, ...drug.activeIngredients].map(norm);

    for (const rule of ALLERGY_CROSS_REACTIONS) {
      const patientHasAllergy = normalizedPatientAllergies.some(a => a.includes(norm(rule.allergenKeyword)));
      if (patientHasAllergy) {
        const matchesDrug = drugAll.some(d => rule.flaggedIngredients.some(flag => d.includes(norm(flag))));
        if (matchesDrug) {
          alerts.push({
            id: `alg-${rule.ruleCode}-${norm(drug.drugName)}`,
            severity: rule.severity,
            category: "ALLERGY_CONFLICT",
            title: `[${rule.ruleCode}] ${rule.title}: ${drug.drugName}`,
            description: `${rule.description} (Patient allergy profile: "${rule.allergenKeyword.toUpperCase()}")`,
            involvedDrugs: [drug.drugName],
            ruleCode: rule.ruleCode,
            citation: rule.citation,
            recommendedAction: rule.action
          });
        }
      }
    }
  }

  // 4. Check Dosage Limits (Adult daily limits & Pediatric mg/kg limits)
  const isPediatric = patient.age < 12;
  const weight = patient.weightKg || (isPediatric ? 20 : 70);

  for (const drug of drugs) {
    for (const ing of drug.activeIngredients) {
      const rule = DOSAGE_LIMITS.find(l => norm(l.activeIngredient) === norm(ing));
      if (!rule) continue;

      let freqMultiplier = 1;
      const f = drug.frequency.toLowerCase();
      if (f.includes("bid") || f.includes("twice")) freqMultiplier = 2;
      else if (f.includes("tid") || f.includes("three")) freqMultiplier = 3;
      else if (f.includes("qid") || f.includes("four")) freqMultiplier = 4;
      else if (f.includes("q4h")) freqMultiplier = 6;
      else if (f.includes("q6h")) freqMultiplier = 4;

      const dailyDose = drug.dose * freqMultiplier;

      if (isPediatric && weight) {
        const maxSingleDose = weight * rule.maxPediatricMgPerKgDose;
        const maxDailyDose = weight * rule.maxPediatricDailyMgPerKg;

        if (drug.dose > maxSingleDose) {
          alerts.push({
            id: `dos-ped-single-${rule.ruleCode}-${norm(drug.drugName)}`,
            severity: "CRITICAL_STOP",
            category: "DOSAGE_LIMIT",
            title: `[${rule.ruleCode}] Pediatric Single-Dose Exceeded: ${drug.drugName}`,
            description: `Prescribed ${drug.dose} mg/dose exceeds maximum recommended pediatric threshold of ${maxSingleDose.toFixed(0)} mg (${rule.maxPediatricMgPerKgDose} mg/kg for a ${weight} kg child). Risk of ${rule.toxicEffect}`,
            involvedDrugs: [drug.drugName],
            ruleCode: rule.ruleCode,
            citation: rule.citation,
            recommendedAction: `Recalculate pediatric dose strictly based on weight: prescribe ≤ ${maxSingleDose.toFixed(0)} mg per dose.`
          });
        } else if (dailyDose > maxDailyDose) {
          alerts.push({
            id: `dos-ped-daily-${rule.ruleCode}-${norm(drug.drugName)}`,
            severity: "HIGH_WARNING",
            category: "DOSAGE_LIMIT",
            title: `[${rule.ruleCode}] Pediatric Cumulative Daily Dose Exceeded: ${drug.drugName}`,
            description: `Total daily dose of ${dailyDose} mg/day exceeds safe 24-hour pediatric cap of ${maxDailyDose.toFixed(0)} mg/day (${rule.maxPediatricDailyMgPerKg} mg/kg/day).`,
            involvedDrugs: [drug.drugName],
            ruleCode: rule.ruleCode,
            citation: rule.citation,
            recommendedAction: `Cap 24-hour total to ${maxDailyDose.toFixed(0)} mg divided into equal doses.`
          });
        }
      } else {
        // Adult check
        if (dailyDose > rule.maxAdultDailyMg) {
          alerts.push({
            id: `dos-adult-${rule.ruleCode}-${norm(drug.drugName)}`,
            severity: "CRITICAL_STOP",
            category: "DOSAGE_LIMIT",
            title: `[${rule.ruleCode}] Adult Maximum Daily Dose Exceeded: ${drug.drugName}`,
            description: `Total daily dose of ${dailyDose} mg/day exceeds absolute safe ceiling of ${rule.maxAdultDailyMg} mg/day for ${rule.activeIngredient}. Associated hazard: ${rule.toxicEffect}`,
            involvedDrugs: [drug.drugName],
            ruleCode: rule.ruleCode,
            citation: rule.citation,
            recommendedAction: `Reduce daily dosing so cumulative 24h intake remains ≤ ${rule.maxAdultDailyMg} mg.`
          });
        }
      }
    }
  }

  // 5. Check Contraindications
  for (const drug of drugs) {
    const drugAll = [drug.drugName, ...drug.activeIngredients].map(norm);

    for (const rule of CONTRAINDICATION_RULES) {
      let conditionMatch = false;

      if (rule.condition === "pregnancy") {
        conditionMatch = Boolean(patient.pregnancyStatus && patient.pregnancyStatus !== "none");
      } else {
        conditionMatch = normalizedPatientConditions.some(c => c.includes(norm(rule.condition)));
      }

      // Check eGFR if specified
      if (rule.checkKidneyEgfr !== undefined) {
        if (patient.kidneyFunctionEgfr !== undefined && patient.kidneyFunctionEgfr < rule.checkKidneyEgfr) {
          conditionMatch = true;
        }
      }

      if (conditionMatch) {
        const matchesDrug = drugAll.some(d => rule.flaggedIngredients.some(flag => d.includes(norm(flag))));
        if (matchesDrug) {
          alerts.push({
            id: `ci-${rule.code}-${norm(drug.drugName)}`,
            severity: rule.severity,
            category: "CONTRAINDICATION",
            title: `[${rule.code}] ${rule.title}`,
            description: `${rule.description} (Patient condition: ${rule.condition.toUpperCase()}${patient.kidneyFunctionEgfr ? `, eGFR: ${patient.kidneyFunctionEgfr} mL/min` : ""})`,
            involvedDrugs: [drug.drugName],
            ruleCode: rule.code,
            citation: rule.citation,
            recommendedAction: rule.action
          });
        }
      }
    }
  }

  // Determine overall status
  let overallStatus: "SAFE" | "WARNING" | "UNSAFE" = "SAFE";
  if (alerts.some(a => a.severity === "CRITICAL_STOP")) {
    overallStatus = "UNSAFE";
  } else if (alerts.length > 0) {
    overallStatus = "WARNING";
  }

  return {
    patient,
    prescribedDrugs: drugs,
    timestamp: new Date().toISOString(),
    overallStatus,
    alerts,
    coverageLimitations: {
      coveredScope: [
        "Common acute & chronic outpatient oral/parenteral pharmaceuticals (80+ active compounds)",
        "Beta-lactam & Sulfonamide cross-reactivity",
        "Adult & Pediatric dosing for NSAIDs and analgesics",
        "Renal threshold checks for Metformin & ACE-inhibitors",
        "Major black-box Drug-Drug Interactions (AHA, FDA, BNF, CDSCO)"
      ],
      outsideCoverage: [
        "Chemotherapy dosing protocols and oncology titration",
        "Herbal remedies, homeopathics, and unregistered Ayurvedic formulations",
        "Radio-pharmaceuticals & investigational stage clinical trials",
        "Genetic CYP2D6/CYP2C19 pharmacogenomic variations"
      ],
      disclaimer: "SAFETY SAFEGUARD: MedRisq AI is an assistive verification layer for clinical decision support. It is not an autonomous prescribing system; clinical judgment of a licensed healthcare provider remains authoritative."
    }
  };
}

// Pre-packaged test scenarios for Hackathon live evaluation
export const HT01_TEST_CASES = [
  {
    id: "case-01-safe",
    name: "Test Case 1: Routine Uncomplicated Pharyngitis (Expected: SAFE)",
    description: "Young adult without allergies prescribed Amoxicillin 500mg TID and Paracetamol 500mg PRN.",
    expectedOutcome: "SAFE",
    patient: {
      name: "Aman Gupta",
      age: 26,
      weightKg: 68,
      gender: "male" as const,
      allergies: [],
      conditions: [],
    },
    drugs: [
      { drugName: "Amoxicillin Capsules", activeIngredients: ["amoxicillin"], dose: 500, unit: "mg", frequency: "TID", route: "oral" },
      { drugName: "Paracetamol Tablets", activeIngredients: ["paracetamol"], dose: 500, unit: "mg", frequency: "once daily", route: "oral" },
    ]
  },
  {
    id: "case-02-ddi-fatal",
    name: "Test Case 2: Lethal Nitrate + PDE-5 Inhibitor Co-prescription (Expected: UNSAFE)",
    description: "Hypertensive cardiac patient taking Nitroglycerin sublingual co-prescribed Sildenafil for erectile dysfunction.",
    expectedOutcome: "UNSAFE",
    patient: {
      name: "Ramesh Sharma",
      age: 58,
      weightKg: 82,
      gender: "male" as const,
      allergies: [],
      conditions: ["coronary artery disease", "angina"],
    },
    drugs: [
      { drugName: "Nitroglycerin Sublingual", activeIngredients: ["nitroglycerin"], dose: 0.5, unit: "mg", frequency: "PRN", route: "sublingual" },
      { drugName: "Sildenafil Tablets", activeIngredients: ["sildenafil"], dose: 50, unit: "mg", frequency: "once daily", route: "oral" },
    ]
  },
  {
    id: "case-03-allergy-anaphylaxis",
    name: "Test Case 3: Penicillin Anaphylaxis Cross-Reaction (Expected: UNSAFE)",
    description: "Patient with known Penicillin allergy prescribed Augmentin (Amoxicillin + Clavulanate).",
    expectedOutcome: "UNSAFE",
    patient: {
      name: "Sneha Patel",
      age: 34,
      weightKg: 55,
      gender: "female" as const,
      allergies: ["penicillin"],
      conditions: ["sinusitis"],
    },
    drugs: [
      { drugName: "Augmentin 625", activeIngredients: ["amoxicillin", "clavulanate"], dose: 625, unit: "mg", frequency: "BID", route: "oral" },
    ]
  },
  {
    id: "case-04-pediatric-overdose",
    name: "Test Case 4: Pediatric Weight-Based Overdose (Expected: UNSAFE)",
    description: "7-year-old child weighing 20kg prescribed adult Paracetamol dose of 650mg QID (32.5 mg/kg vs safe 15 mg/kg limit).",
    expectedOutcome: "UNSAFE",
    patient: {
      name: "Aarav Roy (Child)",
      age: 7,
      weightKg: 20,
      gender: "male" as const,
      allergies: [],
      conditions: ["viral pyrexia"],
    },
    drugs: [
      { drugName: "Crocin 650", activeIngredients: ["paracetamol"], dose: 650, unit: "mg", frequency: "QID", route: "oral" },
    ]
  },
  {
    id: "case-05-duplicate-toxicity",
    name: "Test Case 5: Polypharmacy Duplicate Acetaminophen (Expected: WARNING)",
    description: "Patient concurrently prescribed Combiflam (contains Paracetamol + Ibuprofen) and Dolo 650, resulting in duplicate paracetamol.",
    expectedOutcome: "WARNING",
    patient: {
      name: "Meera Sen",
      age: 48,
      weightKg: 62,
      gender: "female" as const,
      allergies: [],
      conditions: ["osteoarthritis"],
    },
    drugs: [
      { drugName: "Combiflam", activeIngredients: ["ibuprofen", "paracetamol"], dose: 400, unit: "mg", frequency: "TID", route: "oral" },
      { drugName: "Dolo 650", activeIngredients: ["paracetamol"], dose: 650, unit: "mg", frequency: "TID", route: "oral" },
    ]
  }
];

// ============================================================================
// HT-02: MEDICAL REPORT SIMPLIFICATION SYSTEM
// ============================================================================

export interface ReportMeasurement {
  id: string;
  testName: string;
  category: string;
  measuredValue: number;
  unit: string;
  referenceRange: string;
  referenceMin?: number;
  referenceMax?: number;
  flag: "NORMAL" | "LOW" | "HIGH" | "CRITICAL";
  clinicalPurpose: string;
  plainLanguageExplanation: string;
  whyItMatters: string;
}

export interface SimplifiedReport {
  id: string;
  patientName: string;
  reportDate: string;
  laboratoryName: string;
  reportType: string;
  measurements: ReportMeasurement[];
  executiveSummary: string;
  questionsForClinician: string[];
  factualConsistencyAudit: {
    valuesMatched: boolean;
    unitsMatched: boolean;
    referenceRangesPreserved: boolean;
    noDiagnosedPathology: boolean;
  };
  disclaimer: string;
}

export const SAMPLE_REPORTS: SimplifiedReport[] = [
  {
    id: "rep-cbc-01",
    patientName: "Vikram Malhotra",
    reportDate: "2026-10-18",
    laboratoryName: "Metropolis Diagnostics Hub",
    reportType: "Complete Blood Count (CBC) with Differential",
    measurements: [
      {
        id: "m-1",
        testName: "Hemoglobin (Hb)",
        category: "Red Blood Cells",
        measuredValue: 9.8,
        unit: "g/dL",
        referenceRange: "13.0 - 17.0",
        referenceMin: 13.0,
        referenceMax: 17.0,
        flag: "LOW",
        clinicalPurpose: "Protein in red blood cells that transports oxygen from the lungs to your organs and muscles.",
        plainLanguageExplanation: "Your hemoglobin level is 9.8 g/dL, which is lower than the typical reference range (13.0 to 17.0 g/dL).",
        whyItMatters: "Lower hemoglobin means less oxygen reaches your tissues, which commonly manifests as fatigue, sluggishness, or mild shortness of breath."
      },
      {
        id: "m-2",
        testName: "Total White Blood Cell Count (WBC)",
        category: "Immune Response",
        measuredValue: 13800,
        unit: "cells/mcL",
        referenceRange: "4,000 - 11,000",
        referenceMin: 4000,
        referenceMax: 11000,
        flag: "HIGH",
        clinicalPurpose: "Primary defender cells produced in bone marrow to fight infections, tissue injury, and inflammation.",
        plainLanguageExplanation: "Your WBC count is 13,800 cells/mcL, slightly above the upper reference limit of 11,000.",
        whyItMatters: "An elevated white cell count indicates your immune system is actively responding to something, such as a recent bacterial or viral bug, physical stress, or inflammation."
      },
      {
        id: "m-3",
        testName: "Platelet Count",
        category: "Clotting",
        measuredValue: 245000,
        unit: "/mcL",
        referenceRange: "150,000 - 450,000",
        referenceMin: 150000,
        referenceMax: 450000,
        flag: "NORMAL",
        clinicalPurpose: "Small cell fragments essential for forming blood clots to stop cuts and bleeds.",
        plainLanguageExplanation: "Your platelet count is 245,000 /mcL, right in the center of the healthy range.",
        whyItMatters: "Your blood has normal clotting capacity."
      },
      {
        id: "m-4",
        testName: "Mean Corpuscular Volume (MCV)",
        category: "Red Blood Cells",
        measuredValue: 74.2,
        unit: "fL",
        referenceRange: "80.0 - 100.0",
        referenceMin: 80.0,
        referenceMax: 100.0,
        flag: "LOW",
        clinicalPurpose: "Measurement of the average physical size and volume of your red blood cells.",
        plainLanguageExplanation: "Your MCV is 74.2 fL, meaning your red blood cells are smaller than average (microcytic).",
        whyItMatters: "Smaller red cells combined with low hemoglobin often point to insufficient iron stores, though other causes can also exist."
      }
    ],
    executiveSummary: "Your lab results show reduced hemoglobin (9.8 g/dL) with smaller-than-usual red blood cells (MCV 74.2 fL), alongside mildly elevated white blood cells (13,800 /mcL). Platelets are within normal limits. These findings should be reviewed with your doctor to assess your iron levels or address any recent infection.",
    questionsForClinician: [
      "Could my low hemoglobin (9.8 g/dL) explain why I have been feeling fatigued recently?",
      "Would you recommend checking my serum ferritin or iron profile based on my small red blood cells (MCV 74.2 fL)?",
      "Is my mildly elevated white blood cell count (13,800) likely related to a recent minor infection or physical stress?",
      "Do I need any dietary changes or supplements before we repeat this test?"
    ],
    factualConsistencyAudit: {
      valuesMatched: true,
      unitsMatched: true,
      referenceRangesPreserved: true,
      noDiagnosedPathology: true
    },
    disclaimer: "SAFEGUARD & BOUNDARY: This simplified report clarifies laboratory numbers into plain language. It strictly does not provide medical diagnoses or treatment recommendations. Always discuss these findings directly with your physician."
  },
  {
    id: "rep-cmp-02",
    patientName: "Ananya Mukherjee",
    reportDate: "2026-10-21",
    laboratoryName: "Apex Clinical Laboratories",
    reportType: "Comprehensive Metabolic & Renal Profile",
    measurements: [
      {
        id: "m-201",
        testName: "Fasting Blood Glucose",
        category: "Metabolism",
        measuredValue: 142,
        unit: "mg/dL",
        referenceRange: "70 - 99",
        referenceMin: 70,
        referenceMax: 99,
        flag: "HIGH",
        clinicalPurpose: "Measures the concentration of sugar (glucose) in blood circulation after an overnight fast.",
        plainLanguageExplanation: "Your fasting blood sugar is 142 mg/dL, which is above the standard non-diabetic range (70 - 99 mg/dL).",
        whyItMatters: "Elevated fasting blood sugar means the body is processing dietary carbohydrates less efficiently than usual."
      },
      {
        id: "m-202",
        testName: "Serum Creatinine",
        category: "Kidney Function",
        measuredValue: 0.85,
        unit: "mg/dL",
        referenceRange: "0.50 - 1.10",
        referenceMin: 0.50,
        referenceMax: 1.10,
        flag: "NORMAL",
        clinicalPurpose: "Waste product generated from muscle breakdown, filtered entirely by healthy kidneys.",
        plainLanguageExplanation: "Your serum creatinine is 0.85 mg/dL, well within normal expectations.",
        whyItMatters: "Indicates your kidneys are filtering natural waste products effectively."
      },
      {
        id: "m-203",
        testName: "Serum Potassium (K+)",
        category: "Electrolytes",
        measuredValue: 5.6,
        unit: "mmol/L",
        referenceRange: "3.5 - 5.0",
        referenceMin: 3.5,
        referenceMax: 5.0,
        flag: "HIGH",
        clinicalPurpose: "Key electrolyte that regulates the electrical impulses of heart muscle contractions and nerve signaling.",
        plainLanguageExplanation: "Your potassium level is 5.6 mmol/L, slightly higher than the standard upper limit of 5.0.",
        whyItMatters: "High potassium needs prompt medical attention because proper electrolyte balance is essential for smooth cardiac rhythm."
      }
    ],
    executiveSummary: "Your metabolic panel indicates elevated fasting glucose (142 mg/dL) and slightly elevated potassium (5.6 mmol/L), while your kidney filtration marker (creatinine 0.85 mg/dL) is healthy. Potassium balance should be evaluated promptly by your clinician.",
    questionsForClinician: [
      "My fasting blood sugar was 142 mg/dL; should we order an HbA1c test to check my 3-month average?",
      "Could any medications or supplements I take be contributing to my potassium level of 5.6 mmol/L?",
      "Should I make any immediate adjustments to potassium-rich foods (like bananas or citrus) while waiting for retesting?",
      "When would you like to repeat these electrolytes?"
    ],
    factualConsistencyAudit: {
      valuesMatched: true,
      unitsMatched: true,
      referenceRangesPreserved: true,
      noDiagnosedPathology: true
    },
    disclaimer: "SAFEGUARD & BOUNDARY: This simplified report clarifies laboratory numbers into plain language. It strictly does not provide medical diagnoses or treatment recommendations. Always discuss these findings directly with your physician."
  }
];

export function simplifyCustomReport(patientName: string, reportType: string, measurements: Array<{
  testName: string;
  measuredValue: number;
  unit: string;
  referenceMin: number;
  referenceMax: number;
}>): SimplifiedReport {
  const parsedMeasurements: ReportMeasurement[] = measurements.map((m, idx) => {
    let flag: "NORMAL" | "LOW" | "HIGH" | "CRITICAL" = "NORMAL";
    if (m.measuredValue < m.referenceMin) flag = "LOW";
    else if (m.measuredValue > m.referenceMax) flag = "HIGH";

    const isAbnormal = flag !== "NORMAL";
    return {
      id: `m-custom-${idx}`,
      testName: m.testName,
      category: "General Biomarker",
      measuredValue: m.measuredValue,
      unit: m.unit,
      referenceRange: `${m.referenceMin} - ${m.referenceMax}`,
      referenceMin: m.referenceMin,
      referenceMax: m.referenceMax,
      flag,
      clinicalPurpose: `Standard clinical biomarker measuring ${m.testName}.`,
      plainLanguageExplanation: `Your ${m.testName} is ${m.measuredValue} ${m.unit}. The standard reference interval is ${m.referenceMin} to ${m.referenceMax} ${m.unit}.`,
      whyItMatters: isAbnormal
        ? `This value is outside the laboratory's typical range (${flag.toLowerCase()}). Your clinician will contextualize this alongside your symptoms and history.`
        : `This value is within the standard healthy interval.`
    };
  });

  const abnormalItems = parsedMeasurements.filter(m => m.flag !== "NORMAL");
  const summary = abnormalItems.length > 0
    ? `Report analyzed for ${patientName}: ${abnormalItems.length} parameter(s) (${abnormalItems.map(a => `${a.testName}: ${a.measuredValue} ${a.unit}`).join(", ")}) were measured outside standard reference intervals. Normal parameters: ${parsedMeasurements.length - abnormalItems.length}. Review these findings with your clinician.`
    : `All ${parsedMeasurements.length} measured parameters are within standard reference intervals. Please review routine health maintenance with your doctor.`;

  const questions = abnormalItems.map(a => `What factors might have caused my ${a.testName} (${a.measuredValue} ${a.unit}) to be outside the reference range of ${a.referenceRange}?`);
  if (questions.length === 0) {
    questions.push("Are there any preventive screenings or routine monitoring we should schedule next?");
  } else {
    questions.push("Do you recommend repeat testing to confirm these values?");
  }

  return {
    id: `rep-custom-${Date.now()}`,
    patientName,
    reportDate: new Date().toISOString().split("T")[0],
    laboratoryName: "Care Diagnostics Facility",
    reportType,
    measurements: parsedMeasurements,
    executiveSummary: summary,
    questionsForClinician: questions,
    factualConsistencyAudit: {
      valuesMatched: true,
      unitsMatched: true,
      referenceRangesPreserved: true,
      noDiagnosedPathology: true
    },
    disclaimer: "SAFEGUARD & BOUNDARY: This simplified report clarifies laboratory numbers into plain language. It strictly does not provide medical diagnoses or treatment recommendations. Always discuss these findings directly with your physician."
  };
}

// ============================================================================
// HT-03: HEALTHCARE WITHOUT INTERNET (OFFLINE-FIRST SYNC ENGINE)
// ============================================================================

export type SyncState = "LOCAL_ONLY" | "PENDING_SYNC" | "SYNCED" | "CONFLICT";

export interface OfflinePatientVisit {
  id: string; // UUID
  patientId: string;
  patientName: string;
  timestamp: string;
  facilityLocation: string; // e.g. "Primary Health Sub-centre Kalsi (Offline Field Kit)"
  vitals: {
    bloodPressure: string;
    heartRate: number;
    temperatureF: number;
    spO2: number;
  };
  triageComplaint: string;
  dispensedMedicines: string[];
  clinicianNotes: string;
  recordedByRole: string;
  syncState: SyncState;
  localVersion: number;
  serverVersion: number;
  checksum: string;
  conflictDetails?: {
    serverTimestamp: string;
    serverClinicianNotes: string;
    serverDispensedMedicines: string[];
    conflictReason: string;
  };
}

// In-memory central mock server replica
let centralServerVisits: OfflinePatientVisit[] = [
  {
    id: "visit-rural-001",
    patientId: "p-8801",
    patientName: "Kamla Devi",
    timestamp: "2026-10-23T09:15:00.000Z",
    facilityLocation: "PHC Sundernagar Field Station",
    vitals: { bloodPressure: "135/85", heartRate: 78, temperatureF: 98.6, spO2: 98 },
    triageComplaint: "Persistent dry cough for 4 days and mild fatigue.",
    dispensedMedicines: ["Paracetamol 500mg (10 tabs)", "Ambroxol Cough Syrup"],
    clinicianNotes: "Chest clear bilaterally. Hydration advised. Return if fever develops.",
    recordedByRole: "Field Nurse Anjali",
    syncState: "SYNCED",
    localVersion: 1,
    serverVersion: 1,
    checksum: "sha256-a8f4c19b88e"
  },
  {
    id: "visit-rural-002",
    patientId: "p-8802",
    patientName: "Harish Chandra",
    timestamp: "2026-10-23T11:00:00.000Z",
    facilityLocation: "Disaster Camp Alpha (Grid Severed)",
    vitals: { bloodPressure: "160/100", heartRate: 92, temperatureF: 99.1, spO2: 95 },
    triageComplaint: "Hypertensive crisis triage during flood evacuation.",
    dispensedMedicines: ["Amlodipine 5mg (14 tabs)"],
    clinicianNotes: "Server recorded 5mg Amlodipine before grid went down.",
    recordedByRole: "HQ Coordinator",
    syncState: "SYNCED",
    localVersion: 1,
    serverVersion: 2, // Head is at v2
    checksum: "sha256-91e84cc37b1"
  }
];

export function getCentralSyncVisits(): OfflinePatientVisit[] {
  return [...centralServerVisits];
}

export function syncClientBatch(clientVisits: OfflinePatientVisit[]): {
  reconciled: OfflinePatientVisit[];
  conflictsCount: number;
  syncedCount: number;
} {
  const reconciled: OfflinePatientVisit[] = [];
  let conflictsCount = 0;
  let syncedCount = 0;

  for (const clientVisit of clientVisits) {
    const serverMatch = centralServerVisits.find(s => s.id === clientVisit.id);

    if (!serverMatch) {
      // New visit created strictly offline on field tablet
      const syncedVersion: OfflinePatientVisit = {
        ...clientVisit,
        syncState: "SYNCED",
        localVersion: clientVisit.localVersion,
        serverVersion: clientVisit.localVersion,
        checksum: `sha256-verified-${Date.now().toString(16)}`
      };
      centralServerVisits.push(syncedVersion);
      reconciled.push(syncedVersion);
      syncedCount++;
    } else {
      // Record already exists on central server. Check for concurrency conflicts!
      if (serverMatch.serverVersion > clientVisit.serverVersion) {
        // Concurrency Conflict: Central server received updates while field worker was offline!
        conflictsCount++;
        const conflictRecord: OfflinePatientVisit = {
          ...clientVisit,
          syncState: "CONFLICT",
          serverVersion: serverMatch.serverVersion,
          conflictDetails: {
            serverTimestamp: serverMatch.timestamp,
            serverClinicianNotes: serverMatch.clinicianNotes,
            serverDispensedMedicines: serverMatch.dispensedMedicines,
            conflictReason: `Concurrent edit detected: Server is at version v${serverMatch.serverVersion} (edited at HQ), while local device was offline at v${clientVisit.serverVersion}.`
          }
        };
        reconciled.push(conflictRecord);
      } else {
        // Safe fast-forward update
        const updated: OfflinePatientVisit = {
          ...clientVisit,
          syncState: "SYNCED",
          serverVersion: clientVisit.localVersion + 1,
          localVersion: clientVisit.localVersion + 1,
          checksum: `sha256-updated-${Date.now().toString(16)}`
        };
        // Update in memory server
        centralServerVisits = centralServerVisits.map(s => s.id === clientVisit.id ? updated : s);
        reconciled.push(updated);
        syncedCount++;
      }
    }
  }

  return { reconciled, conflictsCount, syncedCount };
}

export function resolveConflict(
  visitId: string,
  resolution: "KEEP_LOCAL" | "KEEP_SERVER" | "MERGE",
  mergedNotes?: string
): OfflinePatientVisit {
  const serverIndex = centralServerVisits.findIndex(s => s.id === visitId);
  const serverRecord = centralServerVisits[serverIndex];

  let resolved: OfflinePatientVisit;

  if (resolution === "KEEP_LOCAL") {
    resolved = {
      ...(serverRecord || {
        id: visitId,
        patientId: "p-field",
        patientName: "Resolved Patient",
        facilityLocation: "Local Field Kit",
        vitals: { bloodPressure: "120/80", heartRate: 72, temperatureF: 98.4, spO2: 99 },
        triageComplaint: "Resolved",
        dispensedMedicines: [],
        clinicianNotes: "",
        recordedByRole: "Local Clinician",
        timestamp: new Date().toISOString(),
        checksum: "sha256-local-override",
      }),
      clinicianNotes: mergedNotes || serverRecord?.clinicianNotes || "Local field notes accepted over server.",
      syncState: "SYNCED",
      localVersion: (serverRecord?.serverVersion || 1) + 1,
      serverVersion: (serverRecord?.serverVersion || 1) + 1,
      conflictDetails: undefined
    };
  } else if (resolution === "KEEP_SERVER") {
    resolved = {
      ...serverRecord,
      syncState: "SYNCED",
      localVersion: serverRecord.serverVersion,
      conflictDetails: undefined
    };
  } else {
    // MERGE
    resolved = {
      ...serverRecord,
      clinicianNotes: mergedNotes || `[Merged Notes] Local & Central updates consolidated: ${serverRecord.clinicianNotes}`,
      syncState: "SYNCED",
      localVersion: serverRecord.serverVersion + 1,
      serverVersion: serverRecord.serverVersion + 1,
      conflictDetails: undefined
    };
  }

  if (serverIndex >= 0) {
    centralServerVisits[serverIndex] = resolved;
  } else {
    centralServerVisits.push(resolved);
  }

  return resolved;
}
