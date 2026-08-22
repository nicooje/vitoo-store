import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2);
const flags = {
  push: args.includes('--push'),
  chat: args.find(a => !a.startsWith('--')) || path.join(ROOT, '..', '.wa-chat-temp', 'chat.txt'),
};

// ---------- utilidades ----------
const fold = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const stripEmojis = s => s.replace(/[^\p{L}\p{N}\s/.,-]/gu, ' ');
const STOP = new Set(['de','la','el','los','las','y','para','p','c','al','a','en','con','del','un','una']);
const tokensOf = s => fold(stripEmojis(s).toLowerCase()).split(/[^a-z0-9]+/).filter(w => w && !STOP.has(w));
const normKey = s => [...new Set(tokensOf(s))].sort().join(' ');
const stripSizeFromName = s =>
  s.replace(/\(?\s*[tT]?\d{1,3}\s*(?:-|al|a|\/|y|,)\s*\d{1,3}\s*(?:de\s*pantal[oó]n)?\s*\)?/g, ' ')
   .replace(/\(\s*talles?\s*[^)]*\)/gi, ' ')
   .replace(/\btalles?\b.*$/i, ' ');
const baseKey = s => normKey(stripSizeFromName(s));
const parenSize = name => { const m = /\(([^)]*\d[^)]*)\)/.exec(name); return m ? fold(m[1]).replace(/\s/g, '').toLowerCase() : ''; };

function parseAmount(raw) {
  let v = String(raw).replace(/\s|\$/g, '');
  if (/^\d{1,3}([.,]\d{3})+$/.test(v)) v = v.replace(/[.,]/g, '');
  else if (/,\d{1,2}$/.test(v) && !/\./.test(v)) { const n = parseFloat(v.replace(',', '.')); return n > 0 && n <= 500 ? Math.round(n * 1000) : n; }
  else v = v.replace(/[.,](?=\d{3}\b)/g, '').replace(/,/g, '.').replace(/\.(?=\D|$)/g, '');
  const n = Number(v);
  if (!isFinite(n)) return null;
  if (n > 0 && n <= 500) return Math.round(n * 1000);
  return Math.round(n);
}

// los montos nunca cruzan de linea: terminan cuando deja de haber numero
const AMT = String.raw`([\d.,]+(?:[ ]\d{3})?)(?!\d)`;
function extractPrices(text) {
  const out = {};
  // "3x$4500", "3×$9000" y tambien "3 pares $4500"
  const comboRe = new RegExp(String.raw`(\d{1,2})\s*(?:[x×]|pares?)\s*\$?\s*` + AMT, 'gi');
  let m;
  while ((m = comboRe.exec(text))) {
    const mult = parseInt(m[1]);
    if (![1, 3, 6, 12].includes(mult)) continue;
    const amt = parseAmount(m[2]);
    if (amt && amt >= 300 && amt <= 2000000 && !out[mult]) out[mult] = amt;
  }
  let rest = text.replace(new RegExp(String.raw`\d{1,2}\s*(?:[x×]|pares?)\s*\$?\s*` + AMT, 'gi'), ' ');
  // docena exige el signo $ para no confundirse con otros numeros
  const docRe = new RegExp(String.raw`docena[^$\n]*?\$\s*` + AMT, 'i');
  if ((m = docRe.exec(text))) {
    const amt = parseAmount(m[1]);
    if (amt && amt >= 500) out[12] ??= amt;
    rest = rest.replace(docRe, ' '); // el precio por docena nunca es el precio unitario
  }
  const solo = new RegExp(String.raw`\$\s*` + AMT, 'i');
  if ((m = solo.exec(rest))) {
    const amt = parseAmount(m[1]);
    if (amt && amt >= 300 && amt <= 2000000) out[1] ??= amt;
  }
  // productos publicados solo por paquetes ("3 pares $X"): derivar el unitario
  // del paquete de 3 (convencion del sheet: unitario ~ pack3/3), redondeado a centenas.
  // Un precio vacio romperia el carrito (Number(price)||0 -> checkout con unit_price 0).
  if (!out[1]) {
    const base = out[3] != null ? out[3] / 3 : out[6] != null ? out[6] / 6 : out[12] != null ? out[12] / 12 : null;
    if (base) out[1] = Math.round(base / 100) * 100;
  }
  return out;
}

function extractSizes(name, caption) {
  const frags = [];
  const ps = parenSize(name);
  if (ps) frags.push(ps.toUpperCase());
  for (const line of caption.split('\n').slice(1)) {
    const l = line.trim();
    const idx = l.search(/\btalle/i);
    if (idx === -1) continue;
    let f = l.slice(idx).replace(/\*/g, '').replace(/\$\s*[\d.,]+/g, '').replace(/precio por (menor|mayor)/gi, '').replace(/[.:;,]+$/, '').trim();
    // conservar solo fragmentos con talles reales (digitos o XS/S/M/L/XL mayusculas)
    if (!f || f.length > 60) continue;
    if (!/\d/.test(f) && !/\b(?:XXS|XS|S|M|L|XL|XXL|XXXL)\b/.test(f)) continue;
    frags.push(f);
  }
  return [...new Set(frags)].slice(0, 2).join(' | ');
}

const SKIP_NAMES = ['complementos para sus outfits', 'reposicion', 'reposición'];
function extractName(caption) {
  const firstLine = caption.split('\n')[0] || '';
  const cands = [];
  for (const m of caption.matchAll(/\*(.+?)\*/g)) cands.push(m[1]);
  cands.push(firstLine);
  for (let raw of cands) {
    let n = raw.trim();
    if (!n) continue;
    if (!/\*/.test(raw)) { // sin negrita: cortar antes del precio o de "Disponible/Talles"
      const cut = /\$|disponible|\btalles?\b/i.exec(n);
      if (cut) n = n.slice(0, cut.index);
    }
    n = cleanName(n).replace(/\s*\$\s*[\d.,\s]+\s*$/, '').replace(/[.\s]+$/, '').trim();
    if (n.length > 3 && !SKIP_NAMES.some(sk => fold(n.toLowerCase()).includes(fold(sk)))) return n;
  }
  return '';
}
function cleanName(line) {
  return line.replace(/\*/g, '')
    .replace(/^\s*(?:[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}✨🔥🥵☁️🧦❄️🌬️🧸📚🎃💕🇦🇷🐆💦🍑🥥💧🌨️💜🤰🏽]\s*)+/u, '')
    .replace(/\s+/g, ' ').trim();
}

function categorize(name, text) {
  const s = fold((name + ' ' + text).toLowerCase());
  if (/medias|soquete|pantumedia/.test(s)) return 'Medias';
  if (/pijama|polar\b|termic|remera|polera|camiseta/.test(s)) return 'Invierno';
  if (/nena\b|nenas|nin[oa]s?\b|principiante|juvenil/.test(s)) return 'Varios';
  if (/pezonera|boob tape|silicona|tape/.test(s)) return 'Varios';
  if (/\btop\b|corpin|body\b|amamantar|reductor|bombis|brallete?/.test(s)) return 'Corpiños-Tops';
  if (/conjunto/.test(s)) return 'Conjuntos';
  if (/colaless|\bless\b|vedetina|bombacha|hilo dental|rutera|culot|boxer|faja/.test(s)) return 'Bombachas';
  return 'Varios';
}

const NOISE_RE = /tabla de talles|ubicaci[oó]n|buen d[ií]a|se edit[oó]|maps\.google|instagram\.com|más informaci[oó]n|cre[oó] el grupo|a[ñn]adi[oó]|sali[oó] del grupo|se uni[oó]|fijaste|cambi[oó] su n[uú]mero/i;

// ---------- 1. parsear chat ----------
const chatDir = path.dirname(path.resolve(flags.chat));
const rawTxt = fs.readFileSync(flags.chat, 'utf8').replace(/^\uFEFF/, '');
const HEADER = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4}), (\d{1,2}):(\d{2}) - ([^:]+): ?([\s\S]*)$/;
const messages = [];
for (const line of rawTxt.split(/\r?\n/)) {
  const m = HEADER.exec(line);
  if (m) messages.push({ date: `20${m[3].slice(-2)}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`, time: `${m[4].padStart(2, '0')}:${m[5]}`, sender: m[6].replace(/^\u200E/, '').trim(), text: m[7].replace(/^\u200E/, '') });
  else if (messages.length) messages[messages.length - 1].text += '\n' + line.replace(/^\u200E/, '');
}

const IMG_RE = /^(.+?\.(?:jpe?g|png|webp))\s*\(archivo adjunto\)$/i;
const candidates = [];
let lastProduct = null;
for (const msg of messages) {
  if (msg.sender !== 'Vito Store') continue;
  const imgs = []; let omitted = false; const capLines = [];
  for (const b of msg.text.split('\n')) {
    const t = b.trim();
    if (!t) continue;
    const im = IMG_RE.exec(t);
    if (im) { imgs.push(im[1]); continue; }
    if (/Multimedia omitido/.test(t)) { omitted = true; continue; }
    if (/^VID-|\(archivo adjunto\)$/i.test(t)) continue;
    capLines.push(t);
  }
  const caption = capLines.join('\n').trim();
  const hasPrice = Object.keys(extractPrices(caption)).length > 0;
  const firstLine = caption.split('\n')[0] || '';
  const meaningful = !!firstLine && !NOISE_RE.test(firstLine);

  if (imgs.length === 0 && !omitted) continue;

  // foto extra referencial del producto anterior ("Asi es de frente", "De $4900 tenemos estas opciones")
  if (imgs.length > 0 && lastProduct && !hasPrice && meaningful && firstLine.length < 70 &&
      (/^(de\s+\$|asi es|de frente|de atr[aá]s)/i.test(firstLine) || !/\*/.test(firstLine))) {
    for (const f of imgs) if (!lastProduct.images.includes(f)) lastProduct.images.push(f);
    continue;
  }

  if ((imgs.length > 0 || omitted) && hasPrice && meaningful) {
    const name = extractName(caption);
    const prod = {
      name,
      priceSet: extractPrices(caption),
      sizes: extractSizes(name, caption),
      description: caption.split('\n').map(l => l.replace(/\*/g, '').trim()).filter(l => l && !NOISE_RE.test(l)).join('\n'),
      category: categorize(name, caption),
      images: [...imgs],
      date: msg.date,
      time: msg.time,
      omitted: imgs.length === 0,
    };
    candidates.push({ type: 'product', ...prod });
    lastProduct = prod;
    continue;
  }
  if (imgs.length > 0) candidates.push({ type: 'images-only', images: imgs, date: msg.date, time: msg.time });
}

// imagenes sueltas al inicio de un album -> producto con caption siguiente
// (mismo mensaje/album: misma fecha y hora, y el producto debe tener sus propias fotos)
const resolved = [];
for (let i = 0; i < candidates.length; i++) {
  const c = candidates[i];
  if (c.type === 'images-only') {
    let j = i + 1;
    while (j < candidates.length && candidates[j].type === 'images-only') j++;
    const t = candidates[j];
    if (t && t.type === 'product' && !t.omitted && t.date === c.date && t.time === c.time) {
      for (const f of c.images) if (!t.images.includes(f)) t.images.unshift(f);
    }
  } else resolved.push(c);
}

// ---------- 2. fusionar republicaciones ----------
const products = [];
const merges = [];
for (const c of resolved.filter(x => x.type === 'product' && x.name)) {
  const key = baseKey(c.name);
  const same = products.find(p => p.key === key && p.priceSet[1] === c.priceSet[1]);
  if (same) {
    for (const f of c.images) if (!same.images.includes(f)) same.images.push(f);
    if (c.date > same.date) Object.assign(same, { name: c.name, priceSet: c.priceSet, description: c.description || same.description });
    if (!same.sizes && c.sizes) same.sizes = c.sizes;
    continue;
  }
  // misma base pero precio distinto: si no hay talles parenteticos que las diferencien, es republicacion -> gana la mas nueva
  const older = products.find(p => p.key === key && parenSize(p.name) === parenSize(c.name));
  if (older) {
    merges.push(`${older.name} ($${older.priceSet[1]}) -> "${c.name}" ($${c.priceSet[1]}) [${c.date}]`);
    for (const f of c.images) if (!older.images.includes(f)) older.images.push(f);
    Object.assign(older, { name: c.name, priceSet: c.priceSet, date: c.date, description: c.description || older.description });
    if (!older.sizes && c.sizes) older.sizes = c.sizes;
    continue;
  }
  products.push({ ...c, key });
}
// maximo 10 fotos por producto: los productos muy republicados acumulan albumes
// enteros y una fila con 29 imagenes satura el slideshow de la web
for (const p of products) if (p.images.length > 10) p.images = p.images.slice(0, 10);
const withImages = products.filter(p => p.images.length > 0);
const noImages = products.filter(p => p.images.length === 0);

// ---------- 3. sheet actual ----------
const env = {};
for (const line of fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*"([\s\S]*)"\s*$|^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
  if (m) env[m[1] || m[3]] = (m[2] || m[4] || '').trim();
}
let sheetRows;
if (flags.push) {
  const { google } = await import('googleapis');
  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: env.CLIENT_EMAIL, private_key: env.PRIVATE_KEY.replace(/\\n/g, '\n') },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  sheetRows = (await new google.sheets({ version: 'v4', auth }).spreadsheets.values.get({
    spreadsheetId: env.SHEET_ID, range: 'A2:N',
  })).data.values || [];
} else {
  sheetRows = JSON.parse(fs.readFileSync(path.join(ROOT, 'sheet-backup.json'), 'utf8'));
}

const live = sheetRows.map((r, i) => ({
  rowNumber: i + 2, id: r[0], name: r[1] || '', category: r[2] || '', price: r[3] || '',
  image_url: r[4] || '', stock: r[5] || '', size: r[6] || '', color: r[7] || '',
  quantity: r[8] || '', p3: r[9], p6: r[10], p9: r[11], p12: r[12], desc: r[13] || '',
})).filter(r => r.name || r.price || r.image_url);

const sanitizeLegacyPack = v => {
  const n = parseFloat(String(v ?? '').replace(',', '.'));
  if (!isFinite(n) || n === 0) return '';
  const val = n <= 500 ? n * 1000 : n;
  return val >= 300 && val <= 200000 ? String(Math.round(val)) : '';
};

// dedupe interno del sheet
const seenSheet = new Map(); const sheetDupes = [];
for (const s of live) {
  const pk = baseKey(s.name) + '|' + sanitizeLegacyPack(s.price);
  if (seenSheet.has(pk)) sheetDupes.push(seenSheet.get(pk).rowNumber < s.rowNumber ? s : seenSheet.get(pk));
  else seenSheet.set(pk, s);
}
const survivors = live.filter(s => !sheetDupes.includes(s));

function score(a, b) {
  const ta = a.split(' ').filter(Boolean), tb = b.split(' ').filter(Boolean);
  const inter = ta.filter(t => tb.includes(t));
  const jac = inter.length / new Set([...ta, ...tb]).size;
  let hits = 0; const bb = b.replace(/ /g, '');
  for (let i = 0; i < a.replace(/ /g, '').length - 1; i++) if (bb.includes(a.replace(/ /g, '').slice(i, i + 2))) hits++;
  const dice = 2 * hits / ((a.length - 1) + (b.length - 1) || 1);
  return { score: Math.max(jac, dice), sharedStrong: inter.filter(t => t.length >= 5).length };
}

// matching exacto primero, luego fuzzy con guardas y asignacion uno-a-uno
const pairs = [];
const updates = [], appended = [];
const usedP = new Set(), usedS = new Set(sheetDupes.map(d => d.rowNumber));
for (const p of withImages) for (const s of survivors) {
  if (baseKey(p.name) === baseKey(s.name) || normKey(p.name) === normKey(s.name)) pairs.push({ p, s, sc: 1 });
}
for (const p of withImages) for (const s of survivors) {
  const { score: sc, sharedStrong } = score(baseKey(p.name), baseKey(s.name));
  if (sc >= 0.90 && sharedStrong >= 1) {
    const oldP = parseFloat(sanitizeLegacyPack(s.price)), newP = p.priceSet[1];
    const okPrice = !oldP || !newP || (newP / oldP >= 0.55 && newP / oldP <= 1.85);
    if (okPrice) pairs.push({ p, s, sc });
  }
}
pairs.sort((a, b) => b.sc - a.sc);
for (const pr of pairs) {
  if (usedP.has(pr.p.key) || usedS.has(pr.s.rowNumber)) continue;
  usedP.add(pr.p.key); usedS.add(pr.s.rowNumber);
  updates.push({ ...pr });
}
for (const p of withImages) if (!usedP.has(p.key)) appended.push(p);

// ---------- informe ----------
console.log('================= INFORME DE IMPORTACION =================');
console.log(`Productos unicos en el chat          : ${products.length}`);
console.log(`Ya estaban en la web (actualizar)    : ${updates.length}`);
console.log(`Nuevos para agregar                  : ${appended.length}`);
console.log(`Sin imagen en el export (omitidos)   : ${noImages.length}`);
console.log(`Republicaciones fusionadas           : ${merges.length}`);
console.log(`Duplicados dentro del sheet a limpiar: ${sheetDupes.length}`);
if (merges.length) console.log('\n--- FUSIONES (precio viejo -> nuevo por republicacion) ---');
merges.forEach(m => console.log('   ' + m));

console.log('\n--- ACTUALIZAR (repetidos web/chat) ---');
for (const u of updates) {
  const np = u.p.priceSet, s = u.s;
  const flag = u.sc < 0.95 ? '  <<< REVISAR' : '';
  console.log(`fila ${s.rowNumber} (${Math.round(u.sc * 100)}%)${flag}`);
  console.log(`   web : "${s.name}"  $${s.price}  packs ${sanitizeLegacyPack(s.p3) || '-'} / ${sanitizeLegacyPack(s.p6) || '-'} / ${sanitizeLegacyPack(s.p12) || '-'}`);
  console.log(`   chat: "${u.p.name}"  $${np[1] ?? '(no tocar)'}  packs ${np[3] ?? '-'} / ${np[6] ?? '-'} / ${np[12] ?? '-'}`);
}
console.log('\n--- NUEVOS ---');
for (const p of appended)
  console.log(`+ "${p.name}"  $${p.priceSet[1] ?? '?'}  packs ${p.priceSet[3] ?? '-'} / ${p.priceSet[6] ?? '-'} / ${p.priceSet[12] ?? '-'}  cat:${p.category}  fotos:${p.images.length}${p.sizes ? '  talles:' + p.sizes : ''}`);
console.log('\n--- SIN IMAGEN EN EL EXPORT (se reportan, no se suben) ---');
for (const p of noImages)
  console.log(`! "${p.name}" $${p.priceSet[1] ?? '?'} packs ${p.priceSet[3] ?? '-'}/${p.priceSet[6] ?? '-'}/${p.priceSet[12] ?? '-'} ${p.sizes || ''}`);
console.log('\n--- DUPLICADOS A VACIAR EN EL SHEET ---');
sheetDupes.forEach(d => console.log(`- fila ${d.rowNumber}: "${d.name}" ($${d.price})`));

fs.writeFileSync(path.join(ROOT, 'import-plan.json'), JSON.stringify({
  updates: updates.map(u => ({ row: u.s.rowNumber, id: u.s.id, name: u.s.name, matchChat: u.p.name, score: u.sc, prices: u.p.priceSet })),
  appends: appended.map(p => ({ name: p.name, price: p.priceSet[1], p3: p.priceSet[3], p6: p.priceSet[6], p12: p.priceSet[12], images: p.images, sizes: p.sizes, category: p.category, description: p.description })),
  noImages: noImages.map(p => ({ name: p.name, ...p.priceSet })),
}, null, 1));

if (!flags.push) { console.log('\n(dry-run: nada escrito. usar --push para aplicar)'); process.exit(0); }

// ---------- 4. copiar imagenes ----------
const pubDir = path.join(ROOT, 'public', 'products');
fs.mkdirSync(pubDir, { recursive: true });
let copied = 0;
for (const p of appended) for (const f of p.images) {
  const src = path.join(chatDir, f);
  if (fs.existsSync(src)) { fs.copyFileSync(src, path.join(pubDir, f)); copied++; }
  else console.warn(`AVISO imagen faltante: ${f}`);
}
console.log(`Imagenes copiadas a public/products: ${copied}`);

// ---------- 5. escribir ----------
const { google } = await import('googleapis');
const auth = new google.auth.GoogleAuth({
  credentials: { client_email: env.CLIENT_EMAIL, private_key: env.PRIVATE_KEY.replace(/\\n/g, '\n') },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });
const data = [];
for (const u of updates) {
  const s = u.s, np = u.p.priceSet;
  data.push({
    range: `A${s.rowNumber}:N${s.rowNumber}`,
    values: [[
      s.id, s.name, s.category,
      np[1] != null ? String(np[1]) : sanitizeLegacyPack(s.price),
      s.image_url, 'SI',
      s.size || u.p.sizes || '', s.color || '',
      s.quantity || '10',
      np[3] != null ? String(np[3]) : sanitizeLegacyPack(s.p3),
      np[6] != null ? String(np[6]) : sanitizeLegacyPack(s.p6),
      s.p9 || '',
      np[12] != null ? String(np[12]) : sanitizeLegacyPack(s.p12),
      s.desc || u.p.description || '',
    ]],
  });
}
for (const d of sheetDupes)
  data.push({ range: `A${d.rowNumber}:N${d.rowNumber}`, values: [['','','','','','','','','','','','','','']] });
if (data.length) await sheets.spreadsheets.values.batchUpdate({
  spreadsheetId: env.SHEET_ID, requestBody: { valueInputOption: 'USER_ENTERED', data },
});
if (appended.length) {
  // values.append ancla mal en esta hoja (escribe desde la col N); usar update con
  // coordenadas absolutas: primera fila libre tras el ultimo dato real de A..N
  const tail = await sheets.spreadsheets.values.get({ spreadsheetId: env.SHEET_ID, range: 'A2:N' });
  let lastRow = 1;
  (tail.data.values || []).forEach((r, i) => {
    if (r.some(c => String(c ?? '').trim())) lastRow = i + 2;
  });
  const start = lastRow + 1;
  await sheets.spreadsheets.values.update({
    spreadsheetId: env.SHEET_ID,
    range: `A${start}:N${start + appended.length - 1}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: appended.map((p, i) => [
        String(Date.now() + i), p.name, p.category, String(p.priceSet[1] ?? ''),
        p.images.map(f => `/products/${f}`).join(','), 'SI',
        p.sizes || '', '', '10',
        p.priceSet[3] != null ? String(p.priceSet[3]) : '',
        p.priceSet[6] != null ? String(p.priceSet[6]) : '',
        '',
        p.priceSet[12] != null ? String(p.priceSet[12]) : '',
        p.description,
      ]),
    },
  });
}
console.log(`\nLISTO: ${updates.length} actualizados, ${appended.length} agregados, ${copied} fotos copiadas, ${sheetDupes.length} duplicados vaciados.`);
