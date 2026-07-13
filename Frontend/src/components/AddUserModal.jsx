import { useEffect, useState } from "react";
import { BtnGreen, BtnOutline, Input, FormGroup, Select } from "./ui";

const DEPARTMENT_OPTIONS = [
  "Geology",
  "Mining",
  "HR",
  "Finance",
  "Legal",
  "Audit",
  "IT",
  "Media",
];

const BOARD_POSITION_OPTIONS = [
  "",
  "Chairman",
  "Director General",
  "Member",
  "Board Secretary",
];

export function AddUserModal({ isOpen, onClose, onSuccess, type = "user", selectedUser, initialCategory = "" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    category: "",
    role: type === "user" ? "staff" : "admin",
    password: "",
    confirmPassword: "",
  });
  const isEdit = Boolean(selectedUser);
  const currentCategory = formData.category || initialCategory;
  const isBoardCategory = currentCategory === "Board of Management";
  const isSpecialCategory = isBoardCategory || currentCategory === "Senior Management";
  const modalTitle = isEdit
    ? "Update User"
    : currentCategory === "Board of Management"
      ? "Add Board of Management"
      : currentCategory === "Senior Management"
        ? "Add Senior Management"
        : type === "user"
          ? "Add New User"
          : "Add New Admin";

  useEffect(() => {
    if (selectedUser) {
      setFormData({
        name: selectedUser.name || "",
        email: selectedUser.email || "",
        department: selectedUser.department || "",
        category: selectedUser.category || "",
        role: selectedUser.role || "staff",
        password: "",
        confirmPassword: "",
      });
      setError("");
    } else {
      setFormData({
        name: "",
        email: "",
        department: "",
        category: initialCategory || "",
        role: type === "user" ? "staff" : "admin",
        password: "",
        confirmPassword: "",
      });
      setError("");
    }
  }, [selectedUser, type, initialCategory]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { createUser, createAdmin, updateUser } = await import("../api.js");

      if (!formData.name || !formData.email) {
        setError("Name and email are required.");
        setLoading(false);
        return;
      }

      if (!formData.department) {
        setError(isSpecialCategory ? "Position is required." : "Department is required.");
        setLoading(false);
        return;
      }

      const passwordRequired = formData.role === "admin" && (!selectedUser || selectedUser.role !== "admin");

      if (passwordRequired && !formData.password) {
        setError("Password is required for admin accounts.");
        setLoading(false);
        return;
      }

      if (formData.password && formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }

      if (selectedUser) {
        const updatePayload = {
          name: formData.name,
          role: formData.role,
          department: formData.department,
        category: formData.category || "",
        }

        await updateUser(selectedUser.email, updatePayload);
      } else if (type === "user") {
        if (formData.role === "admin") {
          await createAdmin({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            department: formData.department,
            category: formData.category || "",
          });
        } else {
          await createUser({
            name: formData.name,
            email: formData.email,
            department: formData.department,
            category: formData.category || "",
            role: formData.role,
          });
        }
      } else {
        if (!formData.password) {
          setError("Password is required for admin accounts.");
          setLoading(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match.");
          setLoading(false);
          return;
        }
        await createAdmin({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          department: formData.department,
          category: formData.category || "",
        });
      }

      onSuccess?.();
      setFormData({ name: "", email: "", department: "", category: "", role: type === "user" ? "staff" : "admin", password: "", confirmPassword: "" });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to add or update user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}>
      <div style={{
        background: "white",
        borderRadius: 12,
        padding: "20px 24px",
        maxWidth: 420,
        width: "90%",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "#1a1a1a" }}>
          {modalTitle}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            <FormGroup label="Full Name">
              <Input
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </FormGroup>

            <FormGroup label="Email Address">
              <Input
                type="email"
                placeholder="user@geomine.gov.lk"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                disabled={isEdit}
                style={isEdit ? { background: "#f3f4f6" } : undefined}
              />
            </FormGroup>

            <FormGroup label={isSpecialCategory ? "Position" : "Department"}>
              {isBoardCategory ? (
                <Select
                  options={BOARD_POSITION_OPTIONS}
                  value={formData.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                />
              ) : isSpecialCategory ? (
                <Input
                  placeholder="Enter position"
                  value={formData.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                />
              ) : (
                <Select
                  options={DEPARTMENT_OPTIONS}
                  value={formData.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                />
              )}
            </FormGroup>

            {type === "user" && (formData.role === "admin" || selectedUser?.role === "admin") && (
              <>
                <FormGroup label="Password">
                  <Input
                    type="password"
                    placeholder={selectedUser ? "Set password if promoting or changing admin password" : "Enter secure password"}
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                  />
                </FormGroup>
                <FormGroup label="Confirm Password">
                  <Input
                    type="password"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  />
                </FormGroup>
              </>
            )}

            <FormGroup label="Role">
              <Select
                options={type === "user" ? ["staff", "admin"] : ["admin", "superadmin"]}
                value={formData.role}
                onChange={(e) => handleChange("role", e.target.value)}
              />
            </FormGroup>
          </div>

          {error && (
            <div style={{
              padding: "8px 12px",
              background: "#FEE2E2",
              border: "0.5px solid #FCA5A5",
              borderRadius: 8,
              fontSize: 12,
              color: "#991B1B",
              marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <BtnOutline onClick={onClose}>Cancel</BtnOutline>
            <BtnGreen onClick={handleSubmit} disabled={loading} style={{ opacity: loading ? 0.6 : 1 }}>
              {loading ? (isEdit ? "Updating..." : "Saving...") : (isEdit ? "Update" : type === "user" ? "Add User" : "Add Admin")}
            </BtnGreen>
          </div>
        </form>
      </div>
    </div>
  );
}
