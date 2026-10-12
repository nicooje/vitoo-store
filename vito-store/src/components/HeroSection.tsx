'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/googleSheets';
import { IconArrowRight, IconChevronLeft, IconChevronRight } from './icons';
import { formatPrice } from '@/lib/site';

interface HeroSectionProps {
    products?: Product[];
}

const imgs = (p: Product) => (p.image_url || '').split(',').map(s => s.trim()).filter(Boolean);
// Cloudinary entrega la foto ya optimizada al tamaño de la tarjeta (más nítida y liviana)
const optim = (url: string, w = 640) => url.includes('res.cloudinary.com') && url.includes('/upload/')
    ? url.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${w}/`) : url;
const limpio = (s: string) => s.replace(/^[^\p{L}\p{N}]+/u, '');

/** Vidriera "Recién llegados": tira de prendas que avanza sola, con flechas y deslizable en el celu. */
export default function HeroSection({ products = [] }: HeroSectionProps) {
    const track = useRef<HTMLDivElement>(null);
    const [pausa, setPausa] = useState(false);
    const [progreso, setProgreso] = useState(0);
    const [enInicio, setEnInicio] = useState(true);

    const paso = useCallback(() => {
        const el = track.current;
        const card = el?.querySelector<HTMLElement>('[data-card]');
        return card ? card.offsetWidth + parseFloat(getComputedStyle(el!).columnGap || '0') : 300;
    }, []);

    const mover = useCallback((dir: 1 | -1) => {
        const el = track.current;
        if (!el) return;
        const fin = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
        if (dir === 1 && fin) el.scrollTo({ left: 0, behavior: 'smooth' });
        else el.scrollBy({ left: dir * paso(), behavior: 'smooth' });
    }, [paso]);

    // avanza solo cada 4,5 s (no si la persona está mirando, ni con "reducir movimiento")
    useEffect(() => {
        if (pausa || products.length < 2) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const t = setInterval(() => mover(1), 4500);
        return () => clearInterval(t);
    }, [pausa, mover, products.length]);

    const onScroll = () => {
        const el = track.current;
        if (!el) return;
        const max = el.scrollWidth - el.clientWidth;
        setProgreso(max > 0 ? el.scrollLeft / max : 0);
        setEnInicio(el.scrollLeft < 8);
    };

    if (!products.length) {
        return <section className="bg-primary-light h-[420px] animate-pulse" aria-hidden />;
    }

    return (
        <section
            className="bg-primary-light overflow-hidden"
            aria-roledescription="carrusel"
            aria-label="Recién llegados"
            onMouseEnter={() => setPausa(true)}
            onMouseLeave={() => setPausa(false)}
            onTouchStart={() => setPausa(true)}
            onFocusCapture={() => setPausa(true)}
        >
            <div className="max-w-[1400px] mx-auto pl-4 md:pl-8 py-10 md:py-14 lg:py-16 grid lg:grid-cols-[300px_1fr] gap-7 lg:gap-10 items-stretch">
                {/* Presentación */}
                <div className="pr-4 md:pr-8 lg:pr-0 flex flex-col justify-between gap-6">
                    <div>
                        <p className="eyebrow text-primary mb-3">Recién llegados</p>
                        <h1 className="font-display text-[38px] leading-[1.05] md:text-5xl lg:text-[54px] text-primary-dark">
                            Lo nuevo <span className="italic text-primary">de la semana</span>
                        </h1>
                        <p className="mt-4 text-[15px] text-ink/75 leading-relaxed max-w-sm">
                            Conjuntos, tops y bombachas que van llegando al local. Llevando 3 o más, pagás precio por mayor.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/#catalogo" className="btn btn-primary">Ver todo</Link>
                        <div className="hidden lg:flex gap-2 ml-auto">
                            <button onClick={() => mover(-1)} disabled={enInicio} className="h-12 w-12 border border-primary-dark/25 text-primary-dark hover:bg-primary-dark hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-primary-dark flex items-center justify-center transition-colors" aria-label="Anterior">
                                <IconChevronLeft className="w-5 h-5" />
                            </button>
                            <button onClick={() => mover(1)} className="h-12 w-12 border border-primary-dark/25 text-primary-dark hover:bg-primary-dark hover:text-white flex items-center justify-center transition-colors" aria-label="Siguiente">
                                <IconChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tira de prendas */}
                <div className="min-w-0">
                    <div
                        ref={track}
                        onScroll={onScroll}
                        className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth pr-4 md:pr-8"
                    >
                        {products.map((p, i) => {
                            const [a, b] = imgs(p);
                            const nombre = limpio(p.name);
                            return (
                                <Link
                                    key={p.id}
                                    data-card
                                    href={`/?search=${encodeURIComponent(nombre)}#catalogo`}
                                    className="group snap-start shrink-0 w-[68vw] sm:w-[40vw] md:w-[30vw] lg:w-[min(23vw,300px)]"
                                    aria-label={`${nombre}, ${formatPrice(p.price)}`}
                                >
                                    <div className="relative aspect-[3/4] bg-sand overflow-hidden">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={optim(a)}
                                            alt={nombre}
                                            loading={i < 4 ? 'eager' : 'lazy'}
                                            className={`absolute inset-0 w-full h-full object-cover transition-[opacity,transform] duration-500 ease-out ${b ? 'md:group-hover:opacity-0' : 'md:group-hover:scale-[1.03]'}`}
                                        />
                                        {b && (
                                            // segunda foto al pasar el mouse, como en las tiendas grandes
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={optim(b)} alt="" loading="lazy" aria-hidden
                                                className="absolute inset-0 w-full h-full object-cover opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 ease-out" />
                                        )}
                                    </div>
                                    <div className="mt-3 flex items-start justify-between gap-3">
                                        <h2 className="text-[14px] md:text-[15px] text-ink leading-snug line-clamp-2 first-letter:uppercase group-hover:text-primary transition-colors">{nombre}</h2>
                                        <IconArrowRight className="w-4 h-4 shrink-0 mt-0.5 text-primary-dark opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                    </div>
                                    <p className="mt-1 text-[15px] font-semibold text-primary-dark tabular-nums">{formatPrice(p.price)}</p>
                                    {p.price3 && Number(p.price3) < Number(p.price) ? (
                                        <p className="text-xs text-accent mt-0.5">3 o más: {formatPrice(Math.round(Number(p.price3)))} c/u</p>
                                    ) : null}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Progreso de la tira */}
                    <div className="mt-6 mr-4 md:mr-8 h-[2px] bg-primary/15 relative" aria-hidden>
                        <div className="absolute inset-y-0 left-0 bg-primary-dark transition-[width] duration-300" style={{ width: `${Math.max(12, progreso * 100)}%` }} />
                    </div>
                </div>
            </div>
        </section>
    );
}
