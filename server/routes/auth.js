import express from "express";
import { loginWithDiscord, discordCallback, logout } from "../controllers/authController.js";

const router = express.Router();

// ============================================================================================
// DISCORD AUTH ROUTES
// ============================================================================================

// Steg 1 - Skicka användaren till Discord
router.get("/discord", loginWithDiscord);

// Steg 2 - Discord skickar tillbaka användaren hit
router.get("/discord/callback", discordCallback);

// Logga ut
router.get("/logout", logout);

export default router;