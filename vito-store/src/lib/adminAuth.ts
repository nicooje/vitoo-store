// Sesión del panel de administración.
// La cookie lleva "vencimiento.firma" (HMAC-SHA256): no se puede inventar sin conocer
// el secreto, que sale de ADMIN_SECRET o, si no está, de ADMIN_PASSWORD.
// Usa Web Crypto, así funciona igual en el middleware (Edge) y en las rutas (Node).

export const ADMIN_COOKIE = 'vito_admin';
export const SESSION_DAYS = 14;

const enc = new TextEncoder();

function secret(): string | null {
    const s = process.env.ADMIN_SECRET || (process.env.ADMIN_PASSWORD ? `vito-admin:${process.env.ADMIN_PASSWORD}` : '');
    return s ? s : null;
}

export const adminConfigured = () => Boolean(process.env.ADMIN_PASSWORD);

async function hmacHex(key: string, data: string): Promise<string> {
    const k = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', k, enc.encode(data));
    return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Comparación en tiempo constante (evita adivinar la firma midiendo tiempos). */
export function safeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let r = 0;
    for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return r === 0;
}

export async function createSessionToken(): Promise<string | null> {
    const s = secret();
    if (!s) return null;
    const exp = Date.now() + SESSION_DAYS * 864e5;
    return `${exp}.${await hmacHex(s, `admin|${exp}`)}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
    const s = secret();
    if (!s || !token) return false;
    const [expStr, sig] = token.split('.');
    const exp = Number(expStr);
    if (!exp || !sig || exp < Date.now()) return false;
    return safeEqual(sig, await hmacHex(s, `admin|${exp}`));
}

/** Compara la contraseña ingresada con ADMIN_PASSWORD sin filtrar su largo por tiempos. */
export async function checkPassword(input: string): Promise<boolean> {
    const real = process.env.ADMIN_PASSWORD;
    if (!real || typeof input !== 'string') return false;
    const [a, b] = await Promise.all([hmacHex('cmp', input), hmacHex('cmp', real)]);
    return safeEqual(a, b);
}
