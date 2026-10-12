'use client';

import { usePathname } from 'next/navigation';
import { IconWhatsApp } from './icons';
import { WHATSAPP_URL } from '@/lib/site';

export default function FloatingWhatsApp() {
    const pathname = usePathname();
    // en el checkout y el admin ya hay botones propios; no tapar el botón de enviar pedido
    if (pathname?.startsWith('/checkout') || pathname?.startsWith('/admin')) return null;

    return (
        <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Escribinos por WhatsApp"
            className="fixed z-[55] right-4 bottom-20 md:right-8 md:bottom-8 h-14 w-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(37,211,102,0.35)] hover:scale-105 active:scale-95 transition-transform"
        >
            <IconWhatsApp className="w-7 h-7" />
        </a>
    );
}
