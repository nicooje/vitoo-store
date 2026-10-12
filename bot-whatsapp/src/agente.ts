// Agente de la PC: escucha el botón "Actualizar desde WhatsApp" del panel de administración.
// No se conecta a WhatsApp por su cuenta: solo mira cada 15 s si el panel pidió una
// actualización (pestaña "Bot" del Google Sheet) y, si la hay, corre el bot y devuelve el resultado.
// Se instala con "Instalar agente (botón del panel).bat" y arranca solo con Windows.
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { leerEnv, clienteSheets } from './sheet.ts';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATOS = path.join(RAIZ, 'datos');
const PID = path.join(DATOS, 'agente.pid');
const RESULTADO = path.join(DATOS, 'ultimo-resultado.json');
const TAB = 'Bot';
const KEYS = ['solicitud_id', 'solicitud_modo', 'solicitud_fecha', 'atendida_id', 'estado', 'detalle', 'codigo', 'latido', 'inicio', 'fin', 'resultado'];
const fila = (k: string) => KEYS.indexOf(k) + 2; // la fila 1 es el encabezado
const INTERVALO = 15_000;
const LIMITE_CORRIDA = 12 * 60_000;

const leerJson = (f: string) => { try { return JSON.parse(fs.readFileSync(path.join(RAIZ, f), 'utf8')); } catch { return {}; } };
const config = { ...leerJson('config.json'), ...leerJson('config.local.json') };
const ahora = () => new Date().toISOString();
const log = (...a: unknown[]) => console.log(new Date().toLocaleString('es-AR'), ...a);

// ---- una sola instancia ----
fs.mkdirSync(DATOS, { recursive: true });
try {
    const prev = Number(fs.readFileSync(PID, 'utf8'));
    if (prev && prev !== process.pid) { process.kill(prev, 0); log('El agente ya está corriendo (pid ' + prev + ').'); process.exit(0); }
} catch { /* no había otro */ }
fs.writeFileSync(PID, String(process.pid));
const limpiar = () => { try { if (Number(fs.readFileSync(PID, 'utf8')) === process.pid) fs.rmSync(PID); } catch { /* nada */ } };
process.on('exit', limpiar);
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

// el log no debe crecer para siempre
try { if (fs.statSync(path.join(DATOS, 'agente.log')).size > 2_000_000) fs.writeFileSync(path.join(DATOS, 'agente.log'), ''); } catch { /* nada */ }

const cliente = process.env.VITO_SHEETS_FAKE // solo para pruebas
    ? (await import('../test/sheets-falso.ts')).crear(process.env.VITO_SHEETS_FAKE)
    : clienteSheets(leerEnv(path.resolve(RAIZ, config.env || '../vito-store/.env.local')));
const sheets: ReturnType<typeof clienteSheets>["sheets"] = cliente.sheets;
const sheetId = process.env.VITO_SHEET_ID || cliente.sheetId; // VITO_SHEET_ID: solo para pruebas

async function asegurarTab() {
    const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId, fields: 'sheets.properties.title' });
    if ((meta.data.sheets || []).some(s => s.properties?.title === TAB)) return;
    await sheets.spreadsheets.batchUpdate({ spreadsheetId: sheetId, requestBody: { requests: [{ addSheet: { properties: { title: TAB } } }] } });
    await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId, range: `${TAB}!A1:B${KEYS.length + 1}`, valueInputOption: 'RAW',
        requestBody: { values: [['clave', 'valor (lo maneja el panel y el agente de la PC)'], ...KEYS.map(k => [k, ''])] },
    });
}

async function leer(): Promise<Record<string, string>> {
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: `${TAB}!B2:B${KEYS.length + 1}` });
    const vals = (res.data.values || []).map(r => String(r?.[0] ?? ''));
    return Object.fromEntries(KEYS.map((k, i) => [k, vals[i] ?? '']));
}

/** Escribe solo las celdas del agente (nunca las del pedido, B2:B4). */
async function escribir(cambios: Record<string, string>) {
    const data = Object.entries(cambios).map(([k, v]) => {
        if (fila(k) <= 4) throw new Error('el agente no escribe ' + k);
        return { range: `${TAB}!B${fila(k)}`, values: [[v.slice(0, 45_000)]] };
    });
    await sheets.spreadsheets.values.batchUpdate({ spreadsheetId: sheetId, requestBody: { valueInputOption: 'RAW', data } });
}

let corriendo = false;

async function correrBot(id: string, modo: string) {
    corriendo = true;
    const simular = modo === 'simular';
    log(`Pedido ${id} (${simular ? 'vista previa' : 'actualizar'})`);
    await escribir({ atendida_id: id, estado: 'en_curso', detalle: 'Arrancando en tu PC...', codigo: '', inicio: ahora(), fin: '' });
    try { fs.rmSync(RESULTADO, { force: true }); } catch { /* nada */ }

    const args = ['--import', 'tsx', process.env.VITO_BOT_SCRIPT || 'src/bot.ts', '--informe-json', RESULTADO, ...(simular ? ['--simular'] : [])];
    const hijo = spawn(process.execPath, args, { cwd: RAIZ, env: { ...process.env, VITO_AGENTE: '1' }, windowsHide: true });
    const matar = setTimeout(() => { log('La corrida tardó demasiado, la corto.'); hijo.kill(); }, LIMITE_CORRIDA);

    // reenviar el progreso al panel, sin saturar la API (como mucho 1 escritura cada 2 s)
    let pendiente: Record<string, string> = {};
    let ultimo = 0;
    let reintento: NodeJS.Timeout | undefined;
    const volcar = async (forzar = false) => {
        if (!Object.keys(pendiente).length) return;
        if (!forzar && Date.now() - ultimo < 2000) {
            // demasiado seguido: lo mando apenas se pueda para que el panel no se pierda pasos
            if (!reintento) reintento = setTimeout(() => { reintento = undefined; void volcar(); }, 2000 - (Date.now() - ultimo));
            return;
        }
        const c = pendiente; pendiente = {}; ultimo = Date.now();
        await escribir(c).catch(e => log('No pude escribir el progreso:', e.message));
    };
    const rl = readline.createInterface({ input: hijo.stdout });
    rl.on('line', line => {
        console.log('  ' + line);
        if (line.startsWith('@@ESTADO ')) { pendiente.detalle = line.slice(9); void volcar(); }
        if (line.startsWith('@@CODIGO')) {
            const codigo = line.slice(8).trim();
            pendiente.codigo = codigo;
            if (codigo) pendiente.detalle = 'Vinculá el bot: en tu celular abrí WhatsApp > Dispositivos vinculados > Vincular con número de teléfono e ingresá el código.';
            void volcar(true);
        }
    });
    let stderr = '';
    hijo.stderr.on('data', d => { stderr += d; process.stderr.write(d); });

    const codigoSalida: number = await new Promise(r => hijo.on('close', c => r(c ?? 1)));
    clearTimeout(matar);
    if (reintento) clearTimeout(reintento);
    await volcar(true);

    let resultado: any = null;
    try { resultado = JSON.parse(fs.readFileSync(RESULTADO, 'utf8')); } catch { /* sin resultado */ }
    const error = resultado?.error || (codigoSalida !== 0 ? (stderr.match(/ERROR: (.+)/)?.[1] || 'La corrida terminó con un error. Mirá bot-whatsapp/datos/agente.log') : '');
    const resumen = error ? error : simular
        ? `Vista previa: ${resultado?.nuevos?.length ?? 0} para agregar, ${resultado?.actualizados?.length ?? 0} para actualizar.`
        : `Listo: ${resultado?.nuevos?.filter((n: any) => !n.fallo).length ?? 0} agregados, ${resultado?.actualizados?.length ?? 0} actualizados.`;

    await escribir({
        estado: error ? 'error' : 'ok', detalle: resumen, codigo: '', fin: ahora(),
        resultado: JSON.stringify(resultado ?? { fecha: ahora(), simular, mensajes: 0, nuevos: [], actualizados: [], revisar: [], sinFoto: [], error }),
    }).catch(e => log('No pude escribir el resultado:', e.message));
    log(resumen);
    corriendo = false;
}

async function vuelta() {
    try {
        const v = await leer();
        await escribir({ latido: ahora() });
        if (!corriendo && v.solicitud_id && v.solicitud_id !== v.atendida_id) await correrBot(v.solicitud_id, v.solicitud_modo);
    } catch (e: any) {
        corriendo = false;
        log('Error:', e.message);
    }
}

log('Agente de Vito Store iniciado. Esperando el botón del panel...');
await asegurarTab().catch(e => log('No pude preparar la pestaña Bot:', e.message));
// el latido sigue aunque haya una corrida en curso
setInterval(() => { if (corriendo) void escribir({ latido: ahora() }).catch(() => {}); }, INTERVALO);
for (;;) {
    if (!corriendo) await vuelta();
    await new Promise(r => setTimeout(r, INTERVALO));
}
