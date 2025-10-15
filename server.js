const express = require('express');
const compression = require("compression");
const helmet = require("helmet");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

dotenv.config();

// ✅ Adicione compatibilidade
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ CORS CORRETO - Permite TODAS as origens
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.options('*', cors());
app.use(express.json());// server.js
import express from "express";
import compression from "compression";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import { Pool } from "pg";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";

// Validate required env
const required = ["DB_USER","DB_HOST","DB_DATABASE","DB_PASSWORD","DB_PORT"];
for (const v of required) {
  if (!process.env[v]) {
    console.warn(`Warning: env ${v} not set`);
  }
}

// Setup DB pool (use parameterized queries in real routes)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const app = express();

// Security + performance middleware
app.use(helmet());
app.use(compression());
app.use(bodyParser.json({ limit: "10kb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// CORS with environment whitelist
const allowed = (process.env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // allow non-browser tools (e.g. curl)
    if (allowed.length === 0 || allowed.includes(origin)) return cb(null, true);
    cb(new Error("CORS blocked by policy"));
  },
};
app.use(cors(corsOptions));

// Serve static front-end
app.use(express.static(path.join(__dirname, "public"))); // put index.html + assets in /public

// Example: simple feedback POST (parameterized)
app.post("/api/feedback", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });
    const query = `INSERT INTO feedback (name,email,message) VALUES ($1,$2,$3) RETURNING id`;
    const result = await pool.query(query, [name || null, email || null, message]);
    return res.json({ ok: true, id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Health
app.get("/health", (req,res)=> res.json({ok:true, env: NODE_ENV}));

// Fallback to index.html for SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT} (NODE_ENV=${NODE_ENV})`);
});
