import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { sendDiscordNotification } from "../utils/discordWebhook.js";
import generateId from "../utils/generateId.js";

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Max GB per uppladdning
const MAX_UPLOAD_BYTES = Number(process.env.MAX_STORAGE_GB || 50) * (1024 ** 3);

// ===========================================================================
// FILUPPLADDNING
// ===========================================================================
export const handleFileUpload = async (req, res) => {
    try {
        // 1. Kontrollera att filer finns
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "Inga filer mottagna." });
        }

        // 2. Kontrollera storleksgräns per uppladdning
        let totalUploadBytes = 0;
        req.files.forEach(file => totalUploadBytes += file.size);

        if (totalUploadBytes > MAX_UPLOAD_BYTES) {
            // Ta bort temporära filer
            req.files.forEach(file => fs.unlinkSync(file.path));

            return res.status(413).json({
                error: `Maxgränsen är ${process.env.MAX_STORAGE_GB}GB per uppladdning.`,
                yourSizeGB: (totalUploadBytes / (1024 ** 3)).toFixed(2),
                maxGB: process.env.MAX_STORAGE_GB
            });
        }

        // 3. Hämta användardata från authMiddleware
        const userData = req.user;
        if (!userData) {
            return res.status(401).json({ error: "Du måste vara inloggad." });
        }

        const username = userData.username || "Okänd användare";

        // 4. Skapa unikt ID för uppladdningen
        const uploadId = generateId(); // tex "4f2c9a"

        // 5. Skapa uppladdningsmapp
        const uploadFolder = path.join(__dirname, "../uploads", uploadId);
        fs.mkdirSync(uploadFolder, { recursive: true });

        // 6. Spara metadata
        const metaData = {
            uploader: username,
            uploaderId: userData.id,
            timestamp: new Date().toISOString()
        };

        fs.writeFileSync(
            path.join(uploadFolder, "meta.json"),
            JSON.stringify(metaData, null, 4)
        );

        // 7. Flytta filer från tmp → permanent mapp
        let links = [];

        req.files.forEach(file => {
            const safeName = file.originalname; // rätt stavning
            const newPath = path.join(uploadFolder, safeName);

            fs.renameSync(file.path, newPath);

            // URL till filen (Cloudflare / VPS public dir)
            const fileURL =
                `${process.env.PUBLIC_URL}/${uploadId}/${encodeURIComponent(safeName)}`;

            links.push(fileURL);
        });

        // 8. Skicka logg till Discord
        await sendDiscordNotification(username, links);

        // 9. Skicka tillbaka alla offentliga länkar
        return res.json({
            success: true,
            uploadId,
            links
        });

    } catch (err) {
        console.error("UPLOAD ERROR:", err);

        // Städa tmp om något går fel
        if (req.files) {
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            });
        }

        return res.status(500).json({
            error: "Ett oväntat fel inträffade vid filuppladdningen."
        });
    }
};
// ===========================================================================================
// GAMMAL FILUPPLADDNINGSKOD - BEHÅLL FÖR REFERENS
// ===========================================================================