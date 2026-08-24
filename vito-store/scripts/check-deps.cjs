const fs = require('fs');
const path = require('path');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(e.name)) out.push(p);
  }
  return out;
}

const files = walk(path.join(__dirname, '..', 'src'));
const pkgs = new Set();
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const re = /(?:from|require\(|import\()\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(src))) {
    const s = m[1];
    if (s.startsWith('.') || s.startsWith('@/')) continue;
    const parts = s.split('/');
    pkgs.add(parts[0].startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]);
  }
}

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const declared = new Set([
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
]);

console.log('=== Paquetes importados en src ===');
for (const p of [...pkgs].sort()) console.log((declared.has(p) ? '  OK   ' : '  FALTA') + ' ' + p);
console.log('\n=== Faltantes ===');
console.log([...pkgs].filter(p => !declared.has(p)).sort().join('\n') || '(ninguno)');
