export const TEAL = "#5A4728";
export const TEAL_DARK = "#372A1A";
export const TEAL_LIGHT = "#E8D7B0";
export const TEAL_TEXT = "#3F2F23";
export const BLUE_LIGHT = "#DDD2B4";
export const BLUE = "#6F5F46";
export const AMBER_LIGHT = "#F1DEAD";
export const AMBER = "#A0682D";
export const CORAL_LIGHT = "#F5E0D6";
export const CORAL = "#A15A3D";
export const PURPLE_LIGHT = "#E5D6E8";
export const PURPLE = "#6D4B79";
export const RED = "#8B3D29";
export const RED_LIGHT = "#F7D9CE";
export const RED_DARK = "#612B1F";
export const DASHBOARD_BG = "linear-gradient(135deg, #F8F2E8 0%, #E9D7C0 45%, #F4E8D6 100%)";
export const GRADIENT_EARTH = "linear-gradient(180deg, #5A4328 0%, #D1B07D 100%)";
export const GRADIENT_TEAL = "linear-gradient(135deg, #3B8B69 0%, #5DAE8F 100%)";
export const GRADIENT_RUST = "linear-gradient(135deg, #8A4B2A 0%, #E0B58B 100%)";

export const pages = [
  { id: "dashboard", label: "Dashboard", icon: "ti-layout-dashboard", section: "main" },
  { id: "documents", label: "Records", icon: "ti-files", section: "main" },
  { id: "scanner", label: "QR Scanner", icon: "ti-qrcode", section: "main" },
  { id: "journey", label: "Journey log", icon: "ti-route", section: "main" },
  { id: "register", label: "Register record", icon: "ti-file-plus", section: "mgmt" },
  { id: "users", label: "Users", icon: "ti-users", section: "mgmt" },
  { id: "reports", label: "Reports", icon: "ti-chart-bar", section: "mgmt" },
  { id: "notifications", label: "Notifications", icon: "ti-bell", section: "mgmt" },
  { id: "settings", label: "Settings", icon: "ti-settings", section: "mgmt" },
];

export const statuses = {
  active: { label: "Active", bg: TEAL_LIGHT, color: TEAL_TEXT },
  transit: { label: "In transit", bg: BLUE_LIGHT, color: BLUE },
  pending: { label: "Pending", bg: AMBER_LIGHT, color: AMBER },
  archived: { label: "Archived", bg: "#F1EFE8", color: "#5F5E5A" },
};
