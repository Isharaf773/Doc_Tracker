import { BtnGreen, BtnOutline } from "../components/ui";
import { Panel, PanelHeader, StatusBadge } from "./PageHelpers";
import { BLUE } from "../theme";
import { Select } from "../components/ui";

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
