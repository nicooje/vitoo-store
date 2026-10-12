import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, SESSION_DAYS, adminConfigured, checkPassword, createSessionToken } from '@/lib/adminAuth';

// Freno a la fuerza bruta: intentos fallidos por IP (vive mientras la instancia esté activa)
const fallos = new Map<string, { n: number; hasta: number }>();
const MAX_INTENTOS = 5;
const BLOQUEO_MS = 10 * 60 * 1000;

const ipDe = (req: Request) => (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';
const esperar = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function POST(request: Request) {
    if (!adminConfigured()) {
        return NextResponse.json({
            error: 'El panel no tiene contraseña configurada. Cargá ADMIN_PASSWORD en las variables de entorno (Vercel y .env.local).',
        }, { status: 503 });
    }

    const ip = ipDe(request);
    const f = fallos.get(ip);
    if (f && f.n >= MAX_INTENTOS && f.hasta > Date.now()) {
        const min = Math.ceil((f.hasta - Date.now()) / 60000);
        return NextResponse.json({ error: `Demasiados intentos. Probá de nuevo en ${min} min.` }, { status: 429 });
    }

    let password = '';
    try { password = String((await request.json())?.password ?? ''); } catch { /* cuerpo inválido */ }

    if (!(await checkPassword(password))) {
        const n = (f && f.hasta > Date.now() ? f.n : 0) + 1;
        fallos.set(ip, { n, hasta: Date.now() + BLOQUEO_MS });
        await esperar(700);
        return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    fallos.delete(ip);
    const token = await createSessionToken();
    const response = NextResponse.json({ success: true });
    response.cookies.set({
        name: ADMIN_COOKIE,
        value: token!,
        httpOnly: true,
        path: '/',
        maxAge: SESSION_DAYS * 24 * 60 * 60,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
    });
    // borrar la cookie vieja (insegura) si quedó en el navegador
    response.cookies.set({ name: 'admin_token', value: '', path: '/', maxAge: 0 });
    return response;
}

// Cerrar sesión
export async function DELETE() {
    const response = NextResponse.json({ success: true });
    response.cookies.set({ name: ADMIN_COOKIE, value: '', path: '/', maxAge: 0 });
    return response;
}
