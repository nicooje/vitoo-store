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
            categoria: String(product.category),
            size: product.size,
            color: product.color
        }, size, color);

        toast.success(`🛒 ${product.name} sumado a tu cesta.`);
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

    if (!products || products.length === 0) {
        return (
            <div className="text-center py-16 text-lg text-slate-500 font-medium col-span-full">
                No hay productos en esta categoría por el momento.
            </div>
        );
    }

    return (
        <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12 max-w-7xl mx-auto w-full px-2">
            {products.slice(0, visibleCount).map((product) => {
                const stockAtexto = String(product.stock).toUpperCase();
                const hasStock = product.stock === true || stockAtexto === "SI" || stockAtexto === "TRUE";

                return (
                    <div key={product.id} className="group flex flex-col relative w-full premium-transition">
                        
                        {/* Imagen con Badges y Quick Buy - Aspecto Estricto 3:4 */}
                        <div className="relative aspect-[3/4] w-full overflow-hidden bg-white rounded-xl border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.02)] group-hover:shadow-[0_12px_24px_rgba(92,36,179,0.06)] group-hover:-translate-y-1 transition-all duration-300 z-10">
                            <HoverSlideshow imageUrls={product.image_url} productName={product.name} />
                            
                            {/* Badge flotante Arriba a la Izquierda */}
                            {!hasStock && (
                                <div className="absolute top-3 left-3 bg-slate-800/90 text-white px-3 py-1.5 text-[9px] md:text-xs font-bold rounded-lg uppercase tracking-wider shadow-sm z-10 backdrop-blur-sm">
                                    Agotado
                                </div>
                            )}

                            {/* Botón Quick Buy Flotante (Desktop Hover) en Azul interactivo */}
                            {hasStock && (
                                <button
                                    onClick={(e) => { e.preventDefault(); openOptionsModal(product); }}
                                    className="hidden md:flex absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 bg-white border border-slate-100 hover:bg-accent hover:text-white hover:border-transparent text-accent rounded-full w-12 h-12 shadow-[0_8px_20px_rgba(0,0,0,0.08)] items-center justify-center z-20 hover:scale-110 active:scale-95"
                                    title="Agregar al carrito"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Bloque Inferior - Minimalista */}
                        <div className="flex flex-col mt-4 px-1">
                            
                            {/* Título en gris neutro suave (#374151) y regular */}
                            <h3 className="text-xs md:text-sm text-[#374151] font-normal leading-snug group-hover:text-primary transition-colors duration-200 line-clamp-2 min-h-[38px] mb-1">
                                {product.name}
                            </h3>
                            
                            {/* Variantes (Talle / Color) */}
                            {(product.size || product.color) && (
                                <div className="flex flex-wrap items-center gap-1.5 mb-2 h-[20px] overflow-hidden">
                                    {product.size && (
                                        <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                            Talle {product.size}
                                        </span>
                                    )}
                                    {product.color && (
                                        <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                            {product.color}
                                        </span>
                                    )}
                                </div>
                            )}
                            
                            {/* Precio destacado en Morado de marca y BOLD */}
                            <div className="mt-1 flex flex-col">
                                <span className="text-base md:text-lg font-bold text-primary tracking-tight">
                                    ${Number(product.price).toLocaleString('es-AR')}
                                </span>
                                {product.price3 && (
                                    <span className="text-[10px] font-bold text-accent bg-accent-light inline-block px-2 py-0.5 rounded-md mt-1 w-max">
                                        Combo 3+: ${Number(product.price3).toLocaleString('es-AR')}
                                    </span>
                                )}
                                {!product.price3 && (
                                    <span className="text-[10px] text-slate-400 mt-1">3 cuotas sin interés</span>
                                )}
                            </div>

                            {/* Botón Carrito en Mobile: CTA en Azul, min-h 48px */}
                            <button
                                onClick={(e) => { e.preventDefault(); openOptionsModal(product); }}
                                disabled={!hasStock}
                                className={`md:hidden mt-4 w-full py-3 rounded-xl font-bold text-xs shadow-sm transition-all duration-300 min-h-[48px] flex items-center justify-center gap-2 ${
                                    hasStock 
                                    ? 'bg-accent text-white hover:bg-accent-hover shadow-accent/10 active:scale-95' 
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
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
            <div className="mt-16 flex justify-center w-full col-span-full">
                <button 
                    onClick={() => setVisibleCount(prev => prev + 12)}
                    className="bg-white border-2 border-slate-200 hover:border-accent text-accent font-bold px-8 py-3.5 rounded-xl transition-all active:scale-95 shadow-sm min-h-[48px] premium-transition"
                >
                    Cargar más productos
                </button>
            </div>
        )}

        {/* Modal Selección de Talles y Colores */}
        {activeProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setActiveProduct(null)}>
                <div 
                    className="bg-white rounded-xl p-8 w-full max-w-sm relative shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-300"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button 
                        onClick={() => setActiveProduct(null)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                        aria-label="Cerrar modal"
                    >
                        ✕
                    </button>
                    
                    <h3 className="text-lg font-bold text-slate-950 mb-1 pr-6">{activeProduct.name}</h3>
                    <p className="text-primary font-bold text-lg mb-4">${Number(activeProduct.price).toLocaleString('es-AR')}</p>
                    
                    {activeProduct.description && (
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 mb-6">
                            <p className="text-xs text-slate-600 font-medium whitespace-pre-wrap leading-relaxed">{activeProduct.description}</p>
                        </div>
                    )}

                    {(() => {
                        const requiresSize = Boolean(activeProduct.size && activeProduct.size.trim() !== '');

                        return (
                            <div className="flex flex-col gap-5">
                                <div className="bg-accent-light p-3.5 rounded-xl text-xs md:text-sm text-accent-hover font-semibold border border-accent/20 leading-snug">
                                    ✨ <b>Colores Surtidos:</b> Al enviar tu pedido al carrito vas a poder especificar mediante WhatsApp el color que deseás para revisar su disponibilidad.
                                </div>
                                
                                {requiresSize && (
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-bold text-slate-700">Talle de Preferencia:</label>
                                        <input 
                                            type="text" 
                                            value={selectedSize}
                                            onChange={(e) => setSelectedSize(e.target.value)}
                                            placeholder="Escribí tu talle (ej: M, 38...)"
                                            className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all placeholder-slate-400 bg-slate-50 text-slate-800 min-h-[48px] premium-transition"
                                        />
                                    </div>
                                )}

                                <button 
                                    onClick={() => handleAddToCart(activeProduct, selectedSize, "Surtidos")}
                                    disabled={(requiresSize && !selectedSize.trim())}
                                    className="w-full mt-6 py-3.5 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl shadow-lg shadow-accent/20 hover:-translate-y-0.5 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none min-h-[48px] flex items-center justify-center premium-transition"
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