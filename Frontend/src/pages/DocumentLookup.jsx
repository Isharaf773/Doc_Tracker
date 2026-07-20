import { useState, useEffect, useRef } from "react";
import { FormGroup, Input, Select, BtnGreen, BtnOutline } from "../components/ui";
import { Panel, PanelHeader } from "./PageHelpers";
import { TEAL, TEAL_DARK, TEAL_LIGHT, BLUE } from "../theme";
import { fetchRecords } from "../api";
import { API_BASE } from "../config";

const DEPARTMENT_OPTIONS = [
  "All departments",
  "Geology",
  "Mining",
  "HR",
  "Finance",
  "Legal",
  "Audit",
  "IT",
  "Media",
  "Procurement",
  "Compliance",
  "Administration",
  "Board of Management",
  "Senior Management",
];

const STATUS_OPTIONS = [
  { label: "All status", value: "all" },
  { label: "Active", value: "active" },
  { label: "Transit", value: "transit" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Archived", value: "archived" },
];

function getAuthHeaders() {
  try {
    const saved = localStorage.getItem("doctrack_user") || sessionStorage.getItem("doctrack_user");
    const authUser = saved ? JSON.parse(saved) : null;
    if (!authUser || !authUser.email) return {};
    return {
      "x-admin-email": authUser.email,
      "x-admin-token": authUser.token || "authenticated",
    };
  } catch {
    return {};
  }
}

export function PageDocumentLookup() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("any");
  const [department, setDepartment] = useState("All departments");
  const [status, setStatus] = useState("all");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Auto-search as user types
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchTerm.trim() && department === "All departments" && status === "all") {
      setResults([]);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    setSelectedRecord(null);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const filters = {};

        if (searchTerm.trim()) {
          filters.search = searchTerm.trim();
        }

        if (department !== "All departments") {
          filters.dept = department;
        }

        if (status !== "all") {
          filters.status = status;
        }

        const data = await fetchRecords(filters);
        setResults(data.records || []);

        if (searchTerm.trim() && (!data.records || data.records.length === 0)) {
          setError("No documents found matching your search criteria.");
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Unable to search documents.");
      } finally {
        setLoading(false);
      }
    }, 500); // Debounce search by 500ms

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, department, status]);

  const handleView = (record) => {
    if (!record.hasSoftCopy) {
      setError("This document does not have a soft copy attached.");
      return;
    }

    try {
      const headers = getAuthHeaders();
      const email = headers["x-admin-email"];
      const token = headers["x-admin-token"];
      
      console.log("🔍 View: Auth check -", { email: !!email, token: !!token });
      
      if (!email || !token) {
        setError("Not logged in. Please login first to view documents.");
        return;
      }

      const resolvedApiBase = API_BASE || 'http://127.0.0.1:8080';
      const normalizedBase = resolvedApiBase.replace(/\/$/, '');
      
      // Build URL with auth params
      const viewUrl = `${normalizedBase}/api/records/${encodeURIComponent(record.id)}/soft-copy?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
      console.log("🔍 View: URL -", viewUrl.substring(0, 100) + "...");
      
      // Open directly - query params will be in the URL
      window.open(viewUrl, "_blank");
    } catch (err) {
      console.error("🔍 View: Error -", err);
      setError(err.message || "Unable to open document.");
    }
  };

  const handleDownload = async (record) => {
    if (!record.hasSoftCopy) {
      setError("This document does not have a soft copy attached.");
      return;
    }

    setDownloading(true);
    try {
      const headers = getAuthHeaders();
      const resolvedApiBase = API_BASE || 'http://127.0.0.1:8080';
      const normalizedBase = resolvedApiBase.replace(/\/$/, '');
      const url = `${normalizedBase}/api/records/${encodeURIComponent(record.id)}/soft-copy`;
      
      console.log("Downloading from:", url, "with headers:", headers);
      
      const response = await fetch(url, {
        headers: {
          ...headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to download file (${response.status})`);
      }

      const blob = await response.blob();
      const fileName = record.softCopyName || `${record.id}.pdf`;
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to download file. Make sure you have proper permissions.");
    } finally {
      setDownloading(false);
    }
  };

  const handleSelectRecord = (record) => {
    setSelectedRecord(record);
    setError("");
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchType("any");
    setDepartment("All departments");
    setStatus("all");
    setResults([]);
    setSelectedRecord(null);
    setError("");
  };

  return (
    <div style={{ display: "grid", gap: 18, minWidth: 840 }}>
      {/* Search Panel */}
      <Panel>
        <PanelHeader icon="ti-file-search" title="Document Lookup & Download" badge={`${results.length} results`} />
        <div style={{ margin: 14, borderRadius: 12, padding: 18, display: "grid", gap: 18 }}>
          {/* Search Criteria */}
          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr" }}>
            <FormGroup label="Search term">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ID code or document name"
                mono={false}
              />
            </FormGroup>

            <FormGroup label="Search type">
              <Select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                style={{ width: "100%" }}
                options={[
                  { value: "any", label: "Search all fields" },
                  { value: "id", label: "ID code only" },
                  { value: "name", label: "Document name only" },
                ]}
              />
            </FormGroup>

            <FormGroup label="Department / Category">
              <Select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                style={{ width: "100%" }}
                options={DEPARTMENT_OPTIONS}
              />
            </FormGroup>

            <FormGroup label="Status">
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ width: "100%" }}
                options={STATUS_OPTIONS}
              />
            </FormGroup>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ padding: "10px 12px", borderRadius: 12, background: "#fee2e2", color: "#991b1b", fontSize: 12 }}>
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {loading && (
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, color: "#666", fontSize: 12 }}>
                <div style={{ width: 16, height: 16, border: "2px solid #ddd", borderTop: "2px solid #5A4728", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                Searching…
              </div>
            )}
            {!loading && results.length > 0 && (
              <div style={{ flex: 1, color: "#666", fontSize: 12, fontWeight: 600 }}>
                {results.length} result{results.length !== 1 ? "s" : ""} found
              </div>
            )}
            <button
              type="button"
              onClick={clearSearch}
              style={{
                padding: "0 14px",
                borderRadius: 14,
                border: "1px solid rgba(90, 71, 40, 0.18)",
                background: "white",
                color: "#5A4728",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
                minHeight: 44,
              }}
            >
              Clear
            </button>
          </div>
          
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </Panel>

      {/* Results Table */}
      {results.length > 0 && (
        <Panel>
          <PanelHeader icon="ti-table" title="Search Results" badge={`${results.length} found`} />
          <div style={{ margin: 14, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)", maxHeight: "600px", display: "flex", flexDirection: "column" }}>
            <div style={{ overflowX: "auto", overflowY: "auto", flex: 1 }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 12,
                  textAlign: "left",
                }}
              >
                <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                  <tr style={{ background: "rgba(90, 71, 40, 0.08)", borderBottom: "1px solid rgba(0,0,0,0.12)" }}>
                    <th style={{ padding: "12px", fontWeight: 600, color: "#5A4728", minWidth: "120px" }}>ID Code</th>
                    <th style={{ padding: "12px", fontWeight: 600, color: "#5A4728", minWidth: "200px" }}>Document Name</th>
                    <th style={{ padding: "12px", fontWeight: 600, color: "#5A4728", minWidth: "140px" }}>Department</th>
                    <th style={{ padding: "12px", fontWeight: 600, color: "#5A4728", minWidth: "100px" }}>Status</th>
                    <th style={{ padding: "12px", fontWeight: 600, color: "#5A4728", minWidth: "90px", textAlign: "center" }}>Soft Copy</th>
                    <th style={{ padding: "12px", fontWeight: 600, color: "#5A4728", minWidth: "130px", textAlign: "center" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((record, idx) => (
                    <tr
                      key={record.id}
                      style={{
                        borderBottom: "1px solid rgba(0,0,0,0.06)",
                        background: selectedRecord?.id === record.id ? "rgba(90, 71, 40, 0.1)" : idx % 2 === 0 ? "white" : "rgba(0,0,0,0.02)",
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                      onClick={() => handleSelectRecord(record)}
                      onMouseEnter={(e) => {
                        if (selectedRecord?.id !== record.id) {
                          e.currentTarget.style.background = "rgba(90, 71, 40, 0.04)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedRecord?.id !== record.id) {
                          e.currentTarget.style.background = idx % 2 === 0 ? "white" : "rgba(0,0,0,0.02)";
                        }
                      }}
                    >
                      <td style={{ padding: "12px", color: "#333", fontWeight: 600, whiteSpace: "nowrap" }}>{record.id}</td>
                      <td style={{ padding: "12px", color: "#555" }}>
                        <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={record.name}>
                          {record.name}
                        </div>
                      </td>
                      <td style={{ padding: "12px", color: "#666", whiteSpace: "nowrap" }}>{record.dept}</td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 8px",
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            background:
                              record.status === "completed"
                                ? "#d1fae5"
                                : record.status === "pending"
                                ? "#fef08a"
                                : record.status === "transit"
                                ? "#e0e7ff"
                                : "#f3f4f6",
                            color:
                              record.status === "completed"
                                ? "#065f46"
                                : record.status === "pending"
                                ? "#92400e"
                                : record.status === "transit"
                                ? "#3730a3"
                                : "#374151",
                          }}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        {record.hasSoftCopy ? (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 8px",
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 600,
                              background: "#d1fae5",
                              color: "#065f46",
                              whiteSpace: "nowrap",
                            }}
                          >
                            ✓ Yes
                          </span>
                        ) : (
                          <span style={{ color: "#999", fontSize: 11 }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "nowrap" }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleView(record);
                            }}
                            disabled={!record.hasSoftCopy}
                            style={{
                              padding: "4px 8px",
                              borderRadius: 6,
                              border: record.hasSoftCopy ? "1px solid #556B2F" : "1px solid #ddd",
                              background: record.hasSoftCopy ? "#556B2F" : "#f5f5f5",
                              color: record.hasSoftCopy ? "white" : "#ccc",
                              cursor: record.hasSoftCopy ? "pointer" : "not-allowed",
                              fontSize: 9,
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                              opacity: record.hasSoftCopy ? 1 : 0.6,
                            }}
                            title="View document in browser"
                          >
                            👁
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(record);
                            }}
                            disabled={!record.hasSoftCopy || downloading}
                            style={{
                              padding: "4px 8px",
                              borderRadius: 6,
                              border: record.hasSoftCopy ? "1px solid #5A4728" : "1px solid #ddd",
                              background: record.hasSoftCopy ? "#5A4728" : "#f5f5f5",
                              color: record.hasSoftCopy ? "white" : "#ccc",
                              cursor: record.hasSoftCopy ? "pointer" : "not-allowed",
                              fontSize: 9,
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                              opacity: record.hasSoftCopy ? 1 : 0.6,
                            }}
                            title="Download document"
                          >
                            {downloading ? "↓" : "📥"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Panel>
      )}

      {/* Selected Record Details */}
      {selectedRecord && (
        <Panel>
          <PanelHeader icon="ti-info-circle" title="Document Details" badge="Selected" />
          <div style={{ margin: 14, borderRadius: 12, padding: 18, display: "grid", gap: 14, background: "rgba(90, 71, 40, 0.04)", border: "1px solid rgba(90, 71, 40, 0.12)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#666", marginBottom: 4 }}>ID Code</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#333", mono: true }}>{selectedRecord.id}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#666", marginBottom: 4 }}>Status</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>{selectedRecord.status}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#666", marginBottom: 4 }}>Document Name</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>{selectedRecord.name}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#666", marginBottom: 4 }}>Department</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>{selectedRecord.dept}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#666", marginBottom: 4 }}>Handler</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>{selectedRecord.handler}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#666", marginBottom: 4 }}>Last Updated</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>{selectedRecord.updated}</div>
              </div>
            </div>

            {selectedRecord.hasSoftCopy && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#666", marginBottom: 8 }}>Soft Copy</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => handleView(selectedRecord)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "none",
                      background: "#556B2F",
                      color: "white",
                      cursor: "pointer",
                      fontSize: 11,
                      fontWeight: 600,
                      minHeight: 32,
                    }}
                  >
                    👁 View
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload(selectedRecord)}
                    disabled={downloading}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "none",
                      background: "#5A4728",
                      color: "white",
                      cursor: downloading ? "wait" : "pointer",
                      fontSize: 11,
                      fontWeight: 600,
                      minHeight: 32,
                    }}
                  >
                    {downloading ? "Downloading…" : "📥 Download"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </Panel>
      )}
    </div>
  );
}
