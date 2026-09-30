/*
  Warnings:

  - The `status` column on the `SellerProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "SellerProfileStatus" AS ENUM ('INCOMPLETE', 'ACTIVE', 'BLOCKED');

-- AlterTable
ALTER TABLE "SellerProfile" DROP COLUMN "status",
ADD COLUMN     "status" "SellerProfileStatus" NOT NULL DEFAULT 'INCOMPLETE';

-- DropEnum
DROP TYPE "SellerStatus";
