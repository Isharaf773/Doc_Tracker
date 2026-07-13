import { useEffect, useState } from "react";
import { FormGroup, Input, BtnGreen } from "../components/ui";
import { Panel, PanelHeader, StatCard } from "./PageHelpers";
import { TEAL, TEAL_DARK, TEAL_LIGHT, BLUE, BLUE_LIGHT } from "../theme";
import { fetchJourney } from "../api";

const FALLBACK_STEPS = [
  { done: true, action: "Received — Legal dept.", meta: "Nimal S. · Today 10:32 AM · \"For signature\"" },
  { done: true, action: "Dispatched — Finance dept.", meta: "Kamani P. · Today 9:14 AM · \"Reviewed & approved\"" },
  { done: true, action: "Received — Finance dept.", meta: "Priya F. · Yesterday 3:45 PM · \"Budget check\"" },
  { done: true, action: "Dispatched — Procurement", meta: "Ruwan J. · Yesterday 11:20 AM" },
  { done: true, action: "QR sticker generated", meta: "Admin · 3 Jun 2026 4:55 PM · Initial registration" },
  { done: false, action: "Awaiting final approval", meta: "Pending · CEO office" },
];

export function PageJourney() {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recordId, setRecordId] = useState(() => sessionStorage.getItem("doctrack_last_scanned") || "DOC-2026-0341");
  const [loadedId, setLoadedId] = useState(recordId);
  const [hasLoadedJourney, setHasLoadedJourney] = useState(false);

  const loadJourney = async (id) => {
    const trimmedId = id.trim();
    if (!trimmedId) {
      setError("Please enter a record ID to look up.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await fetchJourney(trimmedId);
      setSteps(data.journey || []);
      setLoadedId(trimmedId);
      setHasLoadedJourney(true);
    } catch (err) {
      setError(err.message || "Unable to load journey");
      setSteps([]);
      setHasLoadedJourney(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJourney(recordId);
  }, []);

  const journeySteps = hasLoadedJourney ? steps : FALLBACK_STEPS;
  const currentLocation = journeySteps[journeySteps.length - 1]?.action.split(" — ")[1] || "Legal dept.";
  const currentStatus = journeySteps.length && journeySteps[journeySteps.length - 1]?.done ? "Completed" : "In transit";

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 14 }}>
        <Panel>
          <PanelHeader icon="ti-route" title={`Journey — ${recordId}`} />
          <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column" }}>
            {loading && !steps.length && (
              <div style={{ color: "#4b5563", fontSize: 13, marginBottom: 12 }}>Loading journey data...</div>
            )}
            {error && (
              <div style={{ color: "#b91c1c", fontSize: 13, marginBottom: 12 }}>{error}</div>
            )}
            {journeySteps.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 12, paddingBottom: i < journeySteps.length - 1 ? 14 : 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.done ? TEAL : "#ddd", flexShrink: 0, marginTop: 3 }} />
                  {i < journeySteps.length - 1 && <div style={{ flex: 1, width: 1, background: "#e8e8e8", marginTop: 3 }} />}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: s.done ? "#1a1a1a" : "#aaa" }}>{s.action}</div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{s.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelHeader icon="ti-search" title="Look up journey" />
          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            <FormGroup label="Record ID">
              <Input
                value={recordId}
                onChange={(e) => setRecordId(e.target.value)}
                mono
                placeholder="Enter record ID"
              />
            </FormGroup>
            <BtnGreen onClick={() => loadJourney(recordId)} disabled={loading}>
              <i className="ti ti-route" style={{ fontSize: 14 }} />
              {loading ? "Loading…" : "Show journey"}
            </BtnGreen>
            <div style={{ borderTop: "0.5px solid rgba(0,0,0,0.08)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 7 }}>
              {[["Total stops", `${journeySteps.length}`], ["Current location", currentLocation], ["Status", currentStatus]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                  <span style={{ color: "#777" }}>{k}</span>
                  <span style={{ fontWeight: 500, color: k === "Current location" ? BLUE : k === "Status" ? BLUE : "#1a1a1a" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
