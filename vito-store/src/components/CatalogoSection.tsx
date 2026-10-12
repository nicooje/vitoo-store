"use client";

import { Product } from '@/lib/googleSheets';
import { useCartStore } from '@/store/cartStore';
import HoverSlideshow from './HoverSlideshow';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { IconBag, IconClose, IconPlus } from './icons';
import { formatPrice } from '@/lib/site';

const NUEVO_DIAS = 21;
// los productos cargados por el bot/importador tienen como id la fecha de carga (ms)
const esNuevo = (id: number) => id > 1e12 && Date.now() - id < NUEVO_DIAS * 864e5;
const firstImage = (p: Product) => (p.image_url || '').split(',')[0].trim();

export default function CatalogoSection({ products }: { products: Product[] }) {
    const addToCart = useCartStore((state) => state.addToCart);
    const [visibleCount, setVisibleCount] = useState(12);

    // Modal state
    const [activeProduct, setActiveProduct] = useState<Product | null>(null);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');

    const handleAddToCart = (product: Product, size?: string, color?: string) => {
        addToCart({
            id: String(product.id || product.name),
            nombre: String(product.name),
            precio: Number(product.price) || 0,
            price3: product.price3 ? Number(product.price3) : undefined,
            price6: product.price6 ? Number(product.price6) : undefined,
            price9: product.price9 ? Number(product.price9) : undefined,
            price12: product.price12 ? Number(product.price12) : undefined,
            imagenUrl: String(product.image_url),
            categoria: String(product.category),
            size: product.size,
            color: product.color
        }, size, color);

        toast.success(`${product.name} se sumó a tu carrito`);
        setActiveProduct(null);
        setSelectedSize('');
        setSelectedColor('');
    };

    const openOptionsModal = (product: Product) => {
        const requiresSize = Boolean(product.size && product.size.trim() !== '');
        const parseVariants = (str?: string) => str ? str.split(/[,/|-]+/).map(s => s.trim()).filter(Boolean) : [];
        const isBombacha = product.name.toLowerCase().includes('bombi') || product.category.toLowerCase().includes('bombi');
        const sheetColors = parseVariants(product.color);
        const colorsList = sheetColors.length > 0 ? sheetColors : ['Blanco', 'Negro', 'Gris', 'Rosa', 'Fucsia', 'Rojo', 'Bordó', 'Azul', 'Celeste', 'Verde', 'Amarillo', 'Beige', 'Marrón', 'Lila', 'Surtido', 'Único'];
        const hasColors = !isBombacha;

        if (requiresSize || hasColors) {
            setActiveProduct(product);
            setSelectedSize('');
            setSelectedColor(hasColors ? '' : 'Surtido');
        } else {
            handleAddToCart(product, product.size, 'Surtido');
        }
    };


    // cerrar la ficha con Escape
    useEffect(() => {
        if (!activeProduct) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setActiveProduct(null); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [activeProduct]);

    if (!products || products.length === 0) {
        return (
            <div className="text-center py-24 border-t border-line">
                <p className="font-display text-3xl text-primary-dark mb-3">No encontramos nada acá</p>
                <p className="text-sm text-muted">Probá con otra categoría o buscá por otro nombre.</p>
            </div>
        );
    }

    const shown = Math.min(visibleCount, products.length);

    return (
        <>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 md:gap-x-5 gap-y-10 md:gap-y-14 w-full">
            {products.slice(0, visibleCount).map((product) => {
                const stockAtexto = String(product.stock).toUpperCase();
                const hasStock = product.stock === true || stockAtexto === "SI" || stockAtexto === "TRUE";
                const nuevo = esNuevo(Number(product.id));
                const combo = product.price3 && Number(product.price3) < Number(product.price) ? Math.round(Number(product.price3)) : 0;

                return (
                    <article key={product.id} className="group flex flex-col w-full">
                        <div className="relative aspect-[3/4] w-full overflow-hidden bg-sand">
                            <div className={`absolute inset-0 transition-transform duration-500 ease-out md:group-hover:scale-[1.03] ${!hasStock ? 'opacity-60' : ''}`}>
                                <HoverSlideshow imageUrls={product.image_url} productName={product.name} />
                            </div>

                            {/* Etiqueta */}
                            {!hasStock ? (
                                <span className="absolute top-2.5 left-2.5 bg-ink text-white eyebrow text-[9.5px] px-2.5 py-1.5 z-10">Agotado</span>
                            ) : nuevo ? (
                                <span className="absolute top-2.5 left-2.5 bg-white text-primary-dark eyebrow text-[9.5px] px-2.5 py-1.5 z-10">Nuevo</span>
                            ) : null}

                            {hasStock && (
                                <>
                                    {/* Compu: barra "agregar" que aparece al pasar el mouse */}
                                    <button
                                        onClick={(e) => { e.preventDefault(); openOptionsModal(product); }}
                                        className="hidden md:flex absolute inset-x-3 bottom-3 z-20 btn btn-light translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 shadow-[0_6px_24px_rgba(42,12,92,0.12)]"
                                    >
                                        <IconPlus className="w-4 h-4" /> Agregar
                                    </button>
                                    {/* Celu: botón chico siempre visible */}
                                    <button
                                        onClick={(e) => { e.preventDefault(); openOptionsModal(product); }}
                                        className="md:hidden absolute bottom-2 right-2 z-20 h-11 w-11 bg-white text-primary-dark flex items-center justify-center active:scale-95 transition-transform"
                                        aria-label={`Agregar ${product.name} al carrito`}
                                    >
                                        <IconBag className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="flex flex-col mt-3 md:mt-4">
                            <h3 className="text-[13px] md:text-[15px] text-ink leading-snug line-clamp-2 first-letter:uppercase">
                                {product.name.replace(/^[^\p{L}\p{N}]+/u, '')}
                            </h3>
                            {product.size && (
                                <p className="text-[11px] md:text-xs text-muted mt-1 line-clamp-1">Talles {product.size.replace(/^talles?\s*/i, '')}</p>
                            )}
                            <p className="mt-2 text-[15px] md:text-base font-semibold text-primary-dark tabular-nums">
                                {formatPrice(product.price)}
                            </p>
                            {combo ? (
                                <p className="text-[11px] md:text-xs text-accent mt-0.5">Llevando 3 o más: {formatPrice(combo)} c/u</p>
                            ) : null}
                        </div>
                    </article>
                );
            })}
        </div>

        {visibleCount < products.length && (
            <div className="mt-16 flex flex-col items-center gap-4">
                <p className="text-sm text-muted tabular-nums">Viendo {shown} de {products.length} productos</p>
                <div className="w-48 h-[2px] bg-line">
                    <div className="h-full bg-primary-dark transition-all duration-500" style={{ width: `${(shown / products.length) * 100}%` }} />
                </div>
                <button onClick={() => setVisibleCount(prev => prev + 12)} className="btn btn-outline mt-2">
                    Ver más productos
                </button>
            </div>
        )}

        {/* Ficha rápida: talle y confirmación (hoja inferior en celu, ventana en compu) */}
        {activeProduct && (
            <div className="fixed inset-0 z-[80] flex items-end md:items-center justify-center md:p-4 bg-primary-dark/40 animate-fade-in" onClick={() => setActiveProduct(null)}>
                <div
                    className="bg-white w-full md:max-w-[560px] max-h-[90dvh] overflow-y-auto relative animate-slide-up"
                    onClick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="ficha-titulo"
                >
                    <button
                        onClick={() => setActiveProduct(null)}
                        className="absolute top-2 right-2 z-10 h-11 w-11 flex items-center justify-center text-ink hover:text-primary bg-white/80"
                        aria-label="Cerrar"
                    >
                        <IconClose className="w-5 h-5" />
                    </button>

                    <div className="grid grid-cols-[110px_1fr] md:grid-cols-[180px_1fr]">
                        <div className="relative aspect-[3/4] bg-sand">
                            {firstImage(activeProduct) && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={firstImage(activeProduct)} alt="" className="absolute inset-0 w-full h-full object-cover" />
                            )}
                        </div>
                        <div className="p-5 md:p-6 pr-12 flex flex-col justify-center">
                            <p className="eyebrow text-[10px] text-primary mb-2">{activeProduct.category.replace('-', ' y ')}</p>
                            <h3 id="ficha-titulo" className="font-display text-xl md:text-2xl leading-snug text-primary-dark first-letter:uppercase">
                                {activeProduct.name.replace(/^[^\p{L}\p{N}]+/u, '')}
                            </h3>
                            <p className="mt-3 text-lg font-semibold text-primary-dark tabular-nums">{formatPrice(activeProduct.price)}</p>
                        </div>
                    </div>

                    {(() => {
                        const requiresSize = Boolean(activeProduct.size && activeProduct.size.trim() !== '');
                        return (
                            <div className="p-5 md:p-6 flex flex-col gap-5 border-t border-line">
                                {activeProduct.description && (
                                    <p className="text-sm text-ink/80 whitespace-pre-wrap leading-relaxed">{activeProduct.description}</p>
                                )}

                                <p className="text-[13px] leading-relaxed text-primary-dark bg-primary-light px-4 py-3">
                                    <b className="font-semibold">Colores surtidos.</b> Cuando confirmes el pedido por WhatsApp nos decís qué color querés y te confirmamos si hay.
                                </p>

                                {requiresSize && (
                                    <label className="flex flex-col gap-2">
                                        <span className="eyebrow text-[10.5px] text-ink">Tu talle <span className="normal-case tracking-normal text-muted">(disponibles: {activeProduct.size})</span></span>
                                        <input
                                            type="text"
                                            value={selectedSize}
                                            onChange={(e) => setSelectedSize(e.target.value)}
                                            placeholder="Ej: 90, M, 38..."
                                            className="w-full px-0 py-3 border-0 border-b border-ink/30 focus:border-primary outline-none bg-transparent text-base text-ink placeholder:text-muted min-h-[48px] transition-colors"
                                            autoFocus
                                        />
                                    </label>
                                )}

                                <button
                                    onClick={() => handleAddToCart(activeProduct, selectedSize, "Surtidos")}
                                    disabled={(requiresSize && !selectedSize.trim())}
                                    className="btn btn-primary w-full"
                                >
                                    Agregar al carrito
                                </button>
                            </div>
                        );
                    })()}
                </div>
            </div>
        )}
        </>
    );
}
