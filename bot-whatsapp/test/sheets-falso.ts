// Google Sheets de mentira guardado en un JSON (solo para pruebas del agente)
import fs from 'fs';
type Hoja = Record<string, string[][]>;
const leer = (f: string): Hoja => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return {}; } };
const guardar = (f: string, h: Hoja) => fs.writeFileSync(f, JSON.stringify(h));
const rango = (r: string) => {
    const [tab, a1] = r.split('!');
    const m = /^([A-Z])(\d+)(?::([A-Z])(\d+))?$/.exec(a1)!;
    return { tab, c0: m[1].charCodeAt(0) - 65, r0: +m[2] - 1, c1: (m[3] || m[1]).charCodeAt(0) - 65, r1: +(m[4] || m[2]) - 1 };
};
function escribir(h: Hoja, r: string, values: string[][]) {
    const { tab, c0, r0 } = rango(r);
    const t = (h[tab] ||= []);
    values.forEach((fila, i) => fila.forEach((v, j) => { (t[r0 + i] ||= []); t[r0 + i][c0 + j] = String(v); }));
}
export function crear(archivo: string) {
    const sheets = {
        spreadsheets: {
            get: async () => ({ data: { sheets: Object.keys(leer(archivo)).map(title => ({ properties: { title } })) } }),
            batchUpdate: async ({ requestBody }: any) => { const h = leer(archivo); for (const q of requestBody.requests) h[q.addSheet.properties.title] ||= []; guardar(archivo, h); return {}; },
            values: {
                get: async ({ range }: any) => {
                    const { tab, c0, r0, c1, r1 } = rango(range); const t = leer(archivo)[tab] || [];
                    const values = []; for (let i = r0; i <= r1; i++) values.push((t[i] || []).slice(c0, c1 + 1));
                    return { data: { values } };
                },
                update: async ({ range, requestBody }: any) => { const h = leer(archivo); escribir(h, range, requestBody.values); guardar(archivo, h); return {}; },
                batchUpdate: async ({ requestBody }: any) => { const h = leer(archivo); for (const d of requestBody.data) escribir(h, d.range, d.values); guardar(archivo, h); return {}; },
            },
        },
    };
    return { sheets: sheets as any, sheetId: 'falso' };
}
