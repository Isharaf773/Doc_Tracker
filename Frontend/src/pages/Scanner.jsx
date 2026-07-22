import { useState, useEffect, useRef } from "react";
import jsQR from "jsqr";
import { FormGroup, Input, Select, BtnGreen, BtnOutline } from "../components/ui";
import { Panel, PanelHeader, ScanLine } from "./PageHelpers";
import { TEAL, TEAL_DARK, TEAL_LIGHT, BLUE } from "../theme";
import { fetchRecord, updateRecordLocation, fetchJourney } from "../api";

const DEPARTMENT_OPTIONS = ["Geology", "Mining", "HR", "Finance", "Legal", "Audit", "IT", "Media", "Procurement", "Compliance", "Administration", "Board of Management", "Senior Management"];

export function PageScanner() {
  const [recordCode, setRecordCode] = useState("");
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newStatus, setNewStatus] = useState("active");
  const [comment, setComment] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [showUpdateOnly, setShowUpdateOnly] = useState(false);
  const [lookupMode, setLookupMode] = useState("code");
  const [updating, setUpdating] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const [lastScannedCode, setLastScannedCode] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [selectedAttachments, setSelectedAttachments] = useState([]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const attachmentInputRef = useRef(null);
  const scanFrameRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const stopQrScanner = () => {
    if (scanFrameRef.current) {
      cancelAnimationFrame(scanFrameRef.current);
      scanFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setScannerReady(false);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setScannerError("");
    setScannerReady(false);

    try {
      const imageBitmap = await createImageBitmap(file);
      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error("Unable to access internal canvas");
      }

      canvas.width = imageBitmap.width;
      canvas.height = imageBitmap.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Unable to draw image");
      ctx.drawImage(imageBitmap, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const decoded = jsQR(imageData.data, imageData.width, imageData.height);

      if (!decoded?.data) {
        throw new Error("No QR code detected in the uploaded image.");
      }

      const code = extractRecordCode(decoded.data.trim());
      if (!code) {
        throw new Error("Uploaded QR image did not contain a valid record code.");
      }

      setLastScannedCode(code);
      setRecordCode(code);
      await loadRecord(code);
    } catch (err) {
      setScannerError(err.message || "Unable to read uploaded QR image.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const extractRecordCode = (input) => {
    if (!input) return "";
    let code = String(input).trim();

    try {
      const url = new URL(code);
      const pathMatch = url.pathname.match(/\/track\/(.+)$/i);
      if (pathMatch) {
        return decodeURIComponent(pathMatch[1]);
      }
      const recordCodeParam = url.searchParams.get("recordCode") || url.searchParams.get("code");
      if (recordCodeParam) {
        return recordCodeParam;
      }
    } catch (err) {
      // not a URL, continue with raw value
    }

    const queryMatch = code.match(/[?&](?:recordCode|code)=([^&]+)/i);
    if (queryMatch) {
      return decodeURIComponent(queryMatch[1]);
    }

    return code;
  };

  const scanQrFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      scanFrameRef.current = requestAnimationFrame(scanQrFrame);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx || !video.videoWidth || !video.videoHeight) {
      scanFrameRef.current = requestAnimationFrame(scanQrFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const decoded = jsQR(imageData.data, imageData.width, imageData.height);

    if (decoded && decoded.data) {
      const scanned = decoded.data.trim();
      const code = extractRecordCode(scanned);
      if (code && code !== lastScannedCode) {
        setLastScannedCode(code);
        setRecordCode(code);
        stopQrScanner();
        await loadRecord(code);
        return;
      }
    }

    scanFrameRef.current = requestAnimationFrame(scanQrFrame);
  };

  const startQrScanner = async () => {
    setScannerError("");
    setScannerReady(false);
    stopQrScanner();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setScannerError("QR camera scanning is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      mediaStreamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();

        await new Promise((resolve) => {
          if (video.readyState >= 2) {
            resolve();
            return;
          }
          const onLoaded = () => {
            video.removeEventListener("loadedmetadata", onLoaded);
            resolve();
          };
          video.addEventListener("loadedmetadata", onLoaded);
        });

        setScannerReady(true);
        scanFrameRef.current = requestAnimationFrame(scanQrFrame);
      }
    } catch (err) {
      console.error(err);
      setScannerError("Unable to access camera for QR scanning.");
    }
  };

  useEffect(() => {
    if (lookupMode === "qr") {
      startQrScanner();
    } else {
      stopQrScanner();
      setScannerError("");
    }

    return () => {
      stopQrScanner();
    };
  }, [lookupMode]);

  const loadJourney = async (code) => {
    try {
      const data = await fetchJourney(code);
      setTransactions(data.journey || []);
      setShowAllTransactions(true);
    } catch (err) {
      console.error(err);
      setTransactions([]);
      setShowAllTransactions(false);
    }
  };

  const loadRecord = async (lookupCode) => {
    const code = String(lookupCode || recordCode).trim();
    if (!code) {
      setError("Please enter or scan a record code or document name first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await fetchRecord(code);
      setRecord(data.record);
      setNewLocation(data.record.location || "");
      setNewStatus(data.record.status || "active");
      setComment("");
      sessionStorage.setItem("doctrack_last_scanned", code);
      setShowUpdateOnly(false);
      await loadJourney(data.record.id || code);
      setShowAllTransactions(true);
    } catch (err) {
      setError(err.message || "Unable to load document.");
      setRecord(null);
      setNewLocation("");
      setTransactions([]);
      setShowAllTransactions(false);
    } finally {
      setLoading(false);
    }
  };

  const clearRecord = () => {
    setRecordCode("");
    setRecord(null);
    setError("");
    setNewLocation("");
    setNewStatus("active");
    setComment("");
    setTransactions([]);
    setShowAllTransactions(false);
    setShowUpdateOnly(false);
    setSelectedAttachments([]);
  };

  const saveLocation = async () => {
    if (!record) {
      setError("Load a record before updating status and location.");
      return;
    }
    if (!newLocation.trim()) {
      setError("Enter a department or location before saving.");
      return;
    }

    setUpdating(true);
    setError("");
    try {
      const data = await updateRecordLocation(record.id, {
        location: newLocation.trim(),
        status: newStatus || record.status,
        handler: record.handler,
        comment: comment.trim() || null,
      }, selectedAttachments);
      setRecord(data.record);
      setComment("");
      setSelectedAttachments([]);
      window.dispatchEvent(new Event("doctrack:notifications-updated"));
      window.dispatchEvent(new Event("doctrack:dashboard-refresh"));
      await loadJourney(record.id);
      setShowAllTransactions(true);
    } catch (err) {
      setError(err.message || "Unable to update document.");
    } finally {
      setUpdating(false);
    }
  };

  const visibleTransactions = showAllTransactions ? transactions : transactions.slice(-3);

  return (
    <div style={{ display: "grid", gap: 18, minWidth: 840 }}>
      <Panel>
        <PanelHeader icon="ti-camera" title="Document lookup & update" badge={record ? "Scanned" : "Live"} />
        <div style={{ margin: 14, borderRadius: 12, padding: 18, display: "grid", gap: 18 }}>
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ background: "rgba(0,0,0,0.06)", borderRadius: 18, minHeight: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 180, height: 180, border: `2px solid ${TEAL}`, borderRadius: 16, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ScanLine />
                <div style={{ position: "absolute", width: 104, height: 104, border: `2px dashed ${TEAL}`, borderRadius: 12 }} />
                <div style={{ position: "relative", zIndex: 1, color: record ? "#111" : "#888", textAlign: "center", fontSize: 12, padding: 8 }}>
                  {record ? "Document loaded" : "Scan QR or enter record code"}
                </div>
              </div>
            </div>

            <FormGroup label="Lookup method">
              <div style={{ display: "flex", gap: 10 }}>
                <BtnOutline
                  onClick={() => setLookupMode("code")}
                  style={{ flex: 1, borderColor: lookupMode === "code" ? "#5A4728" : "rgba(0,0,0,0.2)", color: lookupMode === "code" ? "#5A4728" : "#555", background: lookupMode === "code" ? "rgba(90, 71, 40, 0.08)" : "white" }}
                >
                  ID code
                </BtnOutline>
                <BtnOutline
                  onClick={() => setLookupMode("qr")}
                  style={{ flex: 1, borderColor: lookupMode === "qr" ? "#5A4728" : "rgba(0,0,0,0.2)", color: lookupMode === "qr" ? "#5A4728" : "#555", background: lookupMode === "qr" ? "rgba(90, 71, 40, 0.08)" : "white" }}
                >
                  Scan QR
                </BtnOutline>
              </div>
            </FormGroup>

            {lookupMode === "code" && (
              <FormGroup label="Lookup term">
                <Input
                  value={recordCode}
                  onChange={e => setRecordCode(e.target.value)}
                  placeholder="Enter full code, unique trailing digits, or document name"
                  mono
                />
              </FormGroup>
            )}

            {lookupMode === "qr" && (
              <div style={{ display: "grid", gap: 12, padding: 14, borderRadius: 14, background: "#f8fafc", border: "1px solid rgba(0,0,0,0.08)", color: "#444", fontSize: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>QR scanner mode</div>
                <div style={{ display: "grid", gap: 10 }}>
                  <div>Point your camera at the QR sticker or upload a saved QR image. The record code will then be loaded automatically.</div>
                  <div style={{ display: "grid", gap: 10 }}>
                    <div style={{ position: "relative", width: "100%", minHeight: 160, maxWidth: 320, borderRadius: 16, overflow: "hidden", background: "#111" }}>
                      <video
                        ref={videoRef}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        muted
                        playsInline
                      />
                      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", border: "2px solid rgba(255,255,255,0.3)", borderRadius: 16 }} />
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ flex: 1, minHeight: 36, borderRadius: 12, background: "white", padding: "10px 12px", fontSize: 12, color: "#333" }}>
                        {scannerError || (scannerReady ? "Searching for QR code…" : "Preparing camera…")}
                      </div>
                      <button
                        type="button"
                        onClick={startQrScanner}
                        style={{ borderRadius: 12, border: "1px solid rgba(90,71,40,0.18)", background: "white", color: "#5A4728", cursor: "pointer", padding: "0 14px", minHeight: 36, fontSize: 12, fontWeight: 700 }}
                      >
                        Restart
                      </button>
                    </div>
                    <div style={{ display: "grid", gap: 10 }}>
                      <label style={{ fontSize: 12, color: "#444", fontWeight: 600 }} htmlFor="qr-upload">Upload QR image or use device camera</label>
                      <input
                        ref={fileInputRef}
                        id="qr-upload"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileUpload}
                        style={{ padding: 10, background: "white", borderRadius: 12, border: "1px solid rgba(0,0,0,0.12)", cursor: "pointer" }}
                      />
                      <div style={{ fontSize: 12, color: "#556", lineHeight: 1.5 }}>
                        On mobile devices, choose camera when prompted to take a photo of the QR code.
                      </div>
                    </div>
                  </div>
                  {uploadedFileName && (
                    <div style={{ fontSize: 12, color: "#1f2937", background: "#ffffff", borderRadius: 12, padding: "10px 12px", border: "1px solid rgba(0,0,0,0.08)" }}>
                      Uploaded file: <strong>{uploadedFileName}</strong>
                    </div>
                  )}
                  {lastScannedCode && (
                    <div style={{ fontSize: 12, color: "#1f2937", background: "#ffffff", borderRadius: 12, padding: "10px 12px", border: "1px solid rgba(0,0,0,0.08)" }}>
                      Scanned code: <strong>{lastScannedCode}</strong>
                    </div>
                  )}
                  <canvas ref={canvasRef} style={{ display: "none" }} />
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <BtnGreen onClick={() => loadRecord()} disabled={loading} style={{ flex: 2, padding: "0 18px", minHeight: 44, borderRadius: 14, fontWeight: 700, letterSpacing: 0.3 }}>{loading ? "Loading…" : "Load document"}</BtnGreen>
              <button type="button" onClick={clearRecord} style={{ flex: 1, padding: "0 14px", borderRadius: 14, border: "1px solid rgba(90, 71, 40, 0.18)", background: "white", color: "#5A4728", cursor: "pointer", fontSize: 12, fontWeight: 700, minHeight: 44, boxShadow: "0 6px 18px rgba(90, 71, 40, 0.08)" }}>Clear</button>
            </div>
          </div>

          {error && <div style={{ padding: "10px 12px", borderRadius: 12, background: "#fee2e2", color: "#991b1b", fontSize: 12 }}>{error}</div>}

          {record && (
            <div style={{ display: "grid", gap: 18 }}>
              {!showUpdateOnly && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={{ padding: 14, borderRadius: 16, background: "#f8fafc" }}>
                      <div style={{ fontSize: 10, color: "#888", marginBottom: 6 }}>Record code</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: BLUE, fontFamily: "monospace" }}>{record.id}</div>
                    </div>
                    <div style={{ padding: 14, borderRadius: 16, background: "#f8fafc" }}>
                      <div style={{ fontSize: 10, color: "#888", marginBottom: 6 }}>Status</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: record.status === "active" ? TEAL_DARK : "#333" }}>{record.status}</div>
                    </div>
                  </div>

                  <div style={{ padding: 14, borderRadius: 16, background: "white", boxShadow: "0 16px 34px rgba(15,23,42,0.05)" }}>
                    <div style={{ fontSize: 10, color: "#888", marginBottom: 8 }}>Document name</div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>{record.name}</div>
                    <div style={{ display: "grid", gap: 10 }}>
                      {[
                        ["Assigned to", record.handler],
                        ["Department", record.dept],
                        ["Current location", record.location],
                        ["Due date", record.due_date || "�"],
                        ["Sender email", record.sender_email],
                      ].map(([label, value]) => (
                        <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                          <span style={{ fontSize: 10, color: "#888" }}>{label}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a", textAlign: "right" }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div style={{ padding: 14, borderRadius: 16, background: "#f9fafb", display: "grid", gap: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#111" }}>Update current situation</div>
                <FormGroup label="Current department">
                  <Select
                    options={DEPARTMENT_OPTIONS}
                    value={newLocation}
                    onChange={e => setNewLocation(e.target.value)}
                  />
                </FormGroup>
                <FormGroup label="Status">
                  <Select
                    options={["active", "transit", "pending", "approved", "rejected", "archived"]}
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value)}
                  />
                </FormGroup>
                <FormGroup label="Comment (optional)">
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Add a note for this transaction"
                    style={{ width: "100%", minHeight: 90, padding: "8px 11px", border: "0.5px solid rgba(0,0,0,0.18)", borderRadius: 8, fontFamily: "inherit", fontSize: 12, outline: "none", resize: "vertical", background: "white", color: "#1a1a1a" }}
                  />
                </FormGroup>
                <FormGroup label="Attach documents (optional)">
                  <div style={{ display: "grid", gap: 10 }}>
                    <input
                      ref={attachmentInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setSelectedAttachments(prev => [...prev, ...files]);
                      }}
                      style={{ display: "none" }}
                    />
                    <button
                      type="button"
                      onClick={() => attachmentInputRef.current?.click()}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: "1.5px dashed rgba(90,71,40,0.3)",
                        background: "rgba(90,71,40,0.05)",
                        color: "#5A4728",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                        textAlign: "center",
                        transition: "all 0.2s"
                      }}
                      onMouseOver={(e) => {
                        e.target.style.background = "rgba(90,71,40,0.1)";
                        e.target.style.borderColor = "rgba(90,71,40,0.5)";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = "rgba(90,71,40,0.05)";
                        e.target.style.borderColor = "rgba(90,71,40,0.3)";
                      }}
                    >
                      📎 Add PDF or photo documents
                    </button>
                    {selectedAttachments.length > 0 && (
                      <div style={{ fontSize: 12, color: "#666" }}>
                        <div style={{ marginBottom: 6, fontWeight: 600 }}>{selectedAttachments.length} file{selectedAttachments.length !== 1 ? "s" : ""} selected:</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {selectedAttachments.map((file, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "6px 10px",
                                background: "#E8F5E9",
                                borderRadius: 6,
                                fontSize: 11
                              }}
                            >
                              <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)</span>
                              <button
                                type="button"
                                onClick={() => setSelectedAttachments(prev => prev.filter((_, i) => i !== idx))}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  color: "#D23F37",
                                  fontSize: 14,
                                  padding: 0,
                                  lineHeight: 1
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </FormGroup>
                <div style={{ display: "flex", gap: 10 }}>
                  <BtnGreen onClick={saveLocation} disabled={!record || updating} style={{ flex: 2, minHeight: 44, borderRadius: 14, padding: "0 18px", fontWeight: 700 }}>{updating ? "Saving…" : "Save update"}</BtnGreen>
                  <button type="button" onClick={() => { clearRecord(); }} style={{ flex: 1, minHeight: 44, padding: "0 14px", borderRadius: 14, border: "1px solid rgba(90,0,0,0.12)", background: "white", color: "#D23F37", cursor: "pointer", fontSize: 12, fontWeight: 700, boxShadow: "0 8px 18px rgba(210,63,55,0.08)" }}>Reset</button>
                </div>
              </div>

              {!showUpdateOnly && (
                <div style={{ padding: 14, borderRadius: 16, background: "#ffffff", boxShadow: "0 16px 34px rgba(15,23,42,0.05)", display: "grid", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#111" }}>Transaction history</div>
                    {transactions.length > 3 && (
                      <button
                        type="button"
                        onClick={() => setShowAllTransactions(prev => !prev)}
                        style={{ padding: "8px 12px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.12)", background: "white", color: "#111", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                      >
                        {showAllTransactions ? "Hide old" : "Show all"}
                      </button>
                    )}
                  </div>
                  <div style={{ display: "grid", gap: 10 }}>
                    {transactions.length ? visibleTransactions.map((step, index) => (
                      <div key={`${step.action}-${index}`} style={{ padding: 12, borderRadius: 14, background: "#f8fafc" }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a", marginBottom: 6 }}>{step.action}</div>
                        <div style={{ fontSize: 11, color: "#555", marginBottom: 8 }}>{step.meta}</div>
                        <div style={{ fontSize: 10, color: "#888" }}>{step.done ? "Completed" : "Pending"}</div>
                      </div>
                    )) : (
                      <div style={{ color: "#666", fontSize: 12 }}>Transaction history will appear here after scanning a document.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
