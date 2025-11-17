// ===========================================================================
// IMPORTS
// ===========================================================================
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load env
dotenv.config({ path: "./config/config.env" });

// Fix ES module dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes
import authRoutes from "./routes/auth.js";
import uploadRoutes from "./routes/upload.js";
import adminRoutes from "./routes/admin.js";   // <-- LAGT TILL


// =============================================================================
// EXPRESS SETUP
// =============================================================================
const app = express();

// =============================================================================
// MIDDLEWARE
// =============================================================================
app.use(cors({
    origin: process.env.CLIENT_URL,   // Cloudflare Pages-domänen
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// =============================================================================
// ROUTES
// =============================================================================
app.use("/auth", authRoutes);
app.use("/api", uploadRoutes);
app.use("/admin", adminRoutes);       // <-- LAGT TILL


// =============================================================================
// 404 fallback (API only)
// =============================================================================
app.all("*", (req, res) => {
    return res.status(404).json({ error: "API endpoint not found" });
});

export default app;