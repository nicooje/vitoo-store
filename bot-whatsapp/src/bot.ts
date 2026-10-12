// Bot Vito Store: lee el grupo de WhatsApp y pasa las publicaciones nuevas a la web.
// Uso:  npx tsx src/bot.ts            -> actualiza la web
//       npx tsx src/bot.ts --simular  -> muestra qué haría, sin tocar nada
//       npx tsx src/bot.ts --qr       -> vincular escaneando un QR en vez de con código
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import makeWASocket, {
    useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, Browsers,
    BufferJSON, downloadMediaMessage, type WASocket,
} from '@whiskeysockets/baileys';
import { aEvento } from './convertir.ts';
import { cargarEstado, guardarEstado, type Estado } from './estado.ts';
import { leerEnv, clienteSheets, leerFilas, escribir, subirACloudinary } from './sheet.ts';
import { decidir, filaNueva, resumenPrecios, UMBRAL_SEGURO } from './procesar.ts';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATOS = path.join(RAIZ, 'datos');
const SESION = path.join(DATOS, 'sesion');
const ESTADO = path.join(DATOS, 'estado.json');
const SIMULAR = process.argv.includes('--simular');
const USAR_QR = process.argv.includes('--qr');

interface Config {
    telefono: string; grupos: string[]; desde: string;
    cloudinary: { cloudName: string; uploadPreset: string }; env: string;
    esperaSilencioSegundos: number; esperaMaximaSegundos: number;
}
// config.local.json (no se sube a GitHub) pisa a config.json: ahí va el número de teléfono
const leerJson = (f: string) => { try { return JSON.parse(fs.readFileSync(path.join(RAIZ, f), 'utf8')); } catch { return {}; } };
const config: Config = { ...leerJson('config.json'), ...leerJson('config.local.json') };
const logger = pino({ level: 'silent' });
const log = (...a: unknown[]) => console.log(...a);
const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N} ]/gu, '').toLowerCase().replace(/\s+/g, ' ').trim();
const esGrupoBuscado = (nombre: string) => config.grupos.some(g => fold(nombre).includes(fold(g)));

// ------------------------------------------------------------------ conexión
let ultimaActividad = Date.now();
const enEspera = new Map<string, any[]>(); // mensajes de grupos aún no identificados
const recibidosAhora = new Set<string>();

function registrar(estado: Estado, jid: string, waMsg: any) {
    const raw = JSON.stringify(waMsg, BufferJSON.replacer);
    const ev = aEvento(waMsg, raw);
    if (!ev) return;
    ultimaActividad = Date.now();
    if (ev.tipo === 'borrado') { if (estado.mensajes[ev.id]) estado.mensajes[ev.id].deleted = true; return; }
    if (ev.tipo === 'edicion') {
        const m = estado.mensajes[ev.id];
        if (!m) return;
        m.caption = ev.caption.trim();
        // si ya estaba en la web, volver a procesarlo (y a su álbum) para tomar el precio corregido
        for (const o of Object.values(estado.mensajes))
            if (o.id === m.id || (m.albumParent && o.albumParent === m.albumParent)) delete estado.procesados[o.id];
        return;
    }
    const prev = estado.mensajes[ev.msg.id];
    estado.mensajes[ev.msg.id] = { ...ev.msg, jid, fromMe: !!waMsg.key.fromMe, caption: prev?.caption ?? ev.msg.caption, deleted: prev?.deleted };
    recibidosAhora.add(ev.msg.id);
}

function recibir(estado: Estado, waMsgs: any[]) {
    for (const m of waMsgs) {
        const jid: string = m?.key?.remoteJid || '';
        if (!jid.endsWith('@g.us')) continue;
        if (estado.gruposVistos[jid] !== undefined) {
            if (esGrupoBuscado(estado.gruposVistos[jid])) registrar(estado, jid, m);
        } else {
            if (!enEspera.has(jid)) enEspera.set(jid, []);
            enEspera.get(jid)!.push(m);
            ultimaActividad = Date.now();
        }
    }
}

async function conectar(estado: Estado): Promise<WASocket> {
    const { state, saveCreds } = await useMultiFileAuthState(SESION);
    let version: [number, number, number] | undefined;
    try { version = (await fetchLatestBaileysVersion()).version as any; } catch { /* usa la de la librería */ }

    let intentos = 0;
    return new Promise((resolve, reject) => {
        const abrir = () => {
            const sock = makeWASocket({
                version, auth: state, logger,
                browser: Browsers.windows('Chrome'),
                markOnlineOnConnect: false,   // así tu celular sigue recibiendo las notificaciones
                syncFullHistory: false,
                shouldIgnoreJid: jid => !!jid && !jid.endsWith('@g.us') && !jid.endsWith('@s.whatsapp.net') && !jid.endsWith('@lid'),
                getMessage: async key => {
                    const m = key.id && estado.mensajes[key.id];
                    return m && m.raw ? JSON.parse(m.raw, BufferJSON.reviver).message : undefined;
                },
            });
            let codigoPedido = false;
            sock.ev.on('creds.update', saveCreds);
            sock.ev.on('messaging-history.set', ({ messages }) => recibir(estado, messages));
            sock.ev.on('messages.upsert', ({ messages }) => recibir(estado, messages));
            sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
                if (qr && !sock.authState.creds.registered) {
                    if (USAR_QR) {
                        log('\nEscaneá este QR desde WhatsApp > Dispositivos vinculados > Vincular un dispositivo:\n');
                        qrcode.generate(qr, { small: true });
                    } else if (!codigoPedido && !config.telefono) {
                        codigoPedido = true;
                        log('Falta tu número en bot-whatsapp/config.local.json, por ejemplo: { "telefono": "549XXXXXXXXXX" }  (o usá "--qr").');
                    } else if (!codigoPedido) {
                        codigoPedido = true;
                        try {
                            const codigo = await sock.requestPairingCode(config.telefono.replace(/\D/g, ''));
                            log('\n==============================================================');
                            log('  PRIMERA VEZ: vinculá este bot con tu WhatsApp');
                            log('  En el celular: WhatsApp > Dispositivos vinculados > Vincular un dispositivo');
                            log('  > "Vincular con el número de teléfono" e ingresá este código:');
                            log(`\n                  ${codigo.slice(0, 4)}-${codigo.slice(4)}\n`);
                            log('==============================================================\n');
                        } catch (e: any) { log('No se pudo pedir el código de vinculación:', e.message, '\nProbá con "--qr".'); }
                    }
                }
                if (connection === 'open') { ultimaActividad = Date.now(); resolve(sock); }
                if (connection === 'close') {
                    const code = (lastDisconnect?.error as any)?.output?.statusCode;
                    if (code === DisconnectReason.loggedOut) {
                        fs.rmSync(SESION, { recursive: true, force: true });
                        return reject(new Error('WhatsApp cerró la sesión del bot (se desvinculó). Volvé a apretar el botón para vincularlo de nuevo.'));
                    }
                    if (++intentos > 6) return reject(new Error(`No se pudo conectar a WhatsApp (código ${code ?? '?'}). Revisá internet y probá de nuevo.`));
                    setTimeout(abrir, code === DisconnectReason.restartRequired ? 500 : 3000);
                }
            });
        };
        abrir();
    });
}

const esperar = (ms: number) => new Promise(r => setTimeout(r, ms));
async function esperarSilencio(silencioMs: number, maxMs: number) {
    const inicio = Date.now();
    while (Date.now() - inicio < maxMs) {
        if (Date.now() - ultimaActividad > silencioMs) return;
        await esperar(1000);
    }
}

// ------------------------------------------------------------------ principal
async function main() {
    log(SIMULAR ? '>> MODO VISTA PREVIA: no se va a cambiar nada en la web\n' : '>> Actualizando la web desde el grupo de WhatsApp\n');
    const estado = cargarEstado(ESTADO);
    const primeraVez = !estado.ultimaCorrida;
    const desdeTs = Math.floor(new Date(config.desde + 'T00:00:00').getTime() / 1000);

    log('Conectando a WhatsApp...');
    const sock = await conectar(estado);
    log('Conectado. Buscando el grupo...');

    const grupos = await sock.groupFetchAllParticipating();
    for (const [jid, g] of Object.entries(grupos)) estado.gruposVistos[jid] = g.subject || '';
    const buscados = Object.entries(estado.gruposVistos).filter(([, n]) => esGrupoBuscado(n));
    if (!buscados.length) {
        log(`\nNo encontré ningún grupo que se llame como ${config.grupos.map(g => `"${g}"`).join(' o ')}.`);
        log('Grupos donde está este número:\n' + Object.values(estado.gruposVistos).map(n => '  - ' + n).join('\n'));
        log('\nCorregí "grupos" en bot-whatsapp/config.json.');
        sock.end(undefined); guardarEstado(ESTADO, estado); return;
    }
    log('Grupo: ' + buscados.map(([, n]) => n).join(', '));
    for (const [jid, msgs] of enEspera) if (esGrupoBuscado(estado.gruposVistos[jid] || '')) for (const m of msgs) registrar(estado, jid, m);
    enEspera.clear();

    log('Recibiendo mensajes...');
    await esperarSilencio(config.esperaSilencioSegundos * 1000, config.esperaMaximaSegundos * 1000);

    // completar huecos pidiéndole al celular mensajes más viejos del grupo
    for (const [jid] of buscados) {
        const objetivo = primeraVez ? desdeTs : Math.max(desdeTs, estado.ultimoMensajeTs ?? desdeTs);
        for (let ronda = 0; ronda < 12; ronda++) {
            const delGrupo = Object.values(estado.mensajes).filter(m => m.jid === jid);
            const base = (primeraVez ? delGrupo : delGrupo.filter(m => recibidosAhora.has(m.id))).sort((a, b) => a.ts - b.ts)[0];
            if (!base || base.ts <= objetivo) break;
            if (ronda === 0) log('Pidiendo al celular publicaciones anteriores...');
            const antes = Object.keys(estado.mensajes).length;
            try {
                await sock.fetchMessageHistory(50, { remoteJid: jid, id: base.id, fromMe: !!base.fromMe }, base.ts * 1000);
            } catch { break; }
            ultimaActividad = Date.now();
            await esperarSilencio(6000, 30000);
            if (Object.keys(estado.mensajes).length === antes) break; // el celular no tiene más
        }
    }

    const pendientes = Object.values(estado.mensajes).filter(m =>
        buscados.some(([jid]) => jid === m.jid) && !estado.procesados[m.id] && !m.deleted && m.ts >= desdeTs);
    log(`Mensajes nuevos del grupo: ${pendientes.length}`);

    const env = leerEnv(path.resolve(RAIZ, config.env));
    const cliente = clienteSheets(env);
    const filas = await leerFilas(cliente);
    const d = decidir(pendientes, filas);

    // -------- aplicar
    const fallidos = new Set<string>();
    const appends: string[][] = [];
    const agregados: string[] = [];
    if (!SIMULAR) {
        for (const [i, n] of d.nuevos.entries()) {
            const urls: string[] = [];
            log(`Subiendo fotos de "${n.producto.name}" (${n.fotos.length})...`);
            for (const id of n.fotos) {
                try {
                    const m = estado.mensajes[id];
                    if (!m?.raw) throw new Error('sin datos de la foto');
                    const waMsg = JSON.parse(m.raw, BufferJSON.reviver);
                    const buf = await downloadMediaMessage(waMsg, 'buffer', {}, { reuploadRequest: sock.updateMediaMessage, logger });
                    urls.push(await subirACloudinary(buf as Buffer, `wa-${id}.jpg`, config.cloudinary.cloudName, config.cloudinary.uploadPreset));
                } catch (e: any) { log(`   ! no se pudo bajar/subir una foto: ${e.message}`); }
            }
            if (!urls.length) { n.grupoIds.forEach(id => fallidos.add(id)); continue; }
            appends.push(filaNueva(n.producto, urls, i));
            agregados.push(n.producto.name);
        }
        if (d.actualizar.length || appends.length) {
            log('Escribiendo en el catálogo (Google Sheets)...');
            await escribir(cliente, d.actualizar.map(u => ({ rowNumber: u.fila.rowNumber, cells: u.cells })), appends);
        }
        const ahora = Date.now();
        for (const m of pendientes) if (!fallidos.has(m.id)) estado.procesados[m.id] = ahora;
        estado.ultimaCorrida = ahora;
        const tsGrupo = Object.values(estado.mensajes).filter(m => buscados.some(([j]) => j === m.jid)).map(m => m.ts);
        if (tsGrupo.length) estado.ultimoMensajeTs = Math.max(...tsGrupo);
    }
    guardarEstado(ESTADO, estado);
    sock.end(undefined);

    // -------- informe
    const L: string[] = [];
    L.push('==================== RESUMEN ====================');
    L.push(SIMULAR ? '(vista previa: NO se aplicó nada)' : `Fecha: ${new Date().toLocaleString('es-AR')}`);
    L.push(`Productos nuevos ${SIMULAR ? 'para agregar' : 'agregados'}: ${SIMULAR ? d.nuevos.length : agregados.length}`);
    for (const n of d.nuevos) L.push(`  + ${n.producto.name}  ${resumenPrecios(n.producto)}  [${n.fotos.length} fotos, ${n.producto.category}]${fallidos.has(n.grupoIds[0]) ? '  <- FALLÓ, se reintenta la próxima vez' : ''}`);
    L.push(`Ya estaban en la web (precio actualizado, sin duplicar): ${d.actualizar.length}`);
    for (const u of d.actualizar) L.push(`  = fila ${u.fila.rowNumber} "${u.fila.name}"  ->  ${resumenPrecios(u.producto)}`);
    if (d.revisar.length) {
        L.push(`Parecidos a uno existente pero no seguro (< ${UMBRAL_SEGURO * 100}%), NO se tocaron — revisalos en el admin:`);
        for (const r of d.revisar) L.push(`  ? "${r.producto.name}" se parece a fila ${r.fila.rowNumber} "${r.fila.name}" (${Math.round(r.score * 100)}%)`);
    }
    if (d.sinFoto.length) { L.push('Publicaciones sin foto (no se suben):'); d.sinFoto.forEach(p => L.push(`  ! ${p.name}`)); }
    if (d.duplicadosEnSheet.length) L.push(`Aviso: el catálogo ya tiene ${d.duplicadosEnSheet.length} fila(s) repetida(s); podés limpiarlas con el importador del admin.`);
    if (!d.nuevos.length && !d.actualizar.length) L.push('No había publicaciones nuevas. La web ya está al día.');
    L.push('=================================================');
    const informe = L.join('\n');
    log('\n' + informe);
    fs.mkdirSync(path.join(DATOS, 'informes'), { recursive: true });
    fs.writeFileSync(path.join(DATOS, 'informes', `${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}${SIMULAR ? '-vista-previa' : ''}.txt`), informe);
}

main().then(() => setTimeout(() => process.exit(0), 500)).catch(e => {
    console.error('\nERROR: ' + (e?.message || e));
    setTimeout(() => process.exit(1), 500);
});
