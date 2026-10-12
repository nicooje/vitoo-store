'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    Badge, ESTADOS_PEDIDO, Empty, Panel, SectionHeader, Spinner, cleanName, estadoClase, fechaHora, firstImg, inputCls,
    money, orderTime, parseItems, waNumber, type Order,
} from './ui';

const entregaTxt = (v: string) => v === 'envio' ? 'Envío a domicilio' : v === 'retiro' ? 'Retiro en el local' : v || '-';
const pagoTxt = (v: string) => ({ transferencia: 'Transferencia', efectivo: 'Efectivo', mercadopago: 'Mercado Pago' } as Record<string, string>)[v] || v || '-';

export default function Pedidos({ orders, loading, onRefresh, onStatus, inicial }: {
    orders: Order[];
    loading: boolean;
    onRefresh: () => void;
    onStatus: (id: string, status: string) => Promise<void>;
    inicial?: string; // un estado ("Pendiente") o el id de un pedido para abrirlo
}) {
    const [filtro, setFiltro] = useState<string>('Todos');
    const [q, setQ] = useState('');
    const [abierto, setAbierto] = useState<string | null>(null);
    const [guardando, setGuardando] = useState<string | null>(null);

    useEffect(() => {
        if (!inicial) return;
        if ((ESTADOS_PEDIDO as readonly string[]).includes(inicial)) setFiltro(inicial);
        else { setFiltro('Todos'); setAbierto(inicial); }
    }, [inicial]);

    const conteo = useMemo(() => {
        const c: Record<string, number> = { Todos: orders.length };
        for (const o of orders) { const s = o.status || 'Pendiente'; c[s] = (c[s] || 0) + 1; }
        return c;
    }, [orders]);

    const lista = useMemo(() => {
        const t = q.trim().toLowerCase();
        return [...orders]
            .filter(o => filtro === 'Todos' || (o.status || 'Pendiente') === filtro)
            .filter(o => !t || [o.clientName, o.whatsapp, o.id].some(v => String(v || '').toLowerCase().includes(t))
                || parseItems(o).some(i => (i.nombre || '').toLowerCase().includes(t)))
            .sort((a, b) => orderTime(b) - orderTime(a));
    }, [orders, filtro, q]);

    const total = lista.filter(o => o.status !== 'Cancelado').reduce((a, o) => a + (Number(o.total) || 0), 0);

    const cambiar = async (id: string, s: string) => {
        setGuardando(id);
        try { await onStatus(id, s); } finally { setGuardando(null); }
    };

    return (
        <>
            <SectionHeader eyebrow="Ventas" title="Pedidos">
                <button onClick={onRefresh} className="btn btn-outline" disabled={loading}>{loading ? <Spinner /> : null} Actualizar lista</button>
            </SectionHeader>

            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                <div className="flex gap-1 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                    {['Todos', ...ESTADOS_PEDIDO].map(s => (
                        <button key={s} onClick={() => setFiltro(s)}
                            className={`shrink-0 px-3.5 h-10 text-sm border transition-colors ${filtro === s ? 'bg-primary-dark text-white border-primary-dark' : 'bg-white border-line text-ink/80 hover:border-primary/40'}`}>
                            {s} <span className={`tabular-nums ${filtro === s ? 'text-white/70' : 'text-muted'}`}>{conteo[s] || 0}</span>
                        </button>
                    ))}
                </div>
                <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por clienta, WhatsApp o producto" className={`${inputCls} md:max-w-xs md:ml-auto`} aria-label="Buscar pedidos" />
            </div>

            <Panel>
                {loading && !orders.length ? (
                    <div className="py-16 flex justify-center text-primary"><Spinner className="w-6 h-6" /></div>
                ) : !lista.length ? (
                    <Empty title={orders.length ? 'Ningún pedido con ese filtro' : 'Todavía no hay pedidos'}>Los pedidos que hacen por la web aparecen acá.</Empty>
                ) : (
                    <ul className="divide-y divide-line">
                        {lista.map(o => {
                            const items = parseItems(o);
                            const prendas = items.reduce((a, i) => a + (Number(i.cantidad) || 0), 0);
                            const st = o.status || 'Pendiente';
                            const open = abierto === o.id;
                            const wa = waNumber(o.whatsapp);
                            const msg = `Hola ${o.clientName?.split(' ')[0] || ''}! Te escribimos de Vitö Store por tu pedido de ${money(o.total)}.`;
                            return (
                                <li key={o.id} className={open ? 'bg-bg-light/60' : ''}>
                                    <div className="grid grid-cols-[1fr_auto] md:grid-cols-[1.4fr_1fr_auto_auto] items-center gap-x-4 gap-y-2 px-4 md:px-5 py-4">
                                        <button onClick={() => setAbierto(open ? null : o.id)} className="text-left min-w-0" aria-expanded={open}>
                                            <span className="block text-[15px] text-ink truncate">{o.clientName || 'Sin nombre'}</span>
                                            <span className="block text-xs text-muted mt-0.5">{fechaHora(orderTime(o))} · {prendas} {prendas === 1 ? 'prenda' : 'prendas'}</span>
                                        </button>
                                        <span className="hidden md:block text-xs text-muted">{pagoTxt(o.paymentMethod)} · {entregaTxt(o.deliveryMethod)}</span>
                                        <span className="text-[15px] font-semibold text-primary-dark tabular-nums text-right">{money(o.total)}</span>
                                        <label className="col-span-2 md:col-span-1 flex items-center gap-2">
                                            <span className="sr-only">Estado</span>
                                            <select value={st} onChange={e => cambiar(o.id, e.target.value)} disabled={guardando === o.id}
                                                className={`h-9 px-2.5 text-xs font-medium tracking-wide border-0 outline-none cursor-pointer ${estadoClase[st] || estadoClase.Pendiente}`}>
                                                {ESTADOS_PEDIDO.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            {guardando === o.id && <Spinner className="w-3.5 h-3.5 text-primary" />}
                                            <button onClick={() => setAbierto(open ? null : o.id)} className="ml-auto md:ml-1 eyebrow text-[9.5px] text-primary min-h-[36px] px-1">{open ? 'Cerrar' : 'Detalle'}</button>
                                        </label>
                                    </div>

                                    {open && (
                                        <div className="px-4 md:px-5 pb-5 grid md:grid-cols-[1fr_260px] gap-5 animate-fade-in">
                                            <ul className="bg-white border border-line divide-y divide-line">
                                                {items.map((it, i) => (
                                                    <li key={i} className="flex gap-3 p-3">
                                                        <span className="relative w-12 h-16 bg-sand shrink-0 overflow-hidden">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            {firstImg(it.imagenUrl) && <img src={firstImg(it.imagenUrl)} alt="" className="absolute inset-0 w-full h-full object-cover" />}
                                                        </span>
                                                        <span className="flex-1 min-w-0">
                                                            <span className="block text-sm text-ink">{cleanName(it.nombre || '')}</span>
                                                            <span className="block text-xs text-muted mt-0.5">
                                                                {it.selectedSize ? `Talle ${it.selectedSize}` : 'Sin talle'}{it.selectedColor ? ` · ${it.selectedColor}` : ''}
                                                            </span>
                                                        </span>
                                                        <span className="text-sm text-ink tabular-nums shrink-0">{it.cantidad} × {money(it.precio)}</span>
                                                    </li>
                                                ))}
                                                {!items.length && <li className="p-3 text-sm text-muted">El pedido no tiene detalle de productos.</li>}
                                            </ul>
                                            <div className="bg-white border border-line p-4 text-sm flex flex-col gap-2">
                                                <p><span className="text-muted">WhatsApp:</span> {o.whatsapp || '-'}</p>
                                                <p><span className="text-muted">Pago:</span> {pagoTxt(o.paymentMethod)}</p>
                                                <p><span className="text-muted">Entrega:</span> {entregaTxt(o.deliveryMethod)}</p>
                                                <p className="text-xs text-muted">Pedido #{o.id}</p>
                                                {wa && (
                                                    <a href={`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer"
                                                        className="btn w-full mt-2 bg-[#25D366] text-white hover:bg-[#1fb457]">Escribirle</a>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </Panel>
            {lista.length > 0 && (
                <p className="mt-3 text-sm text-muted text-right tabular-nums">{lista.length} pedidos · {money(total)} {filtro === 'Todos' ? '(sin cancelados)' : ''}</p>
            )}
        </>
    );
}
