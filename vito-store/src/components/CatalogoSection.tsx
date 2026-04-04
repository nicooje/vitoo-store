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
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
        }}>
            {products.map((product) => {
                // TRUCO ANTI-TYPESCRIPT: Convertimos a String y mayúsculas para comparar sin errores rojos
                const stockAtexto = String(product.stock).toUpperCase();
                const hasStock = product.stock === true || stockAtexto === "SI" || stockAtexto === "TRUE";

                return (
                    <div key={product.id} style={{
                        position: 'relative',
                        borderRadius: '15px',
                        overflow: 'hidden',
                        aspectRatio: '3/4',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                        transition: 'transform 0.3s'
                    }}
                        onMouseOver={(e) => (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.02)'}
                        onMouseOut={(e) => (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'}
                    >
                        <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                        <div style={{
                            position: 'absolute',
                            bottom: 0, left: 0, right: 0,
                            padding: '1.5rem',
                            background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                            color: 'white',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end'
                        }}>
                            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>
                                {product.category}
                            </span>
                            <h3 style={{ fontSize: '1.2rem', margin: '0.5rem 0' }}>{product.name}</h3>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-light)', marginBottom: '1rem' }}>
                                ${Number(product.price).toLocaleString('es-AR')}
                            </span>

                            <button
                                onClick={() => handleAddToCart(product)}
                                disabled={!hasStock}
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '0.8rem 1.5rem',
                                    backgroundColor: hasStock ? 'var(--accent)' : '#6b7280',
                                    color: 'white',
                                    textAlign: 'center',
                                    borderRadius: '25px',
                                    fontWeight: 'bold',
                                    border: 'none',
                                    cursor: hasStock ? 'pointer' : 'not-allowed',
                                    marginTop: 'auto',
                                    transition: 'background-color 0.3s'
                                }}
                                onMouseOver={(e) => { if (hasStock) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#b0071e' }}
                                onMouseOut={(e) => { if (hasStock) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent)' }}
                            >
                                {hasStock ? '🛒 Agregar al Carrito' : 'Sin Stock'}
                            </button>
                        </div>

                        {!hasStock && (
                            <div style={{
                                position: 'absolute',
                                top: '1rem', right: '1rem',
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                backgroundColor: 'var(--foreground)',
                                color: 'white',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                            }}>
                                Sin Stock
                            </div>
                        )}
                        {hasStock && (
                            <div style={{
                                position: 'absolute',
                                top: '1rem', right: '1rem',
                                width: '15px', height: '15px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--accent)'
                            }}></div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}