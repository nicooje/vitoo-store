"use client";

import { Product } from '@/lib/googleSheets';
import { useCartStore } from '@/store/cartStore';

export default function CatalogoSection({ products }: { products: Product[] }) {
    const addToCart = useCartStore((state) => state.addToCart);

    const handleAddToCart = (product: Product) => {
        // Le ponemos un ID seguro (si el Excel no tiene ID, usa el nombre del producto)
        addToCart({
            id: String(product.id || product.name),
            nombre: String(product.name),
            precio: Number(product.price) || 0,
            imagenUrl: String(product.image_url),
            categoria: String(product.category)
        });

        // Hacemos que la pantalla nos avise para saber que el botón sí se apretó
        alert(`¡Agregaste: ${product.name} al carrito! 🛒`);
    };

    if (!products || products.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem', fontSize: '1.2rem', color: 'var(--foreground)', gridColumn: '1 / -1' }}>
                No hay productos en esta categoría por el momento.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12 max-w-7xl mx-auto">
            {products.map((product) => {
                const stockAtexto = String(product.stock).toUpperCase();
                const hasStock = product.stock === true || stockAtexto === "SI" || stockAtexto === "TRUE";

                return (
                    <div key={product.id} className="group relative flex flex-col bg-white transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 rounded-2xl overflow-hidden border border-slate-100">
                        {/* Imagen - Mantenemos la relación de aspecto 3/4 */}
                        <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-50">
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            
                            {!hasStock && (
                                <div className="absolute top-3 right-3 bg-slate-900/90 text-white px-3 py-1 text-[10px] sm:text-xs font-bold rounded-full backdrop-blur-sm uppercase tracking-wide">
                                    Agotado
                                </div>
                            )}
                        </div>

                        {/* Información del Producto */}
                        <div className="flex flex-col flex-1 p-4 md:p-5">
                            <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 md:mb-2 block">
                                {product.category}
                            </span>
                            <h3 className="text-sm md:text-base text-slate-800 font-medium leading-snug line-clamp-2 min-h-[40px] md:min-h-[48px]">
                                {product.name}
                            </h3>
                            <div className="mt-2 md:mt-3 flex items-center justify-between">
                                <span className="text-lg md:text-xl font-bold text-slate-950">
                                    ${Number(product.price).toLocaleString('es-AR')}
                                </span>
                            </div>

                            {/* Botón Carrito: visible en móvil, oculto y animado on-hover en desktop */}
                            <div className="mt-4 md:absolute md:bottom-5 md:left-5 md:right-5 overflow-hidden transition-all duration-300">
                                <button
                                    onClick={() => handleAddToCart(product)}
                                    disabled={!hasStock}
                                    className={`w-full py-3 px-4 rounded-full font-bold text-sm transition-all duration-300 transform md:translate-y-8 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100
                                        ${hasStock ? 'bg-pink-600 text-white hover:bg-pink-700 shadow-xl shadow-pink-600/20' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                                >
                                    {hasStock ? 'Agregar al Carrito' : 'Sin Stock'}
                                </button>
                            </div>
                        </div>
                        {/* Box invisible para compensar el height del botón absolute en Desktop */}
                        <div className="hidden md:block h-12"></div>
                    </div>
                );
            })}
        </div>
    );
}