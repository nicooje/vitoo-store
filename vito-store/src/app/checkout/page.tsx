'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';

export default function CheckoutPage() {
    const [mounted, setMounted] = useState(false);
    const cart = useCartStore((state) => state.cart);
    const getTotal = useCartStore((state) => state.getTotal);
    const removeFromCart = useCartStore((state) => state.removeFromCart);

    // Estados para el formulario del cliente
    const [nombre, setNombre] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [metodoEntrega, setMetodoEntrega] = useState('retiro');

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // Si el carrito está vacío, mostramos un mensaje para volver
    if (cart.length === 0) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', fontFamily: 'system-ui, sans-serif' }}>
                <h2 style={{ fontSize: '24px', color: '#374151', marginBottom: '20px' }}>Tu carrito está vacío 🛒</h2>
                <Link href="/" style={{ backgroundColor: '#db2777', color: 'white', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
                    Volver a la tienda
                </Link>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>

                {/* COLUMNA IZQUIERDA: Resumen del Carrito */}
                <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', borderBottom: '2px solid #f3f4f6', paddingBottom: '10px' }}>Resumen de Compra</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {cart.map((item) => (
                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid #f3f4f6', paddingBottom: '15px' }}>
                                <img src={item.imagenUrl} alt={item.nombre} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#111827' }}>{item.nombre}</h4>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Cantidad: {item.cantidad}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#db2777' }}>${(item.precio * item.cantidad).toLocaleString('es-AR')}</p>
                                    <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', padding: 0 }}>Eliminar</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#374151' }}>Total a Pagar:</span>
                        <span style={{ fontSize: '24px', fontWeight: '900', color: '#db2777' }}>${getTotal().toLocaleString('es-AR')}</span>
                    </div>
                </div>

                {/* COLUMNA DERECHA: Datos del Cliente */}
                <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', borderBottom: '2px solid #f3f4f6', paddingBottom: '10px' }}>Tus Datos</h2>

                    <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#4b5563' }}>Nombre y Apellido</label>
                            <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }} placeholder="Ej: María Gómez" />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#4b5563' }}>WhatsApp</label>
                            <input type="tel" required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }} placeholder="Ej: 3794123456" />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#4b5563' }}>Método de Entrega</label>
                            <select value={metodoEntrega} onChange={(e) => setMetodoEntrega(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box', backgroundColor: 'white' }}>
                                <option value="retiro">Retirar en el Local (Gratis)</option>
                                <option value="envio">Envío a Domicilio (Costo a coordinar)</option>
                            </select>
                        </div>

                        <button type="button" style={{ width: '100%', padding: '16px', backgroundColor: '#25D366', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                            Continuar a Pagos 💳
                        </button>
                        <Link href="/" style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', textDecoration: 'none', marginTop: '10px', display: 'block' }}>
                            ← Seguir comprando
                        </Link>
                    </form>
                </div>

            </div>
        </div>
    );
}