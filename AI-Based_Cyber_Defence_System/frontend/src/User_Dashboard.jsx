import React, { useEffect, useState } from "react";
import { FaUserCircle, FaTimes, FaSave, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import "./User_Dashboard.css";

function UserProfile({ user, onLogout, onUpdateUser }) {
  const [teamUsers, setTeamUsers] = useState([]);
  const [deleteMessage, setDeleteMessage] = useState("");

  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "Administrator",
    password: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [editSuccess, setEditSuccess] = useState("");
  const [editError, setEditError] = useState("");

  const fetchUsers = () => {
    fetch("http://localhost:5000/api/auth/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setTeamUsers(data.users || []);
        }
      })
      .catch((err) => console.error("Error fetching users:", err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenEdit = () => {
    setEditFormData({
      name: user?.name || "Arshiya",
      email: user?.email || "arshiya@cyberdefence.com",
      role: user?.role || "Administrator",
      password: "",
    });
    setEditError("");
    setEditSuccess("");
    setIsEditing(true);
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
    setEditError("");
    setEditSuccess("");
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editFormData.name.trim() || !editFormData.email.trim()) {
      setEditError("Full name and email are required.");
      return;
    }

    setIsSaving(true);
    setEditError("");
    setEditSuccess("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentEmail: user?.email || "arshiya@cyberdefence.com",
          name: editFormData.name.trim(),
          email: editFormData.email.trim(),
          role: editFormData.role,
          password: editFormData.password.trim(),
        }),
      });

      const data = await res.json();

      if (data.status === "success") {
        setEditSuccess("Profile updated successfully in MongoDB!");
        if (onUpdateUser && data.user) {
          onUpdateUser(data.user);
        }
        fetchUsers();
        setTimeout(() => {
          setIsEditing(false);
          setEditSuccess("");
        }, 1200);
      } else {
        setEditError(data.message || "Failed to update profile.");
      }
    } catch (err) {
      setEditError("Server connection error while updating profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete account ID for "${userName}"?`)) {
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/auth/users/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.status === "success") {
        setDeleteMessage(`Account ID for "${userName}" deleted successfully.`);
        fetchUsers();
        setTimeout(() => setDeleteMessage(""), 3000);
      } else {
        alert(data.message || "Failed to delete user.");
      }
    } catch (err) {
      alert("Error deleting user account.");
    }
  };

  return (
    <div className="profile-dashboard">

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(5px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              color: "#0f172a",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
              overflow: "hidden",
              animation: "fadeIn 0.2s ease-in-out",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 24px",
                borderBottom: "1px solid #e2e8f0",
                background: "#f8fafc",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>
                  ✏️ Edit Profile
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#000000", fontWeight: "700" }}>
                  Update your credentials stored in MongoDB
                </p>
              </div>
              <button
                onClick={handleCloseEdit}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                  color: "#64748b",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveProfile} style={{ padding: "24px" }}>
              {editError && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 14px",
                    background: "#fef2f2",
                    color: "#dc2626",
                    borderRadius: "8px",
                    marginBottom: "16px",
                    fontSize: "13px",
                    border: "1px solid #fecaca",
                  }}
                >
                  <FaExclamationCircle />
                  <span>{editError}</span>
                </div>
              )}

              {editSuccess && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 14px",
                    background: "#f0fdf4",
                    color: "#16a34a",
                    borderRadius: "8px",
                    marginBottom: "16px",
                    fontSize: "13px",
                    border: "1px solid #bbf7d0",
                  }}
                >
                  <FaCheckCircle />
                  <span>{editSuccess}</span>
                </div>
              )}

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                  Role in Cyber Defence System
                </label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Security Analyst">Security Analyst</option>
                  <option value="Auditor">Auditor</option>
                </select>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                  Change Password <span style={{ color: "#94a3b8", fontWeight: "normal" }}>(Optional)</span>
                </label>
                <input
                  type="password"
                  placeholder="Leave blank to keep unchanged"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  disabled={isSaving}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#475569",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 22px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#2563eb",
                    color: "#ffffff",
                    fontWeight: "600",
                    cursor: isSaving ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                  }}
                >
                  <FaSave />
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOP PROFILE SECTION */}
      <div className="profile-top">

        <div className="profile-card">
          <div className="profile-avatar">
            <FaUserCircle />
          </div>

          <h2>{user?.name || "Arshiya"}</h2>
          <p>{user?.role || "Administrator"}</p>

          <button
            className="edit-profile"
            onClick={handleOpenEdit}
            style={{
              cursor: "pointer",
              transition: "transform 0.15s ease, background 0.2s ease",
            }}
          >
            ✏️ Edit Profile
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              style={{
                marginTop: "12px",
                background: "#ef4444",
                color: "#ffffff",
                border: "none",
                padding: "10px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                width: "100%",
                transition: "background 0.2s ease",
              }}
            >
              Sign Out
            </button>
          )}
        </div>

        <div className="security-overview">
          <h3>Security Overview</h3>

          <div className="security-item">
            <span>🛡️ Security Score</span>
            <strong>94%</strong>
          </div>

          <div className="security-item">
            <span>🔐 Account Status</span>
            <strong className="secure">Secure</strong>
          </div>

          <div className="security-item">
            <span>🚨 Threats Detected</span>
            <strong>12</strong>
          </div>

          <div className="security-item">
            <span>📊 Security Level</span>
            <strong className="secure">High</strong>
          </div>
        </div>

      </div>

      {/* ACCOUNT INFORMATION CARD */}
      <div className="account-info">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3>Account Information</h3>
            <p style={{ color: "#1e293b", margin: 0, fontWeight: "500" }}>Your account credentials and security role</p>
          </div>
          <button
            onClick={handleOpenEdit}
            style={{
              background: "rgba(37, 99, 235, 0.1)",
              color: "#2563eb",
              border: "1px solid #2563eb",
              padding: "6px 14px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "13px",
            }}
          >
            Edit
          </button>
        </div>

        <div className="info-grid">

          <div>
            <span style={{ color: "#1e293b", fontWeight: "600" }}>Full Name</span>
            <strong>{user?.name || "Arshiya"}</strong>
          </div>

          <div>
            <span style={{ color: "#1e293b", fontWeight: "600" }}>Email</span>
            <strong>{user?.email || "arshiya@cyberdefence.com"}</strong>
          </div>

          <div>
            <span style={{ color: "#1e293b", fontWeight: "600" }}>Role</span>
            <strong style={{ color: "#2563eb" }}>{user?.role || "Administrator"}</strong>
          </div>

          <div>
            <span style={{ color: "#1e293b", fontWeight: "600" }}>Account Status</span>
            <strong className="secure">Active</strong>
          </div>

          <div>
            <span style={{ color: "#1e293b", fontWeight: "600" }}>Last Login</span>
            <strong>Today</strong>
          </div>

          <div>
            <span style={{ color: "#1e293b", fontWeight: "600" }}>Member Since</span>
            <strong>2026</strong>
          </div>

        </div>
      </div>

      {/* TEAM ACCOUNTS & ID MANAGEMENT */}
      <div className="account-info" style={{ marginTop: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h3>Team Accounts & Registered IDs ({teamUsers.length})</h3>
            <p style={{ color: "#1e293b", margin: 0, fontWeight: "500" }}>Teammates registered in the MongoDB database</p>
          </div>
          <button
            onClick={fetchUsers}
            style={{
              background: "rgba(37, 99, 235, 0.15)",
              color: "#2563eb",
              border: "1px solid #2563eb",
              padding: "6px 14px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "12px",
            }}
          >
            Refresh IDs
          </button>
        </div>

        {deleteMessage && (
          <div style={{ padding: "10px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", borderRadius: "6px", margin: "12px 0", fontSize: "13px" }}>
            {deleteMessage}
          </div>
        )}

        <div style={{ overflowX: "auto", marginTop: "16px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: "rgba(100, 116, 139, 0.1)", textAlign: "left", color: "#000000", fontWeight: "700" }}>
                <th style={{ padding: "10px", borderRadius: "6px 0 0 6px", color: "#000000", fontWeight: "700" }}>Name</th>
                <th style={{ padding: "10px", color: "#000000", fontWeight: "700" }}>Email</th>
                <th style={{ padding: "10px", color: "#000000", fontWeight: "700" }}>Role</th>
                <th style={{ padding: "10px", textAlign: "right", borderRadius: "0 6px 6px 0", color: "#000000", fontWeight: "700" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {teamUsers.map((u) => (
                <tr key={u._id} style={{ borderBottom: "1px solid rgba(100, 116, 139, 0.15)" }}>
                  <td style={{ padding: "12px 10px", fontWeight: "700", color: "#000000" }}>{u.name}</td>
                  <td style={{ padding: "12px 10px", color: "#000000", fontWeight: "700" }}>{u.email}</td>
                  <td style={{ padding: "12px 10px" }}>
                    <span style={{ padding: "3px 8px", background: "rgba(37, 99, 235, 0.1)", color: "#2563eb", borderRadius: "4px", fontSize: "12px" }}>
                      {u.role || "Analyst"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 10px", textAlign: "right" }}>
                    <button
                      onClick={() => handleDeleteUser(u._id, u.name)}
                      style={{
                        background: "rgba(239, 68, 68, 0.1)",
                        color: "#ef4444",
                        border: "1px solid #ef4444",
                        padding: "5px 10px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      Delete ID
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="activity-panel" style={{ marginTop: "24px" }}>
        <h3>Recent Security Activity</h3>
        <p>Latest activity on your account</p>

        <div className="activity">
          <span>📁</span>
          <div>
            <strong>Dataset Uploaded</strong>
            <small>Network traffic dataset was uploaded</small>
          </div>
          <label>Today</label>
        </div>

        <div className="activity">
          <span>🚨</span>
          <div>
            <strong>Threat Detected</strong>
            <small>AI detected suspicious network activity</small>
          </div>
          <label>Today</label>
        </div>

        <div className="activity">
          <span>🛡️</span>
          <div>
            <strong>Security Scan Completed</strong>
            <small>Network security scan completed successfully</small>
          </div>
          <label>Yesterday</label>
        </div>

      </div>

    </div>
  );
}

export default UserProfile;