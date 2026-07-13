import { useEffect, useState } from "react";
import { BtnGreen } from "./ui";
import { GRADIENT_EARTH } from "../theme";
import { login, forgotPassword } from "../api";
import "./LoginPage.css";

const HOME_SLIDES = [
  "/home-slides/slide-1.png",
  "/home-slides/slide-2.png",
  "/home-slides/slide-3.png",
  "/home-slides/slide-4.png",
  "/home-slides/slide-5.png",
  "/home-slides/slide-6.png",
];

export function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const hasSessionUser = sessionStorage.getItem("doctrack_user");
    const hasPersistentUser = localStorage.getItem("doctrack_user");
    if (hasPersistentUser) {
      setRemember(true);
    } else if (hasSessionUser) {
      setRemember(false);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(current => (current + 1) % HOME_SLIDES.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async event => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, password);
      console.log("LoginPage: login response:", data);
      onLogin(data.user, remember);
    } catch (err) {
      console.error("LoginPage: login error:", err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async event => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your admin email address.");
      return;
    }

    setForgotLoading(true);
    try {
      const data = await forgotPassword(email);
      if (data.success) {
        setSuccess(data.message || "Password reset link has been sent to your registered email address.");
      } else {
        setError(data.message || "Email address not registered or invalid.");
      }
    } catch (err) {
      setError(err.message || "Unable to send password reset link.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleModeToggle = () => {
    setForgotMode(prev => !prev);
    setError("");
    setSuccess("");
    if (!forgotMode) {
      setPassword("");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "radial-gradient(circle at top left, rgba(20, 40, 50, 0.95), transparent 35%), linear-gradient(180deg, #11202c 0%, #1d3c54 50%, #7f6937 100%)" }}>
      <div style={{ width: "100%", maxWidth: 940, borderRadius: 24, overflow: "hidden", boxShadow: "0 45px 140px rgba(0,0,0,0.35)", background: "rgba(255,255,255,0.96)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "0.98fr 1.02fr", minHeight: 540, gap: 0 }}>
          <div className="home-slide-box">
            <div className="home-slide-stage" aria-hidden="true">
              {HOME_SLIDES.map((slide, index) => (
                <img
                  key={slide}
                  className={`home-slide-image ${index === activeSlide ? "is-active" : ""}`}
                  src={slide}
                  alt=""
                  draggable="false"
                />
              ))}
            </div>
            <div className="home-slide-overlay" />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.05em" }}>ADMIN ACCESS ONLY</div>
              <div style={{ marginTop: 18, fontSize: 16, lineHeight: 1.65, maxWidth: 420, color: "rgba(255,255,255,0.86)" }}>
                This portal is restricted to authorized GeoMine Bureau administrators. Unauthorized access is prohibited and monitored.
              </div>
            </div>
            <div style={{ display: "grid", rowGap: 16, position: "relative", zIndex: 1 }}>
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
            <div className="home-slide-dots" aria-label="Home image slideshow">
              {HOME_SLIDES.map((slide, index) => (
                <button
                  key={slide}
                  type="button"
                  className={index === activeSlide ? "is-active" : ""}
                  onClick={() => setActiveSlide(index)}
                  aria-label={`Show slide ${index + 1}`}
                />
              ))}
            </div>
            <div style={{ display: "flex", gap: 14, alignItems: "center", position: "relative", zIndex: 1 }}>
              <div style={{ width: 74, height: 74, borderRadius: 24, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.16)" }}>
                <div style={{ width: 50, height: 50, borderRadius: "50%", background: "#d1c58e" }} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#b4aa83" }}>GeoMine Bureau</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", marginTop: 6 }}>Restricted system access for admin workflows only.</div>
              </div>
            </div>
          </div>
          <div style={{ padding: 42, background: "#f5f1eb", display: "flex", flexDirection: "column", justifyContent: "center", gap: 22 }}>
            <div>
              <div className="brand-logo">
                <div className="mark">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#fff" opacity="0.95"/>
                  </svg>
                </div>
                <div className="title">GeoMine Admin Portal</div>
              </div>
              <div className="hero-sub">Sign in with your official bureau credentials.</div>
            </div>
            <form onSubmit={forgotMode ? handleForgotSubmit : handleSubmit} className="login-card">
              <div style={{ display: "grid", gap: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>Admin email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@geomine.gov.lk"
                  className="login-input"
                />
              </div>
              {!forgotMode && (
                <div style={{ display: "grid", gap: 12 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>Password</label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="login-input"
                      aria-label="Password"
                    />
                    <button type="button" className="pw-toggle" onClick={() => setShowPassword(s => !s)} aria-pressed={showPassword}>
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {forgotMode ? (
                  <button type="button" onClick={handleModeToggle} style={{ border: "none", background: "transparent", padding: 0, fontSize: 12, color: "#8B5D3E", cursor: "pointer", fontFamily: "inherit" }}>
                    Back to login
                  </button>
                ) : (
                  <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#64748b" }}>
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={e => setRemember(e.target.checked)}
                      style={{ accentColor: "#8B5D3E" }}
                    />
                    Keep me signed in
                  </label>
                )}
                <button type="button" onClick={handleModeToggle} style={{ border: "none", background: "transparent", padding: 0, fontSize: 12, color: "#8B5D3E", cursor: "pointer", fontFamily: "inherit" }}>
                  {forgotMode ? "Cancel" : "Forgot password?"}
                </button>
              </div>
              {error && <div className="info-pill error-pill">{error}</div>}
              {success && (
                <div className="info-pill success-pill">{success}</div>
              )}
              <BtnGreen disabled={forgotMode ? forgotLoading : loading} type="submit" style={{ width: "100%", justifyContent: "center", padding: "14px 18px", fontSize: 15, fontWeight: 800, background: 'linear-gradient(90deg,#2b7a78 0%, #5a8a5f 50%, #8abf6b 100%)', boxShadow: '0 10px 30px rgba(35,99,77,0.12)', borderRadius: 12 }}>
                {forgotMode ? (forgotLoading ? "Sending..." : "Send reset link") : (loading ? "Signing in..." : "Sign in")}
              </BtnGreen>
            </form>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#64748b", fontSize: 12 }}>
             
             
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
