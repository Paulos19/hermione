-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "pin" TEXT,
ADD COLUMN     "securityType" TEXT DEFAULT 'none';
