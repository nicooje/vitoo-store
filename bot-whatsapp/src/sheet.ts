// Lectura/escritura del Google Sheet del catálogo (mismas columnas A..N que la web).
import fs from 'fs';
import { google } from 'googleapis';
import type { SheetRow } from '../../vito-store/src/lib/whatsappChat.ts';

export function leerEnv(archivo: string): Record<string, string> {
    const env: Record<string, string> = {};
    for (const line of fs.readFileSync(archivo, 'utf8').split(/\r?\n/)) {
        const m = line.match(/^\s*([A-Z_]+)\s*=\s*"([\s\S]*)"\s*$|^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
        if (m) env[m[1] || m[3]] = (m[2] || m[4] || '').trim();
    }
    return env;
}

export function clienteSheets(env: Record<string, string>) {
    if (!env.SHEET_ID || !env.CLIENT_EMAIL || !env.PRIVATE_KEY)
        throw new Error('Faltan SHEET_ID / CLIENT_EMAIL / PRIVATE_KEY en vito-store/.env.local');
    const auth = new google.auth.GoogleAuth({
        credentials: { client_email: env.CLIENT_EMAIL, private_key: env.PRIVATE_KEY.replace(/\\n/g, '\n') },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return { sheets: google.sheets({ version: 'v4', auth }), sheetId: env.SHEET_ID };
}

type Cliente = ReturnType<typeof clienteSheets>;

export async function leerFilas({ sheets, sheetId }: Cliente): Promise<SheetRow[]> {
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'A2:N' });
    return (res.data.values || []).map((r, i) => ({
        rowNumber: i + 2, id: r[0] || '', name: r[1] || '', category: r[2] || '', price: r[3] || '',
        image_url: r[4] || '', stock: r[5] || '', size: r[6] || '', color: r[7] || '',
        quantity: r[8] || '', p3: r[9], p6: r[10], p9: r[11], p12: r[12], desc: r[13] || '',
    }));
}

const a14 = (cells: string[]) => { const r = [...cells]; while (r.length < 14) r.push(''); return r.slice(0, 14); };

export async function escribir({ sheets, sheetId }: Cliente, updates: { rowNumber: number; cells: string[] }[], appends: string[][]) {
    if (updates.length) {
        await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: sheetId,
            requestBody: {
                valueInputOption: 'USER_ENTERED',
                data: updates.map(u => ({ range: `A${u.rowNumber}:N${u.rowNumber}`, values: [a14(u.cells)] })),
            },
        });
    }
    if (appends.length) {
        // values.append ancla mal en esta hoja: escribir tras la última fila con datos reales
        const tail = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'A2:N' });
        let lastRow = 1;
        (tail.data.values || []).forEach((r, i) => { if (r.some(c => String(c ?? '').trim() !== '')) lastRow = i + 2; });
        const start = lastRow + 1;
        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `A${start}:N${start + appends.length - 1}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: appends.map(a14) },
        });
    }
}

export async function subirACloudinary(buf: Buffer, nombre: string, cloud: string, preset: string): Promise<string> {
    const form = new FormData();
    form.append('file', new Blob([new Uint8Array(buf)], { type: 'image/jpeg' }), nombre);
    form.append('upload_preset', preset);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: 'POST', body: form });
    const data: any = await res.json().catch(() => ({}));
    if (!data.secure_url) throw new Error(`Cloudinary rechazó ${nombre}: ${data.error?.message || res.status}`);
    return data.secure_url;
}
