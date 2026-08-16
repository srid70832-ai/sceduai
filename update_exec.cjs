const fs = require('fs');

let content = fs.readFileSync('server/db.ts', 'utf8');

// Replace execSync with execFileSync
content = content.replace(/import \{ execSync \} from 'child_process';/, "import { execFileSync } from 'child_process';");

const oldSyncSupabase = /try \{\s*const escapedBody = bodyStr\.replace\(\/"\/g, '\\\\"\'\);\s*const cmd = `"\$\{process\.execPath\}" "\$\{syncHelperPath\}" "\$\{url\}" "\$\{method\}" "\$\{supabaseKey\}" "\$\{escapedBody\}"`;\s*const output = execSync\(cmd, \{\s*encoding: 'utf-8',\s*stdio: \['pipe', 'pipe', 'ignore'\]\s*\}\);\s*if \(!output\) return null;\s*return JSON\.parse\(output\.trim\(\)\);\s*\} catch \(e\) \{\s*return null;\s*\}/m;

const newSyncSupabase = `try {
    const output = execFileSync(process.execPath, [syncHelperPath, url, method, supabaseKey, bodyStr], { 
      encoding: 'utf-8', 
      stdio: ['pipe', 'pipe', 'pipe'] 
    });
    if (!output) return null;
    return JSON.parse(output.trim());
  } catch (e) {
    console.error('syncSupabase error:', e.message, e.stderr?.toString());
    return null;
  }`;

// I will just use string replacement
content = content.replace(/try \{[\s\S]*?catch \(e\) \{[\s\S]*?return null;\s*\}/, newSyncSupabase);

fs.writeFileSync('server/db.ts', content);
