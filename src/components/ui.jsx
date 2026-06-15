import { useState } from "react";

export function BtnGreen({ children, onClick, small, style, type = "button" }) {
  return (
    <button type={type} onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 6, background: "#5A4728", color: "white", border: "none", borderRadius: 8, padding: small ? "6px 12px" : "7px 14px", fontSize: small ? 12 : 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", ...style }}>
      {children}
    </button>
  );
}

export function BtnOutline({ children, onClick, style, type = "button" }) {
  return (
    <button type={type} onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 5, background: "transparent", border: "0.5px solid rgba(0,0,0,0.2)", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#555", cursor: "pointer", fontFamily: "inherit", ...style }}>
      {children}
    </button>
  );
}

export function Toggle({ on, onToggle }) {
  return (
    <div onClick={onToggle} style={{ width: 38, height: 20, borderRadius: 10, background: on ? "#5A4728" : "#e0e0e0", border: `0.5px solid ${on ? "#372A1A" : "#ccc"}`, cursor: "pointer", position: "relative", flexShrink: 0, transition: "background 0.2s" }}>
      <div style={{ position: "absolute", width: 14, height: 14, borderRadius: "50%", background: "white", top: 2, left: on ? 22 : 2, transition: "left 0.15s" }} />
    </div>
  );
}

export function Input({ placeholder, value, type, mono, style, onChange }) {
  const [v, setV] = useState(value || "");

  const handleChange = e => {
    setV(e.target.value);
    onChange?.(e);
  };

  return (
    <input value={value !== undefined ? value : v} onChange={handleChange} type={type || "text"} placeholder={placeholder}
      style={{ padding: "8px 11px", border: "0.5px solid rgba(0,0,0,0.18)", borderRadius: 8, fontSize: 12, color: "#1a1a1a", fontFamily: mono ? "monospace" : "inherit", outline: "none", background: "white", width: "100%", ...style }} />
  );
}

export function Select({ options, style, value, onChange }) {
  return (
    <select value={value} onChange={onChange} style={{ padding: "8px 11px", border: "0.5px solid rgba(0,0,0,0.18)", borderRadius: 8, fontSize: 12, color: "#1a1a1a", fontFamily: "inherit", outline: "none", background: "white", width: "100%", ...style }}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

export function FormGroup({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: "#555" }}>{label}</label>
      {children}
    </div>
  );
}
