-- CreateEnum
CREATE TYPE "ProductionStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "ProductionRun" (
    "id" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "bomId" TEXT NOT NULL,
    "plannedOutput" INTEGER NOT NULL,
    "actualGoodOutput" INTEGER NOT NULL DEFAULT 0,
    "damagedPouches" INTEGER NOT NULL DEFAULT 0,
    "cartonsUsed" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "labourCost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "powerCost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "status" "ProductionStatus" NOT NULL DEFAULT 'PLANNED',
    "productionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductionRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionConsumption" (
    "id" TEXT NOT NULL,
    "productionRunId" TEXT NOT NULL,
    "rawMaterialId" TEXT NOT NULL,
    "plannedQuantity" DECIMAL(14,3) NOT NULL,
    "actualQuantity" DECIMAL(14,3) NOT NULL,

    CONSTRAINT "ProductionConsumption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductionRun_batchNumber_key" ON "ProductionRun"("batchNumber");

-- AddForeignKey
ALTER TABLE "ProductionRun" ADD CONSTRAINT "ProductionRun_bomId_fkey" FOREIGN KEY ("bomId") REFERENCES "BOM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionConsumption" ADD CONSTRAINT "ProductionConsumption_productionRunId_fkey" FOREIGN KEY ("productionRunId") REFERENCES "ProductionRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
