import Link from 'next/link';
import { Product } from '@/lib/googleSheets';
import Reveal from './Reveal';
import { NAV_CATEGORIES, categoryHref } from '@/lib/site';

interface CategoryShowcaseProps {
    products: Product[];
}

const TAGLINES: Record<string, string> = {
    'Conjuntos': 'El favorito de todas',
    'Corpiños-Tops': 'Con aro, push up y deportivos',
    'Bombachas': 'Comodidad de todos los días',
    'Medias': 'Soquetes y pantimedias',
    'Invierno': 'Pijamas y térmicas',
    'Lubricantes y juegos': 'Para jugar de a dos',
    'Varios': 'Accesorios y más',
};

export default function CategoryShowcase({ products }: CategoryShowcaseProps) {
    const tiles = NAV_CATEGORIES.map((c) => {
        const inCat = products.filter((p) => p.category === c.cat && p.image_url);
        const img = inCat[0] ? inCat[0].image_url.split(',')[0].trim() : '';
        return { ...c, img, count: inCat.length };
    }).filter((t) => t.img);

    if (!tiles.length) return null;

    return (
        <section className="px-4 md:px-8 py-14 md:py-20" aria-labelledby="titulo-categorias">
            <div className="max-w-[1400px] mx-auto">
                <Reveal className="mb-7 md:mb-9 flex items-end justify-between gap-6">
                    <div>
                        <p className="eyebrow text-primary mb-2">Comprá por categoría</p>
                        <h2 id="titulo-categorias" className="font-display text-3xl md:text-[44px] leading-tight text-primary-dark">Elegí tu estilo</h2>
                    </div>
                    <Link href="/#catalogo" className="hidden md:inline eyebrow text-primary-dark link-underline shrink-0">Ver todo</Link>
                </Reveal>

                {/* Carril: desliza en el celu, grilla en compu */}
                <div className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:grid md:overflow-visible" style={{ gridTemplateColumns: `repeat(${tiles.length}, minmax(0, 1fr))` }}>
                    {tiles.map((tile) => (
                        <Link
                            key={tile.cat}
                            href={categoryHref(tile.cat)}
                            className="group snap-start shrink-0 w-[42vw] sm:w-[30vw] md:w-auto"
                        >
                            <div className="relative aspect-[3/4] overflow-hidden bg-sand">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={tile.img}
                                    alt=""
                                    loading="lazy"
                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                                />
                            </div>
                            <p className="mt-3 eyebrow text-[11.5px] text-primary-dark group-hover:text-primary transition-colors">{tile.label}</p>
                            <p className="mt-1 text-[13px] text-muted leading-snug">{TAGLINES[tile.cat] ?? `${tile.count} productos`}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
