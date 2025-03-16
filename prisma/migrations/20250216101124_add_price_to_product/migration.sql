-- AlterTable
ALTER TABLE "Ingredient" ADD COLUMN     "cartItemId" INTEGER;

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_cartItemId_fkey" FOREIGN KEY ("cartItemId") REFERENCES "CartItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
