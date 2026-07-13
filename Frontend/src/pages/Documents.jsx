import { useEffect, useMemo, useState } from "react";
import { BtnGreen, BtnOutline, Input } from "../components/ui";
import { Panel, PanelHeader, StatusBadge } from "./PageHelpers";
import { BLUE } from "../theme";
import { Select } from "../components/ui";
import { fetchRecords } from "../api";

export function PageDocuments({ nav, pageSearch = "", routeParams = {} }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [statusGroup, setStatusGroup] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All departments");
  const [showDelayed, setShowDelayed] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const statusOptions = [
    { value: "all", label: "All status" },
    { value: "active", label: "Active" },
    { value: "transit", label: "In transit" },
    { value: "pending", label: "Pending" },
    { value: "archived", label: "Archived" },
  ];
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const normalize = (value) => String(value || "").trim().toLowerCase();
  const recordCodeMatches = (code, query) => {
    const normalizedCode = normalize(code);
    if (!query) return true;
    if (normalizedCode.includes(query)) return true;
    const suffixMatch = normalizedCode.match(/(\d+)$/);
    return suffixMatch ? suffixMatch[1].includes(query) : false;
  };

  const handleExport = () => {
    const rows = docsToRender.map(doc => ({
      "Record ID": doc.id,
      "Name": doc.name,
      "Department": doc.dept,
      "Status": doc.status,
      "Handler": doc.handler,
      "Updated": doc.updated,
    }));

    const escapeHtml = (value) => String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
    const activeStatusLabel = statusOptions.find(option => option.value === statusFilter)?.label || "All status";
    const filters = `Status: ${activeStatusLabel}${showDelayed ? " (delayed only)" : ""}, Department: ${departmentFilter}, From: ${startDate || "Any"}, To: ${endDate || "Any"}`;
    const title = `Records Export`;
    const exportDate = new Date().toISOString().slice(0, 10);

    const headerCells = ["Record ID", "Name", "Department", "Status", "Handler", "Updated"]
      .map(label => `<th style="padding:10px 12px; text-align:left; background:#5A4728; color:#ffffff; font-weight:600; font-size:11pt;">${label}</th>`)
      .join("");

    const bodyRows = rows.map(row => {
      return `<tr>${Object.values(row).map(value => `<td style="padding:10px 12px; border:1px solid #d1d5db; font-size:10pt; color:#1f2937;">${escapeHtml(value)}</td>`).join("")}</tr>`;
    }).join("");

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8" />
        </head>
        <body>
          <table style="width:100%; border-collapse:collapse; font-family:Arial, sans-serif; margin-bottom:16px;">
            <tr>
              <td colspan="6" style="font-size:18pt; font-weight:700; color:#1f2937; padding:12px 0;">${escapeHtml(title)}</td>
            </tr>
            <tr>
              <td colspan="6" style="font-size:10pt; color:#475569; padding:4px 0;">Export date: ${escapeHtml(exportDate)}</td>
            </tr>
            <tr>
              <td colspan="6" style="font-size:10pt; color:#475569; padding:4px 0;">${escapeHtml(filters)}</td>
            </tr>
          </table>
          <table border="1" style="width:100%; border-collapse:collapse; font-family:Arial, sans-serif;">
            <thead>${headerCells}</thead>
            <tbody>${bodyRows}</tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `records-export-${exportDate}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    let isMounted = true;
    async function loadRecords() {
      setLoading(true);
      const filters = {};
      if (statusGroup) {
        filters.statusGroup = statusGroup;
      } else if (statusFilter !== "all") {
        filters.status = statusFilter;
      }
      if (departmentFilter !== "All departments") filters.dept = departmentFilter;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      if (showDelayed) {
        filters.delayed = true;
        if (routeParams.overdue === "true") {
          filters.overdue = true;
        }
      }

      try {
        const data = await fetchRecords(filters);
        if (isMounted) setRecords(data.records || []);
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadRecords();
    return () => { isMounted = false; };
  }, [statusFilter, statusGroup, departmentFilter, startDate, endDate, showDelayed]);

  useEffect(() => {
    setCurrentPage(1);
  }, [localSearch, pageSearch, statusFilter, departmentFilter, startDate, endDate, showDelayed]);

  const docs = loading && records.length === 0 ? [
    { id: "DOC-2026-0341", name: "Contract Review — Phase 3", dept: "Legal", status: "transit", handler: "Nimal S.", updated: "2 hrs ago" },
    { id: "DOC-2026-0340", name: "Annual Budget Report", dept: "Finance", status: "active", handler: "Kamani P.", updated: "4 hrs ago" },
    { id: "DOC-2026-0339", name: "Supplier Agreement — NW", dept: "Procurement", status: "pending", handler: "Ruwan J.", updated: "Yesterday" },
    { id: "DOC-2026-0338", name: "Q2 Audit Summary", dept: "Compliance", status: "active", handler: "Admin", updated: "Yesterday" },
    { id: "DOC-2026-0337", name: "HR Policy Update v4", dept: "HR", status: "transit", handler: "Dilani M.", updated: "2 days ago" },
    { id: "DOC-2026-0336", name: "ISO Certification Docs", dept: "Compliance", status: "archived", handler: "Admin", updated: "3 days ago" },
  ] : records;

  useEffect(() => {
    const routeStatus = routeParams.status || (routeParams.overdue === "true" || routeParams.delayed === "true" ? "all" : "all");
    setStatusFilter(routeStatus);
    setStatusGroup(routeParams.statusGroup || "");
    setDepartmentFilter(routeParams.dept || "All departments");
    setStartDate(routeParams.startDate || "");
    setEndDate(routeParams.endDate || "");
    setShowDelayed(routeParams.overdue === "true" || routeParams.delayed === "true");
    setLocalSearch(routeParams.search || "");
  }, [routeParams]);

  const search = (localSearch || pageSearch).trim().toLowerCase();
  const filteredDocs = docs.filter(doc => {
    const matchesStatus = statusFilter === "all" || doc.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesDepartment = departmentFilter === "All departments" || doc.dept.toLowerCase() === departmentFilter.toLowerCase();
    const matchesSearch = !search || (
      recordCodeMatches(doc.id, search) ||
      doc.name.toLowerCase().includes(search) ||
      doc.dept.toLowerCase().includes(search) ||
      doc.status.toLowerCase().includes(search)
    );

    return matchesStatus && matchesDepartment && matchesSearch;
  });

  const docsToRender = filteredDocs;
  const pageCount = Math.max(1, Math.ceil(docsToRender.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageRecords = docsToRender.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, background: "white", border: "0.5px solid rgba(0,0,0,0.12)", borderRadius: 8, padding: "6px 11px", width: 240 }}>
          <i className="ti ti-search" style={{ fontSize: 13, color: "#aaa" }} />
          <input
            placeholder="Search by ID or name…"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            style={{ border: "none", background: "transparent", fontSize: 12, color: "#1a1a1a", outline: "none", width: "100%", fontFamily: "inherit" }}
          />
        </div>
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: 130 }}
        />
        <Select
          options={["All departments", "Geology", "Mining", "HR", "Finance", "Legal", "Audit", "IT", "Media"]}
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          style={{ width: 160 }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label htmlFor="records-start-date" style={{ fontSize: 11, color: "#555", cursor: "pointer" }}>From</label>
          <div className="date-input-wrapper">
            <input
              id="records-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: 150, padding: "8px 11px", border: "0.5px solid rgba(0,0,0,0.18)", borderRadius: 8, fontSize: 12, fontFamily: "inherit", background: "white", color: "#1a1a1a" }}
            />
            <i className="ti ti-pencil date-input-icon" onClick={() => {
              const input = document.getElementById('records-start-date');
              input?.showPicker?.();
              input?.focus();
            }} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label htmlFor="records-end-date" style={{ fontSize: 11, color: "#555", cursor: "pointer" }}>To</label>
          <div className="date-input-wrapper">
            <input
              id="records-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ width: 150, padding: "8px 11px", border: "0.5px solid rgba(0,0,0,0.18)", borderRadius: 8, fontSize: 12, fontFamily: "inherit", background: "white", color: "#1a1a1a" }}
            />
            <i className="ti ti-pencil date-input-icon" onClick={() => {
              const input = document.getElementById('records-end-date');
              input?.showPicker?.();
              input?.focus();
            }} />
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <BtnOutline onClick={handleExport}><i className="ti ti-download" style={{ fontSize: 13 }} />Export</BtnOutline>
          <BtnGreen onClick={() => nav("register")} small><i className="ti ti-plus" style={{ fontSize: 14 }} />New record</BtnGreen>
        </div>
      </div>
      <Panel>
        <PanelHeader title="All records" badge={loading ? "Loading…" : `${docsToRender.length} total`} />
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <thead>
            <tr style={{ background: "#f8f8f7" }}>
              {['Record ID','Name','Department','Status','Handler','Updated'].map((h,i) => (
                <th key={h} style={{ fontSize: 10, fontWeight: 500, color: "#888", textAlign: "left", padding: "7px 14px", borderBottom: "0.5px solid rgba(0,0,0,0.08)", textTransform: "uppercase", letterSpacing: "0.05em", width: i===0 ? 110 : i===2 ? 100 : i===3 ? 90 : i===4 ? 80 : i===5 ? 80 : undefined }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRecords.length > 0 ? pageRecords.map(d => (
              <tr key={d.id} style={{ cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = "#f8f8f7"} onMouseLeave={e => e.currentTarget.style.background = "white"}>
                <td style={{ padding: "9px 14px", fontSize: 11, fontFamily: "monospace", fontWeight: 500, color: BLUE, borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>{d.id}</td>
                <td style={{ padding: "9px 14px", fontSize: 12, color: "#1a1a1a", borderBottom: "0.5px solid rgba(0,0,0,0.06)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}><i className="ti ti-file-text" style={{ fontSize: 14, color: "#aaa", flexShrink: 0 }} />{d.name}</div>
                </td>
                <td style={{ padding: "9px 14px", fontSize: 11, color: "#777", borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>{d.dept}</td>
                <td style={{ padding: "9px 14px", borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}><StatusBadge status={d.status} /></td>
                <td style={{ padding: "9px 14px", fontSize: 11, color: "#777", borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>{d.handler}</td>
                <td style={{ padding: "9px 14px", fontSize: 11, color: "#aaa", borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>{d.updated}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} style={{ padding: "18px 14px", fontSize: 12, color: "#666", textAlign: "center" }}>
                  {loading ? "Loading records…" : "No records found for this period."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "0.5px solid rgba(0,0,0,0.07)" }}>
          <span style={{ fontSize: 12, color: "#888" }}>Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, docsToRender.length)} of {docsToRender.length}</span>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{ padding: "5px 10px", border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 6, fontSize: 11, color: currentPage === 1 ? "#bbb" : "#555", background: "white", cursor: currentPage === 1 ? "not-allowed" : "pointer", fontFamily: "inherit" }}
            >
              ← Prev
            </button>
            {Array.from({ length: pageCount }, (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentPage(index + 1)}
                style={{ padding: "5px 10px", border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 6, fontSize: 11, color: currentPage === index + 1 ? "#111" : "#555", background: currentPage === index + 1 ? "#f0f0f0" : "white", cursor: "pointer", fontFamily: "inherit" }}
              >
                {index + 1}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCurrentPage(Math.min(pageCount, currentPage + 1))}
              disabled={currentPage === pageCount}
              style={{ padding: "5px 10px", border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 6, fontSize: 11, color: currentPage === pageCount ? "#bbb" : "#555", background: "white", cursor: currentPage === pageCount ? "not-allowed" : "pointer", fontFamily: "inherit" }}
            >
              Next →
            </button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
