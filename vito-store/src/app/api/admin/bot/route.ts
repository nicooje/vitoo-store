import { NextResponse } from 'next/server';
import { readBotState, requestBotRun } from '@/lib/botControl';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        return NextResponse.json(await readBotState());
    } catch (error: any) {
        console.error('GET /api/admin/bot', error);
        return NextResponse.json({ error: 'No se pudo leer el estado del bot' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const modo = body?.modo === 'simular' ? 'simular' : 'aplicar';
        const actual = await readBotState();
        if (actual.estado === 'en_curso') {
            return NextResponse.json({ error: 'Ya hay una actualización en curso' }, { status: 409 });
        }
        const id = await requestBotRun(modo);
        return NextResponse.json({ success: true, id });
    } catch (error: any) {
        console.error('POST /api/admin/bot', error);
        return NextResponse.json({ error: 'No se pudo pedir la actualización' }, { status: 500 });
    }
}
