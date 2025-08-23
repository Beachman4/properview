-- CreateEnum
CREATE TYPE "public"."PropertyStatus" AS ENUM ('active', 'pending', 'sold');

-- CreateTable
CREATE TABLE "public"."Agent" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Property" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "addressLongitude" DOUBLE PRECISION NOT NULL,
    "addressLatitude" DOUBLE PRECISION NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "status" "public"."PropertyStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "agentId" UUID NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Inquiry" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "propertyId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Agent_email_key" ON "public"."Agent"("email");

-- CreateIndex
CREATE INDEX "Property_status_price_idx" ON "public"."Property"("status", "price");

-- CreateIndex
CREATE INDEX "Property_status_bedrooms_idx" ON "public"."Property"("status", "bedrooms");

-- CreateIndex
CREATE INDEX "Property_status_bathrooms_idx" ON "public"."Property"("status", "bathrooms");

-- CreateIndex
CREATE INDEX "Property_status_addressLatitude_addressLongitude_idx" ON "public"."Property"("status", "addressLatitude", "addressLongitude");

-- CreateIndex
CREATE INDEX "Property_status_price_bedrooms_bathrooms_idx" ON "public"."Property"("status", "price", "bedrooms", "bathrooms");

-- CreateIndex
CREATE INDEX "Property_createdAt_idx" ON "public"."Property"("createdAt");

-- CreateIndex
CREATE INDEX "Property_agentId_idx" ON "public"."Property"("agentId");

-- AddForeignKey
ALTER TABLE "public"."Property" ADD CONSTRAINT "Property_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "public"."Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inquiry" ADD CONSTRAINT "Inquiry_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
