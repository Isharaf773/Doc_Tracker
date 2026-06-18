import { useState } from "react";
import { Panel } from "./PageHelpers";
import { RED, RED_DARK, RED_LIGHT, TEAL, TEAL_LIGHT, TEAL_DARK, BLUE, BLUE_LIGHT, AMBER, AMBER_LIGHT } from "../theme";

export function PageNotifications() {
  const [notifs, setNotifs] = useState([
    { unread: true, bg: RED_LIGHT, ic: "ti-alert-triangle", icCol: RED_DARK, txt: <><strong>DOC-2026-0335</strong> is overdue — stuck at Procurement past 48hr threshold</>, time: "5 minutes ago" },
    { unread: true, bg: TEAL_LIGHT, ic: "ti-scan", icCol: TEAL_DARK, txt: <><strong>DOC-2026-0341</strong> received at Legal by Nimal Siriwardena</>, time: "2 hours ago" },
    { unread: true, bg: BLUE_LIGHT, ic: "ti-user-plus", icCol: BLUE, txt: <>New user <strong>Dilani Mendis</strong> added with Staff role</>, time: "Today 9:00 AM" },
    { unread: true, bg: AMBER_LIGHT, ic: "ti-arrows-transfer-up", icCol: AMBER, txt: <><strong>DOC-2026-0339</strong> dispatched from Procurement — awaiting Finance</>, time: "Yesterday 4:30 PM" },
    { unread: true, bg: TEAL_LIGHT, ic: "ti-circle-check", icCol: TEAL_DARK, txt: <>System backup completed — 1,248 records archived</>, time: "Yesterday 2:00 AM" },
    { unread: false, bg: TEAL_LIGHT, ic: "ti-scan", icCol: TEAL_DARK, txt: <><strong>DOC-2026-0338</strong> received at Compliance by Priya Fernando</>, time: "2 days ago" },
    { unread: false, bg: BLUE_LIGHT, ic: "ti-file-plus", icCol: BLUE, txt: <>3 new records registered — DOC-2026-0339, 0340, 0341</>, time: "2 days ago" },
  ]);
  const unreadCount = notifs.filter(n => n.unread).length;

  return (
    <Panel>
      <div style={{ padding: "12px 16px", borderBottom: "0.5px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", gap: 8 }}>
        <i className="ti ti-bell" style={{ fontSize: 15, color: "#888" }} />
        <span style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a", flex: 1 }}>Notifications</span>
        {unreadCount > 0 && <span style={{ fontSize: 10, background: TEAL_LIGHT, color: TEAL_TEXT, padding: "2px 7px", borderRadius: 6, fontWeight: 500 }}>{unreadCount} unread</span>}
        <span style={{ fontSize: 12, color: TEAL, cursor: "pointer", fontWeight: 500 }} onClick={() => setNotifs(n => n.map(x => ({ ...x, unread: false })))}>Mark all read</span>
      </div>
      {notifs.map((n, i) => (
        <div key={i} onClick={() => setNotifs(prev => prev.map((x, j) => j === i ? { ...x, unread: false } : x))}
          style={{ display: "flex", gap: 10, padding: "11px 14px", borderBottom: i < notifs.length - 1 ? "0.5px solid rgba(0,0,0,0.06)" : "none", background: n.unread ? "#fafafa" : "white", cursor: "pointer", alignItems: "flex-start" }}
          onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"} onMouseLeave={e => e.currentTarget.style.background = n.unread ? "#fafafa" : "white"}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: n.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <i className={`ti ${n.ic}`} style={{ fontSize: 13, color: n.icCol }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: "#1a1a1a", lineHeight: 1.45 }}>{n.txt}</div>
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{n.time}</div>
          </div>
          {n.unread && <div style={{ width: 6, height: 6, borderRadius: "50%", background: RED, flexShrink: 0, marginTop: 5 }} />}
        </div>
      ))}
    </Panel>
  );
}
