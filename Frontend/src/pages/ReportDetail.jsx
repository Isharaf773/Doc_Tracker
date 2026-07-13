import { useEffect, useState } from "react";
import { BtnGreen, BtnOutline } from "../components/ui";
import { STATUS_LABELS } from "./Reports";
import { fetchRecord, fetchReports } from "../api";

export function PageReportDetail({ detailType, recordId, user, onBack }) {
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState(null);
  const [activity, setActivity] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (detailType === "record") {
          const data = await fetchRecord(recordId);
          setRecord(data.record);
        } else if (detailType === "activity") {
          const data = await fetchReports({});
          const found = (data.userActivity || []).find(row => row.user === user);
          setActivity(found || null);
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load details.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [detailType, recordId, user]);

  const renderRecordDetail = () => {
    if (!record) return <div style={{ padding: 24 }}>Record not found.</div>;
    return (
      <div style={{ display: "grid", gap: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{record.name || record.id}</div>
            <div style={{ marginTop: 6, color: "#64748b" }}>{record.id}</div>
          </div>
          <BtnOutline onClick={onBack}>Back to reports</BtnOutline>
        </div>
        <div style={{ display: "grid", gap: 14, background: "#ffffff", borderRadius: 16, padding: 24, boxShadow: "0 18px 40px rgba(15,23,42,0.06)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 16 }}>
            {[
              ["Record ID", record.id],
              ["Department", record.dept],
              ["Status", STATUS_LABELS[record.status] || record.status],
              ["Handler", record.handler],
              ["Location", record.location],
              ["Priority", record.priority],
              ["Sender", record.sender_email],
              ["Created", record.created_at],
              ["Updated", record.updated_at],
              ["Due date", record.due_date || "N/A"],
            ].map(([label, value]) => (
              <div key={label} style={{ background: "#f8fafc", borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 14, color: "#111", fontWeight: 600 }}>{value || "-"}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 16 }}>
            {[
              ["Approved", record.approvedCount ?? 0],
              ["Rejected", record.rejectedCount ?? 0],
              ["Pending", record.pendingCount ?? 0],
            ].map(([label, value]) => (
              <div key={label} style={{ background: "#ffffff", borderRadius: 14, padding: 18, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>{label}</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderActivityDetail = () => {
    if (!activity) return <div style={{ padding: 24 }}>Activity not found.</div>;
    return (
      <div style={{ display: "grid", gap: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{activity.user}</div>
            <div style={{ marginTop: 6, color: "#64748b" }}>User activity detail</div>
          </div>
          <BtnOutline onClick={onBack}>Back to reports</BtnOutline>
        </div>
        <div style={{ display: "grid", gap: 14, background: "#ffffff", borderRadius: 16, padding: 24, boxShadow: "0 18px 40px rgba(15,23,42,0.06)" }}>
          {[
            ["Actions", activity.actions],
            ["Approved", activity.approved],
            ["Rejected", activity.rejected],
            ["Pending", activity.pending],
          ].map(([label, value]) => (
            <div key={label} style={{ background: "#f8fafc", borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const formatDateOnly = (value) => {
    if (!value) return "-";
    return String(value).split(" ")[0];
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{detailType === "record" ? "Record report detail" : "Activity report detail"}</div>
          <div style={{ color: "#64748b", marginTop: 6 }}>{detailType === "record" ? `Record ${recordId}` : `User ${user}`}</div>
        </div>
        <BtnGreen onClick={onBack}>Back to report list</BtnGreen>
      </div>
      {loading ? (
        <div style={{ padding: 24 }}>Loading details…</div>
      ) : error ? (
        <div style={{ padding: 24, color: "#dc2626" }}>{error}</div>
      ) : detailType === "record" ? (
        renderRecordDetail()
      ) : (
        renderActivityDetail()
      )}

      {record && detailType === "record" && (
        <div style={{ display: "grid", gap: 14, fontSize: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ background: "#f8fafc", borderRadius: 14, padding: 16, boxShadow: "inset 0 0 0 1px #e2e8f0" }}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Created</div>
              <div style={{ fontWeight: 600 }}>{formatDateOnly(record.created_at)}</div>
            </div>
            <div style={{ background: "#f8fafc", borderRadius: 14, padding: 16, boxShadow: "inset 0 0 0 1px #e2e8f0" }}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Updated</div>
              <div style={{ fontWeight: 600 }}>{formatDateOnly(record.updated_at)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
