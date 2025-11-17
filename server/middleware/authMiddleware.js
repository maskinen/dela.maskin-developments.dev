export const requireAuth = (req, res, next) => {
    try {
        // Kontrollera att cookie finns
        if (!req.cookies || !req.cookies.user) {
            return res.status(401).json({ error: "Du måste vara inloggad för att fortsätta." });
        }

        // Försök att parsea cookie-data
        let userData;
        try {
            userData = JSON.parse(req.cookies.user);
        } catch (err) {
            return res.status(400).json({ error: "Ogiltig sessiondata." });
        }

        // Kolla att user har Discord ID
        if (!userData.id) {
            return res.status(403).json({ error: "Ogiltig användarsession." });
        }

        // Lägg till user-data i req så controllers kan använda det
        req.user = userData;

        return next();

    } catch (err) {
        console.error("AuthMiddleware error:", err);
        return res.status(500).json({ error: "Internt fel i autentisering." });
    }
};