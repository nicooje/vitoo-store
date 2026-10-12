// Pruebas sin conexión: npx tsx test/probar.ts [ruta-a-chat-exportado.txt]
import fs from 'fs';
import assert from 'assert/strict';
import { aEvento, agrupar, aTextoExport, type Guardado } from '../src/convertir.ts';
import { decidir } from '../src/procesar.ts';
import { parseChatText, type SheetRow } from '../../vito-store/src/lib/whatsappChat.ts';

let ok = 0;
const prueba = (nombre: string, fn: () => void) => { fn(); ok++; console.log('✔ ' + nombre); };
const T0 = Math.floor(new Date('2026-10-12T12:13:00').getTime() / 1000);
const VITO = '111@lid';
const img = (id: string, ts: number, caption = '', extra: any = {}) => ({
    key: { id, remoteJid: 'g@g.us', participant: VITO }, messageTimestamp: ts,
    message: { imageMessage: { caption, mimetype: 'image/jpeg' }, ...extra },
});
const ev = (m: any) => { const e = aEvento(m); assert.ok(e && e.tipo === 'mensaje'); return e.msg; };
const CAP = '✨*Conjunto de algodón c/aro y push up*\nTalles 85 al 100\nPor menor:\n1x$7.000\nPor mayor:\n3x$19.500\n6x$36.000\nDocena $60.000';

prueba('interpreta una publicación como la de la captura', () => {
    const d = decidir([ev(img('A1', T0, CAP))], []);
    assert.equal(d.nuevos.length, 1);
    const p = d.nuevos[0].producto;
    assert.equal(p.name, 'Conjunto de algodón c/aro y push up');
    assert.deepEqual(p.priceSet, { 1: 7000, 3: 19500, 6: 36000, 12: 60000 });
    assert.equal(p.category, 'Conjuntos');
    assert.match(p.sizes, /85 al 100/);
    assert.deepEqual(d.nuevos[0].fotos, ['A1']);
});

prueba('álbum de WhatsApp (varias fotos, texto en una) = un solo producto', () => {
    const assoc = (i: number) => ({ messageContextInfo: { messageAssociation: { associationType: 1, parentMessageKey: { id: 'ALB' }, messageIndex: i } } });
    const msgs = [
        ev(img('F1', T0, CAP, assoc(0))), ev(img('F2', T0 + 1, '', assoc(1))), ev(img('F3', T0 + 1, '', assoc(2))),
    ];
    assert.equal(aEvento({ key: { id: 'ALB', remoteJid: 'g@g.us' }, messageTimestamp: T0, message: { albumMessage: { expectedImageCount: 3 } } }), null);
    const d = decidir(msgs, []);
    assert.equal(d.nuevos.length, 1);
    assert.deepEqual(d.nuevos[0].fotos.sort(), ['F1', 'F2', 'F3']);
});

prueba('fotos sueltas sin texto mandadas seguidas se suman al producto', () => {
    const msgs = [ev(img('S1', T0)), ev(img('S2', T0 + 5)), ev(img('S3', T0 + 9, CAP))];
    const d = decidir(msgs, []);
    assert.equal(d.nuevos.length, 1);
    assert.equal(d.nuevos[0].fotos.length, 3);
});

prueba('dos productos seguidos no se mezclan', () => {
    const cap2 = '✨*Conjunto de morley c/aro y push up*\nTalles 85 al 100\nPor menor:\n1x$7.000\nPor mayor:\n3x$19.500';
    const d = decidir([ev(img('P1', T0, cap2)), ev(img('P2', T0 + 20, CAP))], []);
    assert.equal(d.nuevos.length, 2);
    assert.deepEqual(d.nuevos.map(n => n.fotos.length), [1, 1]);
});

const fila = (rowNumber: number, name: string, price: string): SheetRow => ({
    rowNumber, id: String(rowNumber), name, category: 'Conjuntos', price, image_url: 'https://x/1.jpg',
    stock: 'SI', size: '', color: '', quantity: '10', desc: '',
});

prueba('si el producto ya está en la web, actualiza esa fila y NO lo agrega de nuevo', () => {
    const d = decidir([ev(img('R1', T0, CAP))], [fila(5, 'Conjunto de algodón c/aro y push up', '6500')]);
    assert.equal(d.nuevos.length, 0);
    assert.equal(d.actualizar.length, 1);
    assert.equal(d.actualizar[0].fila.rowNumber, 5);
    assert.equal(d.actualizar[0].cells[3], '7000');
    assert.equal(d.actualizar[0].cells[4], 'https://x/1.jpg'); // conserva sus fotos
});

prueba('la misma publicación repetida en el grupo da un solo producto', () => {
    const d = decidir([ev(img('D1', T0, CAP)), ev(img('D2', T0 + 86400, CAP))], []);
    assert.equal(d.nuevos.length, 1);
});

prueba('un producto solo se empareja con UNA fila (no pisa otras parecidas)', () => {
    const d = decidir([ev(img('U1', T0, CAP))], [
        fila(5, 'Conjunto de algodón c/aro y push up', '6500'),
        fila(9, 'Conjunto algodon con aro push up', '6800'),
    ]);
    assert.equal(d.actualizar.length + d.revisar.length + d.nuevos.length, 1);
});

prueba('edición y borrado de mensajes se reconocen', () => {
    const ed = aEvento({ key: { id: 'E9', remoteJid: 'g@g.us' }, messageTimestamp: T0, message: { protocolMessage: { type: 14, key: { id: 'A1' }, editedMessage: { imageMessage: { caption: 'nuevo' } } } } });
    assert.deepEqual(ed, { tipo: 'edicion', id: 'A1', caption: 'nuevo', ts: T0 });
    const br = aEvento({ key: { id: 'E8', remoteJid: 'g@g.us' }, messageTimestamp: T0, message: { protocolMessage: { type: 0, key: { id: 'A1' } } } });
    assert.deepEqual(br, { tipo: 'borrado', id: 'A1' });
    const efimero = aEvento({ key: { id: 'E7', remoteJid: 'g@g.us', participant: VITO }, messageTimestamp: T0, message: { ephemeralMessage: { message: { imageMessage: { caption: 'hola' } } } } });
    assert.ok(efimero && efimero.tipo === 'mensaje' && efimero.msg.kind === 'image' && efimero.msg.caption === 'hola');
});

prueba('la misma foto republicada se sube una sola vez', () => {
    const conSha = (id: string, ts: number, sha: string) => ev({ ...img(id, ts, CAP), message: { imageMessage: { caption: CAP, fileSha256: Buffer.from(sha) } } });
    const d = decidir([conSha('H1', T0, 'aaa'), conSha('H2', T0 + 86400, 'aaa'), conSha('H3', T0 + 86500, 'bbb')], []);
    assert.equal(d.nuevos.length, 1);
    assert.deepEqual(d.nuevos[0].fotos, ['H1', 'H3']);
});

prueba('mensajes borrados no se publican', () => {
    const m = ev(img('X1', T0, CAP)); m.deleted = true;
    assert.equal(decidir([m], []).nuevos.length, 0);
});

// ---- regresión contra un chat exportado real: el camino del bot debe dar lo mismo
const ruta = process.argv[2];
if (ruta && fs.existsSync(ruta)) {
    const txt = fs.readFileSync(ruta, 'utf8');
    const original = parseChatText(txt);
    const HEADER = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4}), (\d{1,2}):(\d{2}) - ([^:]+): ?([\s\S]*)$/;
    const msgs: { ts: number; sender: string; text: string }[] = [];
    for (const line of txt.replace(/^﻿/, '').split(/\r?\n/)) {
        const m = HEADER.exec(line);
        if (m) msgs.push({ ts: new Date(+('20' + m[3].slice(-2)), +m[2] - 1, +m[1], +m[4], +m[5]).getTime() / 1000, sender: m[6].replace(/^‎/, '').trim(), text: m[7].replace(/^‎/, '') });
        else if (msgs.length) msgs[msgs.length - 1].text += '\n' + line.replace(/^‎/, '');
    }
    // cada línea "IMG-... (archivo adjunto)" del export es un mensaje con foto en WhatsApp
    const guardados: Guardado[] = []; let n = 0;
    for (const m of msgs) {
        if (m.sender !== 'Vito Store') continue;
        const lines = m.text.split('\n').map(l => l.trim()).filter(Boolean);
        const imgs = lines.filter(l => /\.(jpe?g|png|webp)\s*\(archivo adjunto\)$/i.test(l));
        const cap = lines.filter(l => !/\(archivo adjunto\)$|Multimedia omitido/i.test(l)).join('\n');
        if (!imgs.length) { guardados.push({ id: 'T' + n++, ts: m.ts, from: 'v', kind: 'text', caption: cap }); continue; }
        imgs.forEach((_, i) => guardados.push({ id: 'M' + n++, ts: m.ts, from: 'v', kind: 'image', caption: i === imgs.length - 1 ? cap : '' }));
    }
    const viaBot = parseChatText(aTextoExport(agrupar(guardados)));
    const firma = (p: any) => `${p.name} | ${p.priceSet[1]} | ${p.priceSet[3] ?? ''} | ${p.priceSet[12] ?? ''}`;
    const a = new Set(original.filter(p => p.images.length).map(firma)), b = new Set(viaBot.filter(p => p.images.length).map(firma));
    const faltan = [...a].filter(x => !b.has(x)), sobran = [...b].filter(x => !a.has(x));
    const fotosA = original.reduce((s, p) => s + p.images.length, 0), fotosB = viaBot.reduce((s, p) => s + p.images.length, 0);
    console.log(`\nChat real: ${a.size} productos con foto (export) vs ${b.size} (bot). Fotos: ${fotosA} vs ${fotosB}`);
    if (faltan.length) console.log('  solo en export:\n   ' + faltan.join('\n   '));
    if (sobran.length) console.log('  solo en bot:\n   ' + sobran.join('\n   '));
    assert.ok(faltan.length <= Math.ceil(a.size * 0.03), 'el bot interpreta distinto demasiadas publicaciones');
    ok++; console.log('✔ regresión con el chat real');
}
console.log(`\n${ok} pruebas OK`);
