'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IconArrowRight, IconClose, IconInstagram, IconPin, IconWhatsApp } from './icons';
import { ADDRESS, INSTAGRAM_URL, MAPS_URL, NAV_CATEGORIES, WHATSAPP_URL, categoryHref } from '@/lib/site';

interface SidebarMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SidebarMenu({ isOpen, onClose }: SidebarMenuProps) {
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-primary-dark/40 z-[60] animate-fade-in" onClick={onClose} />

            <aside
                className="fixed top-0 left-0 h-[100dvh] w-[86vw] max-w-[380px] bg-white z-[70] flex flex-col animate-slide-in-left"
                role="dialog"
                aria-modal="true"
                aria-label="Menú"
            >
                <div className="flex items-center justify-between px-6 h-16 border-b border-line">
                    <Link href="/" onClick={onClose} className="flex items-center gap-2.5">
                        <Image src="/vito-logo.png" alt="" width={34} height={34} className="rounded-full" />
                        <span className="font-display text-xl text-primary-dark">Vitö <span className="italic text-primary">Store</span></span>
                    </Link>
                    <button onClick={onClose} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-ink hover:text-primary" aria-label="Cerrar menú">
                        <IconClose className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-6 py-4" aria-label="Categorías">
                    <Link href="/#catalogo" onClick={onClose} className="group flex items-center justify-between py-4 border-b border-line">
                        <span className="font-display text-2xl text-primary-dark">Ver todo</span>
                        <IconArrowRight className="w-5 h-5 text-muted group-hover:text-primary group-hover:translate-x-1 transition-transform" />
                    </Link>
                    {NAV_CATEGORIES.map((c) => (
                        <Link key={c.cat} href={categoryHref(c.cat)} onClick={onClose} className="group flex items-center justify-between py-4 border-b border-line">
                            <span className="font-display text-2xl text-primary-dark">{c.label}</span>
                            <IconArrowRight className="w-5 h-5 text-muted group-hover:text-primary group-hover:translate-x-1 transition-transform" />
                        </Link>
                    ))}
                </nav>

                <div className="px-6 py-6 bg-primary-light/60 flex flex-col gap-1">
                    <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 min-h-[44px] text-sm text-ink hover:text-primary">
                        <IconWhatsApp className="w-4 h-4" /> Escribinos por WhatsApp
                    </a>
                    <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 min-h-[44px] text-sm text-ink hover:text-primary">
                        <IconInstagram className="w-4 h-4" /> @vitoo.store
                    </a>
                    <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 min-h-[44px] text-sm text-ink hover:text-primary">
                        <IconPin className="w-4 h-4" /> {ADDRESS}
                    </a>
                </div>
            </aside>
        </>
    );
}
