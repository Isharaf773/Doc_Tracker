import { BtnGreen, BtnOutline, FormGroup, Input, Select } from "../components/ui";
import { StatusBadge, Panel, PanelHeader, StatCard, BarChart, MiniQR } from "./PageHelpers";
import { TEAL, TEAL_DARK, TEAL_LIGHT, TEAL_TEXT, BLUE, BLUE_LIGHT, AMBER, AMBER_LIGHT, CORAL_LIGHT, CORAL, RED, RED_LIGHT, RED_DARK, GRADIENT_TEAL, DASHBOARD_BG } from "../theme";

export function PageDashboard({ nav }) {
  const docs = [
    { id: "DOC-2026-0341", name: "Contract Review — Phase 3", dept: "Legal", status: "transit" },
    { id: "DOC-2026-0340", name: "Annual Budget Report", dept: "Finance", status: "active" },
    { id: "DOC-2026-0339", name: "Supplier Agreement NW", dept: "Procurement", status: "pending" },
    { id: "DOC-2026-0338", name: "Q2 Audit Summary", dept: "Compliance", status: "active" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, background: DASHBOARD_BG, padding: 26, borderRadius: 30, minHeight: 760, boxShadow: "0 28px 60px rgba(37, 83, 155, 0.12)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", borderRadius: 24, padding: 24, background: "linear-gradient(135deg, #60A5FA 0%, #22C55E 100%)", color: "white", minHeight: 180, boxShadow: "0 22px 45px rgba(34, 109, 212, 0.18)" }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.82, letterSpacing: "0.1em", textTransform: "uppercase" }}>Good morning, Amal</div>
            <div style={{ marginTop: 12, fontSize: 28, fontWeight: 700, lineHeight: 1.05 }}>Track every survey record with brighter clarity</div>
            <div style={{ marginTop: 12, fontSize: 13, lineHeight: 1.7, opacity: 0.92, maxWidth: 520 }}>The survey operations are healthy. 34 items are in transit, 9 items need scanning, and 248 records are actively tracked across departments.</div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
            <div style={{ flex: 1, borderRadius: 18, background: "rgba(255,255,255,0.18)", padding: "14px 16px" }}>
              <div style={{ fontSize: 11, opacity: 0.85 }}>This week</div>
              <div style={{ marginTop: 8, fontSize: 20, fontWeight: 700 }}>+12%</div>
            </div>
            <div style={{ flex: 1, borderRadius: 18, background: "rgba(255,255,255,0.18)", padding: "14px 16px" }}>
              <div style={{ fontSize: 11, opacity: 0.85 }}>On time</div>
              <div style={{ marginTop: 8, fontSize: 20, fontWeight: 700 }}>92%</div>
            </div>
          </div>
        </div>
        <Panel style={{ padding: 0 }}>
          <PanelHeader icon="ti-activity" title="Today’s pulse" />
          <div style={{ padding: 18, display: "grid", gap: 12 }}>
            {[
              { label: "Scans", value: "68", color: BLUE, bg: "rgba(56, 147, 255, 0.12)" },
              { label: "Transfers", value: "19", color: TEAL, bg: "rgba(29, 158, 117, 0.14)" },
              { label: "Alerts", value: "3", color: RED, bg: "rgba(226, 75, 74, 0.12)" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 18, background: item.bg }}>
                <div>
                  <div style={{ fontSize: 13, color: "#475569", marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: item.color }}>{item.value}</div>
                </div>
                <div style={{ width: 30, height: 30, borderRadius: 12, background: item.color, opacity: 0.12, display: "grid", placeItems: "center" }}>
                  <i className="ti ti-chevron-right" style={{ fontSize: 14, color: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
        <StatCard label="Total records" value="1,248" sub="↑ 12 this week" subColor={TEAL_DARK} iconClass="ti-files" iconBg={TEAL_LIGHT} iconColor={TEAL_DARK} />
        <StatCard label="In transit" value="34" sub="8 departments" iconClass="ti-truck-delivery" iconBg={BLUE_LIGHT} iconColor={BLUE} />
        <StatCard label="Pending scan" value="9" sub="Needs attention" subColor={RED_LIGHT} iconClass="ti-clock" iconBg={AMBER_LIGHT} iconColor={AMBER} />
        <StatCard label="Resolved today" value="57" sub="↑ 8% vs yesterday" subColor={TEAL_DARK} iconClass="ti-circle-check" iconBg={CORAL_LIGHT} iconColor={CORAL} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 14, marginBottom: 14 }}>
        <Panel>
          <PanelHeader icon="ti-files" title="Recent records" action="View all →" onAction={() => nav("documents")} />
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: "#f8f8f7" }}>
                {['Record ID', 'Name', 'Dept', 'Status', 'Updated'].map((h, i) => (
                  <th key={h} style={{ fontSize: 10, fontWeight: 500, color: "#888", textAlign: "left", padding: "7px 14px", borderBottom: "0.5px solid rgba(0,0,0,0.08)", textTransform: "uppercase", letterSpacing: "0.05em", width: i === 0 ? 110 : i === 2 ? 75 : i === 3 ? 90 : i === 4 ? 80 : undefined }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {docs.map(d => (
                <tr key={d.id} style={{ cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = "#f8f8f7"} onMouseLeave={e => e.currentTarget.style.background = "white"}>
                  <td style={{ padding: "9px 14px", fontSize: 11, fontFamily: "monospace", fontWeight: 500, color: BLUE, borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>{d.id}</td>
                  <td style={{ padding: "9px 14px", fontSize: 12, color: "#1a1a1a", borderBottom: "0.5px solid rgba(0,0,0,0.06)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}><i className="ti ti-file-text" style={{ fontSize: 14, color: "#aaa", flexShrink: 0 }} />{d.name}</div>
                  </td>
                  <td style={{ padding: "9px 14px", fontSize: 11, color: "#777", borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>{d.dept}</td>
                  <td style={{ padding: "9px 14px", borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}><StatusBadge status={d.status} /></td>
                  <td style={{ padding: "9px 14px", fontSize: 11, color: "#aaa", borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>2 hrs ago</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Panel>
            <PanelHeader icon="ti-qrcode" title="Quick scan" action="Open →" onAction={() => nav("scanner")} />
            <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ background: "#f8f8f7", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <MiniQR />
                <div style={{ fontSize: 11, fontWeight: 500, color: "#333" }}>Last scanned</div>
                <div style={{ fontSize: 10, fontFamily: "monospace", color: TEAL, background: TEAL_LIGHT, padding: "2px 9px", borderRadius: 5 }}>DOC-2026-0341</div>
              </div>
              <button onClick={() => nav("scanner")} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: GRADIENT_TEAL, border: "none", borderRadius: 12, padding: "10px", fontSize: 12, fontWeight: 600, color: "white", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 14px 25px rgba(29, 158, 117, 0.18)" }}>
                <i className="ti ti-camera" style={{ fontSize: 14, color: "white" }} />Open scanner
              </button>
            </div>
          </Panel>

          <Panel>
            <PanelHeader icon="ti-activity" title="Live activity" />
            <div>
              {[
                { bg: TEAL_LIGHT, ic: "ti-scan", icCol: TEAL_DARK, txt: <><strong>DOC-2026-0341</strong> scanned at Legal</>, time: "2 min · Nimal S." },
                { bg: BLUE_LIGHT, ic: "ti-file-plus", icCol: BLUE, txt: <><strong>DOC-2026-0341</strong> registered</>, time: "1 hr · Kamani P." },
                { bg: AMBER_LIGHT, ic: "ti-arrows-transfer-up", icCol: AMBER, txt: <><strong>DOC-2026-0339</strong> moved to Finance</>, time: "3 hrs · Ruwan J." },
                { bg: RED_LIGHT, ic: "ti-alert-triangle", icCol: RED_DARK, txt: <><strong>DOC-2026-0335</strong> overdue warning</>, time: "4 hrs · System" },
              ].map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 9, padding: "9px 14px", borderBottom: i < 3 ? "0.5px solid rgba(0,0,0,0.06)" : "none", alignItems: "flex-start" }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: a.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className={`ti ${a.ic}`} style={{ fontSize: 12, color: a.icCol }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#1a1a1a" }}>{a.txt}</div>
                    <div style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <Panel>
        <PanelHeader icon="ti-chart-bar" title="Department activity this month" action="Full report →" onAction={() => nav("reports")} />
        <BarChart rows={[
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
