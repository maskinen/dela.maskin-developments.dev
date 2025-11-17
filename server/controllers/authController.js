import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });

// ENV variabler
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI; 
const CLIENT_URL = process.env.CLIENT_URL; // Cloudflare Pages


// ============================================================================
// 1. REDIRECT TILL DISCORD LOGIN
// ============================================================================
export const loginWithDiscord = (req, res) => {
    const authUrl =
        "https://discord.com/api/oauth2/authorize" +
        `?client_id=${CLIENT_ID}` +
        "&response_type=code" +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        "&scope=identify";

    return res.redirect(authUrl);
};


// ============================================================================
// 2. DISCORD CALLBACK
// ============================================================================
export const discordCallback = async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.status(400).send("OAuth-kod saknas.");
    }

    try {
        // ------------------------------------------------------------
        // Steg 1: Hämta access token från Discord
        // ------------------------------------------------------------
        const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: "authorization_code",
                redirect_uri: REDIRECT_URI,
                code
            })
        });

        const tokenData = await tokenResponse.json();

        if (!tokenData.access_token) {
            console.error("❌ TOKEN ERROR:", tokenData);
            return res.status(400).send("Kunde inte hämta access token.");
        }

        // ------------------------------------------------------------
        // Steg 2: Hämta användardata från Discord API
        // ------------------------------------------------------------
        const userResponse = await fetch("https://discord.com/api/users/@me", {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });

        const user = await userResponse.json();

        if (!user.id) {
            console.error("❌ USER FETCH ERROR:", user);
            return res.status(400).send("Kunde inte hämta användarinfo.");
        }

        // ------------------------------------------------------------
        // Steg 3: Spara session i cookie
        // ------------------------------------------------------------
        res.cookie("user", JSON.stringify({
            id: user.id,
            username: user.username,
            discriminator: user.discriminator,
            avatar: user.avatar
        }), {
            httpOnly: true,
            secure: true,            // krävs för Cloudflare proxy (HTTPS)
            sameSite: "Lax",
            maxAge: 1000 * 60 * 60 * 24 // 1 dag
        });

        // ------------------------------------------------------------
        // Steg 4: Skicka tillbaka användaren till upload-sidan
        // ------------------------------------------------------------
        return res.redirect(`${CLIENT_URL}/upload.html`);

    } catch (err) {
        console.error("OAuth callback error:", err);
        return res.status(500).send("Internt serverfel vid Discord-inloggning.");
    }
};


// ============================================================================
// 3. LOGGA UT
// ============================================================================
export const logout = (req, res) => {
    res.clearCookie("user", { httpOnly: true, secure: true, sameSite: "Lax" });
    return res.redirect("/");
};
// ===========================================================================================================================
// GAMMAL FILUPPLADDNINGSKOD - BEHÅLL FÖR REFERENS
// ===========================================================================================================================