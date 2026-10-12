// Decide qué hacer con los mensajes nuevos: qué productos se agregan, cuáles
// actualizan una fila existente y cuáles se dejan para revisar a mano.
import { parseChatText, buildImportPlan, sanitizeLegacyPack, type ChatProduct, type SheetRow } from '../../vito-store/src/lib/whatsappChat.ts';
import { agrupar, aTextoExport, archivoDeFoto, type Guardado, type Grupo } from './convertir.ts';

export const UMBRAL_SEGURO = 0.95; // por debajo, el parecido de nombres no alcanza para tocar la fila sola

export interface Decision {
    nuevos: { producto: ChatProduct; fotos: string[] /* ids de mensaje */; grupoIds: string[] }[];
    actualizar: { producto: ChatProduct; fila: SheetRow; score: number; cells: string[]; grupoIds: string[] }[];
    revisar: { producto: ChatProduct; fila: SheetRow; score: number; grupoIds: string[] }[];
    sinFoto: ChatProduct[];
    duplicadosEnSheet: SheetRow[];
    grupos: Grupo[];
}

export function decidir(pendientes: Guardado[], filas: SheetRow[]): Decision {
    const grupos = agrupar(pendientes);
    const productos = parseChatText(aTextoExport(grupos));
    const plan = buildImportPlan(productos, filas);

    // archivo de foto -> mensaje y publicación de origen
    const fotoAId = new Map<string, string>();
    const fotoAGrupo = new Map<string, Grupo>();
    for (const g of grupos) for (const id of g.images) { fotoAId.set(archivoDeFoto(id), id); fotoAGrupo.set(archivoDeFoto(id), g); }
    const idsDe = (p: ChatProduct) => [...new Set(p.images.flatMap(f => fotoAGrupo.get(f)?.ids ?? []))];

    const d: Decision = { nuevos: [], actualizar: [], revisar: [], sinFoto: plan.noImages, duplicadosEnSheet: plan.dupes, grupos };

    for (const u of plan.updates) {
        if (u.score < UMBRAL_SEGURO) { d.revisar.push({ producto: u.chat, fila: u.sheet, score: u.score, grupoIds: idsDe(u.chat) }); continue; }
        const s = u.sheet, np = u.chat.priceSet;
        d.actualizar.push({
            producto: u.chat, fila: s, score: u.score, grupoIds: idsDe(u.chat),
            cells: [
                s.id, s.name, s.category,
                np[1] != null ? String(np[1]) : sanitizeLegacyPack(s.price),
                s.image_url, 'SI',
                s.size || u.chat.sizes || '', s.color || '',
                s.quantity || '10',
                np[3] != null ? String(np[3]) : sanitizeLegacyPack(s.p3),
                np[6] != null ? String(np[6]) : sanitizeLegacyPack(s.p6),
                s.p9 || '',
                np[12] != null ? String(np[12]) : sanitizeLegacyPack(s.p12),
                s.desc || u.chat.description || '',
            ],
        });
    }
    const porId = new Map(pendientes.map(m => [m.id, m]));
    for (const p of plan.appends) {
        // la misma foto republicada varias veces se sube una sola vez
        const vistas = new Set<string>();
        const fotos = p.images.map(f => fotoAId.get(f)!).filter(Boolean).filter(id => {
            const sha = porId.get(id)?.sha;
            if (!sha) return true;
            if (vistas.has(sha)) return false;
            vistas.add(sha); return true;
        }).slice(0, 10);
        d.nuevos.push({ producto: p, fotos, grupoIds: idsDe(p) });
    }
    return d;
}

/** Fila nueva del sheet (mismo formato que el importador del admin). */
export function filaNueva(p: ChatProduct, urls: string[], i: number): string[] {
    return [
        String(Date.now() + i), p.name, p.category, String(p.priceSet[1] ?? ''),
        urls.join(','), 'SI',
        p.sizes || '', '', '10',
        p.priceSet[3] != null ? String(p.priceSet[3]) : '',
        p.priceSet[6] != null ? String(p.priceSet[6]) : '',
        '',
        p.priceSet[12] != null ? String(p.priceSet[12]) : '',
        p.description,
    ];
}

const $ = (n?: number) => n != null ? '$' + n.toLocaleString('es-AR') : '-';
export const resumenPrecios = (p: ChatProduct) =>
    `${$(p.priceSet[1])}  (3x ${$(p.priceSet[3])} · 6x ${$(p.priceSet[6])} · docena ${$(p.priceSet[12])})`;
