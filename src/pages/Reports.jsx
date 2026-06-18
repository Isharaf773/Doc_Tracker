import { Panel, PanelHeader, StatCard, BarChart } from "./PageHelpers";
import { TEAL, TEAL_DARK, TEAL_LIGHT, BLUE, BLUE_LIGHT, AMBER_LIGHT, CORAL_LIGHT, PURPLE_LIGHT } from "../theme";

export function PageReports() {
  const cards = [
    { bg: TEAL_LIGHT, ic: "ti-chart-bar", col: TEAL_DARK, title: "Monthly overview", desc: "Records registered, transitioned & resolved per month" },
    { bg: BLUE_LIGHT, ic: "ti-users", col: BLUE, title: "User activity", desc: "Per-user scan count, handling freq & login logs" },
    { bg: AMBER_LIGHT, ic: "ti-clock", col: "#B77A11", title: "Transit time analysis", desc: "Avg. time per department & bottleneck analysis" },
    { bg: CORAL_LIGHT, ic: "ti-shield-check", col: "#B14035", title: "Accountability audit", desc: "Full chain-of-custody log for compliance & audit" },
    { bg: PURPLE_LIGHT, ic: "ti-building", col: "#6B3C8A", title: "Department load", desc: "Record volume & processing capacity per dept" },
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
