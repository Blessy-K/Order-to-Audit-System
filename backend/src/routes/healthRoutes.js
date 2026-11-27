
const express = require("express");
const router = express.Router();
const prisma = require("../config/prisma");

router.get("/health", async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;

        res.status(200).json({
            success: true,
            message: "Backend and PostgreSQL connected successfully!"
        });
    } catch (error) {
        console.error("Database connection error:", error);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});

module.exports = router;
