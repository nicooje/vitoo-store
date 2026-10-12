'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminShell, { type Seccion } from '@/components/admin/AdminShell';
import Resumen, { type FiltroProductos } from '@/components/admin/Resumen';
import Pedidos from '@/components/admin/Pedidos';
import Productos from '@/components/admin/Productos';
import WhatsAppSection, { useBot } from '@/components/admin/WhatsAppPanel';
import type { ProductoForm } from '@/components/admin/ProductoEditor';
import type { Order, Product } from '@/components/admin/ui';

const SECCIONES: Seccion[] = ['resumen', 'pedidos', 'productos', 'whatsapp'];

/** Fila completa para la API (el PUT reescribe la fila entera del Sheet). */
const filaDe = (p: Product) => ({
    name: p.name, category: p.category, price: p.price, image_url: p.image_url, stock: p.stock,
    size: p.size || '', color: p.color || '', quantity: p.quantity ?? 0,
    price3: p.price3 ?? '', price6: p.price6 ?? '', price9: p.price9 ?? '', price12: p.price12 ?? '',
    description: p.description || '',
});

async function api(url: string, method: string, body?: unknown) {
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    if (res.status === 401) { window.location.href = '/admin/login'; throw new Error('La sesión venció'); }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Error de conexión');
    return data;
}

export default function AdminPage() {
    const [seccion, setSeccion] = useState<Seccion>('resumen');
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingP, setLoadingP] = useState(true);
    const [loadingO, setLoadingO] = useState(true);
    const [filtroProductos, setFiltroProductos] = useState<FiltroProductos | undefined>();
    const [filtroPedidos, setFiltroPedidos] = useState<string | undefined>();
    const b = useBot();

    // la sección vive en la URL (#pedidos) para que recargar no te saque de donde estabas
    useEffect(() => {
        const leer = () => { const h = window.location.hash.slice(1) as Seccion; if (SECCIONES.includes(h)) setSeccion(h); };
        leer();
        window.addEventListener('hashchange', leer);
        return () => window.removeEventListener('hashchange', leer);
    }, []);
    const ir = (s: Seccion, f?: { productos?: FiltroProductos; pedidos?: string }) => {
        setFiltroProductos(f?.productos);
        setFiltroPedidos(f?.pedidos);
        setSeccion(s);
        history.replaceState(null, '', `#${s}`);
        window.scrollTo({ top: 0 });
    };

    const cargarProductos = useCallback(async () => {
        setLoadingP(true);
        try { setProducts(await api('/api/admin/products', 'GET')); }
        catch (e: any) { toast.error(`No se pudieron cargar los productos: ${e.message}`); }
        finally { setLoadingP(false); }
    }, []);
    const cargarPedidos = useCallback(async () => {
        setLoadingO(true);
        try { const d = await api('/api/admin/orders', 'GET'); if (Array.isArray(d)) setOrders(d); }
        catch (e: any) { toast.error(`No se pudieron cargar los pedidos: ${e.message}`); }
        finally { setLoadingO(false); }
    }, []);
    useEffect(() => { cargarProductos(); cargarPedidos(); }, [cargarProductos, cargarPedidos]);

    // cuando el bot termina una actualización real, refrescar el catálogo
    const [ultimoFin, setUltimoFin] = useState('');
    useEffect(() => {
        const fin = b.bot?.fin || '';
        if (fin && ultimoFin && fin !== ultimoFin && b.bot?.resultado && !b.bot.resultado.simular) cargarProductos();
        if (fin) setUltimoFin(fin);
    }, [b.bot?.fin]); // eslint-disable-line react-hooks/exhaustive-deps

    const guardarProducto = async (data: ProductoForm, id?: number) => {
        await api('/api/admin/products', id ? 'PUT' : 'POST', id ? { id, ...data } : data);
        toast.success(id ? 'Producto actualizado' : 'Producto publicado');
        await cargarProductos();
    };

    const cambioRapido = async (p: Product, c: { quantity?: number; stock?: boolean }) => {
        const nuevo: Product = { ...p, quantity: c.quantity !== undefined ? Math.max(0, c.quantity) : p.quantity, stock: c.stock ?? p.stock };
        setProducts(prev => prev.map(x => x.id === p.id ? nuevo : x)); // optimista
        try { await api('/api/admin/products', 'PUT', { id: p.id, ...filaDe(nuevo) }); }
        catch (e: any) { setProducts(prev => prev.map(x => x.id === p.id ? p : x)); toast.error(`No se guardó: ${e.message}`); }
    };

    const eliminar = async (ids: number[]) => {
        try {
            const items = ids.map(id => ({ id, name: products.find(p => p.id === id)?.name }));
            await api('/api/admin/products', 'DELETE', { items });
            toast.success(ids.length === 1 ? 'Producto eliminado' : `${ids.length} productos eliminados`);
        } catch (e: any) { toast.error(e.message); }
        await cargarProductos();
    };

    const cambioMasivo = async (ids: number[], c: { stock: boolean }) => {
        let ok = 0;
        for (const id of ids) {
            const p = products.find(x => x.id === id);
            if (!p || p.stock === c.stock) continue;
            try { await api('/api/admin/products', 'PUT', { id, ...filaDe({ ...p, stock: c.stock }) }); ok++; }
            catch { /* sigue con el resto */ }
        }
        toast.success(`${ok} productos marcados como ${c.stock ? 'disponibles' : 'agotados'}`);
        await cargarProductos();
    };

    const cambiarEstado = async (id: string, status: string) => {
        const prev = orders;
        setOrders(o => o.map(x => x.id === id ? { ...x, status } : x));
        try { await api('/api/admin/orders', 'PATCH', { id, status }); }
        catch (e: any) { setOrders(prev); toast.error(`No se pudo cambiar el estado: ${e.message}`); }
    };

    const salir = async () => {
        await fetch('/api/auth', { method: 'DELETE' }).catch(() => {});
        window.location.href = '/admin/login';
    };

    const pendientes = orders.filter(o => (o.status || 'Pendiente') === 'Pendiente').length;
    const badges = {
        pedidos: pendientes ? <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-white text-[11px] flex items-center justify-center tabular-nums">{pendientes}</span> : null,
        whatsapp: b.bot?.estado === 'en_curso' || b.bot?.pendiente ? <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> : null,
    };

    return (
        <AdminShell seccion={seccion} onSeccion={s => ir(s)} badges={badges} onLogout={salir}>
            {seccion === 'resumen' && <Resumen products={products} orders={orders} b={b} ir={ir} />}
            {seccion === 'pedidos' && <Pedidos orders={orders} loading={loadingO} onRefresh={cargarPedidos} onStatus={cambiarEstado} inicial={filtroPedidos} />}
            {seccion === 'productos' && (
                <Productos products={products} loading={loadingP} inicial={filtroProductos}
                    onSave={guardarProducto} onQuick={cambioRapido} onDelete={eliminar} onBulk={cambioMasivo} />
            )}
            {seccion === 'whatsapp' && <WhatsAppSection b={b} onImportado={cargarProductos} />}
        </AdminShell>
    );
}
