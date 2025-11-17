import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// ============================================================================
// HÄMTA ALLA UPPLADDNINGAR + STATISTIK
// ============================================================================
export const getAllUploads = (req, res) => {
    try {
        const uploadsDir = path.join(__dirname, "../uploads");
        const folders = fs.readdirSync(uploadsDir).filter(f => f !== "tmp");

        let uploads = [];
        let totalBytes = 0;
        let fileCount = 0;

        let biggestFile = { name: null, size: 0 };
        let smallestFile = { name: null, size: Infinity };

        folders.forEach(folder => {
            const folderPath = path.join(uploadsDir, folder);
            const files = fs.readdirSync(folderPath);

            // Metadata per uppladdning
            let uploader = "Okänd";
            let uploaderId = null;
            let timestamp = null;

            const metaPath = path.join(folderPath, "meta.json");
            if (fs.existsSync(metaPath)) {
                const meta = JSON.parse(fs.readFileSync(metaPath));
                uploader = meta.uploader;
                uploaderId = meta.uploaderId;
                timestamp = meta.timestamp;
            }

            files.forEach(fileName => {
                // Hoppa över metadata-filen
                if (fileName === "meta.json") return;

                const filePath = path.join(folderPath, fileName);
                const stats = fs.statSync(filePath);

                totalBytes += stats.size;
                fileCount++;

                // Största/minsta
                if (stats.size > biggestFile.size) {
                    biggestFile = { name: fileName, size: stats.size };
                }
                if (stats.size < smallestFile.size) {
                    smallestFile = { name: fileName, size: stats.size };
                }

                uploads.push({
                    id: folder,
                    filename: fileName,
                    sizeBytes: stats.size,
                    uploader,
                    uploaderId,
                    timestamp,
                    url: `${process.env.PUBLIC_URL}/${folder}/${encodeURIComponent(fileName)}`
                });
            });
        });

        const uploadCount = folders.length;

        const totalGB = totalBytes / (1024 ** 3);
        const maxGB = Number(process.env.MAX_STORAGE_GB || 50);

        const averageFileSize =
            fileCount === 0 ? 0 : (totalBytes / fileCount) / (1024 ** 2);

        return res.json({
            uploads,
            stats: {
                totalGB: totalGB.toFixed(2),
                maxGB,
                percentUsed: ((totalGB / maxGB) * 100).toFixed(1),
                fileCount,
                uploadCount,
                averageFileSizeMB: averageFileSize.toFixed(2),
                biggestFile: {
                    name: biggestFile.name,
                    sizeMB: (biggestFile.size / (1024 ** 2)).toFixed(2)
                },
                smallestFile: {
                    name: smallestFile.name,
                    sizeMB: (smallestFile.size / (1024 ** 2)).toFixed(2)
                }
            }
        });

    } catch (err) {
        console.error("Admin fetch error:", err);
        return res.status(500).json({ error: "Kunde inte hämta uploads." });
    }
};


// ============================================================================
// RADERA EN UPPLADDNINGSMAPP
// ============================================================================
export const deleteUploadFolder = (req, res) => {
    try {
        const { uploadId } = req.params;

        // Förhindra radering av hela upload-root
        if (!uploadId || uploadId.includes("/") || uploadId.length < 3) {
            return res.status(400).json({ error: "Ogiltigt upload-id." });
        }

        const uploadPath = path.join(__dirname, "../uploads", uploadId);

        if (!fs.existsSync(uploadPath)) {
            return res.status(404).json({ error: "Mappen finns inte." });
        }

        fs.rmSync(uploadPath, { recursive: true, force: true });

        return res.json({ success: true, message: `Mappen '${uploadId}' har raderats.` });

    } catch (err) {
        console.error("Delete folder error:", err);
        return res.status(500).json({ error: "Fel vid radering." });
    }
};
// ===========================================================================================================================
// GAMMAL FILUPPLADDNINGSKOD - BEHÅLL FÖR REFERENS
// ===========================================================================