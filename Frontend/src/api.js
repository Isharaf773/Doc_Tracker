import { API_BASE } from "./config";

const resolvedApiBase = API_BASE || 'http://127.0.0.1:8080';
// Normalize base and provide a safe URL builder so frontend works
// whether API_BASE includes '/api' or not, and to avoid duplicate '/api/api'
const normalizedBase = resolvedApiBase.replace(/\/$/, '');
console.log("DocTrack API base:", normalizedBase, "(configured:", API_BASE, ")");

function buildUrl(path) {
  // Ensure path starts with '/'
  const p = path.startsWith('/') ? path : `/${path}`;

  // If both base and path contain '/api' prefix, avoid duplication
  if (p.startsWith('/api') && normalizedBase.endsWith('/api')) {
    return normalizedBase + p.replace(/^\/api/, '');
  }

  return normalizedBase + p;
}

function getStoredAuthUser() {
  try {
    const saved = localStorage.getItem("doctrack_user") || sessionStorage.getItem("doctrack_user");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function getAuthHeaders() {
  const authUser = getStoredAuthUser();
  if (!authUser || !authUser.email) return {};
  return {
    "x-admin-email": authUser.email,
    "x-admin-token": authUser.token || "authenticated",
  };
}

async function request(path, options = {}) {
  console.log("api.request ->", path, options.method || "GET");
  const init = {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
    ...options,
  };

  if (options.body && typeof options.body !== "string") {
    init.body = JSON.stringify(options.body);
  }

  const response = await fetch(buildUrl(path), init);
  const text = await response.text().catch(() => "");
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    data = { raw: text };
  }
  console.log("api.response <-", path, response.status, data);

  if (!response.ok) {
    throw new Error(data.error || "API request failed");
  }

  return data;
}

export function login(email, password) {
  return request("/api/login", { method: "POST", body: { email, password } });
}

export function fetchDashboard() {
  return request("/api/dashboard");
}

export function fetchRecords(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  return request(`/api/records${query ? `?${query}` : ""}`);
}

export function fetchRecord(recordId) {
  return request(`/api/records/${encodeURIComponent(recordId)}`);
}

export function createRecord(payload) {
  return request("/api/records", { method: "POST", body: payload });
}
export function updateUser(email, payload) {
  return request(`/api/users/${encodeURIComponent(email)}`, { method: "PUT", body: payload });
}

export function deleteUser(email) {
  return request(`/api/users/${encodeURIComponent(email)}`, { method: "DELETE" });
}
export function updateRecordLocation(recordId, payload, attachments = []) {
  // If attachments are provided, use FormData for multipart upload
  if (attachments && attachments.length > 0) {
    const formData = new FormData();
    formData.append("location", payload.location);
    formData.append("status", payload.status);
    formData.append("handler", payload.handler);
    if (payload.comment) formData.append("comment", payload.comment);
    
    // Add all attachment files
    attachments.forEach(file => {
      formData.append("attachments", file);
    });

    // Custom fetch for multipart since regular request() expects JSON
    const url = buildUrl(`/api/records/${encodeURIComponent(recordId)}/location`);
    const init = {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    };

    return fetch(url, init).then(async response => {
      const text = await response.text().catch(() => "");
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = { raw: text };
      }

      if (!response.ok) {
        const errorMessage = data.error || data.message || (typeof data.raw === 'string' ? data.raw : 'Upload failed');
        throw new Error(errorMessage);
      }

      return data;
    }).catch(error => {
      throw new Error(error.message || "Upload failed");
    });
  }

  // If no attachments, use regular JSON request
  return request(`/api/records/${encodeURIComponent(recordId)}/location`, { method: "POST", body: payload });
}

export function fetchUsers() {
  return request("/api/users");
}

export function createUser(payload) {
  return request("/api/users", { method: "POST", body: payload });
}

export function createAdmin(payload) {
  return request("/api/admins", { method: "POST", body: payload });
}

export function fetchNotifications() {
  return request("/api/notifications");
}

export function markAllNotificationsRead() {
  return request("/api/notifications/read-all", { method: "PUT" });
}

export function markNotificationRead(notificationId) {
  return request(`/api/notifications/${encodeURIComponent(notificationId)}/read`, { method: "PUT" });
}

export function forgotPassword(email) {
  return request("/api/forgot-password", { method: "POST", body: { email } });
}

export function resetPassword(email, password) {
  return request("/api/reset-password", { method: "POST", body: { email, password } });
}

export function fetchJourney(recordId) {
  const query = new URLSearchParams({ recordId }).toString();
  return request(`/api/journey?${query}`);
}

export function fetchJourneyAttachments(journeyId) {
  return request(`/api/journey/${encodeURIComponent(journeyId)}/attachments`);
}

export async function downloadJourneyAttachment(journeyId, attachmentId, fileName) {
  try {
    const response = await fetch(
      buildUrl(`/api/journey/${encodeURIComponent(journeyId)}/attachments/${encodeURIComponent(attachmentId)}/download`),
      { headers: { ...getAuthHeaders() } }
    );
    if (!response.ok) throw new Error("Download failed");
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || "attachment";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(error.message || "Unable to download attachment");
  }
}

export function fetchReports(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  return request(`/api/reports${query ? `?${query}` : ""}`);
}

export async function fetchRecordSoftCopy(recordId) {
  const response = await fetch(buildUrl(`/api/records/${encodeURIComponent(recordId)}/soft-copy`), {
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) {
    let message = "Unable to load the soft copy.";
    try {
      const data = await response.json();
      message = data.error || message;
    } catch {}
    throw new Error(message);
  }
  return {
    blob: await response.blob(),
    contentType: response.headers.get("content-type") || "application/octet-stream",
  };
}
