import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";
import { getAllUploads, deleteUploadFolder } from "../controllers/adminController.js";

const router = express.Router();

router.get("/uploads", requireAuth, requireAdmin, getAllUploads);
router.delete("/delete/:uploadId", requireAuth, requireAdmin, deleteUploadFolder);

export default router;