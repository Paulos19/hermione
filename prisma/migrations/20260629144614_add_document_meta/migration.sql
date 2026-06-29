-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "aiHistory" JSONB,
ADD COLUMN     "chapterNotes" TEXT,
ADD COLUMN     "checklist" JSONB;
