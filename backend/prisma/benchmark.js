require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

async function main() {
    // 1. Product
    const product = await prisma.product.upsert({
        where: { sku: "MUR-200" },
        update: {},
        create: {
            sku: "MUR-200",
            name: "Murukku 200g",
            packSizeGrams: 200,
            sellingPrice: 50
        }
    });

    // 2. Customers
    const retailer = await prisma.customer.upsert({
        where: { customerCode: "RET-A" },
        update: {},
        create: {
            customerCode: "RET-A",
            name: "Retailer A",
            customerType: "RETAILER",
            state: "Tamil Nadu",
            stateCode: "33",
            address: "Chennai, Tamil Nadu"
        }
    });

    const distributor = await prisma.customer.upsert({
        where: { customerCode: "DIST-B" },
        update: {},
        create: {
            customerCode: "DIST-B",
            name: "Distributor B",
            customerType: "DISTRIBUTOR",
            state: "Karnataka",
            stateCode: "29",
            address: "Bengaluru, Karnataka"
        }
    });

    // 3. Raw materials
    const materials = [
        { materialCode: "FLOUR", name: "Flour", unit: "KG", reorderLevel: 20 },
        { materialCode: "OIL", name: "Cooking Oil", unit: "LITRE", reorderLevel: 5 },
        { materialCode: "SPICE", name: "Spice Mix", unit: "KG", reorderLevel: 1 },
        { materialCode: "POUCH", name: "200g Pouch", unit: "PIECE", reorderLevel: 100 },
        { materialCode: "CARTON", name: "Carton", unit: "PIECE", reorderLevel: 5 }
    ];

    const savedMaterials = {};

    for (const material of materials) {
        savedMaterials[material.materialCode] =
            await prisma.rawMaterial.upsert({
                where: { materialCode: material.materialCode },
                update: {},
                create: material
            });
    }

    // 4. Bill of Materials: one batch = 200 packets
    const bom = await prisma.bOM.upsert({
        where: { productId: product.id },
        update: { batchOutputPackets: 200 },
        create: {
            productId: product.id,
            batchOutputPackets: 200
        }
    });

    const bomItems = [
        ["FLOUR", 40],
        ["OIL", 10],
        ["SPICE", 1.2],
        ["POUCH", 200],
        ["CARTON", 10]
    ];

    for (const [code, quantity] of bomItems) {
        await prisma.bOMItem.upsert({
            where: {
                bomId_rawMaterialId: {
                    bomId: bom.id,
                    rawMaterialId: savedMaterials[code].id
                }
            },
            update: { quantity },
            create: {
                bomId: bom.id,
                rawMaterialId: savedMaterials[code].id,
                quantity
            }
        });
    }

    // 5. Purchase: 60 kg flour at Rs. 45/kg
    const purchase = await prisma.purchase.upsert({
        where: { purchaseNumber: "PUR-001" },
        update: {
            totalAmount: 2700
        },
        create: {
            purchaseNumber: "PUR-001",
            supplierName: "Local Flour Supplier",
            invoiceNumber: "SUP-001",
            totalAmount: 2700
        }
    });

    await prisma.purchaseItem.deleteMany({
        where: { purchaseId: purchase.id }
    });

    await prisma.purchaseItem.create({
        data: {
            purchaseId: purchase.id,
            rawMaterialId: savedMaterials.FLOUR.id,
            quantity: 60,
            unitPrice: 45,
            totalPrice: 2700
        }
    });

    // 6. Opening stock + purchase stock
    const stockItems = [
        { code: "FLOUR", quantity: 160 },
        { code: "OIL", quantity: 30 },
        { code: "SPICE", quantity: 5 },
        { code: "POUCH", quantity: 500 },
        { code: "CARTON", quantity: 30 }
    ];

    for (const item of stockItems) {
        const material = savedMaterials[item.code];

        await prisma.stockBalance.upsert({
            where: {
                itemType_itemId: {
                    itemType: "RAW_MATERIAL",
                    itemId: material.id
                }
            },
            update: { quantity: item.quantity },
            create: {
                itemType: "RAW_MATERIAL",
                itemId: material.id,
                quantity: item.quantity
            }
        });
    }

    // Finished goods opening stock
    await prisma.stockBalance.upsert({
        where: {
            itemType_itemId: {
                itemType: "FINISHED_PRODUCT",
                itemId: product.id
            }
        },
        update: { quantity: 50 },
        create: {
            itemType: "FINISHED_PRODUCT",
            itemId: product.id,
            quantity: 50
        }
    });

    // 7. Opening and purchase ledger entries (avoid duplicates)
    const movements = [
        ...[
            ["FLOUR", 100],
            ["OIL", 30],
            ["SPICE", 5],
            ["POUCH", 500],
            ["CARTON", 30]
        ].map(([code, quantity]) => ({
            itemType: "RAW_MATERIAL",
            itemId: savedMaterials[code].id,
            movementType: "OPENING",
            quantity,
            referenceId: "OPENING-2026",
            description: "Opening stock"
        })),
        {
            itemType: "RAW_MATERIAL",
            itemId: savedMaterials.FLOUR.id,
            movementType: "PURCHASE",
            quantity: 60,
            referenceId: purchase.id,
            description: "Purchase PUR-001: 60 kg at Rs. 45/kg"
        },
        {
            itemType: "FINISHED_PRODUCT",
            itemId: product.id,
            movementType: "OPENING",
            quantity: 50,
            referenceId: "OPENING-2026",
            description: "Opening finished goods"
        }
    ];

    for (const movement of movements) {
        const existing = await prisma.stockMovement.findFirst({
            where: {
                itemId: movement.itemId,
                movementType: movement.movementType,
                referenceId: movement.referenceId
            }
        });

        if (!existing) {
            await prisma.stockMovement.create({ data: movement });
        }
    }

    console.log("Benchmark data created successfully!");
    console.log("Product: Murukku 200g");
    console.log("Retailer A: Tamil Nadu");
    console.log("Distributor B: Karnataka");
    console.log("Flour: 160 kg (100 opening + 60 purchase)");
    console.log("Oil: 30 L | Spice: 5 kg");
    console.log("Pouches: 500 | Cartons: 30");
    console.log("Finished goods: 50 packets");
    console.log("BOM: 200 packets per batch");
}

main()
    .catch((error) => {
        console.error("Benchmark seed failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });