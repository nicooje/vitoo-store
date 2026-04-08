"use client";

import { Product } from '@/lib/googleSheets';
import { useCartStore } from '@/store/cartStore';
import HoverSlideshow from './HoverSlideshow';
import { useState } from 'react';
import toast from 'react-hot-toast';

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
            categoria: String(product.category)
        }, size, color);

        toast.success(`🛒 ${product.name} sumado a tu cesta.`);
        setActiveProduct(null);
        setSelectedSize('');
        setSelectedColor('');
    };

    const openOptionsModal = (product: Product) => {
        const hasSizes = product.size?.includes(',');
        const hasColors = product.color?.includes(',');

        if (hasSizes || hasColors) {
            setActiveProduct(product);
            setSelectedSize(hasSizes ? '' : (product.size || ''));
            setSelectedColor(hasColors ? '' : (product.color || ''));
        } else {
            handleAddToCart(product, product.size, product.color);
        }
    };

    if (!products || products.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem', fontSize: '1.2rem', color: 'var(--foreground)', gridColumn: '1 / -1' }}>
                No hay productos en esta categoría por el momento.
            </div>
        );
    }

    return (
        <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-12 md:gap-x-4 max-w-7xl mx-auto w-full">
            {products.slice(0, visibleCount).map((product) => {
                const stockAtexto = String(product.stock).toUpperCase();
                const hasStock = product.stock === true || stockAtexto === "SI" || stockAtexto === "TRUE";

                return (
                    <div key={product.id} className="group flex flex-col relative w-full">
                        {/* Imagen con Badges y Quick Buy - Aspecto 3:4 */}
                        <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-50 rounded-sm">
                            <HoverSlideshow imageUrls={product.image_url} productName={product.name} />
                            
                            {/* Badge flotante Arriba a la Izquierda */}
                            {!hasStock && (
                                <div className="absolute top-2 left-2 bg-pink-600 text-white px-3 py-1 text-[10px] md:text-xs font-bold rounded-2xl uppercase tracking-wider shadow-sm z-10">
                                    Agotado
                                </div>
                            )}

                            {/* Botón Quick Buy Flotante (Desktop Hover) */}
                            {hasStock && (
                                <button
                                    onClick={(e) => { e.preventDefault(); openOptionsModal(product); }}
                                    className="hidden md:flex absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 backdrop-blur border border-pink-100 hover:bg-pink-600 hover:text-white hover:border-pink-600 text-pink-600 rounded-full w-12 h-12 shadow-lg items-center justify-center z-20"
                                    title="Agregar al carrito"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Bloque Inferior - Minimalista */}
                        <div className="flex flex-col mt-4 px-1">
                            {/* Título en texto negro puro */}
                            <h3 className="text-sm md:text-[15px] text-gray-900 font-normal leading-tight group-hover:underline decoration-pink-300 underline-offset-4">
                                {product.name}
                            </h3>
                            
                            {/* Variantes (Talle / Color) */}
                            {(product.size || product.color) && (
                                <div className="flex flex-wrap items-center gap-1.5 mt-1.5 mb-2 h-[20px]">
                                    {product.size && (
                                        <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-sm">
                                            {product.size}
                                        </span>
                                    )}
                                    {product.color && (
                                        <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-sm">
                                            {product.color}
                                        </span>
                                    )}
                                </div>
                            )}
                            
                            {/* Precio fuerte */}
                            <div className="mt-1 flex flex-col">
                                <span className="text-[17px] font-bold text-gray-900">
                                    ${Number(product.price).toLocaleString('es-AR')}
                                </span>
                                {product.price3 && (
                                    <span className="text-[11px] font-bold text-pink-600 bg-pink-50 inline-block px-1.5 py-0.5 rounded mt-0.5 w-max">
                                        Combo 3+: ${Number(product.price3).toLocaleString('es-AR')}
                                    </span>
                                )}
                                {!product.price3 && (
                                    <span className="text-[11px] text-slate-500 mt-0.5">3 cuotas sin interés</span>
                                )}
                            </div>

                            {/* Botón Carrito en Mobile: ocupa todo el ancho, visible solo en pantallas xs */}
                            <button
                                onClick={(e) => { e.preventDefault(); openOptionsModal(product); }}
                                disabled={!hasStock}
                                className={`md:hidden mt-3 w-full py-2.5 rounded-full font-bold text-xs shadow-sm transition-colors ${
                                    hasStock 
                                    ? 'bg-pink-50 text-pink-700 border flex items-center justify-center gap-2 border-pink-200' 
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                {hasStock ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                                        </svg>
                                        Comprar
                                    </>
                                ) : 'Agotado'}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
        
        {visibleCount < products.length && (
            <div className="mt-12 flex justify-center w-full col-span-full">
                <button 
                    onClick={() => setVisibleCount(prev => prev + 12)}
                    className="bg-white border-2 border-pink-100 text-pink-600 font-bold px-8 py-3 rounded-full hover:bg-pink-50 hover:border-pink-200 transition-all active:scale-95 shadow-sm"
                >
                    Cargar más productos
                </button>
            </div>
        )}

        {/* Modal Selección de Talles y Colores */}
        {activeProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setActiveProduct(null)}>
                <div 
                    className="bg-white rounded-2xl p-6 w-full max-w-sm relative shadow-2xl animate-in fade-in zoom-in duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button 
                        onClick={() => setActiveProduct(null)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                    >
                        ✕
                    </button>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-1 pr-6">{activeProduct.name}</h3>
                    <p className="text-pink-600 font-bold text-lg mb-6">${Number(activeProduct.price).toLocaleString('es-AR')}</p>

                    <div className="flex flex-col gap-5">
                        {activeProduct.size && activeProduct.size.includes(',') && (
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-700">Seleccioná un Talle:</label>
                                <div className="flex flex-wrap gap-2">
                                    {activeProduct.size.split(',').map((s) => (
                                        <button 
                                            key={s.trim()}
                                            onClick={() => setSelectedSize(s.trim())}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                                                selectedSize === s.trim() 
                                                ? 'border-pink-500 bg-pink-50 text-pink-700' 
                                                : 'border-gray-200 text-gray-700 hover:border-pink-300'
                                            }`}
                                        >
                                            {s.trim()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeProduct.color && activeProduct.color.includes(',') && (
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-700">Seleccioná el Color:</label>
                                <div className="flex flex-wrap gap-2">
                                    {activeProduct.color.split(',').map((c) => (
                                        <button 
                                            key={c.trim()}
                                            onClick={() => setSelectedColor(c.trim())}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                                                selectedColor === c.trim() 
                                                ? 'border-pink-500 bg-pink-50 text-pink-700' 
                                                : 'border-gray-200 text-gray-700 hover:border-pink-300'
                                            }`}
                                        >
                                            {c.trim()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button 
                            onClick={() => handleAddToCart(activeProduct, selectedSize, selectedColor)}
                            disabled={
                                (activeProduct.size?.includes(',') && !selectedSize) || 
                                (activeProduct.color?.includes(',') && !selectedColor)
                            }
                            className="w-full mt-4 py-3.5 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-300 text-white font-bold rounded-xl shadow-md transition-all disabled:shadow-none"
                        >
                            Agregar al carrito
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}