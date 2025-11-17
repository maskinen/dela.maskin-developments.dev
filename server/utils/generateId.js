import crypto from "crypto";

export default function generateId(length = 10) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const bytes = crypto.randomBytes(length);
    let id = "";

    for (let i = 0; i < bytes.length; i++) {
        id += chars[bytes[i] % chars.length];
    }

    return id;
}