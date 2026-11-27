const productionRoutes = require("./routes/productionRoutes");
const express = require("express");
const cors = require("cors");
const reportRoutes = require("./routes/reportRoutes");
require("dotenv").config();

const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const salesRoutes = require("./routes/salesRoutes");
const app = express();
app.use("/api/reports", reportRoutes);
app.use(cors());
app.use(express.json());
app.use("/api/production", productionRoutes);
app.use("/api/sales", salesRoutes);
app.get("/", (req, res) => {
    res.send("Order-to-Audit System Backend is Running!");
});

app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});