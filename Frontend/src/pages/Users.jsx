import { useEffect, useState } from "react";
import { BtnGreen, BtnOutline } from "../components/ui";
import { Panel, PanelHeader } from "./PageHelpers";
import { PURPLE_LIGHT, PURPLE, TEAL_LIGHT, TEAL_TEXT } from "../theme";
import { Select } from "../components/ui";
import { fetchUsers } from "../api";
import { AddUserModal } from "../components/AddUserModal";

export function PageUsers({ nav, routeParams = {} }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalCategory, setModalCategory] = useState("");
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All roles");
  const [categoryFilter, setCategoryFilter] = useState("All categories");

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(""), 10000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data.users || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (isMounted) await loadUsers();
    }
    load();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (routeParams.category) {
      setCategoryFilter(routeParams.category);
    }
  }, [routeParams]);

  const boardMembers = users.filter(u => u.category === "Board of Management");
  const seniorMembers = users.filter(u => u.category === "Senior Management");

  const handleUserAdded = () => {
    setSelectedUser(null);
    setSuccessMessage("");
    setErrorMessage("");
    loadUsers();
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const showDeleteConfirmation = (user) => {
    setDeleteCandidate(user);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleDeleteUser = async () => {
    if (!deleteCandidate) return;

    try {
      const { deleteUser } = await import("../api.js");
      await deleteUser(deleteCandidate.email);
      setSuccessMessage(`${deleteCandidate.name} deleted successfully.`);
      setDeleteCandidate(null);
      loadUsers();
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "Unable to delete user.");
    }
  };

  const cancelDelete = () => {
    setDeleteCandidate(null);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (u.department || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (u.category || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "All roles" || u.role.toLowerCase() === roleFilter.toLowerCase();
    const matchesCategory = categoryFilter === "All categories" || (u.category || "") === categoryFilter;
    return matchesSearch && matchesRole && matchesCategory;
  });

  const noUsersFound = !loading && filteredUsers.length === 0;

  return (
    <div>
      <AddUserModal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setSelectedUser(null);
          setModalCategory("");
        }}
        selectedUser={selectedUser}
        onSuccess={handleUserAdded}
        type="user"
        initialCategory={modalCategory}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div>
          <Panel>
            <PanelHeader icon="ti-users" title="Board of Management" action={`View all (${boardMembers.length}) →`} onAction={() => setCategoryFilter("Board of Management")} />
            <div style={{ padding: 14, display: "grid", gap: 10 }}>
              {(boardMembers.slice(0, 3)).map((member, index) => (
                <div key={member.email || index} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 14, background: "rgba(15,23,42,0.03)" }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#9FE1CB", display: "grid", placeItems: "center", color: "#0F6E56", fontSize: 12, fontWeight: 600 }}>{(member.name || "").split(" ").map(w => w[0]).slice(0, 2).join("")}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1F2937" }}>{member.name}</div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>{member.department}</div>
                  </div>
                </div>
              ))}
              {boardMembers.length === 0 && <div style={{ color: "#64748B", fontSize: 12 }}>No board members available.</div>}
            </div>
          </Panel>
        </div>
        <div>
          <Panel>
            <PanelHeader icon="ti-building-bank" title="Senior Management" action={`View all (${seniorMembers.length}) →`} onAction={() => setCategoryFilter("Senior Management")} />
            <div style={{ padding: 14, display: "grid", gap: 10 }}>
              {(seniorMembers.slice(0, 3)).map((member, index) => (
                <div key={member.email || index} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 14, background: "rgba(15,23,42,0.03)" }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#B5D4F4", display: "grid", placeItems: "center", color: "#0C447C", fontSize: 12, fontWeight: 600 }}>{(member.name || "").split(" ").map(w => w[0]).slice(0, 2).join("")}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1F2937" }}>{member.name}</div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>{member.department}</div>
                  </div>
                </div>
              ))}
              {seniorMembers.length === 0 && <div style={{ color: "#64748B", fontSize: 12 }}>No senior managers available.</div>}
            </div>
          </Panel>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, background: "#111", border: "0.5px solid rgba(255,255,255,0.14)", borderRadius: 8, padding: "6px 11px", width: 250 }}>
          <i className="ti ti-search" style={{ fontSize: 13, color: "#fff" }} />
          <input 
            placeholder="Search name, email or department…" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: "none", background: "transparent", color: "#fff", fontSize: 12, outline: "none", fontFamily: "inherit", width: "100%" }} 
          />
        </div>
        <Select 
          options={["All roles", "Admin", "Staff"]} 
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ width: 120 }} 
        />
        <Select
          options={["All categories", "Board of Management", "Senior Management"]}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ width: 170 }}
        />
        <BtnOutline small onClick={() => { setSelectedUser(null); setModalCategory("Board of Management"); setShowUserModal(true); }} style={{ minWidth: 190 }}>
          <i className="ti ti-user-plus" style={{ fontSize: 14 }} /> Add Board of Management
        </BtnOutline>
        <BtnOutline small onClick={() => { setSelectedUser(null); setModalCategory("Senior Management"); setShowUserModal(true); }} style={{ minWidth: 190 }}>
          <i className="ti ti-user-plus" style={{ fontSize: 14 }} /> Add Senior Management
        </BtnOutline>
        <BtnGreen small onClick={() => { setSelectedUser(null); setModalCategory(""); setShowUserModal(true); }} style={{ marginLeft: "auto" }}>
          <i className="ti ti-user-plus" style={{ fontSize: 14 }} /> Add user
        </BtnGreen>
      </div>
      {(successMessage || errorMessage || deleteCandidate) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          {successMessage && (
            <div style={{ padding: "12px 14px", borderRadius: 12, background: "#dcfce7", color: "#166534", border: "1px solid #86efac" }}>
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div style={{ padding: "12px 14px", borderRadius: 12, background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" }}>
              {errorMessage}
            </div>
          )}
          {deleteCandidate && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "14px 16px", borderRadius: 14, border: "1px solid #fca5a5", background: "#fff1f2", color: "#991b1b" }}>
              <div style={{ fontWeight: 700 }}>Delete user?</div>
              <div>Are you sure you want to delete <strong>{deleteCandidate.name}</strong> ({deleteCandidate.email}) from the user list?</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <BtnGreen onClick={handleDeleteUser} style={{ minWidth: 110, background: "#b91c1c", borderColor: "#b91c1c" }}>Yes, delete</BtnGreen>
                <BtnOutline onClick={cancelDelete}>Cancel</BtnOutline>
              </div>
            </div>
          )}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {noUsersFound ? (
          <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 180, background: "#fff4f4", border: "1px solid #f5c2c7", borderRadius: 14, color: "#991b1b", fontWeight: 600 }}>
            No users found.
          </div>
        ) : (filteredUsers.length ? filteredUsers : [
          { initials: "AK", bg: "#9FE1CB", col: "#0F6E56", name: "Amal Karunaratne", dept: "IT Department", role: "admin", docsCount: 142, scansCount: 89, online: true },
          { initials: "NS", bg: "#B5D4F4", col: "#0C447C", name: "Nimal Siriwardena", dept: "Legal Department", role: "staff", docsCount: 87, scansCount: 56, online: true },
          { initials: "KP", bg: "#FAC775", col: "#633806", name: "Kamani Perera", dept: "Finance Department", role: "staff", docsCount: 63, scansCount: 41, online: false },
          { initials: "RJ", bg: "#F5C4B3", col: "#712B13", name: "Ruwan Jayawardena", dept: "Procurement", role: "staff", docsCount: 54, scansCount: 38, online: false },
          { initials: "DM", bg: "#B5D4F4", col: "#0C447C", name: "Dilani Mendis", dept: "HR Department", role: "staff", docsCount: 48, scansCount: 29, online: true },
          { initials: "PF", bg: "#9FE1CB", col: "#0F6E56", name: "Priya Fernando", dept: "Compliance", role: "admin", docsCount: 71, scansCount: 52, online: false },
        ]).map(u => (
          <div key={u.email || u.name} style={{ background: "white", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: 12, padding: "13px 14px", display: "flex", gap: 11 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: u.bg || "#9FE1CB", color: u.col || "#0F6E56", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, flexShrink: 0 }}>{(u.name || "").split(" ").map(w => w[0]).slice(0, 2).join("")}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a" }}>{u.name}</span>
                <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 6, fontWeight: 500, background: u.role === "admin" ? PURPLE_LIGHT : TEAL_LIGHT, color: u.role === "admin" ? PURPLE : TEAL_TEXT }}>{u.role === "admin" ? "Admin" : "Staff"}</span>
              </div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
                {u.category ? `${u.category} · ` : ""}{u.department || u.dept}
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 7, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10, color: "#aaa" }}>Docs: <strong style={{ color: "#777" }}>{u.docsCount ?? u.docs}</strong></span>
                <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={() => handleEditUser(u)}
                    style={{ border: "1px solid #cbd5e1", borderRadius: 10, background: "white", color: "#334155", padding: "6px 10px", fontSize: 11, cursor: "pointer" }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => showDeleteConfirmation(u)}
                    style={{ border: "1px solid #f87171", borderRadius: 10, background: "#fef2f2", color: "#b91c1c", padding: "6px 10px", fontSize: 11, cursor: "pointer" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
