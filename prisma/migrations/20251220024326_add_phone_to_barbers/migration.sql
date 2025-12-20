/*
  Warnings:

  - You are about to drop the column `nick` on the `Barber` table. All the data in the column will be lost.
  - Added the required column `name` to the `Barber` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Barber` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Barber" DROP COLUMN "nick",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL;
