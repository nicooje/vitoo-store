// Memoria del bot entre corridas: qué mensajes vio y cuáles ya pasó a la web.
import fs from 'fs';
import path from 'path';
import type { Guardado } from './convertir.ts';

export interface Estado {
    gruposVistos: Record<string, string>;        // jid -> nombre del grupo
    mensajes: Record<string, Guardado & { jid: string; fromMe?: boolean }>;
    procesados: Record<string, number>;           // id -> cuándo se procesó (ms)
    ultimaCorrida?: number;                       // ms
    ultimoMensajeTs?: number;                     // s: el mensaje más nuevo visto hasta la corrida anterior
}

export function cargarEstado(archivo: string): Estado {
    try {
        const e = JSON.parse(fs.readFileSync(archivo, 'utf8'));
        return { gruposVistos: {}, mensajes: {}, procesados: {}, ...e };
    } catch {
        return { gruposVistos: {}, mensajes: {}, procesados: {} };
    }
}

export function guardarEstado(archivo: string, e: Estado) {
    // no acumular para siempre el mensaje original (pesa por la miniatura):
    // a los 45 días de procesado ya no hace falta para bajar fotos
    const limite = Date.now() - 45 * 864e5;
    for (const [id, cuando] of Object.entries(e.procesados))
        if (cuando < limite && e.mensajes[id]) delete e.mensajes[id].raw;
    fs.mkdirSync(path.dirname(archivo), { recursive: true });
    const tmp = archivo + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(e));
    fs.renameSync(tmp, archivo); // escritura atómica: si se corta la luz no se rompe el archivo
}
