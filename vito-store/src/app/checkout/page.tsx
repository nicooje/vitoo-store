'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
    const [mounted, setMounted] = useState(false);
    const cart = useCartStore((state) => state.cart);
    const getTotal = useCartStore((state) => state.getTotal);
    const removeFromCart = useCartStore((state) => state.removeFromCart);
    const clearCart = useCartStore((state) => state.clearCart);

    const [nombre, setNombre] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [metodoEntrega, setMetodoEntrega] = useState('retiro');
    const [metodoPago, setMetodoPago] = useState('transferencia');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const totalItems = cart.reduce((total, item) => total + item.cantidad, 0);

    const handlePago = async () => {
        if (!nombre.trim() || !whatsapp.trim()) {
            toast.error("Por favor, completá tu Nombre y WhatsApp antes de pagar.");
            return;
        }

        setLoading(true);

        try {
            // Guardar primero en DB de Pedidos
            await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cart: cart,
                    cliente: { nombre, whatsapp, metodoEntrega },
                    paymentMethod: 'mercadopago',
                    total: getTotal()
                })
            });

            // Luego generar preferencia de Mercadopago
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
                toast.error("Hubo un error al conectar con Mercado Pago. Intentá de nuevo.");
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error de conexión. Revisá tu internet y volvé a intentar.");
            setLoading(false);
        }
    };

    const handleWhatsAppOrder = async () => {
        if (!nombre.trim() || !whatsapp.trim()) {
            toast.error("Por favor, completá tu Nombre y WhatsApp antes de pagar.");
            return;
        }

        setLoading(true);

        try {
            // Guardar primero en DB de Pedidos
            await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cart: cart,
                    cliente: { nombre, whatsapp, metodoEntrega },
                    paymentMethod: 'transferencia',
                    total: getTotal()
                })
            });

            const PHONE_NUMBER = "5493794088240";
        let message = `Hola Vitö Store, soy ${nombre}.\n\nQuiero hacer el siguiente pedido mediante *Transferencia / Billetera Virtual*:\n\n`;

        cart.forEach(item => {
            let variantText = '';
            if (item.selectedSize) variantText += ` (Talle: ${item.selectedSize})`;
            if (item.selectedColor) variantText += ` (Color: ${item.selectedColor})`;
            message += `- ${item.cantidad}x ${item.nombre}${variantText}\n`;
        });

        message += `\n*Entrega:* ${metodoEntrega === 'retiro' ? 'Retiro en local' : 'Envío a Domicilio'}`;
        message += `\n*TOTAL A PAGAR:* $${getTotal().toLocaleString('es-AR')}\n\n`;
        message += `Mi número de contacto es: ${whatsapp}\n\n`;
        message += `*DATOS PARA TRANSFERIR:*\n`;
        message += `Alias: vito.store\n`;
        message += `Banco: Naranja X\n`;
        message += `A nombre de: Bianca Irina Toledo\n\n`;
        message += `*(Te adjuntaré el comprobante por acá apenas realice el pago. ¡Gracias!)*`;

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodedMessage}`, '_blank');
        
        clearCart();
        setLoading(false);
        } catch (error) {
            console.error("Error saving WhatsApp order", error);
            toast.error("Hubo un error al guardar tu pedido. Revisá la conexión.");
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
                            let activePrice = item.precio;
                            let isDiscounted = false;
                            let comboText = '';

                            if (totalItems >= 12 && item.price12 && item.price12 > 0) { activePrice = item.price12; isDiscounted = true; comboText = 'Combo 12+'; }
                            else if (totalItems >= 9 && item.price9 && item.price9 > 0) { activePrice = item.price9; isDiscounted = true; comboText = 'Combo 9+'; }
                            else if (totalItems >= 6 && item.price6 && item.price6 > 0) { activePrice = item.price6; isDiscounted = true; comboText = 'Combo 6+'; }
                            else if (totalItems >= 3 && item.price3 && item.price3 > 0) { activePrice = item.price3; isDiscounted = true; comboText = 'Combo 3+'; }
                            
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
                                                Precio {comboText}
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

                    {totalItems >= 3 && cart.some(item => item.price3 || item.price6 || item.price9 || item.price12) && (
                        <div className="mt-6 p-4 bg-pink-50 border border-pink-100 rounded-xl text-sm font-bold text-pink-700 flex items-center gap-3">
                            <span className="text-xl">✨</span>
                            ¡Estás accediendo a precios de combo por cantidad!
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
                                <label className="block text-sm font-bold text-slate-700 mb-3">Método de Entrega</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setMetodoEntrega('retiro')}
                                        className={`p-4 border-2 rounded-xl text-left transition-all ${metodoEntrega === 'retiro' ? 'border-pink-500 bg-pink-50 ring-1 ring-pink-500' : 'border-slate-200 hover:border-pink-300'}`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-slate-900">Retirar Local 🛍️</span>
                                            {metodoEntrega === 'retiro' && <div className="w-4 h-4 rounded-full bg-pink-500 border-4 border-pink-100"></div>}
                                        </div>
                                        <p className="text-sm text-slate-500">Sin costo adicional</p>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setMetodoEntrega('envio')}
                                        className={`p-4 border-2 rounded-xl text-left transition-all ${metodoEntrega === 'envio' ? 'border-pink-500 bg-pink-50 ring-1 ring-pink-500' : 'border-slate-200 hover:border-pink-300'}`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-slate-900">Envío Domicilio 🛵</span>
                                            {metodoEntrega === 'envio' && <div className="w-4 h-4 rounded-full bg-pink-500 border-4 border-pink-100"></div>}
                                        </div>
                                        <p className="text-sm text-slate-500">Costo a coordinar</p>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">Método de Pago</label>
                                <div className="flex flex-col gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setMetodoPago('transferencia')}
                                        className={`p-4 border-2 rounded-xl flex items-center justify-between transition-all ${metodoPago === 'transferencia' ? 'border-pink-500 bg-pink-50 ring-1 ring-pink-500' : 'border-slate-200 hover:border-pink-300'}`}
                                    >
                                        <div className="flex flex-col text-left">
                                            <span className="font-bold text-slate-900">Transferencia Bancaria 🏦</span>
                                            <span className="text-sm text-slate-500 mt-0.5">Naranja X, Ualá, MODO, Banco</span>
                                        </div>
                                        {metodoPago === 'transferencia' ? <div className="w-5 h-5 rounded-full bg-pink-500 border-4 border-white shadow-sm ring-1 ring-pink-500"></div> : <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>}
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setMetodoPago('mercadopago')}
                                        className={`p-4 border-2 rounded-xl flex items-center justify-between transition-all ${metodoPago === 'mercadopago' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300'}`}
                                    >
                                        <div className="flex flex-col text-left">
                                            <span className="font-bold text-slate-900 text-blue-800">Mercado Pago 💳</span>
                                            <span className="text-sm text-slate-500 mt-0.5">Tarjetas, Dinero en cuenta, RapiPago</span>
                                        </div>
                                        {metodoPago === 'mercadopago' ? <div className="w-5 h-5 rounded-full bg-blue-500 border-4 border-white shadow-sm ring-1 ring-blue-500"></div> : <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>}
                                    </button>
                                </div>
                            </div>

                            {metodoPago === 'mercadopago' ? (
                                <button
                                    type="button"
                                    onClick={handlePago}
                                    disabled={loading}
                                    className={`w-full py-4 px-6 mt-4 text-white rounded-full font-extrabold text-base transition-all duration-300 shadow-xl
                                        ${loading ? 'bg-pink-300 cursor-not-allowed shadow-none' : 'bg-pink-600 hover:bg-pink-700 hover:-translate-y-1 hover:shadow-pink-600/30'}
                                    `}
                                >
                                    {loading ? 'Procesando pago... ⏳' : 'Continuar a Mercado Pago 💳'}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleWhatsAppOrder}
                                    className="w-full py-4 px-6 mt-4 text-white rounded-full font-extrabold text-base transition-all duration-300 shadow-xl bg-green-500 hover:bg-green-600 hover:-translate-y-1 hover:shadow-green-500/30"
                                >
                                    Generar Pedido por WhatsApp 📲
                                </button>
                            )}
                            
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