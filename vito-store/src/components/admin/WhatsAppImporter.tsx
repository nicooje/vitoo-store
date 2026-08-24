'use client';

import { useState, useRef } from 'react';
import JSZip from 'jszip';
import toast from 'react-hot-toast';
import { parseChatText, buildImportPlan, sanitizeLegacyPack, type ChatProduct, type SheetRow, type ImportPlan } from '@/lib/whatsappChat';

const CLOUD_NAME = 'dzhz0gz5i';
const UPLOAD_PRESET = 'vitoo_store';

type Phase = 'idle' | 'parsing' | 'review' | 'applying' | 'done';

export default function WhatsAppImporter({ onDone }: { onDone: () => void }) {
    const [phase, setPhase] = useState<Phase>('idle');
    const [fileName, setFileName] = useState('');
    const [plan, setPlan] = useState<ImportPlan | null>(null);
    const [selUpdates, setSelUpdates] = useState<Set<number>>(new Set());
    const [selAppends, setSelAppends] = useState<Set<string>>(new Set());
    const [selNoImages, setSelNoImages] = useState<Set<string>>(new Set());
    const [selDupes, setSelDupes] = useState<Set<number>>(new Set());
    const [progress, setProgress] = useState<{ label: string; pct: number } | null>(null);
    const [result, setResult] = useState<{ updated: number; cleared: number; appended: number } | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const reset = () => {
        setPhase('idle'); setPlan(null); setFileName(''); setResult(null); setProgress(null);
        setSelUpdates(new Set()); setSelAppends(new Set()); setSelNoImages(new Set()); setSelDupes(new Set());
        if (fileRef.current) fileRef.current.value = '';
    };

    const handleZip = async (file: File) => {
        setPhase('parsing');
        setFileName(file.name);
        try {
            setProgress({ label: 'Leyendo ZIP...', pct: 10 });
            const zip = await JSZip.loadAsync(file);

            // el export trae un .txt con el historial (elegimos el mas grande)
            const txts = Object.values(zip.files).filter(f => !f.dir && /\.txt$/i.test(f.name));
            if (!txts.length) throw new Error('El ZIP no contiene ningún archivo .txt de conversación');
            let txtEntry = txts[0]; let txtSize = 0;
            for (const t of txts) {
                const content = await t.async('uint8array');
                if (content.length > txtSize) { txtSize = content.length; txtEntry = t; }
            }

            setProgress({ label: 'Analizando mensajes...', pct: 30 });
            const rawText = await txtEntry.async('string');

            // imagenes del export indexadas por nombre de archivo
            const imageFiles = new Map<string, Blob>();
            for (const f of Object.values(zip.files)) {
                if (!f.dir && /\.(jpe?g|png|webp)$/i.test(f.name)) {
                    const base = f.name.split('/').pop()!;
                    imageFiles.set(base, await f.async('blob'));
                }
            }

            const chatProducts = parseChatText(rawText);
            if (!chatProducts.length) throw new Error('No se detectaron productos publicados por Vito Store en el chat');

            setProgress({ label: 'Comparando con el catálogo actual...', pct: 55 });
            const res = await fetch('/api/admin/products?format=raw');
            if (!res.ok) throw new Error('No se pudieron leer las filas actuales del sheet');
            const { rows }: { rows: { rowNumber: number; cells: string[] }[] } = await res.json();
            const sheetRows: SheetRow[] = rows.map(r => ({
                rowNumber: r.rowNumber,
                id: r.cells[0] || '',
                name: r.cells[1] || '',
                category: r.cells[2] || '',
                price: r.cells[3] || '',
                image_url: r.cells[4] || '',
                stock: r.cells[5] || '',
                size: r.cells[6] || '',
                color: r.cells[7] || '',
                quantity: r.cells[8] || '',
                p3: r.cells[9],
                p6: r.cells[10],
                p9: r.cells[11],
                p12: r.cells[12],
                desc: r.cells[13] || '',
            }));

            const built = buildImportPlan(chatProducts, sheetRows);
            if (!built.updates.length && !built.appends.length && !built.dupes.length) {
                toast.success('Todo el catálogo ya está al día, no hay novedades.');
            }
            setPlan(built);
            setSelUpdates(new Set(built.updates.map(u => u.sheet.rowNumber)));
            setSelAppends(new Set(built.appends.map(p => p.key)));
            setSelNoImages(new Set());
            setSelDupes(new Set(built.dupes.map(d => d.rowNumber)));
            setProgress(null);
            setPhase('review');
        } catch (e: any) {
            console.error(e);
            toast.error(e.message || 'Error procesando el ZIP');
            reset();
        }
    };

    const uploadToCloudinary = async (blob: Blob, name: string): Promise<string> => {
        const formData = new FormData();
        formData.append('file', blob);
        formData.append('upload_preset', UPLOAD_PRESET);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
        const data = await res.json();
        if (!data.secure_url) throw new Error(`No se pudo subir la foto ${name} a Cloudinary`);
        return data.secure_url as string;
    };

    const applyPlan = async () => {
        if (!plan) return;
        setPhase('applying');
        try {
            const chosenAppends = plan.appends.filter(p => selAppends.has(p.key));
            const chosenNoImages = plan.noImages.filter(p => selNoImages.has(p.key));

            // 1) subir fotos de los nuevos a Cloudinary
            const imageUrlByKey = new Map<string, string[]>();
            const pendingFiles: { key: string; file: string }[] = [];
            for (const p of chosenAppends) {
                imageUrlByKey.set(p.key, []);
                for (const f of p.images.slice(0, 10)) pendingFiles.push({ key: p.key, file: f });
            }
            const zipBlobs = new Map<string, Blob>();
            if (pendingFiles.length) {
                const currentZip = fileRef.current?.files?.[0];
                if (!currentZip) throw new Error('El ZIP ya no está disponible, volvé a cargarlo');
                const zip = await JSZip.loadAsync(currentZip);
                for (const f of Object.values(zip.files)) {
                    if (!f.dir && /\.(jpe?g|png|webp)$/i.test(f.name)) {
                        zipBlobs.set(f.name.split('/').pop()!, await f.async('blob'));
                    }
                }
                let done = 0;
                for (const pf of pendingFiles) {
                    done++;
                    setProgress({ label: `Subiendo fotos a la nube (${done}/${pendingFiles.length})...`, pct: Math.round((done / pendingFiles.length) * 70) });
                    const blob = zipBlobs.get(pf.file);
                    if (!blob) continue; // imagen omitida en el export
                    const url = await uploadToCloudinary(blob, pf.file);
                    imageUrlByKey.get(pf.key)!.push(url);
                }
            }

            // 2) armar filas finales (misma logica que el script CLI)
            setProgress({ label: 'Escribiendo en Google Sheets...', pct: 85 });
            const updatePayload = plan.updates.filter(u => selUpdates.has(u.sheet.rowNumber)).map(u => {
                const s = u.sheet, np = u.chat.priceSet;
                return {
                    rowNumber: s.rowNumber,
                    cells: [
                        s.id, s.name, s.category,
                        np[1] != null ? String(np[1]) : sanitizeLegacyPack(s.price),
                        s.image_url, 'SI',
                        s.size || u.chat.sizes || '', s.color || '',
                        s.quantity || '10',
                        np[3] != null ? String(np[3]) : sanitizeLegacyPack(s.p3),
                        np[6] != null ? String(np[6]) : sanitizeLegacyPack(s.p6),
                        s.p9 || '',
                        np[12] != null ? String(np[12]) : sanitizeLegacyPack(s.p12),
                        s.desc || u.chat.description || '',
                    ],
                };
            });

            let i = 0;
            const appendPayload = [...chosenAppends, ...chosenNoImages].map(p => {
                const urls = imageUrlByKey.get(p.key) || [];
                return {
                    cells: [
                        String(Date.now() + i++), p.name, p.category, String(p.priceSet[1] ?? ''),
                        urls.join(','), 'SI',
                        p.sizes || '', '', '10',
                        p.priceSet[3] != null ? String(p.priceSet[3]) : '',
                        p.priceSet[6] != null ? String(p.priceSet[6]) : '',
                        '',
                        p.priceSet[12] != null ? String(p.priceSet[12]) : '',
                        p.description,
                    ],
                };
            });

            const res = await fetch('/api/admin/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    updates: updatePayload,
                    clears: plan.dupes.filter(d => selDupes.has(d.rowNumber)).map(d => d.rowNumber),
                    appends: appendPayload,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error aplicando la importación');

            setProgress(null);
            setResult({ updated: data.updated, cleared: data.cleared, appended: data.appended });
            setPhase('done');
            onDone();
        } catch (e: any) {
            console.error(e);
            toast.error(e.message || 'Error aplicando la importación');
            setPhase('review');
            setProgress(null);
        }
    };

    const toggle = (set: Set<number | string>, id: number | string, setter: (s: Set<number | string>) => void) => {
        const next = new Set(set);
        if (next.has(id)) next.delete(id); else next.add(id);
        setter(next);
    };

    const totalSel = selUpdates.size + selAppends.size + selNoImages.size;

    return (
        <div className="space-y-6">
            {/* Zona de carga */}
            {phase === 'idle' && (
                <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-pink-200 bg-white rounded-2xl p-10 text-center cursor-pointer hover:border-pink-400 hover:bg-pink-50/50 transition-all"
                >
                    <input ref={fileRef} type="file" accept=".zip,application/zip" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleZip(f); }} />
                    <div className="text-5xl mb-4">📲</div>
                    <h3 className="text-lg font-black text-gray-900">Arrastrá o hacé clic para subir el .zip del grupo</h3>
                    <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
                        Exportá el chat de WhatsApp ("Exportar chat → Sin archivos multimedia" no sirve: necesitás el ZIP <b>con</b> archivos) y subilo acá.
                        Detectamos productos nuevos, cambios de precio y republicaciones automáticamente.
                    </p>
                </div>
            )}

            {phase === 'parsing' && (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                    <div className="animate-spin h-10 w-10 mx-auto text-pink-500 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                    </div>
                    <p className="font-bold text-gray-900">{progress?.label || `Procesando ${fileName}...`}</p>
                </div>
            )}

            {/* Revisión */}
            {(phase === 'review' || phase === 'applying') && plan && (
                <div className="space-y-5">
                    {/* Resumen */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <SummaryCard icon="✨" value={plan.appends.length} label="Nuevos" color="text-emerald-600 bg-emerald-50 border-emerald-100" />
                        <SummaryCard icon="🔄" value={plan.updates.length} label="Actualizar" color="text-blue-600 bg-blue-50 border-blue-100" />
                        <SummaryCard icon="⚠️" value={plan.noImages.length} label="Sin foto" color="text-amber-600 bg-amber-50 border-amber-100" />
                        <SummaryCard icon="🧹" value={plan.dupes.length} label="Duplicados" color="text-red-600 bg-red-50 border-red-100" />
                    </div>

                    {plan.updates.length > 0 && (
                        <Section title={`🔄 Actualizar precios (${selUpdates.size}/${plan.updates.length})`} defaultOpen>
                            <div className="divide-y divide-gray-100">
                                {plan.updates.map((u, idx) => (
                                    <label key={u.sheet.rowNumber} className="flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer">
                                        <input type="checkbox" className="mt-1 w-4 h-4 accent-pink-600"
                                            checked={selUpdates.has(u.sheet.rowNumber)}
                                            onChange={() => toggle(selUpdates, u.sheet.rowNumber, setSelUpdates as any)} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-bold text-gray-900 text-sm">{u.chat.name}</span>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">fila {u.sheet.rowNumber}</span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.score >= 0.95 ? 'bg-blue-50 text-blue-500' : 'bg-amber-100 text-amber-700'}`}>
                                                    coincidencia {Math.round(u.score * 100)}%{u.score < 0.95 ? ' ← REVISAR' : ''}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 grid sm:grid-cols-2 gap-x-4">
                                                <span>Web: “{u.sheet.name}” · ${sanitizeLegacyPack(u.sheet.price) || '?'} · packs {sanitizeLegacyPack(u.sheet.p3) || '-'}/{sanitizeLegacyPack(u.sheet.p6) || '-'}/{sanitizeLegacyPack(u.sheet.p12) || '-'}</span>
                                                <span>Chat: ${u.chat.priceSet[1] ?? '?'} · packs {u.chat.priceSet[3] ?? '-'}/{u.chat.priceSet[6] ?? '-'}/{u.chat.priceSet[12] ?? '-'}</span>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </Section>
                    )}

                    {plan.appends.length > 0 && (
                        <Section title={`✨ Productos nuevos (${selAppends.size}/${plan.appends.length})`} defaultOpen>
                            <div className="divide-y divide-gray-100">
                                {plan.appends.map(p => (
                                    <label key={p.key} className="flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer">
                                        <input type="checkbox" className="mt-1 w-4 h-4 accent-pink-600"
                                            checked={selAppends.has(p.key)}
                                            onChange={() => toggle(selAppends, p.key, setSelAppends as any)} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-bold text-gray-900 text-sm">{p.name}</span>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-600">{p.category}</span>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{p.images.length} fotos</span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                ${p.priceSet[1] ?? '?'} · packs {p.priceSet[3] ?? '-'}/{p.priceSet[6] ?? '-'}/{p.priceSet[12] ?? '-'}{p.sizes ? ` · talles: ${p.sizes}` : ''} · {p.date}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </Section>
                    )}

                    {plan.noImages.length > 0 && (
                        <Section title={`⚠️ Publicaciones sin foto en el export (${selNoImages.size}/${plan.noImages.length})`}>
                            <p className="text-xs text-gray-500 px-4 pt-3">Estas se publicaron sin imágenes descargables. Podés agregarlas igual (quedarán sin foto hasta que les cargues una).</p>
                            <div className="divide-y divide-gray-100">
                                {plan.noImages.map(p => (
                                    <label key={p.key} className="flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer">
                                        <input type="checkbox" className="mt-1 w-4 h-4 accent-pink-600"
                                            checked={selNoImages.has(p.key)}
                                            onChange={() => toggle(selNoImages, p.key, setSelNoImages as any)} />
                                        <div className="flex-1 min-w-0">
                                            <span className="font-bold text-gray-900 text-sm">{p.name}</span>
                                            <div className="text-xs text-gray-500 mt-0.5">${p.priceSet[1] ?? '?'} · packs {p.priceSet[3] ?? '-'}/{p.priceSet[6] ?? '-'}/{p.priceSet[12] ?? '-'} · {p.category}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </Section>
                    )}

                    {plan.dupes.length > 0 && (
                        <Section title={`🧹 Duplicados dentro del catálogo (${selDupes.size}/${plan.dupes.length})`}>
                            <p className="text-xs text-gray-500 px-4 pt-3">Filas repetidas que se van a vaciar (queda la más antigua).</p>
                            <div className="divide-y divide-gray-100">
                                {plan.dupes.map(d => (
                                    <label key={d.rowNumber} className="flex items-center gap-3 p-3 px-4 hover:bg-gray-50 cursor-pointer text-sm">
                                        <input type="checkbox" className="w-4 h-4 accent-pink-600"
                                            checked={selDupes.has(d.rowNumber)}
                                            onChange={() => toggle(selDupes, d.rowNumber, setSelDupes as any)} />
                                        <span className="text-gray-700">fila {d.rowNumber}: {d.name} (${sanitizeLegacyPack(d.price)})</span>
                                    </label>
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* Barra de acción */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-6 px-6 flex items-center justify-between gap-4 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] rounded-t-xl">
                        <button onClick={reset} disabled={phase === 'applying'}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50">
                            Cancelar
                        </button>
                        <div className="flex items-center gap-4">
                            {phase === 'applying' && progress && (
                                <div className="hidden sm:block w-48">
                                    <div className="text-[11px] font-bold text-gray-500 mb-1 truncate">{progress.label}</div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-pink-500 rounded-full transition-all" style={{ width: `${progress.pct}%` }} />
                                    </div>
                                </div>
                            )}
                            <button onClick={applyPlan} disabled={phase === 'applying' || totalSel === 0}
                                className={`px-7 py-3 rounded-xl font-black text-white text-sm transition-all min-w-[220px] ${
                                    phase === 'applying' || totalSel === 0
                                        ? 'bg-pink-300 cursor-not-allowed'
                                        : 'bg-pink-600 hover:bg-pink-700 shadow-lg shadow-pink-600/20 hover:-translate-y-0.5'
                                }`}>
                                {phase === 'applying' ? 'Aplicando...' : `Aplicar ${totalSel} cambio${totalSel === 1 ? '' : 's'}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Resultado */}
            {phase === 'done' && result && (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                    <div className="text-5xl mb-4">🎉</div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">Importación completada</h3>
                    <p className="text-gray-600">
                        {result.updated} actualizados · {result.appended} agregados · {result.cleared} duplicados vaciados
                    </p>
                    <button onClick={reset} className="mt-6 px-6 py-3 rounded-xl bg-pink-600 text-white font-bold text-sm hover:bg-pink-700">
                        Importar otro ZIP
                    </button>
                </div>
            )}
        </div>
    );
}

function SummaryCard({ icon, value, label, color }: { icon: string; value: number; label: string; color: string }) {
    return (
        <div className={`rounded-2xl border p-4 flex items-center gap-3 ${color}`}>
            <span className="text-2xl">{icon}</span>
            <div>
                <div className="text-2xl font-black leading-none">{value}</div>
                <div className="text-xs font-bold uppercase tracking-wide opacity-80">{label}</div>
            </div>
        </div>
    );
}

function Section({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50">
                <span className="font-black text-gray-900 text-sm">{title}</span>
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"
                    className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            </button>
            {open && children}
        </div>
    );
}
