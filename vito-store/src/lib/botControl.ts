// Comunicación panel <-> PC a través de una pestaña "Bot" del mismo Google Sheet.
// El panel solo escribe B2:B4 (el pedido); el agente de la PC solo escribe B5:B12
// (estado y resultado). Así nunca se pisan entre sí.
import { getGoogleSheetsClient } from '@/lib/googleSheets';

export const BOT_TAB = 'Bot';
export const BOT_KEYS = [
    'solicitud_id', 'solicitud_modo', 'solicitud_fecha',
    'atendida_id', 'estado', 'detalle', 'codigo', 'latido', 'inicio', 'fin', 'resultado',
] as const;

export interface BotResultado {
    fecha: string;
    simular: boolean;
    mensajes: number;
    nuevos: { nombre: string; precio?: number; fotos: number; categoria: string; fallo?: boolean }[];
    actualizados: { fila: number; nombre: string; precio?: number }[];
    revisar: { nombre: string; parecido: string; fila: number; score: number }[];
    sinFoto: string[];
    error?: string;
}

export interface BotEstado {
    configurado: boolean;
    solicitud: { id: string; modo: string; fecha: string } | null;
    pendiente: boolean;
    estado: string;          // esperando | en_curso | ok | error
    detalle: string;
    codigo: string;
    latido: string;
    pcConectada: boolean;
    inicio: string;
    fin: string;
    resultado: BotResultado | null;
}

async function tabExists() {
    const { sheets, sheetId } = await getGoogleSheetsClient();
    const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId, fields: 'sheets.properties.title' });
    return { sheets, sheetId, exists: (meta.data.sheets || []).some(s => s.properties?.title === BOT_TAB) };
}

export async function ensureBotTab() {
    const { sheets, sheetId, exists } = await tabExists();
    if (!exists) {
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: sheetId,
            requestBody: { requests: [{ addSheet: { properties: { title: BOT_TAB } } }] },
        });
        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `${BOT_TAB}!A1:B${BOT_KEYS.length + 1}`,
            valueInputOption: 'RAW',
            requestBody: { values: [['clave', 'valor (lo maneja el panel y el agente de la PC)'], ...BOT_KEYS.map(k => [k, ''])] },
        });
    }
    return { sheets, sheetId };
}

export async function readBotState(): Promise<BotEstado> {
    const { sheets, sheetId, exists } = await tabExists();
    const vacio: BotEstado = {
        configurado: false, solicitud: null, pendiente: false, estado: 'esperando', detalle: '', codigo: '',
        latido: '', pcConectada: false, inicio: '', fin: '', resultado: null,
    };
    if (!exists) return vacio;

    const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: `${BOT_TAB}!B2:B${BOT_KEYS.length + 1}` });
    const vals = (res.data.values || []).map(r => String(r?.[0] ?? ''));
    const v = Object.fromEntries(BOT_KEYS.map((k, i) => [k, vals[i] ?? ''])) as Record<(typeof BOT_KEYS)[number], string>;

    let resultado: BotResultado | null = null;
    try { resultado = v.resultado ? JSON.parse(v.resultado) : null; } catch { resultado = null; }
    const latidoMs = Date.parse(v.latido);

    return {
        configurado: true,
        solicitud: v.solicitud_id ? { id: v.solicitud_id, modo: v.solicitud_modo, fecha: v.solicitud_fecha } : null,
        pendiente: Boolean(v.solicitud_id) && v.solicitud_id !== v.atendida_id,
        estado: v.estado || 'esperando',
        detalle: v.detalle,
        codigo: v.codigo,
        latido: v.latido,
        pcConectada: Number.isFinite(latidoMs) && Date.now() - latidoMs < 90_000,
        inicio: v.inicio,
        fin: v.fin,
        resultado,
    };
}

export async function requestBotRun(modo: 'aplicar' | 'simular') {
    const { sheets, sheetId } = await ensureBotTab();
    const id = `${Date.now()}`;
    await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${BOT_TAB}!B2:B4`,
        valueInputOption: 'RAW',
        requestBody: { values: [[id], [modo], [new Date().toISOString()]] },
    });
    return id;
}
