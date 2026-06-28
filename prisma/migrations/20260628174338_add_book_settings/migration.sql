-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "defaultFontFamily" TEXT DEFAULT 'Inter',
ADD COLUMN     "defaultFontSize" TEXT DEFAULT '18px',
ADD COLUMN     "defaultFontWeight" TEXT DEFAULT '400',
ADD COLUMN     "defaultParagraphIndent" BOOLEAN DEFAULT false,
ADD COLUMN     "targetWords" INTEGER NOT NULL DEFAULT 50000;

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;
