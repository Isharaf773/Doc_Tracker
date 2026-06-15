import { useEffect, useMemo, useState } from "react";
import { LoginPage } from "./components/LoginPage";
import { Sidebar } from "./components/Sidebar";
import { PageDashboard, PageDocuments, PageScanner, PageJourney, PageRegister, PageUsers, PageReports, PageNotifications, PageSettings } from "./pages";
import { BtnGreen, BtnOutline } from "./components/ui";
import { RED, GRADIENT_RUST } from "./theme";

const DEFAULT_USER = { name: "Amal Karunaratne", email: "amal@geomine.gov.lk" };

const routes = {
  dashboard: "/dashboard",
  documents: "/records",
  scanner: "/scanner",
  journey: "/journey",
  register: "/register",
  users: "/users",
  reports: "/reports",
  notifications: "/notifications",
  settings: "/settings",
};

const pageConfig = {
  dashboard: { title: "Dashboard", bc: "GeoMine - Overview" },
  documents: { title: "Records", bc: "GeoMine - Records" },
  scanner: { title: "QR Scanner", bc: "GeoMine - Scanner" },
  journey: { title: "Journey log", bc: "GeoMine - Journey" },
  register: { title: "Register record", bc: "GeoMine - New record" },
  users: { title: "Users", bc: "GeoMine - Users" },
  reports: { title: "Reports", bc: "GeoMine - Reports" },
  notifications: { title: "Notifications", bc: "GeoMine - Alerts" },
  settings: { title: "Settings", bc: "GeoMine - Settings" },
};

const pathToPage = Object.entries(routes).reduce((acc, [page, path]) => {
  acc[path] = page;
  return acc;
}, {});

function getInitialUser() {
  try {
    const saved = localStorage.getItem("doctrack_user");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function getRoutePath() {
  if (window.location.protocol === "file:") {
    return window.location.hash.replace(/^#/, "") || "/dashboard";
  }

  return window.location.pathname;
}

function getPageFromPath() {
  return pathToPage[getRoutePath()] || "dashboard";
}

function pushRoute(page, replace = false) {
  const path = routes[page] || routes.dashboard;
  const action = replace ? "replaceState" : "pushState";
  const route = window.location.protocol === "file:" ? `#${path}` : path;
  window.history[action]({}, "", route);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function DocTrack() {
  const [authUser, setAuthUser] = useState(() => getInitialUser());
  const [activePage, setActivePage] = useState(() => getPageFromPath());
  const loggedIn = Boolean(authUser);

  const navigate = page => {
    setActivePage(page);
    pushRoute(page);
  };

  useEffect(() => {
    const syncRoute = () => setActivePage(getPageFromPath());
    window.addEventListener("popstate", syncRoute);
    window.addEventListener("hashchange", syncRoute);
    return () => {
      window.removeEventListener("popstate", syncRoute);
      window.removeEventListener("hashchange", syncRoute);
    };
  }, []);

  useEffect(() => {
    const currentPath = getRoutePath();

    if (!loggedIn && currentPath !== "/login") {
      const loginPath = window.location.protocol === "file:" ? "#/login" : "/login";
      window.history.replaceState({}, "", loginPath);
    }

    if (loggedIn && (currentPath === "/" || currentPath === "/login")) {
      pushRoute("dashboard", true);
    }
  }, [loggedIn]);

  const handleLogin = user => {
    const nextUser = user || DEFAULT_USER;
    localStorage.setItem("doctrack_user", JSON.stringify(nextUser));
    setAuthUser(nextUser);
    setActivePage("dashboard");
    pushRoute("dashboard", true);
  };

  const handleSignOut = () => {
    localStorage.removeItem("doctrack_user");
    setAuthUser(null);
    setActivePage("dashboard");
    const loginPath = window.location.protocol === "file:" ? "#/login" : "/login";
    window.history.replaceState({}, "", loginPath);
  };

  const renderedPage = useMemo(() => {
    switch (activePage) {
      case "dashboard": return <PageDashboard nav={navigate} />;
      case "documents": return <PageDocuments nav={navigate} />;
      case "scanner": return <PageScanner />;
      case "journey": return <PageJourney />;
      case "register": return <PageRegister />;
      case "users": return <PageUsers />;
      case "reports": return <PageReports />;
      case "notifications": return <PageNotifications />;
      case "settings": return <PageSettings />;
      default: return <PageDashboard nav={navigate} />;
    }
  }, [activePage]);

  if (!loggedIn) return <LoginPage onLogin={handleLogin} />;

  return (
    <div style={{ display: "flex", height: "100vh", minHeight: 700, background: "linear-gradient(180deg, #f7efe0 0%, #ead6b8 55%, #f7f0e4 100%)", fontFamily: "system-ui, -apple-system, sans-serif", overflow: "hidden" }}>
      <Sidebar activePage={activePage} onSelect={navigate} authUser={authUser} onSignOut={handleSignOut} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ background: "#fbf5ec", borderBottom: "0.5px solid rgba(80, 58, 38, 0.12)", padding: "12px 22px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: "#1a1a1a" }}>{pageConfig[activePage]?.title}</div>
            <div style={{ fontSize: 10, color: "#bbb" }}>{pageConfig[activePage]?.bc}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, background: "#f4f3f0", border: "0.5px solid rgba(0,0,0,0.1)", borderRadius: 8, padding: "6px 11px", width: 190 }}>
            <i className="ti ti-search" style={{ fontSize: 13, color: "#aaa" }} />
            <input placeholder="Search records..." style={{ border: "none", background: "transparent", fontSize: 12, color: "#1a1a1a", outline: "none", width: "100%", fontFamily: "inherit" }} />
          </div>
          <BtnOutline onClick={handleSignOut}>Sign out</BtnOutline>
          <div onClick={() => navigate("notifications")} style={{ width: 32, height: 32, border: "0.5px solid rgba(0,0,0,0.1)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
            <i className="ti ti-bell" style={{ fontSize: 15, color: "#888" }} />
            <div style={{ position: "absolute", top: 6, right: 6, width: 5, height: 5, borderRadius: "50%", background: RED }} />
          </div>
          <BtnGreen onClick={() => navigate("register")} small style={{ background: GRADIENT_RUST }}>
            <i className="ti ti-plus" style={{ fontSize: 14 }} />New record
          </BtnGreen>
        </div>
        <main style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {renderedPage}
        </main>
      </div>
    </div>
  );
}
