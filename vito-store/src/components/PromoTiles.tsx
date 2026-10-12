import Link from 'next/link';
import Reveal from './Reveal';
import { WHATSAPP_URL } from '@/lib/site';

// Dos bloques editoriales grandes (estilo "más para descubrir" de las grandes marcas)
export default function PromoTiles({ image }: { image?: string }) {
    return (
        <section className="px-4 md:px-8 pb-16 md:pb-24" aria-label="Cómo comprar">
            <div className="max-w-[1400px] mx-auto grid md:grid-cols-2 gap-3 md:gap-4">
                <Reveal>
                    <div className="relative min-h-[420px] md:min-h-[520px] h-full overflow-hidden bg-sand flex items-end">
                        {image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={image} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 via-primary-dark/20 to-transparent" />
                        <div className="relative p-7 md:p-10 text-white max-w-md">
                            <p className="eyebrow text-white/80 mb-3">Precio por mayor</p>
                            <h2 className="font-display text-4xl md:text-5xl leading-[1.05]">Armá tu combo</h2>
                            <p className="mt-4 text-[15px] text-white/90 leading-relaxed">
                                Llevando 3, 6 o 12 prendas —podés mezclar modelos— el precio de cada una baja solo en el carrito.
                            </p>
                            <Link href="/#catalogo" className="btn btn-light mt-7">Empezar a elegir</Link>
                        </div>
                    </div>
                </Reveal>

                <Reveal delay={60}>
                    <div className="relative min-h-[420px] md:min-h-[520px] h-full bg-primary-dark text-white flex flex-col justify-between p-7 md:p-10 overflow-hidden">
                        <span className="font-display italic text-[180px] md:text-[240px] leading-none text-white/[0.06] absolute -right-4 -top-8 select-none" aria-hidden>Vitö</span>
                        <p className="eyebrow text-white/70 relative">Atención personalizada</p>
                        <div className="relative max-w-md">
                            <h2 className="font-display text-4xl md:text-5xl leading-[1.05]">¿Dudas con tu talle?</h2>
                            <p className="mt-4 text-[15px] text-white/85 leading-relaxed">
                                Escribinos y te ayudamos a elegir talle y color. También podés pasar por el local en Corrientes Capital.
                            </p>
                            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-light mt-7">Escribinos por WhatsApp</a>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
