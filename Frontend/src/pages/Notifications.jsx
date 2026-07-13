import { useEffect, useState } from "react";
import { Panel } from "./PageHelpers";
import { RED, RED_DARK, RED_LIGHT, TEAL, TEAL_LIGHT, TEAL_TEXT, TEAL_DARK, BLUE, BLUE_LIGHT, AMBER, AMBER_LIGHT } from "../theme";
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from "../api";

export function PageNotifications({ onUnreadChange }) {
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function loadNotifications() {
      try {
        const data = await fetchNotifications();
        if (isMounted) {
          const loaded = data.notifications.map(n => ({ ...n, bg: n.unread ? RED_LIGHT : TEAL_LIGHT, ic: n.type === 'alert' ? 'ti-alert-triangle' : n.type === 'scan' ? 'ti-scan' : n.type === 'user' ? 'ti-user-plus' : n.type === 'transfer' ? 'ti-arrows-transfer-up' : 'ti-file-plus', icCol: n.type === 'alert' ? RED_DARK : n.type === 'scan' ? TEAL_DARK : n.type === 'user' ? BLUE : AMBER }));
          setNotifs(loaded);
          onUnreadChange?.(loaded.filter(x => x.unread).length);
        }
      } catch (error) {
        console.error(error);
      }
    }
    loadNotifications();
    return () => { isMounted = false; };
  }, [onUnreadChange]);

  const unreadCount = notifs.filter(n => n.unread).length;

  return (
    <Panel>
      <div style={{ padding: "12px 16px", borderBottom: "0.5px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", gap: 8 }}>
        <i className="ti ti-bell" style={{ fontSize: 15, color: "#888" }} />
        <span style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a", flex: 1 }}>Notifications</span>
        {unreadCount > 0 && <span style={{ fontSize: 10, background: TEAL_LIGHT, color: TEAL_TEXT, padding: "2px 7px", borderRadius: 6, fontWeight: 500 }}>{unreadCount} unread</span>}
        <span style={{ fontSize: 12, color: TEAL, cursor: "pointer", fontWeight: 500 }} onClick={async () => {
          try {
            await markAllNotificationsRead();
            setNotifs(n => {
              const updated = n.map(x => ({ ...x, unread: false }));
              onUnreadChange?.(0);
              return updated;
            });
          } catch (error) {
            console.error(error);
          }
        }}>Mark all read</span>
      </div>
      {notifs.map((n, i) => (
        <div key={n.id || i} onClick={async () => {
            if (n.unread) {
              try {
                await markNotificationRead(n.id);
              } catch (error) {
                console.error(error);
              }
            }
            setNotifs(prev => {
              const updated = prev.map((x, j) => j === i ? { ...x, unread: false } : x);
              onUnreadChange?.(updated.filter(x => x.unread).length);
              return updated;
            });
          }}
          style={{ display: "flex", gap: 10, padding: "11px 14px", borderBottom: i < notifs.length - 1 ? "0.5px solid rgba(0,0,0,0.06)" : "none", background: n.unread ? "#fafafa" : "white", cursor: "pointer", alignItems: "flex-start" }}
          onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"} onMouseLeave={e => e.currentTarget.style.background = n.unread ? "#fafafa" : "white"}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: n.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <i className={`ti ${n.ic}`} style={{ fontSize: 13, color: n.icCol }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: "#1a1a1a", lineHeight: 1.45 }}>{n.message}</div>
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{n.time}</div>
          </div>
          {n.unread && <div style={{ width: 6, height: 6, borderRadius: "50%", background: RED, flexShrink: 0, marginTop: 5 }} />}
        </div>
      ))}
    </Panel>
  );
}
