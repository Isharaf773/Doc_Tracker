import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { Panel, PanelHeader, BarChart } from "./PageHelpers";
import { Input, Select, BtnGreen, BtnOutline } from "../components/ui";
import { TEAL, TEAL_LIGHT, BLUE, BLUE_LIGHT, AMBER_LIGHT, CORAL_LIGHT, PURPLE_LIGHT } from "../theme";
import { fetchReports, fetchRecord } from "../api";

export const STATUS_LABELS = {
  active: "Active",
  transit: "In transit",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  archived: "Archived",
};

export function PageReports({ nav }) {
  const [cards, setCards] = useState([
    { title: "Monthly overview", desc: "Records registered, transitioned & resolved per month", bg: TEAL_LIGHT, ic: "ti-chart-bar", col: TEAL },
    { title: "User activity", desc: "Actions and approvals by handler for the selected period", bg: BLUE_LIGHT, ic: "ti-users", col: BLUE },
    { title: "Status summary", desc: "Approved, rejected, pending and transit record counts", bg: AMBER_LIGHT, ic: "ti-checkup-list", col: "#B77A11" },
    { title: "Department load", desc: "Document volume per department for the selected period", bg: CORAL_LIGHT, ic: "ti-building", col: "#B14035" },
    { title: "Document detail", desc: "Record-level details with status counts and timestamps", bg: PURPLE_LIGHT, ic: "ti-file-description", col: "#6B3C8A" },
    { title: "Audit view", desc: "Journey activity filtered by department and time window", bg: TEAL_LIGHT, ic: "ti-history", col: TEAL },
  ]);
  const [departmentVolumes, setDepartmentVolumes] = useState([]);
  const [statusCounts, setStatusCounts] = useState([]);
  const [delayDocuments, setDelayDocuments] = useState([]);
  const [documentDetails, setDocumentDetails] = useState([]);
  const [userActivity, setUserActivity] = useState([]);
  const [department, setDepartment] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recordLoading, setRecordLoading] = useState(false);

  const cardSectionMap = {
    "Monthly overview": "report-department-volume",
    "User activity": "report-user-activity",
    "Status summary": "report-status-summary",
    "Department load": "report-department-volume",
    "Document detail": "report-document-detail",
    "Audit view": "report-user-activity",
  };

  const loadReports = async (filters = {}) => {
    setLoading(true);
    try {
      const data = await fetchReports(filters);
      setCards(data.cards || cards);
      setDepartmentVolumes(data.departmentVolumes || []);
      setStatusCounts(data.statusCounts || []);
      setDelayDocuments(data.delayDocuments || []);
      setDocumentDetails(data.documentDetails || []);
      setUserActivity(data.userActivity || []);
      setAvailableDepartments(Array.from(new Set((data.departmentVolumes || []).map(d => d.label))));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleSearch = () => {
    loadReports({ dept: department, startDate, endDate });
  };

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getReportDateText = () => {
    if (startDate && endDate) {
      return `${startDate} to ${endDate}`;
    }
    if (startDate) {
      return `From ${startDate}`;
    }
    if (endDate) {
      return `Until ${endDate}`;
    }
    return 'This month';
  };

  const handleViewReportCard = (card) => {
    const sectionId = cardSectionMap[card.title];
    if (sectionId) {
      scrollToSection(sectionId);
    } else {
      alert(`View report: ${card.title}`);
    }
  };

  const handleViewActivity = (activity) => {
    nav("reportActivity", { user: activity.user });
  };

  const handleViewRecord = (recordId) => {
    nav("reportRecord", { id: recordId });
  };

  const downloadRecordPdf = (record) => {
    if (!record) return;
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const margin = 40;
    let y = 50;

    doc.setFontSize(18);
    doc.text("DocTrack Record Details", margin, y);
    y += 20;
    doc.setFontSize(11);
    doc.setTextColor(96, 110, 128);
    doc.text(`Date: ${new Date().toISOString().split('T')[0]}`, margin, y);
    y += 16;
    doc.text(`Filters: ${department || 'All departments'} · ${getReportDateText()}`, margin, y);
    y += 24;

    const tableX = margin;
    const tableWidth = 520;
    const labelWidth = 150;
    const rowHeight = 20;

    doc.setFillColor(245, 245, 245);
    doc.rect(tableX, y, tableWidth, rowHeight, "F");
    doc.setFontSize(12);
    doc.setTextColor(34, 34, 34);
    doc.text("Field", tableX + 8, y + 14);
    doc.text("Value", tableX + labelWidth + 8, y + 14);
    y += rowHeight;

    const rows = [
      ["Record ID", record.id || ""],
      ["Name", record.name || ""],
      ["Department", record.dept || ""],
      ["Status", STATUS_LABELS[record.status] || record.status || ""],
      ["Handler", record.handler || ""],
      ["Location", record.location || ""],
      ["Priority", record.priority || ""],
      ["Sender", record.sender_email || ""],
      ["Created", record.created_at || ""],
      ["Updated", record.updated_at || ""],
      ["Due date", record.due_date || ""],
      ["Approved count", record.approvedCount ?? "0"],
      ["Rejected count", record.rejectedCount ?? "0"],
      ["Pending count", record.pendingCount ?? "0"],
    ];

    rows.forEach(([label, value]) => {
      if (y + rowHeight > 760) {
        doc.addPage();
        y = margin;
      }
      doc.rect(tableX, y, tableWidth, rowHeight);
      doc.text(label, tableX + 8, y + 14);
      doc.text(`${value}`, tableX + labelWidth + 8, y + 14);
      y += rowHeight;
    });

    doc.save(`${record.id || "record"}-details.pdf`);
  };

  const downloadActivityPdf = (activity) => {
    if (!activity) return;
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const margin = 40;
    let y = 50;

    doc.setFontSize(18);
    doc.text("DocTrack User Activity", margin, y);
    y += 20;
    doc.setFontSize(11);
    doc.setTextColor(96, 110, 128);
    doc.text(`Date: ${new Date().toISOString().split('T')[0]}`, margin, y);
    y += 16;
    doc.text(`Filters: ${department || 'All departments'} · ${getReportDateText()}`, margin, y);
    y += 24;

    const tableX = margin;
    const tableWidth = 520;
    const labelWidth = 150;
    const rowHeight = 20;

    doc.setFillColor(245, 245, 245);
    doc.rect(tableX, y, tableWidth, rowHeight, "F");
    doc.setFontSize(12);
    doc.setTextColor(34, 34, 34);
    doc.text("Metric", tableX + 8, y + 14);
    doc.text("Value", tableX + labelWidth + 8, y + 14);
    y += rowHeight;

    const rows = [
      ["User", activity.user || ""],
      ["Actions", activity.actions || "0"],
      ["Approved", activity.approved || "0"],
      ["Rejected", activity.rejected || "0"],
      ["Pending", activity.pending || "0"],
    ];

    rows.forEach(([label, value]) => {
      if (y + rowHeight > 760) {
        doc.addPage();
        y = margin;
      }
      doc.rect(tableX, y, tableWidth, rowHeight);
      doc.text(label, tableX + 8, y + 14);
      doc.text(`${value}`, tableX + labelWidth + 8, y + 14);
      y += rowHeight;
    });

    doc.save(`${activity.user || "user"}-activity.pdf`);
  };

  const downloadCardPdf = (card) => {
    const isDocumentDetail = card.title === "Document detail";
    const doc = new jsPDF({ unit: "pt", format: isDocumentDetail ? "a4" : "letter", orientation: isDocumentDetail ? "landscape" : "portrait" });
    const margin = 36;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const tableX = margin;
    const tableWidth = pageWidth - margin * 2;
    let y = margin + 10;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(card.title, margin, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(96, 110, 128);
    doc.text(`Date: ${new Date().toISOString().split('T')[0]}`, margin, y, { maxWidth: tableWidth });
    y += 14;
    doc.text(`Filters: ${department || 'All departments'} · ${getReportDateText()}`, margin, y, { maxWidth: tableWidth });
    y += 18;
    doc.setFontSize(11);
    doc.setTextColor(34, 34, 34);
    doc.text(card.desc, margin, y, { maxWidth: tableWidth });
    y += 26;
    const rowHeight = 18;

    const drawTable = (headers, rows) => {
      const colWidths = headers.map((_, index) => {
        if (isDocumentDetail) {
          const widths = [90, 180, 90, 80, 120, 140, 90];
          return widths[index] || 90;
        }
        return index === 0 ? 140 : (tableWidth - 140) / (headers.length - 1);
      });

      doc.setFillColor(245, 245, 245);
      doc.rect(tableX, y, tableWidth, rowHeight, "F");
      doc.setFont("helvetica", "bold");
      headers.forEach((header, index) => {
        const x = tableX + colWidths.slice(0, index).reduce((sum, w) => sum + w, 0) + 8;
        doc.text(header, x, y + 13, { maxWidth: colWidths[index] - 10 });
      });
      y += rowHeight;
      doc.setFont("helvetica", "normal");

      rows.forEach(row => {
        if (y + rowHeight > pageHeight - margin) {
          doc.addPage();
          y = margin + 10;
        }
        doc.rect(tableX, y, tableWidth, rowHeight);
        row.forEach((value, index) => {
          const x = tableX + colWidths.slice(0, index).reduce((sum, w) => sum + w, 0) + 8;
          doc.text(String(value), x, y + 13, { maxWidth: colWidths[index] - 10 });
        });
        y += rowHeight;
      });
    };

    if (isDocumentDetail) {
      drawTable(
        ["Record", "Name", "Dept", "Status", "Handler", "Location", "Updated"],
        documentDetails.map(row => [
          row.id || "",
          row.name || "",
          row.dept || "",
          STATUS_LABELS[row.status] || row.status || "",
          row.handler || "",
          row.location || "",
          row.updated_at?.split(' ')[0] || ""
        ])
      );
    } else if (card.title === "User activity" || card.title === "Audit view") {
      drawTable(
        ["User", "Actions", "Approved", "Rejected", "Pending"],
        userActivity.slice(0, 20).map(row => [row.user || "", row.actions || "0", row.approved || "0", row.rejected || "0", row.pending || "0"])
      );
    } else if (card.title === "Status summary") {
      drawTable(
        ["Status", "Count"],
        statusCounts.map(row => [STATUS_LABELS[row.status] || row.status, row.count || 0])
      );
    } else {
      drawTable(
        ["Department", "Volume"],
        departmentVolumes.map(row => [row.label || "", row.val || ""])
      );
    }

    doc.save(`${card.title.toLowerCase().replace(/\s+/g, "-")}.pdf`);
  };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Panel>
        <PanelHeader icon="ti-list" title="Report topics" badge="Quick actions" />
        <div style={{ padding: 14, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f8f8f7' }}>
                {['Topic', 'Description', 'Actions'].map(header => (
                  <th key={header} style={{ textAlign: 'left', padding: '10px 14px', borderBottom: '1px solid rgba(0,0,0,0.08)', color:'#555' }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cards.map(c => (
                <tr key={c.title} style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', fontWeight: 600, color: '#222' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 32, height: 32, borderRadius: 10, background: c.bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className={`ti ${c.ic}`} style={{ fontSize: 14, color: c.col }} />
                      </span>
                      {c.title}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', color: '#666' }}>{c.desc}</td>
                  <td style={{ padding: '12px 14px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <BtnOutline small onClick={() => downloadCardPdf(c)}>Download</BtnOutline>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel>
        <PanelHeader icon="ti-filter" title="Report filters" />
        <div style={{ padding: 14, display: "grid", gridTemplateColumns: "240px 180px 180px auto", gap: 12, alignItems: "end" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: "#555", marginBottom: 6 }}>Department</div>
            <Select value={department} onChange={e => setDepartment(e.target.value)} options={["", ...availableDepartments]} style={{ width: "100%" }}>
              <option value="">All departments</option>
            </Select>
          </div>
          <div>
            <label htmlFor="reports-start-date" style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#555", marginBottom: 6, cursor: "pointer" }}>From</label>
            <div className="date-input-wrapper">
              <Input id="reports-start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              <i className="ti ti-pencil date-input-icon" onClick={() => {
                const input = document.getElementById('reports-start-date');
                input?.showPicker?.();
                input?.focus();
              }} />
            </div>
          </div>
          <div>
            <label htmlFor="reports-end-date" style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#555", marginBottom: 6, cursor: "pointer" }}>To</label>
            <div className="date-input-wrapper">
              <Input id="reports-end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              <i className="ti ti-pencil date-input-icon" onClick={() => {
                const input = document.getElementById('reports-end-date');
                input?.showPicker?.();
                input?.focus();
              }} />
            </div>
          </div>
          <BtnGreen onClick={handleSearch} disabled={loading} style={{ justifySelf: "end" }}>
            {loading ? "Loading…" : "Apply filters"}
          </BtnGreen>
        </div>
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 14 }}>
        <Panel id="report-department-volume">
          <PanelHeader icon="ti-chart-bar" title="Department volume" badge={department ? department : "This month"} />
          <BarChart rows={departmentVolumes} />
        </Panel>

        <Panel id="report-status-summary">
          <PanelHeader icon="ti-list" title="Status summary" />
          <div style={{ padding: 14, display: "grid", gap: 10 }}>
            {statusCounts.map(status => (
              <div key={status.status} style={{ display: "flex", justifyContent: "space-between", background: "#fafafa", borderRadius: 10, padding: 10, fontSize: 12 }}>
                <span>{STATUS_LABELS[status.status] || status.status}</span>
                <strong>{status.count}</strong>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel id="report-document-detail">
        <PanelHeader icon="ti-file-description" title="Document detail report" badge={`${documentDetails.length} records`} />
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f8f8f7' }}>
                {['Record ID','Name','Dept','Status','Handler','Location','Updated Date','Actions'].map(header => (
                  <th key={header} style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid rgba(0,0,0,0.08)', color:'#444', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {documentDetails.map(row => (
                <tr key={row.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{row.id}</td>
                  <td style={{ padding: '10px 12px' }}>{row.name}</td>
                  <td style={{ padding: '10px 12px' }}>{row.dept}</td>
                  <td style={{ padding: '10px 12px' }}>{STATUS_LABELS[row.status] || row.status}</td>
                  <td style={{ padding: '10px 12px' }}>{row.handler}</td>
                  <td style={{ padding: '10px 12px' }}>{row.location}</td>
                  <td style={{ padding: '10px 12px' }}>{row.updated_at?.split(' ')[0] || '-'}</td>
                  <td style={{ padding: '10px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <BtnOutline small onClick={() => handleViewRecord(row.id)}>
                      <i className="ti ti-eye" style={{ fontSize: 12 }} /> View
                    </BtnOutline>
                    <BtnOutline small onClick={() => downloadRecordPdf(row)}>
                      <i className="ti ti-download" style={{ fontSize: 12 }} /> PDF
                    </BtnOutline>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel id="report-user-activity">
        <PanelHeader icon="ti-users" title="User activity" badge="Actions by handler" />
        <div style={{ padding: 14, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f8f8f7' }}>
                {['User','Actions','Approved','Rejected','Pending','Actions'].map(header => (
                  <th key={header} style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid rgba(0,0,0,0.08)', color:'#555' }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {userActivity.map(row => (
                <tr key={row.user} style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <td style={{ padding: '10px 12px' }}>{row.user}</td>
                  <td style={{ padding: '10px 12px' }}>{row.actions}</td>
                  <td style={{ padding: '10px 12px' }}>{row.approved}</td>
                  <td style={{ padding: '10px 12px' }}>{row.rejected}</td>
                  <td style={{ padding: '10px 12px' }}>{row.pending}</td>
                  <td style={{ padding: '10px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <BtnOutline small onClick={() => handleViewActivity(row)}>View</BtnOutline>
                    <BtnOutline small onClick={() => downloadActivityPdf(row)}>PDF</BtnOutline>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

    </div>
  );
}
