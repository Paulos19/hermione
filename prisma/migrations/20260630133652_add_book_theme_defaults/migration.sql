-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "defaultThemeBgColor" TEXT DEFAULT '#0B0F12',
ADD COLUMN     "defaultThemeBgImage" TEXT,
ADD COLUMN     "defaultThemeFontColor" TEXT DEFAULT 'rgba(255,255,255,0.93)',
ADD COLUMN     "defaultThemeToolbarColor" TEXT DEFAULT 'rgba(255,255,255,0.04)',
ADD COLUMN     "defaultThemeToolsToolbarColor" TEXT DEFAULT 'rgba(15, 20, 25, 0.98)';
