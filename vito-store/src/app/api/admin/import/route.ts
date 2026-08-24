import { NextResponse } from 'next/server';
import { getGoogleSheetsClient } from '@/lib/googleSheets';

interface UpdateRow {
    rowNumber: number;
    cells: string[]; // 14 columnas A..N ya resueltas por el cliente
}
interface AppendRow {
    cells: string[];
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const updates: UpdateRow[] = Array.isArray(body.updates) ? body.updates : [];
        const clears: number[] = Array.isArray(body.clears) ? body.clears : [];
        const appends: AppendRow[] = Array.isArray(body.appends) ? body.appends : [];

        if (!updates.length && !clears.length && !appends.length) {
            return NextResponse.json({ error: 'Nada para aplicar' }, { status: 400 });
        }

        // Validacion basica de coordenadas
        const validRow = (n: unknown) => typeof n === 'number' && Number.isInteger(n) && n >= 2 && n <= 10000;
        for (const u of updates) {
            if (!validRow(u.rowNumber) || !Array.isArray(u.cells) || u.cells.length > 14) {
                return NextResponse.json({ error: `Fila invalida en updates (${u.rowNumber})` }, { status: 400 });
            }
        }
        for (const c of clears) {
            if (!validRow(c)) return NextResponse.json({ error: `Fila invalida en clears (${c})` }, { status: 400 });
        }

        const { sheets, sheetId } = await getGoogleSheetsClient();
        const EMPTY14 = ['', '', '', '', '', '', '', '', '', '', '', '', '', ''];

        const data: { range: string; values: string[][] }[] = [];
        for (const u of updates) {
            const row = [...u.cells];
            while (row.length < 14) row.push('');
            data.push({ range: `A${u.rowNumber}:N${u.rowNumber}`, values: [row.slice(0, 14)] });
        }
        for (const r of clears) {
            data.push({ range: `A${r}:N${r}`, values: [EMPTY14] });
        }
        if (data.length) {
            await sheets.spreadsheets.values.batchUpdate({
                spreadsheetId: sheetId,
                requestBody: { valueInputOption: 'USER_ENTERED', data },
            });
        }

        let appendedCount = 0;
        if (appends.length) {
            // values.append ancla mal en esta hoja (escribe desde la col N); usar update con
            // coordenadas absolutas: primera fila libre tras el ultimo dato real de A..N
            const tail = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'A2:N' });
            let lastRow = 1;
            (tail.data.values || []).forEach((r, i) => {
                if (r.some(c => String(c ?? '').trim() !== '')) lastRow = i + 2;
            });
            const start = lastRow + 1;
            const values = appends.map(a => {
                const row = [...(Array.isArray(a.cells) ? a.cells : [])];
                while (row.length < 14) row.push('');
                return row.slice(0, 14);
            });
            await sheets.spreadsheets.values.update({
                spreadsheetId: sheetId,
                range: `A${start}:N${start + values.length - 1}`,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values },
            });
            appendedCount = values.length;
        }

        return NextResponse.json({
            success: true,
            updated: updates.length,
            cleared: clears.length,
            appended: appendedCount,
        });
    } catch (error: any) {
        console.error('Error POST /api/admin/import:', error);
        return NextResponse.json({ error: error.message || 'Error aplicando la importacion' }, { status: 500 });
    }
}
