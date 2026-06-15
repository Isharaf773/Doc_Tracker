import { pages } from "../theme";
import { BtnOutline } from "./ui";

const TEAL = "#5A4728";
const TEAL_TEXT = "#3F2F23";
const TEAL_LIGHT = "#E8D7B0";

export function Sidebar({ activePage, onSelect, authUser, onSignOut }) {
  return (
    <aside style={{ width: 224, minWidth: 224, background: "linear-gradient(180deg, #f4e6d4 0%, #d8b78c 100%)", borderRight: "0.5px solid rgba(80, 60, 40, 0.15)", display: "flex", flexDirection: "column", boxShadow: "2px 0 20px rgba(82, 57, 30, 0.12)" }}>
      <div style={{ padding: "16px 14px 13px", borderBottom: "0.5px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 33, height: 33, borderRadius: 9, background: TEAL, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <i className="ti ti-file-search" style={{ color: "white", fontSize: 16 }} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#1a1a1a" }}>GeoMine Bureau</div>
          <div style={{ fontSize: 10, color: "#aaa" }}>Admin portal</div>
        </div>
      </div>

      <nav style={{ padding: "8px 7px", flex: 1, overflowY: "auto" }}>
        <div style={{ fontSize: 10, fontWeight: 500, color: "#bbb", padding: "8px 7px 3px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Main</div>
        {pages.filter(p => p.section === "main").map(p => (
          <NavItem key={p.id} page={p} active={activePage === p.id} onClick={() => onSelect(p.id)} />
        ))}
        <div style={{ fontSize: 10, fontWeight: 500, color: "#bbb", padding: "10px 7px 3px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Management</div>
        {pages.filter(p => p.section === "mgmt").map(p => (
          <NavItem key={p.id} page={p} active={activePage === p.id} onClick={() => onSelect(p.id)} />
        ))}
      </nav>

      <div style={{ padding: "11px 13px", borderTop: "0.5px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", gap: 9 }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#9FE1CB", color: TEAL_TEXT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
          {authUser.name.split(" ").map(w => w[0]).slice(0,2).join("")}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a" }}>{authUser.name}</div>
          <div style={{ fontSize: 10, color: "#888" }}>{authUser.email}</div>
        </div>
        <BtnOutline onClick={onSignOut} style={{ padding: "7px 10px", fontSize: 11 }}>Sign out</BtnOutline>
      </div>
    </aside>
  );
}

function NavItem({ page, active, onClick }) {
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 9px", borderRadius: 8, fontSize: 13, color: active ? TEAL_TEXT : "#666", background: active ? TEAL_LIGHT : "transparent", fontWeight: active ? 500 : 400, cursor: "pointer", marginBottom: 1, transition: "background 0.1s" }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#f4f3f0"; e.currentTarget.style.color = "#1a1a1a"; }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#666"; } }}>
      <i className={`ti ${page.icon}`} style={{ fontSize: 16 }} />
      {page.label}
      {page.badge && (
        <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 500, background: page.badgeColor || TEAL, color: "white", padding: "1px 6px", borderRadius: 8 }}>{page.badge}</span>
      )}
    </div>
  );
}
