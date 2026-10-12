'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BotCard, type useBot } from './WhatsAppPanel';
import {
    Badge, LOW_STOCK, Panel, SectionHeader, Stat, cleanName, estadoClase, fechaHora, firstImg, money, orderTime, parseItems,
    type Order, type Product,
} from './ui';
import type { Seccion } from './AdminShell';

export type FiltroProductos = 'todos' | 'disponible' | 'agotado' | 'bajo' | 'sinfoto' | 'precios';

/** Problemas de datos que conviene revisar (precio por mayor más caro que el unitario, etc.) */
export const precioRaro = (p: Product) =>
    !p.price || [p.price3, p.price6, p.price9, p.price12].some(v => v != null && Number(v) > Number(p.price) * 1.05);

export default function Resumen({ products, orders, b, ir }: {
    products: Product[];
    orders: Order[];
    b: ReturnType<typeof useBot>;
    ir: (s: Seccion, filtro?: { productos?: FiltroProductos; pedidos?: string }) => void;
}) {
    const datos = useMemo(() => {
        const ahora = new Date();
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1).getTime();
        const inicioMesAnt = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1).getTime();
        const validos = orders.filter(o => o.status !== 'Cancelado');
        const delMes = validos.filter(o => orderTime(o) >= inicioMes);
        const mesAnt = validos.filter(o => { const t = orderTime(o); return t >= inicioMesAnt && t < inicioMes; });
        const suma = (os: Order[]) => os.reduce((a, o) => a + (Number(o.total) || 0), 0);

        // ventas por día, últimos 30 días
        const dias: { dia: string; total: number; pedidos: number }[] = [];
        const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
        for (let i = 29; i >= 0; i--) {
            const d = new Date(hoy); d.setDate(hoy.getDate() - i);
            dias.push({ dia: d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }), total: 0, pedidos: 0 });
        }
        const desde = hoy.getTime() - 29 * 864e5;
        for (const o of validos) {
            const t = orderTime(o);
            if (t < desde) continue;
            const idx = Math.floor((new Date(new Date(t).toDateString()).getTime() - desde) / 864e5);
            if (dias[idx]) { dias[idx].total += Number(o.total) || 0; dias[idx].pedidos++; }
        }
        const ult30 = validos.filter(o => orderTime(o) >= desde);

        // más vendidos (90 días)
        const desde90 = Date.now() - 90 * 864e5;
        const conteo = new Map<string, { nombre: string; unidades: number; img?: string }>();
        for (const o of validos) {
            if (orderTime(o) < desde90) continue;
            for (const it of parseItems(o)) {
                const k = cleanName(it.nombre || '').toLowerCase();
                const prev = conteo.get(k) || { nombre: cleanName(it.nombre || ''), unidades: 0, img: firstImg(it.imagenUrl) };
                prev.unidades += Number(it.cantidad) || 0;
                conteo.set(k, prev);
            }
        }
        const top = [...conteo.values()].sort((a, b) => b.unidades - a.unidades).slice(0, 5);

        return {
            ventasMes: suma(delMes), ventasMesAnt: suma(mesAnt), pedidosMes: delMes.length,
            ticket: ult30.length ? suma(ult30) / ult30.length : 0,
            pendientes: orders.filter(o => (o.status || 'Pendiente') === 'Pendiente').length,
            dias, top,
            recientes: [...orders].sort((a, b) => orderTime(b) - orderTime(a)).slice(0, 6),
        };
    }, [orders]);

    const alertas = useMemo(() => ([
        { n: products.filter(p => !p.stock).length, txt: 'productos agotados', filtro: 'agotado' as const },
        { n: products.filter(p => p.stock && (p.quantity ?? 0) > 0 && (p.quantity ?? 0) <= LOW_STOCK).length, txt: `con stock bajo (${LOW_STOCK} o menos)`, filtro: 'bajo' as const },
        { n: products.filter(p => !firstImg(p.image_url)).length, txt: 'sin foto', filtro: 'sinfoto' as const },
        { n: products.filter(precioRaro).length, txt: 'con precios para revisar', filtro: 'precios' as const },
    ].filter(a => a.n > 0)), [products]);

    const variacion = datos.ventasMesAnt ? Math.round(((datos.ventasMes - datos.ventasMesAnt) / datos.ventasMesAnt) * 100) : null;
    const mesNombre = new Date().toLocaleDateString('es-AR', { month: 'long' });

    return (
        <>
            <SectionHeader eyebrow={new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })} title="Hola, así viene Vitö" />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
                <Stat label={`Ventas de ${mesNombre}`} value={money(datos.ventasMes)}
                    hint={variacion == null ? `${datos.pedidosMes} pedidos` : <><span className={variacion >= 0 ? 'text-[#1e6b3b]' : 'text-[#8a1f1f]'}>{variacion >= 0 ? '+' : ''}{variacion}%</span> vs. mes anterior</>} />
                <Stat label="Pedidos pendientes" value={String(datos.pendientes)} tone={datos.pendientes ? 'alert' : 'default'}
                    hint="Tocá para verlos" onClick={() => ir('pedidos', { pedidos: 'Pendiente' })} />
                <Stat label="Ticket promedio" value={money(datos.ticket)} hint="Últimos 30 días" />
                <Stat label="Productos publicados" value={String(products.filter(p => p.stock).length)}
                    hint={`${products.length} en total`} onClick={() => ir('productos', { productos: 'disponible' })} />
            </div>

            <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
                <Panel title="Ventas · últimos 30 días" className="lg:col-span-2">
                    <div className="h-64 p-3 pr-5">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={datos.dias} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                <CartesianGrid vertical={false} stroke="#e9e4ee" />
                                <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#6b6788' }} tickLine={false} axisLine={false} interval={4} />
                                <YAxis tick={{ fontSize: 11, fill: '#6b6788' }} tickLine={false} axisLine={false} width={56} domain={[0, (max: number) => Math.max(max, 10000)]}
                                    tickFormatter={(v: number) => v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${v}`} />
                                <Tooltip cursor={{ fill: '#f3e8ff' }}
                                    contentStyle={{ borderRadius: 2, border: '1px solid #e9e4ee', fontSize: 13 }}
                                    formatter={(v: any, _n: any, item: any) => [`${money(v)} · ${item.payload.pedidos} pedido(s)`, 'Ventas']} />
                                <Bar dataKey="total" fill="#5c24b3" radius={[2, 2, 0, 0]} maxBarSize={22} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Panel>

                <div className="flex flex-col gap-4 md:gap-6">
                    <BotCard b={b} compacta onVerMas={() => ir('whatsapp')} />
                    <Panel title="Para revisar">
                        {alertas.length ? (
                            <ul className="divide-y divide-line">
                                {alertas.map(a => (
                                    <li key={a.filtro}>
                                        <button onClick={() => ir('productos', { productos: a.filtro })} className="w-full flex items-center justify-between gap-3 px-5 py-3.5 text-sm text-left hover:bg-bg-light">
                                            <span><b className="tabular-nums text-primary-dark">{a.n}</b> {a.txt}</span>
                                            <span className="eyebrow text-[9.5px] text-primary">Ver</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="px-5 py-4 text-sm text-muted">Todo en orden.</p>}
                    </Panel>
                </div>

                <Panel title="Últimos pedidos" className="lg:col-span-2" action={<button onClick={() => ir('pedidos')} className="eyebrow text-[10px] text-primary">Ver todos</button>}>
                    {datos.recientes.length ? (
                        <ul className="divide-y divide-line">
                            {datos.recientes.map(o => (
                                <li key={o.id}>
                                    <button onClick={() => ir('pedidos', { pedidos: o.id })} className="w-full grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto] items-center gap-x-4 gap-y-1 px-5 py-3.5 text-left hover:bg-bg-light">
                                        <span className="min-w-0">
                                            <span className="block text-sm text-ink truncate">{o.clientName || 'Sin nombre'}</span>
                                            <span className="block text-xs text-muted">{fechaHora(orderTime(o))} · {parseItems(o).reduce((a, i) => a + (Number(i.cantidad) || 0), 0)} prendas</span>
                                        </span>
                                        <Badge className={`${estadoClase[o.status || 'Pendiente'] || estadoClase.Pendiente} hidden sm:inline-flex`}>{o.status || 'Pendiente'}</Badge>
                                        <span className="text-sm font-semibold text-primary-dark tabular-nums">{money(o.total)}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="px-5 py-6 text-sm text-muted">Todavía no hay pedidos.</p>}
                </Panel>

                <Panel title="Más vendidos · 90 días">
                    {datos.top.length ? (
                        <ul className="divide-y divide-line">
                            {datos.top.map((t, i) => (
                                <li key={t.nombre} className="flex items-center gap-3 px-5 py-3">
                                    <span className="font-display text-lg text-primary w-4">{i + 1}</span>
                                    <span className="relative w-9 h-12 bg-sand shrink-0 overflow-hidden">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        {t.img && <img src={t.img} alt="" className="absolute inset-0 w-full h-full object-cover" />}
                                    </span>
                                    <span className="flex-1 min-w-0 text-sm text-ink line-clamp-2">{t.nombre}</span>
                                    <span className="text-sm text-muted tabular-nums shrink-0">{t.unidades} u.</span>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="px-5 py-6 text-sm text-muted">Sin ventas en los últimos 90 días.</p>}
                </Panel>
            </div>
        </>
    );
}
