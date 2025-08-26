-- DropForeignKey
ALTER TABLE "public"."Inquiry" DROP CONSTRAINT "Inquiry_propertyId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Inquiry" ADD CONSTRAINT "Inquiry_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
