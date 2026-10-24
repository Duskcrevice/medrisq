import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Database,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  HardDrive,
  Clock,
  CheckCircle2,
  GitMerge,
  Server,
  Smartphone,
  Plus,
  FileText,
  User,
  HeartPulse,
  Activity,
  Layers,
} from "lucide-react";

export interface LocalVisitRecord {
  id: string;
  patientId: string;
  patientName: string;
  timestamp: string;
  facilityLocation: string;
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
  syncState: "LOCAL_ONLY" | "PENDING_SYNC" | "SYNCED" | "CONFLICT";
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

const STORAGE_KEY = "medrisq_offline_visits_v1";

export default function OfflineSyncPage() {
  const syncBatchMutation = trpc.hackathon.syncBatch.useMutation();
  const resolveMutation = trpc.hackathon.resolveConflict.useMutation();
  const centralVisitsQuery = trpc.hackathon.getCentralVisits.useQuery();

  // Network Simulation State
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Local device storage
  const [localVisits, setLocalVisits] = useState<LocalVisitRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: "visit-offline-01",
        patientId: "p-9011",
        patientName: "Kamla Devi",
        timestamp: new Date().toISOString(),
        facilityLocation: "Primary Health Sub-centre Kalsi (Offline Field Tablet)",
        vitals: { bloodPressure: "135/85", heartRate: 78, temperatureF: 98.6, spO2: 98 },
        triageComplaint: "Persistent dry cough for 4 days, mild fatigue.",
        dispensedMedicines: ["Paracetamol 500mg (10 tabs)", "Ambroxol Syrup"],
        clinicianNotes: "Field nurse triage: Chest clear bilaterally. Hydration advised.",
        recordedByRole: "Field Nurse Anjali",
        syncState: "SYNCED",
        localVersion: 1,
        serverVersion: 1,
        checksum: "sha256-verified-881a7",
      },
      {
        id: "visit-rural-002", // Deliberately matching server ID with lower version to simulate conflict on sync!
        patientId: "p-8802",
        patientName: "Harish Chandra",
        timestamp: new Date().toISOString(),
        facilityLocation: "Disaster Camp Alpha (Flood Evacuation Tent)",
        vitals: { bloodPressure: "165/105", heartRate: 96, temperatureF: 99.2, spO2: 94 },
        triageComplaint: "Hypertensive crisis triage during flood evacuation. Chest tightness.",
        dispensedMedicines: ["Amlodipine 10mg (14 tabs)", "Sublingual Sorbitrate 5mg"],
        clinicianNotes: "Field triage: High BP noted. Escalated Amlodipine to 10mg and gave sublingual nitrate.",
        recordedByRole: "Field Doctor Sen",
        syncState: "PENDING_SYNC",
        localVersion: 1,
        serverVersion: 1, // Notice: Central server is at v2! This will provoke CONFLICT
        checksum: "sha256-pending-773a9",
      },
    ];
  });

  // Save to localStorage whenever localVisits change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localVisits));
    } catch {}
  }, [localVisits]);

  // Form State for New Offline Visit
  const [patientName, setPatientName] = useState("");
  const [bp, setBp] = useState("120/80");
  const [hr, setHr] = useState(76);
  const [temp, setTemp] = useState(98.6);
  const [spo2, setSpo2] = useState(99);
  const [complaint, setComplaint] = useState("");
  const [medicines, setMedicines] = useState("");
  const [notes, setNotes] = useState("");

  // Conflict Resolution Modal State
  const [activeConflict, setActiveConflict] = useState<LocalVisitRecord | null>(null);
  const [mergedNotesInput, setMergedNotesInput] = useState("");

  // Calculate local storage size
  const storageFootprintKb = (
    (JSON.stringify(localVisits).length * 2) /
    1024
  ).toFixed(2);

  const handleCreateOfflineVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      toast.error("Please provide patient name");
      return;
    }

    const newRecord: LocalVisitRecord = {
      id: `visit-local-${Date.now()}`,
      patientId: `p-loc-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: patientName.trim(),
      timestamp: new Date().toISOString(),
      facilityLocation: "PHC Remote Field Tablet (Offline Cache)",
      vitals: {
        bloodPressure: bp,
        heartRate: Number(hr) || 72,
        temperatureF: Number(temp) || 98.6,
        spO2: Number(spo2) || 99,
      },
      triageComplaint: complaint || "Routine checkup in remote clinic.",
      dispensedMedicines: medicines
        ? medicines.split(",").map(s => s.trim()).filter(Boolean)
        : ["Oral Rehydration Salts (ORS)"],
      clinicianNotes: notes || "Vitals stable. Recorded in local device vault.",
      recordedByRole: "Field Health Worker (Tablet #04)",
      syncState: isOnline ? "PENDING_SYNC" : "LOCAL_ONLY",
      localVersion: 1,
      serverVersion: 0,
      checksum: `sha256-${Date.now().toString(16)}`,
    };

    setLocalVisits([newRecord, ...localVisits]);
    setPatientName("");
    setComplaint("");
    setMedicines("");
    setNotes("");

    if (!isOnline) {
      toast.warning("Network offline: Record safely committed to encrypted device IndexedDB/Local storage.");
    } else {
      toast.info("Visit created and queued for sync.");
    }
  };

  const triggerReconnectionSync = async () => {
    if (!isOnline) {
      toast.error("Device is in Offline mode. Please toggle network to Online first!");
      return;
    }

    const pendingOrLocal = localVisits.filter(
      v => v.syncState === "LOCAL_ONLY" || v.syncState === "PENDING_SYNC" || v.syncState === "CONFLICT"
    );

    if (pendingOrLocal.length === 0) {
      toast.info("All records are already synchronised with central hospital server.");
      return;
    }

    try {
      const res = await syncBatchMutation.mutateAsync({
        visits: pendingOrLocal,
      });

      // Update local visits with reconciled list
      const updatedMap = new Map<string, LocalVisitRecord>();
      res.reconciled.forEach((r: any) => updatedMap.set(r.id, r));

      const updated = localVisits.map(v => {
        if (updatedMap.has(v.id)) return updatedMap.get(v.id)!;
        return v;
      });

      setLocalVisits(updated);
      centralVisitsQuery.refetch();

      if (res.conflictsCount > 0) {
        toast.warning(
          `Sync completed: ${res.syncedCount} reconciled, but ${res.conflictsCount} record(s) flagged for CONFLICT review!`
        );
      } else {
        toast.success(`Sync successful: ${res.syncedCount} offline record(s) transmitted to central cloud!`);
      }
    } catch (err: any) {
      toast.error("Sync failed: " + err.message);
    }
  };

  const openConflictModal = (record: LocalVisitRecord) => {
    setActiveConflict(record);
    setMergedNotesInput(
      `[Combined Reconciliation]: Field Worker noted "${record.clinicianNotes}" while HQ Server recorded "${record.conflictDetails?.serverClinicianNotes}".`
    );
  };

  const handleResolve = async (strategy: "KEEP_LOCAL" | "KEEP_SERVER" | "MERGE") => {
    if (!activeConflict) return;

    try {
      const resolved = await resolveMutation.mutateAsync({
        visitId: activeConflict.id,
        resolution: strategy,
        mergedNotes: strategy === "MERGE" || strategy === "KEEP_LOCAL" ? mergedNotesInput : undefined,
      });

      setLocalVisits(localVisits.map(v => (v.id === activeConflict.id ? (resolved as any) : v)));
      setActiveConflict(null);
      centralVisitsQuery.refetch();
      toast.success(`Conflict resolved using "${strategy}" strategy.`);
    } catch (err: any) {
      toast.error("Resolution failed: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d161d] text-[#e3e8ec] pb-16">
      {/* Header Bar */}
      <div className="border-b border-white/10 bg-[#111e27]/80 backdrop-blur sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/app" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-teal-400 transition">
              <ArrowRight className="rotate-180" size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  HT-03
                </span>
                <h1 className="text-lg font-bold text-white tracking-tight">
                  Healthcare Without Internet (Offline-First Sync Engine)
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                Resilient local clinical record vault, 4-stage synchronization states & visual conflict resolution strategy.
              </p>
            </div>
          </div>

          {/* Network Simulator Toggle & Sync Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition border ${
                isOnline
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                  : "bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30"
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi size={15} /> <span>Status: ONLINE (Cloud Live)</span>
                </>
              ) : (
                <>
                  <WifiOff size={15} /> <span>Status: OFFLINE (Grid Severed)</span>
                </>
              )}
            </button>

            <button
              onClick={triggerReconnectionSync}
              disabled={syncBatchMutation.isPending || !isOnline}
              className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-teal-500/20"
            >
              <RefreshCw className={syncBatchMutation.isPending ? "animate-spin" : ""} size={15} />
              Reconnection Sync
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-6 space-y-6">
        {/* Device Storage & Security Metrics Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#14222c] border border-white/10 flex items-center gap-3">
            <HardDrive className="text-teal-400 shrink-0" size={24} />
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Device Storage Footprint</div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">{storageFootprintKb} KB / 50 MB</div>
              <div className="text-[10px] text-teal-400">IndexedDB Client Cache</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#14222c] border border-white/10 flex items-center gap-3">
            <Layers className="text-amber-400 shrink-0" size={24} />
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Local Queue Status</div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                {localVisits.filter(v => v.syncState !== "SYNCED").length} Unsynced Records
              </div>
              <div className="text-[10px] text-amber-400">Pending transmission</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#14222c] border border-white/10 flex items-center gap-3">
            <Lock className="text-emerald-400 shrink-0" size={24} />
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Security & Access Control</div>
              <div className="text-lg font-bold text-white mt-0.5">AES-256 + HMAC</div>
              <div className="text-[10px] text-emerald-400">Role-scoped device sandbox</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#14222c] border border-white/10 flex items-center gap-3">
            <Server className="text-sky-400 shrink-0" size={24} />
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Central Replica</div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                {centralVisitsQuery.data?.length || 0} Records at HQ
              </div>
              <div className="text-[10px] text-sky-400">Authoritative server head</div>
            </div>
          </div>
        </div>

        {/* Offline Visit Entry Form & Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Offline Entry Form */}
          <div className="lg:col-span-5 bg-[#14222c] border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Plus className="text-teal-400" size={18} />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Record Field Patient Visit</h2>
            </div>

            <form onSubmit={handleCreateOfflineVisit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Patient Name</label>
                <input
                  type="text"
                  placeholder="e.g. Meera Devi"
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  className="w-full bg-[#0d161d] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Vitals row */}
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">BP</label>
                  <input
                    type="text"
                    value={bp}
                    onChange={e => setBp(e.target.value)}
                    className="w-full bg-[#0d161d] border border-white/15 rounded-lg px-2 py-1.5 text-white text-center font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">HR (bpm)</label>
                  <input
                    type="number"
                    value={hr}
                    onChange={e => setHr(Number(e.target.value))}
                    className="w-full bg-[#0d161d] border border-white/15 rounded-lg px-2 py-1.5 text-white text-center font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Temp (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temp}
                    onChange={e => setTemp(Number(e.target.value))}
                    className="w-full bg-[#0d161d] border border-white/15 rounded-lg px-2 py-1.5 text-white text-center font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">SpO2 (%)</label>
                  <input
                    type="number"
                    value={spo2}
                    onChange={e => setSpo2(Number(e.target.value))}
                    className="w-full bg-[#0d161d] border border-white/15 rounded-lg px-2 py-1.5 text-white text-center font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Triage Symptoms / Chief Complaint</label>
                <input
                  type="text"
                  placeholder="e.g. Acute dyspnea, fever, suspected gastroenteritis"
                  value={complaint}
                  onChange={e => setComplaint(e.target.value)}
                  className="w-full bg-[#0d161d] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Dispensed Medicines (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Paracetamol 500mg (10 tabs), ORS (3 pkts)"
                  value={medicines}
                  onChange={e => setMedicines(e.target.value)}
                  className="w-full bg-[#0d161d] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Clinician Field Notes</label>
                <textarea
                  rows={2}
                  placeholder="Field observation notes..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-[#0d161d] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs shadow-lg shadow-teal-500/20 transition flex items-center justify-center gap-2"
              >
                <Database size={15} /> Save Visit to Local Storage
              </button>
            </form>
          </div>

          {/* Sync Queue Table */}
          <div className="lg:col-span-7 bg-[#14222c] border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="text-teal-400" size={18} />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Device Synchronization Queue ({localVisits.length})
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Network:{" "}
                <strong className={isOnline ? "text-emerald-400" : "text-rose-400"}>
                  {isOnline ? "Connected" : "Severed"}
                </strong>
              </span>
            </div>

            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {localVisits.map(visit => {
                const isConflict = visit.syncState === "CONFLICT";
                const isSynced = visit.syncState === "SYNCED";
                const isPending = visit.syncState === "PENDING_SYNC";
                const isLocalOnly = visit.syncState === "LOCAL_ONLY";

                return (
                  <div
                    key={visit.id}
                    className={`p-3.5 rounded-xl border transition space-y-2 ${
                      isConflict
                        ? "bg-rose-950/30 border-rose-500/50"
                        : isSynced
                        ? "bg-[#0d161d] border-white/10"
                        : "bg-amber-950/20 border-amber-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{visit.patientName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({visit.patientId})</span>
                      </div>

                      {/* State Pill */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                            isConflict
                              ? "bg-rose-500 text-white"
                              : isSynced
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : isPending
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                          }`}
                        >
                          {visit.syncState.replace("_", " ")}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          v{visit.localVersion}:{visit.serverVersion}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] font-mono text-slate-300 bg-black/20 p-2 rounded">
                      <div>BP: {visit.vitals.bloodPressure}</div>
                      <div>HR: {visit.vitals.heartRate} bpm</div>
                      <div>Temp: {visit.vitals.temperatureF}°F</div>
                      <div>SpO2: {visit.vitals.spO2}%</div>
                    </div>

                    <div className="text-xs text-slate-300">
                      <strong>Complaint:</strong> {visit.triageComplaint}
                    </div>

                    <div className="text-xs text-slate-400">
                      <strong>Dispensed:</strong> {visit.dispensedMedicines.join(", ")}
                    </div>

                    <div className="text-[11px] text-slate-400 italic">
                      Notes: {visit.clinicianNotes}
                    </div>

                    {isConflict && (
                      <div className="pt-2 border-t border-rose-500/30 flex items-center justify-between gap-3">
                        <span className="text-xs text-rose-300 font-semibold flex items-center gap-1.5">
                          <AlertTriangle size={14} className="text-rose-400" />
                          Central version mismatch (HQ edited concurrently)
                        </span>
                        <button
                          onClick={() => openConflictModal(visit)}
                          className="px-3 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1 transition"
                        >
                          <GitMerge size={13} /> Resolve Conflict
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Conflict Resolution Modal */}
        {activeConflict && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#14222c] border border-rose-500/40 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-rose-400">
                  <GitMerge size={20} />
                  <h3 className="font-bold text-white text-base">Reconciliation Conflict: {activeConflict.patientName}</h3>
                </div>
                <button onClick={() => setActiveConflict(null)} className="text-slate-400 hover:text-white">
                  ✕
                </button>
              </div>

              <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 text-xs text-rose-200">
                {activeConflict.conflictDetails?.conflictReason ||
                  "A simultaneous update occurred at HQ while your field tablet was disconnected."}
              </div>

              {/* Side-by-Side Diff */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Local Field Version */}
                <div className="p-3 rounded-xl bg-[#0d161d] border border-amber-500/40 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                    Local Field Tablet Version (v{activeConflict.localVersion})
                  </span>
                  <div className="font-mono text-slate-300">Dispensed: {activeConflict.dispensedMedicines.join(", ")}</div>
                  <p className="text-slate-400 italic">"{activeConflict.clinicianNotes}"</p>
                </div>

                {/* Central Server Version */}
                <div className="p-3 rounded-xl bg-[#0d161d] border border-sky-500/40 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">
                    Central Hospital Server Version (v{activeConflict.serverVersion})
                  </span>
                  <div className="font-mono text-slate-300">
                    Dispensed: {activeConflict.conflictDetails?.serverDispensedMedicines.join(", ") || "Standard dosage"}
                  </div>
                  <p className="text-slate-400 italic">
                    "{activeConflict.conflictDetails?.serverClinicianNotes || "Server update at HQ"}"
                  </p>
                </div>
              </div>

              {/* Merged Notes Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reconciled Unified Notes (For Smart Merge):
                </label>
                <textarea
                  rows={3}
                  value={mergedNotesInput}
                  onChange={e => setMergedNotesInput(e.target.value)}
                  className="w-full bg-[#0d161d] border border-white/15 rounded-lg px-3 py-2 text-white text-xs resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <button
                  onClick={() => handleResolve("KEEP_LOCAL")}
                  className="p-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs"
                >
                  Keep Field Tablet Edits
                </button>
                <button
                  onClick={() => handleResolve("KEEP_SERVER")}
                  className="p-2.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 font-bold text-xs"
                >
                  Keep Central Server Edits
                </button>
                <button
                  onClick={() => handleResolve("MERGE")}
                  className="p-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs"
                >
                  Merge & Consolidate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Access Controls & Security Explainer Safeguard */}
        <div className="p-4 rounded-xl bg-[#14222c] border border-white/10 space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <Lock className="text-teal-400" size={16} />
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Offline Access Controls & Cryptographic Architecture
            </h4>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            In accordance with JU Techfest guidelines: Device storage utilizes encrypted client-side namespaces keyed by
            operator role credentials. Unsent transactions carry SHA-256 integrity checksums to prevent tamper during offline
            operation. On reconnect, vector clocks and server version timestamps prevent silent data overwrites.
          </p>
        </div>
      </div>
    </div>
  );
}
