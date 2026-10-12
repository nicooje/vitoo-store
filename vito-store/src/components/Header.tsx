'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import SidebarMenu from './SidebarMenu';
import { IconBag, IconMenu, IconSearch, IconClose } from './icons';
import { NAV_CATEGORIES, categoryHref } from '@/lib/site';

const ANNOUNCEMENTS = [
    'Envíos a todo el país',
    'Precio por mayor desde 3 prendas',
    'Pagá con Mercado Pago o transferencia',
    'Nuevos ingresos todas las semanas',
];

export default function Header() {
    const cart = useCartStore((state) => state.cart);
    const [mounted, setMounted] = useState(false);
    const totalItems = mounted ? cart.reduce((acc, item) => acc + item.cantidad, 0) : 0;

    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [announce, setAnnounce] = useState(0);
    const router = useRouter();

    useEffect(() => { setMounted(true); }, []);
    useEffect(() => {
        const t = setInterval(() => setAnnounce((i) => (i + 1) % ANNOUNCEMENTS.length), 4000);
        return () => clearInterval(t);
    }, []);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/?search=${encodeURIComponent(searchQuery)}#catalogo`);
            setSearchOpen(false);
            setSearchQuery('');
        }
    };

    return (
        <>
            {/* Barra de anuncios: un mensaje a la vez */}
            <div className="bg-primary-dark text-white">
                <div className="relative h-9 max-w-[1400px] mx-auto overflow-hidden" aria-live="polite">
                    {ANNOUNCEMENTS.map((msg, i) => (
                        <p
                            key={msg}
                            className={`absolute inset-0 flex items-center justify-center eyebrow text-[10px] md:text-[11px] text-white/90 transition-all duration-500 ${i === announce ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                            aria-hidden={i !== announce}
                        >
                            {msg}
                        </p>
                    ))}
                </div>
            </div>

            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-line">
                <div className="max-w-[1400px] mx-auto px-3 md:px-8">
                    {/* Fila principal */}
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center h-16 md:h-20">
                        <div className="flex items-center gap-1 md:gap-5">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="flex items-center gap-2 min-h-[44px] min-w-[44px] justify-center md:justify-start text-ink hover:text-primary transition-colors"
                                aria-label="Abrir menú"
                            >
                                <IconMenu className="w-6 h-6" />
                                <span className="hidden md:inline eyebrow">Menú</span>
                            </button>
                            <button
                                onClick={() => setSearchOpen((v) => !v)}
                                className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-ink"
                                aria-label="Buscar"
                            >
                                {isSearchOpen ? <IconClose className="w-6 h-6" /> : <IconSearch className="w-6 h-6" />}
                            </button>
                        </div>

                        {/* Logo + marca */}
                        <Link href="/" className="flex items-center gap-2 md:gap-3" aria-label="Vitö Store, inicio">
                            <Image src="/vito-logo.png" alt="" width={44} height={44} priority className="rounded-full w-9 h-9 md:w-11 md:h-11" />
                            <span className="font-display text-[21px] sm:text-[26px] md:text-[30px] leading-none text-primary-dark tracking-tight">
                                Vitö <span className="italic text-primary">Store</span>
                            </span>
                        </Link>

                        <div className="flex items-center justify-end gap-2 md:gap-5">
                            {/* Buscador desktop siempre visible, como las tiendas grandes */}
                            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center gap-2 border-b border-ink/25 focus-within:border-primary transition-colors w-56 lg:w-64">
                                <IconSearch className="w-4 h-4 text-muted" />
                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Buscar conjunto, top..."
                                    className="w-full bg-transparent py-2 text-sm text-ink placeholder:text-muted focus:outline-none"
                                    aria-label="Buscar productos"
                                />
                            </form>
                            <Link
                                href="/checkout"
                                className="relative min-h-[44px] min-w-[44px] flex items-center justify-center text-ink hover:text-primary transition-colors"
                                aria-label={`Ir al carrito (${totalItems} productos)`}
                            >
                                <IconBag className="w-6 h-6" />
                                {totalItems > 0 && (
                                    <span className="absolute top-1.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-semibold flex items-center justify-center">
                                        {totalItems}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>

                    {/* Navegación por categorías (desktop) */}
                    <nav className="hidden md:flex justify-center gap-9 pb-4" aria-label="Categorías">
                        {NAV_CATEGORIES.map((c) => (
                            <Link key={c.cat} href={categoryHref(c.cat)} className="eyebrow text-[11.5px] text-ink/85 hover:text-primary link-underline transition-colors">
                                {c.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Buscador mobile */}
                    {isSearchOpen && (
                        <form onSubmit={handleSearchSubmit} className="md:hidden pb-3 animate-fade-in">
                            <div className="flex items-center gap-2 bg-sand px-3">
                                <IconSearch className="w-4 h-4 text-muted" />
                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Buscar conjuntos, tops..."
                                    className="w-full bg-transparent py-3 text-base text-ink placeholder:text-muted focus:outline-none min-h-[48px]"
                                    autoFocus
                                    aria-label="Buscar productos"
                                />
                            </div>
                        </form>
                    )}
                </div>
            </header>

            <SidebarMenu isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
        </>
    );
}
