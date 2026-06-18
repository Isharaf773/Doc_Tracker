import { TEAL, TEAL_DARK, TEAL_LIGHT, TEAL_TEXT, BLUE, BLUE_LIGHT, AMBER, AMBER_LIGHT, CORAL_LIGHT, PURPLE_LIGHT, RED, RED_LIGHT, DASHBOARD_BG, GRADIENT_TEAL } from "../theme";

export const statuses = {
  active: { label: "Active", bg: TEAL_LIGHT, color: TEAL_TEXT },
  transit: { label: "In transit", bg: BLUE_LIGHT, color: BLUE },
  pending: { label: "Pending", bg: AMBER_LIGHT, color: AMBER },
  archived: { label: "Archived", bg: "#F1EFE8", color: "#5F5E5A" },
};

export function StatusBadge({ status }) {
  const s = statuses[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 10, background: s.bg, color: s.color, whiteSpace: "nowrap" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
      {s.label}
    </span>
  );
}

export function Panel({ children, style }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.96)", border: "none", borderRadius: 18, overflow: "hidden", boxShadow: "0 18px 35px rgba(15, 23, 42, 0.08)", ...style }}>
      {children}
    </div>
  );
}

export function PanelHeader({ icon, title, action, onAction, badge }) {
  return (
    <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 8, borderBottom: "0.5px solid rgba(0,0,0,0.08)", background: "rgba(250,250,255,0.85)" }}>
      {icon && <i className={`ti ${icon}`} style={{ fontSize: 16, color: "#5D5D7A" }} />}
      <span style={{ fontSize: 14, fontWeight: 600, color: "#151B3D", flex: 1 }}>{title}</span>
      {badge && <span style={{ fontSize: 11, background: TEAL_LIGHT, color: TEAL_TEXT, padding: "3px 8px", borderRadius: 8, fontWeight: 600 }}>{badge}</span>}
      {action && <span style={{ fontSize: 12, color: TEAL, cursor: "pointer", fontWeight: 600 }} onClick={onAction}>{action}</span>}
    </div>
  );
}

export function StatCard({ label, value, sub, iconClass, iconBg, iconColor, subColor, accent }) {
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

export function BarChart({ rows }) {
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

export function MiniQR() {
  const p = [[1,1,1,0,1,1,1],[1,0,1,0,1,0,1],[1,0,1,0,1,0,1],[0,0,0,1,0,0,0],[1,0,1,0,1,0,1],[1,0,1,0,1,0,1],[1,1,1,0,1,1,1]];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,9px)", gap: 2 }}>
      {p.flat().map((c, i) => <div key={i} style={{ width: 9, height: 9, borderRadius: 1, background: c ? TEAL : "transparent" }} />)}
    </div>
  );
}

export function GeneratedQR({ value }) {
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

export function ScanLine() {
  return (
    <div style={{ position: "absolute", width: 80, height: 2, background: "#5DCAA5", left: "50%", transform: "translateX(-50%)", animation: "scanAnim 2s infinite", top: "10%" }}>
      <style>{`@keyframes scanAnim{0%{top:10%}50%{top:85%}100%{top:10%}}`}</style>
    </div>
  );
}
