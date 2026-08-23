import Link from 'next/link';
import { Product } from '@/lib/googleSheets';
import Reveal from './Reveal';

interface CategoryShowcaseProps {
    products: Product[];
}

const COLLECTIONS = [
    { cat: 'Conjuntos', label: 'Conjuntos', tagline: 'El favorito de todas' },
    { cat: 'Bombachas', label: 'Bombachas', tagline: 'Comodidad diaria' },
    { cat: 'Corpiños-Tops', label: 'Corpiños y Tops', tagline: 'Para brillar' },
    { cat: 'Invierno', label: 'Invierno', tagline: 'Calidez que enamora' },
];

export default function CategoryShowcase({ products }: CategoryShowcaseProps) {
    const tiles = COLLECTIONS.map((c) => {
        const first = products.find((p) => p.category === c.cat && p.image_url);
        const img = first ? first.image_url.split(',')[0].trim() : '';
        return { ...c, img };
    }).filter((t) => t.img);

    if (!tiles.length) return null;

    return (
        <section className="bg-bg-light px-3 md:px-6 pb-20 pt-2">
            <div className="max-w-[1400px] mx-auto">
                <Reveal className="text-center mb-10">
                    <p className="font-display italic text-primary text-lg mb-1">Colecciones</p>
                    <h2 className="font-display text-4xl md:text-5xl text-primary-dark">Elegí tu estilo</h2>
                </Reveal>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
                    {tiles.map((tile, i) => (
                        <Reveal key={tile.cat} delay={i * 90}>
                            <Link
                                href={`/?category=${encodeURIComponent(tile.cat)}`}
                                className="group relative block overflow-hidden rounded-[1.4rem] aspect-[3/4] premium-shadow"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={tile.img}
                                    alt={tile.label}
                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/85 via-primary-dark/15 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
                                    <p className="font-display text-xl md:text-2xl text-white leading-tight">{tile.label}</p>
                                    <p className="text-white/75 text-xs md:text-sm mt-0.5">{tile.tagline}</p>
                                    <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.18em] uppercase text-accent-light translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                        Ver más →
                                    </span>
                                </div>
                            </Link>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
