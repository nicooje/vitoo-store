'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import WhatsAppImporter from './WhatsAppImporter';
import { Badge, Panel, SectionHeader, Spinner, fechaHora, haceCuanto, money } from './ui';
import type { BotEstado } from '@/lib/botControl';

/** Estado del bot de la PC, consultado más seguido mientras hay algo en marcha. */
export function useBot() {
    const [bot, setBot] = useState<BotEstado | null>(null);
    const [error, setError] = useState('');
    const [enviando, setEnviando] = useState(false);

    const cargar = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/bot', { cache: 'no-store' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error');
            setBot(data); setError('');
        } catch (e: any) { setError(e.message); }
    }, []);

    const activo = Boolean(bot && (bot.pendiente || bot.estado === 'en_curso'));
    useEffect(() => {
        cargar();
        const t = setInterval(cargar, activo ? 3000 : 30000);
        return () => clearInterval(t);
    }, [cargar, activo]);

    const pedir = async (modo: 'aplicar' | 'simular') => {
        setEnviando(true);
        try {
            const res = await fetch('/api/admin/bot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ modo }) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error');
            toast.success(modo === 'simular' ? 'Vista previa pedida' : 'Actualización pedida');
            await cargar();
        } catch (e: any) { toast.error(e.message); }
        finally { setEnviando(false); }
    };

    return { bot, error, enviando, activo, pedir, cargar };
}

type Bot = ReturnType<typeof useBot>;

export function BotStatusChip({ bot }: { bot: BotEstado | null }) {
    if (!bot) return <Badge className="bg-sand text-muted">Consultando...</Badge>;
    if (bot.estado === 'en_curso') return <Badge className="bg-primary-light text-primary"><Spinner className="w-3 h-3 mr-1.5" />Actualizando</Badge>;
    if (bot.pcConectada) return <Badge className="bg-[#e6f4ea] text-[#1e6b3b]"><span className="w-1.5 h-1.5 rounded-full bg-[#1e6b3b] mr-1.5" />PC conectada</Badge>;
    if (bot.latido) return <Badge className="bg-sand text-muted">PC apagada · {haceCuanto(Date.parse(bot.latido))}</Badge>;
    return <Badge className="bg-sand text-muted">Agente sin instalar</Badge>;
}

/** Tarjeta con el botón: se usa en Resumen (compacta) y en la sección WhatsApp. */
export function BotCard({ b, compacta = false, onVerMas }: { b: Bot; compacta?: boolean; onVerMas?: () => void }) {
    const { bot, enviando, activo, pedir, error } = b;
    const r = bot?.resultado;
    const enCola = Boolean(bot?.pendiente && bot?.estado !== 'en_curso');
    const ultimaFin = bot?.fin ? Date.parse(bot.fin) : 0;

    return (
        <Panel title="Actualizar desde el grupo de WhatsApp" action={<BotStatusChip bot={bot} />}>
            <div className="p-5 flex flex-col gap-5">
                {error && <p className="text-sm text-[#8a1f1f]">No se pudo consultar el estado: {error}</p>}

                {bot?.codigo ? (
                    <div className="border border-primary bg-primary-light/50 p-5 text-center">
                        <p className="eyebrow text-[10px] text-primary mb-3">Vinculá el bot con tu WhatsApp</p>
                        <p className="font-display text-4xl md:text-5xl tracking-[0.12em] text-primary-dark tabular-nums">{bot.codigo}</p>
                        <p className="mt-3 text-sm text-ink/80 max-w-sm mx-auto">
                            En tu celular: WhatsApp → Dispositivos vinculados → Vincular un dispositivo → <b>Vincular con el número de teléfono</b> e ingresá este código.
                        </p>
                    </div>
                ) : activo ? (
                    <div className="flex items-start gap-3 bg-primary-light/50 px-4 py-3">
                        <Spinner className="w-4 h-4 mt-0.5 text-primary" />
                        <div className="text-sm text-primary-dark">
                            {enCola ? (
                                bot?.pcConectada
                                    ? 'Pedido enviado. Tu PC lo toma en unos segundos...'
                                    : !bot?.latido
                                        ? <>Quedó <b>en cola</b>, pero el agente todavía no está instalado en tu PC. En la carpeta VitoStoreWeb hacé doble clic en <b>&ldquo;Instalar agente (boton del panel).bat&rdquo;</b> y el pedido arranca solo.</>
                                        : <>Quedó <b>en cola</b>. Tu PC parece apagada: se hace apenas la prendas.</>
                            ) : (bot?.detalle || 'Trabajando...')}
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-ink/80 leading-relaxed">
                        Lee las publicaciones nuevas del grupo y las pasa al catálogo: agrega lo nuevo, actualiza precios de lo que ya está y <b>nunca duplica</b>.
                        {!compacta && ' La vista previa muestra qué haría, sin tocar la web.'}
                    </p>
                )}

                <div className="flex flex-wrap gap-2">
                    <button className="btn btn-primary" onClick={() => pedir('aplicar')} disabled={enviando || activo || !bot}>
                        {enviando ? <Spinner /> : null} Actualizar ahora
                    </button>
                    {!compacta && (
                        <button className="btn btn-outline" onClick={() => pedir('simular')} disabled={enviando || activo || !bot}>Vista previa</button>
                    )}
                    {compacta && onVerMas && <button className="btn btn-outline" onClick={onVerMas}>Ver detalle</button>}
                </div>

                {r && !activo && (
                    <div className={`border-t border-line pt-4 text-sm ${compacta ? '' : ''}`}>
                        <p className="text-muted mb-2">
                            Última {r.simular ? 'vista previa' : 'actualización'}: {fechaHora(ultimaFin || Date.parse(r.fecha))}
                        </p>
                        {r.error ? (
                            <p className="text-[#8a1f1f]">{r.error}</p>
                        ) : (
                            <p className="text-ink">
                                <b>{r.nuevos.filter(n => !n.fallo).length}</b> {r.simular ? 'para agregar' : 'agregados'} · <b>{r.actualizados.length}</b> {r.simular ? 'para actualizar' : 'actualizados'}
                                {r.revisar.length > 0 && <> · <b className="text-[#8a4b00]">{r.revisar.length}</b> para revisar</>}
                                <span className="text-muted"> · {r.mensajes} mensajes leídos</span>
                            </p>
                        )}
                    </div>
                )}
            </div>
        </Panel>
    );
}

function Lista({ titulo, items, vacio }: { titulo: string; items: React.ReactNode[]; vacio: string }) {
    return (
        <div>
            <p className="eyebrow text-[10px] text-ink mb-2">{titulo} <span className="text-muted">({items.length})</span></p>
            {items.length ? <ul className="divide-y divide-line border-y border-line">{items.map((it, i) => <li key={i} className="py-2.5 text-sm">{it}</li>)}</ul>
                : <p className="text-sm text-muted">{vacio}</p>}
        </div>
    );
}

export default function WhatsAppSection({ b, onImportado }: { b: Bot; onImportado: () => void }) {
    const r = b.bot?.resultado;
    return (
        <>
            <SectionHeader eyebrow="Catálogo automático" title="WhatsApp" />
            <div className="grid lg:grid-cols-5 gap-4 md:gap-6">
                <div className="lg:col-span-3 flex flex-col gap-4 md:gap-6">
                    <BotCard b={b} />

                    {r && !r.error && (
                        <Panel title={r.simular ? 'Detalle de la vista previa' : 'Detalle de la última actualización'}>
                            <div className="p-5 grid gap-6">
                                <Lista titulo={r.simular ? 'Para agregar' : 'Agregados'} vacio="Nada nuevo."
                                    items={r.nuevos.map(n => <span className="flex justify-between gap-4"><span>{n.nombre}{n.fallo && <span className="text-[#8a1f1f]"> · falló, se reintenta</span>}</span><span className="text-muted tabular-nums shrink-0">{money(n.precio)} · {n.fotos} fotos</span></span>)} />
                                <Lista titulo={r.simular ? 'Para actualizar (ya estaban)' : 'Actualizados (ya estaban)'} vacio="Ninguno."
                                    items={r.actualizados.map(u => <span className="flex justify-between gap-4"><span>{u.nombre}</span><span className="text-muted tabular-nums shrink-0">{money(u.precio)}</span></span>)} />
                                {r.revisar.length > 0 && (
                                    <Lista titulo="Para revisar a mano" vacio=""
                                        items={r.revisar.map(x => <span>&ldquo;{x.nombre}&rdquo; se parece a &ldquo;{x.parecido}&rdquo; ({Math.round(x.score * 100)}%). No se tocó.</span>)} />
                                )}
                                {r.sinFoto.length > 0 && (
                                    <Lista titulo="Publicaciones sin foto (no se suben)" vacio="" items={r.sinFoto.map(n => <span>{n}</span>)} />
                                )}
                            </div>
                        </Panel>
                    )}
                </div>

                <div className="lg:col-span-2 flex flex-col gap-4 md:gap-6">
                    <Panel title="Cómo funciona">
                        <ol className="p-5 flex flex-col gap-4 text-sm text-ink/85 leading-relaxed list-decimal list-inside marker:text-primary marker:font-semibold">
                            <li>En tu PC, doble clic una sola vez en <b>&ldquo;Instalar agente (boton del panel).bat&rdquo;</b> (carpeta VitoStoreWeb). Queda andando solo cada vez que prendés la compu.</li>
                            <li>Desde acá (también desde el celu) apretá <b>Actualizar ahora</b>. Tu PC lee el grupo y actualiza el catálogo en 1 o 2 minutos.</li>
                            <li>La primera vez vas a ver un código para vincular el bot con tu WhatsApp.</li>
                        </ol>
                        <p className="px-5 pb-5 text-xs text-muted">Sin la PC prendida, el pedido queda en cola. También podés usar &ldquo;Actualizar Vito Store.bat&rdquo; directamente en la PC.</p>
                    </Panel>

                    <Panel title="Importar un chat exportado (ZIP)">
                        <div className="p-5">
                            <p className="text-sm text-ink/80 mb-4">Alternativa manual: en WhatsApp, Exportar chat → Incluir archivos, y subí el ZIP.</p>
                            <WhatsAppImporter onDone={onImportado} />
                        </div>
                    </Panel>
                </div>
            </div>
        </>
    );
}
