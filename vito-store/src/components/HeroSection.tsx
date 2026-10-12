'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/googleSheets';
import { IconChevronLeft, IconChevronRight } from './icons';
import { categoryHref, formatPrice } from '@/lib/site';

interface HeroSectionProps {
    products?: Product[];
}

const firstImage = (p?: Product) => (p?.image_url || '').split(',')[0].trim();

export default function HeroSection({ products = [] }: HeroSectionProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const hasProducts = products.length > 0;

    useEffect(() => {
        if (!hasProducts || paused) return;
        const interval = setInterval(() => setCurrentIndex((i) => (i + 1) % products.length), 5500);
        return () => clearInterval(interval);
    }, [hasProducts, paused, products.length]);

    if (!hasProducts) {
        return <section className="bg-primary-light min-h-[60vh] animate-pulse" aria-hidden />;
    }

    const current = products[currentIndex];
    const go = (d: number) => setCurrentIndex((i) => (i + d + products.length) % products.length);
    const pad = (n: number) => String(n).padStart(2, '0');

    return (
        <section
            className="grid md:grid-cols-12 bg-primary-light"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            aria-roledescription="carrusel"
            aria-label="Destacados"
        >
            {/* Foto */}
            <div className="relative md:col-span-7 aspect-[4/5] md:aspect-auto md:h-[min(78vh,760px)] overflow-hidden bg-sand">
                {products.map((product, index) => (
                    <div
                        key={product.id}
                        className={`absolute inset-0 transition-opacity duration-700 ease-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                        aria-hidden={index !== currentIndex}
                    >
                        {firstImage(product) && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={firstImage(product)}
                                alt={product.name}
                                className={`w-full h-full object-cover ${index === currentIndex ? 'animate-ken-burns' : ''}`}
                                loading={index === 0 ? 'eager' : 'lazy'}
                            />
                        )}
                    </div>
                ))}

                <div className="absolute bottom-4 right-4 flex gap-2">
                    <button onClick={() => go(-1)} className="h-11 w-11 bg-white/90 hover:bg-white text-primary-dark flex items-center justify-center transition-colors" aria-label="Anterior">
                        <IconChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => go(1)} className="h-11 w-11 bg-white/90 hover:bg-white text-primary-dark flex items-center justify-center transition-colors" aria-label="Siguiente">
                        <IconChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Texto */}
            <div className="md:col-span-5 flex flex-col justify-center px-6 py-10 md:px-12 lg:px-16">
                <div className="flex items-center gap-4 mb-6 md:mb-10">
                    <span className="eyebrow text-primary">Nuevos ingresos</span>
                    <span className="h-px flex-1 bg-primary/25" />
                    <span className="eyebrow text-primary-dark tabular-nums">{pad(currentIndex + 1)} / {pad(products.length)}</span>
                </div>

                <div key={current.id} className="animate-slide-up">
                    <h1 className="font-display text-[34px] leading-[1.08] md:text-5xl lg:text-[56px] text-primary-dark first-letter:uppercase">
                        {current.name.replace(/^[^\p{L}\p{N}]+/u, '')}
                    </h1>
                    <p className="mt-5 text-2xl md:text-3xl font-light text-primary-dark tabular-nums">
                        {formatPrice(current.price)}
                    </p>
                    {current.price3 ? (
                        <p className="mt-1 text-sm text-accent font-medium">
                            Llevando 3 o más: {formatPrice(Math.round(Number(current.price3)))} c/u
                        </p>
                    ) : null}
                </div>

                <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3">
                    <Link href="/#catalogo" className="btn btn-primary">Ver catálogo</Link>
                    {current.category && (
                        <Link href={categoryHref(current.category)} className="btn btn-outline">
                            Más {current.category.replace('-', ' y ').toLowerCase()}
                        </Link>
                    )}
                </div>

                {/* Progreso */}
                <div className="mt-10 md:mt-14 flex gap-2" role="tablist">
                    {products.map((p, idx) => (
                        <button
                            key={p.id}
                            onClick={() => setCurrentIndex(idx)}
                            className="group flex-1 py-3"
                            role="tab"
                            aria-selected={idx === currentIndex}
                            aria-label={`Ver destacado ${idx + 1}`}
                        >
                            <span className={`block h-[2px] transition-colors duration-300 ${idx === currentIndex ? 'bg-primary-dark' : 'bg-primary/20 group-hover:bg-primary/40'}`} />
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
