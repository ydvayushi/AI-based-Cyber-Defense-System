require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const multer = require("multer");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Alert = require("./models/Alert");
const Prediction = require("./models/Prediction");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "cyber_defence_super_secret_key_2026";

app.use(cors());
app.use(express.json());

// ==============================
// MongoDB Connection with Resilient Fallback
// ==============================
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cyber_defence";
let isDbConnected = false;

// Default initial alerts
const defaultAlerts = [
    { source: "192.168.1.20", attack: "DoS Attack", severity: "Critical", status: "Blocked" },
    { source: "192.168.1.35", attack: "Probe Attack", severity: "High", status: "Investigating" },
    { source: "10.0.0.14", attack: "R2L Attack", severity: "Medium", status: "Detected" },
    { source: "192.168.1.10", attack: "Normal Traffic", severity: "Safe", status: "Allowed" }
];
let memoryAlerts = defaultAlerts.map((a, i) => ({ _id: "alert-" + (i + 1), ...a, timestamp: new Date() }));
let memoryPredictions = [];

// In-memory fallback if MongoDB local service is not yet started
let memoryUsers = [
    {
        _id: "default-admin-1",
        name: "Arshiya",
        email: "arshiya@cyberdefence.com",
        password: "", // hashed below
        role: "Administrator",
        createdAt: new Date()
    }
];

// Pre-hash password for default analyst account
bcrypt.hash("admin123", 10).then((hashed) => {
    memoryUsers[0].password = hashed;
});

mongoose.connect(MONGO_URI)
    .then(async () => {
        isDbConnected = true;
        console.log("Connected to MongoDB database successfully!");

        // Seed default analyst if collection is empty
        try {
            const count = await User.countDocuments();
            if (count === 0) {
                const defaultHashed = await bcrypt.hash("admin123", 10);
                await User.create({
                    name: "Arshiya",
                    email: "arshiya@cyberdefence.com",
                    password: defaultHashed,
                    role: "Administrator"
                });
                console.log("Default Arshiya account created in MongoDB.");
            }

            const alertCount = await Alert.countDocuments();
            if (alertCount === 0) {
                await Alert.insertMany(defaultAlerts);
                console.log("Default security alerts seeded into MongoDB.");
            }
        } catch (e) {
            console.warn("Could not check/seed defaults:", e.message);
        }
    })
    .catch((err) => {
        console.warn("MongoDB connection warning:", err.message);
        console.log("Running in hybrid mode: In-memory store active for user authentication & management.");
    });

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + "-" + file.originalname);
    }
});
const upload = multer({ storage });

// Helper to execute Python prediction engine
function executePython(args, stdinInput = null) {
    return new Promise((resolve, reject) => {
        const pythonCommand = process.platform === "win32" ? "python" : "python3";
        const scriptPath = path.join(__dirname, "predict.py");
        const proc = spawn(pythonCommand, [scriptPath, ...args]);

        let stdout = "";
        let stderr = "";

        if (stdinInput) {
            proc.stdin.write(stdinInput);
            proc.stdin.end();
        }

        proc.stdout.on("data", (data) => {
            stdout += data.toString();
        });

        proc.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        proc.on("close", (code) => {
            if (code !== 0) {
                return reject(new Error(stderr || `Process exited with code ${code}`));
            }
            try {
                const parsed = JSON.parse(stdout.trim());
                resolve(parsed);
            } catch (err) {
                reject(new Error(`Failed to parse Python output: ${stdout}\nStderr: ${stderr}`));
            }
        });

        proc.on("error", (err) => {
            reject(err);
        });
    });
}

// ==============================
// 1. AUTH & TEAM ID MANAGEMENT ROUTES (Path A)
// ==============================

// Register / Create Account ID
app.post("/api/auth/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                status: "error",
                message: "Please provide name, email, and password."
            });
        }

        const cleanEmail = email.toLowerCase().trim();
        const hashedPassword = await bcrypt.hash(password, 10);
        const assignedRole = role || "Security Analyst";

        if (isDbConnected) {
            const existing = await User.findOne({ email: cleanEmail });
            if (existing) {
                return res.status(400).json({
                    status: "error",
                    message: "An account with this email already exists."
                });
            }

            const newUser = await User.create({
                name: name.trim(),
                email: cleanEmail,
                password: hashedPassword,
                role: assignedRole
            });

            const token = jwt.sign(
                { id: newUser._id, email: newUser.email, role: newUser.role },
                JWT_SECRET,
                { expiresIn: "7d" }
            );

            return res.status(201).json({
                status: "success",
                message: "Account created successfully in database!",
                token,
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    createdAt: newUser.createdAt
                }
            });
        } else {
            // In-memory store
            const existing = memoryUsers.find((u) => u.email === cleanEmail);
            if (existing) {
                return res.status(400).json({
                    status: "error",
                    message: "An account with this email already exists."
                });
            }

            const newUser = {
                _id: "user-" + Date.now(),
                name: name.trim(),
                email: cleanEmail,
                password: hashedPassword,
                role: assignedRole,
                createdAt: new Date()
            };
            memoryUsers.push(newUser);

            const token = jwt.sign(
                { id: newUser._id, email: newUser.email, role: newUser.role },
                JWT_SECRET,
                { expiresIn: "7d" }
            );

            return res.status(201).json({
                status: "success",
                message: "Account created successfully!",
                token,
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    createdAt: newUser.createdAt
                }
            });
        }
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to create account.",
            details: error.message
        });
    }
});

// Login / Sign In
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: "error",
                message: "Please enter your email and password."
            });
        }

        const cleanEmail = email.toLowerCase().trim();
        let user = null;

        if (isDbConnected) {
            user = await User.findOne({ email: cleanEmail });
        } else {
            user = memoryUsers.find((u) => u.email === cleanEmail);
        }

        if (!user) {
            return res.status(401).json({
                status: "error",
                message: "Invalid email or password."
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                status: "error",
                message: "Invalid email or password."
            });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            status: "success",
            message: "Login successful!",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to authenticate.",
            details: error.message
        });
    }
});

// Get All Team Members / Registered Accounts
app.get("/api/auth/users", async (req, res) => {
    try {
        let users = [];

        if (isDbConnected) {
            users = await User.find({}, "-password").sort({ createdAt: -1 });
        } else {
            users = memoryUsers.map(({ password, ...rest }) => rest);
        }

        res.json({
            status: "success",
            count: users.length,
            users
        });
    } catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch team members."
        });
    }
});

// Delete Account ID
app.delete("/api/auth/users/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (isDbConnected) {
            const deleted = await User.findByIdAndDelete(id);
            if (!deleted) {
                return res.status(404).json({
                    status: "error",
                    message: "User ID not found in database."
                });
            }
        } else {
            const index = memoryUsers.findIndex((u) => String(u._id) === String(id));
            if (index === -1) {
                return res.status(404).json({
                    status: "error",
                    message: "User ID not found."
                });
            }
            memoryUsers.splice(index, 1);
        }

        res.json({
            status: "success",
            message: "User account ID deleted successfully."
        });
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to delete account ID."
        });
    }
});

// ==============================
// Basic Status Routes
// ==============================
app.get("/", (req, res) => {
    res.json({
        message: "AI Based Cyber Defence Backend is running!",
        database: isDbConnected ? "MongoDB Connected" : "In-Memory Store Active"
    });
});

app.get("/api/status", (req, res) => {
    res.json({
        status: "success",
        message: "Cyber Defence API is connected!",
        database: isDbConnected ? "MongoDB Connected" : "In-Memory Store Active"
    });
});

// ==============================
// Dataset Inspection Routes
// ==============================
app.get("/api/dataset", (req, res) => {
    const filePath = path.join(uploadsDir, "KDDTrain+.txt");

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            status: "error",
            message: "KDDTrain+ dataset not found."
        });
    }

    const data = fs.readFileSync(filePath, "utf8");
    const rows = data.trim().split("\n");

    res.json({
        status: "success",
        message: "KDDTrain+ dataset loaded successfully!",
        totalRows: rows.length,
        firstRow: rows[0]
    });
});

app.get("/api/dataset/stats", (req, res) => {
    const filePath = path.join(uploadsDir, "KDDTrain+.txt");

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            status: "error",
            message: "KDDTrain+ dataset not found."
        });
    }

    const data = fs.readFileSync(filePath, "utf8").trim();
    const rows = data.split(/\r?\n/);

    let normal = 0;
    let dos = 0;
    let probe = 0;
    let r2l = 0;
    let u2r = 0;
    let otherAttack = 0;

    rows.forEach((row) => {
        const columns = row.split(",");
        const label = columns[41]?.trim();

        if (label === "normal") {
            normal++;
        } else if (
            ["back", "land", "neptune", "pod", "smurf", "teardrop"].includes(label)
        ) {
            dos++;
        } else if (
            ["ipsweep", "nmap", "portsweep", "satan"].includes(label)
        ) {
            probe++;
        } else if (
            ["ftp_write", "guess_passwd", "imap", "multihop", "phf", "spy", "warezclient", "warezmaster"].includes(label)
        ) {
            r2l++;
        } else if (
            ["buffer_overflow", "loadmodule", "perl", "rootkit"].includes(label)
        ) {
            u2r++;
        } else {
            otherAttack++;
        }
    });

    res.json({
        status: "success",
        totalRows: rows.length,
        normal,
        dos,
        probe,
        r2l,
        u2r,
        otherAttack
    });
});

// ==============================
// AI PREDICTION APIS
// ==============================
app.post("/api/predict", async (req, res) => {
    try {
        const networkData = req.body;

        if (!networkData || Object.keys(networkData).length === 0) {
            return res.status(400).json({
                status: "error",
                message: "Network data input is required."
            });
        }

        const inputJson = JSON.stringify(networkData);
        const result = await executePython([], inputJson);

        // Auto-save to Prediction History (Member 2 Deliverable)
        if (result && result.status === "success") {
            const predLog = {
                result: result.result,
                attackType: result.attackType,
                confidence: result.confidence,
                protocol: networkData.protocol_type || "tcp",
                service: networkData.service || "http",
                timestamp: new Date()
            };

            if (isDbConnected) {
                try {
                    await Prediction.create(predLog);
                    if (result.result === "Attack") {
                        await Alert.create({
                            source: `192.168.1.${Math.floor(Math.random() * 200 + 10)}`,
                            attack: `${result.attackType} Attack`,
                            severity: result.attackType === "DoS" || result.attackType === "U2R" ? "Critical" : "High",
                            status: "Detected",
                            timestamp: new Date()
                        });
                    }
                } catch (e) {
                    console.warn("DB logging error in predict:", e.message);
                }
            } else {
                memoryPredictions.unshift({ _id: "pred-" + Date.now(), ...predLog });
                if (result.result === "Attack") {
                    memoryAlerts.unshift({
                        _id: "alert-" + Date.now(),
                        source: `192.168.1.${Math.floor(Math.random() * 200 + 10)}`,
                        attack: `${result.attackType} Attack`,
                        severity: result.attackType === "DoS" || result.attackType === "U2R" ? "Critical" : "High",
                        status: "Detected",
                        timestamp: new Date()
                    });
                }
            }
        }

        res.json(result);
    } catch (error) {
        console.error("Prediction API Error:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to generate prediction.",
            details: error.message
        });
    }
});

// ==============================
// PREDICTION HISTORY API (Member 2 Deliverable)
// ==============================
app.get("/api/predictions/history", async (req, res) => {
    try {
        const { attackType, result, search, limit = 50 } = req.query;
        let query = {};
        if (attackType && attackType !== "All") query.attackType = attackType;
        if (result && result !== "All") query.result = result;

        let predictions = [];
        if (isDbConnected) {
            predictions = await Prediction.find(query).sort({ timestamp: -1 }).limit(Number(limit));
        } else {
            predictions = memoryPredictions.filter((p) => {
                const matchAttack = !query.attackType || p.attackType.toLowerCase() === query.attackType.toLowerCase();
                const matchResult = !query.result || p.result.toLowerCase() === query.result.toLowerCase();
                return matchAttack && matchResult;
            }).slice(0, Number(limit));
        }

        if (search) {
            const s = search.toLowerCase();
            predictions = predictions.filter(
                (p) =>
                    p.attackType.toLowerCase().includes(s) ||
                    p.protocol.toLowerCase().includes(s) ||
                    p.service.toLowerCase().includes(s)
            );
        }

        res.json({
            status: "success",
            count: predictions.length,
            predictions
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to fetch prediction history.",
            details: error.message
        });
    }
});

// ==============================
// SECURITY ALERTS API (Member 2 Deliverable)
// ==============================
app.get("/api/alerts", async (req, res) => {
    try {
        const { severity, search } = req.query;
        let query = {};
        if (severity && severity !== "All") query.severity = severity;

        let alerts = [];
        if (isDbConnected) {
            alerts = await Alert.find(query).sort({ timestamp: -1 });
        } else {
            alerts = memoryAlerts.filter((a) => {
                return !query.severity || a.severity.toLowerCase() === query.severity.toLowerCase();
            });
        }

        if (search) {
            const s = search.toLowerCase();
            alerts = alerts.filter(
                (a) =>
                    a.source.toLowerCase().includes(s) ||
                    a.attack.toLowerCase().includes(s) ||
                    a.status.toLowerCase().includes(s)
            );
        }

        res.json({
            status: "success",
            count: alerts.length,
            alerts
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to fetch security alerts.",
            details: error.message
        });
    }
});

app.post("/api/alerts", async (req, res) => {
    try {
        const { source, attack, severity, status } = req.body;
        if (!source || !attack) {
            return res.status(400).json({
                status: "error",
                message: "Source and attack type are required."
            });
        }

        const newAlert = {
            source: source.trim(),
            attack: attack.trim(),
            severity: severity || "Medium",
            status: status || "Detected",
            timestamp: new Date()
        };

        if (isDbConnected) {
            const created = await Alert.create(newAlert);
            res.status(201).json({
                status: "success",
                message: "Alert logged successfully in database.",
                alert: created
            });
        } else {
            const created = { _id: "alert-" + Date.now(), ...newAlert };
            memoryAlerts.unshift(created);
            res.status(201).json({
                status: "success",
                message: "Alert logged successfully.",
                alert: created
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to create security alert.",
            details: error.message
        });
    }
});

app.delete("/api/alerts/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (isDbConnected) {
            await Alert.findByIdAndDelete(id);
        } else {
            const idx = memoryAlerts.findIndex((a) => String(a._id) === String(id));
            if (idx !== -1) memoryAlerts.splice(idx, 1);
        }
        res.json({
            status: "success",
            message: "Alert deleted successfully."
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to delete alert.",
            details: error.message
        });
    }
});

app.post("/api/predict/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: "error",
                message: "No dataset file uploaded. Please provide a CSV/TXT file."
            });
        }

        const uploadedFilePath = req.file.path;
        const result = await executePython(["--file", uploadedFilePath]);

        res.json(result);
    } catch (error) {
        console.error("Batch Prediction Error:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to process dataset file.",
            details: error.message
        });
    }
});

// ==============================
// MODEL EVALUATION APIS
// ==============================
app.get("/api/model/evaluation", (req, res) => {
    const evalPath = path.join(__dirname, "model_evaluation.json");

    if (!fs.existsSync(evalPath)) {
        return res.status(404).json({
            status: "error",
            message: "Model evaluation data not found. Please train the model first."
        });
    }

    try {
        const evaluation = JSON.parse(fs.readFileSync(evalPath, "utf8"));
        res.json({
            status: "success",
            ...evaluation
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to read model evaluation data.",
            details: error.message
        });
    }
});

app.get("/api/model-info", (req, res) => {
    const modelInfoPath = path.join(__dirname, "model_info.json");

    if (!fs.existsSync(modelInfoPath)) {
        return res.status(404).json({
            status: "error",
            message: "Model information not found. Please train the model first."
        });
    }

    const modelInfo = JSON.parse(
        fs.readFileSync(modelInfoPath, "utf8")
    );

    res.json({
        status: "success",
        ...modelInfo
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`AI Cyber Defence Backend running on http://localhost:${PORT}`);
});