import React, { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import "./User_Dashboard.css";

function UserProfile({ user, onLogout }) {
  const [teamUsers, setTeamUsers] = useState([]);
  const [deleteMessage, setDeleteMessage] = useState("");

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

      <div className="profile-top">

        <div className="profile-card">
          <div className="profile-avatar">
            <FaUserCircle />
          </div>

          <h2>{user?.name || "Arshiya"}</h2>
          <p>Administrator</p>

          <button className="edit-profile">
            Edit Profile
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
                transition: "background 0.2s ease"
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

      <div className="account-info">
        <h3>Account Information</h3>
        <p>Your account details</p>

        <div className="info-grid">

          <div>
            <span>Full Name</span>
            <strong>{user?.name || "Arshiya"}</strong>
          </div>

          <div>
            <span>Email</span>
            <strong>{user?.email || "arshiya@cyberdefence.com"}</strong>
          </div>

          <div>
            <span>Role</span>
            <strong>{user?.role || "Administrator"}</strong>
          </div>

          <div>
            <span>Account Status</span>
            <strong className="secure">Active</strong>
          </div>

          <div>
            <span>Last Login</span>
            <strong>Today</strong>
          </div>

          <div>
            <span>Member Since</span>
            <strong>2026</strong>
          </div>

        </div>
      </div>

      {/* TEAM ACCOUNTS & ID MANAGEMENT */}
      <div className="account-info" style={{ marginTop: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h3>Team Accounts & Registered IDs ({teamUsers.length})</h3>
            <p>Teammates registered in the MongoDB database</p>
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
              fontSize: "12px"
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
              <tr style={{ background: "rgba(100, 116, 139, 0.1)", textAlign: "left" }}>
                <th style={{ padding: "10px", borderRadius: "6px 0 0 6px" }}>Name</th>
                <th style={{ padding: "10px" }}>Email</th>
                <th style={{ padding: "10px" }}>Role</th>
                <th style={{ padding: "10px", textAlign: "right", borderRadius: "0 6px 6px 0" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {teamUsers.map((u) => (
                <tr key={u._id} style={{ borderBottom: "1px solid rgba(100, 116, 139, 0.15)" }}>
                  <td style={{ padding: "12px 10px", fontWeight: "600" }}>{u.name}</td>
                  <td style={{ padding: "12px 10px", color: "#64748b" }}>{u.email}</td>
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
                        fontWeight: "600"
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