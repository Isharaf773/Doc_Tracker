import { useEffect, useState } from "react";
import { BtnGreen, BtnOutline } from "../components/ui";
import { StatusBadge, Panel, PanelHeader, StatCard, BarChart, PulseCard, GeneratedQR } from "./PageHelpers";
import { TEAL, TEAL_DARK, TEAL_LIGHT, BLUE, BLUE_LIGHT, AMBER, AMBER_LIGHT, CORAL, CORAL_LIGHT, RED, RED_LIGHT, DASHBOARD_BG, GRADIENT_TEAL } from "../theme";
import { fetchDashboard, fetchUsers } from "../api";

export function PageDashboard({ nav, user, pageSearch = "" }) {
  const [dashboard, setDashboard] = useState(null);
  const [management, setManagement] = useState({ board: [], senior: [] });
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState("");

  const normalize = (value) => String(value || "").trim().toLowerCase();
  const recordCodeMatches = (code, query) => {
    const normalizedCode = normalize(code);
    if (!query) return true;
    if (normalizedCode.includes(query)) return true;
    const suffixMatch = normalizedCode.match(/(\d+)$/);
    return suffixMatch ? suffixMatch[1].includes(query) : false;
  };

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        const data = await fetchDashboard();
        if (isMounted) setDashboard(data);
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    async function loadManagement() {
      try {
        const usersData = await fetchUsers();
        const board = (usersData.users || []).filter(u => u.category === "Board of Management");
        const senior = (usersData.users || []).filter(u => u.category === "Senior Management");
        if (isMounted) setManagement({ board, senior });
      } catch (error) {
        console.error(error);
      }
    }

    const handleDashboardRefresh = () => {
      loadDashboard();
    };

    loadDashboard();
    loadManagement();
    window.addEventListener("doctrack:dashboard-refresh", handleDashboardRefresh);
    return () => {
      isMounted = false;
      window.removeEventListener("doctrack:dashboard-refresh", handleDashboardRefresh);
    };
  }, []);

  const docs = dashboard?.recentRecords || [
    { id: "DOC-2026-0341", name: "Contract Review — Phase 3", dept: "Legal", status: "transit", updated: "2 hrs ago" },
    { id: "DOC-2026-0340", name: "Annual Budget Report", dept: "Finance", status: "active", updated: "4 hrs ago" },
    { id: "DOC-2026-0339", name: "Supplier Agreement NW", dept: "Procurement", status: "pending", updated: "Yesterday" },
    { id: "DOC-2026-0338", name: "Q2 Audit Summary", dept: "Compliance", status: "active", updated: "Yesterday" },
  ];
  const inTransitDocs = dashboard?.inTransitRecords || [];
  const delayedDocs = dashboard?.delayedRecords || [];

  const activeSearch = (localSearch || pageSearch).trim();
  const query = activeSearch.toLowerCase();
  const filteredDocs = docs.filter(doc => {
    if (!query) return true;
    return (
      recordCodeMatches(doc.id, query) ||
      doc.name.toLowerCase().includes(query) ||
      doc.dept.toLowerCase().includes(query) ||
      doc.status.toLowerCase().includes(query)
    );
  });

  const activity = dashboard?.activity || [
    { text: <><strong>DOC-2026-0341</strong> scanned at Legal</>, time: "2 min · Nimal S.", bg: TEAL_LIGHT, ic: "ti-scan", icCol: TEAL_DARK },
    { text: <><strong>DOC-2026-0341</strong> registered</>, time: "1 hr · Kamani P.", bg: BLUE_LIGHT, ic: "ti-file-plus", icCol: BLUE },
    { text: <><strong>DOC-2026-0339</strong> moved to Finance</>, time: "3 hrs · Ruwan J.", bg: AMBER_LIGHT, ic: "ti-arrows-transfer-up", icCol: AMBER },
    { text: <><strong>DOC-2026-0335</strong> overdue warning</>, time: "4 hrs · System", bg: RED_LIGHT, ic: "ti-alert-triangle", icCol: RED },
  ];

  const counts = dashboard?.counts || { totalRecords: 1248, inTransit: 34, delayed: 0, pendingScan: 0 };
  const delayedCount = Number(counts.delayed ?? counts.pendingScan ?? 0);
  const weekTotal = dashboard?.week?.added ?? 0;
  const todayMetrics = dashboard?.today ? [
    { label: "New today", value: `${dashboard.today.added ?? 0}`, color: "#16A34A", icon: "ti-file-plus" },
    { label: "Approved", value: `${dashboard.today.approved ?? 0}`, color: "#2563EB", icon: "ti-thumb-up" },
    { label: "Rejected", value: `${dashboard.today.rejected ?? 0}`, color: "#DC2626", icon: "ti-thumb-down" },
  ] : [
    { label: "New today", value: "0", color: "#16A34A", icon: "ti-file-plus" },
    { label: "Approved", value: "0", color: "#2563EB", icon: "ti-thumb-up" },
    { label: "Rejected", value: "0", color: "#DC2626", icon: "ti-thumb-down" },
  ];
  const stats = dashboard?.stats || [
    { label: "New today", value: `0`, color: "#22C55E" },
    { label: "Approved", value: `0`, color: "#2563EB" },
    { label: "Rejected", value: `0`, color: "#DC2626" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, background: DASHBOARD_BG, padding: 26, borderRadius: 30, minHeight: 760, boxShadow: "0 28px 60px rgba(37, 83, 155, 0.12)" }}>
      <div className="dashboard-top-grid">
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", borderRadius: 26, padding: 24, background: "linear-gradient(135deg, #1f4f3e 0%, #2f7b5c 45%, #5fd39b 100%)", color: "white", minHeight: 200, boxShadow: "0 24px 48px rgba(31, 79, 62, 0.24)" }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.84, letterSpacing: "0.16em", textTransform: "uppercase" }}>Welcome back, {user?.name || "Administrator"}</div>
            <div style={{ marginTop: 12, fontSize: 30, fontWeight: 700, lineHeight: 1.05 }}>Monitor records, approvals, and document flow in real time.</div>
            <div style={{ marginTop: 12, fontSize: 13, lineHeight: 1.7, opacity: 0.95, maxWidth: 560 }}>A modern document tracking workspace built for fast operations, audit visibility, and smoother internal workflows.</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginTop: 18 }}>
            <div style={{ borderRadius: 18, background: "rgba(255,255,255,0.18)", padding: "16px 18px" }}>
              <div style={{ fontSize: 11, opacity: 0.85 }}>Weekly added</div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 800, color: "#10B981" }}>{dashboard?.week?.added ?? 0}</div>
            </div>
            <div style={{ borderRadius: 18, background: "rgba(255,255,255,0.18)", padding: "16px 18px" }}>
              <div style={{ fontSize: 11, opacity: 0.85 }}>Weekly approved</div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 800, color: "#2563EB" }}>{dashboard?.week?.approved ?? 0}</div>
            </div>
            <div style={{ borderRadius: 18, background: "rgba(255,255,255,0.18)", padding: "16px 18px" }}>
              <div style={{ fontSize: 11, opacity: 0.85 }}>Weekly rejected</div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 800, color: "#DC2626" }}>{dashboard?.week?.rejected ?? 0}</div>
            </div>
          </div>
        </div>
          <div style={{ display: "flex", flexDirection: "column", minHeight: 320, justifyContent: "stretch" }}>
            <Panel style={{ padding: 0, minHeight: 320, display: "flex", flexDirection: "column" }} className="pulse-panel">
              <PanelHeader icon="ti-activity" title="Today's pulse" />
              <div className="panel-body">
                <div className="pulse-grid">
                  {todayMetrics.map(tm => (
                    <PulseCard key={tm.label} label={tm.label} value={tm.value} color={tm.color} icon={tm.icon} />
                  ))}
                </div>
              </div>
            </Panel>
          </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }}>
        <StatCard label="Total records" value={`${counts.totalRecords}`} sub="Updated live" subColor={TEAL_DARK} iconClass="ti-files" iconBg={TEAL_LIGHT} iconColor={TEAL_DARK} />
        <div style={{ position: "relative" }}>
          <StatCard label="In transit" value={`${counts.inTransit}`} sub="Tracked movement" iconClass="ti-truck-delivery" iconBg={BLUE_LIGHT} iconColor={BLUE} />
          <div style={{ position: "absolute", right: 12, bottom: 12 }}>
            <BtnGreen onClick={() => nav("documents", { statusGroup: "transit" })} style={{ background: "linear-gradient(90deg,#06b6d4,#3b82f6)", padding: "9px 16px", borderRadius: 12, boxShadow: "0 8px 20px rgba(59,130,246,0.16)", fontSize: 13 }}>
              <i className="ti ti-eye" style={{ fontSize: 14 }} />
              View
            </BtnGreen>
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <StatCard label="Delayed" value={`${delayedCount}`} sub="7+ days without update" subColor={RED_LIGHT} iconClass="ti-clock" iconBg={AMBER_LIGHT} iconColor={AMBER} />
          <div style={{ position: "absolute", right: 12, bottom: 12 }}>
            <BtnGreen onClick={() => nav("documents", { delayed: "true" })} style={{ background: "linear-gradient(90deg,#f59e0b,#ef4444)", padding: "9px 16px", borderRadius: 12, boxShadow: "0 8px 20px rgba(239,68,68,0.14)", fontSize: 13 }}>
              <i className="ti ti-eye" style={{ fontSize: 14 }} />
              View
            </BtnGreen>
          </div>
        </div>
      </div>

      {/** Management panels moved to Users page per request */}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 14, marginBottom: 14 }}>
        <Panel>
          <PanelHeader icon="ti-files" title="Recent records" action="View all →" onAction={() => nav("documents")} />
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 12, background: "#fff", borderRadius: 10, padding: "8px 12px", width: "100%", maxWidth: 520, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
              <i className="ti ti-search" style={{ fontSize: 13, color: "#888" }} />
              <input
                placeholder="Search documents by ID, name or dept…"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                style={{
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  color: "#111",
                  fontSize: 12,
                  outline: "none",
                  fontFamily: "inherit",
                  padding: "6px 0",
                }}
              />
            </div>
            {localSearch && (
              <button
                type="button"
                onClick={() => setLocalSearch("")}
                style={{
                  width: 28,
                  height: 28,
                  minWidth: 28,
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(0,0,0,0.08)",
                  color: "#111",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                ×
              </button>
            )}
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: "#f8f8f7" }}>
                {['Record ID', 'Name', 'Dept', 'Status', 'Updated'].map((h, i) => (
                  <th key={h} style={{ fontSize: 10, fontWeight: 500, color: "#888", textAlign: "left", padding: "7px 14px", borderBottom: "0.5px solid rgba(0,0,0,0.08)", textTransform: "uppercase", letterSpacing: "0.05em", width: i === 0 ? 110 : i === 2 ? 75 : i === 3 ? 90 : i === 4 ? 80 : undefined }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length > 0 ? filteredDocs.map(d => (
                <tr key={d.id} style={{ cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = "#f8f8f7"} onMouseLeave={e => e.currentTarget.style.background = "white" }>
                  <td style={{ padding: "9px 14px", fontSize: 11, fontFamily: "monospace", fontWeight: 500, color: BLUE, borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>{d.id}</td>
                  <td style={{ padding: "9px 14px", fontSize: 12, color: "#1a1a1a", borderBottom: "0.5px solid rgba(0,0,0,0.06)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}><i className="ti ti-file-text" style={{ fontSize: 14, color: "#aaa", flexShrink: 0 }} />{d.name}</div>
                  </td>
                  <td style={{ padding: "9px 14px", fontSize: 11, color: "#777", borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>{d.dept}</td>
                  <td style={{ padding: "9px 14px", borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}><StatusBadge status={d.status} /></td>
                  <td style={{ padding: "9px 14px", fontSize: 11, color: "#aaa", borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>{d.updated}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} style={{ padding: "28px 14px", textAlign: "center", color: "#64748B", fontSize: 13, background: "#fffaf9" }}>
                    No documents found matching <strong>{localSearch || pageSearch}</strong>.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Panel>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Panel style={{ padding: 18, background: "linear-gradient(180deg, #ffffff 0%, #f7fbff 100%)", borderRadius: 20, boxShadow: "0 18px 36px rgba(15,23,42,0.08)", minHeight: 260 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>Last scanned</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 14, alignItems: "center" }}>
              <div style={{ width: 96, height: 96, borderRadius: 18, background: "white", display: "grid", placeItems: "center", boxShadow: "0 14px 30px rgba(15,23,42,0.08)" }}>
                <GeneratedQR value="DOC-2026-0341" />
              </div>
              <div>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#64748B", marginBottom: 6 }}>Document ID</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>DOC-2026-0341</div>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <Panel>
        <PanelHeader icon="ti-chart-bar" title="Department activity this month" action="Full report →" onAction={() => nav("reports")} />
        <BarChart rows={dashboard?.departmentVolumes || [
          { label: "Finance", pct: 85, val: "85", color: TEAL },
          { label: "Legal", pct: 70, val: "70", color: TEAL },
          { label: "Procurement", pct: 58, val: "58", color: BLUE },
          { label: "HR", pct: 44, val: "44", color: BLUE },
          { label: "Compliance", pct: 36, val: "36", color: "#BA7517" },
        ]} />
      </Panel>
    </div>
  );
}
