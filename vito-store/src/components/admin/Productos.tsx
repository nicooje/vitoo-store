'use client';

import { useEffect, useMemo, useState } from 'react';
import ProductoEditor, { type ProductoForm } from './ProductoEditor';
import { precioRaro, type FiltroProductos } from './Resumen';
import { Badge, Empty, LOW_STOCK, Panel, SectionHeader, Spinner, Toggle, cleanName, firstImg, inputCls, money, type Product } from './ui';

const POR_PAGINA = 24;
const FILTROS: { id: FiltroProductos; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'disponible', label: 'Disponibles' },
    { id: 'agotado', label: 'Agotados' },
    { id: 'bajo', label: 'Stock bajo' },
    { id: 'sinfoto', label: 'Sin foto' },
    { id: 'precios', label: 'Precios a revisar' },
];

export default function Productos({ products, loading, inicial, onSave, onQuick, onDelete, onBulk }: {
    products: Product[];
    loading: boolean;
    inicial?: FiltroProductos;
    onSave: (data: ProductoForm, id?: number) => Promise<void>;
    onQuick: (p: Product, cambios: { quantity?: number; stock?: boolean }) => Promise<void>;
    onDelete: (ids: number[]) => Promise<void>;
    onBulk: (ids: number[], cambios: { stock: boolean }) => Promise<void>;
}) {
    const [filtro, setFiltro] = useState<FiltroProductos>(inicial || 'todos');
    const [cat, setCat] = useState('Todas');
    const [q, setQ] = useState('');
    const [orden, setOrden] = useState<'recientes' | 'nombre' | 'precio' | 'stock'>('recientes');
    const [pagina, setPagina] = useState(1);
    const [sel, setSel] = useState<Set<number>>(new Set());
    const [editando, setEditando] = useState<Product | null | 'nuevo'>(null);
    const [ocupado, setOcupado] = useState<number | 'bulk' | null>(null);

    useEffect(() => { if (inicial) setFiltro(inicial); }, [inicial]);
    useEffect(() => { setPagina(1); }, [filtro, cat, q, orden]);

    const categorias = useMemo(() => Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort(), [products]);

    const lista = useMemo(() => {
        const t = q.trim().toLowerCase();
        const r = products.filter(p => {
            if (cat !== 'Todas' && p.category !== cat) return false;
            if (t && !`${p.name} ${p.category} ${p.size || ''}`.toLowerCase().includes(t)) return false;
            switch (filtro) {
                case 'disponible': return p.stock;
                case 'agotado': return !p.stock;
                case 'bajo': return p.stock && (p.quantity ?? 0) > 0 && (p.quantity ?? 0) <= LOW_STOCK;
                case 'sinfoto': return !firstImg(p.image_url);
                case 'precios': return precioRaro(p);
                default: return true;
            }
        });
        const s = [...r];
        if (orden === 'nombre') s.sort((a, b) => cleanName(a.name).localeCompare(cleanName(b.name)));
        else if (orden === 'precio') s.sort((a, b) => Number(a.price) - Number(b.price));
        else if (orden === 'stock') s.sort((a, b) => (a.quantity ?? 0) - (b.quantity ?? 0));
        else s.reverse(); // lo último cargado en el Sheet primero
        return s;
    }, [products, filtro, cat, q, orden]);

    const paginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
    const visibles = lista.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
    const todosSel = visibles.length > 0 && visibles.every(p => sel.has(p.id));

    const toggleSel = (id: number) => setSel(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
    const quick = async (p: Product, c: { quantity?: number; stock?: boolean }) => { setOcupado(p.id); try { await onQuick(p, c); } finally { setOcupado(null); } };
    const bulk = async (fn: () => Promise<void>) => { setOcupado('bulk'); try { await fn(); setSel(new Set()); } finally { setOcupado(null); } };

    const conteo = (f: FiltroProductos) => products.filter(p => f === 'todos' ? true : f === 'disponible' ? p.stock : f === 'agotado' ? !p.stock
        : f === 'bajo' ? p.stock && (p.quantity ?? 0) > 0 && (p.quantity ?? 0) <= LOW_STOCK : f === 'sinfoto' ? !firstImg(p.image_url) : precioRaro(p)).length;

    return (
        <>
            <SectionHeader eyebrow="Catálogo" title="Productos">
                <button onClick={() => setEditando('nuevo')} className="btn btn-primary">+ Nuevo producto</button>
            </SectionHeader>

            <div className="flex gap-1 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 mb-3">
                {FILTROS.map(f => (
                    <button key={f.id} onClick={() => setFiltro(f.id)}
                        className={`shrink-0 px-3.5 h-10 text-sm border transition-colors ${filtro === f.id ? 'bg-primary-dark text-white border-primary-dark' : 'bg-white border-line text-ink/80 hover:border-primary/40'}`}>
                        {f.label} <span className={`tabular-nums ${filtro === f.id ? 'text-white/70' : 'text-muted'}`}>{conteo(f.id)}</span>
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-[1fr_200px_200px] gap-2 mb-4">
                <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar producto" className={`${inputCls} col-span-2 md:col-span-1`} aria-label="Buscar producto" />
                <select value={cat} onChange={e => setCat(e.target.value)} className={inputCls} aria-label="Categoría">
                    <option value="Todas">Todas las categorías</option>
                    {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={orden} onChange={e => setOrden(e.target.value as typeof orden)} className={inputCls} aria-label="Ordenar">
                    <option value="recientes">Más recientes</option>
                    <option value="nombre">Nombre</option>
                    <option value="precio">Precio</option>
                    <option value="stock">Menos stock</option>
                </select>
            </div>

            {/* Acciones sobre la selección */}
            {sel.size > 0 && (
                <div className="sticky top-14 lg:top-0 z-30 flex flex-wrap items-center gap-2 bg-primary-dark text-white px-4 py-3 mb-3 animate-fade-in">
                    <span className="text-sm mr-auto">{sel.size} seleccionados</span>
                    <button className="btn btn-light !min-h-[38px]" disabled={ocupado === 'bulk'} onClick={() => bulk(() => onBulk([...sel], { stock: true }))}>Disponible</button>
                    <button className="btn btn-light !min-h-[38px]" disabled={ocupado === 'bulk'} onClick={() => bulk(() => onBulk([...sel], { stock: false }))}>Agotado</button>
                    <button className="btn !min-h-[38px] bg-[#8a1f1f] text-white" disabled={ocupado === 'bulk'}
                        onClick={() => { if (confirm(`¿Eliminar ${sel.size} productos? No se puede deshacer.`)) bulk(() => onDelete([...sel])); }}>Eliminar</button>
                    <button className="text-sm underline underline-offset-4 px-2" onClick={() => setSel(new Set())}>Cancelar</button>
                    {ocupado === 'bulk' && <Spinner />}
                </div>
            )}

            <Panel>
                {loading && !products.length ? (
                    <div className="py-16 flex justify-center text-primary"><Spinner className="w-6 h-6" /></div>
                ) : !lista.length ? (
                    <Empty title="No hay productos con ese filtro" />
                ) : (
                    <>
                        <div className="hidden md:grid grid-cols-[36px_56px_1fr_140px_150px_110px_96px] items-center gap-4 px-5 py-3 border-b border-line eyebrow text-[9.5px] text-muted">
                            <input type="checkbox" checked={todosSel} onChange={() => setSel(todosSel ? new Set() : new Set(visibles.map(p => p.id)))} aria-label="Seleccionar página" className="w-4 h-4 accent-[#5c24b3]" />
                            <span /> <span>Producto</span> <span>Precio</span> <span>Stock</span> <span>Disponible</span> <span />
                        </div>
                        <ul className="divide-y divide-line">
                            {visibles.map(p => {
                                const q = p.quantity ?? 0;
                                const bajo = p.stock && q > 0 && q <= LOW_STOCK;
                                return (
                                    <li key={p.id} className={`grid grid-cols-[28px_56px_1fr] md:grid-cols-[28px_56px_1fr_120px_128px_90px_124px] items-center gap-x-3 md:gap-x-4 gap-y-3 px-4 md:px-5 py-3 ${sel.has(p.id) ? 'bg-primary-light/40' : ''}`}>
                                        <input type="checkbox" checked={sel.has(p.id)} onChange={() => toggleSel(p.id)} aria-label={`Seleccionar ${p.name}`} className="w-4 h-4 accent-[#5c24b3]" />
                                        <button onClick={() => setEditando(p)} className="relative w-14 h-[74px] bg-sand overflow-hidden" aria-label={`Editar ${p.name}`}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            {firstImg(p.image_url) ? <img src={firstImg(p.image_url)} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                                                : <span className="absolute inset-0 flex items-center justify-center text-[10px] text-muted">Sin foto</span>}
                                        </button>
                                        <button onClick={() => setEditando(p)} className="text-left min-w-0">
                                            <span className="block text-[14.5px] text-ink leading-snug line-clamp-2 first-letter:uppercase">{cleanName(p.name)}</span>
                                            <span className="block text-xs text-muted mt-1">{p.category}{p.size ? ` · Talles ${p.size.replace(/^talles?\s*/i, '')}` : ''}</span>
                                            <span className="md:hidden block text-sm font-semibold text-primary-dark mt-1 tabular-nums">{money(p.price)}</span>
                                        </button>
                                        <span className="hidden md:block text-sm tabular-nums">
                                            <span className="font-semibold text-primary-dark">{money(p.price)}</span>
                                            {p.price3 ? <span className="block text-xs text-muted">3+: {money(p.price3)}</span> : null}
                                            {precioRaro(p) && <Badge className="mt-1 bg-[#fff3e0] text-[#8a4b00]">Revisar</Badge>}
                                        </span>
                                        <div className="col-start-2 col-span-2 md:col-start-auto md:col-span-1 flex flex-wrap items-center gap-x-3 gap-y-2 md:contents">
                                            <span className="flex items-center border border-line h-9 bg-white">
                                                <button className="w-9 h-full text-ink hover:text-primary disabled:opacity-40" disabled={ocupado === p.id || q <= 0} onClick={() => quick(p, { quantity: q - 1 })} aria-label="Restar uno">−</button>
                                                <span className={`w-9 text-center text-sm tabular-nums ${bajo ? 'text-[#8a4b00] font-semibold' : ''}`}>{q}</span>
                                                <button className="w-9 h-full text-ink hover:text-primary disabled:opacity-40" disabled={ocupado === p.id} onClick={() => quick(p, { quantity: q + 1 })} aria-label="Sumar uno">+</button>
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <Toggle checked={p.stock} onChange={v => quick(p, { stock: v })} label={`${p.name} disponible`} disabled={ocupado === p.id} />
                                                <span className="md:hidden text-xs text-muted">{p.stock ? 'Disponible' : 'Agotado'}</span>
                                                {ocupado === p.id && <Spinner className="w-3.5 h-3.5 text-primary" />}
                                            </span>
                                            <span className="ml-auto md:ml-0 flex gap-1">
                                                <button onClick={() => setEditando(p)} className="eyebrow text-[9.5px] text-primary px-2 min-h-[36px]">Editar</button>
                                                <button onClick={() => { if (confirm(`¿Eliminar "${cleanName(p.name)}"? No se puede deshacer.`)) { setOcupado(p.id); onDelete([p.id]).finally(() => setOcupado(null)); } }}
                                                    className="eyebrow text-[9.5px] text-muted hover:text-[#8a1f1f] px-2 min-h-[36px]" aria-label={`Eliminar ${p.name}`}>Borrar</button>
                                            </span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </>
                )}
            </Panel>

            {paginas > 1 && (
                <div className="flex items-center justify-between mt-4 text-sm">
                    <span className="text-muted tabular-nums">{lista.length} productos · página {pagina} de {paginas}</span>
                    <div className="flex gap-2">
                        <button className="btn btn-outline !min-h-[40px]" disabled={pagina === 1} onClick={() => { setPagina(pagina - 1); window.scrollTo({ top: 0 }); }}>Anterior</button>
                        <button className="btn btn-outline !min-h-[40px]" disabled={pagina === paginas} onClick={() => { setPagina(pagina + 1); window.scrollTo({ top: 0 }); }}>Siguiente</button>
                    </div>
                </div>
            )}

            {editando && (
                <ProductoEditor
                    producto={editando === 'nuevo' ? null : editando}
                    categorias={categorias}
                    onClose={() => setEditando(null)}
                    onSave={async (data, id) => { await onSave(data, id); setEditando(null); }}
                />
            )}
        </>
    );
}
