import { BtnGreen } from "./ui";
import { GRADIENT_EARTH } from "../theme";

export function LoginPage({ onLogin }) {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "radial-gradient(circle at top left, rgba(20, 40, 50, 0.95), transparent 35%), linear-gradient(180deg, #11202c 0%, #1d3c54 50%, #7f6937 100%)" }}>
      <div style={{ width: "100%", maxWidth: 940, borderRadius: 24, overflow: "hidden", boxShadow: "0 45px 140px rgba(0,0,0,0.35)", background: "rgba(255,255,255,0.96)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "0.98fr 1.02fr", minHeight: 540, gap: 0 }}>
          <div style={{ padding: 42, background: "#f5f1eb", display: "flex", flexDirection: "column", justifyContent: "center", gap: 22 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8B5D3E", marginBottom: 8 }}>Admin login section</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#1f2937" }}>GeoMine Admin Portal</div>
              <div style={{ marginTop: 10, fontSize: 13, color: "#6b7280" }}>Sign in with your official bureau credentials.</div>
            </div>
            <div style={{ display: "grid", gap: 16, padding: 22, borderRadius: 18, background: "white", boxShadow: "0 16px 34px rgba(15,23,42,0.08)" }}>
              <div style={{ display: "grid", gap: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>Admin email address</label>
                <input type="email" placeholder="admin@geomine.gov.lk" style={{ width: "100%", borderRadius: 12, border: "1px solid rgba(108,122,137,0.18)", padding: "14px 16px", fontSize: 14, outline: "none", fontFamily: "inherit", background: "#fbfbfb", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>Password</label>
                <input type="password" placeholder="Enter your password" style={{ width: "100%", borderRadius: 12, border: "1px solid rgba(108,122,137,0.18)", padding: "14px 16px", fontSize: 14, outline: "none", fontFamily: "inherit", background: "#fbfbfb", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#64748b" }}>
                  <input type="checkbox" style={{ accentColor: "#8B5D3E" }} /> Keep me signed in
                </label>
                <button type="button" style={{ border: "none", background: "transparent", padding: 0, fontSize: 12, color: "#8B5D3E", cursor: "pointer", fontFamily: "inherit" }}>Forgot password?</button>
              </div>
              <BtnGreen onClick={() => onLogin({ name: "Amal Karunaratne", email: "amal@geomine.gov.lk" })} style={{ width: "100%", justifyContent: "center", padding: "16px 20px", fontSize: 15, fontWeight: 700, background: GRADIENT_EARTH }}>Admin sign in</BtnGreen>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#64748b", fontSize: 12 }}>
              <span>Only authorized administrators may proceed.</span>
              <span>v1.0</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", background: "linear-gradient(180deg, #1f3a51 0%, #1d3c54 35%, #0f1b24 100%)", color: "white", padding: 42, position: "relative" }}>
            <div>
              <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.05em" }}>ADMIN ACCESS ONLY</div>
              <div style={{ marginTop: 18, fontSize: 16, lineHeight: 1.65, maxWidth: 420, color: "rgba(255,255,255,0.86)" }}>
                This portal is restricted to authorized GeoMine Bureau administrators. Unauthorized access is prohibited and monitored.
              </div>
            </div>
            <div style={{ display: "grid", rowGap: 16 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="ti ti-shield-check" style={{ fontSize: 18, color: "#d1c58e" }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>Secure admin portal</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", marginTop: 3 }}>Two-factor authentication enforced for all logins.</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="ti ti-lock" style={{ fontSize: 18, color: "#d1c58e" }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>Verified GeoMine staff only</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", marginTop: 3 }}>Access to registration, transit logs, and audits is limited to approved accounts.</div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 74, height: 74, borderRadius: 24, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.16)" }}>
                <div style={{ width: 50, height: 50, borderRadius: "50%", background: "#d1c58e" }} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#b4aa83" }}>GeoMine Bureau</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", marginTop: 6 }}>Restricted system access for admin workflows only.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
