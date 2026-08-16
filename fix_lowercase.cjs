const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;
  content = content.replace(/([a-zA-Z0-9_?.]+)\.toLowerCase\(\)/g, (match, p1) => {
    if (p1.endsWith('?')) return match;
    if (p1.includes('String(')) return match;
    if (['searchQuery', 'search', 'q', 'query'].includes(p1)) return match;
    return '(' + p1 + ' || "").toLowerCase()';
  });
  if (content !== original) fs.writeFileSync(f, content);
});
console.log('Replaced unsafes');
