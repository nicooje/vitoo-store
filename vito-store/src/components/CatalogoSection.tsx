"use client";

import { Product } from '@/lib/googleSheets';

const WHATSAPP_NUMBER = "5493794000000";

const generateWhatsAppLink = (product: Product) => {
    const message = `Hola Vitoo! 👋 Vi el ${product.name} ($ ${product.price.toLocaleString('es-AR')}) en la web. ¿Tienen stock disponible?`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

export default function CatalogoSection({ products }: { products: Product[] }) {
    return (
        <section id="catalogo" style={{ padding: '4rem 5%', backgroundColor: 'var(--background)' }}>
            <h2 style={{ textAlign: 'center', fontSize: '2.5rem', color: 'var(--foreground)', marginBottom: '3rem' }}>
                Nuestro Catálogo
            </h2>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '2rem'
            }}>
                {products.map((product) => (
                    <div key={product.id} style={{
                        position: 'relative',
                        borderRadius: '15px',
                        overflow: 'hidden',
                        aspectRatio: '3/4',
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                        transition: 'transform 0.3s'
                    }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
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
                                ${product.price.toLocaleString('es-AR')}
                            </span>
                            <a
                                href={generateWhatsAppLink(product)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'inline-block',
                                    padding: '0.8rem 1.5rem',
                                    backgroundColor: 'var(--accent)',
                                    color: 'white',
                                    textAlign: 'center',
                                    borderRadius: '25px',
                                    fontWeight: 'bold',
                                    textDecoration: 'none',
                                    marginTop: 'auto',
                                    transition: 'background-color 0.3s'
                                }}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = '#b0071e'}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
                            >
                                Consultar / Comprar
                            </a>
                        </div>
                        {!product.stock && (
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
                        {product.stock && (
                            <div style={{
                                position: 'absolute',
                                top: '1rem', right: '1rem',
                                width: '15px', height: '15px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--accent)'
                            }}></div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
