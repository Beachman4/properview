/*
  Warnings:

  - Added the required column `message` to the `Inquiry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Inquiry" ADD COLUMN     "message" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Property" ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;
