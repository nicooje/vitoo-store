'use client';

import { useCartStore } from '@/store/cartStore';

export default function FloatingCart() {
    // Leemos el carrito desde nuestro "Cerebro" (Zustand)
    const cart = useCartStore((state) => state.cart);
    const getTotal = useCartStore((state) => state.getTotal);

    // Calculamos cuántos productos hay en total
    const totalItems = cart.reduce((total, item) => total + item.cantidad, 0);

    // Si el carrito está vacío, no mostramos el botón
    if (totalItems === 0) return null;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '90px', // Lo ponemos un poco más arriba para que no tape el de WhatsApp
                right: '20px',
                zIndex: 50
            }}
        >
            <button
                style={{
                    backgroundColor: '#db2777',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '9999px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                <span>🛒</span>
                <span>Ver Carrito ({totalItems})</span>
                <span style={{ borderLeft: '1px solid #fbcfe8', paddingLeft: '8px', marginLeft: '4px' }}>
                    ${getTotal().toLocaleString('es-AR')}
                </span>
            </button>
        </div>
    );
}