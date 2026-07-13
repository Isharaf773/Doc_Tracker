import { pages } from "../theme";
import { BtnOutline } from "./ui";

const TEAL = "#5A4728";
const TEAL_TEXT = "#3F2F23";
const TEAL_LIGHT = "#E8D7B0";

export function Sidebar({ activePage, onSelect, authUser, onSignOut }) {
  return (
    <aside style={{ width: 240, minWidth: 240, background: "#ffffff", borderRight: "1px solid rgba(148,163,184,0.16)", display: "flex", flexDirection: "column", boxShadow: "2px 0 24px rgba(15,23,42,0.06)" }}>
      <div style={{ padding: "22px 18px 18px", borderBottom: "1px solid rgba(148,163,184,0.15)", display: "flex", alignItems: "center", gap: 12, background: "#faf9f7" }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: TEAL, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <i className="ti ti-file-search" style={{ color: "white", fontSize: 18 }} />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#15262f" }}>GeoMine Docs</div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Admin dashboard</div>
        </div>
      </div>

      <nav style={{ padding: "16px 12px", flex: 1, overflowY: "auto" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", padding: "10px 0 8px", letterSpacing: "0.12em", textTransform: "uppercase" }}>Main</div>
        {pages.filter(p => p.section === "main").map(p => (
          <NavItem key={p.id} page={p} active={activePage === p.id} onClick={() => onSelect(p.id)} />
        ))}
        <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", padding: "16px 0 8px", letterSpacing: "0.12em", textTransform: "uppercase" }}>Management</div>
        {pages.filter(p => p.section === "mgmt").map(p => (
          <NavItem key={p.id} page={p} active={activePage === p.id} onClick={() => onSelect(p.id)} />
        ))}
      </nav>

      <div style={{ padding: "18px", borderTop: "1px solid rgba(148,163,184,0.15)", display: "flex", alignItems: "center", gap: 12, background: "#faf9f7" }}>
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#d8f1e3", color: TEAL_TEXT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
          {authUser.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#15262f" }}>{authUser.name}</div>
          <div style={{ fontSize: 10, color: "#64748b" }}>{authUser.email}</div>
        </div>
        <BtnOutline onClick={onSignOut} style={{ padding: "8px 12px", fontSize: 11 }}>Sign out</BtnOutline>
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
