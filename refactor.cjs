const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// Replace app.get/post/put/delete callbacks to be async
content = content.replace(/app\.(get|post|put|delete)\('([^']+)', \((req, res|req, res, next|_req, res)\) => {/g, 'app.$1(\'$2\', async ($3) => {');

// Handle variations with space
content = content.replace(/app\.(get|post|put|delete)\('([^']+)', \((req, res)\) => \{/g, 'app.$1(\'$2\', async (req, res) => {');
content = content.replace(/app\.(get|post|put|delete)\('([^']+)', \(_req, res\) => \{/g, 'app.$1(\'$2\', async (_req, res) => {');

// Replace db methods to be awaited
content = content.replace(/db\.find\(/g, 'await db.find(');
content = content.replace(/db\.findById\(/g, 'await db.findById(');
content = content.replace(/db\.insert\(/g, 'await db.insert(');
content = content.replace(/db\.update\(/g, 'await db.update(');
content = content.replace(/db\.delete\(/g, 'await db.delete(');
content = content.replace(/db\.logAudit\(/g, 'await db.logAudit(');
content = content.replace(/db\.createNotification\(/g, 'await db.createNotification(');

// Also any assignments like `const courses = db.find` -> `const courses = await db.find` is already handled above.

// The login and register were already async, so adding await won't hurt, but let's check.
// If I already made them async, they will have `async (req, res)` which won't be matched by the simple regex.
// Wait, what if there are `.map(c => { const teacher = db.findById(...) })` inside the routes?
// If we use `await` inside `.map()`, it will return an array of Promises! We'd need `await Promise.all(...)`.
// Let's check if there are maps.
