import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Make all Express route handlers async
code = code.replace(/(\b(?:async\s+)?)\((req|req,\s*res|req,\s*res,\s*next)\)\s*=>\s*\{/g, (match, asyncPart, args) => {
    if (asyncPart && asyncPart.trim() === 'async') return match;
    return `async (${args}) => {`;
});

// 2. Make helper functions async
code = code.replace(/function getAuthUser\(/g, 'async function getAuthUser(');
code = code.replace(/getAuthUser\(req\)/g, 'await getAuthUser(req)');

code = code.replace(/function requireAdmin\(/g, 'async function requireAdmin(');
code = code.replace(/requireAdmin\(req,\s*res\)/g, 'await requireAdmin(req, res)');

// 3. Add await to db calls
code = code.replace(/([^\w.])(db\.(find|findById|insert|update|delete|getRaw|logAudit|createNotification|generateId|now)\()/g, '$1await $2');

// 4. Fix duplicate awaits
code = code.replace(/await\s+await\s+/g, 'await ');

fs.writeFileSync('server_refactored.ts', code);
console.log('Refactoring done, check server_refactored.ts');
