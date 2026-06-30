/*
  Warnings:

  - You are about to drop the column `approved` on the `SellerProfile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shopName]` on the table `SellerProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `address` to the `SellerProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `SellerProfile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SellerStatus" AS ENUM ('INCOMPLETE', 'ACTIVE', 'BLOCKED');

-- AlterTable
ALTER TABLE "SellerProfile" DROP COLUMN "approved",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "facebookUrl" TEXT,
ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "status" "SellerStatus" NOT NULL DEFAULT 'INCOMPLETE';

-- CreateIndex
CREATE UNIQUE INDEX "SellerProfile_shopName_key" ON "SellerProfile"("shopName");
