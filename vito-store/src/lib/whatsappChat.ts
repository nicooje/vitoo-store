// Motor de importacion de catalogo desde exportes de WhatsApp.
// Puerto 1:1 de scripts/importar-whatsapp.mjs (logica probada en produccion)
// a funciones puras ejecutables en el navegador.

// ---------- utilidades de texto ----------
export const fold = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const stripEmojis = (s: string) => s.replace(/[^\p{L}\p{N}\s/.,-]/gu, ' ');
const STOP = new Set(['de', 'la', 'el', 'los', 'las', 'y', 'para', 'p', 'c', 'al', 'a', 'en', 'con', 'del', 'un', 'una']);
const tokensOf = (s: string) => fold(stripEmojis(s).toLowerCase()).split(/[^a-z0-9]+/).filter(w => w && !STOP.has(w));
export const normKey = (s: string) => [...new Set(tokensOf(s))].sort().join(' ');
const stripSizeFromName = (s: string) =>
    s.replace(/\(?\s*[tT]?\d{1,3}\s*(?:-|al|a|\/|y|,)\s*\d{1,3}\s*(?:de\s*pantal[oó]n)?\s*\)?/g, ' ')
        .replace(/\(\s*talles?\s*[^)]*\)/gi, ' ')
        .replace(/\btalles?\b.*$/i, ' ');
export const baseKey = (s: string) => normKey(stripSizeFromName(s));
const parenSize = (name: string) => { const m = /\(([^)]*\d[^)]*)\)/.exec(name); return m ? fold(m[1]).replace(/\s/g, '').toLowerCase() : ''; };

function parseAmount(raw: string): number | null {
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
export function extractPrices(text: string): Record<number, number> {
    const out: Record<number, number> = {};
    const comboRe = new RegExp(String.raw`(\d{1,2})\s*(?:[x×]|pares?)\s*\$?\s*` + AMT, 'gi');
    let m: RegExpExecArray | null;
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
        const amt = parseAmount(m[2]);
        if (amt && amt >= 500) out[12] ??= amt;
        rest = rest.replace(docRe, ' ');
    }
    const solo = new RegExp(String.raw`\$\s*` + AMT, 'i');
    if ((m = solo.exec(rest))) {
        const amt = parseAmount(m[1]);
        if (amt && amt >= 300 && amt <= 2000000) out[1] ??= amt;
    }
    // productos publicados solo por paquetes ("3 pares $X"): derivar el unitario
    // del paquete (convencion del sheet: unitario ~ pack/ N), redondeado a centenas.
    if (!out[1]) {
        const base = out[3] != null ? out[3] / 3 : out[6] != null ? out[6] / 6 : out[12] != null ? out[12] / 12 : null;
        if (base) out[1] = Math.round(base / 100) * 100;
    }
    return out;
}

function extractSizes(name: string, caption: string): string {
    const frags: string[] = [];
    const ps = parenSize(name);
    if (ps) frags.push(ps.toUpperCase());
    for (const line of caption.split('\n').slice(1)) {
        const l = line.trim();
        const idx = l.search(/\btalle/i);
        if (idx === -1) continue;
        let f = l.slice(idx).replace(/\*/g, '').replace(/\$\s*[\d.,]+/g, '').replace(/precio por (menor|mayor)/gi, '').replace(/[.:;,]+$/, '').trim();
        if (!f || f.length > 60) continue;
        if (!/\d/.test(f) && !/\b(?:XXS|XS|S|M|L|XL|XXL|XXXL)\b/.test(f)) continue;
        frags.push(f);
    }
    return [...new Set(frags)].slice(0, 2).join(' | ');
}

const SKIP_NAMES = ['complementos para sus outfits', 'reposicion', 'reposición'];
function cleanName(line: string) {
    return line.replace(/\*/g, '')
        .replace(/^\s*(?:[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}✨🔥🥵☁️🧦❄️🌬️🧸📚🎃💕🇦🇷🐆💦🍑🥥💧🌨️💜🤰🏽]\s*)+/u, '')
        .replace(/\s+/g, ' ').trim();
}

function extractName(caption: string): string {
    const firstLine = caption.split('\n')[0] || '';
    const cands: string[] = [];
    for (const m of caption.matchAll(/\*(.+?)\*/g)) cands.push(m[1]);
    cands.push(firstLine);
    for (const raw of cands) {
        let n = raw.trim();
        if (!n) continue;
        if (!/\*/.test(raw)) {
            const cut = /\$|disponible|\btalles?\b/i.exec(n);
            if (cut) n = n.slice(0, cut.index);
        }
        n = cleanName(n).replace(/\s*\$\s*[\d.,\s]+\s*$/, '').replace(/[.\s]+$/, '').trim();
        if (n.length > 3 && !SKIP_NAMES.some(sk => fold(n.toLowerCase()).includes(fold(sk)))) return n;
    }
    return '';
}

export function categorize(name: string, text: string): string {
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

// ---------- tipos ----------
export interface ChatProduct {
    key: string;
    name: string;
    priceSet: Record<number, number>;
    sizes: string;
    description: string;
    category: string;
    images: string[];
    date: string;
    time: string;
}

export interface SheetRow {
    rowNumber: number;
    id: string;
    name: string;
    category: string;
    price: string;
    image_url: string;
    stock: string;
    size: string;
    color: string;
    quantity: string;
    p3?: string;
    p6?: string;
    p9?: string;
    p12?: string;
    desc: string;
}

export interface ImportPlan {
    updates: { chat: ChatProduct; sheet: SheetRow; score: number }[];
    appends: ChatProduct[];
    noImages: ChatProduct[];
    dupes: SheetRow[];
    merges: string[];
    stats: { uniqueInChat: number; omitted: number; republishMerges: number };
}

// ---------- 1. parsear chat ----------
interface RawMessage { date: string; time: string; sender: string; text: string }

export function parseChatText(rawTxt: string): ChatProduct[] {
    rawTxt = rawTxt.replace(/^\uFEFF/, '');
    const HEADER = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4}), (\d{1,2}):(\d{2}) - ([^:]+): ?([\s\S]*)$/;
    const messages: RawMessage[] = [];
    for (const line of rawTxt.split(/\r?\n/)) {
        const m = HEADER.exec(line);
        if (m) messages.push({ date: `20${m[3].slice(-2)}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`, time: `${m[4].padStart(2, '0')}:${m[5]}`, sender: m[6].replace(/^\u200E/, '').trim(), text: m[7].replace(/^\u200E/, '') });
        else if (messages.length) messages[messages.length - 1].text += '\n' + line.replace(/^\u200E/, '');
    }

    const IMG_RE = /^(.+?\.(?:jpe?g|png|webp))\s*\(archivo adjunto\)$/i;
    type Cand =
        | ({ type: 'product'; omitted: boolean } & ChatProduct)
        | { type: 'images-only'; images: string[]; date: string; time: string };
    const candidates: Cand[] = [];
    let lastProduct: (Cand & { type: 'product' }) | null = null;

    for (const msg of messages) {
        if (msg.sender !== 'Vito Store') continue;
        const imgs: string[] = []; let omitted = false; const capLines: string[] = [];
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

        // foto extra referencial del producto anterior
        if (imgs.length > 0 && lastProduct && !hasPrice && meaningful && firstLine.length < 70 &&
            (/^(de\s+\$|asi es|de frente|de atr[aá]s)/i.test(firstLine) || !/\*/.test(firstLine))) {
            for (const f of imgs) if (!lastProduct.images.includes(f)) lastProduct.images.push(f);
            continue;
        }

        if ((imgs.length > 0 || omitted) && hasPrice && meaningful) {
            const name = extractName(caption);
            const prod: (Cand & { type: 'product' }) = {
                type: 'product',
                name,
                priceSet: extractPrices(caption),
                sizes: extractSizes(name, caption),
                description: caption.split('\n').map(l => l.replace(/\*/g, '').trim()).filter(l => l && !NOISE_RE.test(l)).join('\n'),
                category: categorize(name, caption),
                images: [...imgs],
                date: msg.date,
                time: msg.time,
                omitted: imgs.length === 0,
                key: '',
            };
            candidates.push(prod);
            lastProduct = prod;
            continue;
        }
        if (imgs.length > 0) candidates.push({ type: 'images-only', images: imgs, date: msg.date, time: msg.time });
    }

    // imagenes sueltas al inicio de un album -> producto con caption siguiente
    const resolved: Cand[] = [];
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
    const products: (Cand & { type: 'product' })[] = [];
    for (const c of resolved.filter((x): x is Cand & { type: 'product' } => x.type === 'product' && !!x.name)) {
        const key = baseKey(c.name);
        const same = products.find(p => p.key === key && p.priceSet[1] === c.priceSet[1]);
        if (same) {
            for (const f of c.images) if (!same.images.includes(f)) same.images.push(f);
            if (c.date > same.date) Object.assign(same, { name: c.name, priceSet: c.priceSet, description: c.description || same.description });
            if (!same.sizes && c.sizes) same.sizes = c.sizes;
            continue;
        }
        const older = products.find(p => p.key === key && parenSize(p.name) === parenSize(c.name));
        if (older) {
            for (const f of c.images) if (!older.images.includes(f)) older.images.push(f);
            Object.assign(older, { name: c.name, priceSet: c.priceSet, date: c.date, description: c.description || older.description });
            if (!older.sizes && c.sizes) older.sizes = c.sizes;
            continue;
        }
        products.push({ ...c, key });
    }
    // maximo 10 fotos por producto
    for (const p of products) if (p.images.length > 10) p.images = p.images.slice(0, 10);
    return products;
}

// ---------- 3. matching contra el sheet ----------
export function sanitizeLegacyPack(v: string | undefined): string {
    const n = parseFloat(String(v ?? '').replace(',', '.'));
    if (!isFinite(n) || n === 0) return '';
    const val = n <= 500 ? n * 1000 : n;
    return val >= 300 && val <= 200000 ? String(Math.round(val)) : '';
}

function score(a: string, b: string) {
    const ta = a.split(' ').filter(Boolean), tb = b.split(' ').filter(Boolean);
    const inter = ta.filter(t => tb.includes(t));
    const jac = inter.length / new Set([...ta, ...tb]).size;
    let hits = 0; const bb = b.replace(/ /g, ''); const aa = a.replace(/ /g, '');
    for (let i = 0; i < aa.length - 1; i++) if (bb.includes(aa.slice(i, i + 2))) hits++;
    const dice = 2 * hits / ((aa.length - 1) + (bb.length - 1) || 1);
    return { score: Math.max(jac, dice), sharedStrong: inter.filter(t => t.length >= 5).length };
}

export function buildImportPlan(chatProducts: ChatProduct[], sheetRows: SheetRow[]): ImportPlan {
    const live = sheetRows.filter(r => r.name || r.price || r.image_url);

    // dedupe interno del sheet (mismo nombre-base y precio -> queda la fila mas vieja)
    const seenSheet = new Map<string, SheetRow>(); const dupes: SheetRow[] = [];
    for (const s of live) {
        const pk = baseKey(s.name) + '|' + sanitizeLegacyPack(s.price);
        const existing = seenSheet.get(pk);
        if (existing) dupes.push(existing.rowNumber < s.rowNumber ? s : existing);
        else seenSheet.set(pk, s);
    }
    const survivors = live.filter(s => !dupes.includes(s));

    const withImages = chatProducts.filter(p => p.images.length > 0);
    const noImages = chatProducts.filter(p => p.images.length === 0);

    interface Pair { p: ChatProduct; s: SheetRow; sc: number }
    const pairs: Pair[] = [];
    const usedP = new Set<string>(), usedS = new Set<number>(dupes.map(d => d.rowNumber));
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
    const updates: Pair[] = [], appended: ChatProduct[] = [];
    for (const pr of pairs) {
        if (usedP.has(pr.p.key) || usedS.has(pr.s.rowNumber)) continue;
        usedP.add(pr.p.key); usedS.add(pr.s.rowNumber);
        updates.push(pr);
    }
    for (const p of withImages) if (!usedP.has(p.key)) appended.push(p);

    return {
        updates: pairs.map(p => ({ chat: p.p, sheet: p.s, score: p.sc })),
        appends: appended,
        noImages,
        dupes,
        merges: [],
        stats: { uniqueInChat: chatProducts.length, omitted: noImages.length, republishMerges: 0 },
    };
}
