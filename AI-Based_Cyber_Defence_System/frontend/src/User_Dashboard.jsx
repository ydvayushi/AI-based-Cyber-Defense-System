import React from "react";
import { FaUserCircle } from "react-icons/fa";
import "./UserProfile.css";

function UserProfile() {
  return (
    <div className="profile-dashboard">

      <div className="profile-top">

        <div className="profile-card">
          <div className="profile-avatar">
            <FaUserCircle />
          </div>

          <h2>Security Analyst</h2>
          <p>Administrator</p>

          <button className="edit-profile">
            Edit Profile
          </button>
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
            <strong>High</strong>
          </div>
        </div>

      </div>

      <div className="account-info">
        <h3>Account Information</h3>
        <p>Your account details</p>

        <div className="info-grid">

          <div>
            <span>Full Name</span>
            <strong>Security Analyst</strong>
          </div>

          <div>
            <span>Email</span>
            <strong>analyst@cyberdefence.com</strong>
          </div>

          <div>
            <span>Role</span>
            <strong>Administrator</strong>
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

      <div className="activity-panel">
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