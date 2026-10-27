import React, { useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  Bell,
  RefreshCw,
  AlertTriangle,
  LifeBuoy,
  MapPin,
  Scan,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Share2,
} from "lucide-react";
import "../pages/dashboard-suite.css";

export default function RegionalOperationsView({ onClose }: { onClose?: () => void }) {
  const [activeTab, setActiveTab] = useState<
    "brief" | "digital-twin" | "trust-passport" | "emergency-matching" | "medicine-rescue" | "disaster-swarm"
  >("brief");

  return (
    <div className="bg-[#f8fafc] min-h-screen text-slate-800">
      {/* Top Breadcrumb & Status Bar (Image 8.56.06) */}
      <div className="bg-white border-b border-slate-200 px-8 py-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-500">
          <span className="font-bold tracking-wider text-slate-700">OPERATIONS CONSOLE</span>
          <span>/</span>
          <span className="text-slate-900 font-semibold capitalize">{activeTab.replace("-", " ")}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Demo data synced
          </span>
          <span className="text-slate-600 font-medium">Emergency coordinator</span>
          {onClose && (
            <button
              type="button"
              className="text-xs font-bold text-[#0d9488] hover:underline"
              onClick={onClose}
            >
              ← Back to Main Console
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {/* Header (Image 8.56.06) */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1">
              MONDAY · 12 OCTOBER 2026 · 09:42
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">Morning operations brief</h1>
            <p className="text-sm text-slate-500 mt-1">One view of the signals that need a human decision today.</p>
          </div>
          <button
            type="button"
            className="mn-btn-action-white text-xs"
            onClick={() => toast.success("Refreshed regional telemetry.")}
          >
            <RefreshCw size={13} /> Refresh data
          </button>
        </div>

        {/* 4 Stat Cards Row (Image 8.56.06) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>Open alerts</span>
              <Bell size={14} className="text-red-500" />
            </div>
            <div className="text-3xl font-black text-slate-900">04</div>
            <div className="text-xs text-red-600 font-bold mt-2">↗ 2 critical</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>Active requests</span>
              <LifeBuoy size={14} className="text-amber-500" />
            </div>
            <div className="text-3xl font-black text-slate-900">02</div>
            <div className="text-xs text-amber-600 font-bold mt-2">∿ 1 awaiting approval</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>Resources tracked</span>
              <MapPin size={14} className="text-teal-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">04</div>
            <div className="text-xs text-teal-600 font-bold mt-2">↗ 3 fresh reports</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>Checks today</span>
              <Scan size={14} className="text-purple-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">18</div>
            <div className="text-xs text-purple-600 font-bold mt-2">↘ 5 need review</div>
          </div>
        </div>

        {/* FIVE CONNECTED INNOVATIONS Dark Banner (Image 8.56.06 & 8.56.10) */}
        <div className="bg-[#09222c] text-white rounded-2xl p-6 mb-8 border border-[#134152]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10.5px] font-extrabold tracking-wider text-teal-300 uppercase block">
                FIVE CONNECTED INNOVATIONS
              </span>
              <h3 className="text-base font-bold text-white">From forecast to handoff</h3>
            </div>
            <span className="text-xs font-bold text-teal-300">Open innovation lab →</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <button
              type="button"
              className={`p-3 rounded-xl border text-left transition-all ${
                activeTab === "digital-twin"
                  ? "bg-[#0d9488] border-[#2dd4bf] text-white"
                  : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
              }`}
              onClick={() => setActiveTab("digital-twin")}
            >
              <div className="font-bold text-xs">Digital twin</div>
              <div className="text-[10px] text-teal-200 mt-0.5">Forecast shortages</div>
            </button>

            <button
              type="button"
              className={`p-3 rounded-xl border text-left transition-all ${
                activeTab === "trust-passport"
                  ? "bg-[#0d9488] border-[#2dd4bf] text-white"
                  : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
              }`}
              onClick={() => setActiveTab("trust-passport")}
            >
              <div className="font-bold text-xs">Trust passport</div>
              <div className="text-[10px] text-teal-200 mt-0.5">Verify supply</div>
            </button>

            <button
              type="button"
              className={`p-3 rounded-xl border text-left transition-all ${
                activeTab === "emergency-matching"
                  ? "bg-[#0d9488] border-[#2dd4bf] text-white"
                  : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
              }`}
              onClick={() => setActiveTab("emergency-matching")}
            >
              <div className="font-bold text-xs">Emergency matching</div>
              <div className="text-[10px] text-teal-200 mt-0.5">Route referrals</div>
            </button>

            <button
              type="button"
              className={`p-3 rounded-xl border text-left transition-all ${
                activeTab === "medicine-rescue"
                  ? "bg-[#0d9488] border-[#2dd4bf] text-white"
                  : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
              }`}
              onClick={() => setActiveTab("medicine-rescue")}
            >
              <div className="font-bold text-xs">Medicine rescue</div>
              <div className="text-[10px] text-teal-200 mt-0.5">Move surplus</div>
            </button>

            <button
              type="button"
              className={`p-3 rounded-xl border text-left transition-all ${
                activeTab === "disaster-swarm"
                  ? "bg-[#0d9488] border-[#2dd4bf] text-white"
                  : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
              }`}
              onClick={() => setActiveTab("disaster-swarm")}
            >
              <div className="font-bold text-xs">Disaster swarm</div>
              <div className="text-[10px] text-teal-200 mt-0.5">Simulate demand</div>
            </button>
          </div>
        </div>

        {/* Priority Queue & Emergency Exchange Grid (Image 8.56.06 & 8.56.07) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Priority Queue */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10.5px] font-extrabold tracking-wider text-slate-500 uppercase block">
                  PRIORITY QUEUE
                </span>
                <h3 className="text-base font-bold text-slate-900">Human attention needed</h3>
              </div>
              <span className="text-xs font-bold text-[#0d9488]">View all →</span>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-slate-900">Urgent oxygen request unresolved</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                    Critical
                  </span>
                </div>
                <div className="text-xs text-slate-600">REQ-2048 has been awaiting approval for 4 minutes.</div>
                <div className="text-[11px] text-slate-400 mt-2">Emergency exchange · REQ-2048 · 57 min ago</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-slate-900">Ceftriaxone inventory below threshold</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    High
                  </span>
                </div>
                <div className="text-xs text-slate-600">9 vials reported against a threshold of 12.</div>
                <div className="text-[11px] text-slate-400 mt-2">Riverbend Community Pharmacy · inventory · 2 hr ago</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-slate-900">Greenline report is stale</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    Medium
                  </span>
                </div>
                <div className="text-xs text-slate-600">The last inventory report is 27 hours old.</div>
                <div className="text-[11px] text-slate-400 mt-2">Greenline Pharmacy Network · inventory · 6 hr ago</div>
              </div>
            </div>
          </div>

          {/* Emergency Exchange (Image 8.56.18) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10.5px] font-extrabold tracking-wider text-slate-500 uppercase block">
                    EMERGENCY EXCHANGE
                  </span>
                  <h3 className="text-base font-bold text-slate-900">Next safe handoff</h3>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Demo live
                </span>
              </div>

              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 mb-4">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                  Critical
                </span>
                <div className="text-2xl font-black text-slate-900 mt-2">30 cylinders</div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Oxygen cylinders · Saint Elara Medical Centre · East Ward
                </div>
              </div>

              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 mb-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold text-sm text-slate-900">Northbridge General Hospital</div>
                  <span className="text-xs font-bold text-emerald-700">94 MATCH</span>
                </div>
                <div className="text-xs text-slate-600">124 cylinders available · report 18 min ago · 4.2 km</div>
                <div className="text-[11px] text-emerald-800 mt-2 font-medium">
                  ✓ Sufficient stock after reserve · ✓ Freshest report · ✓ 96% reliability
                </div>
              </div>
            </div>

            <button
              type="button"
              className="mn-btn-action-teal w-full justify-center py-3 text-sm font-bold"
              onClick={() => toast.success("Approved offer for 30 oxygen cylinders! Audit event recorded.")}
            >
              Approve offer →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
