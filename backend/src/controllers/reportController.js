
const prisma = require("../config/prisma");
const PDFDocument = require("pdfkit");

const invoicePdf = async (req, res) => {
    try {
        const invoice = await prisma.invoice.findUnique({
            where: { invoiceNumber: req.params.invoiceNumber },
            include: {
                salesOrder: {
                    include: {
                        customer: true,
                        items: { include: { product: true } }
                    }
                },
                payments: true
            }
        });

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }

        const doc = new PDFDocument({ margin: 50 });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=${invoice.invoiceNumber}.pdf`
        );

        doc.pipe(res);

        doc.fontSize(22).text("GST TAX INVOICE", { align: "center" });
        doc.moveDown();
        doc.fontSize(12).text("OrderAudit - Manufacturing ERP");
        doc.text(`Invoice Number: ${invoice.invoiceNumber}`);
        doc.text(`Invoice Date: ${invoice.invoiceDate.toDateString()}`);
        doc.moveDown();

        doc.fontSize(14).text("Bill To");
        doc.fontSize(11).text(invoice.salesOrder.customer.name);
        doc.text(`State: ${invoice.salesOrder.customer.state}`);
        doc.text(`State Code: ${invoice.salesOrder.customer.stateCode}`);
        doc.text(`Address: ${invoice.salesOrder.customer.address}`);
        doc.moveDown();

        doc.fontSize(12).text("Product Details", { underline: true });
        doc.moveDown(0.5);

        invoice.salesOrder.items.forEach((item) => {
            doc.text(
                `${item.product.name} (${item.product.sku}) - ${item.quantity} packets x Rs. ${Number(item.unitPrice).toFixed(2)}`
            );
        });

        doc.moveDown();
        doc.text(`GST Type: ${invoice.gstType}`);
        doc.text(`Taxable Amount: Rs. ${Number(invoice.taxableAmount).toFixed(2)}`);
        doc.text(`CGST: Rs. ${Number(invoice.cgst).toFixed(2)}`);
        doc.text(`SGST: Rs. ${Number(invoice.sgst).toFixed(2)}`);
        doc.text(`IGST: Rs. ${Number(invoice.igst).toFixed(2)}`);
        doc.moveDown();
        doc.fontSize(15).text(
            `Invoice Total: Rs. ${Number(invoice.totalAmount).toFixed(2)}`
        );

        const paid = invoice.payments.reduce(
            (sum, payment) => sum + Number(payment.amount), 0
        );

        doc.fontSize(11).text(`Payment Received: Rs. ${paid.toFixed(2)}`);
        doc.text(
            `Outstanding: Rs. ${(Number(invoice.totalAmount) - paid).toFixed(2)}`
        );

        doc.moveDown(2);
        doc.text("Thank you for your business!", { align: "center" });

        doc.end();

    } catch (error) {
        console.error("Invoice PDF error:", error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: "Could not generate invoice PDF"
            });
        }
    }
};

const salesRegister = async (req, res) => {
    try {
        const orders = await prisma.salesOrder.findMany({
            include: {
                customer: true,
                items: { include: { product: true } },
                invoice: true
            },
            orderBy: { orderDate: "desc" }
        });

        const rows = [
            ["Order Number", "Date", "Customer", "Product", "Quantity", "Status", "Invoice", "Total Amount"]
        ];

        orders.forEach((order) => {
            order.items.forEach((item) => {
                rows.push([
                    order.orderNumber,
                    order.orderDate.toISOString().slice(0, 10),
                    order.customer.name,
                    item.product.name,
                    item.quantity,
                    order.status,
                    order.invoice?.invoiceNumber || "",
                    order.invoice ? Number(order.invoice.totalAmount).toFixed(2) : ""
                ]);
            });
        });

        const csv = rows.map((row) =>
            row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")
        ).join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=sales-register.csv"
        );
        res.send(csv);

    } catch (error) {
        console.error("Sales report error:", error);
        res.status(500).json({ success: false, message: "Could not export sales register" });
    }
};

const stockReport = async (req, res) => {
    try {
        const balances = await prisma.stockBalance.findMany();

        const [products, materials] = await Promise.all([
            prisma.product.findMany(),
            prisma.rawMaterial.findMany()
        ]);

        const productMap = new Map(products.map((item) => [item.id, item.name]));
        const materialMap = new Map(materials.map((item) => [item.id, item.name]));

        const rows = [["Item", "Category", "Closing Quantity"]];

        balances.forEach((balance) => {
            const name = balance.itemType === "FINISHED_PRODUCT"
                ? productMap.get(balance.itemId)
                : materialMap.get(balance.itemId);

            rows.push([
                name || balance.itemId,
                balance.itemType,
                Number(balance.quantity)
            ]);
        });

        const csv = rows.map((row) =>
            row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")
        ).join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=stock-report.csv"
        );
        res.send(csv);

    } catch (error) {
        console.error("Stock report error:", error);
        res.status(500).json({ success: false, message: "Could not export stock report" });
    }
};

module.exports = { invoicePdf, salesRegister, stockReport };
