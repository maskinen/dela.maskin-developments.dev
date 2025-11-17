import app from "./app.js";
import dotenv from "dotenv";

dotenv.config({ path: "./config/config.env" });

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
    console.log(`Servern körs på http://localhost:${PORT}`);

});