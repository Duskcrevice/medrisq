export type DemoRole = "public" | "hospital" | "pharmacist" | "coordinator" | "admin";
export type RequestStatus =
  | "matched"
  | "awaiting_approval"
  | "approved"
  | "dispatched"
  | "received"
  | "rejected"
  | "cancelled"
  | "partial";

export type Resource = {
  id: string;
  name: string;
  kind: "Hospital" | "Pharmacy";
  district: string;
  address: string;
  phone: string;
  beds: number;
  icu: number;
  oxygen: number;
  essential: string;
  freshness: "Fresh" | "Aging" | "Stale";
  updatedAt: string;
  reliability: number;
  confirmed: boolean;
};

export type Medicine = {
  id: string;
  identifier: string;
  product: string;
  manufacturer: string;
  batch: string;
  expiry: string;
  serial?: string;
  outcome: "Registry Match" | "Suspicious" | "Expired" | "Unverified";
  reason: string;
  source: string;
  lastChecked: string;
};

export type InventoryItem = {
  id: string;
  organization: string;
  item: string;
  category: "Oxygen" | "Beds" | "Medicine" | "Supplies";
  quantity: number;
  unit: string;
  threshold: number;
  status: "Available" | "Low" | "Critical";
  updatedAt: string;
};

export type Match = {
  supplier: string;
  resource: string;
  available: number;
  unit: string;
  distance: string;
  freshness: string;
  score: number;
  reasons: string[];
};

export type TimelineEvent = {
  id: string;
  label: string;
  detail: string;
  at: string;
  tone: "done" | "active" | "pending" | "danger";
};

export type EmergencyRequest = {
  id: string;
  requester: string;
  destination: string;
  resource: string;
  quantity: number;
  unit: string;
  urgency: "Critical" | "High" | "Routine";
  status: RequestStatus;
  createdAt: string;
  note: string;
  matches: Match[];
  timeline: TimelineEvent[];
};

export type Alert = {
  id: string;
  severity: "Critical" | "High" | "Medium" | "Info";
  title: string;
  reason: string;
  source: string;
  recommendation: string;
  createdAt: string;
  acknowledged: boolean;
};

export type AuditEvent = {
  id: string;
  action: string;
  actor: string;
  detail: string;
  at: string;
  tone: "teal" | "amber" | "coral" | "navy";
};

export type DemoSnapshot = {
  generatedAt: string;
  metrics: {
    activeRequests: number;
    resourcesTracked: number;
    verifiedToday: number;
    openAlerts: number;
  };
  resources: Resource[];
  medicines: Medicine[];
  inventory: InventoryItem[];
  requests: EmergencyRequest[];
  alerts: Alert[];
  audit: AuditEvent[];
};

const now = () => new Date().toISOString();
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3600000).toISOString();
const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60000).toISOString();

function seedState(): DemoSnapshot {
  const resources: Resource[] = [
    {
      id: "res-northbridge",
      name: "Northbridge General Hospital",
      kind: "Hospital",
      district: "Central District",
      address: "14 Meridian Avenue",
      phone: "+91 555 014 221",
      beds: 38,
      icu: 6,
      oxygen: 124,
      essential: "PPE 68%, IV fluids 42%",
      freshness: "Fresh",
      updatedAt: minutesAgo(18),
      reliability: 96,
      confirmed: true,
    },
    {
      id: "res-saint-elara",
      name: "Saint Elara Medical Centre",
      kind: "Hospital",
      district: "East Ward",
      address: "7 Juniper Road",
      phone: "+91 555 014 318",
      beds: 12,
      icu: 2,
      oxygen: 48,
      essential: "PPE 31%, IV fluids 73%",
      freshness: "Aging",
      updatedAt: hoursAgo(5),
      reliability: 91,
      confirmed: false,
    },
    {
      id: "res-riverbend",
      name: "Riverbend Community Pharmacy",
      kind: "Pharmacy",
      district: "Central District",
      address: "22 Market Street",
      phone: "+91 555 014 409",
      beds: 0,
      icu: 0,
      oxygen: 0,
      essential: "Cold-chain stable",
      freshness: "Fresh",
      updatedAt: minutesAgo(34),
      reliability: 94,
      confirmed: true,
    },
    {
      id: "res-greenline",
      name: "Greenline Pharmacy Network",
      kind: "Pharmacy",
      district: "West Ward",
      address: "3 Station Lane",
      phone: "+91 555 014 177",
      beds: 0,
      icu: 0,
      oxygen: 0,
      essential: "Cold-chain review due",
      freshness: "Stale",
      updatedAt: hoursAgo(27),
      reliability: 82,
      confirmed: false,
    },
  ];

  const medicines: Medicine[] = [
    {
      id: "med-1",
      identifier: "MR-9841-A",
      product: "Atenolol 50 mg",
      manufacturer: "Northstar Therapeutics",
      batch: "AT-24-113",
      expiry: "2027-05-31",
      serial: "SR-12008",
      outcome: "Registry Match",
      reason: "Product, manufacturer, batch, expiry, and unique serial match the demo registry.",
      source: "Synthetic registry · DEMO",
      lastChecked: minutesAgo(42),
    },
    {
      id: "med-2",
      identifier: "MR-4412-X",
      product: "Ceftriaxone 1 g",
      manufacturer: "Vantage Labs",
      batch: "CF-23-044",
      expiry: "2025-11-30",
      serial: "SR-88711",
      outcome: "Expired",
      reason: "Registry record matches, but the recorded expiry date has passed.",
      source: "Synthetic registry · DEMO",
      lastChecked: hoursAgo(2),
    },
    {
      id: "med-3",
      identifier: "MR-7719-C",
      product: "Insulin Glargine",
      manufacturer: "Harbor Biologics",
      batch: "IG-24-009",
      expiry: "2026-10-30",
      serial: "SR-51002",
      outcome: "Suspicious",
      reason: "Submitted batch IG-24-009 conflicts with the registry batch IG-24-006 for this serial.",
      source: "Synthetic registry + submitted record · DEMO",
      lastChecked: minutesAgo(12),
    },
    {
      id: "med-4",
      identifier: "MR-3030-D",
      product: "Amoxicillin 500 mg",
      manufacturer: "Pinecrest Pharma",
      batch: "AM-24-081",
      expiry: "2027-01-12",
      serial: "SR-00017",
      outcome: "Suspicious",
      reason: "Unique serial SR-00017 was previously observed at another facility.",
      source: "Synthetic registry + serial history · DEMO",
      lastChecked: hoursAgo(8),
    },
  ];

  const inventory: InventoryItem[] = [
    { id: "inv-1", organization: "Northbridge General Hospital", item: "Oxygen cylinders", category: "Oxygen", quantity: 124, unit: "cylinders", threshold: 80, status: "Available", updatedAt: minutesAgo(18) },
    { id: "inv-2", organization: "Northbridge General Hospital", item: "ICU beds", category: "Beds", quantity: 6, unit: "beds", threshold: 8, status: "Low", updatedAt: minutesAgo(18) },
    { id: "inv-3", organization: "Northbridge General Hospital", item: "IV fluid bags", category: "Supplies", quantity: 42, unit: "% stocked", threshold: 45, status: "Low", updatedAt: hoursAgo(3) },
    { id: "inv-4", organization: "Riverbend Community Pharmacy", item: "Atenolol 50 mg", category: "Medicine", quantity: 84, unit: "packs", threshold: 30, status: "Available", updatedAt: minutesAgo(34) },
    { id: "inv-5", organization: "Riverbend Community Pharmacy", item: "Ceftriaxone 1 g", category: "Medicine", quantity: 9, unit: "vials", threshold: 12, status: "Critical", updatedAt: hoursAgo(2) },
    { id: "inv-6", organization: "Greenline Pharmacy Network", item: "Insulin Glargine", category: "Medicine", quantity: 17, unit: "pens", threshold: 20, status: "Low", updatedAt: hoursAgo(27) },
  ];

  const requests: EmergencyRequest[] = [
    {
      id: "REQ-2048",
      requester: "Saint Elara Medical Centre",
      destination: "Saint Elara Medical Centre · East Ward",
      resource: "Oxygen cylinders",
      quantity: 30,
      unit: "cylinders",
      urgency: "Critical",
      status: "awaiting_approval",
      createdAt: minutesAgo(51),
      note: "Expected surge in respiratory admissions overnight. Please confirm before 23:00.",
      matches: [
        { supplier: "Northbridge General Hospital", resource: "Oxygen cylinders", available: 124, unit: "cylinders", distance: "4.2 km", freshness: "18 min ago", score: 94, reasons: ["Sufficient stock after reserve", "Freshest report in the district", "96% source reliability"] },
        { supplier: "Greenline Pharmacy Network", resource: "Oxygen cylinders", available: 18, unit: "cylinders", distance: "7.8 km", freshness: "27 hr ago", score: 51, reasons: ["Insufficient for full request", "Stale availability report"] },
      ],
      timeline: [
        { id: "t1", label: "Request created", detail: "Urgent shortage reported by hospital staff", at: minutesAgo(51), tone: "done" },
        { id: "t2", label: "Matches identified", detail: "2 possible suppliers ranked by freshness and reliability", at: minutesAgo(49), tone: "done" },
        { id: "t3", label: "Offer ready for approval", detail: "Northbridge can cover the full 30-cylinder request", at: minutesAgo(47), tone: "active" },
        { id: "t4", label: "Dispatch", detail: "Waiting for coordinator approval", at: "", tone: "pending" },
        { id: "t5", label: "Receipt", detail: "Receiving organization confirms delivery", at: "", tone: "pending" },
      ],
    },
    {
      id: "REQ-2031",
      requester: "Northbridge General Hospital",
      destination: "Northbridge General Hospital · Central District",
      resource: "IV fluid bags",
      quantity: 18,
      unit: "cases",
      urgency: "High",
      status: "dispatched",
      createdAt: hoursAgo(6),
      note: "Partial fulfilment accepted due to supplier reserve protection.",
      matches: [{ supplier: "Saint Elara Medical Centre", resource: "IV fluid bags", available: 18, unit: "cases", distance: "6.1 km", freshness: "5 hr ago", score: 78, reasons: ["Partial quantity confirmed", "Route available within 30 minutes"] }],
      timeline: [
        { id: "t6", label: "Request created", detail: "High-priority supply request", at: hoursAgo(6), tone: "done" },
        { id: "t7", label: "Offer approved", detail: "Partial fulfilment accepted", at: hoursAgo(5.5), tone: "done" },
        { id: "t8", label: "Dispatched", detail: "18 cases assigned to courier", at: hoursAgo(4.5), tone: "active" },
        { id: "t9", label: "Receipt", detail: "Awaiting receiving confirmation", at: "", tone: "pending" },
      ],
    },
    {
      id: "REQ-1994",
      requester: "Saint Elara Medical Centre",
      destination: "Saint Elara Medical Centre · East Ward",
      resource: "PPE kits",
      quantity: 60,
      unit: "kits",
      urgency: "Routine",
      status: "received",
      createdAt: hoursAgo(31),
      note: "Closed after receiving organization confirmed all 60 kits.",
      matches: [{ supplier: "Northbridge General Hospital", resource: "PPE kits", available: 68, unit: "kits", distance: "4.2 km", freshness: "1 hr ago", score: 89, reasons: ["Full quantity available", "Same-day route"] }],
      timeline: [
        { id: "t10", label: "Request created", detail: "Routine stock replenishment", at: hoursAgo(31), tone: "done" },
        { id: "t11", label: "Offer approved", detail: "Supplier accepted the transfer", at: hoursAgo(30), tone: "done" },
        { id: "t12", label: "Dispatched", detail: "Courier handoff recorded", at: hoursAgo(27), tone: "done" },
        { id: "t13", label: "Receipt confirmed", detail: "60 kits received and request closed", at: hoursAgo(25), tone: "done" },
      ],
    },
  ];

  const alerts: Alert[] = [
    { id: "alert-1", severity: "Critical", title: "Urgent oxygen request unresolved", reason: "REQ-2048 has been awaiting approval for 4 minutes.", source: "Emergency exchange · REQ-2048", recommendation: "Review the Northbridge offer and approve or reject the transfer.", createdAt: minutesAgo(4), acknowledged: false },
    { id: "alert-2", severity: "High", title: "Ceftriaxone inventory below threshold", reason: "9 vials reported against a threshold of 12.", source: "Riverbend Community Pharmacy · inventory", recommendation: "Confirm replenishment or create a shortage request.", createdAt: hoursAgo(2), acknowledged: false },
    { id: "alert-3", severity: "Medium", title: "Greenline report is stale", reason: "The last inventory report is 27 hours old.", source: "Greenline Pharmacy Network · inventory", recommendation: "Request a fresh count before relying on the quantity.", createdAt: hoursAgo(6), acknowledged: false },
    { id: "alert-4", severity: "High", title: "Medicine serial conflict detected", reason: "MR-7719-C has a batch discrepancy against registry data.", source: "Medicine verification · MR-7719-C", recommendation: "Quarantine the pack and route to pharmacist review.", createdAt: minutesAgo(12), acknowledged: false },
    { id: "alert-5", severity: "Info", title: "Atenolol verification completed", reason: "Product and serial matched the synthetic registry.", source: "Medicine verification · MR-9841-A", recommendation: "Retain the result as evidence; authenticity is not guaranteed.", createdAt: minutesAgo(42), acknowledged: true },
  ];

  const audit: AuditEvent[] = [
    { id: "audit-1", action: "Request created", actor: "Asha Rao · Hospital staff", detail: "REQ-2048 for 30 oxygen cylinders", at: minutesAgo(51), tone: "navy" },
    { id: "audit-2", action: "Matches ranked", actor: "MedRisq deterministic engine", detail: "Northbridge ranked first: freshness + reserve + reliability", at: minutesAgo(49), tone: "teal" },
    { id: "audit-3", action: "Medicine flagged", actor: "Kiran Shah · Pharmacist", detail: "MR-7719-C batch conflict saved for review", at: minutesAgo(12), tone: "coral" },
    { id: "audit-4", action: "Inventory updated", actor: "Riverbend Community Pharmacy", detail: "Ceftriaxone reduced to 9 vials", at: hoursAgo(2), tone: "amber" },
    { id: "audit-5", action: "Transfer received", actor: "Saint Elara Medical Centre", detail: "REQ-1994 closed after receipt confirmation", at: hoursAgo(25), tone: "teal" },
  ];

  return { generatedAt: now(), metrics: { activeRequests: 2, resourcesTracked: resources.length, verifiedToday: 18, openAlerts: 4 }, resources, medicines, inventory, requests, alerts, audit };
}

let state = seedState();

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function pushAudit(action: string, actor: string, detail: string, tone: AuditEvent["tone"]) {
  state.audit.unshift({ id: `audit-${Date.now()}`, action, actor, detail, at: now(), tone });
  if (state.audit.length > 500) state.audit.length = 500;
}

export function getDemoSnapshot() {
  return clone(state);
}

export function resetDemo() {
  state = seedState();
  return getDemoSnapshot();
}

export function verifyMedicine(input: { identifier: string; batch?: string }) {
  const identifier = input.identifier.trim().toUpperCase().replace(/[<>]/g, "");
  const batch = input.batch?.trim().toUpperCase().replace(/[<>]/g, "");
  const record = state.medicines.find(medicine => medicine.identifier === identifier);
  let result: Medicine;
  if (!record) {
    result = { id: `check-${Date.now()}`, identifier, product: "Unknown product", manufacturer: "No registry record", batch: batch || "Not supplied", expiry: "—", outcome: "Unverified", reason: "No reliable matching record was found in the synthetic demo registry. Missing data does not prove counterfeiting.", source: "Synthetic registry · DEMO", lastChecked: now() };
  } else {
    result = clone(record);
    if (batch && batch !== record.batch) {
      result.outcome = "Suspicious";
      result.reason = `Submitted batch ${batch} conflicts with the registry batch ${record.batch}.`;
    }
    result.lastChecked = now();
  }
  state.medicines = [result, ...state.medicines.filter(medicine => medicine.identifier !== identifier)].slice(0, 8);
  pushAudit("Medicine verification", "Demo pharmacist", `${identifier} → ${result.outcome}`, result.outcome === "Registry Match" ? "teal" : result.outcome === "Unverified" ? "amber" : "coral");
  if (result.outcome === "Suspicious") {
    state.alerts.unshift({ id: `alert-${Date.now()}`, severity: "High", title: "Medicine verification needs review", reason: result.reason, source: `Medicine verification · ${identifier}`, recommendation: "Quarantine the pack and route it to pharmacist review.", createdAt: now(), acknowledged: false });
  }
  state.metrics.verifiedToday += 1;
  state.metrics.openAlerts = state.alerts.filter(alert => !alert.acknowledged).length;
  return clone(result);
}

function getRequest(id: string) {
  const request = state.requests.find(item => item.id === id);
  if (!request) throw new Error("Request not found");
  return request;
}

export function createEmergencyRequest(input: { requester: string; resource: string; quantity: number; unit: string; urgency: EmergencyRequest["urgency"]; note?: string }) {
  if (!input.resource.trim() || input.quantity <= 0) throw new Error("Resource and a positive quantity are required");
  const request: EmergencyRequest = {
    id: `REQ-${Math.floor(2050 + Math.random() * 40)}`,
    requester: input.requester,
    destination: `${input.requester} · Central District`,
    resource: input.resource.trim(),
    quantity: input.quantity,
    unit: input.unit.trim() || "units",
    urgency: input.urgency,
    status: "matched",
    createdAt: now(),
    note: input.note?.trim() || "Created in controlled demo mode.",
    matches: [{ supplier: "Northbridge General Hospital", resource: input.resource.trim(), available: Math.max(input.quantity + 18, 30), unit: input.unit.trim() || "units", distance: "4.2 km", freshness: "18 min ago", score: 91, reasons: ["Sufficient stock after reserve", "Freshest report in the district", "96% source reliability"] }],
    timeline: [
      { id: `t-${Date.now()}-1`, label: "Request created", detail: "Shortage reported by hospital staff", at: now(), tone: "done" },
      { id: `t-${Date.now()}-2`, label: "Matches identified", detail: "1 possible supplier ranked by deterministic rules", at: now(), tone: "active" },
      { id: `t-${Date.now()}-3`, label: "Offer ready for approval", detail: "Review the suggested supplier and data freshness", at: "", tone: "pending" },
      { id: `t-${Date.now()}-4`, label: "Dispatch", detail: "Waiting for coordinator approval", at: "", tone: "pending" },
      { id: `t-${Date.now()}-5`, label: "Receipt", detail: "Receiving organization confirms delivery", at: "", tone: "pending" },
    ],
  };
  state.requests.unshift(request);
  state.metrics.activeRequests += 1;
  state.alerts.unshift({ id: `alert-${Date.now()}`, severity: input.urgency === "Critical" ? "Critical" : "High", title: "New emergency request needs review", reason: `${request.id} requests ${input.quantity} ${input.unit} of ${input.resource}.`, source: `Emergency exchange · ${request.id}`, recommendation: "Review the deterministic supplier match and approve an offer.", createdAt: now(), acknowledged: false });
  pushAudit("Request created", "Demo hospital staff", `${request.id} for ${input.quantity} ${input.unit} of ${input.resource}`, "navy");
  state.metrics.openAlerts = state.alerts.filter(alert => !alert.acknowledged).length;
  return clone(request);
}

const allowedRoles: Record<string, DemoRole[]> = {
  approve: ["coordinator", "admin"],
  reject: ["coordinator", "admin"],
  dispatch: ["coordinator", "admin", "hospital"],
  receive: ["hospital", "coordinator", "admin"],
  cancel: ["hospital", "coordinator", "admin"],
};

export function transitionRequest(input: { requestId: string; action: "approve" | "reject" | "dispatch" | "receive" | "cancel"; role: DemoRole }) {
  if (!allowedRoles[input.action].includes(input.role)) throw new Error(`Role ${input.role} cannot ${input.action} this request`);
  const request = getRequest(input.requestId);
  const next: Record<typeof input.action, RequestStatus> = { approve: "approved", reject: "rejected", dispatch: "dispatched", receive: "received", cancel: "cancelled" };
  const valid: Record<typeof input.action, RequestStatus[]> = {
    approve: ["matched", "awaiting_approval"],
    reject: ["matched", "awaiting_approval"],
    dispatch: ["approved", "partial"],
    receive: ["dispatched", "partial"],
    cancel: ["matched", "awaiting_approval", "approved", "dispatched"],
  };
  if (!valid[input.action].includes(request.status)) throw new Error(`Cannot ${input.action} a request in ${request.status} state`);
  request.status = next[input.action];
  const labels: Record<typeof input.action, [string, string, TimelineEvent["tone"]]> = {
    approve: ["Offer approved", "Coordinator approved the suggested supplier", "done"],
    reject: ["Offer rejected", "Coordinator rejected the suggested supplier", "danger"],
    dispatch: ["Dispatched", "Supplier recorded the handoff to courier", "active"],
    receive: ["Receipt confirmed", "Receiving organization confirmed delivery", "done"],
    cancel: ["Request cancelled", "Transfer stopped before closure", "danger"],
  };
  const [label, detail, tone] = labels[input.action];
  const event = request.timeline.find(item => item.tone === "active") || request.timeline.find(item => item.tone === "pending");
  if (event) {
    event.label = label;
    event.detail = detail;
    event.at = now();
    event.tone = tone;
  }
  const nextPending = request.timeline.find(item => item.tone === "pending");
  if (nextPending && input.action !== "reject" && input.action !== "cancel") nextPending.tone = "active";
  pushAudit(label, input.role === "coordinator" ? "Demo coordinator" : "Demo hospital staff", `${request.id} · ${detail}`, input.action === "reject" || input.action === "cancel" ? "coral" : "teal");
  if (request.status === "received" || request.status === "rejected" || request.status === "cancelled") state.metrics.activeRequests = Math.max(0, state.metrics.activeRequests - 1);
  const alert = state.alerts.find(item => item.source.includes(request.id));
  if (alert && input.action !== "reject" && input.action !== "cancel") alert.acknowledged = true;
  state.metrics.openAlerts = state.alerts.filter(item => !item.acknowledged).length;
  return clone(request);
}

export function acknowledgeAlert(id: string) {
  const alert = state.alerts.find(item => item.id === id);
  if (!alert) throw new Error("Alert not found");
  alert.acknowledged = true;
  pushAudit("Alert acknowledged", "Demo administrator", alert.title, "teal");
  state.metrics.openAlerts = state.alerts.filter(item => !item.acknowledged).length;
  return clone(alert);
}

export function searchResources(input: { query?: string; district?: string; kind?: string }) {
  const query = input.query?.trim().toLowerCase() || "";
  return clone(state.resources.filter(resource => {
    const matchesQuery = !query || [resource.name, resource.district, resource.address, resource.essential].some(value => value.toLowerCase().includes(query));
    const matchesDistrict = !input.district || input.district === "All districts" || resource.district === input.district;
    const matchesKind = !input.kind || input.kind === "All types" || resource.kind === input.kind;
    return matchesQuery && matchesDistrict && matchesKind;
  }));
}

export type RoleDashboard = {
  role: DemoRole;
  title: string;
  description: string;
  kpis: {
    label: string;
    value: string | number;
    change: string;
    direction: "up" | "down" | "flat";
    tone: "teal" | "blue" | "coral" | "purple" | "emerald";
  }[];
  priorityAlerts: Alert[];
  allowedActions: { id: string; label: string; description: string; targetTab: string }[];
  summary: {
    heading: string;
    subtext: string;
    statusBadge: string;
  };
};

export function getRoleDashboard(role: DemoRole): RoleDashboard {
  const openAlerts = state.alerts.filter(a => !a.acknowledged);

  switch (role) {
    case "hospital": {
      const activeIncoming = state.requests.filter(r => r.status === "dispatched" || r.status === "approved").length;
      return {
        role,
        title: "Hospital Staff Workspace",
        description: "Ward-level capacity, bed management, and emergency supply replenishment.",
        kpis: [
          { label: "Available General Beds", value: 48, change: "-3 in last 4h", direction: "down", tone: "teal" },
          { label: "ICU Beds Ready", value: 6, change: "Critical capacity", direction: "down", tone: "coral" },
          { label: "Oxygen Reserve", value: "142 cyl", change: "+12 hrs buffer", direction: "up", tone: "blue" },
          { label: "Incoming Dispatches", value: activeIncoming || 1, change: "REQ-2031 on route", direction: "up", tone: "purple" },
        ],
        priorityAlerts: openAlerts.filter(a => a.severity === "Critical" || a.title.toLowerCase().includes("oxygen") || a.title.toLowerCase().includes("inventory")),
        allowedActions: [
          { id: "report_shortage", label: "Report Shortage", description: "Request immediate supply matching across district hospitals", targetTab: "exchange" },
          { id: "confirm_receipt", label: "Confirm Receipt", description: "Acknowledge arrival of dispatched medicine or supplies", targetTab: "exchange" },
          { id: "check_icu", label: "Check ICU Digital Twin", description: "Monitor real-time bed & ventilator loads across 5 hospitals", targetTab: "innovations" },
        ],
        summary: {
          heading: "Ward Operations Active",
          subtext: "Real-time bed, oxygen, and emergency handoff view for Saint Elara & Northbridge",
          statusBadge: "Operational",
        },
      };
    }
    case "pharmacist": {
      const suspicious = state.medicines.filter(m => m.outcome === "Suspicious").length;
      return {
        role,
        title: "Pharmacist & Supply Chain Console",
        description: "Medicine batch verification, tamper detection, and inventory safety thresholds.",
        kpis: [
          { label: "Scanned Batches Today", value: state.metrics.verifiedToday, change: "+5 from yesterday", direction: "up", tone: "blue" },
          { label: "Suspicious Batches Flagged", value: suspicious, change: "Quarantine active", direction: "up", tone: "coral" },
          { label: "Expiring in < 30 Days", value: 3, change: "Action required", direction: "down", tone: "purple" },
          { label: "Verification Pass Rate", value: "88.4%", change: "+2.1% compliance", direction: "up", tone: "emerald" },
        ],
        priorityAlerts: openAlerts.filter(a => a.source.toLowerCase().includes("medicine") || a.title.toLowerCase().includes("medicine") || a.title.toLowerCase().includes("ceftriaxone")),
        allowedActions: [
          { id: "verify_batch", label: "Verify Medicine Batch / QR", description: "Check batch integrity, recall lists, and tamper markers", targetTab: "verify" },
          { id: "manage_inventory", label: "Review Pharmacy Stock", description: "Inspect critical drug reserves and expiry thresholds", targetTab: "inventory" },
          { id: "flag_counterfeit", label: "Flag Anomaly to Coordinator", description: "Trigger network-wide quarantine alert for suspicious lots", targetTab: "alerts" },
        ],
        summary: {
          heading: "Medicine Trust & Quality Assurance",
          subtext: "Active drug batch verification, serial checking, and cold-chain audit",
          statusBadge: "High Alert",
        },
      };
    }
    case "coordinator": {
      const pendingApprovals = state.requests.filter(r => r.status === "awaiting_approval").length;
      return {
        role,
        title: "Emergency Coordinator Station",
        description: "Regional mutual-aid matching, inter-hospital transfers, and shortage response.",
        kpis: [
          { label: "Awaiting Match Approval", value: pendingApprovals || 1, change: "Urgent decision required", direction: "up", tone: "coral" },
          { label: "Active Regional Exchanges", value: state.metrics.activeRequests, change: "In-flight dispatches", direction: "flat", tone: "blue" },
          { label: "Average Match Time", value: "2.4 min", change: "-45s deterministic engine", direction: "down", tone: "emerald" },
          { label: "District Shortage Pressure", value: "High", change: "Respiratory & Oxygen peak", direction: "up", tone: "purple" },
        ],
        priorityAlerts: openAlerts,
        allowedActions: [
          { id: "review_matches", label: "Review Exchange Proposals", description: "Approve or decline ranked hospital supply handoffs", targetTab: "exchange" },
          { id: "disaster_sim", label: "Simulate Crisis / Surge", description: "Run AI stress-test simulation across district healthcare twin", targetTab: "innovations" },
          { id: "audit_network", label: "Inspect Exchange Audit Trail", description: "Review immutable logs for all dispatch and custody events", targetTab: "audit" },
        ],
        summary: {
          heading: "District Emergency Coordination Center",
          subtext: "Regional orchestration layer managing cross-hospital mutual aid and transfers",
          statusBadge: "Active Coordination",
        },
      };
    }
    case "admin": {
      return {
        role,
        title: "Administrative & Compliance Console",
        description: "System health, audit trail review, security alerts, and node telemetry.",
        kpis: [
          { label: "Network Integrity Score", value: "99.4%", change: "Zero tamper events", direction: "up", tone: "emerald" },
          { label: "Connected Healthcare Nodes", value: state.metrics.resourcesTracked, change: "All facilities reporting", direction: "flat", tone: "teal" },
          { label: "Open Alerts", value: state.metrics.openAlerts, change: "Review required", direction: "up", tone: "coral" },
          { label: "Audit Events (24h)", value: state.audit.length, change: "Fully traceable", direction: "up", tone: "blue" },
        ],
        priorityAlerts: openAlerts,
        allowedActions: [
          { id: "audit_trail", label: "View Complete Security Audit", description: "Examine actor IDs, timestamps, and state transitions", targetTab: "audit" },
          { id: "system_alerts", label: "Acknowledge System Alerts", description: "Triage and resolve infrastructure warning signals", targetTab: "alerts" },
          { id: "manage_resources", label: "Manage Facility Registry", description: "Review registered hospitals and pharmacy twin parameters", targetTab: "resources" },
        ],
        summary: {
          heading: "Administrative Command Center",
          subtext: "System-wide telemetry, access governance, and cryptographically logged operations",
          statusBadge: "Compliant",
        },
      };
    }
    case "public":
    default: {
      return {
        role: "public",
        title: "Public Health & Readiness Directory",
        description: "Public visibility into verified hospital capacity, emergency numbers, and medicine verification.",
        kpis: [
          { label: "Verified Facilities Nearby", value: state.metrics.resourcesTracked, change: "Within 10 km", direction: "flat", tone: "teal" },
          { label: "Emergency Helpline", value: "24/7", change: "Avg response < 15s", direction: "up", tone: "emerald" },
          { label: "Regional Blood Reserve", value: "182 units", change: "O+ / A+ stable", direction: "flat", tone: "blue" },
          { label: "Emergency Ward Status", value: "Open", change: "All district centres", direction: "flat", tone: "purple" },
        ],
        priorityAlerts: openAlerts.filter(a => a.severity === "Info" || a.title.toLowerCase().includes("advisory")),
        allowedActions: [
          { id: "find_hospital", label: "Find Closest Hospital", description: "Check real-time bed and oxygen availability in your area", targetTab: "resources" },
          { id: "verify_med", label: "Check Medicine Batch Authenticity", description: "Scan or enter your prescription package code", targetTab: "verify" },
          { id: "patient_portal", label: "Open Patient Portal", description: "Book an appointment or submit a hospital service request", targetTab: "portal" },
        ],
        summary: {
          heading: "Public Healthcare & Safety Directory",
          subtext: "Read-only district resource indicators and verified health facility information",
          statusBadge: "Public Mode",
        },
      };
    }
  }
}
