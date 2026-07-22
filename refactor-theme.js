const fs = require('fs');
const path = require('path');

const replacements = [
  // Backgrounds
  { regex: /bg-gray-50 dark:bg-\[#0A0D12\]/g, replacement: 'bg-[var(--theme-bg-main)]' },
  { regex: /bg-white dark:bg-\[#10151B\]/g, replacement: 'bg-[var(--theme-bg-surface)]' },
  { regex: /bg-white dark:bg-\[#141A22\]/g, replacement: 'bg-[var(--theme-bg-surface-elevated)]' },
  { regex: /bg-gray-50 dark:bg-\[#141A22\]/g, replacement: 'bg-[var(--theme-bg-surface-elevated)]' },
  { regex: /bg-gray-100 dark:bg-\[#181F28\]/g, replacement: 'bg-[var(--theme-bg-surface-elevated)]' },
  { regex: /bg-gray-100 dark:bg-\[#10151B\]/g, replacement: 'bg-[var(--theme-bg-surface-elevated)]' },
  { regex: /bg-gray-50 dark:bg-\[#10151B\]/g, replacement: 'bg-[var(--theme-bg-surface)]' },
  
  // Borders
  { regex: /border-gray-200 dark:border-white\/10/g, replacement: 'border-[var(--theme-border)]' },
  { regex: /border-gray-200 dark:border-white\/5/g, replacement: 'border-[var(--theme-border-subtle)]' },
  { regex: /border-gray-200\/50 dark:border-white\/10/g, replacement: 'border-[var(--theme-border)]' },
  { regex: /border-gray-200\/40 dark:border-white\/5/g, replacement: 'border-[var(--theme-border-subtle)]' },

  // Text colors
  { regex: /text-gray-900 dark:text-\[#F5F5F5\]/g, replacement: 'text-[var(--theme-text-main)]' },
  { regex: /text-gray-900 dark:text-white/g, replacement: 'text-[var(--theme-text-main)]' },
  { regex: /text-gray-700 dark:text-\[#F5F5F5\]/g, replacement: 'text-[var(--theme-text-main)]' },
  { regex: /text-gray-500 dark:text-\[#8A94A0\]/g, replacement: 'text-[var(--theme-text-muted)]' },
  { regex: /text-gray-400 dark:text-\[#8A94A0\]/g, replacement: 'text-[var(--theme-text-muted)]' },
  { regex: /text-gray-400 dark:text-\[#5F6A7A\]/g, replacement: 'text-[var(--theme-text-muted)]' },
  { regex: /text-gray-600 dark:text-\[#8A94A0\]/g, replacement: 'text-[var(--theme-text-muted)]' },

  // Accent Colors
  { regex: /text-violet-600 dark:text-\[#B899FF\]/g, replacement: 'text-[var(--theme-accent)]' },
  { regex: /text-amber-600 dark:text-amber-400/g, replacement: 'text-[var(--theme-accent)]' },
  { regex: /text-blue-600 dark:text-blue-400/g, replacement: 'text-[var(--theme-accent)]' },
  
  { regex: /bg-violet-100 dark:bg-violet-500\/10/g, replacement: 'bg-[var(--theme-accent-light)]' },
  { regex: /bg-amber-100 dark:bg-amber-500\/10/g, replacement: 'bg-[var(--theme-accent-light)]' },
  { regex: /bg-blue-100 dark:bg-blue-500\/10/g, replacement: 'bg-[var(--theme-accent-light)]' },

  { regex: /bg-violet-600\/10 dark:bg-\[#B899FF\]\/10/g, replacement: 'bg-[var(--theme-accent-light)]' },
  { regex: /bg-amber-500\/10 dark:bg-amber-400\/10/g, replacement: 'bg-[var(--theme-accent-light)]' },
  { regex: /bg-blue-500\/10 dark:bg-blue-400\/10/g, replacement: 'bg-[var(--theme-accent-light)]' },

  { regex: /hover:border-violet-500\/50 dark:hover:border-\[#B899FF\]\/50/g, replacement: 'hover:border-[var(--theme-accent)]' },
  { regex: /hover:border-amber-500\/30 dark:hover:border-amber-400\/30/g, replacement: 'hover:border-[var(--theme-accent)]/50' },
  { regex: /hover:border-blue-500\/30 dark:hover:border-blue-400\/30/g, replacement: 'hover:border-[var(--theme-accent)]/50' },

  { regex: /focus:border-violet-600\/50 dark:focus:border-\[#B899FF\]\/50/g, replacement: 'focus:border-[var(--theme-accent)]/50' },
  { regex: /focus:ring-violet-600\/50 dark:focus:ring-\[#B899FF\]\/50/g, replacement: 'focus:ring-[var(--theme-accent)]/50' },
];

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts'))) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      let originalContent = content;

      // Also clean up local theme state 
      content = content.replace(/const \[theme, setTheme\] = useState<'light' \| 'dark'>\('dark'\)\s*useEffect\(\(\) => \{[^}]+setTheme[^}]+}\s*\}, \[\]\)\s*const toggleTheme = \(\) => \{[^}]+setTheme[^}]+return next\s*}\)\s*}/g, '');
      content = content.replace(/const \[theme, setTheme\] = useState<'light' \| 'dark'>\('dark'\)/g, '');
      content = content.replace(/const toggleTheme = \(\) => \{[\s\S]*?localStorage\.setItem\('hermione-theme', next\)[\s\S]*?return next\s*\}\)\s*\}/g, '');
      
      content = content.replace(/className=\{`\$\{theme === 'dark' \? 'dark' : ''\} antialiased`\}/g, 'className="antialiased"');
      
      content = content.replace(/theme=\{theme\}\s*onToggleTheme=\{toggleTheme\}/g, '');

      // Apply regex replacements
      for (const rule of replacements) {
        content = content.replace(rule.regex, rule.replacement);
      }

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'app', '[lang]', '(dashboard)'));
processDirectory(path.join(__dirname, 'app', 'components'));
