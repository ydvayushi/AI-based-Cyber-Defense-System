const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Test route
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
const fs = require("fs");
const path = require("path");

app.get("/api/dataset", (req, res) => {
    const filePath = path.join(__dirname, "uploads", "KDDTrain+.txt");

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
    const filePath = path.join(__dirname, "uploads", "KDDTrain+.txt");

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
// AI Model information API
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
    console.log(`Backend server running on http://localhost:${PORT}`);
});