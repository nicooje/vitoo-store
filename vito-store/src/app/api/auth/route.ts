import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { password } = body;

        const correctPassword = process.env.ADMIN_PASSWORD || 'admin123';

        if (password === correctPassword) {
            const response = NextResponse.json({ success: true });
            
            // Set cookie for 30 days
            response.cookies.set({
                name: 'admin_token',
                value: 'authenticated', // A basic token since it's a simple setup
                httpOnly: true,
                path: '/',
                maxAge: 60 * 60 * 24 * 30, // 30 days
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
            });

            return response;
        }

        return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
