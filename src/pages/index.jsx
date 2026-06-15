import { useState } from "react";
import { TEAL, TEAL_DARK, TEAL_LIGHT, TEAL_TEXT, BLUE_LIGHT, BLUE, AMBER_LIGHT, AMBER, CORAL_LIGHT, CORAL, PURPLE_LIGHT, PURPLE, RED, RED_LIGHT, RED_DARK, DASHBOARD_BG, GRADIENT_TEAL } from "../theme";
import { BtnGreen, BtnOutline, FormGroup, Input, Select, Toggle } from "../components/ui";

const statuses = {
  active: { label: "Active", bg: TEAL_LIGHT, color: TEAL_TEXT },
  transit: { label: "In transit", bg: BLUE_LIGHT, color: BLUE },
  pending: { label: "Pending", bg: AMBER_LIGHT, color: AMBER },
  archived: { label: "Archived", bg: "#F1EFE8", color: "#5F5E5A" },
};

function StatusBadge({ status }) {
  const s = statuses[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 10, background: s.bg, color: s.color, whiteSpace: "nowrap" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
      {s.label}
    </span>
  );
}

function Panel({ children, style }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.96)", border: "none", borderRadius: 18, overflow: "hidden", boxShadow: "0 18px 35px rgba(15, 23, 42, 0.08)", ...style }}>
      {children}
    </div>
  );
}

function PanelHeader({ icon, title, action, onAction, badge }) {
  return (
    <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 8, borderBottom: "0.5px solid rgba(0,0,0,0.08)", background: "rgba(250,250,255,0.85)" }}>
      {icon && <i className={`ti ${icon}`} style={{ fontSize: 16, color: "#5D5D7A" }} />}
      <span style={{ fontSize: 14, fontWeight: 600, color: "#151B3D", flex: 1 }}>{title}</span>
      {badge && <span style={{ fontSize: 11, background: TEAL_LIGHT, color: TEAL_TEXT, padding: "3px 8px", borderRadius: 8, fontWeight: 600 }}>{badge}</span>}
      {action && <span style={{ fontSize: 12, color: TEAL, cursor: "pointer", fontWeight: 600 }} onClick={onAction}>{action}</span>}
    </div>
  );
}

function StatCard({ label, value, sub, iconClass, iconBg, iconColor, subColor, accent }) {
  return (
    <div style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9))", border: "none", borderRadius: 24, padding: "18px 20px", boxShadow: "0 18px 40px rgba(40, 84, 150, 0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: "#666" }}>{label}</span>
        <div style={{ width: 42, height: 42, borderRadius: 14, background: accent || iconBg, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 22px rgba(0,0,0,0.08)" }}>
          <i className={`ti ${iconClass}`} style={{ fontSize: 16, color: iconColor }} />
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#0F172A", marginBottom: 4, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: subColor || "#666" }}>{sub}</div>
    </div>
  );
}

function BarChart({ rows }) {
  return (
    <div style={{ padding: "12px 16px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {rows.map(r => (
          <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, color: "#666", width: 85, textAlign: "right", flexShrink: 0 }}>{r.label}</span>
            <div style={{ flex: 1, height: 14, background: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 3, background: r.color || TEAL, width: `${r.pct}%`, transition: "width 0.4s" }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 500, color: "#555", width: 30, textAlign: "right" }}>{r.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniQR() {
  const p = [[1,1,1,0,1,1,1],[1,0,1,0,1,0,1],[1,0,1,0,1,0,1],[0,0,0,1,0,0,0],[1,0,1,0,1,0,1],[1,0,1,0,1,0,1],[1,1,1,0,1,1,1]];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,9px)", gap: 2 }}>
      {p.flat().map((c, i) => <div key={i} style={{ width: 9, height: 9, borderRadius: 1, background: c ? TEAL : "transparent" }} />)}
    </div>
  );
}

function GeneratedQR({ value }) {
  const seed = value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const cells = Array.from({ length: 81 }, (_, index) => {
    const row = Math.floor(index / 9);
    const col = index % 9;
    const finder = (row < 3 && col < 3) || (row < 3 && col > 5) || (row > 5 && col < 3);
    return finder || ((index * 7 + seed + row * col) % 5 < 2);
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(9,8px)", gap: 2, padding: 10, background: "white", borderRadius: 8 }}>
      {cells.map((active, index) => (
        <div key={index} style={{ width: 8, height: 8, borderRadius: 1, background: active ? TEAL_DARK : "transparent" }} />
      ))}
    </div>
  );
}

function ScanLine() {
  return (
    <div style={{ position: "absolute", width: 80, height: 2, background: "#5DCAA5", left: "50%", transform: "translateX(-50%)", animation: "scanAnim 2s infinite", top: "10%" }}>
      <style>{`@keyframes scanAnim{0%{top:10%}50%{top:85%}100%{top:10%}}`}</style>
    </div>
  );
}

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
        <StatCard label="Pending scan" value="9" sub="Needs attention" subColor={RED_DARK} iconClass="ti-clock" iconBg={AMBER_LIGHT} iconColor={AMBER} />
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

export function PageDocuments({ nav }) {
  const docs = [
    { id: "DOC-2026-0341", name: "Contract Review — Phase 3", dept: "Legal", status: "transit", handler: "Nimal S.", updated: "2 hrs ago" },
    { id: "DOC-2026-0340", name: "Annual Budget Report", dept: "Finance", status: "active", handler: "Kamani P.", updated: "4 hrs ago" },
    { id: "DOC-2026-0339", name: "Supplier Agreement — NW", dept: "Procurement", status: "pending", handler: "Ruwan J.", updated: "Yesterday" },
    { id: "DOC-2026-0338", name: "Q2 Audit Summary", dept: "Compliance", status: "active", handler: "Admin", updated: "Yesterday" },
    { id: "DOC-2026-0337", name: "HR Policy Update v4", dept: "HR", status: "transit", handler: "Dilani M.", updated: "2 days ago" },
    { id: "DOC-2026-0336", name: "ISO Certification Docs", dept: "Compliance", status: "archived", handler: "Admin", updated: "3 days ago" },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, background: "white", border: "0.5px solid rgba(0,0,0,0.12)", borderRadius: 8, padding: "6px 11px", width: 200 }}>
          <i className="ti ti-search" style={{ fontSize: 13, color: "#aaa" }} />
          <input placeholder="Search by ID or name…" style={{ border: "none", background: "transparent", fontSize: 12, color: "#1a1a1a", outline: "none", width: "100%", fontFamily: "inherit" }} />
        </div>
        <Select options={["All status", "Active", "In transit", "Pending", "Archived"]} style={{ width: 130 }} />
        <Select options={["All departments", "Finance", "Legal", "HR", "Compliance"]} style={{ width: 140 }} />
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <BtnOutline><i className="ti ti-download" style={{ fontSize: 13 }} />Export</BtnOutline>
          <BtnGreen onClick={() => nav("register")} small><i className="ti ti-plus" style={{ fontSize: 14 }} />New record</BtnGreen>
        </div>
      </div>
      <Panel>
        <PanelHeader title="All records" badge="248 total" />
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <thead>
            <tr style={{ background: "#f8f8f7" }}>
              {['Record ID','Name','Department','Status','Handler','Updated'].map((h,i) => (
                <th key={h} style={{ fontSize: 10, fontWeight: 500, color: "#888", textAlign: "left", padding: "7px 14px", borderBottom: "0.5px solid rgba(0,0,0,0.08)", textTransform: "uppercase", letterSpacing: "0.05em", width: i===0 ? 110 : i===2 ? 100 : i===3 ? 90 : i===4 ? 80 : i===5 ? 80 : undefined }}>{h}</th>
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
                <td style={{ padding: "9px 14px", fontSize: 11, color: "#777", borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>{d.handler}</td>
                <td style={{ padding: "9px 14px", fontSize: 11, color: "#aaa", borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>{d.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "0.5px solid rgba(0,0,0,0.07)" }}>
          <span style={{ fontSize: 12, color: "#888" }}>Showing 1–6 of 248</span>
          <div style={{ display: "flex", gap: 5 }}>
            {["← Prev", "1", "2", "3", "Next →"].map(l => (
              <button key={l} style={{ padding: "3px 10px", border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 6, fontSize: 11, color: "#555", background: l === "1" ? "#f0f0f0" : "white", cursor: "pointer", fontFamily: "inherit" }}>{l}</button>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
}

export function PageScanner() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 14 }}>
      <Panel>
        <PanelHeader icon="ti-camera" title="Camera scanner" badge="Live" />
        <div style={{ margin: 14, background: "rgba(0,0,0,0.32)", borderRadius: 12, padding: 28, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
          <div style={{ background: "white", borderRadius: 12, border: "0.5px solid rgba(0,0,0,0.1)", width: 310, overflow: "hidden" }}>
            <div style={{ padding: "11px 14px", borderBottom: "0.5px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", gap: 7 }}>
              <i className="ti ti-qrcode" style={{ fontSize: 15, color: TEAL }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: "#1a1a1a", flex: 1 }}>Point camera at QR sticker</span>
            </div>
            <div style={{ background: "#111", height: 160, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, position: "relative", overflow: "hidden" }}>
              <div style={{ width: 100, height: 100, border: `2px solid ${TEAL}`, borderRadius: 4, position: "relative" }}>
                {[
                  ["tl", "2px 0 0 2px"],
                  ["tr", "2px 2px 0 0"],
                  ["bl", "0 0 2px 2px"],
                  ["br", "0 2px 2px 0"],
                ].map(([k, br]) => (
                  <div key={k} style={{ position: "absolute", width: 14, height: 14, border: `2px solid #5DCAA5`, borderRadius: br, ...{ tl: { top: -2, left: -2, borderWidth: "2px 0 0 2px" }, tr: { top: -2, right: -2, borderWidth: "2px 2px 0 0" }, bl: { bottom: -2, left: -2, borderWidth: "0 0 2px 2px" }, br: { bottom: -2, right: -2, borderWidth: "0 2px 2px 0" } }[k] }} />
                ))}
                <ScanLine />
              </div>
              <span style={{ fontSize: 10, color: "#888" }}>Align QR code within frame</span>
            </div>
            <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 10, fontWeight: 500, color: TEAL_DARK, background: TEAL_LIGHT, padding: "3px 8px", borderRadius: 5, textAlign: "center" }}>Last scan successful</div>
              {[["Record ID","DOC-2026-0341",true],["Name","Contract Review Ph.3",false],["Location","Legal dept.",false],["Handler","Nimal Siriwardena",false]].map(([k,v,mono]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "#888" }}>{k}</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: mono ? BLUE : "#1a1a1a", fontFamily: mono ? "monospace" : "inherit" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: "0 14px 12px", display: "flex", gap: 8 }}>
              <button style={{ flex: 1, padding: 7, background: TEAL, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Update location</button>
              <button style={{ flex: 1, padding: 7, background: "transparent", border: "0.5px solid rgba(0,0,0,0.18)", borderRadius: 8, fontSize: 12, color: "#555", cursor: "pointer", fontFamily: "inherit" }}>Clear</button>
            </div>
          </div>
        </div>
      </Panel>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Panel>
          <PanelHeader icon="ti-keyboard" title="Manual entry" />
          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            <FormGroup label="Record ID"><Input placeholder="REC-2026-XXXX" mono /></FormGroup>
            <FormGroup label="New location"><Select options={["Legal","Finance","HR","Compliance","Procurement"]} /></FormGroup>
            <BtnGreen><i className="ti ti-check" style={{ fontSize: 14 }} />Update location</BtnGreen>
          </div>
        </Panel>
        <Panel>
          <PanelHeader icon="ti-history" title="Scan history" />
          {[ ["DOC-2026-0341","2 min · Legal"], ["DOC-2026-0338","1 hr · Compliance"], ["DOC-2026-0335","3 hrs · Finance"], ["DOC-2026-0332","Yesterday · HR"] ].map(([id, t], i) => (
            <div key={id} style={{ display: "flex", gap: 9, padding: "9px 14px", borderBottom: i < 3 ? "0.5px solid rgba(0,0,0,0.06)" : "none", alignItems: "center" }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: TEAL_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className="ti ti-scan" style={{ fontSize: 12, color: TEAL_DARK }} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#1a1a1a", fontFamily: "monospace" }}>{id}</div>
                <div style={{ fontSize: 10, color: "#aaa" }}>{t}</div>
              </div>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
}

export function PageJourney() {
  const steps = [
    { done: true, action: "Received — Legal dept.", meta: "Nimal S. · Today 10:32 AM · \"For signature\"" },
    { done: true, action: "Dispatched — Finance dept.", meta: "Kamani P. · Today 9:14 AM · \"Reviewed & approved\"" },
    { done: true, action: "Received — Finance dept.", meta: "Priya F. · Yesterday 3:45 PM · \"Budget check\"" },
    { done: true, action: "Dispatched — Procurement", meta: "Ruwan J. · Yesterday 11:20 AM" },
    { done: true, action: "QR sticker generated", meta: "Admin · 3 Jun 2026 4:55 PM · Initial registration" },
    { done: false, action: "Awaiting final approval", meta: "Pending · CEO office" },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 14 }}>
        <StatCard label="Total transitions" value="3,847" sub="↑ 24 today" subColor={TEAL_DARK} iconClass="ti-arrows-transfer-up" iconBg={TEAL_LIGHT} iconColor={TEAL_DARK} />
        <StatCard label="Avg. transit time" value="2.4h" sub="Per record" iconClass="ti-clock" iconBg={BLUE_LIGHT} iconColor={BLUE} />
        <StatCard label="Accountability" value="100%" sub="Zero misplacements" subColor={TEAL_DARK} iconClass="ti-shield-check" iconBg={TEAL_LIGHT} iconColor={TEAL_DARK} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 14 }}>
        <Panel>
          <PanelHeader icon="ti-route" title="Journey — REC-2026-0341" />
          <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column" }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 12, paddingBottom: i < steps.length - 1 ? 14 : 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.done ? TEAL : "#ddd", flexShrink: 0, marginTop: 3 }} />
                  {i < steps.length - 1 && <div style={{ flex: 1, width: 1, background: "#e8e8e8", marginTop: 3 }} />}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: s.done ? "#1a1a1a" : "#aaa" }}>{s.action}</div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{s.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <PanelHeader icon="ti-search" title="Look up journey" />
          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            <FormGroup label="Record ID"><Input value="DOC-2026-0341" mono /></FormGroup>
            <BtnGreen><i className="ti ti-route" style={{ fontSize: 14 }} />Show journey</BtnGreen>
            <div style={{ borderTop: "0.5px solid rgba(0,0,0,0.08)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 7 }}>
              {[ ["Total stops","5"], ["Time in system","6 days"], ["Current location","Legal dept."], ["Status","In transit"] ].map(([k,v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                  <span style={{ color: "#777" }}>{k}</span>
                  <span style={{ fontWeight: 500, color: k === "Current location" ? BLUE : k === "Status" ? BLUE : "#1a1a1a" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export function PageRegister() {
  const [form, setForm] = useState({
    surveyName: "",
    senderEmail: "",
    dueDate: "2026-06-30",
  });
  const [generated, setGenerated] = useState(null);

  const updateForm = key => event => {
    setForm(current => ({ ...current, [key]: event.target.value }));
  };

  const registerRecord = () => {
    const id = `REC-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const email = form.senderEmail.trim() || "sender@gmail.com";
    setGenerated({
      id,
      email,
      surveyName: form.surveyName.trim() || "New survey record",
      sentAt: new Date().toLocaleString(),
    });
  };

  const resetForm = () => {
    setForm({ surveyName: "", senderEmail: "", dueDate: "2026-06-30" });
    setGenerated(null);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 300px", gap: 14, alignItems: "start" }}>
      <Panel>
        <PanelHeader icon="ti-file-plus" title="Register new survey" />
        <div style={{ padding: "16px 18px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <FormGroup label="Survey name"><Input value={form.surveyName} onChange={updateForm("surveyName")} placeholder="e.g. Rock Core Sampling Phase 3" /></FormGroup>
            <FormGroup label="Survey type"><Select options={["Geological","Geophysical","Mineral","Hydrogeological","Environmental","Other"]} /></FormGroup>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <FormGroup label="Sender Gmail"><Input value={form.senderEmail} onChange={updateForm("senderEmail")} type="email" placeholder="sender@gmail.com" /></FormGroup>
            <FormGroup label="Due date"><Input type="date" value={form.dueDate} onChange={updateForm("dueDate")} /></FormGroup>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <FormGroup label="Region"><Select options={["North Basin","Central Uplands","Coastal Belt","Eastern Plateau","Western Range"]} /></FormGroup>
            <FormGroup label="Priority"><Select options={["Routine","High","Critical"]} /></FormGroup>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, marginBottom: 12 }}>
            <FormGroup label="Assigned to"><Select options={["Nimal Siriwardena","Kamani Perera","Ruwan Jayawardena","Dilani Mendis"]} /></FormGroup>
          </div>
          <div style={{ marginBottom: 12 }}>
            <FormGroup label="Remarks">
              <textarea placeholder="Add notes or remarks…" style={{ padding: "8px 11px", border: "0.5px solid rgba(0,0,0,0.18)", borderRadius: 8, fontSize: 12, fontFamily: "inherit", outline: "none", resize: "vertical", minHeight: 70, width: "100%", color: "#1a1a1a" }} />
            </FormGroup>
          </div>
          <div style={{ border: "1px dashed rgba(0,0,0,0.18)", borderRadius: 10, padding: 22, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", marginBottom: 14 }} onMouseEnter={e => e.currentTarget.style.background = "#f8f8f7"} onMouseLeave={e => e.currentTarget.style.background = "white"}>
            <i className="ti ti-upload" style={{ fontSize: 28, color: "#bbb" }} />
            <p style={{ fontSize: 13, color: "#888" }}>Attach digital copy (optional)</p>
            <span style={{ fontSize: 11, color: "#bbb" }}>PDF, DOCX up to 20MB</span>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 6, borderTop: "0.5px solid rgba(0,0,0,0.07)" }}>
            <BtnOutline onClick={resetForm}>Cancel</BtnOutline>
            <BtnGreen onClick={registerRecord}><i className="ti ti-qrcode" style={{ fontSize: 14 }} />Register &amp; generate QR</BtnGreen>
          </div>
        </div>
      </Panel>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Panel>
          <PanelHeader icon="ti-qrcode" title="QR preview" />
          <div style={{ padding: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ width: 112, height: 112, border: "0.5px solid rgba(0,0,0,0.1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f8f7" }}>
              {generated ? <GeneratedQR value={generated.id} /> : <i className="ti ti-qrcode" style={{ fontSize: 44, color: "#ccc" }} />}
            </div>
            <div style={{ fontSize: 12, color: generated ? TEAL_DARK : "#888", textAlign: "center", fontWeight: generated ? 600 : 400 }}>
              {generated ? "QR generated and email sent" : "Auto-generated on registration"}
            </div>
            <div style={{ fontSize: 11, fontFamily: "monospace", color: generated ? "#1a1a1a" : "#bbb" }}>{generated?.id || "REC-2026-XXXX"}</div>
            {generated && (
              <div style={{ width: "100%", marginTop: 8, borderTop: "0.5px solid rgba(0,0,0,0.08)", paddingTop: 10, display: "grid", gap: 6, fontSize: 11 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ color: "#888" }}>Sender Gmail</span>
                  <span style={{ color: BLUE, fontWeight: 600, textAlign: "right" }}>{generated.email}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ color: "#888" }}>Status</span>
                  <span style={{ color: TEAL_DARK, fontWeight: 600 }}>Sent</span>
                </div>
              </div>
            )}
          </div>
        </Panel>
        <Panel>
          <PanelHeader icon="ti-info-circle" title="How it works" />
          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              [TEAL_LIGHT, TEAL_TEXT, "Fill in record details & submit"],
              [BLUE_LIGHT, BLUE, "System generates a unique QR sticker"],
              [AMBER_LIGHT, AMBER, "Print & attach sticker to record"],
              [TEAL_LIGHT, TEAL_TEXT, "Scan at each handoff to track location"],
            ].map(([bg, color, txt], i) => (
              <div key={txt} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 500, color }}>{i + 1}</span>
                </div>
                <div style={{ fontSize: 12, color: "#666", paddingTop: 2 }}>{txt}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

export function PageUsers() {
  const users = [
    { initials: "AK", bg: "#9FE1CB", col: "#0F6E56", name: "Amal Karunaratne", dept: "IT Department", role: "admin", docs: 142, scans: 89, online: true },
    { initials: "NS", bg: "#B5D4F4", col: "#0C447C", name: "Nimal Siriwardena", dept: "Legal Department", role: "staff", docs: 87, scans: 56, online: true },
    { initials: "KP", bg: "#FAC775", col: "#633806", name: "Kamani Perera", dept: "Finance Department", role: "staff", docs: 63, scans: 41, online: false },
    { initials: "RJ", bg: "#F5C4B3", col: "#712B13", name: "Ruwan Jayawardena", dept: "Procurement", role: "staff", docs: 54, scans: 38, online: false },
    { initials: "DM", bg: "#B5D4F4", col: "#0C447C", name: "Dilani Mendis", dept: "HR Department", role: "staff", docs: 48, scans: 29, online: true },
    { initials: "PF", bg: "#9FE1CB", col: "#0F6E56", name: "Priya Fernando", dept: "Compliance", role: "admin", docs: 71, scans: 52, online: false },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, background: "white", border: "0.5px solid rgba(0,0,0,0.12)", borderRadius: 8, padding: "6px 11px", width: 180 }}>
          <i className="ti ti-search" style={{ fontSize: 13, color: "#aaa" }} />
          <input placeholder="Search users…" style={{ border: "none", background: "transparent", fontSize: 12, outline: "none", fontFamily: "inherit" }} />
        </div>
        <Select options={["All roles", "Admin", "Staff"]} style={{ width: 120 }} />
        <BtnGreen small style={{ marginLeft: "auto", background: "linear-gradient(135deg, #8A4B2A 0%, #E0B58B 100%)" }}><i className="ti ti-user-plus" style={{ fontSize: 14 }} />Add admin</BtnGreen>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {users.map(u => (
          <div key={u.name} style={{ background: "white", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: 12, padding: "13px 14px", display: "flex", gap: 11 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: u.bg, color: u.col, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, flexShrink: 0 }}>{u.initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a" }}>{u.name}</span>
                <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 6, fontWeight: 500, background: u.role === "admin" ? PURPLE_LIGHT : TEAL_LIGHT, color: u.role === "admin" ? PURPLE : TEAL_TEXT }}>{u.role === "admin" ? "Admin" : "Staff"}</span>
              </div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{u.dept}</div>
              <div style={{ display: "flex", gap: 12, marginTop: 7 }}>
                <span style={{ fontSize: 10, color: "#aaa" }}>Docs: <strong style={{ color: "#777" }}>{u.docs}</strong></span>
                <span style={{ fontSize: 10, color: "#aaa" }}>Scans: <strong style={{ color: "#777" }}>{u.scans}</strong></span>
                <span style={{ fontSize: 10, color: u.online ? TEAL_DARK : "#bbb" }}>{u.online ? "● Online" : "○ Offline"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageReports() {
  const cards = [
    { bg: TEAL_LIGHT, ic: "ti-chart-bar", col: TEAL_DARK, title: "Monthly overview", desc: "Records registered, transitioned & resolved per month" },
    { bg: BLUE_LIGHT, ic: "ti-users", col: BLUE, title: "User activity", desc: "Per-user scan count, handling freq & login logs" },
    { bg: AMBER_LIGHT, ic: "ti-clock", col: AMBER, title: "Transit time analysis", desc: "Avg. time per department & bottleneck analysis" },
    { bg: CORAL_LIGHT, ic: "ti-shield-check", col: CORAL, title: "Accountability audit", desc: "Full chain-of-custody log for compliance & audit" },
    { bg: PURPLE_LIGHT, ic: "ti-building", col: PURPLE, title: "Department load", desc: "Record volume & processing capacity per dept" },
    { bg: TEAL_LIGHT, ic: "ti-alert-triangle", col: TEAL_DARK, title: "Pending & overdue", desc: "Records past due or stuck in pending over 48 hours" },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 14 }}>
        {cards.map(c => (
          <div key={c.title} style={{ background: "white", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: 12, padding: 14 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 9 }}>
              <i className={`ti ${c.ic}`} style={{ fontSize: 17, color: c.col }} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a", marginBottom: 3 }}>{c.title}</div>
            <div style={{ fontSize: 11, color: "#888", lineHeight: 1.5 }}>{c.desc}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: TEAL, marginTop: 10, cursor: "pointer", fontWeight: 500 }}>
              <i className="ti ti-download" style={{ fontSize: 12 }} />Download PDF
            </div>
          </div>
        ))}
      </div>
      <Panel>
        <PanelHeader icon="ti-chart-bar" title="Department volume — June 2026" />
        <BarChart rows={[
          { label: "Finance", pct: 85, val: "340", color: TEAL },
          { label: "Legal", pct: 72, val: "288", color: TEAL },
          { label: "Procurement", pct: 60, val: "240", color: BLUE },
          { label: "HR", pct: 45, val: "180", color: BLUE },
          { label: "Compliance", pct: 38, val: "152", color: "#BA7517" },
          { label: "IT", pct: 18, val: "48", color: "#BA7517" },
        ]} />
      </Panel>
    </div>
  );
}

export function PageNotifications() {
  const [notifs, setNotifs] = useState([
    { unread: true, bg: RED_LIGHT, ic: "ti-alert-triangle", icCol: RED_DARK, txt: <><strong>DOC-2026-0335</strong> is overdue — stuck at Procurement past 48hr threshold</>, time: "5 minutes ago" },
    { unread: true, bg: TEAL_LIGHT, ic: "ti-scan", icCol: TEAL_DARK, txt: <><strong>DOC-2026-0341</strong> received at Legal by Nimal Siriwardena</>, time: "2 hours ago" },
    { unread: true, bg: BLUE_LIGHT, ic: "ti-user-plus", icCol: BLUE, txt: <>New user <strong>Dilani Mendis</strong> added with Staff role</>, time: "Today 9:00 AM" },
    { unread: true, bg: AMBER_LIGHT, ic: "ti-arrows-transfer-up", icCol: AMBER, txt: <><strong>DOC-2026-0339</strong> dispatched from Procurement — awaiting Finance</>, time: "Yesterday 4:30 PM" },
    { unread: true, bg: TEAL_LIGHT, ic: "ti-circle-check", icCol: TEAL_DARK, txt: <>System backup completed — 1,248 records archived</>, time: "Yesterday 2:00 AM" },
    { unread: false, bg: TEAL_LIGHT, ic: "ti-scan", icCol: TEAL_DARK, txt: <><strong>DOC-2026-0338</strong> received at Compliance by Priya Fernando</>, time: "2 days ago" },
    { unread: false, bg: BLUE_LIGHT, ic: "ti-file-plus", icCol: BLUE, txt: <>3 new records registered — DOC-2026-0339, 0340, 0341</>, time: "2 days ago" },
  ]);
  const unreadCount = notifs.filter(n => n.unread).length;

  return (
    <Panel>
      <div style={{ padding: "12px 16px", borderBottom: "0.5px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", gap: 8 }}>
        <i className="ti ti-bell" style={{ fontSize: 15, color: "#888" }} />
        <span style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a", flex: 1 }}>Notifications</span>
        {unreadCount > 0 && <span style={{ fontSize: 10, background: TEAL_LIGHT, color: TEAL_TEXT, padding: "2px 7px", borderRadius: 6, fontWeight: 500 }}>{unreadCount} unread</span>}
        <span style={{ fontSize: 12, color: TEAL, cursor: "pointer", fontWeight: 500 }} onClick={() => setNotifs(n => n.map(x => ({ ...x, unread: false })))}>Mark all read</span>
      </div>
      {notifs.map((n, i) => (
        <div key={i} onClick={() => setNotifs(prev => prev.map((x, j) => j === i ? { ...x, unread: false } : x))}
          style={{ display: "flex", gap: 10, padding: "11px 14px", borderBottom: i < notifs.length - 1 ? "0.5px solid rgba(0,0,0,0.06)" : "none", background: n.unread ? "#fafafa" : "white", cursor: "pointer", alignItems: "flex-start" }}
          onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"} onMouseLeave={e => e.currentTarget.style.background = n.unread ? "#fafafa" : "white"}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: n.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <i className={`ti ${n.ic}`} style={{ fontSize: 13, color: n.icCol }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: "#1a1a1a", lineHeight: 1.45 }}>{n.txt}</div>
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{n.time}</div>
          </div>
          {n.unread && <div style={{ width: 6, height: 6, borderRadius: "50%", background: RED, flexShrink: 0, marginTop: 5 }} />}
        </div>
      ))}
    </Panel>
  );
}

export function PageSettings() {
  const [toggles, setToggles] = useState({ email: true, overdue: true, digest: false, tfa: true });
  const toggle = k => setToggles(t => ({ ...t, [k]: !t[k] }));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 14, alignItems: "start" }}>
      <Panel>
        <PanelHeader icon="ti-settings" title="System settings" />
        <div style={{ padding: "14px 18px" }}>
          {[
            { title: "General", rows: [
              { label: "Organization name", sub: "Shown on QR stickers and reports", input: <Input value="GeoMine Bureau" /> },
              { label: "Record ID prefix", sub: "e.g. REC or REF", input: <Input value="REC" mono /> },
              { label: "Time zone", sub: "Used for all timestamps", input: <Select options={["Asia/Colombo (GMT+5:30)"]} /> },
            ]},
            { title: "Notifications", rows: [
              { label: "Email alerts", sub: "Send email on record transitions", input: <Toggle on={toggles.email} onToggle={() => toggle("email")} /> },
              { label: "Overdue warnings", sub: "Alert after 48hrs in transit", input: <Toggle on={toggles.overdue} onToggle={() => toggle("overdue")} /> },
              { label: "Daily digest", sub: "Summary email every morning", input: <Toggle on={toggles.digest} onToggle={() => toggle("digest")} /> },
            ]},
            { title: "Security", rows: [
              { label: "Two-factor auth", sub: "Require 2FA for all admins", input: <Toggle on={toggles.tfa} onToggle={() => toggle("tfa")} /> },
              { label: "Session timeout", sub: "Auto logout after inactivity", input: <Select options={["30 minutes","1 hour","4 hours"]} style={{ width: 120 }} /> },
            ]},
          ].map(section => (
            <div key={section.title} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#1a1a1a", marginBottom: 10, paddingBottom: 7, borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>{section.title}</div>
              {section.rows.map(r => (
                <div key={r.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>
                  <div><div style={{ fontSize: 13, color: "#1a1a1a" }}>{r.label}</div><div style={{ fontSize: 11, color: "#888", marginTop: 1 }}>{r.sub}</div></div>
                  <div style={{ flexShrink: 0 }}>{r.input}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ padding: "11px 18px", borderTop: "0.5px solid rgba(0,0,0,0.07)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <BtnOutline>Reset</BtnOutline>
          <BtnGreen><i className="ti ti-device-floppy" style={{ fontSize: 14 }} />Save changes</BtnGreen>
        </div>
      </Panel>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Panel>
          <PanelHeader icon="ti-user" title="My profile" />
          <div style={{ padding: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#9FE1CB", color: TEAL_DARK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 500 }}>AK</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#1a1a1a" }}>Amal Karunaratne</div>
              <div style={{ fontSize: 12, color: "#888" }}>amal@enterprise.lk</div>
            </div>
            <div style={{ width: "100%", borderTop: "0.5px solid rgba(0,0,0,0.08)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              <FormGroup label="Display name"><Input value="Amal Karunaratne" /></FormGroup>
              <FormGroup label="New password"><Input type="password" placeholder="Enter new password" /></FormGroup>
              <BtnGreen><i className="ti ti-check" style={{ fontSize: 14 }} />Update profile</BtnGreen>
            </div>
          </div>
        </Panel>
        <Panel>
          <PanelHeader icon="ti-database" title="System info" />
          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 7 }}>
            {[ ["Version","GeoMine v10"], ["Backend","PHP / Laravel"], ["Database","MySQL"], ["Total records","1,248"], ["Last backup","Today 2:00 AM"] ].map(([k,v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "#888" }}>{k}</span>
                <span style={{ fontWeight: 500, color: k === "Last backup" ? TEAL_DARK : "#1a1a1a" }}>{v}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
