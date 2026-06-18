import { FormGroup, Input, Select, BtnGreen } from "../components/ui";
import { Panel, PanelHeader, ScanLine } from "./PageHelpers";
import { TEAL, TEAL_DARK, TEAL_LIGHT, BLUE, AMBER, AMBER_LIGHT, RED_LIGHT } from "../theme";

export function PageScanner() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 14 }}>
      <Panel>
        <PanelHeader icon="ti-camera" title="Camera scanner" badge="Live" />
        <div style={{ margin: 14, background: "rgba(0,0,0,0.32)", borderRadius: 12, padding: 28, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
          <div style={{ background: "white", borderRadius: 12, border: "0.5px solid rgba(0,0,0,0.1)", width: 310, overflow: "hidden" }}>
            <div style={{ padding: "11px 14px", borderBottom: "0.5px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", gap: 7 }}>
              <i className="ti ti-qrcode" style={{ fontSize: 15, color: TEAL }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: "#1a1a1a", flex: 1 }}>Point camera at QR sticker</span>
            </div>
            <div style={{ background: "#111", height: 160, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, position: "relative", overflow: "hidden" }}>
              <div style={{ width: 100, height: 100, border: `2px solid ${TEAL}`, borderRadius: 4, position: "relative" }}>
                {[
                  ["tl", "2px 0 0 2px"],
                  ["tr", "2px 2px 0 0"],
                  ["bl", "0 0 2px 2px"],
                  ["br", "0 2px 2px 0"],
                ].map(([k, br]) => (
                  <div key={k} style={{ position: "absolute", width: 14, height: 14, border: `2px solid #5DCAA5`, borderRadius: br, ...{ tl: { top: -2, left: -2, borderWidth: "2px 0 0 2px" }, tr: { top: -2, right: -2, borderWidth: "2px 2px 0 0" }, bl: { bottom: -2, left: -2, borderWidth: "0 0 2px 2px" }, br: { bottom: -2, right: -2, borderWidth: "0 2px 2px 0" } }[k] }} />
                ))}
                <ScanLine />
              </div>
              <span style={{ fontSize: 10, color: "#888" }}>Align QR code within frame</span>
            </div>
            <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 10, fontWeight: 500, color: TEAL_DARK, background: TEAL_LIGHT, padding: "3px 8px", borderRadius: 5, textAlign: "center" }}>Last scan successful</div>
              {[["Record ID","DOC-2026-0341",true],["Name","Contract Review Ph.3",false],["Location","Legal dept.",false],["Handler","Nimal Siriwardena",false]].map(([k,v,mono]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "#888" }}>{k}</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: mono ? BLUE : "#1a1a1a", fontFamily: mono ? "monospace" : "inherit" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: "0 14px 12px", display: "flex", gap: 8 }}>
              <button style={{ flex: 1, padding: 7, background: TEAL, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Update location</button>
              <button style={{ flex: 1, padding: 7, background: "transparent", border: "0.5px solid rgba(0,0,0,0.18)", borderRadius: 8, fontSize: 12, color: "#555", cursor: "pointer", fontFamily: "inherit" }}>Clear</button>
            </div>
          </div>
        </div>
      </Panel>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Panel>
          <PanelHeader icon="ti-keyboard" title="Manual entry" />
          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            <FormGroup label="Record ID"><Input placeholder="REC-2026-XXXX" mono /></FormGroup>
            <FormGroup label="New location"><Select options={["Legal","Finance","HR","Compliance","Procurement"]} /></FormGroup>
            <BtnGreen><i className="ti ti-check" style={{ fontSize: 14 }} />Update location</BtnGreen>
          </div>
        </Panel>
        <Panel>
          <PanelHeader icon="ti-history" title="Scan history" />
          {[ ["DOC-2026-0341","2 min · Legal"], ["DOC-2026-0338","1 hr · Compliance"], ["DOC-2026-0335","3 hrs · Finance"], ["DOC-2026-0332","Yesterday · HR"] ].map(([id, t], i) => (
            <div key={id} style={{ display: "flex", gap: 9, padding: "9px 14px", borderBottom: i < 3 ? "0.5px solid rgba(0,0,0,0.06)" : "none", alignItems: "center" }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: TEAL_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className="ti ti-scan" style={{ fontSize: 12, color: TEAL_DARK }} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#1a1a1a", fontFamily: "monospace" }}>{id}</div>
                <div style={{ fontSize: 10, color: "#aaa" }}>{t}</div>
              </div>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
}
