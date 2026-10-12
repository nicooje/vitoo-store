// Convierte mensajes de WhatsApp (Baileys) al mismo formato de texto que el
// "Exportar chat" del celular, para reutilizar el intérprete de la web
// (vito-store/src/lib/whatsappChat.ts) sin reescribir sus reglas.

export interface Guardado {
    id: string;
    ts: number;            // segundos (epoch)
    from: string;          // quien lo mandó (jid del participante)
    kind: 'image' | 'video' | 'text' | 'other';
    caption: string;
    albumParent?: string;  // id del álbum al que pertenece la foto
    sha?: string;          // huella del archivo de la foto (para no subir la misma dos veces)
    deleted?: boolean;
    raw?: string;          // mensaje original (JSON) para poder bajar la foto
}

export type Evento =
    | { tipo: 'mensaje'; msg: Guardado }
    | { tipo: 'edicion'; id: string; caption: string; ts: number }
    | { tipo: 'borrado'; id: string };

// desenvuelve los contenedores (efímeros, "ver una vez", etc.)
function unwrap(m: any): any {
    for (let i = 0; i < 6 && m; i++) {
        const inner = m.ephemeralMessage?.message || m.viewOnceMessage?.message ||
            m.viewOnceMessageV2?.message || m.viewOnceMessageV2Extension?.message ||
            m.documentWithCaptionMessage?.message || m.editedMessage?.message ||
            m.associatedChildMessage?.message;
        if (!inner) break;
        m = inner;
    }
    return m;
}

function textoDe(m: any): string {
    if (!m) return '';
    return m.imageMessage?.caption ?? m.videoMessage?.caption ?? m.conversation ??
        m.extendedTextMessage?.text ?? m.documentMessage?.caption ?? '';
}

function huella(v: any): string | undefined {
    if (!v) return undefined;
    if (typeof v === 'string') return v;
    try { return Buffer.from(v.data ?? v).toString('base64'); } catch { return undefined; }
}

const toNum = (v: any): number => {
    if (v == null) return 0;
    if (typeof v === 'number') return v;
    if (typeof v === 'object' && 'low' in v) return (v.high >>> 0) * 2 ** 32 + (v.low >>> 0);
    return Number(v) || 0;
};

/** Traduce un mensaje de Baileys a un evento simple (o null si no interesa). */
export function aEvento(waMsg: any, rawJson?: string): Evento | null {
    const key = waMsg?.key;
    if (!key?.id || !waMsg.message) return null;
    const ts = toNum(waMsg.messageTimestamp);
    const outer = waMsg.message;
    const m = unwrap(outer);

    const proto = m.protocolMessage;
    if (proto) {
        if (proto.type === 0 || proto.type === 'REVOKE') return proto.key?.id ? { tipo: 'borrado', id: proto.key.id } : null;
        if ((proto.type === 14 || proto.type === 'MESSAGE_EDIT') && proto.key?.id)
            return { tipo: 'edicion', id: proto.key.id, caption: textoDe(unwrap(proto.editedMessage)), ts };
        return null;
    }
    if (m.albumMessage || m.reactionMessage || m.senderKeyDistributionMessage && Object.keys(m).length === 1) return null;

    let kind: Guardado['kind'] = 'other';
    if (m.imageMessage) kind = 'image';
    else if (m.videoMessage) kind = 'video';
    else if (m.conversation != null || m.extendedTextMessage) kind = 'text';
    if (kind === 'other') return null;

    const assoc = outer.messageContextInfo?.messageAssociation || m.messageContextInfo?.messageAssociation;
    const albumParent = assoc && (assoc.associationType === 1 || assoc.associationType === 'MEDIA_ALBUM')
        ? assoc.parentMessageKey?.id || undefined : undefined;

    return {
        tipo: 'mensaje',
        msg: {
            id: key.id, ts, from: key.participant || key.participantAlt || key.remoteJid || '',
            kind, caption: textoDe(m).trim(), albumParent, raw: rawJson, sha: huella(m.imageMessage?.fileSha256),
        },
    };
}

export interface Grupo {
    ids: string[];       // mensajes que forman esta publicación
    ts: number;
    images: string[];    // ids de los mensajes con foto (en orden)
    caption: string;
    hasVideo: boolean;
}

const VENTANA = 90; // segundos: fotos sueltas así de cerca de una con texto son del mismo álbum

/** Junta fotos del mismo álbum (o mandadas seguidas) en una sola publicación. */
export function agrupar(msgs: Guardado[]): Grupo[] {
    const vivos = msgs.filter(m => !m.deleted).sort((a, b) => a.ts - b.ts || a.id.localeCompare(b.id));
    const grupos: Grupo[] = [];
    const porAlbum = new Map<string, Grupo>();
    const nuevo = (m: Guardado): Grupo => ({ ids: [], ts: m.ts, images: [], caption: '', hasVideo: false });
    const sumar = (g: Grupo, m: Guardado) => {
        g.ids.push(m.id);
        if (m.kind === 'image') g.images.push(m.id);
        if (m.kind === 'video') g.hasVideo = true;
        if (m.caption) g.caption = g.caption ? g.caption + '\n' + m.caption : m.caption;
        g.ts = Math.min(g.ts, m.ts);
    };

    // 1) álbumes declarados por WhatsApp
    const sueltos: Guardado[] = [];
    for (const m of vivos) {
        if (m.albumParent) {
            let g = porAlbum.get(m.albumParent);
            if (!g) { g = nuevo(m); porAlbum.set(m.albumParent, g); grupos.push(g); }
            sumar(g, m);
        } else sueltos.push(m);
    }
    // 2) el resto: cada mensaje es su propia publicación...
    const individuales: { m: Guardado; g: Grupo }[] = [];
    for (const m of sueltos) {
        const g = nuevo(m); sumar(g, m);
        individuales.push({ m, g });
    }
    // ...salvo fotos SIN texto pegadas (misma persona, <90s) a una foto con texto
    const absorbidos = new Set<Grupo>();
    for (let i = 0; i < individuales.length; i++) {
        const { m, g } = individuales[i];
        if (m.kind !== 'image' || m.caption) continue;
        const cerca = (j: number) => {
            const o = individuales[j];
            return o && !absorbidos.has(o.g) && o.m.from === m.from && Math.abs(o.m.ts - m.ts) <= VENTANA &&
                (o.m.kind === 'image' || o.m.kind === 'video') ? o : null;
        };
        // buscar hacia atrás/adelante la publicación con texto más cercana del mismo tirón
        let destino: Grupo | null = null;
        for (let j = i - 1; j >= 0 && !destino; j--) {
            const o = cerca(j); if (!o) break;
            if (o.g.caption) destino = o.g;
        }
        for (let j = i + 1; j < individuales.length && !destino; j++) {
            const o = cerca(j); if (!o) break;
            if (o.m.caption) destino = o.g;
        }
        if (destino) { absorbidos.add(g); sumar(destino, m); }
    }
    for (const { g } of individuales) if (!absorbidos.has(g)) grupos.push(g);
    return grupos.sort((a, b) => a.ts - b.ts);
}

export const archivoDeFoto = (id: string) => `IMG-${id.replace(/[^A-Za-z0-9]/g, '')}.jpg`;

function fechaExport(ts: number): string {
    const d = new Date(ts * 1000);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getDate()}/${d.getMonth() + 1}/${String(d.getFullYear()).slice(-2)}, ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Arma el texto tal cual lo genera "Exportar chat" (con el remitente que espera el intérprete). */
export function aTextoExport(grupos: Grupo[], remitente = 'Vito Store'): string {
    const lineas: string[] = [];
    for (const g of grupos) {
        const partes = g.images.map(id => `${archivoDeFoto(id)} (archivo adjunto)`);
        if (g.hasVideo) partes.push('VID-video.mp4 (archivo adjunto)');
        if (g.caption) partes.push(g.caption);
        if (!partes.length) continue;
        lineas.push(`${fechaExport(g.ts)} - ${remitente}: ${partes.join('\n')}`);
    }
    return lineas.join('\n');
}
