/*
  Warnings:

  - You are about to drop the column `productItemId` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the `ProductItem` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `productId` to the `CartItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_productItemId_fkey";

-- DropForeignKey
ALTER TABLE "ProductItem" DROP CONSTRAINT "ProductItem_productId_fkey";

-- AlterTable
ALTER TABLE "CartItem" DROP COLUMN "productItemId",
ADD COLUMN     "productId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "ProductItem";

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
