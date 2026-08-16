const fs = require('fs');

let content = fs.readFileSync('server/db.ts', 'utf8');

// Replace file write with try/catch
content = content.replace(
  /const syncHelperPath = path\.join\(os\.tmpdir\(\), 'sync_fetch\.js'\);\nif \(!fs\.existsSync\(syncHelperPath\)\) \{[\s\S]*?\}\n/,
  `const syncHelperPath = path.join(os.tmpdir(), 'sync_fetch.js');
try {
  if (!fs.existsSync(syncHelperPath)) {
    fs.writeFileSync(syncHelperPath, \`
      const args = process.argv.slice(2);
      const url = args[0];
      const method = args[1];
      const key = args[2];
      const bodyStr = args[3];
      
      fetch(url, {
        method,
        headers: {
          'apikey': key,
          'Authorization': 'Bearer ' + key,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: bodyStr ? bodyStr : undefined
      })
      .then(r => r.text())
      .then(t => { console.log(t); process.exit(0); })
      .catch(e => { console.error(e); process.exit(1); });
    \`);
  }
} catch (e) {
  console.error('Failed to write sync_fetch.js:', e);
}
`
);

// Replace "node" with process.execPath
content = content.replace(
  /const cmd = \`node "\$\{syncHelperPath\}" "\$\{url\}" "\$\{method\}" "\$\{supabaseKey\}" "\$\{escapedBody\}"\`;/g,
  'const cmd = `"${process.execPath}" "${syncHelperPath}" "${url}" "${method}" "${supabaseKey}" "${escapedBody}"`;'
);

fs.writeFileSync('server/db.ts', content);
