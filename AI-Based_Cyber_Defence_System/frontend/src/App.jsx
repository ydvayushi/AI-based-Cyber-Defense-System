import React, { useEffect, useMemo, useState } from "react";
import {
  FaShieldAlt,
  FaHome,
  FaNetworkWired,
  FaDatabase,
  FaRobot,
  FaExclamationTriangle,
  FaMoon,
  FaSun,
  FaBell,
  FaUserCircle,
  FaUpload,
  FaFileCsv,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaTrash,
  FaDownload,
  FaChartLine,
  FaServer,
  FaBug,
  FaLock,
} from "react-icons/fa";
import UserDashboard from "./User_Dashboard";
import Login from "./Login";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const [dataset, setDataset] = useState(null);
  const [datasetRows, setDatasetRows] = useState([]);
  const [search, setSearch] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [datasetStats, setDatasetStats] = useState(null);
  const [modelStats, setModelStats] = useState(null);
  useEffect(() => {
  fetch("http://localhost:5000/api/dataset/stats")
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        setDatasetStats(data);
      }
    })
    .catch((error) => {
      console.error("Error connecting to backend:", error);
    });
}, []);
useEffect(() => {
  fetch("http://localhost:5000/api/model-info")
    .then((response) => response.json())
    .then((data) => {
      if (data.accuracy !== undefined) {
        setModelStats(data);
      }
    })
    .catch((error) => {
      console.error("Error fetching model information:", error);
    });
}, []);

  /*
   * Default dashboard data
   */
  const defaultTraffic = [18, 27, 22, 35, 30, 42, 38, 52, 46, 58, 51, 64];

  const defaultAttacks = [
    { name: "DoS", value: 20 },
    { name: "Probe", value: 12 },
    { name: "R2L", value: 8 },
    { name: "U2R", value: 5 },
    { name: "Normal", value: 55 },
  ];

  /*
   * Security alerts
   */
  const [alerts] = useState([
    {
      source: "192.168.1.20",
      attack: "DoS Attack",
      severity: "Critical",
      status: "Blocked",
    },
    {
      source: "192.168.1.35",
      attack: "Probe Attack",
      severity: "High",
      status: "Investigating",
    },
    {
      source: "10.0.0.14",
      attack: "R2L Attack",
      severity: "Medium",
      status: "Detected",
    },
    {
      source: "192.168.1.10",
      attack: "Normal Traffic",
      severity: "Safe",
      status: "Allowed",
    },
  ]);

  /*
   * Filter security alerts
   */
  const filteredAlerts = useMemo(() => {
    const value = search.toLowerCase();

    return alerts.filter(
      (alert) =>
        alert.source.toLowerCase().includes(value) ||
        alert.attack.toLowerCase().includes(value) ||
        alert.severity.toLowerCase().includes(value) ||
        alert.status.toLowerCase().includes(value)
    );
  }, [search, alerts]);

  /*
   * Parse CSV dataset
   */
  const processCSV = (text) => {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length < 2) {
      return {
        rows: [],
        headers: [],
      };
    }

    const headers = lines[0]
      .split(",")
      .map((header) => header.trim().replace(/^"|"$/g, ""));

    const rows = lines.slice(1).map((line) => {
      const values = line.split(",").map((value) =>
        value.trim().replace(/^"|"$/g, "")
      );

      const row = {};

      headers.forEach((header, index) => {
        row[header] = values[index] ?? "";
      });

      return row;
    });

    return {
      rows,
      headers,
    };
  };

  /*
   * Dataset upload
   */
  const handleDatasetUpload = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const extension = file.name.split(".").pop().toLowerCase();

    if (extension !== "csv") {
      setUploadMessage("Please upload a CSV dataset.");
      return;
    }

    setDataset(file);
    setUploadMessage("Reading dataset...");

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const result = processCSV(e.target.result);

        setDatasetRows(result.rows);

        if (result.rows.length > 0) {
          setUploadMessage(
            `Dataset loaded successfully — ${result.rows.length} records found.`
          );
        } else {
          setUploadMessage("Dataset does not contain readable records.");
        }
      } catch (error) {
        console.error(error);
        setUploadMessage("Unable to process the dataset.");
      }
    };

    reader.onerror = () => {
      setUploadMessage("Error while reading the dataset.");
    };

    reader.readAsText(file);
  };

  /*
   * Clear dataset
   */
  const clearDataset = () => {
    setDataset(null);
    setDatasetRows([]);
    setUploadMessage("");
  };

  /*
   * Download sample CSV
   */
  const downloadSample = () => {
    const csv =
      "duration,protocol_type,service,src_bytes,dst_bytes,label\n" +
      "10,tcp,http,250,1200,normal\n" +
      "25,tcp,http,900,200,neptune\n" +
      "12,udp,domain,120,500,normal\n" +
      "40,tcp,ftp,1200,300,normal\n" +
      "8,tcp,http,1500,50,satan\n" +
      "18,udp,private,90,200,normal\n";

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "sample_network_dataset.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  /*
   * Generate graph values from uploaded dataset
   *
   * We use numeric values from the dataset.
   * If numeric columns are available, they are visualized.
   */
  const graphValues = useMemo(() => {
    if (!datasetRows.length) {
      return defaultTraffic;
    }

    const values = [];

    datasetRows.slice(0, 20).forEach((row) => {
      const numericValues = Object.values(row)
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value));

      if (numericValues.length > 0) {
        const average =
          numericValues.reduce((sum, value) => sum + value, 0) /
          numericValues.length;

        values.push(average);
      }
    });

    if (values.length < 2) {
      return defaultTraffic;
    }

    const max = Math.max(...values, 1);

    return values.map((value) => Math.round((value / max) * 100));
  }, [datasetRows]);

  /*
   * Attack distribution from dataset
   */
  const attackDistribution = useMemo(() => {
    if (!datasetRows.length) {
      return defaultAttacks;
    }

    const counts = {
      Normal: 0,
      DoS: 0,
      Probe: 0,
      R2L: 0,
      U2R: 0,
    };

    datasetRows.forEach((row) => {
      const text = Object.values(row).join(" ").toLowerCase();

      if (
        text.includes("dos") ||
        text.includes("neptune") ||
        text.includes("smurf") ||
        text.includes("back")
      ) {
        counts.DoS++;
      } else if (
        text.includes("probe") ||
        text.includes("satan") ||
        text.includes("ipsweep") ||
        text.includes("nmap")
      ) {
        counts.Probe++;
      } else if (
        text.includes("r2l") ||
        text.includes("guess") ||
        text.includes("ftp_write") ||
        text.includes("warez")
      ) {
        counts.R2L++;
      } else if (
        text.includes("u2r") ||
        text.includes("buffer_overflow") ||
        text.includes("rootkit")
      ) {
        counts.U2R++;
      } else {
        counts.Normal++;
      }
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [datasetRows]);

  /*
   * Dataset statistics
   */
  const totalRecords = datasetRows.length;

  const detectedThreats = datasetRows.length
    ? datasetRows.filter((row) => {
      const text = Object.values(row).join(" ").toLowerCase();

      return (
        text.includes("dos") ||
        text.includes("probe") ||
        text.includes("r2l") ||
        text.includes("u2r") ||
        text.includes("neptune") ||
        text.includes("satan") ||
        text.includes("attack")
      );
    }).length
    : 0;

  const normalTraffic = datasetRows.length
    ? Math.max(totalRecords - detectedThreats, 0)
    : 0;

  /*
   * Main menu
   */
  const menuItems = [
    {
      name: "Dashboard",
      icon: <FaHome />,
    },
    {
      name: "Live Traffic",
      icon: <FaNetworkWired />,
    },
    {
      name: "Dataset",
      icon: <FaDatabase />,
    },
    {
      name: "AI Prediction",
      icon: <FaRobot />,
    },
    {
      name: "Security Alerts",
      icon: <FaExclamationTriangle />,
    },
    {
  name: "User Profile",
  icon: <FaUserCircle />,
},
  ];

  /*
   * Simple SVG graph
   */
  const graphPoints = graphValues
    .map((value, index) => {
      const x =
        graphValues.length === 1
          ? 0
          : (index / (graphValues.length - 1)) * 100;

      const y = 100 - value;

      return `${x},${y}`;
    })
    .join(" ");

  /*
   * Donut chart
   */
  const totalAttackValues = attackDistribution.reduce(
    (sum, item) => sum + item.value,
    0
  );

  let currentOffset = 0;

  const donutColors = [
    "#16a34a",
    "#dc2626",
    "#7c3aed",
    "#f59e0b",
    "#06b6d4",
  ];
  if (!isLoggedIn) {
  return (
    <Login onLogin={() => setIsLoggedIn(true)} />
  );
}

  return (
    <div className={darkMode ? "app dark-mode" : "app"}>
      {/* SIDEBAR */}

      <aside className="sidebar">
        <div className="logo">
          <FaShieldAlt />
          <span>
            AI Cyber
            <br />
            Defence
          </span>
        </div>

        <div className="menu">
          {menuItems.map((item) => (
            <div
              key={item.name}
              className={
                activeMenu === item.name
                  ? "menu-item active"
                  : "menu-item"
              }
              onClick={() => setActiveMenu(item.name)}
            >
              {item.icon}
              <span>{item.name}</span>
            </div>
          ))}
        </div>

        <div className="online">
          <span></span>
          System Online
        </div>

        <button
          className="dark-mode-btn"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <FaSun /> : <FaMoon />}
          <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
        </button>
      </aside>

      {/* MAIN */}

      <main className="main">
        {/* NAVBAR */}

        <div className="navbar">
          <div>
            <h1>AI Based Cyber Defence</h1>
            <p>
              Intelligent Network Threat Detection & Monitoring
            </p>
          </div>

          <div className="profile">
            <FaBell className="bell" />

            <div className="profile-info">
              <strong>Security Analyst</strong>
              <small>Administrator</small>
            </div>

           <FaUserCircle
  className="user"
  onClick={() => setActiveMenu("User Profile")}
/>
          </div>
        </div>

        {/* DASHBOARD */}

        {activeMenu === "Dashboard" && (
          <>
            {/* CARDS */}

            <div className="cards">
              <div className="card blue">
                <FaNetworkWired className="card-icon" />

                <p>Total Network Records</p>

                <h2>
                  {datasetStats
                    ? datasetStats.totalRows.toLocaleString()
                    : datasetRows.length
                    ? datasetRows.length.toLocaleString()
                    : "Loading..."
                    }
                </h2>

                <span>
                  {datasetRows.length
                    ? "From uploaded dataset"
                    : "Monitoring network traffic"}
                </span>
              </div>

              <div className="card red">
                <FaBug className="card-icon" />

                <p>Threats Detected</p>

                <h2>
                  {datasetStats
                    ? (datasetStats.totalRows - datasetStats.normal).toLocaleString()
                    : datasetRows.length
                    ? detectedThreats.toLocaleString()
                    : "Loading..."}
                </h2>

                <span>Potential malicious activities</span>
              </div>

              <div className="card green">
                <FaCheckCircle className="card-icon" />

                <p>Normal Traffic</p>

                <h2>
                  {datasetStats
                    ? datasetStats.normal.toLocaleString()
                    : datasetRows.length
                    ? normalTraffic.toLocaleString()
                    : "Loading..."}
                </h2>

                <span>Traffic classified as safe</span>
              </div>

              <div className="card purple">
                <FaRobot className="card-icon" />

                <p>AI Model Accuracy</p>

                <h2>
                {modelStats
                 ? `${modelStats.accuracy}%`
                 : "Loading..."}
                </h2>

                <span>Current model performance</span>
              </div>
            </div>

            {/* GRAPH + AI PANEL */}

            <div className="content">
              <div className="panel">
                <div className="panel-title">
                  <div>
                    <h3>Network Traffic Monitoring</h3>

                    <p>
                      {datasetRows.length
                        ? "Traffic visualization from uploaded dataset"
                        : "Real-time network activity overview"}
                    </p>
                  </div>

                  <div className="live">
                    <span className="live-dot"></span>
                    LIVE MONITORING
                  </div>
                </div>

                <div className="graph-container">
                  <div className="graph-y-label">
                    <span>100</span>
                    <span>75</span>
                    <span>50</span>
                    <span>25</span>
                    <span>0</span>
                  </div>

                  <div className="graph">
                    <div className="line line1"></div>
                    <div className="line line2"></div>
                    <div className="line line3"></div>
                    <div className="line line4"></div>

                    <svg
                      className="traffic-svg"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      <polyline
                        points={graphPoints}
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2.5"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </div>
                </div>

                <div className="graph-footer">
                  <span>Network Activity</span>

                  <span className="graph-info">
                    {datasetRows.length
                      ? `${datasetRows.length} records loaded`
                      : "Waiting for dataset"}
                  </span>
                </div>
              </div>

              {/* AI PANEL */}

              <div className="panel">
                <div className="ai-heading">
                  <FaRobot />
                  <h3>AI Detection Engine</h3>
                </div>

                <div className="model">
                  <div>
                    <p>Random Forest</p>
                    <small>Supervised Detection</small>
                  </div>

                  <strong>96.8%</strong>
                </div>

                <div className="progress">
                  <div style={{ width: "96.8%" }}></div>
                </div>

                <div className="model">
                  <div>
                    <p>Isolation Forest</p>
                    <small>Anomaly Detection</small>
                  </div>

                  <strong>93.4%</strong>
                </div>

                <div className="progress">
                  <div style={{ width: "93.4%" }}></div>
                </div>

                <div className="engine-status">
                  <FaCheckCircle /> AI Engine Active
                </div>
              </div>
            </div>

            {/* DATASET UPLOAD */}

            <div className="panel dataset-panel">
              <div className="panel-title">
                <div>
                  <h3>Dataset Upload</h3>

                  <p>
                    Upload a CSV network traffic dataset for analysis
                  </p>
                </div>

                <FaDatabase className="section-icon" />
              </div>

              <div className="upload-area">
                <FaFileCsv className="upload-icon" />

                <h3>
                  {dataset
                    ? dataset.name
                    : "Upload Network Traffic Dataset"}
                </h3>

                <p>
                  Supported format: CSV
                </p>

                <label className="upload-btn">
                  <FaUpload />
                  Choose CSV File

                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleDatasetUpload}
                    hidden
                  />
                </label>

                <button
                  className="sample-btn"
                  onClick={downloadSample}
                >
                  <FaDownload />
                  Download Sample Dataset
                </button>

                {dataset && (
                  <button
                    className="clear-btn"
                    onClick={clearDataset}
                  >
                    <FaTrash />
                    Remove Dataset
                  </button>
                )}

                {uploadMessage && (
                  <div className="upload-message">
                    <FaCheckCircle />
                    {uploadMessage}
                  </div>
                )}
              </div>
            </div>

            {/* CHARTS */}

            <div className="charts-grid">
              {/* DONUT */}

              <div className="panel">
                <div className="panel-title">
                  <div>
                    <h3>Traffic Classification</h3>
                    <p>Network activity distribution</p>
                  </div>
                </div>

                <div className="donut-wrapper">
                  <svg
                    className="donut"
                    viewBox="0 0 42 42"
                  >
                    <circle
                      cx="21"
                      cy="21"
                      r="15.9155"
                      fill="transparent"
                      stroke="#e2e8f0"
                      strokeWidth="7"
                    />

                    {attackDistribution.map(
                      (item, index) => {
                        const percentage =
                          totalAttackValues > 0
                            ? (item.value / totalAttackValues) *
                            100
                            : 0;

                        const dash = `${percentage} ${100 - percentage
                          }`;

                        const offset = -currentOffset;

                        currentOffset += percentage;

                        return (
                          <circle
                            key={item.name}
                            cx="21"
                            cy="21"
                            r="15.9155"
                            fill="transparent"
                            stroke={
                              donutColors[index]
                            }
                            strokeWidth="7"
                            strokeDasharray={dash}
                            strokeDashoffset={offset}
                            transform="rotate(-90 21 21)"
                          />
                        );
                      }
                    )}

                    <text
                      x="21"
                      y="20"
                      textAnchor="middle"
                      className="donut-number"
                    >
                      {datasetRows.length || 1250}
                    </text>

                    <text
                      x="21"
                      y="25"
                      textAnchor="middle"
                      className="donut-label"
                    >
                      Records
                    </text>
                  </svg>

                  <div className="legend">
                    {attackDistribution.map(
                      (item, index) => (
                        <div
                          className="legend-item"
                          key={item.name}
                        >
                          <span
                            style={{
                              background:
                                donutColors[index],
                            }}
                          ></span>

                          <label>{item.name}</label>

                          <strong>
                            {item.value}
                          </strong>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* ATTACK BAR */}

              <div className="panel">
                <div className="panel-title">
                  <div>
                    <h3>Attack Categories</h3>
                    <p>Detected threat types</p>
                  </div>
                </div>

                <div className="bar-chart">
                  {attackDistribution.map(
                    (item, index) => {
                      const maxValue = Math.max(
                        ...attackDistribution.map(
                          (x) => x.value
                        ),
                        1
                      );

                      const height =
                        (item.value / maxValue) * 100;

                      return (
                        <div
                          className="bar-column"
                          key={item.name}
                        >
                          <span>{item.value}</span>

                          <div className="bar-area">
                            <div
                              className="bar"
                              style={{
                                height: `${Math.max(
                                  height,
                                  5
                                )}%`,
                                background:
                                  donutColors[index],
                              }}
                            ></div>
                          </div>

                          <label>{item.name}</label>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>

            {/* SECURITY ALERTS */}

            <div className="panel alerts">
              <div className="panel-title">
                <div>
                  <h3>Security Alerts</h3>

                  <p>
                    Latest detected network activities
                  </p>
                </div>

                <div className="search-box">
                  <FaSearch />

                  <input
                    type="text"
                    placeholder="Search alerts..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Source</th>
                      <th>Attack</th>
                      <th>Severity</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAlerts.length > 0 ? (
                      filteredAlerts.map(
                        (alert, index) => (
                          <tr key={index}>
                            <td>
                              {alert.source}
                            </td>

                            <td className="attack-name">
                              {alert.attack}
                            </td>

                            <td>
                              <span
                                className={
                                  alert.severity.toLowerCase()
                                }
                              >
                                {alert.severity}
                              </span>
                            </td>

                            <td className="status-cell">
                              {alert.status ===
                                "Blocked" ? (
                                <FaTimesCircle className="status-danger" />
                              ) : (
                                <FaCheckCircle className="status-safe" />
                              )}

                              {alert.status}
                            </td>
                          </tr>
                        )
                      )
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="no-results"
                        >
                          No alerts found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* LIVE TRAFFIC */}

        {activeMenu === "Live Traffic" && (
          <div className="page-section">
            <div className="page-header">
              <div>
                <h2>Live Traffic Monitoring</h2>
                <p>
                  Monitor incoming network traffic
                  activities.
                </p>
              </div>

              <div className="live large-live">
                <span className="live-dot"></span>
                SYSTEM MONITORING
              </div>
            </div>

            <div className="traffic-status">
              <FaNetworkWired />

              <div>
                <h3>Network Monitoring Active</h3>

                <p>
                  Upload a dataset from the Dataset
                  section to analyze network traffic.
                </p>
              </div>
            </div>

            <div className="panel">
              <div className="panel-title">
                <div>
                  <h3>Traffic Activity</h3>
                  <p>
                    Current dataset-based activity
                  </p>
                </div>
              </div>

              <div className="large-graph">
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <polyline
                    points={graphPoints}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2.5"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* DATASET PAGE */}

        {activeMenu === "Dataset" && (
          <div className="page-section">
            <div className="page-header">
              <div>
                <h2>Dataset Management</h2>
                <p>
                  Upload and analyze network traffic
                  datasets.
                </p>
              </div>
            </div>

            <div className="panel dataset-large">
              <FaDatabase className="page-icon" />

              <h2>
                {dataset
                  ? dataset.name
                  : "No Dataset Uploaded"}
              </h2>

              <p>
                {datasetRows.length
                  ? `${datasetRows.length} network records are currently loaded.`
                  : "Upload a CSV dataset to start analysis."}
              </p>

              <label className="upload-btn">
                <FaUpload />
                Upload Dataset

                <input
                  type="file"
                  accept=".csv"
                  onChange={handleDatasetUpload}
                  hidden
                />
              </label>

              {dataset && (
                <button
                  className="clear-btn"
                  onClick={clearDataset}
                >
                  <FaTrash />
                  Clear Dataset
                </button>
              )}
            </div>
          </div>
        )}

        {/* AI PREDICTION */}

        {activeMenu === "AI Prediction" && (
          <div className="page-section">
            <div className="page-header">
              <div>
                <h2>AI Threat Prediction</h2>
                <p>
                  Intelligent analysis using machine
                  learning models.
                </p>
              </div>
            </div>

            <div className="prediction-grid">
              <div className="prediction-card">
                <FaRobot />

                <h3>Random Forest</h3>

                <p>
                  Supervised classification model for
                  known network attacks.
                </p>

                <strong>96.8%</strong>

                <div className="progress">
                  <div
                    style={{ width: "96.8%" }}
                  ></div>
                </div>
              </div>

              <div className="prediction-card">
                <FaBug />

                <h3>Isolation Forest</h3>

                <p>
                  Anomaly-based model for identifying
                  unusual network behavior.
                </p>

                <strong>93.4%</strong>

                <div className="progress">
                  <div
                    style={{ width: "93.4%" }}
                  ></div>
                </div>
              </div>

              <div className="prediction-card">
                <FaLock />

                <h3>Hybrid Detection</h3>

                <p>
                  Combines signature and anomaly-based
                  detection concepts.
                </p>

                <strong>95.2%</strong>

                <div className="progress">
                  <div
                    style={{ width: "95.2%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECURITY ALERTS PAGE */}

        {activeMenu === "Security Alerts" && (
          <div className="page-section">
            <div className="page-header">
              <div>
                <h2>Security Alerts</h2>

                <p>
                  Review detected threats and security
                  events.
                </p>
              </div>
            </div>

            <div className="panel alerts">
              <div className="panel-title">
                <div>
                  <h3>Detected Threats</h3>

                  <p>
                    Security events generated by the
                    detection system
                  </p>
                </div>

                <div className="search-box">
                  <FaSearch />

                  <input
                    type="text"
                    placeholder="Search alerts..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                  />
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Attack</th>
                    <th>Severity</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAlerts.map(
                    (alert, index) => (
                      <tr key={index}>
                        <td>{alert.source}</td>

                        <td className="attack-name">
                          {alert.attack}
                        </td>

                        <td>
                          <span
                            className={
                              alert.severity.toLowerCase()
                            }
                          >
                            {alert.severity}
                          </span>
                        </td>

                        <td className="status-cell">
                          {alert.status}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* USER PROFILE */}

{activeMenu === "User Profile" && (
  <UserDashboard />
)}
      </main>
    </div>
  );
}

export default App;