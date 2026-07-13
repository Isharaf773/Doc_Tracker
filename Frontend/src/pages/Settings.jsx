import { useState } from "react";
import { BtnGreen, BtnOutline, FormGroup, Input, Select, Toggle } from "../components/ui";
import { Panel, PanelHeader } from "./PageHelpers";
import { TEAL, TEAL_DARK, TEAL_LIGHT, PURPLE_LIGHT, PURPLE } from "../theme";

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
              { label: "Overdue warnings", sub: "Alert after 7 days without update", input: <Toggle on={toggles.overdue} onToggle={() => toggle("overdue")} /> },
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
        
      </div>
    </div>
  );
}
