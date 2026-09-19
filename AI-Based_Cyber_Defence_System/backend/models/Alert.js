const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
    source: {
        type: String,
        required: true,
        trim: true
    },
    attack: {
        type: String,
        required: true,
        trim: true
    },
    severity: {
        type: String,
        enum: ["Low", "Medium", "High", "Critical", "Safe"],
        default: "Medium"
    },
    status: {
        type: String,
        default: "Detected"
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Alert", alertSchema);
