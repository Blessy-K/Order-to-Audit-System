
const express = require("express");
const router = express.Router();

const {
    runBenchmarkSales
} = require("../controllers/salesController");

router.post("/run-benchmark", runBenchmarkSales);

module.exports = router;
