'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/lib/googleSheets';

interface HeroSectionProps {
    products?: Product[];
}

export default function HeroSection({ products = [] }: HeroSectionProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    const hasProducts = products.length > 0;

    useEffect(() => {
        if (!hasProducts || paused) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
        }, 4500);

        return () => clearInterval(interval);
    }, [hasProducts, paused, products.length]);

    if (!hasProducts) {
        return (
            <section className="px-3 md:px-6 pt-4 pb-10 bg-bg-light">
                <div className="max-w-[1400px] mx-auto rounded-[2rem] overflow-hidden bg-slate-200 min-h-[55vh] animate-pulse" />
            </section>
        );
    }

    const current = products[currentIndex];

    return (
        <section
            className="px-3 md:px-6 pt-4 pb-12 bg-bg-light"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div className="max-w-[1400px] mx-auto relative rounded-[2rem] overflow-hidden bg-primary-dark min-h-[68vh] md:min-h-[76vh] flex items-end shadow-2xl group">

                {/* Carrusel de imagenes con zoom cinematografico */}
                {products.map((product, index) => (
                    <div
                        key={product.id}
                        className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                        {product.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className={`w-full h-full object-cover object-center ${index === currentIndex ? 'animate-ken-burns' : ''}`}
                            />
                        ) : (
                            <div className="w-full h-full bg-slate-800" />
                        )}
                        {/* Velo editorial: mas intenso abajo-izquierda para el texto */}
                        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/90 via-primary-dark/25 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/40 to-transparent"></div>
                    </div>
                ))}

                {/* Contenido editorial */}
                <div className="relative z-20 w-full max-w-[1400px] px-7 md:px-14 pb-14 md:pb-20 pt-24 flex flex-col items-start text-left">

                    <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 rounded-full bg-white/10 text-white/90 text-[11px] font-bold tracking-[0.22em] uppercase border border-white/20 backdrop-blur-md">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent-light animate-pulse" />
                        Nueva colección
                    </span>

                    <p className="font-display italic text-xl md:text-2xl text-accent-light mb-2">
                        {current?.name}
                    </p>
                    <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] text-white mb-3 drop-shadow-lg max-w-3xl">
                        Lencería que<br />te hace brillar
                    </h1>
                    <p className="text-base md:text-lg text-white/80 font-light max-w-md mb-8">
                        Diseños exclusivos, talles reales y precios por combo.
                        Elegí lo tuyo y te lo llevamos a cualquier punto del país.
                    </p>

                    <div className="flex flex-wrap items-center gap-4">
                        <a
                            href="#catalogo"
                            className="inline-flex items-center justify-center gap-2 px-9 py-4 text-base font-bold text-primary-dark bg-white hover:bg-accent-light rounded-full transition-all hover:scale-[1.03] active:scale-95 shadow-xl min-h-[48px] premium-transition"
                        >
                            Ver catálogo
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </a>
                        <span className="text-white/85 text-sm font-semibold tracking-wide">
                            Desde ${Number(current?.price).toLocaleString('es-AR')}
                        </span>
                    </div>

                    {/* Indicadores */}
                    <div className="flex gap-2 mt-10">
                        {products.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-1.5 rounded-full transition-all duration-500 premium-transition ${idx === currentIndex ? 'w-10 bg-white' : 'w-4 bg-white/35 hover:bg-white/60'}`}
                                aria-label={`Ir a la diapositiva ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Flechas manuales */}
                <button
                    onClick={() => setCurrentIndex((prev) => (prev - 1 + products.length) % products.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/25 backdrop-blur-md text-white rounded-full"
                    aria-label="Anterior"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>

                <button
                    onClick={() => setCurrentIndex((prev) => (prev + 1) % products.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/25 backdrop-blur-md text-white rounded-full"
                    aria-label="Siguiente"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>

            </div>
        </section>
    );
}
