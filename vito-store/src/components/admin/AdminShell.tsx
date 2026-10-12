'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

export type Seccion = 'resumen' | 'pedidos' | 'productos' | 'whatsapp';

const icon = (d: ReactNode) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden>{d}</svg>
);
const ITEMS: { id: Seccion; label: string; icon: ReactNode }[] = [
    { id: 'resumen', label: 'Resumen', icon: icon(<><path d="M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-3H4zM14 7h6V4h-6z" /></>) },
    { id: 'pedidos', label: 'Pedidos', icon: icon(<><path d="M6 7h12l1 14H5L6 7Z" /><path d="M9 7V6a3 3 0 0 1 6 0v1" /></>) },
    { id: 'productos', label: 'Productos', icon: icon(<><path d="M3 12V4h8l10 10-8 8L3 12Z" /><circle cx="7.5" cy="8.5" r="1.3" /></>) },
    { id: 'whatsapp', label: 'WhatsApp', icon: icon(<><path d="M4 5h16v11H9l-5 4V5Z" /><path d="M8 10h8M8 13h5" /></>) },
];

export default function AdminShell({ seccion, onSeccion, badges, onLogout, children }: {
    seccion: Seccion;
    onSeccion: (s: Seccion) => void;
    badges: Partial<Record<Seccion, ReactNode>>;
    onLogout: () => void;
    children: ReactNode;
}) {
    return (
        <div className="min-h-screen bg-bg-light">
            {/* Barra lateral (compu) */}
            <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col bg-white border-r border-line z-40">
                <Link href="/" className="flex items-center gap-3 px-6 h-20 border-b border-line" title="Ver la tienda">
                    <Image src="/vito-logo.png" alt="" width={40} height={40} className="rounded-full" />
                    <span>
                        <span className="block font-display text-xl text-primary-dark leading-none">Vitö <span className="italic text-primary">Store</span></span>
                        <span className="block eyebrow text-[9px] text-muted mt-1">Administración</span>
                    </span>
                </Link>
                <nav className="flex-1 py-4" aria-label="Secciones">
                    {ITEMS.map((it) => (
                        <button
                            key={it.id}
                            onClick={() => onSeccion(it.id)}
                            aria-current={seccion === it.id ? 'page' : undefined}
                            className={`w-full flex items-center gap-3 px-6 h-12 text-[15px] transition-colors border-l-2 ${seccion === it.id ? 'border-primary-dark bg-primary-light/60 text-primary-dark font-medium' : 'border-transparent text-ink/75 hover:bg-bg-light hover:text-primary-dark'}`}
                        >
                            {it.icon}
                            <span className="flex-1 text-left">{it.label}</span>
                            {badges[it.id]}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-line flex flex-col gap-1">
                    <Link href="/" target="_blank" className="flex items-center gap-3 px-2 h-11 text-sm text-ink/75 hover:text-primary-dark">
                        {icon(<><path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6" /></>)} Ver la tienda
                    </Link>
                    <button onClick={onLogout} className="flex items-center gap-3 px-2 h-11 text-sm text-ink/75 hover:text-primary-dark">
                        {icon(<><path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" /></>)} Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* Barra superior (celu) */}
            <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-line">
                <div className="flex items-center justify-between px-4 h-14">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/vito-logo.png" alt="" width={32} height={32} className="rounded-full" />
                        <span className="font-display text-lg text-primary-dark">Vitö <span className="italic text-primary">Store</span></span>
                        <span className="eyebrow text-[9px] text-muted ml-1">Admin</span>
                    </Link>
                    <button onClick={onLogout} className="eyebrow text-[10px] text-ink/70 min-h-[44px] px-2">Salir</button>
                </div>
            </header>

            <main className="lg:pl-64 pb-24 lg:pb-12">
                <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-10">{children}</div>
            </main>

            {/* Navegación inferior (celu) */}
            <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-line grid grid-cols-4" aria-label="Secciones">
                {ITEMS.map((it) => (
                    <button
                        key={it.id}
                        onClick={() => onSeccion(it.id)}
                        aria-current={seccion === it.id ? 'page' : undefined}
                        className={`relative flex flex-col items-center justify-center gap-1 h-16 ${seccion === it.id ? 'text-primary-dark' : 'text-muted'}`}
                    >
                        {it.icon}
                        <span className="text-[10.5px] tracking-wide">{it.label}</span>
                        {badges[it.id] && <span className="absolute top-2 left-1/2 ml-2">{badges[it.id]}</span>}
                        {seccion === it.id && <span className="absolute top-0 inset-x-6 h-[2px] bg-primary-dark" />}
                    </button>
                ))}
            </nav>
        </div>
    );
}
