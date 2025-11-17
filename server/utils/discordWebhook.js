import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// ==========================================================
// Skicka Discord Notis
// ==========================================================
export const sendDiscordNotification = async (username, links = []) => {
    try {
        if (!WEBHOOK_URL) {
            console.error("❌ Ingen DISCORD_WEBHOOK_URL satt i config.env");
            return;
        }

        const message = {
            content: null,
            embeds: [
                {
                    title: "📁 Ny uppladdning",
                    description: `**${username}** har laddat upp nya filer.`,
                    color: 0x3fcf8e,  // Maskin-grön
                    fields: links.length > 0 
                        ? links.map(link => ({
                            name: "🔗 Fil-länk",
                            value: link
                        }))
                        : [
                            {
                                name: "Info",
                                value: "Inga länkar genererades."
                            }
                        ],
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: "Maskin Developments – File Share"
                    }
                }
            ]
        };

        // Skicka meddelandet
        await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(message)
        });

        console.log(`📮 Discord notifierad: ${username} delade ${links.length} filer`);
    } catch (err) {
        console.error("❌ FEL vid Discord-webhook:", err);
    }
};