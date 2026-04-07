'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';

export default function CheckoutPage() {
    const [mounted, setMounted] = useState(false);
    const cart = useCartStore((state) => state.cart);
    const getTotal = useCartStore((state) => state.getTotal);
    const removeFromCart = useCartStore((state) => state.removeFromCart);

    const [nombre, setNombre] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [metodoEntrega, setMetodoEntrega] = useState('retiro');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const totalItems = cart.reduce((total, item) => total + item.cantidad, 0);

    const handlePago = async () => {
        if (!nombre.trim() || !whatsapp.trim()) {
            alert("⚠️ Por favor, completá tu Nombre y WhatsApp antes de pagar.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cart: cart,
                    cliente: { nombre, whatsapp, metodoEntrega }
                })
            });

            const data = await res.json();

            if (data.init_point) {
                window.location.href = data.init_point;
            } else {
                alert("❌ Hubo un error al conectar con Mercado Pago. Intentá de nuevo.");
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            alert("❌ Error de conexión. Revisá tu internet y volvé a intentar.");
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Tu carrito está vacío 🛒</h2>
                <Link href="/" className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-full font-bold transition-colors shadow-md">
                    Volver a la tienda
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen py-12 px-5 lg:px-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Columna Izquierda: Resumen */}
                <div className="lg:col-span-7 bg-transparent">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Resumen de Compra ({cart.length} {cart.length === 1 ? 'producto' : 'productos'})</h2>

                    <div className="flex flex-col gap-6">
                        {cart.map((item) => {
                            const activePrice = (totalItems >= 3 && item.precioMayorista) ? item.precioMayorista : item.precio;
                            const isDiscounted = (totalItems >= 3 && item.precioMayorista && item.precioMayorista < item.precio);
                            
                            return (
                                <div key={item.id} className="flex gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                    <div className="w-20 h-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                                        <img src={item.imagenUrl} alt={item.nombre} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <h4 className="text-sm md:text-base font-semibold text-slate-900 line-clamp-2">{item.nombre}</h4>
                                        <p className="text-sm text-slate-500 mt-1">Cantidad: <span className="font-medium text-slate-700">{item.cantidad}</span></p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 text-right">
                                        <p className="text-base md:text-lg font-bold text-slate-900 pr-2">${(activePrice * item.cantidad).toLocaleString('es-AR')}</p>
                                        {isDiscounted && (
                                            <p className="text-[10px] sm:text-xs font-semibold text-pink-600 bg-pink-50 px-2 py-0.5 rounded mr-2">
                                                Precio Mayorista
                                            </p>
                                        )}
                                        <button 
                                            onClick={() => removeFromCart(item.id)} 
                                            className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors px-2 py-1"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {totalItems >= 3 && cart.some(item => item.precioMayorista) && (
                        <div className="mt-6 p-4 bg-pink-50 border border-pink-100 rounded-xl text-sm font-bold text-pink-700 flex items-center gap-3">
                            <span className="text-xl">✨</span>
                            ¡Estás accediendo a precios por mayor (Llevando 3+ prendas)!
                        </div>
                    )}

                    <div className="mt-6 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                        <span className="text-lg font-bold text-slate-700">Total a Pagar:</span>
                        <span className="text-2xl md:text-3xl font-black text-pink-600">${getTotal().toLocaleString('es-AR')}</span>
                    </div>
                </div>

                {/* Columna Derecha: Formulario de Datos */}
                <div className="lg:col-span-5 relative">
                    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-100 sticky top-24">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Tus Datos</h2>

                        <form className="flex flex-col gap-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Nombre y Apellido</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={nombre} 
                                    onChange={(e) => setNombre(e.target.value)} 
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all text-slate-800 placeholder-slate-400 bg-slate-50/50" 
                                    placeholder="Ej: María Gómez" 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">WhatsApp</label>
                                <input 
                                    type="tel" 
                                    required 
                                    value={whatsapp} 
                                    onChange={(e) => setWhatsapp(e.target.value)} 
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all text-slate-800 placeholder-slate-400 bg-slate-50/50" 
                                    placeholder="Ej: 3794123456" 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Método de Entrega</label>
                                <select 
                                    value={metodoEntrega} 
                                    onChange={(e) => setMetodoEntrega(e.target.value)} 
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all text-slate-800 bg-slate-50/50 cursor-pointer appearance-none"
                                    style={{
                                        backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 16px top 50%',
                                        backgroundSize: '12px auto',
                                    }}
                                >
                                    <option value="retiro">Retirar en el Local (Gratis)</option>
                                    <option value="envio">Envío a Domicilio (Costo a coordinar)</option>
                                </select>
                            </div>

                            <button
                                type="button"
                                onClick={handlePago}
                                disabled={loading}
                                className={`w-full py-4 px-6 mt-4 text-white rounded-full font-extrabold text-base transition-all duration-300 shadow-xl
                                    ${loading ? 'bg-pink-300 cursor-not-allowed shadow-none' : 'bg-pink-600 hover:bg-pink-700 hover:-translate-y-1 hover:shadow-pink-600/30'}
                                `}
                            >
                                {loading ? 'Procesando pago... ⏳' : 'Continuar a Pagos 💳'}
                            </button>
                            
                            <Link href="/#catalogo" className="text-center text-slate-500 text-sm font-medium mt-4 hover:text-pink-600 transition-colors block">
                                ← Volver al catálogo
                            </Link>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
}