import { FormGroup, Input, BtnGreen } from "../components/ui";
import { Panel, PanelHeader, StatCard } from "./PageHelpers";
import { TEAL, TEAL_DARK, TEAL_LIGHT, BLUE, BLUE_LIGHT } from "../theme";

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
              {[["Total stops","5"], ["Time in system","6 days"], ["Current location","Legal dept."], ["Status","In transit"]].map(([k,v]) => (
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
