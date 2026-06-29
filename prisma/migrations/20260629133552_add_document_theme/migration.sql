-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "themeBgColor" TEXT DEFAULT '#0B0F12',
ADD COLUMN     "themeBgImage" TEXT,
ADD COLUMN     "themeFontColor" TEXT DEFAULT 'rgba(255,255,255,0.93)',
ADD COLUMN     "themeToolbarColor" TEXT DEFAULT 'rgba(255,255,255,0.04)';
