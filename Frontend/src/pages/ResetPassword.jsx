import { useEffect, useMemo, useState } from "react";
import { BtnGreen, BtnOutline } from "../components/ui";
import { resetPassword } from "../api";

export function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  const queryEmail = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("email") || "";
  }, []);

  useEffect(() => {
    setEmail(queryEmail);
  }, [queryEmail]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setResetSuccess(false);

    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, password);
      setMessage("Password updated successfully. You can now sign in with your new password.");
      setPassword("");
      setConfirmPassword("");
      setResetSuccess(true);
    } catch (err) {
      setError(err.message || "Unable to reset password.");
      setResetSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "linear-gradient(180deg, #f7efe0 0%, #ead6b8 55%, #f7f0e4 100%)" }}>
      <div style={{ width: "100%", maxWidth: 480, background: "white", borderRadius: 20, boxShadow: "0 24px 70px rgba(0,0,0,0.16)", padding: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: "#1f2937" }}>Reset your password</h2>
        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 18 }}>Enter your new password below.</p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>Email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@geomine.gov.lk" style={{ borderRadius: 12, border: "1px solid rgba(108,122,137,0.18)", padding: "12px 14px", fontSize: 14, outline: "none" }} />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>New password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password" style={{ borderRadius: 12, border: "1px solid rgba(108,122,137,0.18)", padding: "12px 14px", fontSize: 14, outline: "none" }} />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>Confirm password</span>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" style={{ borderRadius: 12, border: "1px solid rgba(108,122,137,0.18)", padding: "12px 14px", fontSize: 14, outline: "none" }} />
          </label>

          {error && <div style={{ color: "#b91c1c", fontSize: 13, padding: "8px 10px", borderRadius: 10, background: "#fee2e2" }}>{error}</div>}
          {message && (
            <div style={{ color: "#064e3b", fontSize: 13, padding: "8px 10px", borderRadius: 10, background: "#d1fae5", display: "grid", gap: 6 }}>
              <div>{message}</div>
              {resetSuccess && (
                <button
                  type="button"
                  onClick={() => window.location.href = "/login"}
                  style={{ border: "none", background: "#0f766e", color: "white", padding: "10px 12px", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}
                >
                  Go to login
                </button>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            {!resetSuccess && (
              <BtnOutline onClick={() => window.location.href = "/login"}>Cancel</BtnOutline>
            )}
            {!resetSuccess && (
              <BtnGreen disabled={loading} type="submit" style={{ minWidth: 140 }}>
                {loading ? "Updating..." : "Update password"}
              </BtnGreen>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
