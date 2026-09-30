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
  FaPaperPlane,
  FaPlay,
  FaPause,
  FaSyncAlt,
} from "react-icons/fa";
import UserDashboard from "./User_Dashboard";
import Login from "./Login";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    name: "Arshiya",
    email: "arshiya@cyberdefence.com",
  });
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const [dataset, setDataset] = useState(null);
  const [selectedDatasetFile, setSelectedDatasetFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [datasetRows, setDatasetRows] = useState([]);
  const [search, setSearch] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");

  const [datasetStats, setDatasetStats] = useState(null);
  const [modelStats, setModelStats] = useState(null);
  const [modelEvaluation, setModelEvaluation] = useState(null);
  const [batchResults, setBatchResults] = useState(null);
  const [singleInput, setSingleInput] = useState({
    protocol_type: "tcp",
    service: "http",
    flag: "SF",
    src_bytes: 181,
    dst_bytes: 5450,
    count: 8,
    srv_count: 8,
  });
  const [singlePrediction, setSinglePrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);

  /*
   * Live Traffic Stream Simulator State
   */
  const [isStreaming, setIsStreaming] = useState(false);
  const [livePackets, setLivePackets] = useState([
    {
      id: "pkt-init-1",
      time: "15:45:10",
      sourceIp: "192.168.1.105",
      protocol: "TCP",
      service: "HTTP",
      bytes: "342 B",
      verdict: "Normal",
      attackType: "Normal",
      confidence: 99.4,
      status: "Allowed",
    },
    {
      id: "pkt-init-2",
      time: "15:45:08",
      sourceIp: "10.0.0.14",
      protocol: "UDP",
      service: "DNS",
      bytes: "68 B",
      verdict: "Normal",
      attackType: "Normal",
      confidence: 98.9,
      status: "Allowed",
    },
    {
      id: "pkt-init-3",
      time: "15:45:05",
      sourceIp: "185.220.101.42",
      protocol: "TCP",
      service: "Private",
      bytes: "0 B",
      verdict: "Attack",
      attackType: "DoS",
      confidence: 96.2,
      status: "Blocked",
    },
  ]);
  const [liveGraphPoints, setLiveGraphPoints] = useState([
    25, 30, 40, 35, 50, 45, 60, 55, 75, 40, 30, 45, 50, 65, 80, 40, 35, 50, 45, 30,
  ]);
  const [streamStats, setStreamStats] = useState({
    total: 3,
    normal: 2,
    attacks: 1,
  });

  useEffect(() => {
    let interval = null;
    if (isStreaming) {
      interval = setInterval(() => {
        const now = new Date();
        const timeStr = now.toTimeString().split(" ")[0];

        // 72% chance normal, 28% chance attack
        const isAttack = Math.random() < 0.28;
        let attackType = "Normal";
        let protocol = "TCP";
        let service = "HTTP";
        let bytes = `${Math.floor(Math.random() * 800 + 120)} B`;
        let ip = `192.168.1.${Math.floor(Math.random() * 180 + 2)}`;
        let confidence = (Math.random() * 4 + 95.8).toFixed(1);

        if (isAttack) {
          const attacks = ["DoS", "Probe", "R2L", "U2R"];
          attackType = attacks[Math.floor(Math.random() * attacks.length)];
          ip = `185.${Math.floor(Math.random() * 200 + 10)}.${Math.floor(Math.random() * 200 + 1)}.${Math.floor(Math.random() * 250 + 1)}`;
          if (attackType === "DoS") {
            service = "Private";
            bytes = "0 B";
          } else if (attackType === "Probe") {
            service = "Scan";
            bytes = `${Math.floor(Math.random() * 60 + 20)} B`;
          } else if (attackType === "R2L") {
            service = "FTP";
            bytes = `${Math.floor(Math.random() * 500 + 100)} B`;
          } else {
            service = "Telnet";
            bytes = `${Math.floor(Math.random() * 1200 + 200)} B`;
          }
        } else {
          const normalServices = ["HTTP", "HTTPS", "DNS", "SMTP", "SSH"];
          service = normalServices[Math.floor(Math.random() * normalServices.length)];
          if (service === "DNS") protocol = "UDP";
        }

        const newPacket = {
          id: "pkt-" + Date.now(),
          time: timeStr,
          sourceIp: ip,
          protocol,
          service,
          bytes,
          verdict: isAttack ? "Attack" : "Normal",
          attackType,
          confidence: parseFloat(confidence),
          status: isAttack ? "Blocked" : "Allowed",
        };

        setLivePackets((prev) => [newPacket, ...prev.slice(0, 14)]);

        // Update rolling graph points (last 20 points)
        setLiveGraphPoints((prev) => {
          const nextVal = isAttack
            ? Math.floor(Math.random() * 25 + 75) // Spike to 75-100 on attack
            : Math.floor(Math.random() * 30 + 25); // Baseline 25-55 on normal
          return [...prev.slice(1), nextVal];
        });

        setStreamStats((prev) => ({
          total: prev.total + 1,
          normal: isAttack ? prev.normal : prev.normal + 1,
          attacks: isAttack ? prev.attacks + 1 : prev.attacks,
        }));

        if (isAttack) {
          triggerNotification({
            title: `⚠️ Live Threat: ${attackType} Attack Intercepted`,
            message: `Real-time stream flagged rogue packet from ${ip} (${confidence}% confidence).`,
            severity: attackType === "DoS" || attackType === "U2R" ? "Critical" : "High",
          });
        }
      }, 2200);
    }
    return () => clearInterval(interval);
  }, [isStreaming]);

  const liveSvgPoints = useMemo(() => {
    return liveGraphPoints
      .map((val, idx) => {
        const x = (idx / (liveGraphPoints.length - 1)) * 100;
        const y = 100 - val;
        return `${x},${y}`;
      })
      .join(" ");
  }, [liveGraphPoints]);


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

  useEffect(() => {
    fetch("http://localhost:5000/api/model/evaluation")
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          setModelEvaluation(data);
        }
      })
      .catch((error) => {
        console.error("Error fetching model evaluation:", error);
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
   * Default alert template
   */
  const defaultAlertsList = [
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
  ];

  /*
   * Security alerts (Member 2 Deliverable)
   */
  const [alerts, setAlerts] = useState(defaultAlertsList);
  const [severityFilter, setSeverityFilter] = useState("All");

  /*
   * Live Notifications System
   */
  const [notifications, setNotifications] = useState([
    {
      id: "notif-1",
      title: "Critical Threat: DoS Attack Detected",
      message: "High-volume SYN flood logged from 192.168.1.20",
      severity: "Critical",
      time: "10 mins ago",
      read: false,
    },
    {
      id: "notif-2",
      title: "High Risk: Port Scan Activity",
      message: "Rapid port probe detected from 192.168.1.35",
      severity: "High",
      time: "25 mins ago",
      read: false,
    },
    {
      id: "notif-3",
      title: "AI Model Engine Active",
      message: "Random Forest multi-class detector online (99.88% accuracy)",
      severity: "Safe",
      time: "1 hr ago",
      read: true,
    },
    {
      id: "notif-4",
      title: "Database Synchronized",
      message: "Connected to MongoDB database 'cyber_defence'",
      severity: "Safe",
      time: "2 hrs ago",
      read: true,
    },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);

  const triggerNotification = (notif) => {
    const newNotif = {
      id: "notif-" + Date.now(),
      time: "Just now",
      read: false,
      ...notif,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setToastNotification(newNotif);
    setTimeout(() => {
      setToastNotification((curr) => (curr?.id === newNotif.id ? null : curr));
    }, 4500);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const fetchAlerts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/alerts");
      const data = await response.json();
      if (data.status === "success" && Array.isArray(data.alerts) && data.alerts.length > 0) {
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error("Error fetching security alerts:", error);
    }
  };

  const handleDeleteAlert = async (id, index) => {
    if (id) {
      try {
        await fetch(`http://localhost:5000/api/alerts/${id}`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Error deleting alert:", error);
      }
    }
    setAlerts((prev) =>
      prev.filter((a, i) => (a._id ? a._id !== id : i !== index))
    );
  };

  const handleCreateTestAlert = async () => {
    const randomOctet = Math.floor(Math.random() * 200 + 10);
    const attackOptions = [
      { attack: "DDoS SYN Flood", severity: "Critical" },
      { attack: "SQL Injection Probe", severity: "High" },
      { attack: "Brute Force SSH Attempt", severity: "Medium" },
      { attack: "Port Scan Activity", severity: "High" },
    ];
    const picked =
      attackOptions[Math.floor(Math.random() * attackOptions.length)];
    try {
      const res = await fetch("http://localhost:5000/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: `192.168.1.${randomOctet}`,
          attack: picked.attack,
          severity: picked.severity,
          status: "Detected",
        }),
      });
      const data = await res.json();
      if (data.status === "success") {
        fetchAlerts();
        triggerNotification({
          title: `🚨 ${picked.severity} Alert: ${picked.attack}`,
          message: `Manual threat logged from 192.168.1.${randomOctet}`,
          severity: picked.severity,
        });
      }
    } catch (err) {
      console.error("Failed to create alert:", err);
    }
  };

  /*
   * Prediction History (Member 2 Deliverable)
   */
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [historyFilter, setHistoryFilter] = useState("All");

  const fetchPredictionHistory = async (filter = historyFilter) => {
    try {
      const url =
        filter && filter !== "All"
          ? `http://localhost:5000/api/predictions/history?result=${filter}`
          : "http://localhost:5000/api/predictions/history";
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === "success" && Array.isArray(data.predictions)) {
        setPredictionHistory(data.predictions);
      }
    } catch (error) {
      console.error("Error fetching prediction history:", error);
    }
  };

  useEffect(() => {
    fetchAlerts();
    fetchPredictionHistory();
  }, []);

  /*
   * Filter security alerts
   */
  const filteredAlerts = useMemo(() => {
    const value = search.toLowerCase();

    return alerts.filter((alert) => {
      const matchesSearch =
        alert.source.toLowerCase().includes(value) ||
        alert.attack.toLowerCase().includes(value) ||
        alert.severity.toLowerCase().includes(value) ||
        alert.status.toLowerCase().includes(value);

      const matchesSeverity =
        severityFilter === "All" ||
        alert.severity.toLowerCase() === severityFilter.toLowerCase();

      return matchesSearch && matchesSeverity;
    });
  }, [search, alerts, severityFilter]);

  /*
   * Export alerts report as CSV
   */
  const exportAlertsCSV = () => {
    const header = "Source,Attack,Severity,Status\n";
    const rows = filteredAlerts
      .map(
        (a) => `"${a.source}","${a.attack}","${a.severity}","${a.status}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "security_alerts_report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

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
   * Single record AI prediction
   */
  const handlePredictSingle = async (inputData = singleInput) => {
    setPredicting(true);
    try {
      const res = await fetch("http://localhost:5000/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputData),
      });
      const data = await res.json();
      if (data.status === "success") {
        setSinglePrediction(data);
        // Refresh alerts and prediction history directly from backend database
        fetchAlerts();
        fetchPredictionHistory();

        if (data.result === "Attack") {
          triggerNotification({
            title: `⚠️ Threat Detected: ${data.attackType} Attack`,
            message: `Packet classified as ${data.attackType} with ${(data.confidence * 100).toFixed(0)}% model confidence.`,
            severity: data.attackType === "DoS" ? "Critical" : data.attackType === "Probe" ? "High" : "Medium",
          });
        } else {
          triggerNotification({
            title: `🛡️ Clean Packet Verified`,
            message: `Normal traffic packet verified with ${(data.confidence * 100).toFixed(0)}% confidence.`,
            severity: "Safe",
          });
        }
      } else {
        alert(data.message || "Prediction failed");
      }
    } catch (err) {
      console.error("Prediction API error:", err);
      alert("Unable to reach backend server on port 5000.");
    } finally {
      setPredicting(false);
    }
  };

  /*
   * Step 1: Choose Dataset file
   */
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const extension = file.name.split(".").pop().toLowerCase();
    if (extension !== "csv" && extension !== "txt") {
      setUploadMessage("Please select a valid CSV or TXT dataset.");
      return;
    }

    setSelectedDatasetFile(file);
    setUploadMessage(`File selected: "${file.name}" (${(file.size / 1024).toFixed(1)} KB). Click "Submit Dataset" to analyze.`);
  };

  /*
   * Step 2: Submit Dataset to AI Model
   */
  const handleSubmitDataset = async () => {
    const targetFile = selectedDatasetFile || dataset;
    if (!targetFile) {
      alert("Please choose a CSV or TXT dataset file first.");
      return;
    }

    setIsAnalyzing(true);
    setUploadMessage(`Submitting "${targetFile.name}" and running AI model analysis...`);

    const formData = new FormData();
    formData.append("file", targetFile);

    try {
      const res = await fetch("http://localhost:5000/api/predict/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.status === "success") {
        setDataset(targetFile);
        setBatchResults(data);
        setUploadMessage(
          `AI Analysis Complete: ${data.totalRecords} total records | ${data.normalCount} Normal | ${data.attackCount} Malicious (DoS: ${data.breakdown.DoS}, Probe: ${data.breakdown.Probe}, R2L: ${data.breakdown.R2L}, U2R: ${data.breakdown.U2R})`
        );
        triggerNotification({
          title: "📊 Dataset Analysis Completed",
          message: `Processed ${data.totalRecords} network records (${data.attackCount} attacks detected).`,
          severity: data.attackCount > 0 ? "High" : "Safe",
        });
      } else {
        setUploadMessage(data.message || "Failed to process dataset on backend.");
      }
    } catch (err) {
      console.error("Batch prediction upload error:", err);
      setUploadMessage("Server connection error during dataset analysis.");
    } finally {
      setIsAnalyzing(false);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = processCSV(e.target.result);
        setDatasetRows(result.rows);
      } catch (error) {
        console.error(error);
      }
    };
    reader.onerror = () => {
      setUploadMessage("Error reading the dataset file.");
    };
    reader.readAsText(targetFile);
  };

  // Backwards compatibility
  const handleDatasetUpload = (event) => {
    handleFileSelect(event);
  };

  /*
   * Clear dataset
   */
  const clearDataset = () => {
    setDataset(null);
    setSelectedDatasetFile(null);
    setDatasetRows([]);
    setBatchResults(null);
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
      <Login
        onLogin={(userData) => {
          if (userData) setCurrentUser(userData);
          setIsLoggedIn(true);
        }}
      />
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
        {/* REAL-TIME FLOATING TOAST NOTIFICATION */}
        {toastNotification && (
          <div
            style={{
              position: "fixed",
              top: "24px",
              right: "24px",
              zIndex: 10000,
              background:
                toastNotification.severity === "Critical"
                  ? "#dc2626"
                  : toastNotification.severity === "High"
                  ? "#ea580c"
                  : toastNotification.severity === "Medium"
                  ? "#2563eb"
                  : "#16a34a",
              color: "#ffffff",
              padding: "14px 20px",
              borderRadius: "12px",
              boxShadow: "0 12px 35px rgba(0, 0, 0, 0.35)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              maxWidth: "420px",
              animation: "fadeIn 0.25s ease-in-out",
            }}
          >
            <div style={{ fontSize: "22px", display: "flex", alignItems: "center" }}>
              {toastNotification.severity === "Critical" || toastNotification.severity === "High" ? (
                <FaExclamationTriangle />
              ) : (
                <FaShieldAlt />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "700", fontSize: "14px" }}>{toastNotification.title}</div>
              <div style={{ fontSize: "12px", opacity: 0.9, marginTop: "2px" }}>{toastNotification.message}</div>
            </div>
            <button
              onClick={() => setToastNotification(null)}
              style={{
                background: "none",
                border: "none",
                color: "#ffffff",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                opacity: 0.8,
              }}
            >
              <FaTimesCircle style={{ fontSize: "16px" }} />
            </button>
          </div>
        )}

        {/* NAVBAR */}
        <div className="navbar">
          <div>
            <h1>AI Based Cyber Defence</h1>
            <p>
              Intelligent Network Threat Detection & Monitoring
            </p>
          </div>

          <div className="profile" style={{ position: "relative" }}>
            {/* NOTIFICATION BELL WITH BADGE & DROPDOWN */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                title="Notifications"
                style={{
                  background: showNotifications ? "rgba(37, 99, 235, 0.15)" : "transparent",
                  border: "none",
                  borderRadius: "50%",
                  padding: "8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  transition: "background 0.2s ease",
                }}
              >
                <FaBell
                  className="bell"
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    color: showNotifications ? "#2563eb" : darkMode ? "#cbd5e1" : "#475569",
                  }}
                />
                {unreadNotificationsCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "2px",
                      right: "2px",
                      background: "#ef4444",
                      color: "#ffffff",
                      fontSize: "10px",
                      fontWeight: "700",
                      borderRadius: "10px",
                      minWidth: "18px",
                      height: "18px",
                      padding: "0 4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 0 8px rgba(239, 68, 68, 0.6)",
                    }}
                  >
                    {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* NOTIFICATIONS DROPDOWN PANEL */}
              {showNotifications && (
                <div
                  style={{
                    position: "absolute",
                    top: "48px",
                    right: "0",
                    width: "360px",
                    maxWidth: "90vw",
                    backgroundColor: darkMode ? "#1e293b" : "#ffffff",
                    color: darkMode ? "#f8fafc" : "#0f172a",
                    borderRadius: "14px",
                    boxShadow: "0 20px 45px rgba(0, 0, 0, 0.25)",
                    border: darkMode ? "1px solid #334155" : "1px solid #e2e8f0",
                    zIndex: 9999,
                    overflow: "hidden",
                    animation: "fadeIn 0.2s ease-in-out",
                  }}
                >
                  {/* Dropdown Header */}
                  <div
                    style={{
                      padding: "14px 18px",
                      borderBottom: darkMode ? "1px solid #334155" : "1px solid #f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: darkMode ? "#0f172a" : "#f8fafc",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong style={{ fontSize: "14px" }}>Notifications</strong>
                      {unreadNotificationsCount > 0 && (
                        <span
                          style={{
                            background: "rgba(239, 68, 68, 0.15)",
                            color: "#ef4444",
                            fontSize: "11px",
                            fontWeight: "700",
                            padding: "2px 8px",
                            borderRadius: "10px",
                          }}
                        >
                          {unreadNotificationsCount} new
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <button
                        onClick={markAllNotificationsAsRead}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#2563eb",
                          fontSize: "12px",
                          cursor: "pointer",
                          fontWeight: "600",
                          padding: 0,
                        }}
                      >
                        Read all
                      </button>
                      <span style={{ color: "#94a3b8" }}>•</span>
                      <button
                        onClick={clearAllNotifications}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#94a3b8",
                          fontSize: "12px",
                          cursor: "pointer",
                          fontWeight: "500",
                          padding: 0,
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div style={{ maxHeight: "360px", overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: "30px 20px", textAlign: "center", color: "#94a3b8" }}>
                        <FaCheckCircle style={{ fontSize: "32px", color: "#10b981", marginBottom: "8px" }} />
                        <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: darkMode ? "#e2e8f0" : "#334155" }}>
                          All caught up!
                        </p>
                        <small style={{ fontSize: "12px" }}>No active security alerts or notifications</small>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            setNotifications((prev) =>
                              prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
                            );
                          }}
                          style={{
                            padding: "12px 18px",
                            borderBottom: darkMode ? "1px solid #334155" : "1px solid #f1f5f9",
                            backgroundColor: n.read
                              ? "transparent"
                              : darkMode
                              ? "rgba(37, 99, 235, 0.12)"
                              : "rgba(37, 99, 235, 0.05)",
                            borderLeft: `4px solid ${
                              n.severity === "Critical"
                                ? "#ef4444"
                                : n.severity === "High"
                                ? "#f59e0b"
                                : n.severity === "Medium"
                                ? "#3b82f6"
                                : "#10b981"
                            }`,
                            cursor: "pointer",
                            transition: "background 0.15s ease",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                            <strong
                              style={{
                                fontSize: "13px",
                                color:
                                  n.severity === "Critical"
                                    ? "#ef4444"
                                    : n.severity === "High"
                                    ? "#f59e0b"
                                    : darkMode
                                    ? "#f1f5f9"
                                    : "#0f172a",
                              }}
                            >
                              {n.title}
                            </strong>
                            <small style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap" }}>
                              {n.time}
                            </small>
                          </div>
                          <p style={{ margin: "4px 0 0", fontSize: "12px", color: darkMode ? "#cbd5e1" : "#64748b", lineHeight: "1.4" }}>
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Dropdown Footer */}
                  <div
                    style={{
                      padding: "10px 18px",
                      background: darkMode ? "#0f172a" : "#f8fafc",
                      borderTop: darkMode ? "1px solid #334155" : "1px solid #f1f5f9",
                      textAlign: "center",
                    }}
                  >
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        setActiveMenu("Security Alerts");
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#2563eb",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        padding: "4px",
                      }}
                    >
                      View All Security Alerts →
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="profile-info">
              <strong>{currentUser.name}</strong>
              <small>{currentUser.role || "Administrator"}</small>
            </div>

            <FaUserCircle
              className="user"
              title="View Profile"
              onClick={() => setActiveMenu("User Profile")}
            />

            <button
              onClick={() => setIsLoggedIn(false)}
              title="Sign Out"
              style={{
                marginLeft: "8px",
                padding: "6px 12px",
                fontSize: "12px",
                background: "rgba(239, 68, 68, 0.15)",
                color: "#ef4444",
                border: "1px solid #ef4444",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Logout
            </button>
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
                  {selectedDatasetFile
                    ? selectedDatasetFile.name
                    : dataset
                    ? dataset.name
                    : "Upload Network Traffic Dataset"}
                </h3>

                <p>
                  {selectedDatasetFile
                    ? `📁 Selected: "${selectedDatasetFile.name}" (${(selectedDatasetFile.size / 1024).toFixed(1)} KB) — Click "Submit Dataset" below.`
                    : "Supported formats: CSV, TXT (NSL-KDD benchmark)"}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "10px", marginTop: "12px" }}>
                  <label className="upload-btn">
                    <FaUpload />
                    {selectedDatasetFile || dataset ? "Choose Different File" : "Choose CSV File"}

                    <input
                      type="file"
                      accept=".csv, .txt"
                      onChange={handleFileSelect}
                      hidden
                    />
                  </label>

                  <button
                    className="submit-btn"
                    onClick={handleSubmitDataset}
                    disabled={!selectedDatasetFile || isAnalyzing}
                    title={selectedDatasetFile ? "Submit chosen dataset for AI analysis" : "Please choose a CSV file first"}
                  >
                    <FaPaperPlane />
                    {isAnalyzing ? "Submitting & Analyzing..." : "Submit Dataset"}
                  </button>

                  <button
                    className="sample-btn"
                    onClick={downloadSample}
                  >
                    <FaDownload />
                    Download Sample
                  </button>

                  {(dataset || selectedDatasetFile) && (
                    <button
                      className="clear-btn"
                      onClick={clearDataset}
                    >
                      <FaTrash />
                      Remove
                    </button>
                  )}
                </div>

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
                          <tr key={alert._id || index}>
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

        {/* LIVE TRAFFIC MONITORING & SIMULATOR */}

        {activeMenu === "Live Traffic" && (
          <div className="page-section">
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <h2>Live Traffic Monitoring & SOC Feed</h2>
                <p>
                  Real-time network packet inspection powered by 5-class Random Forest AI
                </p>
              </div>

              {/* SIMULATOR CONTROLS */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 14px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "700",
                    background: isStreaming ? "rgba(16, 185, 129, 0.15)" : "rgba(100, 116, 139, 0.15)",
                    color: isStreaming ? "#10b981" : "#64748b",
                    border: isStreaming ? "1px solid #10b981" : "1px solid #94a3b8",
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: isStreaming ? "#10b981" : "#94a3b8",
                      boxShadow: isStreaming ? "0 0 8px #10b981" : "none",
                    }}
                  ></span>
                  {isStreaming ? "STREAMING ACTIVE (~2.2s)" : "STREAM PAUSED"}
                </div>

                <button
                  onClick={() => setIsStreaming(!isStreaming)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: "none",
                    background: isStreaming ? "#f59e0b" : "#10b981",
                    color: "#ffffff",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer",
                    boxShadow: isStreaming
                      ? "0 4px 14px rgba(245, 158, 11, 0.35)"
                      : "0 4px 14px rgba(16, 185, 129, 0.35)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {isStreaming ? <FaPause /> : <FaPlay />}
                  {isStreaming ? "Pause Stream" : "Start Live Stream"}
                </button>

                <button
                  onClick={() => {
                    setLivePackets([]);
                    setStreamStats({ total: 0, normal: 0, attacks: 0 });
                  }}
                  title="Clear Feed"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: darkMode ? "1px solid #334155" : "1px solid #cbd5e1",
                    background: darkMode ? "#1e293b" : "#ffffff",
                    color: darkMode ? "#cbd5e1" : "#475569",
                    fontWeight: "600",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  <FaSyncAlt />
                  Clear
                </button>
              </div>
            </div>

            {/* LIVE KPI METRICS */}
            <div className="cards" style={{ marginTop: "16px" }}>
              <div className="card">
                <FaNetworkWired className="icon" />
                <p>Packets Streamed</p>
                <h3>{streamStats.total}</h3>
                <small style={{ color: "#2563eb", fontWeight: "600" }}>Live SOC ingestion</small>
              </div>

              <div className="card">
                <FaShieldAlt className="icon safe" />
                <p>Normal Verified</p>
                <h3 style={{ color: "#10b981" }}>{streamStats.normal}</h3>
                <small style={{ color: "#10b981", fontWeight: "600" }}>Safe packets passed</small>
              </div>

              <div className="card">
                <FaExclamationTriangle className="icon danger" />
                <p>Intrusions Blocked</p>
                <h3 style={{ color: "#ef4444" }}>{streamStats.attacks}</h3>
                <small style={{ color: "#ef4444", fontWeight: "600" }}>Rogue threats dropped</small>
              </div>

              <div className="card">
                <FaChartLine className="icon warning" />
                <p>Threat Frequency</p>
                <h3 style={{ color: streamStats.attacks > 0 ? "#f59e0b" : "#10b981" }}>
                  {((streamStats.attacks / (streamStats.total || 1)) * 100).toFixed(1)}%
                </h3>
                <small style={{ color: "#64748b" }}>Of total traffic flow</small>
              </div>
            </div>

            {/* REAL-TIME THROUGHPUT GRAPH */}
            <div className="panel" style={{ marginTop: "20px" }}>
              <div className="panel-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3>Real-Time Packet Throughput Waveform</h3>
                  <p>Rolling traffic volume and anomaly spikes across the last 20 evaluations</p>
                </div>
                <div style={{ fontSize: "12px", color: isStreaming ? "#10b981" : "#64748b", fontWeight: "600" }}>
                  {isStreaming ? "● Waveform Updating Live" : "○ Waveform Paused"}
                </div>
              </div>

              <div className="large-graph" style={{ position: "relative", height: "180px", overflow: "hidden" }}>
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
                  <defs>
                    <linearGradient id="liveTrafficGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Baseline grid line */}
                  <line x1="0" y1="70" x2="100" y2="70" stroke={darkMode ? "#334155" : "#e2e8f0"} strokeDasharray="2" strokeWidth="0.5" />
                  <line x1="0" y1="30" x2="100" y2="30" stroke={darkMode ? "#334155" : "#e2e8f0"} strokeDasharray="2" strokeWidth="0.5" />

                  {/* Polyline */}
                  <polyline
                    points={liveSvgPoints}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2.5"
                    vectorEffect="non-scaling-stroke"
                    style={{ transition: "all 0.4s ease" }}
                  />
                </svg>
              </div>
            </div>

            {/* ROLLING LIVE PACKET STREAM TABLE */}
            <div className="panel" style={{ marginTop: "24px" }}>
              <div className="panel-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3>Live Inspected Packet Stream (Latest {livePackets.length})</h3>
                  <p>Real-time packet inspection and automated mitigation verdicts</p>
                </div>
                <span
                  style={{
                    background: "rgba(37, 99, 235, 0.1)",
                    color: "#2563eb",
                    fontSize: "12px",
                    fontWeight: "700",
                    padding: "4px 10px",
                    borderRadius: "6px",
                  }}
                >
                  SOC Stream Active
                </span>
              </div>

              <div style={{ overflowX: "auto", marginTop: "12px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: darkMode ? "#1e293b" : "#f8fafc", textAlign: "left" }}>
                      <th style={{ padding: "10px" }}>Time</th>
                      <th style={{ padding: "10px" }}>Source IP</th>
                      <th style={{ padding: "10px" }}>Protocol</th>
                      <th style={{ padding: "10px" }}>Service</th>
                      <th style={{ padding: "10px" }}>Payload Size</th>
                      <th style={{ padding: "10px" }}>AI Verdict</th>
                      <th style={{ padding: "10px" }}>Confidence</th>
                      <th style={{ padding: "10px", textAlign: "right" }}>Mitigation Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {livePackets.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>
                          Stream buffer is empty. Click <strong>"Start Live Stream"</strong> above to begin packet inspection.
                        </td>
                      </tr>
                    ) : (
                      livePackets.map((pkt) => (
                        <tr
                          key={pkt.id}
                          style={{
                            borderBottom: darkMode ? "1px solid #334155" : "1px solid #f1f5f9",
                            backgroundColor:
                              pkt.verdict === "Attack"
                                ? darkMode
                                  ? "rgba(239, 68, 68, 0.08)"
                                  : "rgba(239, 68, 68, 0.04)"
                                : "transparent",
                            transition: "background 0.2s ease",
                          }}
                        >
                          <td style={{ padding: "10px", color: "#64748b", fontFamily: "monospace" }}>{pkt.time}</td>
                          <td style={{ padding: "10px", fontWeight: "600", fontFamily: "monospace" }}>{pkt.sourceIp}</td>
                          <td style={{ padding: "10px" }}>
                            <span
                              style={{
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: "700",
                                background: pkt.protocol === "TCP" ? "rgba(37, 99, 235, 0.1)" : "rgba(139, 92, 246, 0.1)",
                                color: pkt.protocol === "TCP" ? "#2563eb" : "#8b5cf6",
                              }}
                            >
                              {pkt.protocol}
                            </span>
                          </td>
                          <td style={{ padding: "10px", color: darkMode ? "#cbd5e1" : "#475569" }}>{pkt.service}</td>
                          <td style={{ padding: "10px", color: "#64748b" }}>{pkt.bytes}</td>
                          <td style={{ padding: "10px" }}>
                            <span
                              style={{
                                padding: "3px 8px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: "700",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                background:
                                  pkt.verdict === "Normal"
                                    ? "rgba(16, 185, 129, 0.12)"
                                    : pkt.attackType === "DoS"
                                    ? "rgba(239, 68, 68, 0.15)"
                                    : pkt.attackType === "Probe"
                                    ? "rgba(245, 158, 11, 0.15)"
                                    : "rgba(139, 92, 246, 0.15)",
                                color:
                                  pkt.verdict === "Normal"
                                    ? "#10b981"
                                    : pkt.attackType === "DoS"
                                    ? "#ef4444"
                                    : pkt.attackType === "Probe"
                                    ? "#f59e0b"
                                    : "#8b5cf6",
                              }}
                            >
                              {pkt.verdict === "Normal" ? "✓ Normal Traffic" : `⚠️ ${pkt.attackType} Attack`}
                            </span>
                          </td>
                          <td style={{ padding: "10px", fontWeight: "600" }}>{pkt.confidence}%</td>
                          <td style={{ padding: "10px", textAlign: "right" }}>
                            <span
                              style={{
                                padding: "3px 10px",
                                borderRadius: "20px",
                                fontSize: "11px",
                                fontWeight: "700",
                                background: pkt.status === "Blocked" ? "#ef4444" : "#10b981",
                                color: "#ffffff",
                                boxShadow: pkt.status === "Blocked" ? "0 2px 6px rgba(239, 68, 68, 0.3)" : "none",
                              }}
                            >
                              {pkt.status === "Blocked" ? "🛡️ BLOCKED" : "✓ ALLOWED"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
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
                {selectedDatasetFile
                  ? selectedDatasetFile.name
                  : dataset
                  ? dataset.name
                  : "No Dataset Uploaded"}
              </h2>

              <p>
                {selectedDatasetFile
                  ? `📁 Selected: "${selectedDatasetFile.name}" (${(selectedDatasetFile.size / 1024).toFixed(1)} KB) — Click "Submit Dataset" below.`
                  : datasetRows.length
                  ? `${datasetRows.length} network records are currently loaded.`
                  : "Choose a CSV or TXT dataset file and click Submit to start AI analysis."}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "10px", marginTop: "12px" }}>
                <label className="upload-btn">
                  <FaUpload />
                  {selectedDatasetFile || dataset ? "Choose Different File" : "Choose Dataset File"}

                  <input
                    type="file"
                    accept=".csv, .txt"
                    onChange={handleFileSelect}
                    hidden
                  />
                </label>

                <button
                  className="submit-btn"
                  onClick={handleSubmitDataset}
                  disabled={!selectedDatasetFile || isAnalyzing}
                  title={selectedDatasetFile ? "Submit chosen dataset for AI analysis" : "Please choose a file first"}
                >
                  <FaPaperPlane />
                  {isAnalyzing ? "Submitting & Analyzing..." : "Submit Dataset"}
                </button>

                {(dataset || selectedDatasetFile) && (
                  <button
                    className="clear-btn"
                    onClick={clearDataset}
                  >
                    <FaTrash />
                    Clear Dataset
                  </button>
                )}
              </div>

              {batchResults && (
                <div style={{ marginTop: "24px", width: "100%", textAlign: "left" }}>
                  <h3 style={{ marginBottom: "12px" }}>AI Model Attack Classification Breakdown</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px", marginBottom: "16px" }}>
                    <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid #10b981", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
                      <strong style={{ color: "#10b981", fontSize: "20px" }}>{batchResults.normalCount}</strong>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>Normal Safe</div>
                    </div>
                    <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
                      <strong style={{ color: "#ef4444", fontSize: "20px" }}>{batchResults.breakdown?.DoS || 0}</strong>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>DoS Attacks</div>
                    </div>
                    <div style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid #f59e0b", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
                      <strong style={{ color: "#f59e0b", fontSize: "20px" }}>{batchResults.breakdown?.Probe || 0}</strong>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>Probe Scans</div>
                    </div>
                    <div style={{ background: "rgba(139, 92, 246, 0.1)", border: "1px solid #8b5cf6", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
                      <strong style={{ color: "#8b5cf6", fontSize: "20px" }}>{batchResults.breakdown?.R2L || 0}</strong>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>R2L Attacks</div>
                    </div>
                    <div style={{ background: "rgba(236, 72, 153, 0.1)", border: "1px solid #ec4899", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
                      <strong style={{ color: "#ec4899", fontSize: "20px" }}>{batchResults.breakdown?.U2R || 0}</strong>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>U2R Attacks</div>
                    </div>
                  </div>
                </div>
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
                  Intelligent network traffic classification using our 5-Class Random Forest Model.
                </p>
              </div>
            </div>

            <div className="prediction-grid">
              <div className="prediction-card">
                <FaRobot />

                <h3>Random Forest (Active)</h3>

                <p>
                  Supervised 5-class model classifying DoS, Probe, R2L, U2R, and Normal.
                </p>

                <strong>
                  {modelEvaluation
                    ? `${modelEvaluation.accuracy}%`
                    : modelStats
                    ? `${modelStats.accuracy}%`
                    : "99.88%"}
                </strong>

                <div className="progress">
                  <div
                    style={{
                      width: `${
                        modelEvaluation?.accuracy || modelStats?.accuracy || 99.88
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="prediction-card">
                <FaBug />

                <h3>Precision & Recall</h3>

                <p>
                  Weighted model precision and recall performance on test validation.
                </p>

                <strong>
                  {modelEvaluation
                    ? `${modelEvaluation.precision}%`
                    : "99.88%"}
                </strong>

                <div className="progress">
                  <div
                    style={{
                      width: `${modelEvaluation?.precision || 99.88}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="prediction-card">
                <FaLock />

                <h3>F1-Score</h3>

                <p>
                  Harmonic mean of precision and recall across all attack classes.
                </p>

                <strong>
                  {modelEvaluation
                    ? `${modelEvaluation.f1Score}%`
                    : "99.88%"}
                </strong>

                <div className="progress">
                  <div
                    style={{
                      width: `${modelEvaluation?.f1Score || 99.88}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* LIVE AI PREDICTION TESTER */}
            <div className="panel" style={{ marginTop: "24px" }}>
              <div className="panel-title">
                <div>
                  <h3>Live Network Packet AI Predictor</h3>
                  <p>Test single network traffic samples against the trained Random Forest model (POST /api/predict)</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", margin: "16px 0" }}>
                <button
                  className="upload-btn"
                  style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer" }}
                  onClick={() => {
                    const sample = { duration: 0, protocol_type: "tcp", service: "http", flag: "SF", src_bytes: 181, dst_bytes: 5450, logged_in: 1, count: 8, srv_count: 8 };
                    setSingleInput(sample);
                    handlePredictSingle(sample);
                  }}
                >
                  🟢 Quick Test: Normal Web Traffic
                </button>
                <button
                  className="upload-btn"
                  style={{ padding: "8px 16px", fontSize: "13px", background: "#ef4444", cursor: "pointer" }}
                  onClick={() => {
                    const sample = { duration: 0, protocol_type: "tcp", service: "private", flag: "S0", src_bytes: 0, dst_bytes: 0, count: 250, srv_count: 250, serror_rate: 1.0, srv_serror_rate: 1.0 };
                    setSingleInput(sample);
                    handlePredictSingle(sample);
                  }}
                >
                  🔴 Quick Test: DoS Flood Attack
                </button>
                <button
                  className="upload-btn"
                  style={{ padding: "8px 16px", fontSize: "13px", background: "#f59e0b", cursor: "pointer" }}
                  onClick={() => {
                    const sample = { duration: 0, protocol_type: "icmp", service: "eco_i", flag: "SF", src_bytes: 8, dst_bytes: 0, count: 50, srv_count: 50, same_srv_rate: 1.0 };
                    setSingleInput(sample);
                    handlePredictSingle(sample);
                  }}
                >
                  🟡 Quick Test: Probe / Port Scan
                </button>
              </div>

              {predicting && <p style={{ color: "#2563eb" }}>Analyzing packet with AI model...</p>}

              {singlePrediction && (
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "10px",
                    background: singlePrediction.result === "Normal" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                    border: `1px solid ${singlePrediction.result === "Normal" ? "#10b981" : "#ef4444"}`,
                    marginTop: "16px"
                  }}
                >
                  <h4 style={{ color: singlePrediction.result === "Normal" ? "#10b981" : "#ef4444", marginBottom: "8px" }}>
                    {singlePrediction.result === "Normal" ? "🛡️ Traffic Safe (Normal)" : "⚠️ Threat Detected: Malicious Activity"}
                  </h4>
                  <p style={{ margin: "4px 0" }}>
                    <strong>Detected Category:</strong> <span style={{ textTransform: "uppercase" }}>{singlePrediction.attackType}</span>
                  </p>
                  <p style={{ margin: "4px 0" }}>
                    <strong>Model Confidence:</strong> {(singlePrediction.confidence * 100).toFixed(2)}%
                  </p>
                </div>
              )}
            </div>

            {/* CONFUSION MATRIX DISPLAY */}
            {modelEvaluation?.confusionMatrix && (
              <div className="panel" style={{ marginTop: "24px" }}>
                <div className="panel-title">
                  <div>
                    <h3>Model Evaluation — Confusion Matrix</h3>
                    <p>Validation results on 25,195 test samples from the NSL-KDD dataset</p>
                  </div>
                </div>

                <div style={{ overflowX: "auto", marginTop: "16px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center" }}>
                    <thead>
                      <tr style={{ background: "rgba(37, 99, 235, 0.1)" }}>
                        <th style={{ padding: "10px", border: "1px solid #cbd5e1" }}>True \ Pred</th>
                        {modelEvaluation.matrixLabels?.map((lbl) => (
                          <th key={lbl} style={{ padding: "10px", border: "1px solid #cbd5e1" }}>{lbl}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {modelEvaluation.confusionMatrix.map((row, rIdx) => (
                        <tr key={rIdx}>
                          <td style={{ padding: "10px", fontWeight: "bold", border: "1px solid #cbd5e1", background: "rgba(37, 99, 235, 0.05)" }}>
                            {modelEvaluation.matrixLabels?.[rIdx]}
                          </td>
                          {row.map((val, cIdx) => (
                            <td
                              key={cIdx}
                              style={{
                                padding: "10px",
                                border: "1px solid #cbd5e1",
                                background: rIdx === cIdx ? "rgba(16, 185, 129, 0.15)" : (val > 0 ? "rgba(239, 68, 68, 0.1)" : "transparent"),
                                fontWeight: rIdx === cIdx ? "bold" : "normal"
                              }}
                            >
                              {val.toLocaleString()}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PREDICTION HISTORY LOG (Member 2 Deliverable) */}
            <div className="panel" style={{ marginTop: "24px" }}>
              <div className="panel-title">
                <div>
                  <h3>Prediction History ({predictionHistory.length})</h3>
                  <p>Real-time audit log of past network traffic classifications from MongoDB</p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {["All", "Attack", "Normal"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => {
                        setHistoryFilter(filter);
                        fetchPredictionHistory(filter);
                      }}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        cursor: "pointer",
                        border: "1px solid #cbd5e1",
                        fontWeight: historyFilter === filter ? "bold" : "normal",
                        background: historyFilter === filter ? "#2563eb" : "transparent",
                        color: historyFilter === filter ? "#ffffff" : "inherit",
                      }}
                    >
                      {filter}
                    </button>
                  ))}
                  <button
                    onClick={() => fetchPredictionHistory()}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      cursor: "pointer",
                      border: "1px solid #cbd5e1",
                      background: "transparent",
                      color: "inherit",
                    }}
                  >
                    Refresh
                  </button>
                </div>
              </div>

              <div className="table-wrapper" style={{ marginTop: "12px" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Protocol</th>
                      <th>Service</th>
                      <th>Result</th>
                      <th>Category</th>
                      <th>Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictionHistory.length > 0 ? (
                      predictionHistory.map((pred, idx) => (
                        <tr key={pred._id || idx}>
                          <td style={{ fontSize: "12px", color: "#64748b" }}>
                            {pred.timestamp ? new Date(pred.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "Just now"}
                          </td>
                          <td style={{ textTransform: "uppercase", fontWeight: "600" }}>
                            {pred.protocol}
                          </td>
                          <td>{pred.service}</td>
                          <td>
                            <span className={pred.result === "Normal" ? "safe" : "critical"}>
                              {pred.result}
                            </span>
                          </td>
                          <td className="attack-name">{pred.attackType}</td>
                          <td>{pred.confidence !== undefined ? `${(pred.confidence * 100).toFixed(1)}%` : "N/A"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="no-results">
                          No predictions recorded yet. Test network packets above to generate predictions!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
                  <h3>Detected Threats ({filteredAlerts.length})</h3>
                  <p>
                    Real-time security events generated by the AI detection system
                  </p>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button
                    onClick={handleCreateTestAlert}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "rgba(16, 185, 129, 0.15)",
                      color: "#10b981",
                      border: "1px solid #10b981",
                      borderRadius: "8px",
                      padding: "8px 14px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    + Add Alert
                  </button>

                  <button
                    onClick={exportAlertsCSV}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "rgba(37, 99, 235, 0.15)",
                      color: "#2563eb",
                      border: "1px solid #2563eb",
                      borderRadius: "8px",
                      padding: "8px 14px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    <FaDownload />
                    Export CSV
                  </button>

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
              </div>

              {/* Severity Filter Pills */}
              <div style={{ display: "flex", gap: "8px", margin: "14px 0", flexWrap: "wrap" }}>
                {["All", "Critical", "High", "Medium", "Safe"].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      cursor: "pointer",
                      border: "none",
                      fontWeight: severityFilter === sev ? "bold" : "normal",
                      background:
                        severityFilter === sev
                          ? sev === "Critical"
                            ? "#ef4444"
                            : sev === "High"
                            ? "#f59e0b"
                            : sev === "Safe"
                            ? "#10b981"
                            : "#2563eb"
                          : "rgba(100, 116, 139, 0.15)",
                      color:
                        severityFilter === sev
                          ? "#ffffff"
                          : "inherit",
                    }}
                  >
                    {sev}
                  </button>
                ))}
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Attack</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAlerts.length > 0 ? (
                    filteredAlerts.map(
                      (alert, index) => (
                        <tr key={alert._id || index}>
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

                          <td>
                            <button
                              title="Delete alert"
                              onClick={() => handleDeleteAlert(alert._id, index)}
                              style={{
                                border: "none",
                                background: "rgba(239, 68, 68, 0.12)",
                                color: "#ef4444",
                                cursor: "pointer",
                                padding: "6px 10px",
                                borderRadius: "6px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "12px",
                                fontWeight: "600",
                              }}
                            >
                              <FaTrash /> Delete
                            </button>
                          </td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-results">
                        No security alerts found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* USER PROFILE */}

{activeMenu === "User Profile" && (
  <UserDashboard
    user={currentUser}
    onLogout={() => setIsLoggedIn(false)}
    onUpdateUser={(updated) => setCurrentUser((prev) => ({ ...prev, ...updated }))}
  />
)}
      </main>
    </div>
  );
}

export default App;