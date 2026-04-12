'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/lib/googleSheets';

interface HeroSectionProps {
    products?: Product[];
}

export default function HeroSection({ products = [] }: HeroSectionProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Si no hay productos (por estar cargando o error), mostramos algo genérico
    const hasProducts = products.length > 0;

    useEffect(() => {
        if (!hasProducts) return;
        
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
        }, 3500); // Cambia cada 3.5 segundos

        return () => clearInterval(interval);
    }, [hasProducts, products.length]);

    if (!hasProducts) {
        return (
            <section className="px-5 lg:px-8 pt-8 pb-12 bg-white">
                <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden bg-slate-100 min-h-[50vh] flex flex-col items-center justify-center text-center shadow-sm">
                   <div className="animate-pulse w-full h-full bg-slate-200"></div>
                </div>
            </section>
        );
    }

    return (
        <section className="px-4 lg:px-8 pt-6 pb-12 bg-white">
            <div className="max-w-7xl mx-auto relative rounded-3xl overflow-hidden bg-slate-900 min-h-[60vh] md:min-h-[70vh] flex shadow-xl group">
                
                {/* Carrusel de Imágenes */}
                {products.map((product, index) => (
                    <div 
                        key={product.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                        {product.image_url ? (
                            <img 
                                src={product.image_url} 
                                alt={product.name} 
                                className="w-full h-full object-cover object-center"
                            />
                        ) : (
                            <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                                <span className="text-slate-400">Sin Imagen</span>
                            </div>
                        )}
                        
                        {/* Overlay Oscuro para asegurar lectura del texto */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent"></div>
                    </div>
                ))}

                {/* Contenido Dinámico sobre el Carrusel */}
                <div className="relative z-20 w-full flex flex-col justify-end items-center text-center px-6 py-16 md:py-20 mt-auto">
                    
                    {/* Información del Producto Actual */}
                    <div className="transition-all duration-500 transform translate-y-0 opacity-100">
                        <span className="inline-block px-3 py-1 mb-4 rounded-full bg-pink-600/20 text-pink-300 text-xs font-bold tracking-widest uppercase border border-pink-500/30 backdrop-blur-md">
                            Tendencia
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2 text-shadow-sm drop-shadow-md">
                            {products[currentIndex]?.name}
                        </h2>
                        <p className="text-xl md:text-2xl text-pink-400 font-bold mb-8 drop-shadow-md">
                            ${Number(products[currentIndex]?.price).toLocaleString('es-AR')}
                        </p>
                    </div>
                    
                    {/* CTA */}
                    <a 
                        href="#catalogo" 
                        className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-pink-600 hover:bg-pink-500 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-pink-600/30"
                    >
                        Ver Catálogo Completo
                    </a>
                    
                    {/* Indicadores (Dots) */}
                    <div className="flex gap-2 mt-8">
                        {products.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-pink-500' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                                aria-label={`Ir a la diapositiva ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Botones Manuales Izquierda/Derecha (visibles en hover o mobile) */}
                <button 
                    onClick={() => setCurrentIndex((prev) => (prev - 1 + products.length) % products.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>

                <button 
                    onClick={() => setCurrentIndex((prev) => (prev + 1) % products.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>

            </div>
        </section>
    );
}
