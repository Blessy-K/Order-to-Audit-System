const prisma = require("../config/prisma");

const runBenchmarkProduction = async (req, res) => {
    try {
        const result = await prisma.$transaction(async (tx) => {
            const existing = await tx.productionRun.findUnique({
                where: { batchNumber: "BATCH-001" }
            });

            if (existing) {
                throw new Error("BATCH-001 has already been processed. Do not run it twice.");
            }

            const product = await tx.product.findUnique({
                where: { sku: "MUR-200" },
                include: { bom: { include: { items: { include: { rawMaterial: true } } } } }
            });

            if (!product || !product.bom) {
                throw new Error("Murukku product or BOM not found. Run benchmark seed first.");
            }

            const actualUsage = {
                FLOUR: 40,
                OIL: 10.5,
                SPICE: 1.2,
                POUCH: 194,
                CARTON: 9
            };

            const run = await tx.productionRun.create({
                data: {
                    batchNumber: "BATCH-001",
                    bomId: product.bom.id,
                    plannedOutput: 200,
                    actualGoodOutput: 188,
                    damagedPouches: 6,
                    cartonsUsed: 9,
                    labourCost: 1200,
                    powerCost: 600,
                    status: "COMPLETED"
                }
            });

            for (const item of product.bom.items) {
                const code = item.rawMaterial.materialCode;
                const used = actualUsage[code];

                if (used === undefined) {
                    throw new Error(`Missing actual usage for ${code}`);
                }

                const balance = await tx.stockBalance.findUnique({
                    where: {
                        itemType_itemId: {
                            itemType: "RAW_MATERIAL",
                            itemId: item.rawMaterialId
                        }
                    }
                });

                if (!balance || Number(balance.quantity) < used) {
                    throw new Error(`Insufficient stock for ${code}`);
                }

                await tx.stockBalance.update({
                    where: { id: balance.id },
                    data: { quantity: { decrement: used } }
                });

                await tx.productionConsumption.create({
                    data: {
                        productionRunId: run.id,
                        rawMaterialId: item.rawMaterialId,
                        plannedQuantity: item.quantity,
                        actualQuantity: used
                    }
                });

                await tx.stockMovement.create({
                    data: {
                        itemType: "RAW_MATERIAL",
                        itemId: item.rawMaterialId,
                        movementType: "PRODUCTION_ISSUE",
                        quantity: -used,
                        referenceId: run.id,
                        description: `Material used in ${run.batchNumber}`
                    }
                });
            }

            const finishedBalance = await tx.stockBalance.findUnique({
                where: {
                    itemType_itemId: {
                        itemType: "FINISHED_PRODUCT",
                        itemId: product.id
                    }
                }
            });

            await tx.stockBalance.update({
                where: { id: finishedBalance.id },
                data: { quantity: { increment: 188 } }
            });

            await tx.stockMovement.create({
                data: {
                    itemType: "FINISHED_PRODUCT",
                    itemId: product.id,
                    movementType: "PRODUCTION_OUTPUT",
                    quantity: 188,
                    referenceId: run.id,
                    description: "188 good Murukku packets produced"
                }
            });

            return run;
        });

        res.status(201).json({
            success: true,
            message: "Production completed successfully",
            production: result,
            results: {
                goodPackets: 188,
                damagedPouches: 6,
                yieldVariance: "-6%",
                oilVariance: "+5%",
                labourCost: 1200,
                powerCost: 600
            }
        });

    } catch (error) {
        console.error("Production error:", error);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { runBenchmarkProduction };