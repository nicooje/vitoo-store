'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link'; // Importamos el componente de enlaces de Next.js

export default function FloatingCart() {
    const [mounted, setMounted] = useState(false);
    const cart = useCartStore((state) => state.cart);
    const getTotal = useCartStore((state) => state.getTotal);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const totalItems = cart.reduce((total, item) => total + item.cantidad, 0);

    if (totalItems === 0) return null;

    return (
        <div className="fixed bottom-24 right-5 sm:right-8 z-50">
            {/* Envolvemos el botón en un Link que lleva a /checkout */}
            <Link href="/checkout" className="group flex items-center gap-3 bg-pink-600 text-white px-6 py-4 rounded-full shadow-2xl hover:shadow-pink-600/50 hover:-translate-y-1 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <div className="flex flex-col items-start leading-none gap-0.5">
                    <span className="text-xs font-medium text-pink-100">Mi Carrito</span>
                    <span className="text-sm border-pink-400 font-bold whitespace-nowrap">
                        {totalItems} ítems
                    </span>
                </div>
            </Link>
        </div>
    );
}