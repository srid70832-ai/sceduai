const fs = require('fs');
let content = fs.readFileSync('server/scEduAI.ts', 'utf8');
const lines = content.split('\n');

let start = -1;
let end = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('// 1. Python Questions')) start = i;
  if (lines[i].includes('// 3. Attendance Query')) {
    end = i;
    break;
  }
}

if (start !== -1 && end !== -1) {
  lines.splice(start, end - start);
  
  // Now find the new first "else if" which was "// 3. Attendance Query"
  for (let i = start; i < lines.length; i++) {
    if (lines[i].includes('else if (lower.includes(\'attendance\')')) {
      lines[i] = lines[i].replace('else if', 'if');
      break;
    }
  }
  
  fs.writeFileSync('server/scEduAI.ts', lines.join('\n'));
  console.log('Removed hardcoded Python/Java AI responses');
}
