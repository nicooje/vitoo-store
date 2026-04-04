'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cartStore';

export default function FloatingCart() {
    // 1. Agregamos un estado para saber si la página ya cargó completamente
    const [mounted, setMounted] = useState(false);

    const cart = useCartStore((state) => state.cart);
    const getTotal = useCartStore((state) => state.getTotal);

    // 2. El "despertador": le avisa al componente que ya puede mostrarse
    useEffect(() => {
        setMounted(true);
    }, []);

    // Si la página no cargó del todo, no mostramos nada para evitar errores
    if (!mounted) return null;

    const totalItems = cart.reduce((total, item) => total + item.cantidad, 0);

    if (totalItems === 0) return null;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '90px',
                right: '20px',
                zIndex: 9999 // Le subimos el Z-index al máximo para que nada lo tape
            }}
        >
            <button
                style={{
                    backgroundColor: '#db2777',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '9999px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
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
                <span style={{ fontSize: '20px' }}>🛒</span>
                <span>Ver Carrito ({totalItems})</span>
                <span style={{ borderLeft: '1px solid #fbcfe8', paddingLeft: '8px', marginLeft: '4px' }}>
                    ${getTotal().toLocaleString('es-AR')}
                </span>
            </button>
        </div>
    );
}