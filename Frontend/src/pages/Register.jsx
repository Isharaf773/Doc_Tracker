import { useEffect, useState } from "react";
import { BtnGreen, BtnOutline, FormGroup, Input, Select } from "../components/ui";
import { Panel, PanelHeader, GeneratedQR } from "./PageHelpers";
import { TEAL, TEAL_DARK, TEAL_LIGHT, TEAL_TEXT, BLUE, BLUE_LIGHT, AMBER, AMBER_LIGHT, GRADIENT_TEAL } from "../theme";
import { createRecord, fetchUsers } from "../api";

export function PageRegister() {
  const todayValue = new Date().toISOString().slice(0, 10);
  const initialFormState = {
    senderName: "",
    senderEmail: "",
    documentName: "",
    senderDepartment: "Legal",
    date: todayValue,
    assignTo: "",
    assignedDepartment: "Geology",
    remarks: "",
    softCopy: null,
  };
  const [form, setForm] = useState(initialFormState);
  const [generated, setGenerated] = useState(null);
  const [lastRegistered, setLastRegistered] = useState(null);
  const [emailStatus, setEmailStatus] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);

  const updateForm = key => event => {
    setForm(current => ({ ...current, [key]: event.target.value }));
  };

  useEffect(() => {
    let isMounted = true;
    async function loadUsers() {
      setLoadingUsers(true);
      try {
        const data = await fetchUsers();
        if (isMounted) setUsers(data.users || []);
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setLoadingUsers(false);
      }
    }

    loadUsers();
    return () => { isMounted = false; };
  }, []);

  const filteredAssignees = users.filter(u => {
    const term = userSearch.trim().toLowerCase();
    return !term || [u.name, u.email, u.department, u.category, u.role]
      .some(field => (field || "").toLowerCase().includes(term));
  });

  const selectAssignee = (user) => {
    setForm(current => ({
      ...current,
      assignTo: user.name,
    }));
    setUserSearch("");
  };

  const clearAssignTo = () => {
    setForm(current => ({ ...current, assignTo: "" }));
    setUserSearch("");
  };

  const clearForm = () => {
    setForm(initialFormState);
    setUserSearch("");
    setError("");
  };

  const registerRecord = async () => {
    if (!form.senderName.trim() || !form.senderEmail.trim() || !form.documentName.trim() || !form.senderDepartment.trim() || !form.date || !form.assignTo.trim() || !form.assignedDepartment.trim()) {
      setError("Please fill in all required fields: sender name, sender email, document name, sender department, date, assign to, and assigned department.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const data = await createRecord({
        name: form.documentName,
        senderName: form.senderName,
        senderEmail: form.senderEmail,
        dept: form.senderDepartment,
        assignedDepartment: form.assignedDepartment,
        dueDate: form.date,
        location: form.senderDepartment,
        status: "active",
        handler: form.assignTo,
        message: form.remarks,
        attachmentName: form.softCopy?.name || null,
      });

      const registered = {
        id: data.record.id,
        documentName: data.record.name,
        senderName: data.record.sender_name || data.record.senderName || form.senderName,
        senderEmail: data.record.sender_email || data.record.senderEmail || form.senderEmail,
        assignedDepartment: data.record.assigned_department || form.assignedDepartment,
        assignTo: data.record.handler || form.assignTo,
        dueDate: data.record.due_date || form.date,
        status: data.record.status || "active",
      };

      setGenerated({
        id: registered.id,
        email: registered.senderEmail,
        documentName: registered.documentName,
        sentAt: new Date().toLocaleString(),
      });
      setLastRegistered(registered);
      setEmailStatus(data.emailSent ? "Email sent to sender successfully." : `Email not sent: ${data.emailError || "No mail transport configured."}`);
      window.dispatchEvent(new Event("doctrack:notifications-updated"));
      window.dispatchEvent(new Event("doctrack:dashboard-refresh"));
      clearForm();
    } catch (err) {
      setError(err.message || "Unable to create record.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm(initialFormState);
    setUserSearch("");
    setGenerated(null);
    setEmailStatus("");
    setLastRegistered(null);
    setError("");
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 300px", gap: 14, alignItems: "start" }}>
      <Panel>
        <PanelHeader icon="ti-file-plus" title="Register new document" />
        <div style={{ padding: "16px 18px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <FormGroup label="Sender name"><Input value={form.senderName} onChange={updateForm("senderName")} placeholder="e.g. Nalini Fernando" /></FormGroup>
            <FormGroup label="Sender email"><Input value={form.senderEmail} onChange={updateForm("senderEmail")} type="email" placeholder="sender@gmail.com" /></FormGroup>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <FormGroup label="Document name"><Input value={form.documentName} onChange={updateForm("documentName")} placeholder="e.g. Contract Review Phase 3" /></FormGroup>
            <FormGroup label="Sender department"><Select options={["Geology","Mining","HR","Finance","Legal","Audit","IT","Media"]} value={form.senderDepartment} onChange={updateForm("senderDepartment")} /></FormGroup>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <FormGroup label="Date"><Input type="date" value={form.date} onChange={updateForm("date")} style={{ width: "100%" }} /></FormGroup>
            <FormGroup label="Assign to">
              <div style={{ position: "relative" }}>
                <Input
                  value={form.assignTo}
                  onChange={(e) => { setUserSearch(e.target.value); setForm(current => ({ ...current, assignTo: e.target.value })); }}
                  placeholder="Search user by name, email or role"
                  style={{ paddingRight: form.assignTo ? 32 : 11 }}
                />
                {form.assignTo && (
                  <button
                    type="button"
                    onClick={clearAssignTo}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "transparent",
                      color: "#888",
                      cursor: "pointer",
                      fontSize: 16,
                      lineHeight: 1,
                      padding: 2,
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
              {userSearch !== "" && (
                <div style={{ marginTop: 6, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 10, maxHeight: 210, overflowY: "auto", background: "white", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
                  {loadingUsers ? (
                    <div style={{ padding: 10, fontSize: 12, color: "#555" }}>Loading users…</div>
                  ) : filteredAssignees.length === 0 ? (
                    <div style={{ padding: 10, fontSize: 12, color: "#555" }}>No matching users.</div>
                  ) : filteredAssignees.map(u => (
                    <button
                      key={u.email}
                      type="button"
                      onClick={() => selectAssignee(u)}
                      style={{ width: "100%", textAlign: "left", padding: "10px 12px", border: "none", background: "transparent", cursor: "pointer", fontSize: 12, color: "#111" }}
                    >
                      <div style={{ fontWeight: 600 }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{u.email} · {u.role} · {u.department || u.category}</div>
                    </button>
                  ))}
                </div>
              )}
            </FormGroup>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <FormGroup label="Assigned department"><Select options={["Geology","Mining","HR","Finance","Legal","Audit","IT","Media"]} value={form.assignedDepartment} onChange={updateForm("assignedDepartment")} /></FormGroup>
            <FormGroup label="Soft copy (optional)">
              <input
                type="file"
                onChange={(e) => setForm(current => ({ ...current, softCopy: e.target.files?.[0] || null }))}
                style={{ width: "100%", padding: "8px 11px", border: "0.5px solid rgba(0,0,0,0.18)", borderRadius: 8, fontFamily: "inherit", background: "white" }}
              />
              {form.softCopy && <div style={{ marginTop: 6, fontSize: 12, color: "#555" }}>{form.softCopy.name}</div>}
            </FormGroup>
          </div>
          <div style={{ marginBottom: 12 }}>
            <FormGroup label="Message (optional)">
              <textarea value={form.remarks || ""} onChange={updateForm("remarks")} placeholder="Add a message to send with the email…" style={{ padding: "8px 11px", border: "0.5px solid rgba(0,0,0,0.18)", borderRadius: 8, fontSize: 12, fontFamily: "inherit", outline: "none", resize: "vertical", minHeight: 70, width: "100%", color: "#1a1a1a", background: "#fbfbfb" }} />
            </FormGroup>
          </div>
          {error && <div style={{ color: "#b91c1c", fontSize: 13, padding: "10px 12px", borderRadius: 10, background: "#fee2e2", marginBottom: 12 }}>{error}</div>}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 6, borderTop: "0.5px solid rgba(0,0,0,0.07)" }}>
            <BtnOutline onClick={resetForm}>Cancel</BtnOutline>
            <BtnGreen onClick={registerRecord} disabled={submitting}><i className="ti ti-qrcode" style={{ fontSize: 14 }} />{submitting ? "Registering…" : "Register & generate QR"}</BtnGreen>
          </div>
        </div>
      </Panel>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Panel>
          <PanelHeader icon="ti-qrcode" title="QR preview" />
          <div style={{ padding: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ width: 112, height: 112, border: "0.5px solid rgba(0,0,0,0.1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f8f7" }}>
              {generated ? <GeneratedQR value={generated.id} /> : <i className="ti ti-qrcode" style={{ fontSize: 44, color: "#ccc" }} />}
            </div>
            <div style={{ fontSize: 12, color: generated ? TEAL_DARK : "#888", textAlign: "center", fontWeight: generated ? 600 : 400 }}>
              {generated ? "QR generated and document created" : "Auto-generated on registration"}
            </div>
            <div style={{ fontSize: 11, fontFamily: "monospace", color: generated ? "#1a1a1a" : "#bbb" }}>{generated?.id || "REC-2026-XXXX"}</div>
            {generated && (
              <div style={{ width: "100%", marginTop: 8, borderTop: "0.5px solid rgba(0,0,0,0.08)", paddingTop: 10, display: "grid", gap: 6, fontSize: 11 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ color: "#888" }}>Sender email</span>
                  <span style={{ color: BLUE, fontWeight: 600, textAlign: "right" }}>{generated.email}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ color: "#888" }}>Status</span>
                  <span style={{ color: TEAL_DARK, fontWeight: 600 }}>Created</span>
                </div>
                {emailStatus && (
                  <div style={{ padding: "8px 10px", borderRadius: 10, background: emailStatus.toLowerCase().includes("sent") ? "#dcfce7" : "#fee2e2", color: emailStatus.toLowerCase().includes("sent") ? "#166534" : "#991b1b" }}>
                    {emailStatus}
                  </div>
                )}
              </div>
            )}
          </div>
        </Panel>
        <Panel>
          <PanelHeader icon="ti-list-check" title="Last registered" />
          <div style={{ padding: 14, display: "grid", gap: 10, minHeight: 180 }}>
            {lastRegistered ? (
              [
                ["Record ID", lastRegistered.id],
                ["Document", lastRegistered.documentName],
                ["Assigned to", lastRegistered.assignTo],
                ["Assigned dept", lastRegistered.assignedDepartment],
                ["Due date", lastRegistered.dueDate],
                ["Sender", lastRegistered.senderEmail],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "#888" }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a", textAlign: "right" }}>{value || "—"}</span>
                </div>
              ))
            ) : (
              <div style={{ color: "#666", fontSize: 12 }}>After registration, the saved record details will appear here while the form is cleared for a new entry.</div>
            )}
          </div>
        </Panel>
        <Panel>
          <PanelHeader icon="ti-info-circle" title="How it works" />
          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              [TEAL_LIGHT, TEAL_TEXT, "Fill in document details & submit"],
              [BLUE_LIGHT, BLUE, "System generates a unique QR sticker"],
              [AMBER_LIGHT, AMBER, "Print & attach sticker to document"],
              [TEAL_LIGHT, TEAL_TEXT, "Scan at each handoff to track location"],
            ].map(([bg, color, txt]) => (
              <div key={txt} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 500, color }}>{txt.indexOf("Fill") === 0 ? "1" : txt.indexOf("System") === 0 ? "2" : txt.indexOf("Print") === 0 ? "3" : "4"}</span>
                </div>
                <div style={{ fontSize: 12, color: "#666", paddingTop: 2 }}>{txt}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
