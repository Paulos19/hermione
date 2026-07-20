-- AlterTable
ALTER TABLE "User" ADD COLUMN     "personalDictionary" TEXT[] DEFAULT ARRAY[]::TEXT[];
