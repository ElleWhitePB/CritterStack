// src/index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import creaturesRouter from "./routes/creatures.js";

const app = express();

// CORS middleware
app.use(cors());

// JSON parsing middleware
app.use(express.json());

// Register routes
app.use("/creatures", creaturesRouter);

// Health endpoint
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// Start server
app.listen(3000, () => {
    console.log("Creature Service listening on port 3000");
});
