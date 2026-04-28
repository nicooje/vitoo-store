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
    const updateCartItemQuantity = useCartStore((state) => state.updateCartItemQuantity);
    const updateCartItemVariant = useCartStore((state) => state.updateCartItemVariant);

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

        const itemsIncompletos = cart.some(item => 
            (Boolean(item.size && item.size.trim() !== '') && !item.selectedSize?.trim())
        );

        if (itemsIncompletos) {
            toast.error("⚠️ Por favor, seleccioná el Talle de todos los productos en tu carrito antes de continuar.");
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

        const itemsIncompletos = cart.some(item => 
            (Boolean(item.size && item.size.trim() !== '') && !item.selectedSize?.trim())
        );

        if (itemsIncompletos) {
            toast.error("⚠️ Por favor, seleccioná el Talle de todos los productos en tu carrito antes de continuar.");
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
                    paymentMethod: metodoPago,
                    total: getTotal()
                })
            });

        const PHONE_NUMBER = "5493794088240";
        let message = `Hola Vitö Store, soy ${nombre}.\n\nQuiero hacer el siguiente pedido mediante *${metodoPago === 'efectivo' ? 'Pago en Efectivo' : metodoPago === 'mercadopago' ? 'Mercado Pago' : 'Transferencia / Billetera Virtual'}*:\n\n`;

        cart.forEach(item => {
            let variantText = '';
            if (item.selectedSize) variantText += ` (Talle: ${item.selectedSize})`;
            variantText += ` (Color: Surtidos)`;
            message += `- ${item.cantidad}x ${item.nombre}${variantText}\n`;
        });

        message += `\n*Nota sobre colores:* Me gustaría consultar disponibilidad en el color: [Escribí tu color ingresando acá]\n`;

        message += `\n*Entrega:* ${metodoEntrega === 'retiro' ? 'Retiro en local' : 'Envío a Domicilio'}`;
        message += `\n*TOTAL A PAGAR:* $${getTotal().toLocaleString('es-AR')}\n\n`;
        message += `Mi número de contacto es: ${whatsapp}\n\n`;
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
                <div className="lg:col-span-7 bg-transparent flex flex-col pt-0 lg:pt-8">
                    <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                        <span className="bg-pink-100 text-pink-600 w-10 h-10 flex items-center justify-center rounded-full text-lg">🛒</span> 
                        Resumen de Compra 
                        <span className="text-base font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                            {cart.length} {cart.length === 1 ? 'ítem' : 'ítems'}
                        </span>
                    </h2>

                    <div className="flex flex-col gap-5">
                        {cart.map((item) => {
                            let activePrice = item.precio;
                            let isDiscounted = false;
                            let comboText = '';

                            if (totalItems >= 12 && item.price12 && item.price12 > 0) { activePrice = item.price12; isDiscounted = true; comboText = 'Combo 12+'; }
                            else if (totalItems >= 9 && item.price9 && item.price9 > 0) { activePrice = item.price9; isDiscounted = true; comboText = 'Combo 9+'; }
                            else if (totalItems >= 6 && item.price6 && item.price6 > 0) { activePrice = item.price6; isDiscounted = true; comboText = 'Combo 6+'; }
                            else if (totalItems >= 3 && item.price3 && item.price3 > 0) { activePrice = item.price3; isDiscounted = true; comboText = 'Combo 3+'; }
                            
                            const parseVariants = (str?: string) => str ? str.split(/[,/|-]+/).map(s => s.trim()).filter(Boolean) : [];
                            const sheetColors = parseVariants(item.color);
                            const colorsList = sheetColors.length > 0 ? sheetColors : ['Blanco', 'Negro', 'Gris', 'Rosa', 'Fucsia', 'Rojo', 'Bordó', 'Azul', 'Celeste', 'Verde', 'Amarillo', 'Beige', 'Marrón', 'Lila', 'Surtido', 'Único'];
                            const hasSizes = Boolean(item.size && item.size.trim() !== '');
                            const hasColors = true;

                            return (
                                <div key={item.id} className="flex flex-col sm:flex-row gap-4 sm:items-center bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                    <div className="flex gap-4 w-full sm:w-auto">
                                        <div className="w-24 h-28 shrink-0 overflow-hidden rounded-2xl bg-slate-100 border border-slate-50">
                                            <img src={item.imagenUrl} alt={item.nombre} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex flex-col flex-1 sm:hidden">
                                            <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-tight">{item.nombre}</h4>
                                            {item.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-tight">{item.description}</p>}
                                            <p className="text-lg font-bold text-slate-900 mt-1.5">${(activePrice * item.cantidad).toLocaleString('es-AR')}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col flex-1 justify-center gap-3">
                                        <div className="hidden sm:block">
                                            <h4 className="text-base font-bold text-slate-900 line-clamp-2 leading-tight">{item.nombre}</h4>
                                            {item.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-snug">{item.description}</p>}
                                        </div>
                                        
                                        {/* Modificadores de Variante */}
                                        <div className="flex flex-wrap gap-3 mt-1">
                                            {/* Selector Talle */}
                                            {hasSizes && (
                                                <div className="flex flex-col gap-1 w-20 sm:w-24">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Talle</span>
                                                    <input 
                                                        type="text"
                                                        defaultValue={item.selectedSize || ''}
                                                        onBlur={(e) => {
                                                            if (e.target.value.trim() !== item.selectedSize) {
                                                                updateCartItemVariant(item.id, e.target.value.trim(), item.selectedColor);
                                                            }
                                                        }}
                                                        placeholder="Ej: M..."
                                                        className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2 py-[5px] focus:ring-2 focus:ring-pink-500 outline-none font-medium text-center w-full min-h-[30px]"
                                                    />
                                                </div>
                                            )}

                                            {/* Selector Color */}
                                            {hasColors && (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Color</span>
                                                    <select 
                                                        value={item.selectedColor || ''}
                                                        onChange={(e) => updateCartItemVariant(item.id, item.selectedSize, e.target.value)}
                                                        className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-pink-500 outline-none font-medium cursor-pointer"
                                                    >
                                                        <option value="" disabled>Elegir</option>
                                                        {colorsList.map(c => (
                                                            <option key={c} value={c}>{c}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}

                                            {/* Modificador Cantidad */}
                                            <div className="flex flex-col gap-1 ml-auto sm:ml-0">
                                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cant</span>
                                                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg h-[30px] overflow-hidden">
                                                    <button onClick={() => updateCartItemQuantity(item.id, item.cantidad - 1)} className="w-8 h-full flex items-center justify-center text-slate-500 hover:bg-pink-100 hover:text-pink-700 transition-colors font-black">-</button>
                                                    <span className="w-8 text-center text-xs font-bold text-slate-700">{item.cantidad}</span>
                                                    <button onClick={() => updateCartItemQuantity(item.id, item.cantidad + 1)} className="w-8 h-full flex items-center justify-center text-slate-500 hover:bg-pink-100 hover:text-pink-700 transition-colors font-black">+</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desktop details side */}
                                    <div className="hidden sm:flex flex-col items-end justify-between h-28 py-1 text-right min-w-[90px]">
                                        <div className="flex flex-col items-end">
                                            <p className="text-xl font-black text-slate-900 tracking-tight">${(activePrice * item.cantidad).toLocaleString('es-AR')}</p>
                                            {isDiscounted ? (
                                                <div className="flex flex-col items-end gap-1 mt-1.5">
                                                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-pink-600 bg-pink-100/50 px-2 py-0.5 rounded border border-pink-100">
                                                        {comboText}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400">
                                                        ${activePrice.toLocaleString('es-AR')} c/u
                                                    </span>
                                                </div>
                                            ) : (
                                                item.cantidad > 1 && (
                                                    <span className="text-[10px] font-bold text-slate-400 mt-1">
                                                        ${activePrice.toLocaleString('es-AR')} c/u
                                                    </span>
                                                )
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => removeFromCart(item.id)} 
                                            className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 group"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 group-hover:scale-110 transition-transform">
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                            </svg>
                                            Quitar
                                        </button>
                                    </div>
                                    
                                    {/* Mobile details footer */}
                                    <div className="flex sm:hidden items-center justify-between mt-2 pt-3 border-t border-slate-100">
                                            {isDiscounted ? (
                                                <p className="text-[10px] uppercase tracking-wider font-extrabold text-pink-600 bg-pink-100/50 px-2 py-1 rounded inline-block border border-pink-100">
                                                    {comboText}
                                                </p>
                                            ) : <div></div>}
                                            <button 
                                                onClick={() => removeFromCart(item.id)} 
                                                className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                                            >
                                                Quitar producto
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
                                    
                                    {metodoPago === 'transferencia' && (
                                        <div className="p-4 bg-pink-50/50 border border-pink-100/50 rounded-xl text-sm text-slate-700">
                                            <p className="font-bold mb-2 text-pink-800">DATOS PARA TRANSFERIR:</p>
                                            <p>Alias: <b>vito.store</b></p>
                                            <p>Banco: <b>Naranja X</b></p>
                                            <p>A nombre de: <b>Bianca Irina Toledo</b></p>
                                            <p className="mt-2 text-xs text-slate-500">Te adjuntaré el comprobante por WhatsApp apenas realice el pago.</p>
                                        </div>
                                    )}

                                    <button 
                                        type="button"
                                        onClick={() => setMetodoPago('efectivo')}
                                        className={`p-4 border-2 rounded-xl flex items-center justify-between transition-all ${metodoPago === 'efectivo' ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-slate-200 hover:border-green-300'}`}
                                    >
                                        <div className="flex flex-col text-left">
                                            <span className="font-bold text-slate-900 text-green-800">Pago en Efectivo 💵</span>
                                            <span className="text-sm text-slate-500 mt-0.5">Abonás al recibir o retirar</span>
                                        </div>
                                        {metodoPago === 'efectivo' ? <div className="w-5 h-5 rounded-full bg-green-500 border-4 border-white shadow-sm ring-1 ring-green-500"></div> : <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>}
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

                            {metodoPago === 'mercadopago' && (
                                <div className="p-4 bg-blue-50/50 border border-blue-100/50 rounded-xl text-sm text-slate-700">
                                    <p className="font-bold mb-2 text-blue-800">DATOS PARA TRANSFERIR (MERCADO PAGO):</p>
                                    <p>Alias: <b>VITO.STORE</b></p>
                                    <p>CVU: <b>4530000800010843180599</b></p>
                                    <p>A nombre de: <b>Bianca Irina Toledo</b></p>
                                    <p className="mt-2 text-xs text-slate-500">Te adjuntaré el comprobante por WhatsApp apenas realice el pago.</p>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={handleWhatsAppOrder}
                                disabled={loading}
                                className={`w-full py-4 px-6 mt-4 text-white rounded-full font-extrabold text-base transition-all duration-300 shadow-xl
                                    ${loading ? 'bg-green-400 cursor-not-allowed shadow-none' : 'bg-green-500 hover:bg-green-600 hover:-translate-y-1 hover:shadow-green-500/30'}
                                `}
                            >
                                {loading ? 'Procesando pedido... ⏳' : 'Generar Pedido por WhatsApp 📲'}
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