// Revisión de precios: compara TODAS las filas de la web con la publicación más reciente
// de cada producto en el historial del grupo (no solo los mensajes nuevos).
//  - Si es el mismo producto (mismo nombre, o el mismo modelo en otro color) y el precio
//    cambió, actualiza la fila.
//  - Si solo se parece, no la toca: la deja como sugerencia para aplicar desde el panel.
// Para no pisar cambios hechos a mano, una fila se vuelve a tocar solo si aparece una
// publicación más nueva que la última que ya se le aplicó.
import { parseChatText, baseKey, normKey, fold, sanitizeLegacyPack, type ChatProduct, type SheetRow } from '../../vito-store/src/lib/whatsappChat.ts';
import { agrupar, aTextoExport, type Guardado } from './convertir.ts';

const COLORES = [
    'rosa viejo', 'verde agua', 'azul francia', 'blanco', 'blanca', 'negro', 'negra', 'rojo', 'roja', 'rosa', 'fucsia',
    'beige', 'crema', 'nude', 'celeste', 'azul', 'verde', 'lila', 'violeta', 'bordo', 'bordó', 'gris', 'marron', 'marrón',
    'amarillo', 'naranja', 'coral', 'salmon', 'salmón', 'turquesa', 'mostaza', 'chocolate', 'vison', 'visón', 'natural',
];
const COLOR_RE = new RegExp(`\\b(${COLORES.map(c => fold(c)).join('|')})\\b`, 'g');
/** Nombre sin colores: "Conjunto beige c/aro de morley" y "Conjunto c/aro de morley" son el mismo modelo. */
const sinColor = (s: string) => baseKey(fold(s.toLowerCase()).replace(COLOR_RE, ' '));
/** Talle entre paréntesis: (T36-42) y (T44-50) son productos distintos aunque el nombre coincida. */
const talleParen = (s: string) => { const m = /\(([^)]*\d[^)]*)\)/.exec(s); return m ? fold(m[1]).replace(/\s/g, '').toLowerCase() : ''; };

/** Rango de talles "36-42", sacado de "(T36-42)" o de "Talles 36 al 42": distinto rango = distinto producto. */
const rango = (s: string) => { const m = /(\d{2})\s*(?:al|a|-|\/)\s*(\d{2})/i.exec(s || ''); return m ? `${m[1]}-${m[2]}` : ''; };

const tokens = (k: string) => k.split(' ').filter(Boolean);
function parecido(a: string, b: string) {
    const A = tokens(a), B = tokens(b);
    const comunes = A.filter(t => B.includes(t));
    return { score: comunes.length / Math.max(1, new Set([...A, ...B]).size), fuertes: comunes.filter(t => t.length >= 5).length };
}

const num = (v?: string) => {
    const n = parseFloat(String(v ?? '').replace(/\$|\s/g, '').replace(/\.(?=\d{3}\b)/g, '').replace(',', '.'));
    if (!isFinite(n) || n <= 0) return 0;
    return n <= 500 ? n * 1000 : n;
};
/** Precio por unidad de un pack: el sheet a veces guarda el total del pack y a veces el unitario. */
const unitario = (v: number, base: number, cant: number) => (v > base ? v / cant : v);
const sello = (p: ChatProduct) => `${p.date} ${p.time}`;

export interface CambioPrecio {
    fila: SheetRow;
    producto: ChatProduct;
    tipo: 'mismo' | 'color';
    antes: number;
    despues: number;
    cells: string[];
}
export interface Sugerencia {
    fila: SheetRow;
    producto: ChatProduct;
    score: number;
}

export function revisarPrecios(historial: Guardado[], filas: SheetRow[], aplicados: Record<string, string>, yaTocadas: Set<number>) {
    const productos = parseChatText(aTextoExport(agrupar(historial.filter(m => !m.deleted))))
        .filter(p => p.priceSet[1] && p.images.length);
    const cambios: CambioPrecio[] = [];
    const sugerencias: Sugerencia[] = [];

    for (const f of filas) {
        if (!f.name || yaTocadas.has(f.rowNumber)) continue;
        const precioWeb = num(f.price);
        if (!precioWeb) continue;

        const bk = baseKey(f.name), nk = normKey(f.name), ck = sinColor(f.name), tp = talleParen(f.name);
        // el talle entre paréntesis tiene que coincidir si los dos lo tienen: (T36-42) ≠ (T44-50)
        const rf = rango(`${f.name} ${f.size}`);
        const talleOk = (p: ChatProduct) => { const rp = rango(p.name) || rango(p.sizes); return !rf || !rp || rf === rp; };
        const mismos = productos.filter(p => (baseKey(p.name) === bk || normKey(p.name) === nk) && talleOk(p));
        const colores = mismos.length ? [] : productos.filter(p => sinColor(p.name) === ck && talleOk(p) && ck.split(' ').length >= 2);
        const candidatos = mismos.length ? mismos : colores;

        if (candidatos.length) {
            // preferir el mismo nombre exacto y el mismo rango de talles; después, la publicación más nueva
            const puntos = (p: ChatProduct) => (normKey(p.name) === nk ? 2 : 0) + (rf && (rango(p.name) || rango(p.sizes)) === rf ? 1 : 0);
            const orden = [...candidatos].sort((a, b) => puntos(b) - puntos(a) || sello(b).localeCompare(sello(a)));
            const p = orden[0];
            // si quedan empatados productos con distinto precio (ej. mismo nombre en talles distintos), no adivinar
            const empatados = orden.filter(o => puntos(o) === puntos(p) && o.priceSet[1] !== p.priceSet[1]);
            if (empatados.length) { sugerencias.push({ fila: f, producto: p, score: 0.8 }); continue; }
            const np = p.priceSet;
            const razon = np[1] / precioWeb;
            if (razon < 0.5 || razon > 2) { sugerencias.push({ fila: f, producto: p, score: 0.9 }); continue; } // salto raro: que lo mire una persona
            const clave = f.id || f.name;
            if (aplicados[clave] && aplicados[clave] >= sello(p)) continue; // ya se aplicó esta publicación (o una más nueva)

            const distinto = Math.round(np[1]) !== Math.round(precioWeb)
                || ([[3, f.p3], [6, f.p6], [12, f.p12]] as const).some(([n, v]) =>
                    np[n] != null && Math.abs(unitario(num(v), precioWeb, n) - np[n]! / n) > 1);
            if (!distinto) { aplicados[clave] = sello(p); continue; }

            cambios.push({
                fila: f, producto: p, tipo: mismos.length ? 'mismo' : 'color', antes: precioWeb, despues: np[1],
                cells: [
                    f.id, f.name, f.category, String(np[1]), f.image_url, f.stock || 'SI',
                    f.size || p.sizes || '', f.color || '', f.quantity || '10',
                    np[3] != null ? String(np[3]) : sanitizeLegacyPack(f.p3),
                    np[6] != null ? String(np[6]) : sanitizeLegacyPack(f.p6),
                    f.p9 || '',
                    np[12] != null ? String(np[12]) : sanitizeLegacyPack(f.p12),
                    f.desc || p.description || '',
                ],
            });
            continue;
        }

        // sin coincidencia segura: ¿hay algo parecido con otro precio? -> sugerencia para el panel
        let mejor: { p: ChatProduct; score: number } | null = null;
        for (const p of productos) {
            if (!talleOk(p) || p.category !== f.category) continue;
            const { score, fuertes } = parecido(ck, sinColor(p.name));
            if (score >= 0.6 && fuertes >= 1 && (!mejor || score > mejor.score || (score === mejor.score && sello(p) > sello(mejor.p)))) mejor = { p, score };
        }
        if (mejor && Math.round(mejor.p.priceSet[1]) !== Math.round(precioWeb)) sugerencias.push({ fila: f, producto: mejor.p, score: mejor.score });
    }
    return { cambios, sugerencias: sugerencias.sort((a, b) => b.score - a.score).slice(0, 60), productos: productos.length };
}

export const selloDe = sello;
