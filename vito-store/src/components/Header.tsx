'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';

export default function Header() {
    const cart = useCartStore((state) => state.cart);
    const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 md:px-8 py-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="max-w-7xl mx-auto grid grid-cols-3 items-center">
                
                {/* Lado izquierdo - Menú hamburguesa y Búsqueda */}
                <div className="flex justify-start items-center gap-4">
                    <button className="text-slate-800 hover:text-pink-600 transition-colors p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                        </svg>
                    </button>
                    {/* Búsqueda discreta tipo Habiba sólo desktop */}
                    <div className="hidden md:flex items-center gap-2 text-slate-400 cursor-text group">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:text-pink-600 transition-colors">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                        <span className="text-sm font-medium border-b border-transparent group-hover:border-pink-200 transition-all">Buscar...</span>
                    </div>
                </div>

                {/* Centro - Logo ancla */}
                <div className="flex justify-center">
                    <Link href="/" className="flex items-center gap-2 group">
                        <Image src="/vito-logo.png" alt="Vito Store Logo" width={44} height={44} className="rounded-full shadow-sm group-hover:scale-105 transition-transform" />
                        <span className="hidden md:block text-2xl font-black text-slate-900 tracking-tight">Vitö</span>
                    </Link>
                </div>

                {/* Lado derecho - Carrito con Badge Numérico */}
                <div className="flex justify-end items-center">
                    <Link href="/checkout" className="relative text-slate-800 hover:text-pink-600 transition-colors p-1 group">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-7 h-7">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                        </svg>
                        {totalItems > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-600 border-2 border-white text-[10px] font-bold text-white group-hover:scale-110 transition-transform">
                                {totalItems}
                            </span>
                        )}
                    </Link>
                </div>

            </div>
        </header>
    );
}
