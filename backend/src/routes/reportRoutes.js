
const express = require("express");
const router = express.Router();

const {
    invoicePdf,
    salesRegister,
    stockReport
} = require("../controllers/reportController");

router.get("/invoice/:invoiceNumber/pdf", invoicePdf);
router.get("/sales-register", salesRegister);
router.get("/stock-report", stockReport);

module.exports = router;
