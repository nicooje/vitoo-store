'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Spinner, Toggle, inputCls, labelCls, type Product } from './ui';

const CLOUD_NAME = 'dzhz0gz5i';
const UPLOAD_PRESET = 'vitoo_store';

export type ProductoForm = Omit<Product, 'id'>;

async function subirFoto(file: File): Promise<string> {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
    const data = await res.json();
    if (!data.secure_url) throw new Error(`No se pudo subir ${file.name}`);
    return data.secure_url;
}

const numOrUndef = (v: string) => (v.trim() === '' ? undefined : Number(v.replace(/\./g, '').replace(',', '.')));

export default function ProductoEditor({ producto, categorias, onClose, onSave }: {
    producto: Product | null;          // null = producto nuevo
    categorias: string[];
    onClose: () => void;
    onSave: (data: ProductoForm, id?: number) => Promise<void>;
}) {
    const [f, setF] = useState({
        name: producto?.name ?? '',
        category: producto?.category ?? 'Conjuntos',
        description: producto?.description ?? '',
        price: producto?.price ? String(producto.price) : '',
        price3: producto?.price3 ? String(Math.round(producto.price3)) : '',
        price6: producto?.price6 ? String(Math.round(producto.price6)) : '',
        price12: producto?.price12 ? String(Math.round(producto.price12)) : '',
        size: producto?.size ?? '',
        color: producto?.color ?? '',
        quantity: String(producto?.quantity ?? 10),
        stock: producto?.stock ?? true,
    });
    const [fotos, setFotos] = useState<string[]>(() => (producto?.image_url || '').split(',').map(s => s.trim()).filter(Boolean));
    const [nuevas, setNuevas] = useState<File[]>([]);
    const [guardando, setGuardando] = useState('');
    const previews = useMemo(() => nuevas.map(f => URL.createObjectURL(f)), [nuevas]);
    useEffect(() => () => previews.forEach(u => URL.revokeObjectURL(u)), [previews]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !guardando) onClose(); };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
    }, [onClose, guardando]);

    const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
    const precio = numOrUndef(f.price) || 0;
    const avisoMayor = [f.price3, f.price6, f.price12].some(v => v && precio && Number(numOrUndef(v)) > precio);

    const guardar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!f.name.trim()) return toast.error('Poné un nombre');
        if (!precio) return toast.error('Poné el precio por unidad');
        if (!fotos.length && !nuevas.length) return toast.error('Agregá al menos una foto');
        try {
            const urls = [...fotos];
            for (let i = 0; i < nuevas.length; i++) {
                setGuardando(`Subiendo foto ${i + 1} de ${nuevas.length}...`);
                urls.push(await subirFoto(nuevas[i]));
            }
            setGuardando('Guardando...');
            await onSave({
                name: f.name.trim(), category: f.category.trim() || 'Varios', description: f.description.trim() || undefined,
                price: precio, price3: numOrUndef(f.price3), price6: numOrUndef(f.price6), price12: numOrUndef(f.price12),
                price9: producto?.price9, size: f.size.trim(), color: f.color.trim(),
                quantity: parseInt(f.quantity) || 0, stock: f.stock, image_url: urls.slice(0, 10).join(','),
            }, producto?.id);
        } catch (err: any) {
            toast.error(err.message || 'No se pudo guardar');
        } finally {
            setGuardando('');
        }
    };

    const mover = (i: number) => setFotos(prev => [prev[i], ...prev.filter((_, j) => j !== i)]);

    return (
        <div className="fixed inset-0 z-[70] flex justify-end bg-primary-dark/40 animate-fade-in" onClick={() => !guardando && onClose()}>
            <form
                onSubmit={guardar}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-[560px] h-[100dvh] bg-white flex flex-col animate-slide-up md:animate-none"
                role="dialog" aria-modal="true" aria-labelledby="editor-titulo"
            >
                <div className="flex items-center justify-between px-5 md:px-6 h-16 border-b border-line shrink-0">
                    <h2 id="editor-titulo" className="font-display text-2xl text-primary-dark">{producto ? 'Editar producto' : 'Nuevo producto'}</h2>
                    <button type="button" onClick={onClose} disabled={!!guardando} className="min-h-[44px] min-w-[44px] text-ink hover:text-primary" aria-label="Cerrar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 mx-auto"><path d="M6 6l12 12M18 6 6 18" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 md:px-6 py-6 flex flex-col gap-7">
                    {/* Fotos */}
                    <div>
                        <p className={labelCls}>Fotos <span className="normal-case tracking-normal text-muted">(la primera es la portada)</span></p>
                        <div className="grid grid-cols-4 gap-2">
                            {fotos.map((u, i) => (
                                <div key={u + i} className="relative aspect-[3/4] bg-sand group">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={u} alt="" className="absolute inset-0 w-full h-full object-cover" />
                                    {i === 0 && <span className="absolute bottom-1 left-1 bg-white eyebrow text-[8.5px] px-1.5 py-0.5 text-primary-dark">Portada</span>}
                                    <div className="absolute top-1 right-1 flex flex-col gap-1">
                                        <button type="button" onClick={() => setFotos(fotos.filter((_, j) => j !== i))} className="h-7 w-7 bg-white/95 text-ink hover:text-[#8a1f1f] flex items-center justify-center" aria-label="Quitar foto">×</button>
                                        {i > 0 && <button type="button" onClick={() => mover(i)} className="h-7 w-7 bg-white/95 text-ink hover:text-primary flex items-center justify-center text-xs" aria-label="Usar de portada" title="Usar de portada">★</button>}
                                    </div>
                                </div>
                            ))}
                            {previews.map((u, i) => (
                                <div key={u} className="relative aspect-[3/4] bg-sand">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={u} alt="" className="absolute inset-0 w-full h-full object-cover opacity-90" />
                                    <span className="absolute bottom-1 left-1 bg-primary text-white eyebrow text-[8.5px] px-1.5 py-0.5">Nueva</span>
                                    <button type="button" onClick={() => setNuevas(nuevas.filter((_, j) => j !== i))} className="absolute top-1 right-1 h-7 w-7 bg-white/95 text-ink flex items-center justify-center" aria-label="Quitar foto nueva">×</button>
                                </div>
                            ))}
                            <label className="aspect-[3/4] border border-dashed border-ink/25 hover:border-primary flex flex-col items-center justify-center gap-1 text-muted hover:text-primary cursor-pointer transition-colors">
                                <span className="text-2xl leading-none">+</span>
                                <span className="text-[11px]">Agregar</span>
                                <input type="file" accept="image/*" multiple className="sr-only" onChange={e => { setNuevas([...nuevas, ...Array.from(e.target.files || [])]); e.target.value = ''; }} />
                            </label>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <label><span className={labelCls}>Nombre</span><input className={inputCls} value={f.name} onChange={set('name')} placeholder="Conjunto de algodón c/aro y push up" required /></label>
                        <div className="grid grid-cols-2 gap-3">
                            <label><span className={labelCls}>Categoría</span>
                                <input className={inputCls} list="categorias-admin" value={f.category} onChange={set('category')} />
                                <datalist id="categorias-admin">{categorias.map(c => <option key={c} value={c} />)}</datalist>
                            </label>
                            <label><span className={labelCls}>Talles</span><input className={inputCls} value={f.size} onChange={set('size')} placeholder="85 al 100" /></label>
                        </div>
                        <label><span className={labelCls}>Descripción</span><textarea className={`${inputCls} min-h-[96px]`} value={f.description} onChange={set('description')} placeholder="Opcional" /></label>
                    </div>

                    <div>
                        <p className={labelCls}>Precios <span className="normal-case tracking-normal text-muted">(por unidad)</span></p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <label><span className="text-xs text-muted">Por menor</span><input className={inputCls} inputMode="numeric" value={f.price} onChange={set('price')} placeholder="7000" required /></label>
                            <label><span className="text-xs text-muted">Llevando 3+</span><input className={inputCls} inputMode="numeric" value={f.price3} onChange={set('price3')} placeholder="6500" /></label>
                            <label><span className="text-xs text-muted">Llevando 6+</span><input className={inputCls} inputMode="numeric" value={f.price6} onChange={set('price6')} placeholder="6000" /></label>
                            <label><span className="text-xs text-muted">Docena</span><input className={inputCls} inputMode="numeric" value={f.price12} onChange={set('price12')} placeholder="5000" /></label>
                        </div>
                        {avisoMayor && <p className="mt-2 text-xs text-[#8a4b00]">Algún precio por mayor es más alto que el de por menor. Si pusiste el total del pack (ej. 3x$19.500), la web lo divide sola, pero conviene cargar el precio por unidad.</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3 items-end">
                        <label><span className={labelCls}>Cantidad en stock</span><input className={inputCls} inputMode="numeric" value={f.quantity} onChange={set('quantity')} /></label>
                        <div className="flex items-center justify-between gap-3 border border-line px-3 min-h-[44px]">
                            <span className="text-sm text-ink">{f.stock ? 'Disponible' : 'Agotado'}</span>
                            <Toggle checked={f.stock} onChange={v => setF({ ...f, stock: v })} label="Disponible para la venta" />
                        </div>
                    </div>
                    <label><span className={labelCls}>Colores <span className="normal-case tracking-normal text-muted">(opcional, separados por coma)</span></span><input className={inputCls} value={f.color} onChange={set('color')} placeholder="Negro, Blanco, Rosa" /></label>
                </div>

                <div className="px-5 md:px-6 py-4 border-t border-line flex gap-2 shrink-0 bg-white">
                    <button type="button" onClick={onClose} className="btn btn-outline" disabled={!!guardando}>Cancelar</button>
                    <button type="submit" className="btn btn-primary flex-1" disabled={!!guardando}>
                        {guardando ? <><Spinner /> {guardando}</> : producto ? 'Guardar cambios' : 'Publicar producto'}
                    </button>
                </div>
            </form>
        </div>
    );
}
