const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema({
    result: {
        type: String,
        required: true,
        enum: ["Normal", "Attack"]
    },
    attackType: {
        type: String,
        required: true
    },
    confidence: {
        type: Number,
        required: true
    },
    protocol: {
        type: String,
        default: "tcp"
    },
    service: {
        type: String,
        default: "http"
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Prediction", predictionSchema);
