import React, { useState } from "react";
import {
  FaCalendarAlt,
  FaDownload,
  FaShieldAlt,
  FaArrowUp,
  FaArrowDown,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
} from "react-icons/fa";
import "./NidsDashboard.css";

export default function NidsDashboard({
  alerts = [],
  datasetRows = [],
  datasetStats = null,
  modelStats = null,
  onNavigate = null,
  onExport = null,
}) {
  const [timeRange, setTimeRange] = useState("7 Days");

  // Default alerts data fallback matching reference UI
  const recentAlertsData = [
    {
      time: "May 20, 2024 14:32:21",
      type: "DDoS Attack",
      sourceIp: "192.168.1.105",
      destIp: "10.0.0.5",
      severity: "Critical",
      action: "Blocked",
    },
    {
      time: "May 20, 2024 14:31:45",
      type: "SQL Injection",
      sourceIp: "192.168.1.110",
      destIp: "10.0.0.8",
      severity: "High",
      action: "Blocked",
    },
    {
      time: "May 20, 2024 14:30:11",
      type: "Port Scan",
      sourceIp: "192.168.1.108",
      destIp: "10.0.0.15",
      severity: "Medium",
      action: "Logged",
    },
    {
      time: "May 20, 2024 14:29:33",
      type: "XSS Attack",
      sourceIp: "192.168.1.115",
      destIp: "10.0.0.12",
      severity: "Medium",
      action: "Blocked",
    },
    {
      time: "May 20, 2024 14:28:09",
      type: "Brute Force",
      sourceIp: "192.168.1.120",
      destIp: "10.0.0.20",
      severity: "Low",
      action: "Logged",
    },
  ];

  // Attack categories distribution matching reference screenshot
  const attackTypes = [
    { name: "DDoS Attack", pct: "32.6%", count: "802", color: "#3b82f6" },
    { name: "Port Scan", pct: "22.8%", count: "561", color: "#ef4444" },
    { name: "SQL Injection", pct: "18.3%", count: "450", color: "#eab308" },
    { name: "XSS Attack", pct: "12.7%", count: "312", color: "#10b981" },
    { name: "Brute Force", pct: "7.9%", count: "194", color: "#a855f7" },
    { name: "Others", pct: "5.7%", count: "139", color: "#06b6d4" },
  ];

  // Default handler for Export Report
  const handleExportClick = () => {
    if (onExport) {
      onExport();
      return;
    }
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
    let csv = `AI CYBER DEFENCE SYSTEM AUDIT REPORT\n`;
    csv += `Exported At: ${timestamp}\n`;
    csv += `Total Alerts: 2,458 | Critical: 156 | Blocked: 1,324\n\n`;
    csv += `Time,Attack Type,Source IP,Destination IP,Severity,Action Taken\n`;
    recentAlertsData.forEach((a) => {
      csv += `"${a.time}","${a.type}","${a.sourceIp}","${a.destIp}","${a.severity}","${a.action}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Cyber_Defence_Audit_Report_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="nids-container">
      {/* 1. TOP TITLE & CONTROLS BAR */}
      <div className="nids-top-bar">
        <div className="nids-title-area">
          <h2 className="nids-title">AI Cyber Defence System</h2>
        </div>

        <div className="nids-controls-area">
          <div className="nids-date-picker">
            <FaCalendarAlt />
            <span>May 14 - May 20, 2024</span>
          </div>

          <button className="nids-export-btn" onClick={handleExportClick}>
            <FaDownload />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 2. FIVE KPI METRIC CARDS ROW */}
      <div className="nids-kpi-grid">
        {/* Card 1: Total Alerts */}
        <div className="nids-kpi-card">
          <div className="nids-kpi-header">Total Alerts</div>
          <div className="nids-kpi-value-row">
            <span className="nids-kpi-value">2,458</span>
            <span className="nids-kpi-trend danger">▲ +12.5% vs last 7 days</span>
          </div>
          <svg className="nids-kpi-sparkline" viewBox="0 0 100 28" preserveAspectRatio="none">
            <path
              d="M0,22 Q15,8 30,18 T60,10 T85,19 T100,6"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2.5"
            />
          </svg>
        </div>

        {/* Card 2: Critical Alerts */}
        <div className="nids-kpi-card">
          <div className="nids-kpi-header">Critical Alerts</div>
          <div className="nids-kpi-value-row">
            <span className="nids-kpi-value">156</span>
            <span className="nids-kpi-trend danger">▲ +8.2% vs last 7 days</span>
          </div>
          <svg className="nids-kpi-sparkline" viewBox="0 0 100 28" preserveAspectRatio="none">
            <path
              d="M0,18 Q20,24 40,12 T70,20 T85,8 T100,14"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2.5"
            />
          </svg>
        </div>

        {/* Card 3: Blocked Attacks */}
        <div className="nids-kpi-card">
          <div className="nids-kpi-header">Blocked Attacks</div>
          <div className="nids-kpi-value-row">
            <span className="nids-kpi-value">1,324</span>
            <span className="nids-kpi-trend success">▲ +15.3% vs last 7 days</span>
          </div>
          <svg className="nids-kpi-sparkline" viewBox="0 0 100 28" preserveAspectRatio="none">
            <path
              d="M0,20 Q20,10 40,22 T70,8 T90,16 T100,6"
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
            />
          </svg>
        </div>

        {/* Card 4: Traffic Analyzed */}
        <div className="nids-kpi-card">
          <div className="nids-kpi-header">Traffic Analyzed</div>
          <div className="nids-kpi-value-row">
            <span className="nids-kpi-value">2.45 TB</span>
            <span className="nids-kpi-trend success">▲ +23.1% vs last 7 days</span>
          </div>
          <svg className="nids-kpi-sparkline" viewBox="0 0 100 28" preserveAspectRatio="none">
            <path
              d="M0,24 Q20,14 45,18 T75,8 T90,14 T100,4"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
            />
          </svg>
        </div>

        {/* Card 5: Active Connections */}
        <div className="nids-kpi-card">
          <div className="nids-kpi-header">Active Connections</div>
          <div className="nids-kpi-value-row">
            <span className="nids-kpi-value">8,547</span>
            <span className="nids-kpi-trend success">▲ +5.4% vs last 7 days</span>
          </div>
          <svg className="nids-kpi-sparkline" viewBox="0 0 100 28" preserveAspectRatio="none">
            <path
              d="M0,18 Q25,24 50,14 T75,20 T90,10 T100,16"
              fill="none"
              stroke="#a855f7"
              strokeWidth="2.5"
            />
          </svg>
        </div>
      </div>

      {/* 3. MIDDLE ROW: TRAFFIC OVERVIEW & TOP ATTACK TYPES */}
      <div className="nids-two-col-grid">
        {/* Left: Traffic Overview (Multi-line Area / Spline Chart) */}
        <div className="nids-panel">
          <div className="nids-panel-header">
            <span className="nids-panel-title">Traffic Overview</span>
            <select
              className="nids-select"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7 Days">7 Days</option>
              <option value="24 Hours">24 Hours</option>
              <option value="30 Days">30 Days</option>
            </select>
          </div>

          <div className="nids-traffic-legends">
            <span>
              <span className="nids-legend-dot" style={{ background: "#3b82f6" }}></span>
              Normal Traffic
            </span>
            <span>
              <span className="nids-legend-dot" style={{ background: "#f59e0b" }}></span>
              Suspicious Traffic
            </span>
            <span>
              <span className="nids-legend-dot" style={{ background: "#ef4444" }}></span>
              Malicious Traffic
            </span>
          </div>

          <div className="nids-chart-wrap">
            <svg viewBox="0 0 600 220" style={{ width: "100%", height: "100%", overflow: "visible" }}>
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Lines */}
              <line x1="40" y1="20" x2="590" y2="20" stroke="#1f2937" strokeDasharray="3 3" />
              <text x="30" y="24" fill="#6b7280" fontSize="10" textAnchor="end">50K</text>

              <line x1="40" y1="60" x2="590" y2="60" stroke="#1f2937" strokeDasharray="3 3" />
              <text x="30" y="64" fill="#6b7280" fontSize="10" textAnchor="end">40K</text>

              <line x1="40" y1="100" x2="590" y2="100" stroke="#1f2937" strokeDasharray="3 3" />
              <text x="30" y="104" fill="#6b7280" fontSize="10" textAnchor="end">30K</text>

              <line x1="40" y1="140" x2="590" y2="140" stroke="#1f2937" strokeDasharray="3 3" />
              <text x="30" y="144" fill="#6b7280" fontSize="10" textAnchor="end">20K</text>

              <line x1="40" y1="180" x2="590" y2="180" stroke="#1f2937" strokeDasharray="3 3" />
              <text x="30" y="184" fill="#6b7280" fontSize="10" textAnchor="end">10K</text>

              {/* Curve 1: Normal Traffic (Blue) with dots */}
              <path
                d="M50,110 C120,80 180,95 240,85 C310,75 370,105 440,75 C490,85 540,115 580,100 L580,185 L50,185 Z"
                fill="url(#blueGrad)"
              />
              <path
                d="M50,110 C120,80 180,95 240,85 C310,75 370,105 440,75 C490,85 540,115 580,100"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
              />
              {[
                [50, 110], [138, 86], [226, 88], [314, 82], [402, 94], [490, 83], [580, 100]
              ].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="4" fill="#3b82f6" stroke="#111827" strokeWidth="2" />
              ))}

              {/* Curve 2: Suspicious Traffic (Orange) with dots */}
              <path
                d="M50,145 C120,135 180,140 240,135 C310,130 370,145 440,135 C490,140 540,145 580,140"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
              />
              {[
                [50, 145], [138, 137], [226, 138], [314, 133], [402, 141], [490, 139], [580, 140]
              ].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="3.5" fill="#f59e0b" stroke="#111827" strokeWidth="1.5" />
              ))}

              {/* Curve 3: Malicious Traffic (Red) with dots */}
              <path
                d="M50,165 C120,160 180,165 240,158 C310,160 370,165 440,155 C490,165 540,160 580,165"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
              />
              {[
                [50, 165], [138, 162], [226, 163], [314, 159], [402, 164], [490, 161], [580, 165]
              ].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="3.5" fill="#ef4444" stroke="#111827" strokeWidth="1.5" />
              ))}

              {/* X-Axis Dates */}
              {["May 14", "May 15", "May 16", "May 17", "May 18", "May 19", "May 20"].map((d, i) => (
                <text key={d} x={50 + i * 88} y="208" fill="#6b7280" fontSize="11" textAnchor="middle">
                  {d}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* Right: Attack Category Distribution (Multi-Color Donut Chart & Legend) */}
        <div className="nids-panel">
          <div className="nids-panel-header">
            <span className="nids-panel-title">Attack Category Distribution</span>
          </div>

          <div className="nids-donut-container">
            {/* Donut SVG Ring */}
            <div className="nids-donut-graphic-wrap">
              <svg className="nids-donut-svg" viewBox="0 0 42 42">
                <circle
                  cx="21"
                  cy="21"
                  r="15.9155"
                  fill="transparent"
                  stroke="#1f2937"
                  strokeWidth="6"
                />
                {/* Segments */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.9155"
                  fill="transparent"
                  stroke="#3b82f6"
                  strokeWidth="6"
                  strokeDasharray="32.6 67.4"
                  strokeDashoffset="0"
                />
                <circle
                  cx="21"
                  cy="21"
                  r="15.9155"
                  fill="transparent"
                  stroke="#ef4444"
                  strokeWidth="6"
                  strokeDasharray="22.8 77.2"
                  strokeDashoffset="-32.6"
                />
                <circle
                  cx="21"
                  cy="21"
                  r="15.9155"
                  fill="transparent"
                  stroke="#eab308"
                  strokeWidth="6"
                  strokeDasharray="18.3 81.7"
                  strokeDashoffset="-55.4"
                />
                <circle
                  cx="21"
                  cy="21"
                  r="15.9155"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="6"
                  strokeDasharray="12.7 87.3"
                  strokeDashoffset="-73.7"
                />
                <circle
                  cx="21"
                  cy="21"
                  r="15.9155"
                  fill="transparent"
                  stroke="#a855f7"
                  strokeWidth="6"
                  strokeDasharray="7.9 92.1"
                  strokeDashoffset="-86.4"
                />
                <circle
                  cx="21"
                  cy="21"
                  r="15.9155"
                  fill="transparent"
                  stroke="#06b6d4"
                  strokeWidth="6"
                  strokeDasharray="5.7 94.3"
                  strokeDashoffset="-94.3"
                />
              </svg>

              <div className="nids-donut-center-label">
                <div className="nids-donut-total-count">2,458</div>
                <div className="nids-donut-sub-text">Total</div>
              </div>
            </div>

            {/* Legend Breakdown */}
            <div className="nids-donut-legend-list">
              {attackTypes.map((item) => (
                <div key={item.name} className="nids-donut-legend-item">
                  <span className="nids-donut-legend-name">
                    <span className="nids-legend-dot" style={{ background: item.color }}></span>
                    {item.name}
                  </span>
                  <span className="nids-donut-legend-stat">
                    {item.pct} ({item.count})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM ROW: NETWORK THREAT DETECTION RESULTS TABLE & SYSTEM STATUS BARS */}
      <div className="nids-two-col-grid">
        {/* Left: Network Threat Detection Results Table */}
        <div className="nids-panel">
          <div className="nids-panel-header">
            <span className="nids-panel-title">Network Threat Detection Results</span>
            <button
              className="nids-panel-action"
              onClick={() => onNavigate && onNavigate("Security Alerts")}
            >
              View All Alerts
            </button>
          </div>

          <div className="nids-table-wrap">
            <table className="nids-alerts-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Source IP</th>
                  <th>Destination IP</th>
                  <th>Severity</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentAlertsData.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.time}</td>
                    <td style={{ fontWeight: 600 }}>{row.type}</td>
                    <td>{row.sourceIp}</td>
                    <td>{row.destIp}</td>
                    <td>
                      <span className={`nids-pill ${row.severity.toLowerCase()}`}>
                        {row.severity}
                      </span>
                    </td>
                    <td>
                      <span className={`nids-action-pill ${row.action.toLowerCase()}`}>
                        {row.action}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: System Status Progress Bars */}
        <div className="nids-panel">
          <div className="nids-panel-header">
            <span className="nids-panel-title">System Status</span>
            <button className="nids-panel-action">View Details</button>
          </div>

          <div className="nids-sys-list">
            <div className="nids-sys-item">
              <div className="nids-sys-header">
                <span className="nids-sys-label">CPU Usage</span>
                <span className="nids-sys-pct">32%</span>
              </div>
              <div className="nids-sys-bar-track">
                <div className="nids-sys-bar-fill cpu" style={{ width: "32%" }}></div>
              </div>
            </div>

            <div className="nids-sys-item">
              <div className="nids-sys-header">
                <span className="nids-sys-label">Memory Usage</span>
                <span className="nids-sys-pct">65%</span>
              </div>
              <div className="nids-sys-bar-track">
                <div className="nids-sys-bar-fill memory" style={{ width: "65%" }}></div>
              </div>
            </div>

            <div className="nids-sys-item">
              <div className="nids-sys-header">
                <span className="nids-sys-label">Disk Usage</span>
                <span className="nids-sys-pct">78%</span>
              </div>
              <div className="nids-sys-bar-track">
                <div className="nids-sys-bar-fill disk" style={{ width: "78%" }}></div>
              </div>
            </div>

            <div className="nids-sys-item">
              <div className="nids-sys-header">
                <span className="nids-sys-label">Network I/O</span>
                <span className="nids-sys-pct">45%</span>
              </div>
              <div className="nids-sys-bar-track">
                <div className="nids-sys-bar-fill network" style={{ width: "45%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
