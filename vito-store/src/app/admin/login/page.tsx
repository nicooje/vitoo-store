'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminLogin() {
    const [password, setPassword] = useState('');
    const [ver, setVer] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return setError('Ingresá la contraseña');
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            if (res.ok) {
                const next = new URLSearchParams(window.location.search).get('next');
                window.location.href = next && next.startsWith('/admin') ? next : '/admin';
                return;
            }
            const data = await res.json().catch(() => ({}));
            setError(data.error || 'No se pudo ingresar');
            setPassword('');
        } catch {
            setError('Error de conexión. Probá de nuevo.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-bg-light">
            {/* Lado de marca */}
            <div className="hidden lg:flex relative bg-primary-dark text-white flex-col justify-between p-12 overflow-hidden">
                <span className="font-display italic text-[320px] leading-none text-white/[0.05] absolute -right-10 -bottom-20 select-none" aria-hidden>Vitö</span>
                <Link href="/" className="flex items-center gap-3 relative">
                    <Image src="/vito-logo.png" alt="" width={44} height={44} className="rounded-full" />
                    <span className="font-display text-2xl">Vitö <span className="italic">Store</span></span>
                </Link>
                <div className="relative max-w-md">
                    <p className="eyebrow text-white/70 mb-4">Panel de administración</p>
                    <p className="font-display text-5xl leading-[1.1]">Tu tienda, tus pedidos y tu catálogo en un solo lugar.</p>
                </div>
                <p className="relative text-sm text-white/60">Pedidos, stock, productos y el grupo de WhatsApp.</p>
            </div>

            {/* Formulario */}
            <div className="flex items-center justify-center px-6 py-16">
                <form onSubmit={handleSubmit} className="w-full max-w-sm" noValidate>
                    <Link href="/" className="lg:hidden flex items-center justify-center gap-3 mb-10">
                        <Image src="/vito-logo.png" alt="" width={44} height={44} className="rounded-full" />
                        <span className="font-display text-2xl text-primary-dark">Vitö <span className="italic text-primary">Store</span></span>
                    </Link>
                    <p className="eyebrow text-primary mb-2">Administración</p>
                    <h1 className="font-display text-4xl text-primary-dark mb-8">Ingresar</h1>

                    <label className="block">
                        <span className="eyebrow text-[10.5px] text-ink">Contraseña</span>
                        <span className="flex items-center border-b border-ink/30 focus-within:border-primary transition-colors">
                            <input
                                type={ver ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                className="flex-1 bg-transparent py-3 text-base text-ink outline-none min-h-[48px]"
                                autoComplete="current-password"
                                autoFocus
                                disabled={loading}
                                aria-invalid={Boolean(error)}
                                aria-describedby={error ? 'login-error' : undefined}
                            />
                            <button type="button" onClick={() => setVer(!ver)} className="eyebrow text-[9.5px] text-muted hover:text-primary px-1 min-h-[44px]">
                                {ver ? 'Ocultar' : 'Ver'}
                            </button>
                        </span>
                    </label>
                    {error && <p id="login-error" role="alert" className="mt-3 text-sm text-[#8a1f1f]">{error}</p>}

                    <button type="submit" disabled={loading} className="btn btn-primary w-full mt-8">
                        {loading ? 'Verificando...' : 'Entrar al panel'}
                    </button>
                    <Link href="/" className="block text-center mt-6 text-sm text-muted hover:text-primary">Volver a la tienda</Link>
                </form>
            </div>
        </div>
    );
}
