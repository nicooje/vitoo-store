'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import SidebarMenu from './SidebarMenu';

export default function Header() {
    const cart = useCartStore((state) => state.cart);
    const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);
    
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/?search=${encodeURIComponent(searchQuery)}`);
            setSearchOpen(false);
            setSearchQuery('');
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-primary-dark/95 backdrop-blur-xl border-b border-white/10 px-6 md:px-12 py-5 md:py-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] premium-transition">
            <div className="max-w-7xl mx-auto grid grid-cols-3 items-center">
                
                {/* Lado izquierdo - Menú hamburguesa y Búsqueda */}
                <div className="flex justify-start items-center gap-6">
                    <button 
                        onClick={() => setSidebarOpen(true)}
                        className="text-white hover:text-accent-light transition-colors duration-300 p-2 -ml-2 rounded-full hover:bg-white/5 active:scale-95 touch-target min-h-[48px] min-w-[48px] flex items-center justify-center"
                        aria-label="Abrir menú"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5M3.75 15h16.5" />
                        </svg>
                    </button>
                    
                    {/* Búsqueda interactiva (Desktop y emergente) */}
                    <div className="hidden md:flex items-center relative">
                        <button 
                            onClick={() => setSearchOpen(!isSearchOpen)}
                            className="text-slate-300 hover:text-white p-2 rounded-full hover:bg-white/5 transition-all duration-300"
                            aria-label="Buscar productos"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                        </button>
                        
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isSearchOpen ? 'w-56 ml-2 opacity-100' : 'w-0 opacity-0'}`}>
                            <form onSubmit={handleSearchSubmit}>
                                <input 
                                    type="text" 
                                    placeholder="Buscar conjunto, body..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full text-sm border-b border-white/30 bg-transparent py-1 px-2 focus:outline-none focus:border-accent text-white placeholder-slate-400 premium-transition"
                                    autoFocus={isSearchOpen}
                                />
                            </form>
                        </div>
                    </div>
                </div>

                {/* Centro - Logo e Identidad */}
                <div className="flex justify-center">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-accent/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <Image 
                                src="/vito-logo.png" 
                                alt="Vito Store Logo" 
                                width={46} 
                                height={46} 
                                className="relative rounded-full shadow-md group-hover:scale-105 group-hover:shadow-lg transition-all duration-500 border border-white/20" 
                            />
                        </div>
                        <span className="hidden md:block text-2xl font-black text-white tracking-widest group-hover:text-accent-light transition-all duration-500 uppercase">Vitö</span>
                    </Link>
                </div>

                {/* Lado derecho - Carrito con Badge Numérico en Azul */}
                <div className="flex justify-end items-center gap-4">
                    {/* Búsqueda en mobile (solo botón) */}
                    <button 
                         onClick={() => setSearchOpen(!isSearchOpen)}
                         className="md:hidden text-white hover:text-accent-light p-2 rounded-full hover:bg-white/5 active:scale-95 min-h-[48px] min-w-[48px] flex items-center justify-center"
                         aria-label="Buscar"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                         </svg>
                    </button>

                    <Link 
                        href="/checkout" 
                        className="relative text-white hover:text-accent-light transition-all duration-300 p-2 rounded-full hover:bg-white/5 group min-h-[48px] min-w-[48px] flex items-center justify-center"
                        aria-label="Ir al carrito"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6.5 h-6.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                        </svg>
                        {totalItems > 0 && (
                            <span className="absolute top-0.5 right-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent border-2 border-primary-dark text-[10px] font-black text-white shadow-md group-hover:scale-110 group-hover:-translate-y-0.5 premium-transition px-1">
                                {totalItems}
                            </span>
                        )}
                    </Link>
                </div>

            </div>

            {/* Barra de búsqueda expandida para Mobile */}
            {isSearchOpen && (
                <div className="md:hidden mt-4 animate-fade-in-down">
                    <form onSubmit={handleSearchSubmit} className="relative">
                        <input 
                            type="text" 
                            placeholder="Buscar conjuntos, bikinis..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-xl py-3.5 px-4 text-sm text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent min-h-[48px]"
                            autoFocus
                        />
                        <button type="submit" className="absolute right-4 top-3 text-accent-light hover:text-white font-extrabold text-sm min-h-[30px]">
                            Buscar
                        </button>
                    </form>
                </div>
            )}

            {/* Componente del Menú Lateral */}
            <SidebarMenu isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
        </header>
    );
}
