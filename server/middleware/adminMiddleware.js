// ============================================================================
// ADMIN CHECK MIDDLEWARE
// Kräver att requireAuth körs innan denna
// ============================================================================

import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });

// Läs in ADMIN_IDS från .env
// Exempel i .env: ADMIN_IDS=1234567890,0987654321
const ADMIN_IDS = process.env.ADMIN_IDS
    ? process.env.ADMIN_IDS.split(",").map(id => id.trim())
    : [];

export const requireAdmin = (req, res, next) => {
    try {
        // Kontroll att requireAuth har fyllt req.user
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Du måste vara inloggad." });
        }

        // Kontrollera om Discord-ID finns bland admin-ID:n
        if (!ADMIN_IDS.includes(req.user.id)) {
            return res.status(403).json({ error: "Åtkomst nekad. Endast admins har behörighet." });
        }

        // Admin godkänd
        return next();

    } catch (err) {
        console.error("AdminMiddleware error:", err);
        return res.status(500).json({ error: "Internt fel i admin-autentisering." });
    }
};