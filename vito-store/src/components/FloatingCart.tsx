'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { IconArrowRight, IconBag } from './icons';
import { formatPrice } from '@/lib/site';

export default function FloatingCart() {
    const [mounted, setMounted] = useState(false);
    const cart = useCartStore((state) => state.cart);
    const getTotal = useCartStore((state) => state.getTotal);

    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return null;

    const totalItems = cart.reduce((total, item) => total + item.cantidad, 0);
    if (totalItems === 0) return null;

    return (
        <Link
            href="/checkout"
            className="fixed z-50 bottom-0 inset-x-0 md:inset-x-auto md:bottom-8 md:left-8 flex items-center gap-4 bg-primary-dark text-white px-5 md:px-6 h-16 md:h-14 shadow-[0_10px_30px_rgba(42,12,92,0.25)] animate-slide-up hover:bg-primary transition-colors"
            aria-label={`Ver carrito: ${totalItems} productos, total ${formatPrice(getTotal())}`}
        >
            <span className="relative">
                <IconBag className="w-6 h-6" />
                <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-white text-primary-dark text-[10px] font-semibold flex items-center justify-center">{totalItems}</span>
            </span>
            <span className="flex-1 md:flex-none eyebrow text-[11px]">Ver carrito</span>
            <span className="font-semibold tabular-nums">{formatPrice(getTotal())}</span>
            <IconArrowRight className="w-4 h-4" />
        </Link>
    );
}
