import Image from 'next/image';
import Link from 'next/link';
import { IconInstagram, IconPin, IconWhatsApp } from './icons';
import { ADDRESS, INSTAGRAM_URL, MAPS_URL, NAV_CATEGORIES, WHATSAPP_URL, categoryHref } from '@/lib/site';

export default function Footer() {
    return (
        <footer className="bg-primary-light text-ink">
            <div className="max-w-[1400px] mx-auto px-5 md:px-8 pt-16 md:pt-20 pb-24 md:pb-10">
                <div className="grid grid-cols-2 md:grid-cols-12 gap-x-6 gap-y-12">
                    {/* Marca */}
                    <div className="col-span-2 md:col-span-4">
                        <Link href="/" className="inline-flex items-center gap-3">
                            <Image src="/vito-logo.png" alt="" width={52} height={52} className="rounded-full" />
                            <span className="font-display text-3xl text-primary-dark">Vitö <span className="italic text-primary">Store</span></span>
                        </Link>
                        <p className="mt-5 text-[15px] leading-relaxed text-ink/80 max-w-xs">
                            Lencería, bombachas, tops y pijamas pensados para que te sientas cómoda y linda todos los días.
                        </p>
                        <div className="mt-6 flex gap-2">
                            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="h-11 w-11 border border-primary-dark/20 flex items-center justify-center text-primary-dark hover:bg-primary-dark hover:text-white transition-colors">
                                <IconInstagram className="w-5 h-5" />
                            </a>
                            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="h-11 w-11 border border-primary-dark/20 flex items-center justify-center text-primary-dark hover:bg-primary-dark hover:text-white transition-colors">
                                <IconWhatsApp className="w-[18px] h-[18px]" />
                            </a>
                        </div>
                    </div>

                    <nav className="md:col-span-3" aria-label="Categorías">
                        <h2 className="eyebrow text-[11px] text-primary-dark mb-5">Comprar</h2>
                        <ul className="flex flex-col gap-1">
                            {NAV_CATEGORIES.map((c) => (
                                <li key={c.cat}>
                                    <Link href={categoryHref(c.cat)} className="inline-flex min-h-[36px] items-center text-[15px] text-ink/80 hover:text-primary transition-colors">{c.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="md:col-span-2">
                        <h2 className="eyebrow text-[11px] text-primary-dark mb-5">Ayuda</h2>
                        <ul className="flex flex-col gap-1 text-[15px] text-ink/80">
                            <li><a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[36px] items-center hover:text-primary">Cómo comprar</a></li>
                            <li><a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[36px] items-center hover:text-primary">Envíos</a></li>
                            <li><a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[36px] items-center hover:text-primary">Cambios</a></li>
                            <li><Link href="/checkout" className="inline-flex min-h-[36px] items-center hover:text-primary">Mi carrito</Link></li>
                        </ul>
                    </div>

                    <div className="col-span-2 md:col-span-3">
                        <h2 className="eyebrow text-[11px] text-primary-dark mb-5">Visitanos</h2>
                        <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="flex gap-3 text-[15px] text-ink/80 hover:text-primary">
                            <IconPin className="w-5 h-5 shrink-0 mt-0.5" />
                            <span>{ADDRESS}<span className="block text-sm text-muted mt-1 underline underline-offset-4">Cómo llegar</span></span>
                        </a>
                        <p className="mt-6 eyebrow text-[10.5px] text-primary-dark mb-3">Medios de pago</p>
                        <p className="text-sm text-ink/80 leading-relaxed">Mercado Pago · Transferencia · Billeteras virtuales · Efectivo en el local</p>
                    </div>
                </div>

                <div className="mt-14 pt-6 border-t border-primary-dark/10 flex flex-col md:flex-row justify-between gap-2 text-xs text-muted">
                    <span>© {new Date().getFullYear()} Vitö Store. Todos los derechos reservados.</span>
                    <span>Hecho en Corrientes, Argentina</span>
                </div>
            </div>
        </footer>
    );
}
