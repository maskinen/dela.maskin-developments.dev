import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { handleFileUpload } from "../controllers/uploadController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Fix __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Temp upload directory
const tempDir = path.join(__dirname, "../uploads/tmp");

// Create temp folder if missing
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Multer setup (temporary folder)
const upload = multer({
    dest: tempDir,
    limits: {
        fileSize: 50 * 1024 * 1024 * 1024 // 50GB (per fil)
    }
});

// ==============================================================================
// POST /api/upload
// (kräver Discord-inloggning via requireAuth)
// ==============================================================================
router.post("/upload", requireAuth, upload.array("files"), handleFileUpload);

export default router;