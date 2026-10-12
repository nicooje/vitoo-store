'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { IconBag, IconCard, IconChevronLeft, IconMinus, IconPlus, IconStore, IconTag, IconTrash, IconTruck, IconWhatsApp } from '@/components/icons';
import { formatPrice } from '@/lib/site';

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


    // Encabezado simple de compra (como en los checkouts de las grandes tiendas)
    const CheckoutHeader = (
        <header className="bg-white border-b border-line">
            <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 md:h-20 grid grid-cols-[1fr_auto_1fr] items-center">
                <Link href="/#catalogo" className="flex items-center gap-2 text-sm text-ink hover:text-primary min-h-[44px]">
                    <IconChevronLeft className="w-5 h-5" /> <span className="hidden sm:inline">Seguir comprando</span>
                </Link>
                <Link href="/" className="flex items-center gap-2.5" aria-label="Vitö Store, inicio">
                    <Image src="/vito-logo.png" alt="" width={40} height={40} className="rounded-full w-9 h-9 md:w-10 md:h-10" />
                    <span className="font-display text-[22px] md:text-[26px] text-primary-dark leading-none">Vitö <span className="italic text-primary">Store</span></span>
                </Link>
                <span className="justify-self-end eyebrow text-[10px] text-muted hidden sm:block">Compra segura</span>
            </div>
        </header>
    );

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-bg-light">
                {CheckoutHeader}
                <div className="flex flex-col items-center justify-center text-center px-6 py-28">
                    <IconBag className="w-10 h-10 text-primary mb-6" />
                    <h1 className="font-display text-4xl text-primary-dark mb-3">Tu carrito está vacío</h1>
                    <p className="text-muted mb-8">Elegí tus favoritos y volvé acá para confirmar el pedido.</p>
                    <Link href="/#catalogo" className="btn btn-primary">Ir al catálogo</Link>
                </div>
            </div>
        );
    }

    const opcion = (activo: boolean) =>
        `w-full p-4 border text-left flex items-center justify-between gap-4 min-h-[56px] transition-colors ${activo ? 'border-primary-dark bg-primary-light/50' : 'border-ink/15 bg-white hover:border-primary/40'}`;
    const radio = (activo: boolean) => (
        <span className={`shrink-0 w-[18px] h-[18px] rounded-full border flex items-center justify-center ${activo ? 'border-primary-dark' : 'border-ink/30'}`}>
            {activo && <span className="w-2.5 h-2.5 rounded-full bg-primary-dark" />}
        </span>
    );
    const campo = "w-full px-0 py-3 border-0 border-b border-ink/25 focus:border-primary outline-none bg-transparent text-base text-ink placeholder:text-muted min-h-[48px] transition-colors";
    const etiqueta = "eyebrow text-[10.5px] text-ink";

    return (
        <div className="bg-bg-light min-h-screen">
            {CheckoutHeader}
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-14 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">

                {/* Columna izquierda: carrito */}
                <section className="lg:col-span-7" aria-labelledby="titulo-carrito">
                    <div className="flex items-end justify-between mb-6 pb-4 border-b border-line">
                        <h1 id="titulo-carrito" className="font-display text-3xl md:text-4xl text-primary-dark">Tu carrito</h1>
                        <span className="text-sm text-muted tabular-nums">{totalItems} {totalItems === 1 ? 'prenda' : 'prendas'}</span>
                    </div>

                    <ul className="flex flex-col divide-y divide-line">
                        {cart.map((item) => {
                            let activePrice = item.precio;
                            let isDiscounted = false;
                            let comboText = '';

                            if (totalItems >= 12 && item.price12 && item.price12 > 0) { activePrice = item.price12; isDiscounted = true; comboText = 'Precio x 12'; }
                            else if (totalItems >= 9 && item.price9 && item.price9 > 0) { activePrice = item.price9; isDiscounted = true; comboText = 'Precio x 9'; }
                            else if (totalItems >= 6 && item.price6 && item.price6 > 0) { activePrice = item.price6; isDiscounted = true; comboText = 'Precio x 6'; }
                            else if (totalItems >= 3 && item.price3 && item.price3 > 0) { activePrice = item.price3; isDiscounted = true; comboText = 'Precio x 3'; }

                            const parseVariants = (str?: string) => str ? str.split(/[,/|-]+/).map(s => s.trim()).filter(Boolean) : [];
                            const sheetColors = parseVariants(item.color);
                            const colorsList = sheetColors.length > 0 ? sheetColors : ['Blanco', 'Negro', 'Gris', 'Rosa', 'Fucsia', 'Rojo', 'Bordó', 'Azul', 'Celeste', 'Verde', 'Amarillo', 'Beige', 'Marrón', 'Lila', 'Surtido', 'Único'];
                            const hasSizes = Boolean(item.size && item.size.trim() !== '');
                            const hasColors = true;
                            const img = String(item.imagenUrl || '').split(',')[0].trim();

                            return (
                                <li key={item.id} className="py-6 flex gap-4 md:gap-6">
                                    <div className="w-24 md:w-28 aspect-[3/4] shrink-0 overflow-hidden bg-sand relative">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        {img && <img src={img} alt={item.nombre} className="w-full h-full object-cover" />}
                                    </div>

                                    <div className="flex-1 min-w-0 flex flex-col">
                                        <div className="flex justify-between gap-4">
                                            <h2 className="text-[15px] text-ink leading-snug line-clamp-2 first-letter:uppercase">{item.nombre.replace(/^[^\p{L}\p{N}]+/u, '')}</h2>
                                            <div className="text-right shrink-0">
                                                <p className="font-semibold text-primary-dark tabular-nums">{formatPrice(Math.round(activePrice * item.cantidad))}</p>
                                                {(isDiscounted || item.cantidad > 1) && (
                                                    <p className="text-xs text-muted tabular-nums mt-0.5">{formatPrice(Math.round(activePrice))} c/u</p>
                                                )}
                                            </div>
                                        </div>
                                        {isDiscounted && <p className="mt-1 eyebrow text-[9.5px] text-accent">{comboText} aplicado</p>}

                                        <div className="mt-auto pt-4 flex flex-wrap items-end gap-x-5 gap-y-3">
                                            {hasSizes && (
                                                <label className="flex flex-col gap-1 w-20">
                                                    <span className="eyebrow text-[9.5px] text-muted">Talle</span>
                                                    <input
                                                        type="text"
                                                        defaultValue={item.selectedSize || ''}
                                                        onBlur={(e) => {
                                                            if (e.target.value.trim() !== item.selectedSize) {
                                                                updateCartItemVariant(item.id, e.target.value.trim(), item.selectedColor);
                                                            }
                                                        }}
                                                        placeholder="Ej: 90"
                                                        className={`w-full border-0 border-b ${!item.selectedSize?.trim() ? 'border-primary' : 'border-ink/25'} focus:border-primary outline-none bg-transparent text-sm text-ink py-2 min-h-[44px]`}
                                                    />
                                                </label>
                                            )}

                                            {hasColors && (
                                                <label className="flex flex-col gap-1">
                                                    <span className="eyebrow text-[9.5px] text-muted">Color</span>
                                                    <select
                                                        value={item.selectedColor || ''}
                                                        onChange={(e) => updateCartItemVariant(item.id, item.selectedSize, e.target.value)}
                                                        className="border-0 border-b border-ink/25 focus:border-primary outline-none bg-transparent text-sm text-ink py-2 min-h-[44px] cursor-pointer"
                                                    >
                                                        <option value="" disabled>Elegir</option>
                                                        {colorsList.map(c => (
                                                            <option key={c} value={c}>{c}</option>
                                                        ))}
                                                    </select>
                                                </label>
                                            )}

                                            <div className="flex flex-col gap-1">
                                                <span className="eyebrow text-[9.5px] text-muted">Cantidad</span>
                                                <div className="flex items-center border border-line bg-white h-11">
                                                    <button onClick={() => updateCartItemQuantity(item.id, item.cantidad - 1)} className="w-11 h-full flex items-center justify-center text-ink hover:text-primary" aria-label="Restar uno"><IconMinus className="w-4 h-4" /></button>
                                                    <span className="w-8 text-center text-sm tabular-nums">{item.cantidad}</span>
                                                    <button onClick={() => updateCartItemQuantity(item.id, item.cantidad + 1)} className="w-11 h-full flex items-center justify-center text-ink hover:text-primary" aria-label="Sumar uno"><IconPlus className="w-4 h-4" /></button>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="ml-auto flex items-center gap-1.5 text-xs text-muted hover:text-primary-dark min-h-[44px] underline-offset-4 hover:underline"
                                            >
                                                <IconTrash className="w-4 h-4" /> Quitar
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    {totalItems >= 3 && cart.some(item => item.price3 || item.price6 || item.price9 || item.price12) ? (
                        <p className="mt-2 flex items-center gap-3 bg-primary-light px-4 py-3 text-sm text-primary-dark">
                            <IconTag className="w-5 h-5 text-primary shrink-0" /> Estás pagando precio por mayor.
                        </p>
                    ) : cart.some(item => item.price3) ? (
                        <p className="mt-2 flex items-center gap-3 bg-white border border-line px-4 py-3 text-sm text-ink/80">
                            <IconTag className="w-5 h-5 text-primary shrink-0" /> Sumá {3 - totalItems} {3 - totalItems === 1 ? 'prenda más' : 'prendas más'} y pagás precio por mayor.
                        </p>
                    ) : null}

                    <div className="mt-6 pt-6 border-t border-primary-dark/15 flex justify-between items-baseline">
                        <span className="eyebrow text-xs text-ink">Total</span>
                        <span className="font-display text-3xl md:text-4xl text-primary-dark tabular-nums">{formatPrice(Math.round(getTotal()))}</span>
                    </div>
                </section>

                {/* Columna derecha: datos y pago */}
                <section className="lg:col-span-5" aria-labelledby="titulo-datos">
                    <div className="bg-white border border-line p-6 md:p-8 lg:sticky lg:top-8">
                        <h2 id="titulo-datos" className="font-display text-2xl md:text-3xl text-primary-dark mb-6">Tus datos</h2>

                        <form className="flex flex-col gap-7" onSubmit={(e) => e.preventDefault()}>
                            <label className="block">
                                <span className={etiqueta}>Nombre y apellido</span>
                                <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} className={campo} placeholder="Ej: María Gómez" autoComplete="name" />
                            </label>

                            <label className="block">
                                <span className={etiqueta}>WhatsApp</span>
                                <input type="tel" required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={campo} placeholder="Ej: 3794123456" autoComplete="tel" />
                            </label>

                            <fieldset>
                                <legend className={`${etiqueta} mb-3`}>Entrega</legend>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                                    <button type="button" onClick={() => setMetodoEntrega('retiro')} className={opcion(metodoEntrega === 'retiro')} aria-pressed={metodoEntrega === 'retiro'}>
                                        <span className="flex items-center gap-3">
                                            <IconStore className="w-5 h-5 text-primary" />
                                            <span><span className="block text-sm text-ink font-medium">Retiro en el local</span><span className="block text-xs text-muted mt-0.5">Sin costo</span></span>
                                        </span>
                                        {radio(metodoEntrega === 'retiro')}
                                    </button>
                                    <button type="button" onClick={() => setMetodoEntrega('envio')} className={opcion(metodoEntrega === 'envio')} aria-pressed={metodoEntrega === 'envio'}>
                                        <span className="flex items-center gap-3">
                                            <IconTruck className="w-5 h-5 text-primary" />
                                            <span><span className="block text-sm text-ink font-medium">Envío a domicilio</span><span className="block text-xs text-muted mt-0.5">Costo a coordinar</span></span>
                                        </span>
                                        {radio(metodoEntrega === 'envio')}
                                    </button>
                                </div>
                            </fieldset>

                            <fieldset>
                                <legend className={`${etiqueta} mb-3`}>Pago</legend>
                                <div className="flex flex-col gap-2">
                                    <button type="button" onClick={() => setMetodoPago('transferencia')} className={opcion(metodoPago === 'transferencia')} aria-pressed={metodoPago === 'transferencia'}>
                                        <span><span className="block text-sm text-ink font-medium">Transferencia</span><span className="block text-xs text-muted mt-0.5">Naranja X, Ualá, MODO o tu banco</span></span>
                                        {radio(metodoPago === 'transferencia')}
                                    </button>

                                    {metodoPago === 'transferencia' && (
                                        <div className="px-4 py-4 bg-primary-light/50 text-sm animate-fade-in">
                                            <p className="eyebrow text-[10px] text-primary-dark mb-3">Datos para transferir</p>
                                            <dl className="space-y-1.5 text-ink/80">
                                                <div className="flex justify-between gap-4"><dt>Alias</dt> <dd className="font-semibold text-ink">vito.store</dd></div>
                                                <div className="flex justify-between gap-4"><dt>Banco</dt> <dd className="font-semibold text-ink">Naranja X</dd></div>
                                                <div className="flex justify-between gap-4"><dt>Titular</dt> <dd className="font-semibold text-ink">Bianca Irina Toledo</dd></div>
                                            </dl>
                                            <p className="mt-3 text-xs text-muted">Después mandanos el comprobante por WhatsApp.</p>
                                        </div>
                                    )}

                                    <button type="button" onClick={() => setMetodoPago('efectivo')} className={opcion(metodoPago === 'efectivo')} aria-pressed={metodoPago === 'efectivo'}>
                                        <span><span className="block text-sm text-ink font-medium">Efectivo</span><span className="block text-xs text-muted mt-0.5">Pagás al recibir o al retirar</span></span>
                                        {radio(metodoPago === 'efectivo')}
                                    </button>

                                    <button type="button" onClick={() => setMetodoPago('mercadopago')} className={opcion(metodoPago === 'mercadopago')} aria-pressed={metodoPago === 'mercadopago'}>
                                        <span><span className="block text-sm text-ink font-medium">Mercado Pago</span><span className="block text-xs text-muted mt-0.5">Tarjetas, dinero en cuenta, Rapipago</span></span>
                                        {radio(metodoPago === 'mercadopago')}
                                    </button>

                                    {metodoPago === 'mercadopago' && (
                                        <div className="px-4 py-4 bg-primary-light/50 text-sm animate-fade-in space-y-3">
                                            <p className="eyebrow text-[10px] text-primary-dark">Datos de Mercado Pago</p>
                                            <dl className="space-y-1.5 text-ink/80">
                                                <div className="flex justify-between gap-4"><dt>Alias</dt> <dd className="font-semibold text-ink">VITO.STORE</dd></div>
                                                <div className="flex justify-between gap-4"><dt>CVU</dt> <dd className="font-semibold text-ink break-all text-right">4530000800010843180599</dd></div>
                                                <div className="flex justify-between gap-4"><dt>Titular</dt> <dd className="font-semibold text-ink text-right">Bianca Irina Toledo</dd></div>
                                            </dl>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    navigator.clipboard.writeText('4530000800010843180599');
                                                    toast.success('CVU copiado. Abriendo Mercado Pago...');
                                                    setTimeout(() => {
                                                        window.open('https://www.mercadopago.com.ar/transferencias', '_blank');
                                                    }, 1200);
                                                }}
                                                className="btn btn-outline w-full"
                                            >
                                                <IconCard className="w-4 h-4" /> Copiar CVU y abrir la app
                                            </button>
                                            <p className="text-xs text-muted">Cuando transfieras, usá el botón de abajo para mandarnos talle, color y comprobante.</p>
                                        </div>
                                    )}
                                </div>
                            </fieldset>

                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={handleWhatsAppOrder}
                                    disabled={loading}
                                    className="btn w-full bg-[#25D366] text-white hover:bg-[#1fb457] disabled:bg-muted"
                                >
                                    <IconWhatsApp className="w-5 h-5" />
                                    {loading ? 'Procesando pedido...' : 'Enviar pedido por WhatsApp'}
                                </button>
                                <p className="mt-3 text-xs text-muted text-center leading-relaxed">
                                    Se abre WhatsApp con tu pedido listo para enviar. Ahí coordinamos color y envío.
                                </p>
                            </div>
                        </form>
                    </div>
                </section>
            </div>
        </div>
    );
}
