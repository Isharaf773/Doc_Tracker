import { BtnGreen, Input } from "../components/ui";
import { Panel, PanelHeader } from "./PageHelpers";
import { PURPLE_LIGHT, PURPLE, TEAL_LIGHT, TEAL_TEXT, TEAL_DARK, BLUE_LIGHT, AMBER_LIGHT } from "../theme";
import { Select } from "../components/ui";

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
