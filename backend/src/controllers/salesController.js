
const prisma = require("../config/prisma");

const runBenchmarkSales = async (req, res) => {
    try {
        const result = await prisma.$transaction(async (tx) => {
            // Find existing benchmark records to prevent duplicate execution
            const existing = await tx.salesOrder.findUnique({
                where: { orderNumber: "SO-001" }
            });

            if (existing) {
                throw new Error("Sales benchmark already completed. Do not run it twice.");
            }

            // Find users, customers and product
            const admin = await tx.user.findUnique({
                where: { email: "admin@orderaudit.com" }
            });

            const salesmanA = await tx.user.findUnique({
                where: { email: "salesman.a@orderaudit.com" }
            });

            const salesmanB = await tx.user.findUnique({
                where: { email: "salesman.b@orderaudit.com" }
            });

            const retailer = await tx.customer.findUnique({
                where: { customerCode: "RET-A" }
            });

            const distributor = await tx.customer.findUnique({
                where: { customerCode: "DIST-B" }
            });

            const product = await tx.product.findUnique({
                where: { sku: "MUR-200" }
            });

            if (!admin || !salesmanA || !salesmanB ||
                !retailer || !distributor || !product) {
                throw new Error("Required benchmark users, customers or product are missing.");
            }

            // Check finished goods stock
            const stock = await tx.stockBalance.findUnique({
                where: {
                    itemType_itemId: {
                        itemType: "FINISHED_PRODUCT",
                        itemId: product.id
                    }
                }
            });

            if (!stock || Number(stock.quantity) < 150) {
                throw new Error("Insufficient stock to dispatch Retailer A's order.");
            }

            // RETAILER A: Create and approve order for 150 packets
            const retailerOrder = await tx.salesOrder.create({
                data: {
                    orderNumber: "SO-001",
                    customerId: retailer.id,
                    salesmanId: salesmanA.id,
                    approvedById: admin.id,
                    status: "APPROVED",
                    approvedAt: new Date(),
                    items: {
                        create: {
                            productId: product.id,
                            quantity: 150,
                            unitPrice: product.sellingPrice
                        }
                    }
                }
            });

            // GST calculation: Tamil Nadu to Tamil Nadu = CGST + SGST
            const taxableAmount = 150 * Number(product.sellingPrice);
            const cgst = taxableAmount * 0.025;
            const sgst = taxableAmount * 0.025;
            const totalAmount = taxableAmount + cgst + sgst;

            const invoice = await tx.invoice.create({
                data: {
                    invoiceNumber: "INV-001",
                    salesOrderId: retailerOrder.id,
                    gstType: "INTRA_STATE",
                    taxableAmount,
                    cgst,
                    sgst,
                    igst: 0,
                    totalAmount,
                    status: "ISSUED"
                }
            });

            // Dispatch 150 packets
            const dispatch = await tx.dispatch.create({
                data: {
                    dispatchNumber: "DSP-001",
                    salesOrderId: retailerOrder.id,
                    notes: "Retailer A benchmark dispatch",
                    items: {
                        create: {
                            productId: product.id,
                            quantity: 150
                        }
                    }
                }
            });

            // Reduce finished goods stock
            await tx.stockBalance.update({
                where: { id: stock.id },
                data: { quantity: { decrement: 150 } }
            });

            await tx.stockMovement.create({
                data: {
                    itemType: "FINISHED_PRODUCT",
                    itemId: product.id,
                    movementType: "DISPATCH",
                    quantity: -150,
                    referenceId: dispatch.id,
                    description: "150 packets dispatched to Retailer A"
                }
            });

            await tx.salesOrder.update({
                where: { id: retailerOrder.id },
                data: { status: "DISPATCHED" }
            });

            // Record partial payment of Rs. 4,000
            const payment = await tx.payment.create({
                data: {
                    invoiceId: invoice.id,
                    amount: 4000,
                    paymentMethod: "UPI",
                    referenceNumber: "PAY-001"
                }
            });

            await tx.invoice.update({
                where: { id: invoice.id },
                data: { status: "PARTIALLY_PAID" }
            });

            // DISTRIBUTOR B: Create order for 120 packets
            // Keep it pending because only 88 packets are available.
            const distributorOrder = await tx.salesOrder.create({
                data: {
                    orderNumber: "SO-002",
                    customerId: distributor.id,
                    salesmanId: salesmanB.id,
                    status: "PENDING",
                    items: {
                        create: {
                            productId: product.id,
                            quantity: 120,
                            unitPrice: product.sellingPrice
                        }
                    }
                }
            });

            const closingStock = Number(stock.quantity) - 150;

            return {
                retailerOrder,
                invoice,
                dispatch,
                payment,
                distributorOrder,
                stock: closingStock,
                shortage: Math.max(0, 120 - closingStock),
                taxableAmount,
                cgst,
                sgst,
                totalAmount
            };
        });

        res.status(201).json({
            success: true,
            message: "Sales benchmark completed successfully",
            retailerA: {
                orderNumber: result.retailerOrder.orderNumber,
                quantity: 150,
                invoiceNumber: result.invoice.invoiceNumber,
                taxableAmount: result.taxableAmount,
                cgst: result.cgst,
                sgst: result.sgst,
                totalInvoice: result.totalAmount,
                paymentReceived: 4000,
                outstanding: result.totalAmount - 4000,
                dispatchNumber: result.dispatch.dispatchNumber
            },
            distributorB: {
                orderNumber: result.distributorOrder.orderNumber,
                orderedQuantity: 120,
                availableStock: result.stock,
                shortage: result.shortage,
                status: "PENDING"
            },
            finishedGoodsClosingStock: result.stock
        });

    } catch (error) {
        console.error("Sales benchmark error:", error);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { runBenchmarkSales };
