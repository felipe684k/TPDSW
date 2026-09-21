const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'admin', 'Dashboard.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\$\{theme\.card\.border\}/g, "border-slate-200");
content = content.replace(/\$\{theme\.table\.divide\}/g, "divide-slate-200");

// Also import SIDEBAR_TABS
if (!content.includes('SIDEBAR_TABS')) {
  content = `import { SIDEBAR_TABS } from '../shared/Sidebar.const'\n` + content;
}

content = content.replace(/setActiveTab\('enrollments'\)/g, "setActiveTab(SIDEBAR_TABS.ENROLLMENTS)");

fs.writeFileSync(file, content);
console.log('Fixed Dashboard');
