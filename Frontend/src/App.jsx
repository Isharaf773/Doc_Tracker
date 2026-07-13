import { useEffect, useMemo, useState } from "react";
import { LoginPage } from "./components/LoginPage";
import { Sidebar } from "./components/Sidebar";
import { PageDashboard, PageDocuments, PageScanner, PageJourney, PageRegister, PageUsers, PageReports, PageReportDetail, PageNotifications, PageSettings, ResetPasswordPage } from "./pages";
import { BtnGreen, BtnOutline } from "./components/ui";
import { fetchNotifications } from "./api";
import { RED, GRADIENT_RUST } from "./theme";
import "./App.css";

const DEFAULT_USER = { name: "Amal Karunaratne", email: "amal@geomine.gov.lk" };

const routes = {
  dashboard: "/dashboard",
  documents: "/records",
  scanner: "/scanner",
  journey: "/journey",
  register: "/register",
  users: "/users",
  reports: "/reports",
  reportRecord: "/reports/record",
  reportActivity: "/reports/activity",
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
  reportRecord: { title: "Report record detail", bc: "GeoMine - Report detail" },
  reportActivity: { title: "Report activity detail", bc: "GeoMine - Activity detail" },
  notifications: { title: "Notifications", bc: "GeoMine - Alerts" },
  settings: { title: "Settings", bc: "GeoMine - Settings" },
};

const pathToPage = Object.entries(routes).reduce((acc, [page, path]) => {
  acc[path] = page;
  return acc;
}, {});

function getRouteInfo() {
  const rawPath = window.location.protocol === "file:" ? window.location.hash.replace(/^#/, "") : `${window.location.pathname}${window.location.search}`;
  const [pathname, query = ""] = rawPath.split("?");
  const params = Object.fromEntries(new URLSearchParams(query).entries());

  if (pathname.startsWith(routes.reportRecord + "/")) {
    const id = decodeURIComponent(pathname.slice(routes.reportRecord.length + 1));
    return { page: "reportRecord", params: { id, ...params } };
  }
  if (pathname.startsWith(routes.reportActivity + "/")) {
    const user = decodeURIComponent(pathname.slice(routes.reportActivity.length + 1));
    return { page: "reportActivity", params: { user, ...params } };
  }
  return { page: pathToPage[pathname] || "dashboard", params };
}

function getInitialUser() {
  try {
    const saved = localStorage.getItem("doctrack_user") || sessionStorage.getItem("doctrack_user");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveAuthUser(user, remember) {
  const authUser = { ...user, token: user.token || "authenticated" };
  const payload = JSON.stringify(authUser);
  if (remember) {
    localStorage.setItem("doctrack_user", payload);
    sessionStorage.removeItem("doctrack_user");
  } else {
    sessionStorage.setItem("doctrack_user", payload);
    localStorage.removeItem("doctrack_user");
  }
}

function clearAuthUser() {
  localStorage.removeItem("doctrack_user");
  sessionStorage.removeItem("doctrack_user");
}

function getRoutePath() {
  if (window.location.protocol === "file:") {
    return window.location.hash.replace(/^#/, "") || "/dashboard";
  }

  return window.location.pathname;
}

function isResetPasswordRoute(path) {
  return path.startsWith("/reset-password");
}

function getPageFromPath() {
  return getRouteInfo().page;
}

function pushRoute(page, replace = false, params = {}) {
  const routeParams = { ...params };
  let path = routes[page] || routes.dashboard;

  if (page === "reportRecord" && routeParams.id) {
    path = `${routes.reportRecord}/${encodeURIComponent(routeParams.id)}`;
    delete routeParams.id;
  }
  if (page === "reportActivity" && routeParams.user) {
    path = `${routes.reportActivity}/${encodeURIComponent(routeParams.user)}`;
    delete routeParams.user;
  }

  const queryString = new URLSearchParams(routeParams).toString();
  if (queryString) {
    path = `${path}?${queryString}`;
  }

  const action = replace ? "replaceState" : "pushState";
  const route = window.location.protocol === "file:" ? `#${path}` : path;
  window.history[action]({}, "", route);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function DocTrack() {
  const [authUser, setAuthUser] = useState(() => getInitialUser());
  const [routeInfo, setRouteInfo] = useState(() => getRouteInfo());
  const [activePage, setActivePage] = useState(() => getRouteInfo().page);
  const [notificationCount, setNotificationCount] = useState(0);
  const [globalSearch, setGlobalSearch] = useState("");
  const loggedIn = Boolean(authUser);

  const navigate = (page, params = {}) => {
    setActivePage(page);
    setRouteInfo({ page, params });
    pushRoute(page, false, params);
  };

  useEffect(() => {
    const syncRoute = () => {
      const info = getRouteInfo();
      setRouteInfo(info);
      setActivePage(info.page);
    };
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
      console.log("App: user logged in, redirecting to dashboard");
      pushRoute("dashboard", true);
    }
  }, [loggedIn]);

  useEffect(() => {
    let isMounted = true;
    let refreshTimer;

    async function updateNotificationCount() {
      if (!authUser) return;
      try {
        const data = await fetchNotifications();
        if (!isMounted) return;
        setNotificationCount((data.notifications || []).filter(n => n.unread).length);
      } catch (error) {
        console.error(error);
      }
    }

    const handleNotificationRefresh = () => {
      updateNotificationCount();
    };

    updateNotificationCount();
    window.addEventListener("doctrack:notifications-updated", handleNotificationRefresh);
    refreshTimer = setInterval(updateNotificationCount, 20000);
    return () => {
      isMounted = false;
      window.removeEventListener("doctrack:notifications-updated", handleNotificationRefresh);
      clearInterval(refreshTimer);
    };
  }, [authUser]);

  const handleLogin = (user, remember = true) => {
    const nextUser = user || DEFAULT_USER;
    console.log("App: handleLogin ->", nextUser, "remember:", remember);
    saveAuthUser(nextUser, remember);
    setAuthUser(nextUser);
    setActivePage("dashboard");
    pushRoute("dashboard", true);
  };

  const handleSignOut = () => {
    clearAuthUser();
    setAuthUser(null);
    setActivePage("dashboard");
    const loginPath = window.location.protocol === "file:" ? "#/login" : "/login";
    window.history.replaceState({}, "", loginPath);
  };

  const renderedPage = useMemo(() => {
    const currentPath = getRoutePath();
    if (isResetPasswordRoute(currentPath)) {
      return <ResetPasswordPage />;
    }

    switch (activePage) {
      case "dashboard": return <PageDashboard nav={navigate} user={authUser} pageSearch={globalSearch} />;
      case "documents": return <PageDocuments nav={navigate} pageSearch={globalSearch} routeParams={routeInfo.params} />;
      case "scanner": return <PageScanner />;
      case "journey": return <PageJourney />;
      case "register": return <PageRegister />;
      case "users": return <PageUsers nav={navigate} routeParams={routeInfo.params} />;
      case "reports": return <PageReports nav={navigate} />;
      case "reportRecord": return <PageReportDetail detailType="record" recordId={routeInfo.params.id} onBack={() => navigate("reports")} />;
      case "reportActivity": return <PageReportDetail detailType="activity" user={routeInfo.params.user} onBack={() => navigate("reports")} />;
      case "notifications": return <PageNotifications onUnreadChange={setNotificationCount} />;
      case "settings": return <PageSettings />;
      default: return <PageDashboard nav={navigate} user={authUser} pageSearch={globalSearch} />;
    }
  }, [activePage, authUser, globalSearch, routeInfo]);

  if (isResetPasswordRoute(getRoutePath())) {
    return <div style={{ minHeight: "100vh", background: "#f7efe0" }}>{renderedPage}</div>;
  }

  if (!loggedIn) return <LoginPage onLogin={handleLogin} />;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#eef2f1", fontFamily: "system-ui, -apple-system, sans-serif", overflow: "hidden" }}>
      <Sidebar activePage={activePage} onSelect={navigate} authUser={authUser} onSignOut={handleSignOut} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(90deg, #ffffff 0%, #fbf8f2 100%)", borderBottom: "1px solid rgba(15,23,42,0.08)", padding: "14px 24px", display: "flex", alignItems: "center", gap: 14, position: "sticky", top: 0, zIndex: 10, boxShadow: "0 1px 0 rgba(15,23,42,0.04)" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#1f2937" }}>{pageConfig[activePage]?.title}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{pageConfig[activePage]?.bc}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f1f5f9", border: "1px solid rgba(148,163,184,0.3)", borderRadius: 12, padding: "8px 12px", minWidth: 240 }}>
              <i className="ti ti-search" style={{ fontSize: 14, color: "#64748b" }} />
              <input
                placeholder="Search record ID or keyword..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                style={{ border: "none", background: "transparent", fontSize: 13, color: "#0f172a", outline: "none", width: "100%", fontFamily: "inherit" }}
              />
            </div>
            <BtnOutline onClick={handleSignOut} style={{ padding: "9px 14px" }}>Sign out</BtnOutline>
            <div onClick={() => navigate("notifications")} style={{ width: 38, height: 38, border: "1px solid rgba(148,163,184,0.25)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", background: "white" }}>
              <i className="ti ti-bell" style={{ fontSize: 16, color: "#475569" }} />
              {notificationCount > 0 && (
                <div style={{ position: "absolute", top: -6, right: -6, minWidth: 18, height: 18, padding: "0 5px", borderRadius: 18, background: RED, color: "white", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 2px rgba(255,255,255,0.95)" }}>
                  {notificationCount}
                </div>
              )}
            </div>
            <BtnGreen onClick={() => navigate("register")} small style={{ background: GRADIENT_RUST, padding: "9px 14px" }}>
              <i className="ti ti-plus" style={{ fontSize: 14 }} />New record
            </BtnGreen>
          </div>
        </div>
        <main style={{ flex: 1, overflowY: "auto", padding: 24, minHeight: 0 }}>
          {renderedPage}
        </main>
      </div>
    </div>
  );
}
