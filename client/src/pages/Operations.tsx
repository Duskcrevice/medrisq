import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuthUser, type ActiveUser } from "@/contexts/AuthContext";
import PortalLoginGate from "@/components/PortalLoginGate";
import InnovationPage from "@/pages/InnovationPage";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  Crosshair,
  FileCheck2,
  Filter,
  Hospital,
  LayoutDashboard,
  LifeBuoy,
  ListFilter,
  LogOut,
  MapPin,
  Menu,
  PackageCheck,
  RefreshCcw,
  RotateCcw,
  ScanLine,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Truck,
  UserRound,
  X,
  Pill,
  FileText,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import type { Alert, DemoRole, DemoSnapshot, Match, Medicine, Resource } from "../../../server/demoStore";

type Page = "overview" | "innovations" | "resources" | "verify" | "exchange" | "inventory" | "alerts" | "audit";

const navItems: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview",    label: "Overview",           icon: LayoutDashboard },
  { id: "innovations", label: "Innovation lab",      icon: Crosshair },
  { id: "resources",   label: "Find resources",      icon: MapPin },
  { id: "verify",      label: "Verify medicine",     icon: ScanLine },
  { id: "exchange",    label: "Emergency exchange",  icon: LifeBuoy },
  { id: "inventory",   label: "Inventory",           icon: PackageCheck },
  { id: "alerts",      label: "Alerts",              icon: Bell },
  { id: "audit",       label: "Audit trail",         icon: ClipboardList },
];

const roleOptions: { value: DemoRole; label: string; description: string; bannerTone: string }[] = [
  { value: "hospital",    label: "Hospital staff",         description: "Report shortages and confirm receipts",  bannerTone: "teal" },
  { value: "pharmacist",  label: "Pharmacist",             description: "Verify medicines and manage batches",    bannerTone: "blue" },
  { value: "coordinator", label: "Emergency coordinator",  description: "Approve offers and oversee transfers",   bannerTone: "coral" },
  { value: "admin",       label: "Administrator",          description: "Review alerts, audit, and settings",     bannerTone: "purple" },
  { value: "public",      label: "Public user",            description: "Discover reported resources (read-only)",bannerTone: "gray" },
];

function pageFromPath(path: string): Page {
  const segment = path.split("/")[2] as Page | undefined;
  return navItems.some(item => item.id === segment) ? (segment as Page) : "overview";
}

function timeAgo(date?: string) {
  if (!date) return "Pending";
  const diff = Math.max(0, Date.now() - new Date(date).getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 2) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)} d ago`;
}

function statusClass(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

function MetricCard({ label, value, change, direction, icon: Icon, tone }: { label: string; value: string | number; change: string; direction: "up" | "down" | "flat"; icon: LucideIcon; tone: string }) {
  return <div className="metric-card"><div className={`metric-icon ${tone}`}><Icon size={18} /></div><div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className={`metric-change ${direction}`}>{direction === "up" ? <ArrowUpRight size={13} /> : direction === "down" ? <ArrowDownRight size={13} /> : <Activity size={13} />} {change}</div></div>;
}

function EmptyState({ icon: Icon, title, copy }: { icon: typeof Search; title: string; copy: string }) {
  return <div className="empty-state"><div className="empty-icon"><Icon size={21} /></div><strong>{title}</strong><p>{copy}</p></div>;
}

function getKpiIcon(label: string): LucideIcon {
  const l = label.toLowerCase();
  if (l.includes("bed") || l.includes("hospital")) return Hospital;
  if (l.includes("icu")) return AlertTriangle;
  if (l.includes("oxygen")) return Activity;
  if (l.includes("dispatch") || l.includes("transfer") || l.includes("incoming")) return Truck;
  if (l.includes("scan") || l.includes("check")) return ScanLine;
  if (l.includes("suspicious") || l.includes("counterfeit") || l.includes("quarantine")) return ShieldAlert;
  if (l.includes("expir") || l.includes("clock")) return Clock3;
  if (l.includes("rate") || l.includes("pass") || l.includes("integrity")) return ShieldCheck;
  if (l.includes("approval") || l.includes("match")) return LifeBuoy;
  if (l.includes("alert")) return Bell;
  if (l.includes("audit") || l.includes("trail")) return ClipboardList;
  if (l.includes("helpline") || l.includes("facility") || l.includes("nearby")) return MapPin;
  return LayoutDashboard;
}

function OverviewPage({ snapshot, setPage, role, currentUser }: { snapshot: DemoSnapshot; setPage: (page: Page) => void; role: DemoRole; currentUser?: ActiveUser | null }) {
  const roleDashboardQuery = trpc.demo.getRoleDashboard.useQuery({ role });
  const dashboard = roleDashboardQuery.data;

  const criticalAlerts = (dashboard?.priorityAlerts || snapshot.alerts.filter(alert => !alert.acknowledged)).slice(0, 3);
  const activeRequest = snapshot.requests.find(request => request.status === "awaiting_approval" || request.status === "matched");
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const kpis = dashboard?.kpis || [
    { label: "Open alerts", value: snapshot.metrics.openAlerts.toString().padStart(2, "0"), change: "unacknowledged", direction: "up" as const, tone: "coral" as const },
    { label: "Active requests", value: snapshot.metrics.activeRequests.toString().padStart(2, "0"), change: "in progress", direction: "flat" as const, tone: "amber" as const },
    { label: "Resources tracked", value: snapshot.metrics.resourcesTracked.toString().padStart(2, "0"), change: "live reported", direction: "up" as const, tone: "teal" as const },
    { label: "Checks today", value: snapshot.metrics.verifiedToday, change: "verified scans", direction: "flat" as const, tone: "navy" as const },
  ];

  const handleActionClick = (targetTab: string) => {
    if (targetTab === "portal") {
      window.location.href = "/portal";
    } else {
      setPage(targetTab as Page);
    }
  };

  // ── Public user: read-only district summary ──────────────────────────────
  if (role === "public") {
    return <div className="page-content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">{dashboard?.summary.statusBadge || "Public view"} · Read-only</div>
          <h1>{dashboard?.title || "Regional health resources"}</h1>
          <p>{dashboard?.description || "Publicly reported facility capacity in the Metro Care district network."}</p>
        </div>
        <span className="demo-chip large">Public view</span>
      </div>
      <div className="metric-grid">
        {kpis.map((kpi, idx) => (
          <MetricCard
            key={kpi.label || idx}
            label={kpi.label}
            value={kpi.value}
            change={kpi.change}
            direction={kpi.direction}
            icon={getKpiIcon(kpi.label)}
            tone={kpi.tone}
          />
        ))}
      </div>
      <section className="overview-innovation-strip">
        <div className="overview-innovation-heading">
          <div><div className="eyebrow">Public tools</div><strong>What you can do</strong></div>
        </div>
        <div className="overview-innovation-cards">
          {(dashboard?.allowedActions || [
            { id: "find", label: "Find resources", description: "Locate nearby facilities", targetTab: "resources" },
            { id: "verify", label: "Verify medicine", description: "Check a pack identifier", targetTab: "verify" },
            { id: "portal", label: "Patient & staff portal", description: "Book appointment or request care", targetTab: "portal" },
          ]).map(action => (
            <button key={action.id} onClick={() => handleActionClick(action.targetTab)}>
              <ArrowRight size={16} />
              <span><strong>{action.label}</strong><small>{action.description}</small></span>
            </button>
          ))}
        </div>
      </section>
      <div className="overview-grid">
        <section className="panel attention-panel">
          <div className="panel-heading">
            <div><div className="eyebrow">Reporting facilities</div><h2>Participating hospitals & pharmacies</h2></div>
            <button className="text-button" onClick={() => setPage("resources")}>View directory <ArrowRight size={14} /></button>
          </div>
          <div className="audit-list">
            {snapshot.resources.slice(0, 4).map(res => (
              <div className="audit-item" key={res.id}>
                <span className="audit-marker teal" />
                <div>
                  <strong>{res.name}</strong>
                  <p>{res.district} · {res.kind} · {res.address}</p>
                  <small>{res.freshness} · {timeAgo(res.updatedAt)}</small>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="panel freshness-panel"><div className="panel-heading"><div><div className="eyebrow">Data confidence</div><h2>District freshness</h2></div><span className="freshness-score">78%</span></div><div className="freshness-bars"><div><span>Central District</span><b><i style={{ width: "92%" }} /></b><strong>92</strong></div><div><span>East Ward</span><b><i style={{ width: "68%" }} /></b><strong>68</strong></div><div><span>West Ward</span><b><i style={{ width: "44%" }} /></b><strong>44</strong></div></div><p className="panel-footnote"><span className="signal-dot teal" /> Freshness weights every match; it never turns a report into a guarantee.</p></section>
      </div>
    </div>;
  }

  // ── Pharmacist: medicine-focused view ────────────────────────────────────
  if (role === "pharmacist") {
    const suspiciousMeds = snapshot.medicines.filter((m: any) => m.outcome === "Suspicious" || m.outcome === "Expired");
    return <div className="page-content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">{today} · {dashboard?.summary.statusBadge || "Active QA"}</div>
          <h1>{dashboard?.title || "Pharmacy operations brief"}</h1>
          <p>{dashboard?.description || "Medicine verification queue and batch integrity summary."}</p>
        </div>
        <button className="button button-secondary small" onClick={() => setPage("verify")}><ScanLine size={14} /> Open verify scanner</button>
      </div>
      <div className="metric-grid">
        {kpis.map((kpi, idx) => (
          <MetricCard
            key={kpi.label || idx}
            label={kpi.label}
            value={kpi.value}
            change={kpi.change}
            direction={kpi.direction}
            icon={getKpiIcon(kpi.label)}
            tone={kpi.tone}
          />
        ))}
      </div>
      <section className="overview-innovation-strip">
        <div className="overview-innovation-heading">
          <div><div className="eyebrow">Pharmacy Actions</div><strong>{dashboard?.summary.heading || "Quality Assurance"}</strong></div>
        </div>
        <div className="overview-innovation-cards">
          {(dashboard?.allowedActions || [
            { id: "verify", label: "Verify medicine pack", description: "Scan batch identifier", targetTab: "verify" },
            { id: "inventory", label: "View inventory", description: "Inspect stock levels", targetTab: "inventory" },
            { id: "passport", label: "Trust passport", description: "Audit medicine chain", targetTab: "innovations" },
          ]).map(action => (
            <button key={action.id} onClick={() => handleActionClick(action.targetTab)}>
              <ArrowRight size={16} />
              <span><strong>{action.label}</strong><small>{action.description}</small></span>
            </button>
          ))}
        </div>
      </section>
      <div className="overview-grid">
        <section className="panel attention-panel">
          <div className="panel-heading">
            <div><div className="eyebrow">Medicine integrity</div><h2>Packs needing review</h2></div>
            <button className="text-button" onClick={() => setPage("verify")}>Open scanner <ArrowRight size={14} /></button>
          </div>
          {suspiciousMeds.length > 0 ? suspiciousMeds.map((m: any) => (
            <div className="portal-list-item" key={m.id}>
              <div className="portal-list-icon"><ShieldAlert size={16} /></div>
              <div>
                <strong>{m.identifier} — {m.product}</strong>
                <span>{m.manufacturer} · batch {m.batch}</span>
                <small className={`status-pill ${m.outcome === "Suspicious" ? "critical" : "expired"}`}>{m.outcome}</small>
              </div>
            </div>
          )) : <EmptyState icon={CheckCircle2} title="All packs verified" copy="No suspicious or expired packs flagged." />}
        </section>
        <section className="panel request-panel">
          <div className="panel-heading"><div><div className="eyebrow">Inventory</div><h2>Quick actions</h2></div></div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "1rem 0" }}>
            <button className="button button-primary full-width" onClick={() => setPage("verify")}><ScanLine size={15} /> Verify a medicine pack <ArrowRight size={14} /></button>
            <button className="button button-secondary full-width" onClick={() => setPage("inventory")}><PackageCheck size={15} /> View inventory <ArrowRight size={14} /></button>
            <button className="button button-secondary full-width" onClick={() => setPage("innovations")}><Crosshair size={15} /> Medicine trust passport <ArrowRight size={14} /></button>
          </div>
        </section>
      </div>
      <div className="overview-grid lower"><section className="panel audit-preview"><div className="panel-heading"><div><div className="eyebrow">Pharmacy activity</div><h2>Recent verification events</h2></div><button className="text-button" onClick={() => setPage("audit")}>Full trail <ArrowRight size={14} /></button></div><div className="audit-list">{snapshot.audit.slice(0, 4).map(event => <AuditItem key={event.id} event={event} />)}</div></section></div>
    </div>;
  }

  // ── Hospital staff: bed & intake focus ───────────────────────────────────
  if (role === "hospital") {
    return <div className="page-content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">{today} · {dashboard?.summary.statusBadge || "Ward Ops"}</div>
          <h1>{dashboard?.title || "Hospital operations brief"}</h1>
          <p>{dashboard?.description || "Bed availability, active shortages, and intake readiness."}</p>
        </div>
        <button className="button button-primary small" onClick={() => setPage("exchange")}><LifeBuoy size={14} /> Report shortage</button>
      </div>
      <div className="metric-grid">
        {kpis.map((kpi, idx) => (
          <MetricCard
            key={kpi.label || idx}
            label={kpi.label}
            value={kpi.value}
            change={kpi.change}
            direction={kpi.direction}
            icon={getKpiIcon(kpi.label)}
            tone={kpi.tone}
          />
        ))}
      </div>
      <section className="overview-innovation-strip">
        <div className="overview-innovation-heading">
          <div><div className="eyebrow">Hospital actions</div><strong>{dashboard?.summary.heading || "Ward Management"}</strong></div>
        </div>
        <div className="overview-innovation-cards">
          {(dashboard?.allowedActions || [
            { id: "shortage", label: "Report shortage", description: "Request supplies from network", targetTab: "exchange" },
            { id: "confirm", label: "Confirm receipt", description: "Acknowledge received delivery", targetTab: "exchange" },
            { id: "icu", label: "Check ICU digital twin", description: "Forecast capacity pressure", targetTab: "innovations" },
          ]).map(action => (
            <button key={action.id} onClick={() => handleActionClick(action.targetTab)}>
              <ArrowRight size={16} />
              <span><strong>{action.label}</strong><small>{action.description}</small></span>
            </button>
          ))}
        </div>
      </section>
      <div className="overview-grid">
        <section className="panel attention-panel"><div className="panel-heading"><div><div className="eyebrow">Priority alerts</div><h2>Action required</h2></div><button className="text-button" onClick={() => setPage("alerts")}>View all <ArrowRight size={14} /></button></div>{criticalAlerts.map(alert => <AlertRow alert={alert} key={alert.id} compact />)}{criticalAlerts.length === 0 && <EmptyState icon={CheckCircle2} title="Nothing urgent" copy="All current alerts are acknowledged." />}</section>
        <section className="panel request-panel"><div className="panel-heading"><div><div className="eyebrow">Emergency exchange</div><h2>Pending handoff</h2></div><span className="live-label"><i /> Demo live</span></div>
          {activeRequest ? <><div className="request-summary"><div className="request-badge"><LifeBuoy size={18} /></div><div><span className="status-pill critical">{activeRequest.urgency}</span><h3>{activeRequest.quantity} {activeRequest.unit}</h3><p>{activeRequest.resource} · {activeRequest.destination}</p></div></div><button className="button button-primary full-width" onClick={() => setPage("exchange")}>View exchange <ArrowRight size={16} /></button></> : <EmptyState icon={CheckCircle2} title="No pending handoffs" copy="Exchange board is clear." />}
        </section>
      </div>
      <div className="overview-grid lower"><section className="panel audit-preview"><div className="panel-heading"><div><div className="eyebrow">Activity log</div><h2>Latest audit events</h2></div><button className="text-button" onClick={() => setPage("audit")}>Full trail <ArrowRight size={14} /></button></div><div className="audit-list">{snapshot.audit.slice(0, 4).map(event => <AuditItem key={event.id} event={event} />)}</div></section><section className="panel freshness-panel"><div className="panel-heading"><div><div className="eyebrow">Data confidence</div><h2>District freshness</h2></div><span className="freshness-score">78%</span></div><div className="freshness-bars"><div><span>Central District</span><b><i style={{ width: "92%" }} /></b><strong>92</strong></div><div><span>East Ward</span><b><i style={{ width: "68%" }} /></b><strong>68</strong></div><div><span>West Ward</span><b><i style={{ width: "44%" }} /></b><strong>44</strong></div></div><p className="panel-footnote"><span className="signal-dot teal" /> Freshness weights every match; it never turns a report into a guarantee.</p></section></div>
    </div>;
  }

  // ── Coordinator / Admin: full command view ───────────────────────────────
  return <div className="page-content">
    <div className="page-heading">
      <div>
        <div className="eyebrow">{today} · {dashboard?.summary.statusBadge || "Command Mode"}</div>
        <h1>{dashboard?.title || (role === "admin" ? "Administrator operations brief" : "Coordinator operations brief")}</h1>
        <p>{dashboard?.description || (role === "admin" ? "Full network visibility — alerts, audit, transfers, and governance." : "Approve offers, oversee transfers, and keep the exchange board moving.")}</p>
      </div>
      <button className="button button-secondary small" onClick={() => toast.success("Demo data is already current")}><RefreshCcw size={14} /> Refresh data</button>
    </div>
    <div className="metric-grid">
      {kpis.map((kpi, idx) => (
        <MetricCard
          key={kpi.label || idx}
          label={kpi.label}
          value={kpi.value}
          change={kpi.change}
          direction={kpi.direction}
          icon={getKpiIcon(kpi.label)}
          tone={kpi.tone}
        />
      ))}
    </div>
    <section className="overview-innovation-strip">
      <div className="overview-innovation-heading">
        <div><div className="eyebrow">Command Actions</div><strong>{dashboard?.summary.heading || "From forecast to handoff"}</strong></div>
        <button className="text-button" onClick={() => setPage("innovations")}>Open innovation lab <ArrowRight size={14} /></button>
      </div>
      <div className="overview-innovation-cards">
        {(dashboard?.allowedActions || [
          { id: "innovations", label: "Digital twin", description: "Forecast shortages", targetTab: "innovations" },
          { id: "verify", label: "Trust passport", description: "Verify supply", targetTab: "innovations" },
          { id: "exchange", label: "Emergency matching", description: "Route referrals", targetTab: "innovations" },
          { id: "rescue", label: "Medicine rescue", description: "Move surplus", targetTab: "innovations" },
          { id: "sim", label: "Disaster swarm", description: "Simulate demand", targetTab: "innovations" },
        ]).map(action => (
          <button key={action.id} onClick={() => handleActionClick(action.targetTab)}>
            <ArrowRight size={16} />
            <span><strong>{action.label}</strong><small>{action.description}</small></span>
          </button>
        ))}
      </div>
    </section>
    <div className="overview-grid">
      <section className="panel attention-panel"><div className="panel-heading"><div><div className="eyebrow">Priority queue</div><h2>Human attention needed</h2></div><button className="text-button" onClick={() => setPage("alerts")}>View all <ArrowRight size={14} /></button></div>{criticalAlerts.map(alert => <AlertRow alert={alert} key={alert.id} compact />)}{criticalAlerts.length === 0 && <EmptyState icon={CheckCircle2} title="Nothing urgent" copy="All current alerts are acknowledged." />}</section>
      <section className="panel request-panel"><div className="panel-heading"><div><div className="eyebrow">Emergency exchange</div><h2>Next safe handoff</h2></div><span className="live-label"><i /> Demo live</span></div>{activeRequest ? <><div className="request-summary"><div className="request-badge"><LifeBuoy size={18} /></div><div><span className="status-pill critical">{activeRequest.urgency}</span><h3>{activeRequest.quantity} {activeRequest.unit}</h3><p>{activeRequest.resource} · {activeRequest.destination}</p></div></div><div className="match-callout"><div className="match-score"><strong>{activeRequest.matches[0]?.score}</strong><span>match</span></div><div><strong>{activeRequest.matches[0]?.supplier}</strong><p>{activeRequest.matches[0]?.reasons[0]} · {activeRequest.matches[0]?.freshness}</p></div><ChevronRight size={18} /></div><button className="button button-primary full-width" onClick={() => setPage("exchange")}>Review request <ArrowRight size={16} /></button></> : <EmptyState icon={CheckCircle2} title="No pending handoffs" copy="The exchange board is clear." />}</section>
    </div>
    <div className="overview-grid lower"><section className="panel audit-preview"><div className="panel-heading"><div><div className="eyebrow">Append-only activity</div><h2>Latest audit events</h2></div><button className="text-button" onClick={() => setPage("audit")}>Full trail <ArrowRight size={14} /></button></div><div className="audit-list">{snapshot.audit.slice(0, 4).map(event => <AuditItem key={event.id} event={event} />)}</div></section><section className="panel freshness-panel"><div className="panel-heading"><div><div className="eyebrow">Data confidence</div><h2>District freshness</h2></div><span className="freshness-score">78%</span></div><div className="freshness-bars"><div><span>Central District</span><b><i style={{ width: "92%" }} /></b><strong>92</strong></div><div><span>East Ward</span><b><i style={{ width: "68%" }} /></b><strong>68</strong></div><div><span>West Ward</span><b><i style={{ width: "44%" }} /></b><strong>44</strong></div></div><p className="panel-footnote"><span className="signal-dot teal" /> Freshness weights every match; it never turns a report into a guarantee.</p></section></div>
  </div>;
}

function ResourceCard({ resource, selected, onSelect }: { resource: Resource; selected: boolean; onSelect: () => void }) {
  return <button className={`resource-card ${selected ? "selected" : ""}`} onClick={onSelect}><div className="resource-card-top"><span className={`facility-icon ${resource.kind.toLowerCase()}`}>{resource.kind === "Hospital" ? <Hospital size={17} /> : <Stethoscope size={17} />}</span><span className={`freshness-tag ${statusClass(resource.freshness)}`}><i /> {resource.freshness}</span></div><div className="resource-name">{resource.name}</div><div className="resource-meta"><MapPin size={13} /> {resource.district} <span>·</span> {resource.address}</div><div className="resource-numbers">{resource.kind === "Hospital" ? <><div><strong>{resource.beds}</strong><span>open beds</span></div><div><strong>{resource.icu}</strong><span>ICU beds</span></div><div><strong>{resource.oxygen}</strong><span>oxygen</span></div></> : <><div><strong>84</strong><span>tracked items</span></div><div><strong>{resource.reliability}%</strong><span>reliability</span></div><div><strong>{resource.confirmed ? "Yes" : "No"}</strong><span>confirmed</span></div></>}</div><div className="resource-card-foot"><span>Updated {timeAgo(resource.updatedAt)}</span><ChevronRight size={15} /></div></button>;
}

function ResourcesPage({ snapshot }: { snapshot: DemoSnapshot }) {
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("All districts");
  const [kind, setKind] = useState("All types");
  const [selectedId, setSelectedId] = useState(snapshot.resources[0]?.id);
  const resourcesQuery = trpc.demo.resources.useQuery({ query, district, kind });
  const resources = resourcesQuery.data || [];
  const selected = resources.find(resource => resource.id === selectedId) || resources[0];
  return <div className="page-content"><div className="page-heading"><div><div className="eyebrow">Discovery · Reported availability</div><h1>Find resources</h1><p>Search the district network with freshness and source confidence in view.</p></div><span className="demo-chip large">Synthetic network · DEMO</span></div><section className="search-panel"><div className="search-box"><Search size={17} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search hospitals, pharmacies, or neighbourhoods" /></div><select value={district} onChange={event => setDistrict(event.target.value)}><option>All districts</option><option>Central District</option><option>East Ward</option><option>West Ward</option></select><select value={kind} onChange={event => setKind(event.target.value)}><option>All types</option><option>Hospital</option><option>Pharmacy</option></select><button className="filter-button"><Filter size={15} /> More filters</button></section><div className="results-meta"><span><strong>{resources.length}</strong> facilities reporting</span><span className="list-mode"><ListFilter size={15} /> List view <span>· Map provider not configured</span></span></div><div className="resource-layout"><div className="resource-grid">{resources.map(resource => <ResourceCard resource={resource} key={resource.id} selected={resource.id === selected?.id} onSelect={() => setSelectedId(resource.id)} />)}{resources.length === 0 && <EmptyState icon={Search} title="No facilities found" copy="Try a different district, type, or search term." />}</div>{selected && <aside className="detail-panel"><div className="detail-panel-top"><span className={`facility-icon ${selected.kind.toLowerCase()}`}>{selected.kind === "Hospital" ? <Hospital size={17} /> : <Stethoscope size={17} />}</span><span className={`freshness-tag ${statusClass(selected.freshness)}`}><i /> {selected.freshness}</span></div><h2>{selected.name}</h2><p className="detail-address"><MapPin size={14} /> {selected.address}, {selected.district}</p><div className="detail-divider" /><div className="detail-label">Reported capacity</div><div className="detail-capacity">{selected.kind === "Hospital" ? <><div><strong>{selected.beds}</strong><span>general beds</span></div><div><strong>{selected.icu}</strong><span>ICU beds</span></div><div><strong>{selected.oxygen}</strong><span>oxygen cylinders</span></div></> : <><div><strong>84</strong><span>stock lines</span></div><div><strong>{selected.reliability}%</strong><span>source reliability</span></div><div><strong>{selected.confirmed ? "Yes" : "No"}</strong><span>confirmation</span></div></>}</div><div className="detail-label">Essential supplies</div><div className="supply-line"><span>{selected.essential}</span><span className="signal-dot teal" /></div><div className="detail-label">Data provenance</div><div className="provenance"><ShieldCheck size={16} /><div><strong>Reported by facility</strong><span>Last updated {timeAgo(selected.updatedAt)} · {selected.confirmed ? "confirmed by staff" : "awaiting confirmation"}</span></div></div><button className="button button-primary full-width" onClick={() => toast.success(`Confirmation request sent to ${selected.name}`)}>Request confirmation <Send size={15} /></button><p className="detail-note">Availability is reported, not guaranteed. Revalidate with the facility before acting.</p></aside>}</div></div>;
}

function outcomeClass(outcome: Medicine["outcome"]) { return outcome === "Registry Match" ? "match" : outcome === "Suspicious" ? "critical" : outcome === "Expired" ? "expired" : "unverified"; }

function VerifyPage({ snapshot, refresh }: { snapshot: DemoSnapshot; refresh: () => void }) {
  const [identifier, setIdentifier] = useState("MR-7719-C");
  const [batch, setBatch] = useState("IG-24-009");
  const [result, setResult] = useState<Medicine | null>(snapshot.medicines.find(medicine => medicine.identifier === "MR-7719-C") || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const verifyMutation = trpc.demo.verifyMedicine.useMutation({
    onSuccess: value => {
      setResult(value);
      refresh();
      toast.success("Verification saved to audit trail");
    },
    onError: error => toast.error(error.message),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!identifier.trim()) {
      toast.error("Please enter a medicine identifier (e.g. MR-9841-A)");
      return;
    }
    verifyMutation.mutate({ identifier: identifier.trim(), batch: batch.trim() || undefined });
  };

  const simulateQrScan = () => {
    const list = snapshot.medicines;
    const randomMed = list[Math.floor(Math.random() * list.length)];
    if (randomMed) {
      setIdentifier(randomMed.identifier);
      setBatch(randomMed.batch);
      toast.info(`QR code scanned: ${randomMed.identifier}`);
      verifyMutation.mutate({ identifier: randomMed.identifier, batch: randomMed.batch });
    }
  };

  return <div className="page-content"><div className="page-heading"><div><div className="eyebrow">Pharmacy safety · Evidence review</div><h1>Verify medicine</h1><p>Registry checks are deterministic. AI observations, where available, never certify authenticity.</p></div><span className="demo-chip large">Pharmacist demo mode</span></div><div className="verify-layout"><section className="panel verify-form-panel"><div className="panel-heading"><div><h2>Check a pack</h2><p>Enter the unique identifier from the package. Batch is optional but recommended.</p></div><button type="button" className="scan-button" onClick={simulateQrScan} aria-label="Simulate QR camera scan" style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", display: "flex", gap: "8px", alignItems: "center" }}><ScanLine size={20} /><span>Scan QR<br /><small>Simulate camera</small></span></button></div><form onSubmit={submit}><label>Medicine identifier<input value={identifier} onChange={event => setIdentifier(event.target.value)} placeholder="e.g. MR-9841-A" required /></label><label>Batch number <span className="optional">optional</span><input value={batch} onChange={event => setBatch(event.target.value)} placeholder="e.g. AT-24-113" /></label><div className="quick-checks"><span>Try demo record</span>{snapshot.medicines.slice(0, 4).map(medicine => <button type="button" key={medicine.identifier} onClick={() => { setIdentifier(medicine.identifier); setBatch(medicine.batch); }}>{medicine.identifier}</button>)}</div><div className="upload-row"><input type="file" ref={fileInputRef} accept="image/*" style={{ display: "none" }} onChange={e => { const file = e.target.files?.[0]; if (file) toast.success(`Packaging photo attached: ${file.name}`); }} /><button type="button" className="upload-control" onClick={() => fileInputRef.current?.click()}><FileCheck2 size={15} /> Attach packaging photo</button><span>Optional · visual notes remain human-reviewed</span></div><button className="button button-primary full-width" type="submit" disabled={verifyMutation.isPending}>{verifyMutation.isPending ? <RefreshCcw className="spin" size={16} /> : <ShieldCheck size={16} />} {verifyMutation.isPending ? "Checking registry…" : "Run verification"}</button></form><div className="verification-limit"><AlertTriangle size={15} /><span>A registry match is evidence of consistency, not definitive proof of authenticity. A missing record does not prove counterfeiting.</span></div></section><section className={`panel result-panel ${result ? outcomeClass(result.outcome) : ""}`}><div className="result-top"><div className="eyebrow">Latest result · {result ? timeAgo(result.lastChecked) : "Awaiting scan"}</div>{result && <span className={`status-pill ${outcomeClass(result.outcome)}`}>{result.outcome}</span>}</div>{result ? <><div className="result-symbol">{result.outcome === "Registry Match" ? <CheckCircle2 size={27} /> : result.outcome === "Suspicious" ? <ShieldAlert size={27} /> : <AlertTriangle size={27} />}</div><h2>{result.outcome === "Registry Match" ? "Evidence is consistent" : result.outcome === "Suspicious" ? "Review before release" : result.outcome === "Expired" ? "Do not dispense" : "No reliable match"}</h2><p className="result-reason">{result.reason}</p><div className="evidence-table"><div><span>Identifier</span><strong>{result.identifier}</strong></div><div><span>Product</span><strong>{result.product}</strong></div><div><span>Manufacturer</span><strong>{result.manufacturer}</strong></div><div><span>Batch</span><strong>{result.batch}</strong></div><div><span>Expiry</span><strong>{result.expiry}</strong></div><div><span>Source</span><strong>{result.source}</strong></div></div><div className="next-step"><span className="eyebrow">Recommended next step</span><strong>{result.outcome === "Registry Match" ? "Retain the check as evidence and follow local dispensing protocols." : "Quarantine the pack and route it to pharmacist review."}</strong></div></> : <EmptyState icon={ScanLine} title="Ready for a medicine identifier" copy="Use a demo record or enter a pack identifier to begin." />}</section></div><section className="panel verification-history"><div className="panel-heading"><div><div className="eyebrow">Recent checks</div><h2>Verification history</h2></div><span className="source-label"><i /> Synthetic registry · DEMO</span></div><div className="history-table"><div className="history-head"><span>Identifier</span><span>Product</span><span>Outcome</span><span>Checked</span></div>{snapshot.medicines.map(medicine => <button className="history-row" key={medicine.id} onClick={() => { setIdentifier(medicine.identifier); setBatch(medicine.batch); setResult(medicine); }}><strong>{medicine.identifier}</strong><span>{medicine.product}</span><span className={`status-pill ${outcomeClass(medicine.outcome)}`}>{medicine.outcome}</span><span>{timeAgo(medicine.lastChecked)} <ChevronRight size={14} /></span></button>)}</div></section></div>;
}

function MatchCard({ match }: { match: Match }) {
  return <div className="match-card"><div className="match-card-score"><strong>{match.score}</strong><span>match</span></div><div className="match-card-content"><div className="match-card-head"><strong>{match.supplier}</strong><span>{match.distance}</span></div><div className="match-resource">{match.available} {match.unit} available · report {match.freshness}</div><div className="reason-list">{match.reasons.map(reason => <span key={reason}><Check size={13} /> {reason}</span>)}</div></div></div>;
}

function ExchangePage({ snapshot, role, refresh }: { snapshot: DemoSnapshot; role: DemoRole; refresh: () => void }) {
  const [selectedId, setSelectedId] = useState(snapshot.requests[0]?.id);
  const [showCreate, setShowCreate] = useState(false);
  const selected = snapshot.requests.find(request => request.id === selectedId) || snapshot.requests[0];
  const transitionMutation = trpc.demo.transitionRequest.useMutation({ onSuccess: () => { refresh(); toast.success("Request state updated and audit event recorded"); }, onError: error => toast.error(error.message) });
  const createMutation = trpc.demo.createRequest.useMutation({ onSuccess: request => { refresh(); setSelectedId(request.id); setShowCreate(false); toast.success(`${request.id} matched to a supplier`); }, onError: error => toast.error(error.message) });
  const [form, setForm] = useState({ requester: "Saint Elara Medical Centre", resource: "Oxygen cylinders", quantity: "30", unit: "cylinders", urgency: "Critical" as "Critical" | "High" | "Routine", note: "" });
  const actionFor = selected ? selected.status === "awaiting_approval" || selected.status === "matched" ? "approve" : selected.status === "approved" || selected.status === "partial" ? "dispatch" : selected.status === "dispatched" ? "receive" : null : null;
  const canAct = actionFor && ((actionFor === "approve" && (role === "coordinator" || role === "admin")) || (actionFor === "dispatch" && ["coordinator", "admin", "hospital"].includes(role)) || (actionFor === "receive" && ["hospital", "coordinator", "admin"].includes(role)));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.resource.trim()) { toast.error("Please specify the resource required"); return; }
    const qty = Number(form.quantity);
    if (!qty || qty <= 0) { toast.error("Please enter a valid quantity greater than 0"); return; }
    if (!form.unit.trim()) { toast.error("Please specify a unit (e.g. cylinders, packs)"); return; }
    createMutation.mutate({ ...form, quantity: qty });
  };
  return <div className="page-content"><div className="page-heading"><div><div className="eyebrow">Request → match → offer → receipt</div><h1>Emergency exchange</h1><p>Every transition is explicit, role-aware, and written to the audit trail.</p></div><button className="button button-primary" onClick={() => setShowCreate(value => !value)}>{showCreate ? <X size={16} /> : <LifeBuoy size={16} />} {showCreate ? "Close form" : "Report shortage"}</button></div>{showCreate && <section className="panel create-request-panel"><div className="panel-heading"><div><div className="eyebrow">New shortage request</div><h2>Tell the network what is needed.</h2></div><span className="demo-chip">Controlled demo</span></div><form className="request-form" onSubmit={submit}><label>Requesting organization<select value={form.requester} onChange={event => setForm({ ...form, requester: event.target.value })}><option>Saint Elara Medical Centre</option><option>Northbridge General Hospital</option></select></label><label>Resource<input value={form.resource} onChange={event => setForm({ ...form, resource: event.target.value })} required /></label><label>Quantity<input type="number" min="1" value={form.quantity} onChange={event => setForm({ ...form, quantity: event.target.value })} required /></label><label>Unit<input value={form.unit} onChange={event => setForm({ ...form, unit: event.target.value })} required /></label><label>Urgency<select value={form.urgency} onChange={event => setForm({ ...form, urgency: event.target.value as typeof form.urgency })}><option>Critical</option><option>High</option><option>Routine</option></select></label><label className="wide">Context note <span className="optional">optional</span><textarea value={form.note} onChange={event => setForm({ ...form, note: event.target.value })} placeholder="What should a supplier know?" /></label><div className="wide form-actions"><span className="form-help"><ShieldCheck size={15} /> Matching uses quantity, distance, freshness, reliability, and reserve.</span><button className="button button-primary" type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? "Finding suppliers…" : "Create and match request"} <ArrowRight size={15} /></button></div></form></section>}
    <div className="exchange-layout"><section className="panel request-list-panel"><div className="panel-heading"><div><div className="eyebrow">Network queue</div><h2>{snapshot.requests.length} requests</h2></div><span className="source-label"><i /> Shared demo state</span></div><div className="request-list">{snapshot.requests.map(request => <button key={request.id} className={`request-list-item ${request.id === selected?.id ? "selected" : ""}`} onClick={() => setSelectedId(request.id)}><div className={`request-list-icon ${statusClass(request.status)}`}><LifeBuoy size={16} /></div><div className="request-list-copy"><div><strong>{request.id}</strong><span className={`status-pill ${request.urgency.toLowerCase()}`}>{request.urgency}</span></div><h3>{request.quantity} {request.unit} · {request.resource}</h3><p>{request.requester}</p></div><div className="request-list-side"><span className={`status-text ${statusClass(request.status)}`}>{request.status.replace("_", " ")}</span><small>{timeAgo(request.createdAt)}</small></div></button>)}</div></section>{selected && <section className="panel exchange-detail"><div className="detail-header-row"><div><div className="eyebrow">{selected.id} · {timeAgo(selected.createdAt)}</div><h2>{selected.quantity} {selected.unit} of {selected.resource}</h2><p>{selected.requester} <ArrowRight size={14} /> {selected.destination}</p></div><span className={`status-pill ${statusClass(selected.status)}`}>{selected.status.replace("_", " ")}</span></div><div className="decision-strip"><div><span className="eyebrow">Current role</span><strong>{roleOptions.find(option => option.value === role)?.label}</strong></div><div><span className="eyebrow">Next safe action</span><strong>{actionFor ? actionFor === "approve" ? "Review supplier offer" : actionFor === "dispatch" ? "Record dispatch" : "Confirm receipt" : "No action pending"}</strong></div>{canAct && actionFor && <button className="button button-primary" onClick={() => transitionMutation.mutate({ requestId: selected.id, action: actionFor, role })} disabled={transitionMutation.isPending}>{actionFor === "approve" ? "Approve offer" : actionFor === "dispatch" ? "Record dispatch" : "Confirm receipt"} <ArrowRight size={15} /></button>}{!canAct && actionFor && <span className="role-lock"><ShieldAlert size={15} /> {actionFor === "approve" ? "Coordinator or Admin role required" : "Authorized hospital staff role required"}</span>}</div><div className="section-label"><span>Why this supplier?</span><small>Deterministic match evidence</small></div><div className="match-stack">{selected.matches.map(match => <MatchCard match={match} key={match.supplier} />)}</div><div className="section-label timeline-label"><span>Event timeline</span><small>Append-only audit trail</small></div><div className="event-timeline">{selected.timeline.map(event => <div className={`timeline-event ${event.tone}`} key={event.id}><span className="timeline-marker">{event.tone === "done" ? <Check size={12} /> : event.tone === "danger" ? <X size={12} /> : <span />}</span><div><strong>{event.label}</strong><p>{event.detail}</p></div><time>{event.at ? timeAgo(event.at) : "Pending"}</time></div>)}</div><div className="request-note"><ClipboardList size={15} /><span>{selected.note}</span></div></section>}</div></div>;
}

function InventoryPage({ snapshot }: { snapshot: DemoSnapshot }) {
  const [category, setCategory] = useState("All inventory");
  const inventory = snapshot.inventory.filter(item => category === "All inventory" || item.category === category);
  return <div className="page-content"><div className="page-heading"><div><div className="eyebrow">Inventory · Threshold intelligence</div><h1>Inventory health</h1><p>Reported counts across participating facilities, with low-stock and freshness context.</p></div><button className="button button-secondary small" onClick={() => toast.success("Inventory report requested") }><Send size={14} /> Request fresh report</button></div><div className="tab-row">{["All inventory", "Oxygen", "Beds", "Medicine", "Supplies"].map(item => <button className={category === item ? "active" : ""} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div><section className="panel inventory-panel"><div className="panel-heading"><div><div className="eyebrow">{inventory.length} reported lines</div><h2>Facility inventory</h2></div><span className="source-label"><i /> Reported data · DEMO</span></div><div className="inventory-table"><div className="inventory-head"><span>Item</span><span>Organization</span><span>Quantity</span><span>Threshold</span><span>Status</span><span>Updated</span></div>{inventory.map(item => <div className="inventory-row" key={item.id}><div className="item-cell"><span className={`inventory-icon ${item.category.toLowerCase()}`}><PackageCheck size={15} /></span><strong>{item.item}</strong></div><span>{item.organization}</span><strong className="quantity-cell">{item.quantity} <small>{item.unit}</small></strong><span>{item.threshold} <small>{item.unit}</small></span><span className={`status-pill ${statusClass(item.status)}`}>{item.status}</span><span>{timeAgo(item.updatedAt)} <span className={`signal-dot ${item.status === "Available" ? "teal" : "amber"}`} /></span></div>)}</div></section><div className="inventory-foot"><span><ShieldCheck size={15} /> Server-side rules prevent negative stock in the exchange workflow.</span><span>Quantities are synthetic and not live.</span></div></div>;
}

function AlertRow({ alert, compact = false, onAcknowledge }: { alert: Alert; compact?: boolean; onAcknowledge?: () => void }) {
  return <div className={`alert-row ${compact ? "compact" : ""}`}><div className={`alert-severity ${alert.severity.toLowerCase()}`}><AlertTriangle size={15} /></div><div className="alert-copy"><div><strong>{alert.title}</strong><span className={`status-pill ${alert.severity.toLowerCase()}`}>{alert.severity}</span></div><p>{alert.reason}</p><small>{alert.source} · {timeAgo(alert.createdAt)}</small></div>{onAcknowledge && !alert.acknowledged && <button className="icon-button" onClick={onAcknowledge} aria-label="Acknowledge alert"><Check size={15} /></button>}{alert.acknowledged && <span className="acknowledged"><Check size={13} /> Acknowledged</span>}</div>;
}

function AlertsPage({ snapshot, refresh }: { snapshot: DemoSnapshot; refresh: () => void }) {
  const ackMutation = trpc.demo.acknowledgeAlert.useMutation({ onSuccess: () => { refresh(); toast.success("Alert acknowledged"); }, onError: error => toast.error(error.message) });
  return <div className="page-content"><div className="page-heading"><div><div className="eyebrow">Signals · Action required</div><h1>Alerts</h1><p>Each alert explains why it exists and what action is recommended next.</p></div><span className="alert-count"><span>{snapshot.metrics.openAlerts}</span> open</span></div><section className="panel alerts-panel"><div className="panel-heading"><div><div className="eyebrow">Alert queue</div><h2>{snapshot.alerts.length} operational signals</h2></div><button className="filter-button"><Filter size={15} /> Filter <ChevronRight size={14} /></button></div><div className="alert-list">{snapshot.alerts.map(alert => <div className="alert-detail" key={alert.id}><AlertRow alert={alert} onAcknowledge={() => ackMutation.mutate({ id: alert.id })} /><div className="alert-recommendation"><span>Recommended action</span><strong>{alert.recommendation}</strong></div></div>)}</div></section></div>;
}

function AuditItem({ event }: { event: { id: string; action: string; actor: string; detail: string; at: string; tone: string } }) {
  return <div className="audit-item"><span className={`audit-marker ${event.tone}`} /><div><strong>{event.action}</strong><p>{event.detail}</p><small>{event.actor} · {timeAgo(event.at)}</small></div></div>;
}

function AuditPage({ snapshot }: { snapshot: DemoSnapshot }) {
  return <div className="page-content"><div className="page-heading"><div><div className="eyebrow">Accountability · Append-only</div><h1>Audit trail</h1><p>A readable record of the decisions that changed shared demo state.</p></div><button className="button button-secondary small" onClick={() => toast.success("Audit export queued in demo mode") }><ClipboardList size={14} /> Export trail</button></div><section className="panel audit-panel"><div className="audit-hero"><div className="audit-hero-icon"><ClipboardList size={21} /></div><div><strong>Evidence that travels with the handoff.</strong><p>Important medicine checks, inventory changes, and transfer transitions are recorded with an actor, timestamp, and source.</p></div><span className="source-label"><i /> Demo ledger</span></div><div className="big-audit-list">{snapshot.audit.map(event => <div className="big-audit-item" key={event.id}><span className={`big-audit-marker ${event.tone}`} /> <div><div className="big-audit-title"><strong>{event.action}</strong><time>{timeAgo(event.at)}</time></div><p>{event.detail}</p><small>{event.actor}</small></div></div>)}</div></section></div>;
}

export default function Operations() {
  const [location, setLocation] = useLocation();
  const { currentUser, isAuthenticated, logout } = useAuthUser();
  const [role, setRole] = useState<DemoRole>("coordinator");
  const [mobileNav, setMobileNav] = useState(false);

  // Sync active demo user role to dashboard view
  useEffect(() => {
    if (currentUser) {
      if (currentUser.userType === "patient") {
        setRole("public");
      } else if (currentUser.userType === "staff") {
        const staffRole = currentUser.role as DemoRole;
        if (roleOptions.some(r => r.value === staffRole)) {
          setRole(staffRole);
        } else {
          setRole("hospital");
        }
      }
    }
  }, [currentUser]);

  const snapshotQuery = trpc.demo.snapshot.useQuery(undefined, { refetchInterval: 30000, enabled: isAuthenticated });
  const resetMutation = trpc.demo.reset.useMutation({ onSuccess: () => { snapshotQuery.refetch(); toast.success("Demo data reset to the baseline scenario"); }, onError: error => toast.error(error.message) });
  const snapshot = snapshotQuery.data;
  const page = pageFromPath(location);
  const setPage = (next: Page) => { setLocation(next === "overview" ? "/app" : `/app/${next}`); setMobileNav(false); };
  const currentRole = roleOptions.find(option => option.value === role) || roleOptions[0];
  const activeAlerts = snapshot?.alerts.filter(alert => !alert.acknowledged).length || 0;

  const body = useMemo(() => {
    if (!snapshot) return <div className="loading-state"><RefreshCcw className="spin" size={20} /> Loading synthetic network…</div>;
    // Public users can only see overview, resources, verify, innovations
    const restrictedPages: Page[] = ["exchange", "inventory", "alerts", "audit"];
    if (role === "public" && restrictedPages.includes(page)) {
      return <div className="page-content"><div className="page-heading"><div><div className="eyebrow">Access restricted</div><h1>Not available for public users</h1><p>Switch to a staff role to access this section, or explore public resources below.</p></div></div><div className="metric-grid"><MetricCard label="Resources tracked" value={snapshot.metrics.resourcesTracked.toString().padStart(2, "00")} change="public view" direction="flat" icon={MapPin} tone="teal" /><MetricCard label="Medicine checks" value={snapshot.metrics.verifiedToday} change="today" direction="flat" icon={ScanLine} tone="navy" /></div></div>;
    }
    if (page === "innovations") return <InnovationPage role={role} />;
    if (page === "resources") return <ResourcesPage snapshot={snapshot} />;
    if (page === "verify") return <VerifyPage snapshot={snapshot} refresh={() => snapshotQuery.refetch()} />;
    if (page === "exchange") return <ExchangePage snapshot={snapshot} role={role} refresh={() => snapshotQuery.refetch()} />;
    if (page === "inventory") return <InventoryPage snapshot={snapshot} />;
    if (page === "alerts") return <AlertsPage snapshot={snapshot} refresh={() => snapshotQuery.refetch()} />;
    if (page === "audit") return <AuditPage snapshot={snapshot} />;
    return <OverviewPage snapshot={snapshot} setPage={setPage} role={role} currentUser={currentUser} />;
  }, [page, role, snapshot, snapshotQuery, currentUser]);

  // Mandatory portal login before dashboard access
  if (!isAuthenticated) {
    return <PortalLoginGate redirectTo={location} defaultType="staff" />;
  }

  return (
    <div className="app-shell">
      <aside className={`app-sidebar ${mobileNav ? "open" : ""}`}>
        <div className="sidebar-top">
          <Link href="/" className="brand-lockup" onClick={() => setMobileNav(false)}>
            <span className="brand-mark"><span /></span>
            <span><strong>MedRisq</strong> <em>AI</em></span>
          </Link>
          <button className="mobile-close" onClick={() => setMobileNav(false)}><X size={18} /></button>
        </div>
        <div className="workspace-switch">
          <div className="workspace-avatar">MC</div>
          <div>
            <strong>Metro Care Network</strong>
            <span>District workspace</span>
          </div>
          <ChevronRight size={15} />
        </div>
        <nav className="app-nav" aria-label="Application navigation">
          <span className="nav-section-label" style={{ color: "var(--teal-dark)", fontWeight: "800", letterSpacing: "0.08em" }}>
            Hackathon Innovations
          </span>
          <Link href="/app/rx-safety" style={{ display: "flex", alignItems: "center", gap: "9px", padding: "8px 10px", borderRadius: "7px", fontSize: "12px", fontWeight: "700", color: "var(--ink)", textDecoration: "none", marginBottom: "4px", background: "rgba(12,139,131,0.08)", border: "1px solid rgba(12,139,131,0.2)" }}>
            <Pill size={16} style={{ color: "var(--teal)" }} />
            <span>HT-01 Rx Error Safety</span>
            <span style={{ marginLeft: "auto", fontSize: "10px", padding: "2px 5px", background: "var(--teal)", color: "white", borderRadius: "4px", fontWeight: "800" }}>AI</span>
          </Link>
          <Link href="/app/report-simplifier" style={{ display: "flex", alignItems: "center", gap: "9px", padding: "8px 10px", borderRadius: "7px", fontSize: "12px", fontWeight: "700", color: "var(--ink)", textDecoration: "none", marginBottom: "4px", background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)" }}>
            <FileText size={16} style={{ color: "#0284c7" }} />
            <span>HT-02 Report Simplifier</span>
            <span style={{ marginLeft: "auto", fontSize: "10px", padding: "2px 5px", background: "#0284c7", color: "white", borderRadius: "4px", fontWeight: "800" }}>AI</span>
          </Link>
          <Link href="/app/offline-sync" style={{ display: "flex", alignItems: "center", gap: "9px", padding: "8px 10px", borderRadius: "7px", fontSize: "12px", fontWeight: "700", color: "var(--ink)", textDecoration: "none", marginBottom: "12px", background: "rgba(191,123,41,0.08)", border: "1px solid rgba(191,123,41,0.2)" }}>
            <WifiOff size={16} style={{ color: "var(--amber)" }} />
            <span>HT-03 Offline Healthcare</span>
            <span style={{ marginLeft: "auto", fontSize: "10px", padding: "2px 5px", background: "var(--amber)", color: "white", borderRadius: "4px", fontWeight: "800" }}>SYNC</span>
          </Link>

          <span className="nav-section-label">Operations Console</span>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={page === item.id ? "active" : ""} onClick={() => setPage(item.id)}>
                <Icon size={17} />
                <span>{item.label}</span>
                {item.id === "alerts" && activeAlerts > 0 && <b>{activeAlerts}</b>}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="privacy-note">
            <ShieldCheck size={16} />
            <span>
              <strong>{currentUser?.name || "Demo-safe workspace"}</strong>
              <small>{currentUser?.hospitalName || "Synthetic records only"}</small>
            </span>
          </div>
          <button className="reset-button" onClick={() => resetMutation.mutate()} disabled={resetMutation.isPending}>
            <RotateCcw size={14} /> Reset demo data
          </button>
          <button className="reset-button" onClick={() => { logout(); toast.info("Signed out"); }} style={{ marginTop: "4px" }}>
            <LogOut size={14} /> Switch account
          </button>
          <Link href="/" className="back-link"><ArrowRight size={14} /> Back to overview</Link>
        </div>
      </aside>

      <main className="app-main">
        <header className="app-header">
          <button className="mobile-menu" onClick={() => setMobileNav(true)}><Menu size={20} /></button>
          <div className="header-context">
            <span className="header-kicker">Operations console</span>
            <span className="header-separator">/</span>
            <span>{navItems.find(item => item.id === page)?.label}</span>
          </div>
          <div className="header-actions">
            <span className="sync-status"><i /> Demo data synced</span>
            {currentUser && (
              <div className="active-session-chip">
                <span className="active-session-avatar">
                  {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : "U"}
                </span>
                <div>
                  <strong>{currentUser.name}</strong>
                  <small> · {currentUser.userType === "patient" ? "Patient" : currentUser.role}</small>
                </div>
              </div>
            )}
            <button className="header-icon-button" aria-label="Notifications" onClick={() => role !== "public" ? setPage("alerts") : toast.info("Alerts are available to staff roles")}>
              <Bell size={17} />{activeAlerts > 0 && <i />}
            </button>
            <div className="role-picker">
              <UserRound size={15} />
              <select value={role} onChange={event => setRole(event.target.value as DemoRole)} aria-label="Demo role">
                <option value="hospital">Hospital staff</option>
                <option value="pharmacist">Pharmacist</option>
                <option value="coordinator">Coordinator</option>
                <option value="admin">Administrator</option>
                <option value="public">Public user</option>
              </select>
            </div>
          </div>
        </header>
        <div className={`role-banner role-banner-${currentRole.bannerTone || "teal"}`}>
          <span><span className="role-pulse" /> Controlled demo mode</span>
          <span>Signed in as <strong>{currentRole.label}</strong> · {currentRole.description}</span>
          <span className="role-banner-note">No real patient data · No live availability</span>
        </div>
        {body}
      </main>
    </div>
  );
}
