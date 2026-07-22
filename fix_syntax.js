const fs = require('fs');
const path = require('path');

const pages = [
  { p: 'dashboard' },
  { p: 'dashboard/projects' },
  { p: 'dashboard/characters' },
  { p: 'dashboard/world' },
  { p: 'dashboard/notes' }
];

pages.forEach(({ p }) => {
  const pagePath = path.join(__dirname, 'app/[lang]/(dashboard)', p, 'page.tsx');

  if (fs.existsSync(pagePath)) {
    let content = fs.readFileSync(pagePath, 'utf8');
    
    // Fix the syntax error in JSX props
    content = content.replace(
      /isPremium=\{\n\s*selectedPlan=\{user\?\.selectedPlan \|\| "free"\}\n\s*projectsCount=\{user\?\._count\?\.books \|\| 0\}\n\s*aiCallsCount=\{user\?\.aiCallsCount \|\| 0\}user\?\.isPremium \|\| false\}/g,
      'isPremium={user?.isPremium || false}\n        selectedPlan={user?.selectedPlan || "free"}\n        projectsCount={user?._count?.books || 0}\n        aiCallsCount={user?.aiCallsCount || 0}'
    );

    // Fix the prisma.user.findUnique select if it missed it
    content = content.replace(
      /select:\s*\{\s*name:\s*true,\s*(?:masterPin:\s*true,\s*)?isPremium:\s*true,\s*image:\s*true\s*\}/g,
      "select: { name: true, masterPin: true, isPremium: true, image: true, selectedPlan: true, aiCallsCount: true, _count: { select: { books: true } } }"
    );

    fs.writeFileSync(pagePath, content);
  }
});
console.log("Fix complete.");
