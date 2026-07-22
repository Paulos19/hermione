const fs = require('fs');
const path = require('path');

const pages = [
  { p: 'dashboard', c: 'Dashboard' },
  { p: 'dashboard/projects', c: 'Projects' },
  { p: 'dashboard/characters', c: 'Characters' },
  { p: 'dashboard/world', c: 'World' },
  { p: 'dashboard/notes', c: 'Notes' }
];

pages.forEach(({ p, c }) => {
  const pagePath = path.join(__dirname, 'app/[lang]/(dashboard)', p, 'page.tsx');
  const clientPath = path.join(__dirname, 'app/[lang]/(dashboard)', p, `${c}Client.tsx`);

  if (fs.existsSync(pagePath)) {
    let content = fs.readFileSync(pagePath, 'utf8');
    // Update select in prisma.user.findUnique
    content = content.replace(
      /select:\s*\{\s*name:\s*true,\s*isPremium:\s*true,\s*image:\s*true\s*\}/g,
      "select: { name: true, isPremium: true, image: true, selectedPlan: true, aiCallsCount: true, _count: { select: { books: true } } }"
    );
    // Inject props into Client component
    content = content.replace(
      new RegExp(`(<${c}Client[\\s\\S]*?)(isPremium={.*?}?)`),
      `$1$2\n        selectedPlan={user?.selectedPlan || "free"}\n        projectsCount={user?._count?.books || 0}\n        aiCallsCount={user?.aiCallsCount || 0}`
    );
    fs.writeFileSync(pagePath, content);
  }

  if (fs.existsSync(clientPath)) {
    let content = fs.readFileSync(clientPath, 'utf8');
    // Update Props interface
    content = content.replace(
      /isPremium:\s*boolean/g,
      "isPremium: boolean\n  selectedPlan: string\n  projectsCount: number\n  aiCallsCount: number"
    );
    // Update Component signature
    content = content.replace(
      /isPremium(\s*}\s*:\s*.*?Props)/,
      "isPremium,\n  selectedPlan,\n  projectsCount,\n  aiCallsCount$1"
    );
    // Update DashboardSidebar usage
    content = content.replace(
      /<DashboardSidebar([\s\S]*?)isPremium={isPremium}/g,
      "<DashboardSidebar$1isPremium={isPremium}\n          selectedPlan={selectedPlan}\n          projectsCount={projectsCount}\n          aiCallsCount={aiCallsCount}"
    );
    fs.writeFileSync(clientPath, content);
  }
});
console.log("Refactor complete.");
