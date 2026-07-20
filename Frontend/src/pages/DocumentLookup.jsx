import { useState, useEffect } from "react";
import { FormGroup, Input, Select, BtnGreen, BtnOutline } from "../components/ui";
import { Panel, PanelHeader } from "./PageHelpers";
import { TEAL, TEAL_DARK, TEAL_LIGHT, BLUE } from "../theme";
import { fetchRecords } from "../api";

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
  const [searchType, setSearchType] = useState("any"); // any, id, name
  const [department, setDepartment] = useState("All departments");
  const [status, setStatus] = useState("all");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const performSearch = async () => {
    if (!searchTerm.trim() && department === "All departments" && status === "all") {
      setError("Please enter a search term or apply filters.");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);
    setSelectedRecord(null);

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

      if (!data.records || data.records.length === 0) {
        setError("No documents found matching your search criteria.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to search documents.");
    } finally {
      setLoading(false);
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
      const response = await fetch(`/api/records/${encodeURIComponent(record.id)}/soft-copy`, {
        headers: {
          ...headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to download file");
      }

      const blob = await response.blob();
      const fileName = record.softCopyName || `${record.id}.pdf`;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
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
                onKeyPress={(e) => e.key === "Enter" && performSearch()}
                placeholder="ID code or document name"
                mono={false}
              />
            </FormGroup>

            <FormGroup label="Search type">
              <Select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                style={{ width: "100%" }}
              >
                <option value="any">Search all fields</option>
                <option value="id">ID code only</option>
                <option value="name">Document name only</option>
              </Select>
            </FormGroup>

            <FormGroup label="Department / Category">
              <Select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                style={{ width: "100%" }}
              >
                {DEPARTMENT_OPTIONS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup label="Status">
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ width: "100%" }}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </FormGroup>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ padding: "10px 12px", borderRadius: 12, background: "#fee2e2", color: "#991b1b", fontSize: 12 }}>
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <BtnGreen onClick={performSearch} disabled={loading} style={{ flex: 2, padding: "0 18px", minHeight: 44, borderRadius: 14, fontWeight: 700 }}>
              {loading ? "Searching…" : "Search"}
            </BtnGreen>
            <button
              type="button"
              onClick={clearSearch}
              style={{
                flex: 1,
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
        </div>
      </Panel>

      {/* Results Table */}
      {results.length > 0 && (
        <Panel>
          <PanelHeader icon="ti-table" title="Search Results" badge={`${results.length} found`} />
          <div style={{ margin: 14, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)" }}>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 12,
                  textAlign: "left",
                }}
              >
                <thead>
                  <tr style={{ background: "rgba(90, 71, 40, 0.08)", borderBottom: "1px solid rgba(0,0,0,0.12)" }}>
                    <th style={{ padding: "12px", fontWeight: 600, color: "#5A4728" }}>ID Code</th>
                    <th style={{ padding: "12px", fontWeight: 600, color: "#5A4728" }}>Document Name</th>
                    <th style={{ padding: "12px", fontWeight: 600, color: "#5A4728" }}>Department</th>
                    <th style={{ padding: "12px", fontWeight: 600, color: "#5A4728" }}>Status</th>
                    <th style={{ padding: "12px", fontWeight: 600, color: "#5A4728" }}>Soft Copy</th>
                    <th style={{ padding: "12px", fontWeight: 600, color: "#5A4728" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((record, idx) => (
                    <tr
                      key={record.id}
                      style={{
                        borderBottom: "1px solid rgba(0,0,0,0.06)",
                        background: selectedRecord?.id === record.id ? "rgba(0, 128, 128, 0.04)" : idx % 2 === 0 ? "white" : "rgba(0,0,0,0.02)",
                        cursor: "pointer",
                      }}
                      onClick={() => handleSelectRecord(record)}
                    >
                      <td style={{ padding: "12px", color: "#333", fontWeight: 600 }}>{record.id}</td>
                      <td style={{ padding: "12px", color: "#555" }}>{record.name}</td>
                      <td style={{ padding: "12px", color: "#666" }}>{record.dept}</td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 8px",
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 600,
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
                            }}
                          >
                            ✓ Yes
                          </span>
                        ) : (
                          <span style={{ color: "#999", fontSize: 11 }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(record);
                          }}
                          disabled={!record.hasSoftCopy || downloading}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 8,
                            border: record.hasSoftCopy ? "1px solid #5A4728" : "1px solid #ccc",
                            background: record.hasSoftCopy ? "#5A4728" : "#eee",
                            color: record.hasSoftCopy ? "white" : "#999",
                            cursor: record.hasSoftCopy ? "pointer" : "not-allowed",
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          {downloading ? "…" : "Download"}
                        </button>
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
                <button
                  type="button"
                  onClick={() => handleDownload(selectedRecord)}
                  disabled={downloading}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 8,
                    border: "none",
                    background: "#5A4728",
                    color: "white",
                    cursor: downloading ? "wait" : "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                    minHeight: 36,
                  }}
                >
                  {downloading ? "Downloading…" : "📥 Download " + (selectedRecord.softCopyName || "File")}
                </button>
              </div>
            )}
          </div>
        </Panel>
      )}
    </div>
  );
}
