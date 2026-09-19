const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const multer = require("multer");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

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
// Basic Status Routes
// ==============================
app.get("/", (req, res) => {
    res.json({
        message: "AI Based Cyber Defence Backend is running!"
    });
});

app.get("/api/status", (req, res) => {
    res.json({
        status: "success",
        message: "Cyber Defence API is connected!"
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
// 1. AI PREDICTION API (Single Record)
// ==============================
// Accepts network data input -> Predicts Normal/Attack + Attack Type
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
// 2. DATASET UPLOAD & BATCH PREDICTION
// ==============================
// Uploads CSV dataset -> Preprocesses -> Runs predictions -> Returns summary
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
// 3. MODEL EVALUATION API
// ==============================
// Returns Accuracy, Precision, Recall, Confusion Matrix
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

// ==============================
// 4. MODEL INFO API
// ==============================
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