const express = require("express");
const router = express.Router();

const {
    runBenchmarkProduction
} = require("../controllers/productionController");

router.post("/run-benchmark", runBenchmarkProduction);

module.exports = router;