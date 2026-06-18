import { useState } from "react";
import { BtnGreen, BtnOutline, FormGroup, Input, Select } from "../components/ui";
import { Panel, PanelHeader, GeneratedQR } from "./PageHelpers";
import { TEAL, TEAL_DARK, TEAL_LIGHT, BLUE, AMBER, AMBER_LIGHT, GRADIENT_TEAL } from "../theme";

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
            <BtnGreen onClick={registerRecord}><i className="ti ti-qrcode" style={{ fontSize: 14 }} />Register & generate QR</BtnGreen>
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
            ].map(([bg, color, txt]) => (
              <div key={txt} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 500, color }}>{txt.indexOf("Fill") === 0 ? "1" : txt.indexOf("System") === 0 ? "2" : txt.indexOf("Print") === 0 ? "3" : "4"}</span>
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
